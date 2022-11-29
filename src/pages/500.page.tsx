import { Fragment } from 'react'

import { Error } from '@/modules/error/Error'
import { Metadata } from '@/modules/metadata/Metadata'

/**
 * Internal error page.
 */
export default function InternalErrorPage(): JSX.Element {
  return (
    <Fragment>
      <Metadata noindex nofollow title="Unexpected error" />
      <main className="flex flex-col items-center justify-center">
        <Error message="An unexpected error has occurred." statusCode={500} />
      </main>
    </Fragment>
  )
}
