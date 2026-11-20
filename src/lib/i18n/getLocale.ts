import { notFound } from "next/navigation";

import { type SiteLocale, isSupportedLocale } from "@/lib/i18n/getCurrentLocale";

/**
 * Returns the locale from route params, or renders the not-found page for unsupported locales.
 */
export async function getLocale(params: Promise<{ locale: string }>): Promise<SiteLocale> {
	const { locale } = await params;

	if (!isSupportedLocale(locale)) notFound();

	return locale;
}
