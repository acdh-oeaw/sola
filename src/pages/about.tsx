import type { GetStaticPropsContext, GetStaticPropsResult } from 'next'
import { Fragment } from 'react'

import type { CmsPage } from '@/api/cms'
import { getCmsPage } from '@/api/cms'
import type { SiteLocale } from '@/lib/i18n/getCurrentLocale'
import { getCurrentLocale } from '@/lib/i18n/getCurrentLocale'
import { Metadata } from '@/modules/metadata/Metadata'
import { useAlternateUrls } from '@/modules/metadata/useAlternateUrls'
import { useCanonicalUrl } from '@/modules/metadata/useCanonicalUrl'
import { Container } from '@/modules/ui/Container'

/**
 * i18n.
 */
export const labels = {
  en: {
    page: {
      title: 'About the project',
      currentTeamMembers: 'Researchers',
      formerTeamMembers: 'Former team members',
      acdhTeamMembers: 'IT-Team',
    },
  },
  de: {
    page: {
      title: 'Über das Projekt',
      currentTeamMembers: 'Wissenschaftliche Mitarbeiter*innen',
      formerTeamMembers: 'Ehemalige Mitarbeiterinnen',
      acdhTeamMembers: 'IT-Team',
    },
  },
} as const

export type CmsPageMetadata = {
  title: string
}

export interface AboutPageProps {
  labels: typeof labels[SiteLocale]
  page: CmsPage<CmsPageMetadata>
}

/**
 * Make page contents from CMS and localised labels available to client.
 */
export async function getStaticProps(
  context: GetStaticPropsContext,
): Promise<GetStaticPropsResult<AboutPageProps>> {
  const locale = getCurrentLocale(context.locale)

  const page = await getCmsPage<CmsPageMetadata>('about', locale)

  return {
    props: {
      labels: labels[locale],
      page,
    },
  }
}

/**
 * About page.
 */
export default function AboutPage(props: AboutPageProps): JSX.Element {
  const canonicalUrl = useCanonicalUrl()
  const alternateUrls = useAlternateUrls()

  return (
    <Fragment>
      <Metadata
        title={props.labels.page.title}
        canonicalUrl={canonicalUrl}
        languageAlternates={alternateUrls}
      />
      <Container className="prose" as="main">
        <h1>{props.page.metadata.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: props.page.html }} />
      </Container>
    </Fragment>
  )
}
