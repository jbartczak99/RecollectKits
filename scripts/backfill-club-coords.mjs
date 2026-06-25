// Backfill clubs.latitude/longitude from Wikidata for clubs added without
// coordinates (e.g. via the in-app resolver before it fetched venue coords,
// or bulk-import clubs whose venue lacked P625). Reuses the app's resolver
// logic so coords match what the resolver now produces.
//
// Usage:  node scripts/backfill-club-coords.mjs Q41420 Q430107
// Writes paste-ready UPDATE SQL to database/data/backfill_club_coords_<date>.sql
// (gitignored). NOTHING touches the DB directly.

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchClubWikidata, mapToClubRecord } from '../src/utils/wikidata.js'

const qids = process.argv.slice(2)
if (qids.length === 0) {
  console.error('Pass one or more Wikidata QIDs, e.g. node scripts/backfill-club-coords.mjs Q41420')
  process.exit(1)
}

const updates = []
for (const qid of qids) {
  const { data, error } = await fetchClubWikidata(qid)
  if (error || !data) {
    console.warn(`[${qid}] fetch failed: ${error || 'no data'}`)
    continue
  }
  const rec = mapToClubRecord(data)
  if (rec.latitude == null || rec.longitude == null) {
    console.warn(`[${qid}] ${rec.name}: no coordinates on Wikidata — skipped`)
    continue
  }
  updates.push(
    `UPDATE clubs SET latitude = ${rec.latitude}, longitude = ${rec.longitude} WHERE wikidata_id = '${qid}' AND latitude IS NULL;`
  )
  console.log(`[${qid}] ${rec.name}: ${rec.latitude}, ${rec.longitude}`)
}

if (updates.length === 0) {
  console.log('No coordinate updates to write.')
} else {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
  const outDir = join(repoRoot, 'database', 'data')
  mkdirSync(outDir, { recursive: true })
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const path = join(outDir, `backfill_club_coords_${stamp}.sql`)
  writeFileSync(path, updates.join('\n') + '\n')
  console.log(`\nWrote ${updates.length} UPDATE(s): ${path}`)
}
