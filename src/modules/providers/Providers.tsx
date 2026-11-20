"use client";

import {
	environmentManager,
	keepPreviousData,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useLocale } from "next-intl";
import type { JSX, ReactNode } from "react";
import { I18nProvider } from "react-aria-components";

import { useSolaEntities, useSolaFilterOptions } from "@/lib/sola/hooks";

function createQueryClient() {
	return new QueryClient({
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
}

let browserQueryClient: QueryClient | undefined;

/**
 * Returns a new query client per request on the server, so cached data is not shared between
 * requests, and a single query client in the browser.
 */
function getQueryClient() {
	if (environmentManager.isServer()) return createQueryClient();
	return (browserQueryClient ??= createQueryClient());
}

export interface ProvidersProps {
	children: ReactNode;
}

/**
 * Context providers.
 */
export function Providers(props: ProvidersProps): JSX.Element {
	const locale = useLocale();
	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			<I18nProvider locale={locale}>{props.children}</I18nProvider>
			<Prefetch />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}

/**
 * Start fetching SOLA entities early to reduce wait on `/dataset` page.
 */
function Prefetch() {
	useSolaEntities();
	useSolaFilterOptions();
	return null;
}
