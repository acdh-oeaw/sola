import type { Metadata } from "next";
import type { JSX } from "react";

import { getContentPage } from "@/api/content";
import { getLocale } from "@/lib/i18n/getLocale";
import { createMetadata } from "@/modules/metadata/createMetadata";
import { Container } from "@/modules/ui/Container";

const labels = {
	en: {
		page: {
			title: "About the project",
		},
	},
	de: {
		page: {
			title: "Über das Projekt",
		},
	},
} as const;

type ContentPageMetadata = {
	title: string;
};

interface AboutPageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: AboutPageProps): Promise<Metadata> {
	const locale = await getLocale(props.params);

	return createMetadata({ locale, title: labels[locale].page.title, path: "/about" });
}

/**
 * About page.
 */
export default async function AboutPage(props: AboutPageProps): Promise<JSX.Element> {
	const locale = await getLocale(props.params);

	const page = await getContentPage<ContentPageMetadata>("about", locale);

	return (
		<Container className="prose" as="main">
			<h1>{page.metadata.title}</h1>
			<div dangerouslySetInnerHTML={{ __html: page.html }} />
		</Container>
	);
}
