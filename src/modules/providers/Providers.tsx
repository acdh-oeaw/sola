import { I18nProvider } from "@react-aria/i18n";
import { OverlayProvider } from "@react-aria/overlays";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "react-query";

import { SiteMetadataProvider } from "@/modules/metadata/SiteMetadataContext";

/**
 * React Query client.
 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			cacheTime: Infinity,
			staleTime: Infinity,
			keepPreviousData: true,
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
				<I18nProvider locale={locale}>
					<OverlayProvider>{props.children}</OverlayProvider>
				</I18nProvider>
			</QueryClientProvider>
		</SiteMetadataProvider>
	);
}
