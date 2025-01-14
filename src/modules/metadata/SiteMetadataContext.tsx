import { createContext, useMemo } from "react";

import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import { useCurrentLocale } from "@/lib/i18n/useCurrentLocale";
import metadata from "~/config/metadata.json" assert { type: "json" };

export type SiteMetadata = (typeof metadata)[SiteLocale];

export const SiteMetadataContext = createContext<SiteMetadata | null>(null);

export interface SiteMetadataProviderProps {
	children: JSX.Element;
}

/**
 * Provides site metadata for the currently active locale.
 */
export function SiteMetadataProvider(props: SiteMetadataProviderProps): JSX.Element {
	const locale = useCurrentLocale();

	const siteMetadata = useMemo(() => {
		return metadata[locale];
	}, [locale]);

	return (
		<SiteMetadataContext.Provider value={siteMetadata}>
			{props.children}
		</SiteMetadataContext.Provider>
	);
}
