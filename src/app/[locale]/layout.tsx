import "@/styles/globals.css";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Inter } from "next/font/google";
import type { JSX, ReactNode } from "react";

import { routing } from "@/i18n/routing";
import { DefaultPageLayout } from "@/modules/layouts/DefaultPageLayout";
import { siteMetadata } from "@/modules/metadata/siteMetadata";
import { Providers } from "@/modules/providers/Providers";

const inter = Inter({ subsets: ["latin"], display: "optional", variable: "--font-inter" });

export function generateStaticParams(): Array<{ locale: string }> {
	return routing.locales.map((locale) => {
		return { locale };
	});
}

/** Unsupported locales render `global-not-found.tsx`. */
export const dynamicParams = false;

export const metadata: Metadata = siteMetadata;

/**
 * Application shell. The locale is read from root params, see `i18n/request.ts`.
 */
export default async function LocaleLayout({
	children,
}: {
	children: ReactNode;
}): Promise<JSX.Element> {
	const locale = await getLocale();

	return (
		<html lang={locale} className={inter.variable}>
			<body>
				<NextIntlClientProvider>
					<Providers>
						<DefaultPageLayout locale={locale}>{children}</DefaultPageLayout>
					</Providers>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
