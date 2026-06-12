// Invite-code helpers for the closed beta (see Docs/BLITZ_PLAN.md).
// Server-side enforcement lives in the auth-signup trigger
// (database/migrations/add_invite_codes.sql); these helpers exist for
// pre-signup UX so users get a clear verdict before submitting the form.

const SAFE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
const CODE_FORMAT = new RegExp(`^[A-Z]+-[${SAFE_ALPHABET}]{4}-[${SAFE_ALPHABET}]{4}$`)

export function normalizeInviteCode(raw) {
  if (!raw) return ''
  return raw.toUpperCase().replace(/\s+/g, '')
}

export function isValidCodeFormat(code) {
  return CODE_FORMAT.test(code)
}

export async function validateInviteCode(supabase, rawCode) {
  const code = normalizeInviteCode(rawCode)
  if (!code) return { valid: false, reason: 'missing' }

  const { data, error } = await supabase.rpc('validate_invite_code', { p_code: code })
  if (error || !data) return { valid: false, reason: 'error' }
  return { valid: data.valid === true, reason: data.reason ?? null }
}

// Fails open: if the flag can't be read, signups proceed without a code.
// The signup trigger is the real gate; this only controls form UX.
export async function isInviteCodeRequired(supabase) {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'require_invite_code')
      .maybeSingle()
    if (error || !data) return false
    return data.value === true
  } catch {
    return false
  }
}
