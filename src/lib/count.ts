export function count(map: Record<string, unknown> | undefined): number {
  if (map === undefined) return 0
  return Object.keys(map).length
}
