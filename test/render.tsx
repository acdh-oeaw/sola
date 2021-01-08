import { render as defaultRender } from '@testing-library/react'
import { RouterContext } from 'next/dist/next-server/lib/router-context'
import type { NextRouter } from 'next/router'

import { Providers } from '@/modules/providers/Providers'
import { mockRouter } from '~/stories/addons/nextRouter'

/* eslint-disable import/export */
export * from '@testing-library/react'

type RenderOptions = Parameters<typeof defaultRender>[1] & {
  router?: Partial<NextRouter>
}
type RenderResult = ReturnType<typeof defaultRender>

interface AppProvidersProps {
  children: JSX.Element
}

/**
 * Renders children wrapped in Next.js router context and context providers.
 */
export function render(
  element: JSX.Element,
  options?: RenderOptions,
): RenderResult {
  function AppProviders(props: AppProvidersProps) {
    return (
      <RouterContext.Provider value={{ ...mockRouter, ...options?.router }}>
        <Providers>{props.children}</Providers>
      </RouterContext.Provider>
    )
  }

  return defaultRender(element, {
    wrapper: AppProviders as RenderOptions['wrapper'],
    ...options,
  })
}
