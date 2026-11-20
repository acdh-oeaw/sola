import type { Metadata } from "next";

import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import type { QueryParams } from "@/lib/url/addQueryParams";
import { createCanonicalUrl } from "@/modules/metadata/createCanonicalUrl";
import metadata from "~/config/metadata.json" with { type: "json" };
import site from "~/config/site.json" with { type: "json" };

const locales = site.locales as Array<SiteLocale>;

export interface CreateMetadataParams {
	locale: SiteLocale;
	title?: string;
	description?: string;
	/** Page path without locale prefix, used for canonical and alternate URLs. */
	path?: string;
	/** Search params to include in canonical and alternate URLs. */
	query?: QueryParams;
	noindex?: boolean;
	nofollow?: boolean;
}

/**
 * Page metadata for SEO and social previews.
 */
export function createMetadata({
	locale,
	title,
	description,
	path,
	query,
	noindex = false,
	nofollow = false,
}: CreateMetadataParams): Metadata {
	const siteMetadata = metadata[locale];
	const pageTitle = [title, siteMetadata.title].filter(Boolean).join(" | ");
	const pageDescription = description ?? siteMetadata.description;
	const canonicalUrl = path !== undefined ? createCanonicalUrl(locale, path, query) : undefined;

	return {
		title: pageTitle,
		description: pageDescription,
		alternates:
			path !== undefined
				? {
						canonical: canonicalUrl,
						languages: Object.fromEntries(
							locales.map((locale) => {
								return [locale, createCanonicalUrl(locale, path, query)];
							}),
						),
					}
				: undefined,
		robots: noindex || nofollow ? { index: !noindex, follow: !nofollow } : undefined,
		openGraph: {
			url: canonicalUrl,
			title: pageTitle,
			description: pageDescription,
			type: "website",
			siteName: siteMetadata.title,
			locale,
			alternateLocale:
				path !== undefined
					? locales.filter((alternateLocale) => {
							return alternateLocale !== locale;
						})
					: undefined,
			images: [
				{
					url: siteMetadata.image.src,
					alt: siteMetadata.image.alt.length > 0 ? siteMetadata.image.alt : undefined,
				},
			],
		},
		twitter: {
			card: "summary",
			site: siteMetadata.title,
		},
	};
}
