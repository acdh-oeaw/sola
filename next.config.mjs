import createBundleAnalyzer from '@next/bundle-analyzer'

import metadata from './config/metadata.json' assert { type: 'json' }

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env['BUNDLE_ANALYZER'] === 'enabled',
})

const locales = Object.keys(metadata)
const defaultLocale = /** @type {string} */ (locales[0])

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['.'],
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/assets/fonts/inter-var-latin.woff2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  i18n: {
    locales,
    defaultLocale,
  },
  output: 'standalone',
  pageExtensions: ['api.ts', 'page.tsx'],
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    return [{ source: '/sitemap.xml', destination: '/api/sitemap' }]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

const plugins = [withBundleAnalyzer]

export default plugins.reduce((acc, plugin) => {
  return plugin(acc)
}, nextConfig)
