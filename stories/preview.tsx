/**
 * `@next/plugin-storybook` only allows global css imports in `src/pages/_app.tsx`,
 * so we move the global css imports to `stories/preview-head.html`.
 */
// import '@/styles/globals.css'
import 'tailwindcss/tailwind.css'

import type { Parameters } from '@storybook/addons'
import type { DecoratorFn } from '@storybook/react'

import { Providers } from '@/modules/providers/Providers'
import {
  startMockServiceWorker,
  withMockServiceWorker,
} from '~/stories/addons/mockServiceWorker'
import { withNextRouter } from '~/stories/addons/nextRouter'
import { withProviders } from '~/stories/addons/providers'

/**
 * Global storybook decorators.
 *
 * Note that order matters: the last decorator ends up highest in the tree.
 */
export const decorators: Array<DecoratorFn> = [
  withMockServiceWorker,
  withProviders,
  withNextRouter,
]

/**
 * Global storybook parameters.
 */
export const parameters: Parameters = {
  layout: 'centered',
  options: {
    storySort: {
      method: 'alphabetical',
    },
  },
  actions: { argTypesRegex: '^on[A-Z].*' },
  nextRouter: {},
  providers: {
    component: Providers,
  },
}

/**
 * Start mock service worker with default API endpoint handlers.
 */
startMockServiceWorker(async () => (await import('@/api/mocks/worker')).worker)
