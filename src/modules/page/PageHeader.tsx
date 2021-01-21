import Link from 'next/link'
import { useRouter } from 'next/router'

import type { SiteLocale } from '@/lib/i18n/getCurrentLocale'
import { useCurrentLocale } from '@/lib/i18n/useCurrentLocale'
import navigation from '~/config/navigation.json'

/**
 * Page header.
 */
export function PageHeader(): JSX.Element {
  const locale = useCurrentLocale()

  const links = (navigation as Record<
    SiteLocale,
    Array<{ path: string; label: string }>
  >)[locale]

  return (
    <header className="flex bg-white" style={{ gridArea: 'header' }}>
      <nav
        className="grid flex-1"
        style={{ gridTemplateColumns: 'var(--sidepanel-width, 240px) 1fr' }}
      >
        <Link href="/">
          <a className="z-20 flex items-center px-6 text-2xl font-extrabold tracking-wide text-white transition bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus-visible:bg-yellow-500">
            SOLA
          </a>
        </Link>
        <div className="z-10 flex items-center justify-end px-6 space-x-6 shadow">
          <ul className="flex items-center space-x-4">
            {links.map(({ path, label }) => {
              return (
                <li key={path}>
                  <Link href={path}>
                    <a className="px-2 py-2 text-sm font-medium text-gray-700 transition border-b border-transparent hover:border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">
                      {label}
                    </a>
                  </Link>
                </li>
              )
            })}
          </ul>
          <LanguageToggle />
        </div>
      </nav>
    </header>
  )
}

function LanguageToggle() {
  const router = useRouter()
  const locale = useCurrentLocale()

  const otherLocale = locale === 'de' ? 'en' : 'de'

  return (
    <Link href={router.asPath} locale={otherLocale}>
      <a className="p-2 text-sm transition bg-yellow-400 rounded hover:bg-yellow-500 focus:outline-none focus-visible:bg-yellow-500">
        {otherLocale.toUpperCase()}
      </a>
    </Link>
  )
}
