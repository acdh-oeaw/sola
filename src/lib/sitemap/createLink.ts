import type { Element } from "xast";
import { x } from "xastscript";

import { addQueryParams } from "@/lib/url/addQueryParams";
import site from "~/config/site.json" assert { type: "json" };

const { url: baseUrl } = site;

export function createLink(route: string, query?: Record<string, unknown>): Element {
	const url = new URL(route, baseUrl);
	addQueryParams(url, query);
	return x("url", [x("loc", url.toString())]);
}
