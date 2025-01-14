import type { NextRouter } from "next/router";
import { useRouter } from "next/router";
import { useMemo } from "react";

import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import { addQueryParams } from "@/lib/url/addQueryParams";
import { createUrlFromPath } from "@/lib/url/createUrlFromPath";
import { useSiteMetadata } from "@/modules/metadata/useSiteMetadata";

/**
 * Returns URLs to be used in `hreflang` attributes.
 *
 * @param query Optionally include specified query params. By default,
 * only the pathname is used for the canonical URL, and all query params
 * are removed.
 */
export function useAlternateUrls(
	query?: NextRouter["query"],
): Array<{ hrefLang: SiteLocale; href: string }> {
	const router = useRouter();
	const { url: siteUrl } = useSiteMetadata();

	const urls = useMemo(() => {
		if (router.locales === undefined) return [];

		const locales = router.locales as Array<SiteLocale>;
		return locales.map((locale) => {
			const { pathname } = createUrlFromPath(router.asPath);
			const url = createUrlFromPath([locale, pathname].join(""), siteUrl);

			if (query !== undefined) {
				addQueryParams(url, query);
			}

			return { hrefLang: locale, href: url.toString() };
		});
	}, [router, siteUrl, query]);

	return urls;
}
