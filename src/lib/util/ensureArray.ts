export function ensureArray<T>(value: Array<T> | T): Array<T> {
  return Array.isArray(value) ? value : [value]
}
