import type { Locale } from "next-intl";

import { getPathname } from "@/i18n/navigation";
import { type QueryParams, addQueryParams } from "@/lib/url/addQueryParams";
import site from "~/config/site.json" with { type: "json" };

/**
 * Returns the canonical URL for a page path (without locale prefix) in the given locale.
 */
export function createCanonicalUrl(locale: Locale, path: string, query?: QueryParams): string {
	const url = new URL(getPathname({ locale, href: path }), site.url);

	if (query !== undefined) {
		addQueryParams(url, query);
	}

	return url.toString();
}
