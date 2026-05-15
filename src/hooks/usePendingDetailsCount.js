import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../lib/supabase'

/**
 * Count of user_jerseys rows where details_completed = false for the
 * logged-in user. Used by the nav badge and the Collection sidebar.
 *
 * Refreshes on:
 *   - mount
 *   - user change
 *   - Supabase Realtime UPDATE/INSERT/DELETE on user_jerseys (if enabled
 *     for the table in the Supabase project — opt-in, may not fire)
 *   - 'recollectkits:user-jerseys-changed' window event — dispatched by
 *     code paths that mutate user_jerseys (e.g. EditUserJerseyModal save)
 *     so the badge updates instantly even without Realtime.
 */
export function usePendingDetailsCount() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)

  const fetchCount = useCallback(async () => {
    if (!user) {
      setCount(0)
      return
    }
    try {
      const { count: c, error } = await supabase
        .from('user_jerseys')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('details_completed', false)
      if (!error) setCount(c || 0)
    } catch (err) {
      console.error('Error fetching pending details count:', err)
    }
  }, [user])

  useEffect(() => {
    fetchCount()
  }, [fetchCount])

  // Custom-event listener — same-tab, instant updates after a modal save.
  useEffect(() => {
    const onChanged = () => fetchCount()
    window.addEventListener('recollectkits:user-jerseys-changed', onChanged)
    return () => {
      window.removeEventListener('recollectkits:user-jerseys-changed', onChanged)
    }
  }, [fetchCount])

  // Optional Realtime — only fires if user_jerseys is in the
  // supabase_realtime publication. Harmless if it isn't.
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('user_jerseys_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_jerseys',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchCount()
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchCount])

  return count
}

/** Dispatch the event mutating code paths use to nudge the badge. */
export function notifyUserJerseysChanged() {
  window.dispatchEvent(new Event('recollectkits:user-jerseys-changed'))
}
