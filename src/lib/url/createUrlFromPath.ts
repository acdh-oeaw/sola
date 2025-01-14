/**
 * Creates URL from path and optional base URL.
 */
export function createUrlFromPath(path: string, baseUrl = "https://n"): URL {
	return new URL(path, baseUrl);
}
