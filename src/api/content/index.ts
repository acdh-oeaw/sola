import { promises as fs } from "fs";
import path from "path";
import toHtml from "rehype-stringify";
import withFrontmatter from "remark-frontmatter";
import fromMarkdown from "remark-parse";
import toHast from "remark-rehype";
import toMarkdown from "remark-stringify";
import stripMarkdown from "strip-markdown";
import { unified } from "unified";
import YAML from "yaml";

import { excerptMarkdown } from "@/lib/content/remark-excerpt";
import { parseYamlFrontmatter } from "@/lib/content/remark-frontmatter";
import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";

const basePath = path.resolve("content");
const dataBasePath = path.join(basePath, "data");
const pageBasePath = path.join(basePath, "pages");
const postBasePath = path.join(basePath, "posts");

const pageExtension = ".md";
const dataExtension = ".yml";
const postExtension = ".md";

/**
 * Markdown processor.
 *
 * Supports YAML frontmatter. HTML in markdown is intentionally not supported.
 */
const md = unified()
	.use(fromMarkdown)
	.use(withFrontmatter)
	.use(parseYamlFrontmatter)
	.use(toHast)
	.use(toHtml);

/**
 * Markdown processor for plain text excerpt.
 *
 * Supports YAML frontmatter.
 */
const excerpt = unified()
	.use(fromMarkdown)
	.use(withFrontmatter)
	.use(parseYamlFrontmatter)
	.use(excerptMarkdown, { maxLength: 280 })
	.use(stripMarkdown)
	.use(toMarkdown);

export interface ContentPage<T extends Record<string, unknown>> {
	id: string;
	html: string;
	metadata: T;
}

/**
 * Returns page contents as HTML and JSON metadata.
 */
export async function getContentPage<T extends Record<string, unknown>>(
	id: string,
	locale: SiteLocale,
): Promise<ContentPage<T>> {
	const filePath = path.join(pageBasePath, locale, id + pageExtension);
	const fileContents = await fs.readFile(filePath, { encoding: "utf-8" });
	const processed = await md.process(fileContents);

	const html = String(processed);
	const { frontmatter: metadata } = processed.data as {
		frontmatter: T;
	};

	return { id, html, metadata };
}

export interface ContentTeamMember {
	id: string;
	firstName: string;
	lastName: string;
	boss?: boolean;
	group: "acdh" | "current" | "former";
	title?: string;
	affiliation?: string;
	image?: string;
	email?: string;
	phone?: string;
	website?: string;
	biography: string;
}

/**
 * Returns team member data as JSON.
 */
export async function getContentTeamMembers(locale: SiteLocale): Promise<Array<ContentTeamMember>> {
	const folderPath = path.join(dataBasePath, "team", locale);
	const folderContents = await fs.readdir(folderPath);

	const data: Array<ContentTeamMember> = await Promise.all(
		folderContents.map(async (file) => {
			const filePath = path.join(folderPath, file);
			const fileContents = await fs.readFile(filePath, { encoding: "utf-8" });
			const processed = YAML.parse(fileContents);
			return { id: file.slice(0, -dataExtension.length), ...processed };
		}),
	);

	data.sort((a, b) => {
		return a.lastName.localeCompare(b.lastName);
	});

	return data;
}

export type ContentPostBaseMetadata = {
	title: string;
	date: string;
	abstract: string;
};

export interface ContentPostBase {
	id: string;
	metadata: ContentPostBaseMetadata;
}

/**
 * Returns list of posts with abstracts.
 */
export async function getContentPostsOverview(locale: SiteLocale): Promise<Array<ContentPostBase>> {
	const folderPath = path.join(postBasePath, locale);
	const folderContents = await fs.readdir(folderPath);

	const data: Array<ContentPostBase> = await Promise.all(
		folderContents.map(async (file) => {
			const filePath = path.join(folderPath, file);
			const fileContents = await fs.readFile(filePath, { encoding: "utf-8" });
			const processed = await excerpt.process(fileContents);

			const abstract = String(processed);
			const { frontmatter } = processed.data as {
				frontmatter: ContentPostMetadata;
			};

			const metadata = {
				title: frontmatter.shortTitle ?? frontmatter.title,
				date: frontmatter.date,
				abstract: frontmatter.abstract ?? abstract,
			};

			return { id: file.slice(0, -postExtension.length), metadata };
		}),
	);

	data.sort((a, b) => {
		return a.metadata.date > b.metadata.date ? -1 : 1;
	});

	return data;
}

export type ContentPostMetadata = {
	title: string;
	shortTitle?: string;
	date: string;
	abstract?: string;
	attachments?: Array<{ label: string; file: string }>;
	gallery?: Array<{ alt?: string; image: string }>;
};

export interface ContentPost {
	id: string;
	html: string;
	metadata: ContentPostMetadata;
}

/**
 * Returns list of posts with abstracts.
 */
export async function getContentPostById(id: string, locale: SiteLocale): Promise<ContentPost> {
	const filePath = path.join(postBasePath, locale, id + postExtension);
	const fileContents = await fs.readFile(filePath, { encoding: "utf-8" });
	const processed = await md.process(fileContents);

	const html = String(processed);
	const { frontmatter: metadata } = processed.data as {
		frontmatter: ContentPostMetadata;
	};

	return { id, html, metadata };
}

/**
 * Returns all post ids.
 */
export async function getContentPostIds(locale: SiteLocale): Promise<Array<string>> {
	const folderPath = path.join(postBasePath, locale);
	const folderContents = await fs.readdir(folderPath);
	return folderContents.map((file) => {
		return file.slice(0, -postExtension.length);
	});
}
