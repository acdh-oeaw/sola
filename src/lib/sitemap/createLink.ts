import type { Element } from 'xast'
import { x } from 'xastscript'

import { addQueryParams } from '@/lib/url/addQueryParams'
import { url as baseUrl } from '~/config/site.json'

export function createLink(route: string, query?: Record<string, unknown>): Element {
  const url = new URL(route, baseUrl)
  addQueryParams(url, query)
  return x('url', [x('loc', url.toString())])
}
