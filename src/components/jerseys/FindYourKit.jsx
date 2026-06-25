import { useState, useEffect, useRef } from 'react'
import { ArrowLeftIcon, MagnifyingGlassIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { supabase } from '../../lib/supabase'
import { searchCatalog, addKitInstantly, getCollectionIds } from '../../lib/catalogFirst.js'
import { trackKitAdded } from '../../lib/analytics'

// Search-first add flow, found path (Docs/CATALOG_FIRST_DESIGN.md decisions
// 4 & 6). Single entry point for adding a kit: search the catalog, one-click
// add. The submission wizard is reachable only as the not-found fallback.

const TYPE_LABELS = {
  home: 'Home', away: 'Away', third: 'Third', fourth: 'Fourth',
  goalkeeper: 'Goalkeeper', special: 'Special', training: 'Training',
}

export default function FindYourKit({ onCancel, onAddManually }) {
  const { user } = useAuth()
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [inCollection, setInCollection] = useState(new Set())
  const [justAdded, setJustAdded] = useState(new Set())
  const [addError, setAddError] = useState('')
  const debounceRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    getCollectionIds(supabase, user?.id).then((ids) => {
      if (!cancelled) setInCollection(ids)
    })
    return () => { cancelled = true }
  }, [user?.id])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!term.trim()) {
      setResults([])
      setSearched(false)
      setSearching(false)
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      const { data, error } = await searchCatalog(supabase, term)
      setResults(error ? [] : data)
      setSearching(false)
      setSearched(true)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [term])

  const handleAdd = async (kitId) => {
    setAddError('')
    const result = await addKitInstantly(supabase, user?.id, kitId)
    if (result.status === 'added' || result.status === 'already') {
      setInCollection((prev) => new Set(prev).add(kitId))
      if (result.status === 'added') {
        setJustAdded((prev) => new Set(prev).add(kitId))
        trackKitAdded(inCollection.size + 1)
      }
    } else {
      setAddError('Something went wrong adding that kit. Please try again.')
    }
  }

  const notFoundPrompt = (
    <div style={{ textAlign: 'center', padding: '24px 16px' }}>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
        Can&apos;t find your kit in the catalog?
      </p>
      <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>
        Our catalog is just getting started — add yours and we&apos;ll get it cataloged.
      </p>
      <button
        type="button"
        onClick={() => onAddManually(term)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '10px 18px', backgroundColor: 'white', color: '#16a34a',
          border: '1px solid #16a34a', borderRadius: '8px',
          fontSize: '14px', fontWeight: 500, cursor: 'pointer',
        }}
      >
        <PlusIcon style={{ width: '16px', height: '16px' }} />
        Add it yourself
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Back to collection"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', backgroundColor: 'white',
            border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer',
          }}
        >
          <ArrowLeftIcon style={{ width: '18px', height: '18px', color: '#374151' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Find your kit
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            Search the catalog — team and season, e.g. &quot;Arsenal 2019/20&quot;
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <MagnifyingGlassIcon style={{
          position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
          width: '18px', height: '18px', color: '#9ca3af',
        }} />
        <input
          type="search"
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Team or country, season..."
          style={{
            width: '100%', padding: '12px 16px 12px 42px',
            border: '1px solid #d1d5db', borderRadius: '8px',
            fontSize: '15px', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {addError && (
        <div style={{
          padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '6px', marginBottom: '12px', fontSize: '13px', color: '#dc2626',
        }}>
          {addError}
        </div>
      )}

      {searching && (
        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', padding: '16px' }}>
          Searching…
        </p>
      )}

      {!searching && searched && results.length === 0 && notFoundPrompt}

      {!searching && results.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.map((kit) => {
              const owned = inCollection.has(kit.id)
              const added = justAdded.has(kit.id)
              return (
                <div
                  key={kit.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 14px', backgroundColor: 'white',
                    border: '1px solid #e5e7eb', borderRadius: '10px',
                  }}
                >
                  <div style={{
                    width: '56px', height: '56px', flexShrink: 0, borderRadius: '8px',
                    backgroundColor: '#f3f4f6', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {kit.front_image_url ? (
                      <img
                        src={kit.front_image_url}
                        alt={`${kit.team_name} ${kit.season}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '22px' }}>👕</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                      {kit.team_name}
                    </p>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                      {kit.season} · {TYPE_LABELS[kit.jersey_type] || kit.jersey_type}
                      {kit.competition_gender === 'womens' ? " · Women's" : ''}
                    </p>
                  </div>

                  {owned ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '8px 12px', fontSize: '13px', fontWeight: 500,
                      color: '#16a34a', backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0', borderRadius: '8px', whiteSpace: 'nowrap',
                    }}>
                      <CheckIcon style={{ width: '15px', height: '15px' }} />
                      {added ? 'Added!' : 'In collection'}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAdd(kit.id)}
                      style={{
                        padding: '8px 14px', backgroundColor: '#16a34a', color: 'white',
                        border: 'none', borderRadius: '8px', fontSize: '13px',
                        fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      I have this
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          {notFoundPrompt}
        </>
      )}

      {!searched && !searching && !term.trim() && (
        <p style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', padding: '24px 16px' }}>
          Found kits are added instantly — you can fill in size and condition later.
        </p>
      )}
    </div>
  )
}
