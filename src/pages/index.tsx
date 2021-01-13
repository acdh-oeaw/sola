import type { GetStaticPropsContext, GetStaticPropsResult } from 'next'
import { Fragment } from 'react'

import type { SiteLocale } from '@/lib/getCurrentLocale'
import { getCurrentLocale } from '@/lib/getCurrentLocale'
import { Metadata } from '@/modules/metadata/Metadata'
import { useCanonicalUrl } from '@/modules/metadata/useCanonicalUrl'

/**
 * i18n.
 */
export const labels = {
  en: {
    page: {
      title: 'Home',
    },
  },
  de: {
    page: {
      title: 'Startseite',
    },
  },
} as const

export interface IndexPageProps {
  labels: typeof labels[SiteLocale]
}

/**
 * Make localised labels available to client.
 */
export function getStaticProps(
  context: GetStaticPropsContext,
): GetStaticPropsResult<IndexPageProps> {
  const locale = getCurrentLocale(context)

  return {
    props: {
      labels: labels[locale],
    },
  }
}

/**
 * Index page.
 */
export default function IndexPage(props: IndexPageProps): JSX.Element {
  const canonicalUrl = useCanonicalUrl()

  return (
    <Fragment>
      <Metadata title={props.labels.page.title} canonicalUrl={canonicalUrl} />
      <main>
        <h1>{props.labels.page.title}</h1>
      </main>
    </Fragment>
  )
}
