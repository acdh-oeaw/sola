import { useRouter } from 'next/router'
import { createContext, useMemo } from 'react'

import type { SiteLocale } from '@/lib/getCurrentLocale'
import { getCurrentLocale } from '@/lib/getCurrentLocale'
import metadata from '~/config/metadata.json'

export type SiteMetadata = typeof metadata[SiteLocale]

export const SiteMetadataContext = createContext<SiteMetadata | null>(null)

export interface SiteMetadataProviderProps {
  children: JSX.Element
}

/**
 * Provides site metadata for the currently active locale.
 */
export function SiteMetadataProvider(
  props: SiteMetadataProviderProps,
): JSX.Element {
  const router = useRouter()
  const locale = getCurrentLocale(router)

  const siteMetadata = useMemo(() => metadata[locale], [locale])

  return (
    <SiteMetadataContext.Provider value={siteMetadata}>
      {props.children}
    </SiteMetadataContext.Provider>
  )
}
