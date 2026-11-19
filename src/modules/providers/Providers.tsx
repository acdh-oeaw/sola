import { keepPreviousData, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/router";
import type { JSX } from "react";
import { I18nProvider } from "react-aria-components";

import { SiteMetadataProvider } from "@/modules/metadata/SiteMetadataContext";

/**
 * React Query client.
 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: Infinity,
			staleTime: Infinity,
			placeholderData: keepPreviousData,
			refetchOnMount: false,
			refetchOnWindowFocus: false,
		},
	},
});

export interface ProvidersProps {
	children: JSX.Element;
}

/**
 * Context providers.
 */
export function Providers(props: ProvidersProps): JSX.Element {
	const { locale } = useRouter();

	return (
		<SiteMetadataProvider>
			<QueryClientProvider client={queryClient}>
				<I18nProvider locale={locale}>{props.children}</I18nProvider>
			</QueryClientProvider>
		</SiteMetadataProvider>
	);
}
