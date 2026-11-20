import type { Metadata } from "next";
import type { JSX } from "react";

import { getImprint } from "@/api/imprint";
import { getLocale } from "@/lib/i18n/getLocale";
import { createMetadata } from "@/modules/metadata/createMetadata";
import { Container } from "@/modules/ui/Container";

const labels = {
	en: {
		page: {
			title: "Imprint",
		},
	},
	de: {
		page: {
			title: "Impressum",
		},
	},
} as const;

interface ImprintPageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: ImprintPageProps): Promise<Metadata> {
	const locale = await getLocale(props.params);

	return createMetadata({
		locale,
		title: labels[locale].page.title,
		path: "/imprint",
		noindex: true,
		nofollow: true,
	});
}

/**
 * Imprint page. The imprint is fetched at build time.
 */
export default async function ImprintPage(props: ImprintPageProps): Promise<JSX.Element> {
	const locale = await getLocale(props.params);

	const html = await getImprint(locale);

	return (
		<Container className="prose" as="main">
			<h1>{labels[locale].page.title}</h1>
			<div dangerouslySetInnerHTML={{ __html: html }} />
		</Container>
	);
}
