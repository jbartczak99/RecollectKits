import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import CollectionsList from '../components/collections/CollectionsList'
import Dashboard from '../components/dashboard/Dashboard'
import KitSubmissionWizard from '../components/jerseys/KitSubmissionWizard'
import FindYourKit from '../components/jerseys/FindYourKit'

const VALID_VIEWS = new Set(['dashboard', 'collections'])

export default function Collection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [openProfileSettings, setOpenProfileSettings] = useState(false)
  const [showFinder, setShowFinder] = useState(false)
  const [showWizard, setShowWizard] = useState(false)

  const viewParam = searchParams.get('view')
  const view = VALID_VIEWS.has(viewParam) ? viewParam : 'dashboard'

  useEffect(() => {
    if (searchParams.get('settings') === 'profile') {
      setOpenProfileSettings(true)
      const next = new URLSearchParams(searchParams)
      next.delete('settings')
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (openProfileSettings && view !== 'collections') {
      const next = new URLSearchParams(searchParams)
      next.set('view', 'collections')
      setSearchParams(next, { replace: true })
    }
  }, [openProfileSettings, view, searchParams, setSearchParams])

  // Catalog-first: "+ Add kit" opens the search surface; the submission
  // wizard is only reachable as its not-found fallback (design decision 6).
  // Both take over the page — the same pattern the wizard always used.
  if (showWizard) {
    return <KitSubmissionWizard onCancel={() => setShowWizard(false)} />
  }

  if (showFinder) {
    return (
      <FindYourKit
        onCancel={() => setShowFinder(false)}
        onAddManually={() => {
          setShowFinder(false)
          setShowWizard(true)
        }}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => setShowFinder(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
        >
          <PlusIcon style={{ width: '16px', height: '16px' }} />
          Add New Kit
        </button>
      </div>

      {view === 'collections' ? (
        <CollectionsList
          openProfileSettings={openProfileSettings}
          onProfileSettingsClose={() => setOpenProfileSettings(false)}
        />
      ) : (
        <Dashboard onAddKit={() => setShowFinder(true)} />
      )}
    </div>
  )
}
