/**
 * HTTP Error.
 */
export class HttpError extends Error {
  status: number

  constructor(response: Response) {
    super(response.statusText)
    this.name = 'HttpError'
    this.status = response.status
  }
}

/**
 * Adds query params to URL.
 *
 * Note: we don't reuse `@/lib/url/addQueryParams`, because the SOLA
 * backend defaults to `?key_in=1,2` instead of `?key=1&key=2`.
 */
function addQueryParams(url: URL, query?: Record<string, unknown>) {
  if (query === undefined) return url
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const values = value.filter((value) => value != null)
      if (values.length > 0) {
        /** Arrays will be stringified to "val1,val2,val3". */
        url.searchParams.set(key, String(values))
      }
    } else if (value != null) {
      url.searchParams.set(key, String(value))
    }
  })
  return url
}

/**
 * Request config.
 */
export interface RequestConfig {
  path: string
  baseUrl: string
  query?: Record<string, unknown>
  options?: RequestInit
}

/**
 * Dispatches API request.
 */
export async function request<T>({
  path,
  baseUrl,
  query,
  options,
}: RequestConfig): Promise<T> {
  const url = new URL(path, baseUrl)
  addQueryParams(url, query)

  const response = await fetch(String(url), options)

  if (!response.ok) {
    throw new HttpError(response)
  }

  const data: T = await response.json()

  return data
}
