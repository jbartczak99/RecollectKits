import { useEffect, useMemo, useState } from 'react'
import { CheckCircleIcon, LinkIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase'

const normalize = (s) => String(s || '').trim().toLowerCase()

function matchClubs(teamName, clubs) {
  const needle = normalize(teamName)
  if (!needle) return []
  return clubs.filter((c) => {
    if (normalize(c.name) === needle) return true
    if (normalize(c.short_name) === needle) return true
    return (c.aliases || []).some((a) => normalize(a) === needle)
  })
}

export default function BackfillUnlinkedKits({ clubs, onLinked }) {
  const [unlinked, setUnlinked] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [pickerState, setPickerState] = useState({}) // teamName -> selected club id
  const [linkingName, setLinkingName] = useState(null)
  const [error, setError] = useState('')

  const fetchUnlinked = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: queryError } = await supabase
        .from('public_jerseys')
        .select('team_name')
        .is('club_id', null)
        .eq('kit_type', 'club')
        .not('team_name', 'is', null)

      if (queryError) throw queryError

      const counts = {}
      ;(data || []).forEach((row) => {
        if (row.team_name) {
          counts[row.team_name] = (counts[row.team_name] || 0) + 1
        }
      })

      const sorted = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

      setUnlinked(sorted)
    } catch (err) {
      console.error('[Backfill] fetch failed:', err)
      setError(err.message || 'Failed to load unlinked kits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnlinked()
  }, [])

  const rows = useMemo(
    () =>
      unlinked.map((item) => ({
        ...item,
        matches: matchClubs(item.name, clubs),
      })),
    [unlinked, clubs]
  )

  const confidentCount = useMemo(
    () => rows.filter((r) => r.matches.length === 1).length,
    [rows]
  )

  const linkOne = async (teamName, clubId) => {
    if (!clubId) return
    setLinkingName(teamName)
    try {
      const { error: updateError } = await supabase
        .from('public_jerseys')
        .update({ club_id: clubId })
        .eq('team_name', teamName)
        .is('club_id', null)
      if (updateError) throw updateError
      await fetchUnlinked()
      if (onLinked) onLinked()
    } catch (err) {
      console.error('[Backfill] link failed:', err)
      setError(err.message || 'Failed to link')
    } finally {
      setLinkingName(null)
    }
  }

  const linkAllConfident = async () => {
    const confident = rows.filter((r) => r.matches.length === 1)
    if (confident.length === 0) return
    setBusy(true)
    setError('')
    try {
      // Sequential to avoid hammering the database; small N expected.
      for (const row of confident) {
        const { error: updateError } = await supabase
          .from('public_jerseys')
          .update({ club_id: row.matches[0].id })
          .eq('team_name', row.name)
          .is('club_id', null)
        if (updateError) throw updateError
      }
      await fetchUnlinked()
      if (onLinked) onLinked()
    } catch (err) {
      console.error('[Backfill] bulk link failed:', err)
      setError(err.message || 'Bulk link failed partway through')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <section className="backfill">
        <div className="backfill__header">
          <h2 className="backfill__title">Unlinked club kits</h2>
        </div>
        <div className="admin-clubs__loading">
          <div className="admin-clubs__spinner" />
          Scanning kits…
        </div>
      </section>
    )
  }

  if (unlinked.length === 0) {
    return (
      <section className="backfill backfill--clean">
        <div className="backfill__clean">
          <CheckCircleIcon className="backfill__clean-icon" />
          <div>
            <h2 className="backfill__title">All club kits linked</h2>
            <p className="backfill__subtitle">
              Every kit with `kit_type='club'` is associated with a canonical club. New
              submissions will appear here if their team name doesn't match any existing club.
            </p>
          </div>
          <button
            type="button"
            className="club-btn club-btn--secondary backfill__rescan"
            onClick={fetchUnlinked}
            title="Rescan for unlinked kits"
          >
            <ArrowPathIcon style={{ width: '1rem', height: '1rem' }} />
            Rescan
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="backfill">
      <div className="backfill__header">
        <div>
          <h2 className="backfill__title">Unlinked club kits</h2>
          <p className="backfill__subtitle">
            {unlinked.length} distinct team {unlinked.length === 1 ? 'name' : 'names'} from existing
            submissions{' '}
            {confidentCount > 0 && (
              <>
                · <strong>{confidentCount}</strong> can be auto-matched
              </>
            )}
          </p>
        </div>
        <div className="backfill__actions">
          <button
            type="button"
            className="club-btn club-btn--secondary"
            onClick={fetchUnlinked}
            disabled={busy}
          >
            <ArrowPathIcon style={{ width: '1rem', height: '1rem' }} />
            Rescan
          </button>
          {confidentCount > 0 && (
            <button
              type="button"
              className="club-btn club-btn--primary"
              onClick={linkAllConfident}
              disabled={busy}
            >
              {busy
                ? 'Linking…'
                : `Link ${confidentCount} confident match${confidentCount === 1 ? '' : 'es'}`}
            </button>
          )}
        </div>
      </div>

      {error && <div className="club-modal__error">{error}</div>}

      <div className="backfill__list">
        {rows.map((row) => {
          const isLinking = linkingName === row.name
          const hasOne = row.matches.length === 1
          const hasMany = row.matches.length > 1
          const picked = pickerState[row.name] || ''
          const pickClubFromAll = clubs.find((c) => c.id === picked)

          return (
            <div key={row.name} className="backfill-row">
              <div className="backfill-row__primary">
                <span className="backfill-row__name">"{row.name}"</span>
                <span className="backfill-row__count">
                  {row.count} {row.count === 1 ? 'kit' : 'kits'}
                </span>
              </div>

              <div className="backfill-row__action">
                {hasOne ? (
                  <>
                    <span className="backfill-row__suggest">
                      Matches <strong>{row.matches[0].name}</strong>
                    </span>
                    <button
                      type="button"
                      className="club-btn club-btn--primary"
                      onClick={() => linkOne(row.name, row.matches[0].id)}
                      disabled={isLinking || busy}
                    >
                      <LinkIcon style={{ width: '1rem', height: '1rem' }} />
                      {isLinking ? 'Linking…' : 'Link'}
                    </button>
                  </>
                ) : (
                  <>
                    <select
                      className="backfill-row__select"
                      value={picked}
                      onChange={(e) =>
                        setPickerState((prev) => ({ ...prev, [row.name]: e.target.value }))
                      }
                      disabled={isLinking || busy}
                    >
                      <option value="">
                        {hasMany ? `${row.matches.length} possible matches…` : 'Pick a club…'}
                      </option>
                      {hasMany && (
                        <optgroup label="Matches">
                          {row.matches.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label={hasMany ? 'All clubs' : 'All clubs'}>
                        {clubs
                          .filter((c) => !hasMany || !row.matches.some((m) => m.id === c.id))
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                    <button
                      type="button"
                      className="club-btn club-btn--primary"
                      onClick={() => linkOne(row.name, picked)}
                      disabled={!picked || isLinking || busy}
                    >
                      <LinkIcon style={{ width: '1rem', height: '1rem' }} />
                      {isLinking ? 'Linking…' : 'Link'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
