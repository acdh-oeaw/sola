import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { JSX } from "react";

import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import { Error } from "@/modules/error/Error";
import { DefaultPageLayout } from "@/modules/layouts/DefaultPageLayout";
import { createMetadata } from "@/modules/metadata/createMetadata";
import { siteMetadata } from "@/modules/metadata/siteMetadata";
import site from "~/config/site.json" with { type: "json" };

const inter = Inter({ subsets: ["latin"], display: "optional", variable: "--font-inter" });

/** The not-found page does not receive route params, so it uses the default locale. */
const locale = site.defaultLocale as SiteLocale;

/** Next.js adds `noindex` for pages with a 404 status. */
export const metadata: Metadata = {
	...siteMetadata,
	...createMetadata({ locale, title: "Page not found" }),
};

/**
 * Not found page, for all URLs which don't match a route.
 *
 * Rendered outside of the `[locale]` layout, so this includes the page shell itself.
 */
export default function GlobalNotFoundPage(): JSX.Element {
	return (
		<html lang={locale} className={inter.variable}>
			<body>
				<DefaultPageLayout locale={locale}>
					<main className="flex flex-col items-center justify-center">
						<Error message="Page not found." statusCode={404} />
					</main>
				</DefaultPageLayout>
			</body>
		</html>
	);
}
