import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})

// Eagerly validate the stored session on module load.
// If the token is stale/expired and can't be refreshed, clear it immediately
// so that subsequent requests don't fail due to an invalid Authorization header.
supabase.auth.getUser().then(({ error }) => {
  if (error) {
    console.warn('Stale auth token detected on startup, clearing session')
    supabase.auth.signOut({ scope: 'local' }).catch(() => {
      // Fallback: manually remove the storage key
      try {
        const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
        localStorage.removeItem(`sb-${projectRef}-auth-token`)
      } catch {}
    })
  }
})