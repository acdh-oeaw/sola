import { keepPreviousData, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type NextRouter, useRouter } from "next/router";
import type { JSX } from "react";
import { I18nProvider, RouterProvider } from "react-aria-components";

import { SiteMetadataProvider } from "@/modules/metadata/SiteMetadataContext";

declare module "react-aria-components" {
	interface RouterConfig {
		routerOptions: NonNullable<Parameters<NextRouter["push"]>[2]>;
	}
}

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
	const router = useRouter();

	return (
		<SiteMetadataProvider>
			<QueryClientProvider client={queryClient}>
				<I18nProvider locale={router.locale}>
					<RouterProvider
						navigate={(href, options) => {
							void router.push(href, undefined, options);
						}}
						useHref={(href) => {
							/** Mirror `next/link`, which prefixes paths with the locale unless it is the default. */
							const locale = router.locale;
							if (locale == null || locale === router.defaultLocale || !href.startsWith("/")) {
								return href;
							}
							return href === "/" ? `/${locale}` : `/${locale}${href}`;
						}}
					>
						{props.children}
					</RouterProvider>
				</I18nProvider>
			</QueryClientProvider>
		</SiteMetadataProvider>
	);
}
