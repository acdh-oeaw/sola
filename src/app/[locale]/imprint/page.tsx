import type { Metadata } from "next";
import { getExtracted, getLocale } from "next-intl/server";
import type { JSX } from "react";

import { getImprint } from "@/api/imprint";
import { createMetadata } from "@/modules/metadata/createMetadata";
import { Container } from "@/modules/ui/Container";

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();
	const t = await getExtracted();

	return createMetadata({
		locale,
		title: t("Imprint"),
		path: "/imprint",
		noindex: true,
		nofollow: true,
	});
}

/**
 * Imprint page. The imprint is fetched at build time.
 */
export default async function ImprintPage(): Promise<JSX.Element> {
	const locale = await getLocale();
	const t = await getExtracted();

	const html = await getImprint(locale);

	return (
		<Container className="prose" as="main">
			<h1>{t("Imprint")}</h1>
			<div dangerouslySetInnerHTML={{ __html: html }} />
		</Container>
	);
}
