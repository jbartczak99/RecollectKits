// Per-channel invite-code batch generator (closed beta, June 26).
//
// Usage:
//   node scripts/generate-invite-codes.mjs --channel discord --count 10
//   node scripts/generate-invite-codes.mjs --channel waitlist --count 25 --max-uses 1 --expires 2026-07-31 --prefix RCK
//
// Writes database/data/invite_codes_<channel>_<yyyymmdd>.sql (paste via SQL
// editor — data insert, allowed under the schema moratorium) and a matching
// .csv next to it for distribution tracking.

import { randomInt } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// No 0/O/1/I/L — codes get read aloud and retyped from DMs.
export const SAFE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'

function randomBlock(length) {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += SAFE_ALPHABET[randomInt(SAFE_ALPHABET.length)]
  }
  return out
}

export function generateCode(prefix = 'RCK') {
  return `${prefix.toUpperCase()}-${randomBlock(4)}-${randomBlock(4)}`
}

export function generateBatch({ channel, count, maxUses = 1, expiresAt = null, prefix = 'RCK' }) {
  if (!channel || typeof channel !== 'string') {
    throw new Error('channel is required')
  }
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('count must be a positive integer')
  }

  const codes = new Set()
  while (codes.size < count) {
    codes.add(generateCode(prefix))
  }

  return [...codes].map((code) => ({
    code,
    channel,
    max_uses: maxUses,
    expires_at: expiresAt,
  }))
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL'
  return `'${String(value).replace(/'/g, "''")}'`
}

export function buildInsertSql(batch) {
  const rows = batch
    .map(
      (r) =>
        `  (${sqlLiteral(r.code)}, ${sqlLiteral(r.channel)}, ${r.max_uses}, ${sqlLiteral(r.expires_at)})`
    )
    .join(',\n')
  return `INSERT INTO invite_codes (code, channel, max_uses, expires_at) VALUES\n${rows};\n`
}

export function buildCsv(batch) {
  const header = 'code,channel,max_uses,expires_at'
  const rows = batch.map((r) => `${r.code},${r.channel},${r.max_uses},${r.expires_at ?? ''}`)
  return [header, ...rows].join('\n') + '\n'
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--channel': args.channel = argv[++i]; break
      case '--count': args.count = parseInt(argv[++i], 10); break
      case '--max-uses': args.maxUses = parseInt(argv[++i], 10); break
      case '--expires': args.expiresAt = argv[++i]; break
      case '--prefix': args.prefix = argv[++i]; break
      default: throw new Error(`Unknown argument: ${argv[i]}`)
    }
  }
  return args
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  const args = parseArgs(process.argv.slice(2))
  const batch = generateBatch(args)

  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const safeChannel = args.channel.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
  const outDir = join(repoRoot, 'database', 'data')
  mkdirSync(outDir, { recursive: true })

  const sqlPath = join(outDir, `invite_codes_${safeChannel}_${stamp}.sql`)
  const csvPath = join(outDir, `invite_codes_${safeChannel}_${stamp}.csv`)
  writeFileSync(sqlPath, buildInsertSql(batch))
  writeFileSync(csvPath, buildCsv(batch))

  console.log(`Generated ${batch.length} codes for channel "${args.channel}"`)
  console.log(`  SQL: ${sqlPath}`)
  console.log(`  CSV: ${csvPath}`)
}
