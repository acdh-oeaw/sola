import { useInteractionModality } from '@react-aria/interactions'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Fragment } from 'react'

import type { SiteLocale } from '@/lib/i18n/getCurrentLocale'
import { useCurrentLocale } from '@/lib/i18n/useCurrentLocale'
import { Menu as MenuIcon } from '@/modules/icons/Menu'
import { Item as MenuItem, MenuButton } from '@/modules/ui/MenuButton'
import navigation from '~/config/navigation.json' assert { type: 'json' }

const labels = {
  en: {
    menu: 'Menu',
    navigationMenu: 'Navigation menu',
  },
  de: {
    menu: 'Menü',
    navigationMenu: 'Navigationsmenü',
  },
}

/**
 * Page header.
 */
export function PageHeader(): JSX.Element {
  const router = useRouter()
  const locale = useCurrentLocale()

  const links = (navigation as Record<SiteLocale, Array<{ path: string; label: string }>>)[locale]

  return (
    <header className="flex bg-white" style={{ gridArea: 'header' }}>
      <nav
        className="grid flex-1"
        style={{ gridTemplateColumns: 'var(--sidepanel-width, 240px) 1fr' }}
      >
        <Link
          href="/"
          aria-current={router.pathname === '/' ? 'page' : undefined}
          className="z-20 flex items-center px-6 text-2xl font-extrabold tracking-wide text-white transition bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus-visible:bg-yellow-500"
        >
          SOLA
        </Link>
        <div className="z-10 flex items-center justify-end px-6 space-x-4 shadow xs:space-x-6">
          <ul className="hidden space-x-4 lg:flex lg:items-center">
            {links.map(({ path, label }) => {
              const isCurrent = router.pathname === path
              return (
                <li key={path}>
                  <Link
                    href={path}
                    aria-current={isCurrent ? 'page' : undefined}
                    className="inline-block px-2 py-2 text-sm font-medium text-center text-gray-700 transition border-b border-transparent hover:border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
          <MobileNav links={links} t={labels[locale]} />
          <LanguageToggle />
        </div>
      </nav>
    </header>
  )
}

function MobileNav({
  links,
  t,
}: {
  links: Array<{ path: string; label: string }>
  t: typeof labels[SiteLocale]
}) {
  const router = useRouter()

  // FIXME: required to set uo global focus handlers once
  // @see https://github.com/adobe/react-spectrum/issues/1378
  useInteractionModality()

  return (
    <div className="lg:hidden">
      <MenuButton
        onAction={(key) => {
          router.push(String(key))
        }}
        menuLabel={t.navigationMenu}
        label={
          <Fragment>
            <MenuIcon />
            <span className="text-sm font-medium">{t.menu}</span>
          </Fragment>
        }
      >
        {links.map(({ path, label }) => {
          const isCurrent = router.pathname === path
          const props = {
            elementType: 'a',
            href: path,
            'aria-current': isCurrent ? 'page' : undefined,
          }
          return (
            <MenuItem key={path} {...props}>
              {label}
            </MenuItem>
          )
        })}
      </MenuButton>
    </div>
  )
}

function LanguageToggle() {
  const router = useRouter()
  const locale = useCurrentLocale()

  const otherLocale = locale === 'de' ? 'en' : 'de'

  return (
    <Link
      href={router.asPath}
      locale={otherLocale}
      className="p-2 text-sm font-medium transition bg-yellow-400 rounded hover:bg-yellow-500 focus:outline-none focus-visible:bg-yellow-500"
    >
      {otherLocale.toUpperCase()}
    </Link>
  )
}
