import type { NextConfig } from "next";

import metadata from "~/config/metadata.json";

const locales = Object.keys(metadata);
const defaultLocale = locales[0]!;

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
