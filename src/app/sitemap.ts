import { groupBy } from "@acdh-oeaw/lib";
import type { MetadataRoute } from "next";

import { getContentPostIds } from "@/api/content";
import { type SolaListEntity, getSolaEntities } from "@/api/sola/client";
import { routing } from "@/i18n/routing";
import { createCanonicalUrl } from "@/modules/metadata/createCanonicalUrl";

const { locales } = routing;

/** Static pages, without imprint and not-found pages. */
const pages = ["/", "/about", "/dataset", "/posts", "/team"];

/** Fetch everything from the list endpoint in one request. */
const query = { limit: 10_000 };

/** Generate on request, so the sitemap includes SOLA entities added after the build. */
export const dynamic = "force-dynamic";

/**
 * Lists the canonical URL of every page.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const urls: Array<string> = [];

	for (const locale of locales) {
		for (const page of pages) {
			urls.push(createCanonicalUrl(locale, page));
		}
	}

	/** Dynamic post pages. */
	for (const locale of locales) {
		const ids = await getContentPostIds(locale);
		for (const id of ids) {
			urls.push(createCanonicalUrl(locale, `/posts/${id}`));
		}
	}

	/** Pages for SOLA entities. Only fetch for one locale, since ids and types are the same. */
	const data = await getSolaEntities({ query, locale: locales[0]! });

	const grouped = groupBy(data.results, (result) => {
		return result.type;
	});

	const entities: Array<SolaListEntity> = [
		...(grouped.Event ?? []),
		...(grouped.Institution ?? []),
		...(grouped.Passage ?? []),
		...(grouped.Person ?? []),
		...(grouped.Place ?? []),
		...(grouped.Publication ?? []),
	];

	for (const locale of locales) {
		for (const entity of entities) {
			urls.push(createCanonicalUrl(locale, "/dataset", { id: entity.id, type: entity.type }));
		}
	}

	return urls.map((url) => {
		return { url: escapeXml(url) };
	});
}

/**
 * Next.js inserts sitemap URLs into the XML as is, so `&` in search params must be escaped.
 * Remove once Next.js escapes values itself, otherwise they would be escaped twice.
 *
 * @see https://github.com/vercel/next.js/issues/77340
 */
function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}
