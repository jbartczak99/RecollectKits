import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// SYNCHRONOUSLY clear expired sessions from localStorage BEFORE creating the client.
// When a stale JWT is stored, the Supabase client attaches it to ALL requests
// (including public/anon ones), causing everything to fail. This must happen
// before createClient() reads the stored session.
try {
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
  const storageKey = `sb-${projectRef}-auth-token`
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    const parsed = JSON.parse(stored)
    if (parsed.access_token) {
      // Decode JWT payload to check expiry (no library needed - just base64)
      const payload = JSON.parse(atob(parsed.access_token.split('.')[1]))
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        console.warn('Expired auth token found in localStorage, clearing before client init')
        localStorage.removeItem(storageKey)
      }
    }
  }
} catch (e) {
  // If anything goes wrong parsing, just continue - the client will handle it
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})