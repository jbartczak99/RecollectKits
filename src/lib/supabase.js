import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Clear stored auth session before client init.
// The Supabase client attaches stored tokens to ALL requests (even public/anon ones).
// If a token is invalid for any reason, every request fails — not just authenticated ones.
// We use a version flag so this only runs once per version bump, not on every load.
const AUTH_CLEAR_VERSION = '2'
try {
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
  const storageKey = `sb-${projectRef}-auth-token`

  // One-time forced clear when version changes (fixes stale tokens from any cause)
  if (localStorage.getItem('rk_auth_v') !== AUTH_CLEAR_VERSION) {
    localStorage.removeItem(storageKey)
    localStorage.setItem('rk_auth_v', AUTH_CLEAR_VERSION)
    console.warn('Auth session cleared (version update)')
  } else {
    // On subsequent loads, still check for expired JWTs
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.access_token) {
        const payload = JSON.parse(atob(parsed.access_token.split('.')[1]))
        if (payload.exp && Date.now() / 1000 > payload.exp) {
          console.warn('Expired auth token found, clearing before client init')
          localStorage.removeItem(storageKey)
        }
      }
    }
  }
} catch (e) {
  // If anything goes wrong, just continue
}

// Custom fetch that aborts after 10 seconds so requests never hang forever.
// If something (browser extension, network issue) blocks Supabase requests,
// the app will show an error state instead of a blank page.
const fetchWithTimeout = (url, options = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  // Merge with any existing signal
  const existingSignal = options.signal
  if (existingSignal) {
    existingSignal.addEventListener('abort', () => controller.abort())
  }

  return fetch(url, { ...options, signal: controller.signal })
    .catch((err) => {
      if (err.name === 'AbortError') {
        console.error('Supabase request timed out:', url)
        throw new Error('Request timed out - check if a browser extension is blocking connections to Supabase')
      }
      throw err
    })
    .finally(() => clearTimeout(timeoutId))
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: fetchWithTimeout
  }
})