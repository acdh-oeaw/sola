import { u } from "unist-builder";
import type { Element } from "xast";
import { toXml } from "xast-util-to-xml";
import { x } from "xastscript";

export function createSitemap(links: Array<Element>): string {
	const sitemap = u("root", [
		u("instruction", { name: "xml" }, 'version="1.0" encoding="UTF-8"'),
		x("urlset", { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" }, links),
	]);
	return toXml(sitemap);
}
