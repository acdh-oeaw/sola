import type { NextConfig } from "next";

const config: NextConfig = {
	experimental: {
		/**
		 * Render 404s for unmatched URLs with `app/global-not-found.tsx`. Not-found pages nested in
		 * the `[locale]` root layout are only rendered on the client.
		 */
		globalNotFound: true,
	},
	output: "standalone",
	poweredByHeader: false,
	reactStrictMode: true,
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
