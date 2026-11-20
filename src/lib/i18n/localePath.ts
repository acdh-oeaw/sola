import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import site from "~/config/site.json" with { type: "json" };

const { defaultLocale, locales } = site;

/**
 * Prefixes a path with the locale, except for the default locale, which is served without prefix.
 */
export function createLocalePath(locale: SiteLocale, path: string): string {
	if (locale === defaultLocale) return path;
	if (path === "/") return `/${locale}`;
	return `/${locale}${path}`;
}

/**
 * Removes a leading locale segment from a pathname.
 *
 * Pages for the default locale are served at unprefixed URLs via a rewrite in `proxy.ts`, so the
 * pathname can differ between server (`/en/about`) and browser (`/about`). Stripping the locale
 * gives the same result for both.
 */
export function stripLocale(pathname: string): string {
	const [, segment, ...rest] = pathname.split("/");
	if (segment === undefined || !locales.includes(segment)) return pathname;
	return `/${rest.join("/")}`;
}
