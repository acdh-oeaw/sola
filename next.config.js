const metadata = require('./config/metadata.json')
const createBundleAnalyzer = require('@next/bundle-analyzer')

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const locales = Object.keys(metadata)
const [defaultLocale] = locales

const nextConfig = {
  i18n: {
    locales,
    defaultLocale,
    localeDetection: true,
  },
  images: {},
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    return [{ source: '/sitemap.xml', destination: '/api/sitemap' }]
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
}

const plugins = [withBundleAnalyzer]

module.exports = plugins.reduce((acc, plugin) => plugin(acc), nextConfig)
