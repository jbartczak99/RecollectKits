import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CollectionsList from '../components/collections/CollectionsList'
import Dashboard from '../components/dashboard/Dashboard'

const VALID_VIEWS = new Set(['dashboard', 'collections'])

export default function Collection() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [openProfileSettings, setOpenProfileSettings] = useState(false)

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

  if (view === 'collections') {
    return (
      <CollectionsList
        openProfileSettings={openProfileSettings}
        onProfileSettingsClose={() => setOpenProfileSettings(false)}
      />
    )
  }
  return <Dashboard />
}
