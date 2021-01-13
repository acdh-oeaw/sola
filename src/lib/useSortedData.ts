import { useMemo } from 'react'

/**
 * Returns object values, sorted by specified key.
 */
export function useSortedData<T extends Record<string, any>, K extends keyof T>(
  map: Record<string, T> | undefined,
  key: K,
): Array<T> {
  return useMemo(() => sort(map, key), [map, key])
}

function sort<T extends Record<string, any>, K extends keyof T>(
  map: Record<string, T> | undefined,
  key: K,
) {
  if (map === undefined) return []
  return Object.values(map).sort((a, b) => a[key].localeCompare(b[key]))
}
