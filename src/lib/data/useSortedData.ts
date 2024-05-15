import { useMemo } from 'react'

/**
 * Returns object values, sorted by specified key.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSortedData<T extends Record<string, any>, K extends keyof T>(
  map: Record<string, T> | undefined,
  key: K,
): Array<T> {
  return useMemo(() => {
    return sort(map, key)
  }, [map, key])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sort<T extends Record<string, any>, K extends keyof T>(
  map: Record<string, T> | undefined,
  key: K,
) {
  if (map === undefined) return []
  return Object.values(map).sort((a, b) => {
    return a[key].localeCompare(b[key])
  })
}
