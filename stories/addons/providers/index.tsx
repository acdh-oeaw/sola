import { makeDecorator } from '@storybook/addons'
import { Fragment } from 'react'

const PARAM_KEY = 'providers'

/**
 * Wraps story in context providers.
 */
export const withProviders = makeDecorator({
  name: 'withProviders',
  parameterName: PARAM_KEY,
  skipIfNoParametersOrOptions: true,
  wrapper: (Story, context, { parameters }) => {
    const Providers = parameters.component ?? Fragment

    return (
      <Providers>
        <Story {...context} />
      </Providers>
    )
  },
})
