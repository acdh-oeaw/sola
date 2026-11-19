export type QueryParamValue = string | number | boolean | null | undefined;

export type QueryParams = Record<string, QueryParamValue | Array<QueryParamValue>>;

/**
 * Adds query params to URL.
 */
export function addQueryParams(url: URL, query?: QueryParams): URL {
	if (query === undefined) return url;

	Object.entries(query).forEach(([key, value]) => {
		if (Array.isArray(value)) {
			value.forEach((v) => {
				if (v != null) {
					url.searchParams.append(key, String(v));
				}
			});
		} else if (value != null) {
			url.searchParams.set(key, String(value));
		}
	});

	return url;
}
