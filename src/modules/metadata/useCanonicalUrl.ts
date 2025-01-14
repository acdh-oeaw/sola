import type { NextRouter } from "next/router";
import { useRouter } from "next/router";
import { useMemo } from "react";

import { addQueryParams } from "@/lib/url/addQueryParams";
import { createUrlFromPath } from "@/lib/url/createUrlFromPath";
import { useSiteMetadata } from "@/modules/metadata/useSiteMetadata";

/**
 * Returns the canonical URL for the current route's pathname.
 *
 * @param query Optionally include specified query params. By default,
 * only the pathname is used for the canonical URL, and all query params
 * are removed.
 */
export function useCanonicalUrl(query?: NextRouter["query"]): string {
	const router = useRouter();
	const { url: siteUrl } = useSiteMetadata();

	const canonicalUrl = useMemo(() => {
		const { pathname } = createUrlFromPath(router.asPath);
		const url = createUrlFromPath([router.locale, pathname].join(""), siteUrl);

		if (query !== undefined) {
			addQueryParams(url, query);
		}

		return url.toString();
	}, [router, siteUrl, query]);

	return canonicalUrl;
}
