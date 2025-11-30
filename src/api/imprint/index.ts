import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import acdh from "~/config/acdh.json" assert { type: "json" };

const { imprintUrl, serviceId } = acdh;

function createImprintUrl(locale: SiteLocale) {
	const url = new URL(`/${String(serviceId)}`, imprintUrl);
	url.searchParams.set("locale", locale);
	return url;
}

export async function getImprint(locale: SiteLocale): Promise<string> {
	const response = await fetch(String(createImprintUrl(locale)));

	if (!response.ok) {
		throw new Error("Failed to fetch imprint.");
	}

	const html = await response.text();

	return html;
}
