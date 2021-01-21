import type { GetStaticPropsContext, GetStaticPropsResult } from 'next'
import Link from 'next/link'
import { Fragment } from 'react'

import type { CmsPage, CmsPostBase } from '@/api/cms'
import { getCmsPage, getCmsPostsOverview } from '@/api/cms'
import { formatDate } from '@/lib/i18n/formatDate'
import type { SiteLocale } from '@/lib/i18n/getCurrentLocale'
import { getCurrentLocale } from '@/lib/i18n/getCurrentLocale'
import { useCurrentLocale } from '@/lib/i18n/useCurrentLocale'
import { Metadata } from '@/modules/metadata/Metadata'
import { useCanonicalUrl } from '@/modules/metadata/useCanonicalUrl'
import { Container } from '@/modules/ui/Container'

const MAX_POSTS = 10

/**
 * i18n.
 */
export const labels = {
  en: {
    page: {
      title: 'News',
    },
    data: {
      readMore: 'Read more',
    },
  },
  de: {
    page: {
      title: 'Neuigkeiten',
    },
    data: {
      readMore: 'Weiterlesen',
    },
  },
} as const

export type CmsPageMetadata = {
  title: string
}

export interface PostsPageProps {
  labels: typeof labels[SiteLocale]
  page: CmsPage<CmsPageMetadata>
  data: {
    posts: Array<CmsPostBase>
  }
}

/**
 * Make page contents from CMS and localised labels available to client.
 */
export async function getStaticProps(
  context: GetStaticPropsContext,
): Promise<GetStaticPropsResult<PostsPageProps>> {
  const locale = getCurrentLocale(context.locale)

  const page = await getCmsPage<CmsPageMetadata>('news', locale)
  const posts = await getCmsPostsOverview(locale)

  return {
    props: {
      labels: labels[locale],
      page,
      data: { posts },
    },
  }
}

/**
 * Posts page.
 */
export default function PostsPage(props: PostsPageProps): JSX.Element {
  const canonicalUrl = useCanonicalUrl()

  return (
    <Fragment>
      <Metadata title={props.labels.page.title} canonicalUrl={canonicalUrl} />
      <Container className="prose" as="main">
        <h1>{props.page.metadata.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: props.page.html }} />
        <ul>
          {props.data.posts.slice(0, MAX_POSTS).map((post) => {
            return (
              <li key={post.id} className="list-none">
                <Post post={post} t={props.labels.data} />
              </li>
            )
          })}
        </ul>
      </Container>
    </Fragment>
  )
}

function Post({
  post,
  t,
}: {
  post: CmsPostBase
  t: typeof labels[SiteLocale]['data']
}) {
  const locale = useCurrentLocale()

  return (
    <Fragment>
      <Link href={`/posts/${post.id}`}>
        <a>
          <h2>{post.metadata.title}</h2>
        </a>
      </Link>
      <time dateTime={post.metadata.date}>
        {formatDate(post.metadata.date, locale)}
      </time>
      <p>{post.metadata.abstract}</p>
      <Link href={`/posts/${post.id}`}>
        <a>{t.readMore}</a>
      </Link>
    </Fragment>
  )
}
