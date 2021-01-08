import { action } from '@storybook/addon-actions'
import { makeDecorator } from '@storybook/addons'
import { RouterContext } from 'next/dist/next-server/lib/router-context'
import type { NextRouter } from 'next/router'

RouterContext.displayName = 'RouterContext'

const PARAM_KEY = 'nextRouter'

/**
 * Adds decorator to wrap story in a Next.js router context.
 *
 * Can be configured per-story via `nextRouter` parameter.
 *
 * @example
 * ```ts
 * export default {
 *   title: 'Link',
 *   component: Link,
 *   parameters: {
 *     nextRouter: {
 *       asPath: '/search?categories=one&categories=two',
 *       pathname: '/search'
 *       query: { categories: ['one', 'two'] }
 *     }
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * export const Default = (args) => <Link {...args} />
 * Default.parameters: {
 *   nextRouter: {
 *     asPath: '/search?categories=one&categories=two',
 *     pathname: '/search'
 *     query: { categories: ['one', 'two'] }
 *   }
 * }
 * ```
 */
export const withNextRouter = makeDecorator({
  name: 'withNextRouter',
  parameterName: PARAM_KEY,
  skipIfNoParametersOrOptions: true,
  wrapper: (Story, context, { parameters }) => {
    return (
      <RouterContext.Provider value={{ ...mockRouter, ...parameters }}>
        <Story {...context} />
      </RouterContext.Provider>
    )
  },
})

export const mockRouter: NextRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  isReady: true,
  locale: 'en',
  locales: ['en'],
  defaultLocale: 'en',
  push(...args) {
    action('nextRouter.push')(...args)
    return Promise.resolve(true)
  },
  replace(...args) {
    action('nextRouter.replace')(...args)
    return Promise.resolve(true)
  },
  reload(...args) {
    action('nextRouter.reload')(...args)
  },
  back(...args) {
    action('nextRouter.back')(...args)
  },
  prefetch(...args) {
    action('nextRouter.prefetch')(...args)
    return Promise.resolve()
  },
  beforePopState(...args) {
    action('nextRouter.beforePopState')(...args)
  },
  events: {
    on(...args) {
      action('nextRouter.events.on')(...args)
    },
    off(...args) {
      action('nextRouter.events.off')(...args)
    },
    emit(...args) {
      action('nextRouter.events.emit')(...args)
    },
  },
  isFallback: false,
}

/* eslint-disable-next-line */
if (module && module.hot && module.hot.decline) {
  module.hot.decline()
}
