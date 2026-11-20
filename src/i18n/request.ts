import { type Locale, hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";

import { routing } from "@/i18n/routing";

/**
 * Prefers an explicitly passed locale, then the `[locale]` root param. Outside the `[locale]`
 * segment (i.e. `global-not-found`) there is no root param, so use the default locale.
 */
async function resolveLocale(requestLocale: string | undefined): Promise<Locale> {
	const locale = requestLocale ?? (await rootParams.locale()) ?? routing.defaultLocale;

	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	return locale;
}

export default getRequestConfig(async (params) => {
	const locale = await resolveLocale(params.locale);

	return {
		locale,
		messages: ((await import(`../../messages/${locale}.po`)) as { default: Record<string, string> })
			.default,
	};
});
