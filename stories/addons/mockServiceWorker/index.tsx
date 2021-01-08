import { makeDecorator } from '@storybook/addons'
import type { SetupWorkerApi } from 'msw'

const PARAM_KEY = 'mockServiceWorker'

let worker: SetupWorkerApi | undefined = undefined

/**
 * Adds mocked endpoints to msw before rendering the story.
 *
 * Can be configured per-story via `mockServiceWorker` parameter.
 *
 * @example
 * ```ts
 * export default {
 *   title: 'Link',
 *   component: Link,
 *   parameters: {
 *     mockServiceWorker: {
 *       handlers: [
 *         rest.get('/search', (request, response, context) => {
 *           return response(context.json({ results: [] }))
 *         })
 *       ]
 *     }
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * export const Default = (args) => <Link {...args} />
 * Default.parameters: {
 *   mockServiceWorker: {
 *     handlers: [
 *       rest.get('/search', (request, response, context) => {
 *         return response(context.json({ results: [] }))
 *       })
 *     ]
 *   }
 * }
 * ```
 */
export const withMockServiceWorker = makeDecorator({
  name: 'withMockServiceWorker',
  parameterName: PARAM_KEY,
  skipIfNoParametersOrOptions: true,
  wrapper: (Story, context, { parameters }) => {
    if (worker !== undefined && Array.isArray(parameters.handlers)) {
      worker.resetHandlers()
      worker.use(...parameters.handlers)
    }
    return <Story {...context} />
  },
})

/**
 * Starts mock service worker.
 *
 * Accepts either a function that returns a pre-configured worker,
 * or sets up a new worker instance, which can be configured via
 * the `mockServiceWorker` parameter (Global endpoint handlers shared
 * by all stories can be added to global parameters in `preview.tsx`).
 */
export async function startMockServiceWorker(
  getMockServiceWorker?: () => Promise<SetupWorkerApi>,
): Promise<void> {
  /**
   * Storybook executes this module in both bootstap phase (Node) and a story's
   * runtime (browser). However, we cannot call `setupWorker` in a Node
   * environment, so we need to check if we're in a browser.
   *
   * @see https://github.com/mswjs/examples/blob/master/examples/with-storybook/.storybook/preview.js
   */
  if (typeof global.process === 'undefined') {
    worker = getMockServiceWorker
      ? await getMockServiceWorker()
      : await (await import('msw')).setupWorker()
    worker.start()
  }
}

/* eslint-disable-next-line */
if (module && module.hot && module.hot.decline) {
  module.hot.decline()
}
