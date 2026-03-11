import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MagnifyingGlassIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { searchPlayer, fetchPlayerDetails, mapToPlayerRecord } from '../../utils/wikidata'
import { supabase } from '../../lib/supabase'

export default function WikidataPlayerLinker({ jerseyId, playerName, onLinked }) {
  const [step, setStep] = useState('idle') // idle | searching | results | loading-details | confirm | saving | done | error
  const [searchResults, setSearchResults] = useState([])
  const [selectedResult, setSelectedResult] = useState(null)
  const [playerDetails, setPlayerDetails] = useState(null)
  const [linkedPlayerId, setLinkedPlayerId] = useState(null)
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    setStep('searching')
    setError(null)

    const { data, error: searchError } = await searchPlayer(playerName)
    if (searchError) {
      setError(searchError)
      setStep('error')
      return
    }

    setSearchResults(data)
    setStep('results')
  }

  const handleSelect = async (result) => {
    setSelectedResult(result)
    setStep('loading-details')
    setError(null)

    const { data, error: fetchError } = await fetchPlayerDetails(result.wikidataId)
    if (fetchError) {
      setError(fetchError)
      setStep('error')
      return
    }

    setPlayerDetails(data)
    setStep('confirm')
  }

  const handleConfirmAndLink = async () => {
    setStep('saving')
    setError(null)

    try {
      const { player, careers } = mapToPlayerRecord(playerDetails)

      // Check if player already exists by wikidata_id
      const { data: existing } = await supabase
        .from('players')
        .select('id')
        .eq('wikidata_id', player.wikidata_id)
        .maybeSingle()

      let playerId

      if (existing) {
        playerId = existing.id
      } else {
        // Insert player
        const { data: newPlayer, error: playerError } = await supabase
          .from('players')
          .insert(player)
          .select('id')
          .single()

        if (playerError) throw playerError
        playerId = newPlayer.id

        // Insert careers
        if (careers.length > 0) {
          const careerRows = careers.map(c => ({ ...c, player_id: playerId }))
          const { error: careerError } = await supabase
            .from('player_careers')
            .insert(careerRows)

          if (careerError) throw careerError
        }
      }

      // Link this jersey to the player
      const { error: linkError } = await supabase
        .from('public_jerseys')
        .update({ player_id: playerId })
        .eq('id', jerseyId)

      if (linkError) throw linkError

      // Also link any other jerseys with the same player_name that aren't linked yet
      await supabase
        .from('public_jerseys')
        .update({ player_id: playerId })
        .eq('player_name', playerName)
        .is('player_id', null)

      setLinkedPlayerId(playerId)
      setStep('done')
      if (onLinked) onLinked(playerId)
    } catch (err) {
      setError(err.message)
      setStep('error')
    }
  }

  if (step === 'idle') {
    return (
      <button
        onClick={handleSearch}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        <MagnifyingGlassIcon className="h-4 w-4" />
        Link Player Profile
      </button>
    )
  }

  if (step === 'searching' || step === 'loading-details' || step === 'saving') {
    return (
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          {step === 'searching' && `Searching Wikidata for "${playerName}"...`}
          {step === 'loading-details' && `Fetching details for ${selectedResult?.name}...`}
          {step === 'saving' && 'Creating player profile and linking...'}
        </div>
      </div>
    )
  }

  if (step === 'results') {
    if (searchResults.length === 0) {
      return (
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
          <p className="text-sm text-amber-800 mb-2">
            No footballer found on Wikidata for "{playerName}".
          </p>
          <button
            onClick={() => setStep('idle')}
            className="text-sm text-amber-700 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Select the correct player:
        </p>
        <div className="space-y-2">
          {searchResults.map((r) => (
            <button
              key={r.wikidataId}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-3 py-2 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <p className="text-sm font-semibold text-gray-900">{r.name}</p>
              {r.description && (
                <p className="text-xs text-gray-500">{r.description}</p>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => setStep('idle')}
          className="mt-3 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Confirm player details:
        </p>
        <div className="space-y-1 mb-3 text-sm">
          <p><span className="font-medium text-gray-600">Name:</span> {playerDetails.name}</p>
          {playerDetails.position && (
            <p><span className="font-medium text-gray-600">Position:</span> {playerDetails.position}</p>
          )}
          {playerDetails.nationality && (
            <p><span className="font-medium text-gray-600">Nationality:</span> {playerDetails.nationality}</p>
          )}
          {playerDetails.dateOfBirth && (
            <p><span className="font-medium text-gray-600">Born:</span> {playerDetails.dateOfBirth}</p>
          )}
          {playerDetails.careers.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-gray-600 mb-1">Career ({playerDetails.careers.length} entries):</p>
              <ul className="text-xs text-gray-500 space-y-0.5 max-h-32 overflow-y-auto">
                {playerDetails.careers.map((c, i) => (
                  <li key={i}>
                    {c.teamName} ({c.seasonStart || '?'} - {c.seasonEnd || 'present'})
                    {c.shirtNumber ? ` #${c.shirtNumber}` : ''}
                    {c.isInternational ? ' [International]' : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleConfirmAndLink}
            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            Confirm & Link
          </button>
          <button
            onClick={() => { setStep('results'); setPlayerDetails(null) }}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Pick Different Player
          </button>
        </div>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
        <div className="flex items-center gap-2 text-sm text-green-700 mb-2">
          <CheckCircleIcon className="h-4 w-4" />
          Player profile created and linked!
        </div>
        <Link
          to={`/players/${linkedPlayerId}`}
          className="text-sm font-medium text-green-700 underline hover:no-underline"
        >
          View {playerDetails?.name || playerName}'s profile
        </Link>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="bg-red-50 rounded-lg p-4 border border-red-100">
        <div className="flex items-center gap-2 text-sm text-red-700 mb-2">
          <ExclamationTriangleIcon className="h-4 w-4" />
          {error}
        </div>
        <button
          onClick={() => setStep('idle')}
          className="text-sm text-red-600 underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return null
}
