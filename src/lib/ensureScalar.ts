export function ensureScalar<T>(value: T | Array<T>): T | undefined {
  return Array.isArray(value) ? value[0] : value
}
