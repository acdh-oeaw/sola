import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { JSX, ReactNode } from "react";

import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import { getLocale } from "@/lib/i18n/getLocale";
import { DefaultPageLayout } from "@/modules/layouts/DefaultPageLayout";
import { siteMetadata } from "@/modules/metadata/siteMetadata";
import { Providers } from "@/modules/providers/Providers";
import site from "~/config/site.json" with { type: "json" };

const inter = Inter({ subsets: ["latin"], display: "optional", variable: "--font-inter" });

export function generateStaticParams(): Array<{ locale: SiteLocale }> {
	return (site.locales as Array<SiteLocale>).map((locale) => {
		return { locale };
	});
}

/** Unsupported locales render `global-not-found.tsx`. */
export const dynamicParams = false;

export const metadata: Metadata = siteMetadata;

interface LocaleLayoutProps {
	children: ReactNode;
	params: Promise<{ locale: string }>;
}

/**
 * Application shell.
 */
export default async function LocaleLayout(props: LocaleLayoutProps): Promise<JSX.Element> {
	const locale = await getLocale(props.params);

	return (
		<html lang={locale} className={inter.variable}>
			<body>
				<Providers locale={locale}>
					<DefaultPageLayout locale={locale}>{props.children}</DefaultPageLayout>
				</Providers>
			</body>
		</html>
	);
}
