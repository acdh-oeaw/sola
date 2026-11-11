import "@/styles/globals.css";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Head from "next/head";
import type { JSX } from "react";
import { Fragment, useEffect } from "react";

import { useSolaEntities, useSolaFilterOptions } from "@/lib/sola/hooks";
import { ErrorBoundary } from "@/modules/error/ErrorBoundary";
import { DefaultPageLayout } from "@/modules/layouts/DefaultPageLayout";
import { Providers } from "@/modules/providers/Providers";

const inter = Inter({ subsets: ["latin"], display: "optional" });

/**
 * Application shell.
 */
export default function App({ Component, pageProps, router }: AppProps): JSX.Element {
	const { locale, defaultLocale } = router;

	return (
		<Fragment>
			<Head>
				<style key="font-inter">{`
					html {
						--font-inter: ${inter.style.fontFamily};
					}
				`}</style>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</Head>
			<ErrorBoundary>
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
