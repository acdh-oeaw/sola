import type { NextConfig } from "next";

import metadata from "~/config/metadata.json";

const locales = Object.keys(metadata);
const defaultLocale = locales[0]!;

const nextConfig: NextConfig = {
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
	typescript: {
		ignoreBuildErrors: true,
	},
};

const plugins: Array<(config: NextConfig) => NextConfig> = [];

export default plugins.reduce((acc, plugin) => {
	return plugin(acc);
}, nextConfig);
