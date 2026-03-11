import { useState, useEffect } from 'react'
import { GlobeAltIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { searchPlayer, fetchPlayerDetails } from '../../utils/wikidata'

/**
 * Shows a Wikidata preview for a player name during admin review.
 * Auto-searches on mount, lets admin confirm the match.
 * Exposes the confirmed player details via onConfirm callback.
 */
export default function WikidataPlayerPreview({ playerName, onConfirm }) {
  const [status, setStatus] = useState('searching') // searching | results | loading | confirmed | error | no-results
  const [searchResults, setSearchResults] = useState([])
  const [selectedResult, setSelectedResult] = useState(null)
  const [playerDetails, setPlayerDetails] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!playerName || !playerName.trim()) {
      setStatus('no-results')
      return
    }

    let cancelled = false

    const doSearch = async () => {
      setStatus('searching')
      const { data, error: searchError } = await searchPlayer(playerName)

      if (cancelled) return

      if (searchError) {
        setError(searchError)
        setStatus('error')
        return
      }

      if (!data || data.length === 0) {
        setStatus('no-results')
        return
      }

      setSearchResults(data)

      // Auto-select first result and fetch details
      const first = data[0]
      setSelectedResult(first)
      setStatus('loading')

      const { data: details, error: fetchError } = await fetchPlayerDetails(first.wikidataId)

      if (cancelled) return

      if (fetchError) {
        setError(fetchError)
        setStatus('error')
        return
      }

      setPlayerDetails(details)
      setStatus('confirmed')
      if (onConfirm) onConfirm(details)
    }

    doSearch()
    return () => { cancelled = true }
  }, [playerName])

  const handleSelectDifferent = async (result) => {
    setSelectedResult(result)
    setStatus('loading')
    setError(null)

    const { data: details, error: fetchError } = await fetchPlayerDetails(result.wikidataId)

    if (fetchError) {
      setError(fetchError)
      setStatus('error')
      return
    }

    setPlayerDetails(details)
    setStatus('confirmed')
    if (onConfirm) onConfirm(details)
  }

  const handleClear = () => {
    setPlayerDetails(null)
    setSelectedResult(null)
    setStatus('no-results')
    if (onConfirm) onConfirm(null)
  }

  if (status === 'searching' || status === 'loading') {
    return (
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <div className="animate-spin h-3.5 w-3.5 border-2 border-blue-600 border-t-transparent rounded-full" />
          {status === 'searching' ? `Searching Wikidata for "${playerName}"...` : `Loading details...`}
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="bg-red-50 rounded-lg p-3 border border-red-100">
        <div className="flex items-center gap-2 text-sm text-red-700">
          <ExclamationTriangleIcon className="h-4 w-4" />
          Wikidata error: {error}
        </div>
      </div>
    )
  }

  if (status === 'no-results') {
    return (
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <p className="text-sm text-gray-500">No Wikidata match found. Player profile can be created manually later.</p>
      </div>
    )
  }

  if (status === 'confirmed' && playerDetails) {
    return (
      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-green-800">{playerDetails.name}</span>
            </div>
            <div className="text-xs text-green-700 space-y-0.5">
              {playerDetails.position && <p>Position: {playerDetails.position}</p>}
              {playerDetails.nationality && <p>Nationality: {playerDetails.nationality}</p>}
              {playerDetails.dateOfBirth && <p>Born: {playerDetails.dateOfBirth}</p>}
              {playerDetails.careers.filter(c => !c.isInternational).length > 0 && (
                <p className="truncate">
                  Club: {playerDetails.careers
                    .filter(c => !c.isInternational)
                    .map(c => c.teamName)
                    .join(' → ')}
                </p>
              )}
              {playerDetails.careers.filter(c => c.isInternational).length > 0 && (
                <p className="truncate">
                  International: {playerDetails.careers
                    .filter(c => c.isInternational)
                    .map(c => c.teamName)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-shrink-0">
            {searchResults.length > 1 && (
              <details className="relative">
                <summary className="text-xs text-green-700 cursor-pointer hover:underline">
                  Change
                </summary>
                <div className="absolute right-0 top-5 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[200px]">
                  {searchResults.filter(r => r.wikidataId !== selectedResult?.wikidataId).map(r => (
                    <button
                      key={r.wikidataId}
                      onClick={() => handleSelectDifferent(r)}
                      className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-gray-50"
                    >
                      <p className="font-medium text-gray-900">{r.name}</p>
                      {r.description && <p className="text-gray-500 truncate">{r.description}</p>}
                    </button>
                  ))}
                </div>
              </details>
            )}
            <button
              onClick={handleClear}
              className="text-xs text-red-600 hover:underline"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
