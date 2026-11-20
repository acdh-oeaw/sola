"use client";

import {
	environmentManager,
	keepPreviousData,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { type Locale, useLocale } from "next-intl";
import { type JSX, type ReactNode, useEffect } from "react";
import { I18nProvider } from "react-aria-components";

import {
	solaEntitiesQueryOptions,
	solaPassageTopicsQueryOptions,
	solaPassageTypesQueryOptions,
} from "@/lib/sola/hooks";

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
			<Prefetch locale={locale} queryClient={queryClient} />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}

function noop() {
	/** Errors are handled by the queries using the data. */
}

/**
 * Start fetching SOLA entities and filter options early to reduce wait on `/dataset` page.
 */
function Prefetch({ locale, queryClient }: { locale: Locale; queryClient: QueryClient }) {
	useEffect(() => {
		queryClient.query(solaEntitiesQueryOptions(locale)).catch(noop);
		queryClient.query(solaPassageTopicsQueryOptions(locale)).catch(noop);
		queryClient.query(solaPassageTypesQueryOptions(locale)).catch(noop);
	}, [locale, queryClient]);

	return null;
}
