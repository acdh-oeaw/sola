import type { Metadata } from "next";
import { getExtracted, getLocale } from "next-intl/server";
import type { JSX } from "react";

import { getContentPage } from "@/api/content";
import { createMetadata } from "@/modules/metadata/createMetadata";
import { Container } from "@/modules/ui/Container";

type ContentPageMetadata = {
	title: string;
};

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();
	const t = await getExtracted();

	return createMetadata({ locale, title: t("About the project"), path: "/about" });
}

/**
 * About page.
 */
export default async function AboutPage(): Promise<JSX.Element> {
	const locale = await getLocale();

	const page = await getContentPage<ContentPageMetadata>("about", locale);

	return (
		<Container className="prose" as="main">
			<h1>{page.metadata.title}</h1>
			<div dangerouslySetInnerHTML={{ __html: page.html }} />
		</Container>
	);
}
