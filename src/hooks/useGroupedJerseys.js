import { useMemo } from 'react'
import { groupJerseysByBaseKit } from '../utils/groupJerseys'

/**
 * Hook that groups an already-filtered array of jerseys by base kit.
 * @param {Array} jerseys - Filtered jerseys array
 * @returns {{ groups: Array, totalVersions: number }}
 */
export function useGroupedJerseys(jerseys) {
  const groups = useMemo(() => groupJerseysByBaseKit(jerseys), [jerseys])
  const totalVersions = useMemo(() => jerseys.length, [jerseys])

  return { groups, totalVersions }
}
