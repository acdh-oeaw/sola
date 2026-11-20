import { type NextRequest, NextResponse } from "next/server";

import site from "~/config/site.json" with { type: "json" };

const { defaultLocale, locales } = site;

/** Same cookie name as the Pages Router's built-in i18n routing, to respect existing choices. */
const localeCookie = "NEXT_LOCALE";

/**
 * Locale routing, matching the Pages Router's built-in i18n behaviour:
 *
 * - Paths with a locale prefix (`/de/about`, `/en/about`) are served as is.
 * - Paths without a locale prefix are served in the default locale, via a rewrite, so URLs for
 *   the default locale stay unprefixed (`/about`).
 * - Visitors to `/` whose browser prefers another supported locale are redirected to it, unless
 *   they have chosen a locale before (`NEXT_LOCALE` cookie).
 */
export function proxy(request: NextRequest): NextResponse {
	const { pathname } = request.nextUrl;

	const segment = pathname.split("/")[1];
	if (segment !== undefined && locales.includes(segment)) {
		return NextResponse.next();
	}

	/** Only detect on full page loads, not on client-side navigations. */
	if (pathname === "/" && !request.headers.has("rsc")) {
		const preferredLocale = getPreferredLocale(request);

		if (preferredLocale !== defaultLocale) {
			const url = request.nextUrl.clone();
			url.pathname = `/${preferredLocale}`;
			return NextResponse.redirect(url);
		}
	}

	const url = request.nextUrl.clone();
	url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
	return NextResponse.rewrite(url);
}

function getPreferredLocale(request: NextRequest): string {
	const cookie = request.cookies.get(localeCookie)?.value;
	if (cookie !== undefined && locales.includes(cookie)) return cookie;

	const header = request.headers.get("accept-language");
	if (header === null) return defaultLocale;

	const languages = header
		.split(",")
		.map((entry) => {
			const [tag = "", ...params] = entry.trim().split(";");
			const q = params.find((param) => {
				return param.trim().startsWith("q=");
			});
			return { language: tag.split("-")[0]!.toLowerCase(), q: q ? Number(q.trim().slice(2)) : 1 };
		})
		.filter(({ q }) => {
			return !Number.isNaN(q) && q > 0;
		})
		.sort((a, b) => {
			return b.q - a.q;
		});

	return (
		languages.find(({ language }) => {
			return locales.includes(language);
		})?.language ?? defaultLocale
	);
}

export const config = {
	/** Skip Next.js internals and files with an extension (`/sitemap.xml`, `/assets/...`). */
	matcher: ["/((?!_next/|.*\\.).*)"],
};
