import { defaultLocale, locales } from '~/config/site.json'

/**
 * Unfortunately, typescript currently does not support importing json modules `as const`,
 * so we need to manually cast here instead of `typeof locales[number]`.
 *
 * @see https://github.com/microsoft/TypeScript/issues/32063
 */
export type SiteLocale = 'de' | 'en'

export function getCurrentLocale(locale: string | undefined): SiteLocale {
  if (locale === undefined || !isSupportedLocale(locale)) {
    return defaultLocale as SiteLocale
  }

  return locale
}

function isSupportedLocale(locale: string): locale is SiteLocale {
  return locales.includes(locale)
}
