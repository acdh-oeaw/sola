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
  const {
    title: siteTitle,
    image: siteImage,
    description: siteDescription,
  } = useSiteMetadata()

  function defaultTitleTemplate(title?: string) {
    return [title, siteTitle].filter(Boolean).join(' | ')
  }

  const description = props.description ?? siteDescription
  const image = siteImage

  return (
    <PageMetadata
      {...props}
      titleTemplate={defaultTitleTemplate}
      description={description}
      openGraph={{ siteName: siteTitle, images: [image], ...openGraph }}
      twitter={{ cardType: 'summary', site: siteTitle, image, ...twitter }}
    />
  )
}
