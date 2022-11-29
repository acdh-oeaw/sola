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
import { useAlternateUrls } from '@/modules/metadata/useAlternateUrls'
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
      data: { posts: posts.slice(0, MAX_POSTS) },
    },
  }
}

/**
 * Posts page.
 */
export default function PostsPage(props: PostsPageProps): JSX.Element {
  const canonicalUrl = useCanonicalUrl()
  const alternateUrls = useAlternateUrls()

  return (
    <Fragment>
      <Metadata
        title={props.labels.page.title}
        canonicalUrl={canonicalUrl}
        languageAlternates={alternateUrls}
      />
      <Container as="main">
        <div className="prose">
          <h1>{props.page.metadata.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: props.page.html }} />
        </div>
        <ul className="my-8 space-y-10">
          {props.data.posts.map((post) => {
            return (
              <li key={post.id}>
                <Post post={post} t={props.labels.data} />
              </li>
            )
          })}
        </ul>
      </Container>
    </Fragment>
  )
}

function Post({ post, t }: { post: CmsPostBase; t: typeof labels[SiteLocale]['data'] }) {
  const locale = useCurrentLocale()

  return (
    <Fragment>
      <Link
        href={`/posts/${post.id}`}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
      >
        <h2 className="my-4 text-2xl font-bold text-gray-700">{post.metadata.title}</h2>
      </Link>
      <time className="text-sm text-gray-500" dateTime={post.metadata.date}>
        {formatDate(post.metadata.date, locale)}
      </time>
      <p className="my-3 leading-7 text-gray-700">{post.metadata.abstract}</p>
      <Link
        href={`/posts/${post.id}`}
        className="inline-block px-4 py-2 text-sm font-semibold tracking-wider text-gray-700 uppercase transition bg-yellow-400 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 hover:bg-yellow-500"
      >
        {t.readMore}
      </Link>
    </Fragment>
  )
}
