/**
 * Convert a country code (ISO 3166-1 alpha-2 or common sport abbreviations)
 * to its emoji flag. Falls back to the code text if no match.
 */

// Sport abbreviation → ISO alpha-2 mapping for common codes used in football
const SPORT_TO_ISO = {
  ENG: 'GB-ENG', WAL: 'GB-WLS', SCO: 'GB-SCT', NIR: 'GB-NIR',
  RSA: 'ZA', KOR: 'KR', CRC: 'CR', CRO: 'HR', NED: 'NL',
  GER: 'DE', SUI: 'CH', POR: 'PT', GRE: 'GR', DEN: 'DK',
  NOR: 'NO', SWE: 'SE', AUT: 'AT', CZE: 'CZ', SVK: 'SK',
  SRB: 'RS', BIH: 'BA', MNE: 'ME', MKD: 'MK', KOS: 'XK',
  ALG: 'DZ', ANG: 'AO', BUR: 'BF', CGO: 'CG', CIV: 'CI',
  CMR: 'CM', COD: 'CD', CPV: 'CV', EQG: 'GQ', GAM: 'GM',
  GUI: 'GN', MAD: 'MG', MLI: 'ML', MOZ: 'MZ', NGA: 'NG',
  NIG: 'NE', RSA: 'ZA', SEN: 'SN', SLE: 'SL', TOG: 'TG',
  TUN: 'TN', ZAM: 'ZM', ZIM: 'ZW', GHA: 'GH',
  ARG: 'AR', BOL: 'BO', BRA: 'BR', CHI: 'CL', COL: 'CO',
  ECU: 'EC', PAR: 'PY', PER: 'PE', URU: 'UY', VEN: 'VE',
  HON: 'HN', MEX: 'MX', USA: 'US', CAN: 'CA', JAM: 'JM',
  TRI: 'TT', HAI: 'HT', PAN: 'PA', SLV: 'SV', GUA: 'GT',
  CHN: 'CN', JPN: 'JP', AUS: 'AU', NZL: 'NZ', IND: 'IN',
  IRN: 'IR', IRQ: 'IQ', KSA: 'SA', UAE: 'AE', OMA: 'OM',
  QAT: 'QA', BHR: 'BH', UZB: 'UZ', PHI: 'PH', VIE: 'VN',
  THA: 'TH', MAS: 'MY', SIN: 'SG', IDN: 'ID',
  SVN: 'SI', BUL: 'BG', ROU: 'RO', HUN: 'HU', POL: 'PL',
  FIN: 'FI', ISL: 'IS', IRL: 'IE', LUX: 'LU', BEL: 'BE',
  ESP: 'ES', FRA: 'FR', ITA: 'IT', TUR: 'TR', RUS: 'RU',
  UKR: 'UA', GEO: 'GE', ARM: 'AM', AZE: 'AZ', CYP: 'CY',
  MLT: 'MT', ALB: 'AL', EST: 'EE', LAT: 'LV', LTU: 'LT',
}

// Subdivision flags (England, Wales, Scotland, N. Ireland) using tag sequences
const SUBDIVISION_FLAGS = {
  'GB-ENG': '\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F', // 🏴󠁧󠁢󠁥󠁮󠁧󠁿
  'GB-WLS': '\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73\uDB40\uDC7F', // 🏴󠁧󠁢󠁷󠁬󠁳󠁿
  'GB-SCT': '\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74\uDB40\uDC7F', // 🏴󠁧󠁢󠁳󠁣󠁴󠁿
  'GB-NIR': '🇬🇧', // No dedicated emoji, use GB
}

/**
 * Convert 2-letter ISO code to emoji flag using regional indicator symbols.
 */
function isoToEmoji(iso) {
  if (!iso || iso.length !== 2) return null
  const upper = iso.toUpperCase()
  const cp1 = 0x1F1E6 + (upper.charCodeAt(0) - 65)
  const cp2 = 0x1F1E6 + (upper.charCodeAt(1) - 65)
  return String.fromCodePoint(cp1, cp2)
}

/**
 * Get flag emoji for a country code (sport abbreviation or ISO).
 * Returns the emoji string, or null if not resolvable.
 */
export function getFlag(code) {
  if (!code) return null
  const upper = code.toUpperCase().trim()

  // Check subdivision flags first
  const mapped = SPORT_TO_ISO[upper]
  if (mapped && SUBDIVISION_FLAGS[mapped]) return SUBDIVISION_FLAGS[mapped]

  // Map sport code → ISO
  const iso = SPORT_TO_ISO[upper] || upper

  // If it's a subdivision code we don't have, skip
  if (iso.includes('-')) return null

  // Convert 2-letter ISO to emoji
  if (iso.length === 2) return isoToEmoji(iso)

  return null
}
