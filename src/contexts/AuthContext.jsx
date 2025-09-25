import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        await getProfile(session.user.id)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await getProfile(session.user.id)
          if (event === 'SIGNED_UP') {
            await createProfile(session.user)
          }
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const getProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (!data) {
        // If no profile exists, create one for existing user
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          return await createProfile(userData.user)
        }
      }

      setProfile(data)
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const createProfile = async (user) => {
    try {
      const profileData = {
        id: user.id,
        username: user.user_metadata?.username || user.email.split('@')[0],
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || null,
        approval_status: 'pending',
        requested_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return data
    } catch (error) {
      console.error('Error creating profile:', error)
      return null
    }
  }

  const signUp = async ({ email, password, username, fullName }) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          }
        }
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { data: null, error }
      }

      // Check user's approval status after successful auth
      if (data.user) {
        const profileData = await getProfile(data.user.id)

        // If profile exists and user is not admin, check approval status
        if (profileData && !profileData.is_admin) {
          if (profileData.approval_status === 'pending') {
            // Sign them out immediately and return custom error
            await supabase.auth.signOut()
            return {
              data: null,
              error: {
                message: 'Your account is still under review. Please allow 24-48 hours for approval. You will receive an email notification once your account is approved.'
              }
            }
          } else if (profileData.approval_status === 'rejected') {
            // Sign them out immediately and return custom error
            await supabase.auth.signOut()
            return {
              data: null,
              error: {
                message: 'Your account request was not approved. Please contact support if you believe this is an error.'
              }
            }
          }
        }
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        setUser(null)
        setProfile(null)
      }
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const getPendingAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_accounts')
        .select('*')

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const approveAccount = async (userId, notes = null) => {
    try {
      if (!user || !profile?.is_admin) {
        throw new Error('Admin access required')
      }

      const { error } = await supabase.rpc('approve_user_account', {
        user_id: userId,
        admin_id: user.id,
        notes
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const rejectAccount = async (userId, notes = null) => {
    try {
      if (!user || !profile?.is_admin) {
        throw new Error('Admin access required')
      }

      const { error } = await supabase.rpc('reject_user_account', {
        user_id: userId,
        admin_id: user.id,
        notes
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    getProfile,
    getPendingAccounts,
    approveAccount,
    rejectAccount
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}