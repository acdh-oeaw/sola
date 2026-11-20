import { defineRouting } from "next-intl/routing";

import site from "~/config/site.json" with { type: "json" };

export const routing = defineRouting({
	locales: site.locales as Array<"de" | "en">,
	defaultLocale: site.defaultLocale as "en",
	/** All URLs include the locale (`/en/about`), matching the canonical URLs indexed so far. */
	localePrefix: "always",
	/** Alternate links are rendered as `<link>` elements, see `createMetadata`. */
	alternateLinks: false,
});
