import { groupBy } from '@acdh-oeaw/lib'
import { log } from '@stefanprobst/log'
import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path/posix'

import { getCmsPostIds } from '@/api/cms'
import { type SolaListEntity, getSolaEntities } from '@/api/sola/client'
import type { SiteLocale } from '@/lib/i18n/getCurrentLocale'
import { createLink } from '@/lib/sitemap/createLink'
import { createSitemap } from '@/lib/sitemap/createSitemap'
import { getStaticPages } from '@/lib/sitemap/getStaticPages'

const query = { limit: 10_000 }

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
    const defaultLocale: SiteLocale = 'en'

    /** Static pages (without imprint page). */
    const pages = await getStaticPages()

    const links = locales
      .map((locale) => {
        return pages.map((page) => {
          return createLink(locale === defaultLocale ? page : path.join(locale, page))
        })
      })
      .flat()

    /** Dynamic post pages. */
    const posts = await Promise.all(
      locales.map(async (locale) => {
        const ids = await getCmsPostIds(locale)
        return ids.map((id) => {
          return createLink(
            locale === defaultLocale ? path.join('posts', id) : path.join(locale, 'posts', id),
          )
        })
      }),
    )
    links.push(...posts.flat())

    /** Pages for SOLA entities. */
    /** Only fetch for one locale, since ids and type are the same for all locales. */
    const locale = locales[0] as SiteLocale

    const data = await getSolaEntities({ query, locale })

    const grouped = groupBy(data.results, (result) => {
      return result.type
    })

    /* eslint-disable-next-line no-inner-declarations */
    function createLinksForEntities(entities: Array<SolaListEntity> = []) {
      return locales
        .map((locale) => {
          return entities.map((entity) => {
            if (locale === defaultLocale) {
              return createLink('dataset', {
                id: entity.id,
                type: entity.type,
              })
            }
            return createLink(path.join(locale, 'dataset'), {
              id: entity.id,
              type: entity.type,
            })
          })
        })
        .flat()
    }

    links.push(...createLinksForEntities(grouped.Event))
    links.push(...createLinksForEntities(grouped.Institution))
    links.push(...createLinksForEntities(grouped.Passage))
    links.push(...createLinksForEntities(grouped.Person))
    links.push(...createLinksForEntities(grouped.Place))
    links.push(...createLinksForEntities(grouped.Publication))

    const sitemap = createSitemap(links)

    response.setHeader('Content-Type', 'application/xml')
    response.send(sitemap)
  } catch (error) {
    log.error(error)
    response.status(500)
    response.end()
  }
}
