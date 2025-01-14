import createBundleAnalyzer from '@next/bundle-analyzer'

import metadata from './config/metadata.json' with { type: "json" };

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
  headers() {
    return Promise.resolve([
      {
        source: '/assets/fonts/inter-var-latin.woff2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ])
  },
  i18n: {
    locales,
    defaultLocale,
  },
  output: 'standalone',
  pageExtensions: ['api.ts', 'page.tsx'],
  poweredByHeader: false,
  reactStrictMode: true,
  rewrites() {
    return Promise.resolve([
      { source: '/sitemap.xml', destination: '/api/sitemap' },
      { source: '/admin', destination: '/admin/index.html' },
    ])
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

const plugins = [withBundleAnalyzer]

export default plugins.reduce((acc, plugin) => {
  return plugin(acc)
}, nextConfig)
