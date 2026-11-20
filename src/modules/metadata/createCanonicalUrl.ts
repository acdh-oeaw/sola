import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import { type QueryParams, addQueryParams } from "@/lib/url/addQueryParams";
import site from "~/config/site.json" with { type: "json" };

const { url: siteUrl } = site;

/**
 * Returns the canonical URL for a page path in the given locale.
 *
 * Canonical URLs always include the locale, also for the default locale.
 */
export function createCanonicalUrl(locale: SiteLocale, path: string, query?: QueryParams): string {
	const url = new URL(`${locale}${path}`, siteUrl);

	if (query !== undefined) {
		addQueryParams(url, query);
	}

	return url.toString();
}
