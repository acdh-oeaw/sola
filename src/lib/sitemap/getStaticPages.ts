import { globby } from "globby";
import path from "path";

const pagesFolder = path.join(process.cwd(), "src", "pages");

export async function getStaticPages(): Promise<Array<string>> {
	const fileNames = await globby([
		path.join(pagesFolder, "**/*.tsx"),
		"!" + path.join(pagesFolder, "_*.tsx"),
		"!" + path.join(pagesFolder, "api"),
		"!" + path.join(pagesFolder, "404.page.tsx"),
		"!" + path.join(pagesFolder, "500.page.tsx"),
		"!" + path.join(pagesFolder, "imprint.page.tsx"),
	]);

	const pages: Array<string> = [];
	fileNames.forEach((fileName) => {
		const path = fileName
			.slice(pagesFolder.length)
			.replace(/\.page.tsx$/, "")
			.replace(/\/index$/, "");
		/** Exclude dynamic pages. */
		if (!path.includes("[")) {
			pages.push(path);
		}
	});

	return pages;
}
