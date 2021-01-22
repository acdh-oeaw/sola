import type { GetStaticPropsContext, GetStaticPropsResult } from 'next'
import { Fragment } from 'react'

import type { CmsPage, CmsTeamMember } from '@/api/cms'
import { getCmsPage, getCmsTeamMembers } from '@/api/cms'
import type { SiteLocale } from '@/lib/i18n/getCurrentLocale'
import { getCurrentLocale } from '@/lib/i18n/getCurrentLocale'
import { Email } from '@/modules/icons/Email'
import { Globe } from '@/modules/icons/Globe'
import { Phone } from '@/modules/icons/Phone'
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
      <Container as="main">
        <div className="prose">
          <h1>{props.page.metadata.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: props.page.html }} />
        </div>
        <ul className="my-8 space-y-10">
          {props.data.team.map((teamMember) => {
            return (
              <li key={teamMember.id}>
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
  const hasWebsite =
    teamMember.website !== undefined && teamMember.website.length > 0
  const hasEmail = teamMember.email !== undefined && teamMember.email.length > 0
  const hasPhone = teamMember.phone !== undefined && teamMember.phone.length > 0
  const hasInfo = hasWebsite || hasEmail || hasPhone

  return (
    <Fragment>
      <h2 className="my-4 text-2xl font-bold text-gray-700">
        {[teamMember.firstName, teamMember.lastName].join(' ')}
      </h2>
      <p className="my-3 leading-7 text-gray-700">{teamMember.biography}</p>
      {hasInfo ? (
        <dl className="flex my-3 space-x-6 text-gray-500">
          {hasWebsite ? (
            <div>
              <dt className="sr-only">{t.website}</dt>
              <dd className="flex items-center space-x-1.5">
                <Globe />
                <a
                  className="transition hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                  href={teamMember.website}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t.website}
                </a>
              </dd>
            </div>
          ) : null}
          {hasEmail ? (
            <div>
              <dt className="sr-only">{t.email}</dt>
              <dd className="flex items-center space-x-1.5">
                <Email />
                <a
                  className="transition hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                  href={`mailto:${teamMember.email}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {teamMember.email}
                </a>
              </dd>
            </div>
          ) : null}
          {hasPhone ? (
            <div>
              <dt className="sr-only">{t.phone}</dt>
              <dd className="flex items-center space-x-1.5">
                <Phone />
                <a
                  className="transition hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                  href={`tel:${teamMember.phone}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {teamMember.phone}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </Fragment>
  )
}
