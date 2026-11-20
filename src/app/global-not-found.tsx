import "@/styles/globals.css";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getExtracted } from "next-intl/server";
import { Inter } from "next/font/google";
import type { JSX } from "react";

import { routing } from "@/i18n/routing";
import { Error } from "@/modules/error/Error";
import { DefaultPageLayout } from "@/modules/layouts/DefaultPageLayout";
import { createMetadata } from "@/modules/metadata/createMetadata";
import { siteMetadata } from "@/modules/metadata/siteMetadata";
import { Providers } from "@/modules/providers/Providers";

const inter = Inter({ subsets: ["latin"], display: "optional", variable: "--font-inter" });

/** Rendered outside the `[locale]` segment, without root params, see `i18n/request.ts`. */
const locale = routing.defaultLocale;

/** Next.js adds `noindex` for pages with a 404 status. */
export async function generateMetadata(): Promise<Metadata> {
	const t = await getExtracted({ locale });

	return { ...siteMetadata, ...createMetadata({ locale, title: t("Page not found") }) };
}

/**
 * Not found page, for all URLs which don't match a route.
 *
 * Rendered outside of the `[locale]` layout, so this includes the page shell itself.
 */
export default async function GlobalNotFoundPage(): Promise<JSX.Element> {
	const t = await getExtracted({ locale });

	return (
		<html lang={locale} className={inter.variable}>
			<body>
				<NextIntlClientProvider locale={locale}>
					<Providers>
						<DefaultPageLayout locale={locale}>
							<main className="flex flex-col items-center justify-center">
								<Error message={t("Page not found.")} statusCode={404} />
							</main>
						</DefaultPageLayout>
					</Providers>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
