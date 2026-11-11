/** @typedef {import("typescript-eslint").Config} Config */

import baseConfig from "@acdh-oeaw/eslint-config";
import nodeConfig from "@acdh-oeaw/eslint-config-node";
import reactConfig from "@acdh-oeaw/eslint-config-react";
import nextPlugin from "@next/eslint-plugin-next";
import { defineConfig } from "eslint/config";
import gitignore from "eslint-config-flat-gitignore";
import tailwindcss from "eslint-plugin-better-tailwindcss";

/** @type {Config} */
const config = defineConfig(
	gitignore({ strict: false }),
	baseConfig,
	reactConfig,
	nextPlugin.configs["core-web-vitals"],
	{
		plugins: { "better-tailwindcss": tailwindcss },
		settings: {
			"better-tailwindcss": { entryPoint: "src/styles/globals.css", variables: [] },
		},
		rules: {
			"better-tailwindcss/no-unknown-classes": [
				"error",
				{
					ignore: [
						"main-panel",
						"details-panel",
						"timeline-canvas",
						"timeline-x-axis-top",
						"canvas",
						"x-axis-top",
						"x-axis-bottom",
						"y-axis-left",
						"y-axis-right",
					],
				},
			],
			"better-tailwindcss/no-conflicting-classes": "error",
		},
	},
	{
		rules: {
			"arrow-body-style": ["error", "always"],
			"no-restricted-imports": [
				"error",
				{
					name: "next/image",
					message: "Please use `@/components/image` or `@/components/server-image` instead.",
				},
				{
					name: "next/link",
					message: "Please use `@/components/link` instead.",
				},
				{
					name: "next/navigation",
					importNames: ["redirect", "permanentRedirect", "useRouter", "usePathname"],
					message: "Please use `@/lib/i18n/navigation` instead.",
				},
				{
					name: "next/router",
					message: "Please use `@/lib/i18n/navigation` instead.",
				},
			],
			"no-restricted-syntax": [
				"error",
				{
					selector: 'MemberExpression[computed!=true][object.name="process"][property.name="env"]',
					message: "Please use `@/config/env.config` instead.",
				},
			],
			// "@typescript-eslint/explicit-module-boundary-types": "error",
			"@typescript-eslint/require-array-sort-compare": "error",
			// "@typescript-eslint/strict-boolean-expressions": "error",
			"react/jsx-sort-props": ["error", { reservedFirst: true }],
		},
	},
	{
		files: ["db/**/*.ts", "lib/server/**/*.ts", "**/_actions/**/*.ts"],
		extends: [nodeConfig],
	},
);

export default config;
