import { glob } from "node:fs/promises";
import path from "node:path";

const pagesFolder = path.join(process.cwd(), "src", "pages");

export async function getStaticPages(): Promise<Array<string>> {
	const fileNames = glob(path.join(pagesFolder, "**/*.tsx"), {
		exclude: [
			path.join(pagesFolder, "_*.tsx"),
			path.join(pagesFolder, "api"),
			path.join(pagesFolder, "404.page.tsx"),
			path.join(pagesFolder, "500.page.tsx"),
			path.join(pagesFolder, "imprint.page.tsx"),
		],
	});

	const pages: Array<string> = [];
	for await (const fileName of fileNames) {
		const path = fileName
			.slice(pagesFolder.length)
			.replace(/\.page.tsx$/, "")
			.replace(/\/index$/, "");
		/** Exclude dynamic pages. */
		if (!path.includes("[")) {
			pages.push(path);
		}
	}

	return pages;
}
