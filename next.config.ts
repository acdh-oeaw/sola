import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import site from "~/config/site.json" with { type: "json" };

const withNextIntl = createNextIntlPlugin({
	experimental: {
		/** Extract messages from `useExtracted` and `getExtracted` calls during dev and build. */
		extract: true,
		messages: {
			path: "./messages",
			format: "po",
			locales: site.locales,
			sourceLocale: "en",
		},
		srcPath: "./src",
	},
});

const config: NextConfig = {
	/** Compression is handled by the traefik reverse proxy, see `.github/auto-deploy-values.yaml`. */
	compress: false,
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

export default withNextIntl(config);
