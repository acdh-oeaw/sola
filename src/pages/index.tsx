import { Fragment } from 'react'

import { Metadata } from '@/modules/metadata/Metadata'
import { useCanonicalUrl } from '@/modules/metadata/useCanonicalUrl'

/**
 * Index page.
 */
export default function IndexPage(): JSX.Element {
  const canonicalUrl = useCanonicalUrl()

  return (
    <Fragment>
      <Metadata title="Home" canonicalUrl={canonicalUrl} />
      <main>
        <h1>Home</h1>
      </main>
    </Fragment>
  )
}
