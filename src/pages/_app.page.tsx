import "tailwindcss/tailwind.css";
import "@/styles/custom-properties.css";
import "@/styles/globals.css";

import { ErrorBoundary } from "@stefanprobst/next-error-boundary";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Fragment, useEffect } from "react";
import { ReactQueryDevtools } from "react-query/devtools";

import { useSolaEntities, useSolaFilterOptions } from "@/lib/sola/hooks";
import { ClientError } from "@/modules/error/ClientError";
import { DefaultPageLayout } from "@/modules/layouts/DefaultPageLayout";
import { Providers } from "@/modules/providers/Providers";

/**
 * Application shell.
 */
export default function App({ Component, pageProps, router }: AppProps): JSX.Element {
	const { locale, defaultLocale } = router;

	return (
		<Fragment>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</Head>
			<ErrorBoundary fallback={ClientError}>
				<Providers {...pageProps}>
					<DefaultPageLayout {...pageProps}>
						<Component {...pageProps} />
					</DefaultPageLayout>
					<Prefetch />
					<ReactQueryDevtools initialIsOpen={false} />
				</Providers>
			</ErrorBoundary>
		</Fragment>
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

/**
 * Report web vitals.
 */
export function reportWebVitals(/* metric: NextWebVitalsMetric */): void {
	/** should be dispatched to an analytics service */
	// console.info(metric)
}
