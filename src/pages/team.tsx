import type { GetStaticPropsContext, GetStaticPropsResult } from 'next'
import { Fragment } from 'react'

import type { CmsPage, CmsTeamMember } from '@/api/cms'
import { getCmsPage, getCmsTeamMembers } from '@/api/cms'
import type { SiteLocale } from '@/lib/i18n/getCurrentLocale'
import { getCurrentLocale } from '@/lib/i18n/getCurrentLocale'
import { Metadata } from '@/modules/metadata/Metadata'
import { useCanonicalUrl } from '@/modules/metadata/useCanonicalUrl'
import { Container } from '@/modules/ui/Container'

/**
 * i18n.
 */
export const labels = {
  en: {
    page: {
      title: 'Team',
    },
    data: {
      phone: 'Phone',
      email: 'Email',
      website: 'Website',
    },
  },
  de: {
    page: {
      title: 'Team',
    },
    data: {
      phone: 'Telefon',
      email: 'Email',
      website: 'Website',
    },
  },
} as const

export type CmsPageMetadata = {
  title: string
}

export interface TeamPageProps {
  labels: typeof labels[SiteLocale]
  page: CmsPage<CmsPageMetadata>
  data: {
    team: Array<CmsTeamMember>
  }
}

/**
 * Make page contents from CMS and localised labels available to client.
 */
export async function getStaticProps(
  context: GetStaticPropsContext,
): Promise<GetStaticPropsResult<TeamPageProps>> {
  const locale = getCurrentLocale(context.locale)

  const page = await getCmsPage<CmsPageMetadata>('team', locale)
  const team = await getCmsTeamMembers(locale)

  return {
    props: {
      labels: labels[locale],
      page,
      data: { team },
    },
  }
}

/**
 * Team page.
 */
export default function TeamPage(props: TeamPageProps): JSX.Element {
  const canonicalUrl = useCanonicalUrl()

  return (
    <Fragment>
      <Metadata title={props.labels.page.title} canonicalUrl={canonicalUrl} />
      <Container className="prose" as="main">
        <h1>{props.page.metadata.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: props.page.html }} />
        <ul>
          {props.data.team.map((teamMember) => {
            return (
              <li key={teamMember.id} className="list-none">
                <TeamMember teamMember={teamMember} t={props.labels.data} />
              </li>
            )
          })}
        </ul>
      </Container>
    </Fragment>
  )
}

function TeamMember({
  teamMember,
  t,
}: {
  teamMember: CmsTeamMember
  t: typeof labels[SiteLocale]['data']
}) {
  return (
    <Fragment>
      <h2>{[teamMember.firstName, teamMember.lastName].join(' ')}</h2>
      <p>{teamMember.biography}</p>
      <dl className="flex space-x-6">
        {teamMember.email !== undefined ? (
          <div>
            <dt className="sr-only">{t.email}</dt>
            <dd>
              <a
                href={`mailto:${teamMember.email}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {teamMember.email}
              </a>
            </dd>
          </div>
        ) : null}
        {teamMember.phone !== undefined ? (
          <div>
            <dt className="sr-only">{t.phone}</dt>
            <dd>
              <a
                href={`tel:${teamMember.phone}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {teamMember.phone}
              </a>
            </dd>
          </div>
        ) : null}
        {teamMember.website !== undefined ? (
          <div>
            <dt className="sr-only">{t.website}</dt>
            <dd>
              <a
                href={teamMember.website}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t.website}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </Fragment>
  )
}
