import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeftIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { supabase } from '../../lib/supabase'
import countries from '../../data/countries'
import BackfillUnlinkedKits from './BackfillUnlinkedKits'
import './AdminClubs.css'

const LEAGUE_OPTIONS = [
  'Premier League',
  'Championship',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Ligue 1',
  'MLS',
  'Eredivisie',
  'Liga Portugal',
  'Saudi Pro League',
  'NWSL',
  'USL Super League',
  'WSL',
  'Liga F',
  'Serie A Femminile',
  'Frauen-Bundesliga',
  'D1 Arkema',
  'A-League Women',
  'Other',
]

// UK home nations included alongside ISO countries so admins can be specific
// (e.g. Swansea = Wales). normalizeCountryName() in the dashboard folds them
// back onto United Kingdom for map shading.
const COUNTRY_OPTIONS = Array.from(
  new Set([...countries, 'England', 'Scotland', 'Wales', 'Northern Ireland'])
).sort((a, b) => a.localeCompare(b))

const EMPTY_FORM = {
  name: '',
  short_name: '',
  aliases: [],
  country: '',
  city: '',
  primary_league: '',
  founded_year: '',
  stadium_name: '',
  wikidata_id: '',
}

function ChipInput({ values, onChange, placeholder }) {
  const [input, setInput] = useState('')

  const addChip = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    if (values.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setInput('')
      return
    }
    onChange([...values, trimmed])
    setInput('')
  }

  const removeChip = (idx) => {
    onChange(values.filter((_, i) => i !== idx))
  }

  return (
    <div className="chip-input">
      {values.map((v, i) => (
        <span key={`${v}-${i}`} className="chip">
          {v}
          <button
            type="button"
            className="chip__remove"
            onClick={() => removeChip(i)}
            aria-label={`Remove ${v}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="chip-input__input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addChip()
          } else if (e.key === 'Backspace' && !input && values.length > 0) {
            removeChip(values.length - 1)
          }
        }}
        onBlur={addChip}
        placeholder={placeholder}
      />
    </div>
  )
}

export default function AdminClubs() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminChecked, setAdminChecked] = useState(false)

  const [clubs, setClubs] = useState([])
  const [kitCountByClub, setKitCountByClub] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingClub, setEditingClub] = useState(null) // null = new
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setIsAdmin(false)
        setAdminChecked(true)
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()
      setIsAdmin(data?.is_admin === true)
      setAdminChecked(true)
    }
    check()
  }, [user])

  useEffect(() => {
    if (isAdmin) fetchClubs()
  }, [isAdmin])

  const fetchClubs = async () => {
    setLoading(true)
    const [{ data: clubsData, error: clubsError }, { data: countsData }] = await Promise.all([
      supabase
        .from('clubs')
        .select('*')
        .order('name', { ascending: true }),
      supabase
        .from('public_jerseys')
        .select('club_id')
        .not('club_id', 'is', null),
    ])

    if (clubsError) {
      console.error('Error fetching clubs:', clubsError)
      setLoading(false)
      return
    }

    const counts = {}
    ;(countsData || []).forEach((row) => {
      if (row.club_id) counts[row.club_id] = (counts[row.club_id] || 0) + 1
    })

    setClubs(clubsData || [])
    setKitCountByClub(counts)
    setLoading(false)
  }

  const filteredClubs = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return clubs
    return clubs.filter((c) => {
      const haystack = [
        c.name,
        c.short_name,
        c.country,
        c.city,
        c.primary_league,
        ...(c.aliases || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [clubs, search])

  const openCreate = () => {
    setEditingClub(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setModalOpen(true)
  }

  const openEdit = (club) => {
    setEditingClub(club)
    setForm({
      name: club.name || '',
      short_name: club.short_name || '',
      aliases: club.aliases || [],
      country: club.country || '',
      city: club.city || '',
      primary_league: club.primary_league || '',
      founded_year: club.founded_year ? String(club.founded_year) : '',
      stadium_name: club.stadium_name || '',
      wikidata_id: club.wikidata_id || '',
    })
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditingClub(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError('')

    const trimmedName = form.name.trim()
    if (!trimmedName) {
      setFormError('Canonical name is required')
      return
    }
    if (!form.country) {
      setFormError('Country is required')
      return
    }

    const yearNum = form.founded_year ? Number(form.founded_year) : null
    if (yearNum !== null && (Number.isNaN(yearNum) || yearNum < 1800 || yearNum > 2100)) {
      setFormError('Founded year looks invalid')
      return
    }

    const payload = {
      name: trimmedName,
      short_name: form.short_name.trim() || null,
      aliases: form.aliases.map((a) => a.trim()).filter(Boolean),
      country: form.country,
      city: form.city.trim() || null,
      primary_league: form.primary_league || null,
      founded_year: yearNum,
      stadium_name: form.stadium_name.trim() || null,
      wikidata_id: form.wikidata_id.trim() || null,
    }

    setSaving(true)
    try {
      if (editingClub) {
        const { error } = await supabase
          .from('clubs')
          .update(payload)
          .eq('id', editingClub.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('clubs')
          .insert({ ...payload, source: 'manual' })
        if (error) throw error
      }
      await fetchClubs()
      setModalOpen(false)
      setEditingClub(null)
      setForm(EMPTY_FORM)
    } catch (err) {
      console.error('[AdminClubs] save failed:', err)
      const message = err?.message || err?.error_description || String(err) || 'Failed to save club'
      setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('clubs').delete().eq('id', deleteTarget.id)
      if (error) throw error
      await fetchClubs()
      setDeleteTarget(null)
    } catch (err) {
      alert('Failed to delete club: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  if (!adminChecked) {
    return (
      <div className="admin-clubs__loading">
        <div className="admin-clubs__spinner" />
        Checking access…
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="admin-clubs__empty">
        <h2>Access denied</h2>
        <p>Admin privileges required.</p>
      </div>
    )
  }

  return (
    <div className="admin-clubs">
      <div className="admin-clubs__header">
        <button
          type="button"
          className="admin-clubs__back"
          onClick={() => navigate('/admin')}
          aria-label="Back to admin"
        >
          <ChevronLeftIcon className="admin-clubs__back-icon" />
        </button>
        <div className="admin-clubs__heading">
          <h1 className="admin-clubs__title">Clubs</h1>
          <p className="admin-clubs__subtitle">
            {clubs.length} {clubs.length === 1 ? 'club' : 'clubs'} · canonical source of truth for club kits
          </p>
        </div>
        <button type="button" className="admin-clubs__add" onClick={openCreate}>
          <PlusIcon className="admin-clubs__add-icon" />
          Add club
        </button>
      </div>

      <div className="admin-clubs__search">
        <MagnifyingGlassIcon className="admin-clubs__search-icon" />
        <input
          className="admin-clubs__search-input"
          placeholder="Search by name, alias, country, city, or league…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="admin-clubs__loading">
          <div className="admin-clubs__spinner" />
          Loading clubs…
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="admin-clubs__empty">
          {clubs.length === 0
            ? 'No clubs in the database yet. Add your first one with the button above.'
            : 'No clubs match your search.'}
        </div>
      ) : (
        <div className="admin-clubs__list">
          {filteredClubs.map((club) => {
            const count = kitCountByClub[club.id] || 0
            return (
              <div key={club.id} className="club-row">
                <div className="club-row__main">
                  <div className="club-row__name-row">
                    <h3 className="club-row__name">{club.name}</h3>
                    {club.short_name && club.short_name !== club.name && (
                      <span className="club-row__alias">{club.short_name}</span>
                    )}
                  </div>
                  <p className="club-row__meta">
                    {[club.country, club.city, club.primary_league, club.founded_year]
                      .filter(Boolean)
                      .join(' · ')}
                    {club.stadium_name ? ` · ${club.stadium_name}` : ''}
                  </p>
                  {club.aliases && club.aliases.length > 0 && (
                    <div className="club-row__aliases">
                      {club.aliases.map((alias) => (
                        <span key={alias} className="club-row__alias">
                          {alias}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="club-row__count">
                  {count} {count === 1 ? 'kit' : 'kits'}
                </span>
                <div className="club-row__actions">
                  <button
                    type="button"
                    className="club-row__action"
                    onClick={() => openEdit(club)}
                    aria-label={`Edit ${club.name}`}
                  >
                    <PencilSquareIcon className="club-row__action-icon" />
                  </button>
                  <button
                    type="button"
                    className="club-row__action club-row__action--danger"
                    onClick={() => setDeleteTarget(club)}
                    aria-label={`Delete ${club.name}`}
                  >
                    <TrashIcon className="club-row__action-icon" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && clubs.length > 0 && (
        <BackfillUnlinkedKits clubs={clubs} onLinked={fetchClubs} />
      )}

      {modalOpen && (
        <div className="club-modal__backdrop" onClick={closeModal}>
          <div className="club-modal" onClick={(e) => e.stopPropagation()}>
            <div className="club-modal__header">
              <h2 className="club-modal__title">
                {editingClub ? `Edit ${editingClub.name}` : 'Add a club'}
              </h2>
              <button
                type="button"
                className="club-modal__close"
                onClick={closeModal}
                aria-label="Close"
              >
                <XMarkIcon className="club-modal__close-icon" />
              </button>
            </div>
            <form onSubmit={handleSave} noValidate>
              <div className="club-modal__body">
                {formError && (
                  <div className="club-modal__error" role="alert">{formError}</div>
                )}
                <div className="club-modal__grid">
                  <div className="club-field">
                    <label className="club-field__label club-field__label--required" htmlFor="club-name">
                      Canonical name
                    </label>
                    <input
                      id="club-name"
                      className="club-field__input"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Swansea City AFC"
                      required
                    />
                    <span className="club-field__hint">
                      This is the only display name. Variants go in Aliases.
                    </span>
                  </div>

                  <div className="club-modal__grid club-modal__grid--two">
                    <div className="club-field">
                      <label className="club-field__label" htmlFor="club-short">
                        Short name
                      </label>
                      <input
                        id="club-short"
                        className="club-field__input"
                        value={form.short_name}
                        onChange={(e) => setForm({ ...form, short_name: e.target.value })}
                        placeholder="e.g. Swansea"
                      />
                    </div>

                    <div className="club-field">
                      <label className="club-field__label" htmlFor="club-wikidata">
                        Wikidata ID
                      </label>
                      <input
                        id="club-wikidata"
                        className="club-field__input"
                        value={form.wikidata_id}
                        onChange={(e) => setForm({ ...form, wikidata_id: e.target.value })}
                        placeholder="e.g. Q132590"
                      />
                    </div>
                  </div>

                  <div className="club-field">
                    <label className="club-field__label">Aliases</label>
                    <ChipInput
                      values={form.aliases}
                      onChange={(aliases) => setForm({ ...form, aliases })}
                      placeholder="Type an alias and press Enter…"
                    />
                    <span className="club-field__hint">
                      Match terms users might type ("Swansea", "Swansea City", "SCFC").
                    </span>
                  </div>

                  <div className="club-modal__grid club-modal__grid--two">
                    <div className="club-field">
                      <label className="club-field__label club-field__label--required" htmlFor="club-country">
                        Country
                      </label>
                      <select
                        id="club-country"
                        className="club-field__select"
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        required
                      >
                        <option value="">Select…</option>
                        {COUNTRY_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="club-field">
                      <label className="club-field__label" htmlFor="club-city">
                        City
                      </label>
                      <input
                        id="club-city"
                        className="club-field__input"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        placeholder="e.g. Swansea"
                      />
                    </div>
                  </div>

                  <div className="club-modal__grid club-modal__grid--two">
                    <div className="club-field">
                      <label className="club-field__label" htmlFor="club-league">
                        Primary league
                      </label>
                      <select
                        id="club-league"
                        className="club-field__select"
                        value={form.primary_league}
                        onChange={(e) => setForm({ ...form, primary_league: e.target.value })}
                      >
                        <option value="">None / Unknown</option>
                        {LEAGUE_OPTIONS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="club-field">
                      <label className="club-field__label" htmlFor="club-founded">
                        Founded year
                      </label>
                      <input
                        id="club-founded"
                        type="number"
                        min="1800"
                        max="2100"
                        className="club-field__input"
                        value={form.founded_year}
                        onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
                        placeholder="e.g. 1912"
                      />
                    </div>
                  </div>

                  <div className="club-field">
                    <label className="club-field__label" htmlFor="club-stadium">
                      Stadium name
                    </label>
                    <input
                      id="club-stadium"
                      className="club-field__input"
                      value={form.stadium_name}
                      onChange={(e) => setForm({ ...form, stadium_name: e.target.value })}
                      placeholder="e.g. Swansea.com Stadium"
                    />
                    <span className="club-field__hint">
                      Coordinates come later via Wikidata enrichment (Phase 2).
                    </span>
                  </div>
                </div>

              </div>

              <div className="club-modal__footer">
                <button
                  type="button"
                  className="club-btn club-btn--secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="club-btn club-btn--primary" disabled={saving}>
                  {saving ? 'Saving…' : editingClub ? 'Save changes' : 'Create club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="club-modal__backdrop" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="club-modal" onClick={(e) => e.stopPropagation()}>
            <div className="club-modal__body">
              <div className="delete-confirm">
                <div className="delete-confirm__icon">
                  <TrashIcon style={{ width: '1.5rem', height: '1.5rem' }} />
                </div>
                <h3 className="delete-confirm__title">Delete this club?</h3>
                <p className="delete-confirm__text">
                  <span className="delete-confirm__strong">{deleteTarget.name}</span>
                  {(kitCountByClub[deleteTarget.id] || 0) > 0
                    ? ` is linked to ${kitCountByClub[deleteTarget.id]} ${kitCountByClub[deleteTarget.id] === 1 ? 'kit' : 'kits'}. Those kits will keep their team_name but lose their club_id link.`
                    : ' has no linked kits.'}
                  {' '}This can't be undone.
                </p>
              </div>
            </div>
            <div className="club-modal__footer">
              <button
                type="button"
                className="club-btn club-btn--secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="club-btn club-btn--danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete club'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
