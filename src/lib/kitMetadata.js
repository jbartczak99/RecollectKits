// Shared kit-metadata vocabulary (condition scale + provenance flags) so the
// add/edit modals and the collection display stay consistent.

export const CONDITION_OPTIONS = [
  { value: 'bnwt', label: 'New with tags (BNWT)' },
  { value: 'new_no_tags', label: 'New without tags' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'worn', label: 'Worn / Played' },
]

export const PROVENANCE_FLAGS = [
  { key: 'match_worn', label: 'Match-worn' },
  { key: 'signed', label: 'Signed' },
  { key: 'player_issue', label: 'Player-issue' },
]

export function conditionLabel(value) {
  return CONDITION_OPTIONS.find((o) => o.value === value)?.label || value || ''
}

// Parse a price input to a number or null. Rejects negatives and junk so a
// stray character never writes a bad numeric to the DB.
export function parsePrice(input) {
  if (input === null || input === undefined || String(input).trim() === '') return null
  const cleaned = String(input).replace(/[^0-9.]/g, '')
  if (cleaned === '') return null
  const n = Number(cleaned)
  return Number.isFinite(n) && n >= 0 ? n : null
}
