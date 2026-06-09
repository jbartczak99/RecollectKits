import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  Square3Stack3DIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext.jsx'
import { usePublicJerseys, useUserJerseys, useJerseyLikes, useWishlist } from '../hooks/useJerseys'
import { useGroupedJerseys } from '../hooks/useGroupedJerseys'
import JerseySearch from '../components/jerseys/JerseySearch'
import SelectCollectionModal from '../components/collections/SelectCollectionModal'
import KitGroupCard from '../components/jerseys/KitGroupCard'
import { pageMeta } from '../lib/seo'

export const meta = () =>
  pageMeta({
    title: 'Browse Football Shirts — RecollectKits',
    ogTitle: 'Browse Football Shirts — RecollectKits',
    path: '/jerseys',
  })

const JERSEY_TYPES = ['home', 'away', 'third', 'special']

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: '20px' },
  header: { display: 'flex', flexDirection: 'column', gap: '4px' },
  title: { margin: 0, fontSize: '28px', fontWeight: 700, color: '#111827', lineHeight: 1.2 },
  subtitle: { margin: 0, fontSize: '14px', color: '#6b7280' },
  searchRow: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  searchWrap: { flex: '1 1 280px', minWidth: 0 },
  count: { fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' },
  pillRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  pill: (active) => ({
    padding: '6px 14px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid',
    borderColor: active ? '#16a34a' : '#e5e7eb',
    backgroundColor: active ? '#16a34a' : '#ffffff',
    color: active ? '#ffffff' : '#374151',
    cursor: 'pointer',
    transition: 'background-color 0.15s, border-color 0.15s, color 0.15s',
  }),
  filterCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    padding: '14px 16px',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '10px',
  },
  filterLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginRight: '4px',
  },
  select: {
    padding: '7px 10px',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#111827',
    minWidth: '140px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
  },
  clearBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#16a34a',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '14px',
  },
  errorIcon: { width: '20px', height: '20px', flexShrink: 0 },
  skeletonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
  skeletonCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    height: '320px',
  },
  empty: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    padding: '48px 24px',
    textAlign: 'center',
  },
  emptyIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#f3f4f6',
    color: '#9ca3af',
    marginBottom: '16px',
  },
  emptyTitle: { margin: 0, fontSize: '17px', fontWeight: 600, color: '#111827' },
  emptyText: { margin: '6px 0 0', fontSize: '14px', color: '#6b7280' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '20px',
  },
}

