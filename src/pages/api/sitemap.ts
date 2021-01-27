import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'

import { getCmsPostIds } from '@/api/cms'
import type { SolaEntity } from '@/api/sola/client'
import {
  getSolaEvents,
  getSolaInstitutions,
  getSolaPassages,
  getSolaPersons,
  getSolaPlaces,
  getSolaPublications,
} from '@/api/sola/client'
import type { SiteLocale } from '@/lib/i18n/getCurrentLocale'
import { createLink } from '@/lib/sitemap/createLink'
import { createSitemap } from '@/lib/sitemap/createSitemap'
import { getStaticPages } from '@/lib/sitemap/getStaticPages'

const query = { limit: 1000 }

/**
 * Generates a dynamic sitemap. Requests to `/sitemap.xml` will be handled here
 * (see the `rewrites` in `next.config.js`).
 */
export default async function handler(
  _request: NextApiRequest,
  response: NextApiResponse,
): Promise<void> {
  try {
    const locales = ['en', 'de'] as Array<SiteLocale>

    /** Static pages (without imprint page). */
    const pages = await getStaticPages()

    const links = locales
      .map((locale) => pages.map((page) => createLink(path.join(locale, page))))
      .flat()

    /** Dynamic post pages. */
    const posts = await Promise.all(
      locales.map(async (locale) => {
        const ids = await getCmsPostIds(locale)
        return ids.map((id) => createLink(path.join('posts', locale, id)))
      }),
    )
    links.push(...posts.flat())

    /** Pages for SOLA entities. */
    /** Only fetch for one locale, since ids and type are the same for all locales. */
    const locale = locales[0] as SiteLocale
    const [
      events,
      institutions,
      passages,
      persons,
      places,
      publications,
    ] = await Promise.all([
      getSolaEvents({ locale, query }),
      getSolaInstitutions({ locale, query }),
      getSolaPassages({ locale, query }),
      getSolaPersons({ locale, query }),
      getSolaPlaces({ locale, query }),
      getSolaPublications({ locale, query }),
    ])

    /* eslint-disable-next-line no-inner-declarations */
    function createLinksForEntities(entities: Array<SolaEntity>) {
      return locales
        .map((locale) =>
          entities.map((entity) =>
            createLink(path.join(locale, 'dataset'), {
              id: entity.id,
              type: entity.type,
            }),
          ),
        )
        .flat()
    }

    links.push(...createLinksForEntities(events.results))
    links.push(...createLinksForEntities(institutions.results))
    links.push(...createLinksForEntities(passages.results))
    links.push(...createLinksForEntities(persons.results))
    links.push(...createLinksForEntities(places.results))
    links.push(...createLinksForEntities(publications.results))

    const sitemap = createSitemap(links)

    response.setHeader('Content-Type', 'application/xml')
    response.send(sitemap)
  } catch {
    response.status(500)
    response.end()
  }
}
