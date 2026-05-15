import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { notifyWelcome, checkAndAwardFirst100Badge } from '../lib/notifications'

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
    // Get initial session and verify it's still valid
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          // Verify the session is actually valid by checking with the server
          const { data: { user: verifiedUser }, error } = await supabase.auth.getUser()

          if (error || !verifiedUser) {
            // Session is stale/expired and couldn't be refreshed - force local cleanup
            console.warn('Stale session detected, forcing local sign out')
            try {
              await supabase.auth.signOut({ scope: 'local' })
            } catch {
              const storageKey = `sb-${new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split('.')[0]}-auth-token`
              localStorage.removeItem(storageKey)
            }
            setUser(null)
            setProfile(null)
            setLoading(false)
            return
          }

          setUser(verifiedUser)
          await getProfile(verifiedUser.id)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('Auth initialization error, clearing session:', err)
        try {
          await supabase.auth.signOut({ scope: 'local' })
        } catch {
          // last resort
        }
        setUser(null)
        setProfile(null)
      }

      setLoading(false)
    }

    // Race auth init against a timeout so the app never hangs on a blank page.
    // If Supabase is unreachable (blocked by extension, network issue, etc.),
    // we still render the page after 5 seconds.
    const timeout = setTimeout(() => {
      setLoading((current) => {
        if (current) {
          console.warn('Auth initialization timed out after 5s, proceeding without auth')
          setUser(null)
          setProfile(null)
        }
        return false
      })
    }, 5000)

    getInitialSession().finally(() => clearTimeout(timeout))

    // Listen for auth changes.
    //
    // IMPORTANT: never `await` inside this callback. Supabase JS holds an
    // internal auth lock while listeners run, and any database query waiting
    // on auth state will deadlock until the listener returns. Concurrent
    // requests (e.g. an admin form submission firing during a tab-focus
    // SIGNED_IN event) silently stall until the 10s fetch timeout fires.
    // Defer async work with setTimeout(0) so the callback returns immediately.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        setUser(session?.user ?? null)
        if (session?.user) {
          setTimeout(async () => {
            await getProfile(session.user.id)
            if (event === 'SIGNED_UP') {
              console.log('SIGNED_UP event detected, calling createProfile')
              await createProfile(session.user)
            }
            setLoading(false)
          }, 0)
        } else {
          setProfile(null)
          setLoading(false)
        }
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
        country: user.user_metadata?.country || null,
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

  const signUp = async ({ email, password, username, fullName, country }) => {
    try {
      // Note: Don't set global loading here - the form manages its own loading state
      // Setting global loading causes AuthLayout to unmount the form and lose state
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
            country,
          }
        }
      })

      // If signup successful and user exists, create profile immediately
      if (!error && data.user) {
        console.log('Signup successful, creating profile immediately for:', data.user.email)
        await createProfile(data.user)
        // Send welcome notification and check for First 100 badge
        notifyWelcome(data.user.id)
        checkAndAwardFirst100Badge(data.user.id)
      }

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      // Note: Don't set global loading here - the form manages its own loading state
      // Setting global loading causes AuthLayout to unmount the form and lose state
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
      const { data, error } = await supabase.rpc('get_pending_accounts')

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const approveAccount = async (userId, notes = null) => {
    try {
      // Server-side checks (auth.uid() + is_admin) live inside the RPC so a
      // non-admin can't bypass this guard by calling supabase directly.
      const { error } = await supabase.rpc('approve_user_account', {
        user_id: userId,
        notes,
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error in approveAccount:', error)
      return { error }
    }
  }

  const rejectAccount = async (userId, notes = null) => {
    try {
      // RPC deletes from profiles and logs to user_rejections. It does NOT
      // delete the auth.users row — that requires the service-role key and
      // must be handled by a server-side Edge Function. The user is locked
      // out anyway because the profile (and the gates that depend on it)
      // are gone.
      const { error } = await supabase.rpc('reject_user_account', {
        user_id: userId,
        notes,
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error rejecting account:', error)
      return { error }
    }
  }

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const updatePassword = async (newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })
      return { data, error }
    } catch (error) {
      return { data: null, error }
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
    rejectAccount,
    resetPassword,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}