export default function Jerseys() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [imageStates, setImageStates] = useState({})
  const [showSelectCollectionModal, setShowSelectCollectionModal] = useState(false)
  const [selectedJerseyForCollection, setSelectedJerseyForCollection] = useState(null)

  const [searchParams, setSearchParams] = useSearchParams()

  const [selectedLeagues, setSelectedLeagues] = useState([])
  const [selectedManufacturers, setSelectedManufacturers] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedSeason, setSelectedSeason] = useState('')
  // Initialize deterministically ('') so the prerendered HTML (path '/jerseys',
  // no query string) and the client's first render are byte-identical. Reading
  // searchParams in a useState initializer would differ for a '/jerseys?gender='
  // load and break hydration (#418). The URL value is applied in the effect
  // below, after hydration.
  const [selectedGender, setSelectedGender] = useState('')

  useEffect(() => {
    const param = searchParams.get('gender')
    setSelectedGender(param === 'mens' || param === 'womens' ? param : '')
  }, [searchParams])

  const handleGenderChange = useCallback((value) => {
    setSelectedGender(value)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set('gender', value)
      else next.delete('gender')
      return next
    }, { replace: true })
  }, [setSearchParams])

  const { jerseys: allJerseys, loading, error } = usePublicJerseys(searchTerm, filters)
  const { isInMainCollection, refetch: refetchUserJerseys } = useUserJerseys()
  const { hasLiked, getLikeCount, toggleLike } = useJerseyLikes(user?.id)
  const { isInWishlist, toggleWishlist } = useWishlist(user?.id)

  const filterOptions = useMemo(() => {
    const leagues = [...new Set(allJerseys.map((j) => j.league).filter(Boolean))].sort()
    const manufacturers = [...new Set(allJerseys.map((j) => j.manufacturer).filter(Boolean))].sort()
    const seasons = [...new Set(allJerseys.map((j) => j.season).filter(Boolean))].sort().reverse()
    return { leagues, manufacturers, seasons }
  }, [allJerseys])

  const jerseys = useMemo(() => {
    let filtered = [...allJerseys]
    if (selectedLeagues.length > 0) filtered = filtered.filter((j) => selectedLeagues.includes(j.league))
    if (selectedManufacturers.length > 0) filtered = filtered.filter((j) => selectedManufacturers.includes(j.manufacturer))
    if (selectedTypes.length > 0) filtered = filtered.filter((j) => selectedTypes.includes(j.jersey_type))
    if (selectedSeason) filtered = filtered.filter((j) => j.season === selectedSeason)
    if (selectedGender) filtered = filtered.filter((j) => j.competition_gender === selectedGender)
    return filtered
  }, [allJerseys, selectedLeagues, selectedManufacturers, selectedTypes, selectedSeason, selectedGender])

  const { groups, totalVersions } = useGroupedJerseys(jerseys)

  const handleOpenSelectCollection = (jersey) => {
    setSelectedJerseyForCollection(jersey)
    setShowSelectCollectionModal(true)
  }

  const handleCollectionSuccess = () => {
    refetchUserJerseys()
  }

  const clearAllFilters = () => {
    setSelectedLeagues([])
    setSelectedManufacturers([])
    setSelectedTypes([])
    setSelectedSeason('')
    handleGenderChange('')
  }

  const activeFilterCount =
    selectedLeagues.length +
    selectedManufacturers.length +
    selectedTypes.length +
    (selectedSeason ? 1 : 0) +
    (selectedGender ? 1 : 0)

  const countText = loading
    ? 'Loading…'
    : `${groups.length} ${groups.length === 1 ? 'kit' : 'kits'}${totalVersions !== groups.length ? ` · ${totalVersions} versions` : ''}`

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Kit Database</h1>
        <p style={styles.subtitle}>Browse every kit in the catalog. Click an image to see full details.</p>
      </div>

      <div style={styles.searchRow}>
        <div style={styles.searchWrap}>
          <JerseySearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by team name…"
          />
        </div>
        <span style={styles.count}>{countText}</span>
      </div>

      {error && (
        <div style={styles.error}>
          <ExclamationCircleIcon style={styles.errorIcon} />
          <span>Error loading kits: {error}</span>
        </div>
      )}

      <div style={styles.pillRow}>
        {[
          { value: '', label: 'All' },
          { value: 'mens', label: "Men's" },
          { value: 'womens', label: "Women's" },
        ].map((option) => (
          <button
            key={option.value || 'all'}
            type="button"
            onClick={() => handleGenderChange(option.value)}
            style={styles.pill(selectedGender === option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div style={styles.filterCard}>
        <span style={styles.filterLabel}>Filters</span>

        <select
          value={selectedLeagues[0] || ''}
          onChange={(e) => setSelectedLeagues(e.target.value ? [e.target.value] : [])}
          style={styles.select}
        >
          <option value="">All Leagues</option>
          {filterOptions.leagues.map((league) => (
            <option key={league} value={league}>{league}</option>
          ))}
        </select>

        <select
          value={selectedManufacturers[0] || ''}
          onChange={(e) => setSelectedManufacturers(e.target.value ? [e.target.value] : [])}
          style={styles.select}
        >
          <option value="">All Brands</option>
          {filterOptions.manufacturers.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          value={selectedTypes[0] || ''}
          onChange={(e) => setSelectedTypes(e.target.value ? [e.target.value] : [])}
          style={styles.select}
        >
          <option value="">All Types</option>
          {JERSEY_TYPES.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>

        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          style={styles.select}
        >
          <option value="">All Seasons</option>
          {filterOptions.seasons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {activeFilterCount > 0 && (
          <button type="button" onClick={clearAllFilters} style={styles.clearBtn}>
            <XMarkIcon style={{ width: '14px', height: '14px' }} />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {loading ? (
        <div style={styles.skeletonGrid}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={styles.skeletonCard} className="skeleton" />
          ))}
        </div>
      ) : jerseys.length === 0 ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>
            <Square3Stack3DIcon style={{ width: '28px', height: '28px' }} />
          </div>
          <h3 style={styles.emptyTitle}>No kits found</h3>
          <p style={styles.emptyText}>
            {searchTerm ? `No kits match "${searchTerm}".` : 'No kits in the database yet.'}
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {groups.map((group) => (
            <KitGroupCard
              key={group.groupKey}
              group={group}
              user={user}
              imageStates={imageStates}
              setImageStates={setImageStates}
              hasLiked={hasLiked}
              getLikeCount={getLikeCount}
              toggleLike={toggleLike}
              isInMainCollection={isInMainCollection}
              isInWishlist={isInWishlist}
              toggleWishlist={toggleWishlist}
              onOpenSelectCollection={handleOpenSelectCollection}
            />
          ))}
        </div>
      )}

      <SelectCollectionModal
        isOpen={showSelectCollectionModal}
        onClose={() => {
          setShowSelectCollectionModal(false)
          setSelectedJerseyForCollection(null)
        }}
        jersey={selectedJerseyForCollection}
        onSuccess={handleCollectionSuccess}
      />
    </div>
  )
}
