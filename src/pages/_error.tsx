import NextError from 'next/error'
import { Fragment } from 'react'

import { Error } from '@/modules/error/Error'
import { Metadata } from '@/modules/metadata/Metadata'

export interface InternalErrorProps {
  statusCode?: number
}

/**
 * Internal error page.
 */
export default function InternalErrorPage({
  statusCode,
}: InternalErrorProps): JSX.Element {
  return (
    <Fragment>
      <Metadata noindex nofollow title="Unexpected error" />
      <main className="flex flex-col items-center justify-center">
        <Error
          message="An unexpected error has occurred."
          statusCode={statusCode}
        />
      </main>
    </Fragment>
  )
}

InternalErrorPage.getInitialProps = NextError.getInitialProps
