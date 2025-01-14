export function ensureScalar<T>(value: Array<T> | T): T | undefined {
	return Array.isArray(value) ? value[0] : value;
}
