import type { SiteLocale } from '@/lib/i18n/getCurrentLocale'

const dateFormatter = {
  en: Intl.DateTimeFormat('en'),
  de: Intl.DateTimeFormat('de'),
}

export function formatDate(date: Date | number | string, locale: SiteLocale): string {
  return dateFormatter[locale].format(typeof date === 'string' ? new Date(date) : date)
}
