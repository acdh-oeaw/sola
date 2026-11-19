import { useMemo } from "react";

/**
 * Returns object values, sorted by specified key.
 */
export function useSortedData<K extends string, T extends Record<K, string>>(
	map: Record<string, T> | undefined,
	key: K,
): Array<T> {
	return useMemo(() => {
		return sort(map, key);
	}, [map, key]);
}

function sort<K extends string, T extends Record<K, string>>(
	map: Record<string, T> | undefined,
	key: K,
) {
	if (map === undefined) return [];
	return Object.values(map).sort((a, b) => {
		return a[key].localeCompare(b[key]);
	});
}
