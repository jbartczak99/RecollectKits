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
        console.log('Auth state change:', event, session?.user?.email)
        setUser(session?.user ?? null)
        if (session?.user) {
          await getProfile(session.user.id)
          if (event === 'SIGNED_UP') {
            console.log('SIGNED_UP event detected, calling createProfile')
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
      console.log('Getting profile for user:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('Profile query result:', { data, error })

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error (not PGRST116):', error)
        throw error
      }

      if (!data) {
        console.log('No profile found, creating one for existing user')
        // If no profile exists, create one for existing user
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          return await createProfile(userData.user)
        }
      }

      console.log('Profile found and set:', data)
      setProfile(data)
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  const createProfile = async (user) => {
    try {
      console.log('Creating profile for user:', user)
      const profileData = {
        id: user.id,
        username: user.user_metadata?.username || user.email.split('@')[0],
        full_name: user.user_metadata?.full_name || '',
        avatar_url: user.user_metadata?.avatar_url || null,
        approval_status: 'pending',
        requested_at: new Date().toISOString()
      }
      console.log('Profile data to insert:', profileData)

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single()

      if (error) {
        console.error('Database error inserting profile:', error)
        throw error
      }

      console.log('Profile created successfully:', data)
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

      // If signup successful and user exists, create profile immediately
      if (!error && data.user) {
        console.log('Signup successful, creating profile immediately for:', data.user.email)
        await createProfile(data.user)
      }

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

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
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

      console.log('Approving account:', { userId, adminId: user.id, notes })

      // First check if user exists
      const { data: userCheck } = await supabase
        .from('profiles')
        .select('id, username, approval_status')
        .eq('id', userId)
        .single()

      console.log('User before approval:', userCheck)

      // BYPASS THE DATABASE FUNCTION - do direct UPDATE instead
      const { data, error } = await supabase
        .from('profiles')
        .update({
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          admin_notes: notes
        })
        .eq('id', userId)
        .select()

      console.log('Direct update result:', { data, error })

      // Check if user status actually changed
      const { data: userAfter } = await supabase
        .from('profiles')
        .select('id, username, approval_status, approved_at, admin_notes')
        .eq('id', userId)
        .single()

      console.log('User after approval:', userAfter)

      if (error) {
        console.error('Database error approving account:', error)
        throw error
      }

      console.log('Account approved successfully')
      return { error: null }
    } catch (error) {
      console.error('Error in approveAccount:', error)
      return { error }
    }
  }

  const rejectAccount = async (userId, notes = null) => {
    try {
      if (!user || !profile?.is_admin) {
        throw new Error('Admin access required')
      }

      // First, call the database function to delete from profiles and log rejection
      const { error: dbError } = await supabase.rpc('reject_user_account', {
        user_id: userId,
        admin_id: user.id,
        notes
      })

      if (dbError) throw dbError

      // Then delete the user from Supabase Auth
      // Note: This requires the service role key, not the anon key
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) {
        console.error('Error deleting user from auth:', authError)
        // Don't throw here since the profile is already deleted
        // The user account might still exist in auth but won't be able to access anything
      }

      return { error: null }
    } catch (error) {
      console.error('Error rejecting account:', error)
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