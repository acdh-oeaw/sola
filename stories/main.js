/* eslint-disable */
// import type { StorybookConfig } from '@storybook/core/types'

const config = {
  stories: ['../src/**/*.stories.@(js|jsx|mdx|ts|tsx)'],
  addons: ['@next/plugin-storybook', '@storybook/addon-essentials'],
  reactOptions: {
    fastRefresh: true,
    // strictMode: true,
  },
}

module.exports = config
