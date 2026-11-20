import type { NextConfig } from "next";

import site from "~/config/site.json" with { type: "json" };

const { defaultLocale, locales } = site;

const config: NextConfig = {
	i18n: {
		locales,
		defaultLocale,
	},
	output: "standalone",
	pageExtensions: ["api.ts", "page.tsx"],
	poweredByHeader: false,
	reactStrictMode: true,
	rewrites() {
		return Promise.resolve([{ source: "/sitemap.xml", destination: "/api/sitemap" }]);
	},
	turbopack: {
		rules: {
			"*.css": {
				loaders: ["@tailwindcss/turbopack"],
			},
		},
	},
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default config;
