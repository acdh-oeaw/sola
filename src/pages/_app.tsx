import '@/styles/custom-properties.css'
import '@/styles/globals.css'
import 'tailwindcss/tailwind.css'

import ErrorBoundary from '@stefanprobst/next-error-boundary'
import type { AppProps, NextWebVitalsMetric } from 'next/app'
import Head from 'next/head'
import { Fragment } from 'react'
import { ReactQueryDevtools } from 'react-query/devtools'

import { ClientError } from '@/modules/error/ClientError'
import { DefaultPageLayout } from '@/modules/layouts/DefaultPageLayout'
import { Providers } from '@/modules/providers/Providers'

/**
 * Application shell.
 */
export default function App({
  Component,
  pageProps,
  router,
}: AppProps): JSX.Element {
  return (
    <Fragment>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <ErrorBoundary fallback={ClientError} resetOnChange={[router.asPath]}>
        <Providers {...pageProps}>
          <DefaultPageLayout {...pageProps}>
            <Component {...pageProps} />
          </DefaultPageLayout>
          <ReactQueryDevtools initialIsOpen={false} />
        </Providers>
      </ErrorBoundary>
    </Fragment>
  )
}

/**
 * Report web vitals.
 */
export function reportWebVitals(metric: NextWebVitalsMetric): void {
  /** should be dispatched to an analytics service */
  console.info(metric)
}

/**
 * Enable mock service worker.
 */
async function startMockServiceWorker() {
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
    if (typeof window === 'undefined') {
      const { server } = await import('@/api/mocks/server')
      server.listen()
    } else {
      const { worker } = await import('@/api/mocks/worker')
      worker.start()
    }
  }
}
startMockServiceWorker()
