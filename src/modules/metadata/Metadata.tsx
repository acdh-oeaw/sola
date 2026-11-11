import Head from "next/head";
import type { JSX } from "react";

import { useCurrentLocale } from "@/lib/i18n/useCurrentLocale";
import { useSiteMetadata } from "@/modules/metadata/useSiteMetadata";

export interface MetadataProps {
	title?: string;
	description?: string;
	canonicalUrl?: string;
	languageAlternates?: Array<{ hrefLang: string; href: string }>;
	noindex?: boolean;
	nofollow?: boolean;
}

/** Page metadata for SEO and social previews. */
export function Metadata({
	title,
	description,
	canonicalUrl,
	languageAlternates = [],
	noindex = false,
	nofollow = false,
}: MetadataProps): JSX.Element {
	const locale = useCurrentLocale();
	const site = useSiteMetadata();
	const pageTitle = [title, site.title].filter(Boolean).join(" | ");
	const pageDescription = description ?? site.description;
	const robots = [noindex && "noindex", nofollow && "nofollow"].filter(Boolean).join(",");

	return (
		<Head>
			<title key="title">{pageTitle}</title>
			<meta key="description" content={pageDescription} name="description" />
			{canonicalUrl ? <link key="canonical" href={canonicalUrl} rel="canonical" /> : null}
			{languageAlternates.map(({ hrefLang, href }) => {
				return (
					<link key={`alternate:${hrefLang}`} href={href} hrefLang={hrefLang} rel="alternate" />
				);
			})}
			{robots ? <meta key="robots" content={robots} name="robots" /> : null}
			{canonicalUrl ? <meta key="og:url" content={canonicalUrl} property="og:url" /> : null}
			<meta key="og:title" content={pageTitle} property="og:title" />
			<meta key="og:description" content={pageDescription} property="og:description" />
			<meta key="og:type" content="website" property="og:type" />
			<meta key="og:site_name" content={site.title} property="og:site_name" />
			<meta key="og:locale" content={locale} property="og:locale" />
			{languageAlternates
				.filter(({ hrefLang }) => {
					return hrefLang !== locale;
				})
				.map(({ hrefLang }) => {
					return (
						<meta
							key={`og:locale:alternate:${hrefLang}`}
							content={hrefLang}
							property="og:locale:alternate"
						/>
					);
				})}
			<meta key="og:image" content={site.image.src} property="og:image" />
			{site.image.alt ? (
				<meta key="og:image:alt" content={site.image.alt} property="og:image:alt" />
			) : null}
			<meta key="twitter:card" content="summary" name="twitter:card" />
			<meta key="twitter:site" content={site.title} name="twitter:site" />
		</Head>
	);
}
