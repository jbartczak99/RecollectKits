import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PlusIcon } from '@heroicons/react/24/outline'
import CollectionsList from '../components/collections/CollectionsList'
import Dashboard from '../components/dashboard/Dashboard'
import KitSubmissionWizard from '../components/jerseys/KitSubmissionWizard'

const VALID_VIEWS = new Set(['dashboard', 'collections'])

export default function Collection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [openProfileSettings, setOpenProfileSettings] = useState(false)
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

  // The wizard takes over the page when active — same pattern Jerseys.jsx
  // used before. Cancelling drops back to the prior view (dashboard/collections).
  if (showWizard) {
    return <KitSubmissionWizard onCancel={() => setShowWizard(false)} />
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
          onClick={() => setShowWizard(true)}
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
        <Dashboard />
      )}
    </div>
  )
}
