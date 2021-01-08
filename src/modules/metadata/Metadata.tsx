import type { PageMetadataProps } from '@stefanprobst/next-page-metadata'
import PageMetadata from '@stefanprobst/next-page-metadata'

import { useSiteMetadata } from '@/modules/metadata/useSiteMetadata'

export type MetadataProps = PageMetadataProps

/**
 * Page metadata for SEO.
 */
export function Metadata({
  openGraph,
  twitter,
  ...props
}: MetadataProps): JSX.Element {
  const { title: siteTitle } = useSiteMetadata()

  function defaultTitleTemplate(title?: string) {
    return [title, siteTitle].filter(Boolean).join(' | ')
  }

  return (
    <PageMetadata
      {...props}
      titleTemplate={defaultTitleTemplate}
      openGraph={{ siteName: siteTitle, ...openGraph }}
      twitter={{ cardType: 'summary', site: siteTitle, ...twitter }}
    />
  )
}
