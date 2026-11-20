import type { Metadata } from "next";

import site from "~/config/site.json" with { type: "json" };

/**
 * Metadata shared by all pages, including the not-found page, which is rendered outside of the
 * `[locale]` layout.
 */
export const siteMetadata: Metadata = {
	metadataBase: new URL(site.url),
	icons: {
		apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
	},
	manifest: "/site.webmanifest",
	verification: {
		google: "2E6Gsm_z7nNdzTg7J9dZ-V3QJVDpPerwRtSGF0ulrMA",
	},
};
