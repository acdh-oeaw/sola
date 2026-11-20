import type { Locale } from "next-intl";

import acdh from "~/config/acdh.json" with { type: "json" };

const { imprintUrl, serviceId } = acdh;

function createImprintUrl(locale: Locale) {
	const url = new URL(`/${String(serviceId)}`, imprintUrl);
	url.searchParams.set("locale", locale);
	return url;
}

export async function getImprint(locale: Locale): Promise<string> {
	const response = await fetch(String(createImprintUrl(locale)));

	if (!response.ok) {
		throw new Error("Failed to fetch imprint.");
	}

	const html = await response.text();

	return html;
}
