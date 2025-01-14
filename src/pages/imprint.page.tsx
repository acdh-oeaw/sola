import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import { Fragment } from "react";

import { getImprint } from "@/api/imprint";
import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import { getCurrentLocale } from "@/lib/i18n/getCurrentLocale";
import { Metadata } from "@/modules/metadata/Metadata";
import { useAlternateUrls } from "@/modules/metadata/useAlternateUrls";
import { useCanonicalUrl } from "@/modules/metadata/useCanonicalUrl";
import { Container } from "@/modules/ui/Container";

/**
 * i18n.
 */
export const labels = {
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

export interface ImprintPageProps {
	labels: (typeof labels)[SiteLocale];
	page: { html: string };
}

/**
 * Make imprint HTML and localised labels available to client.
 */
export async function getStaticProps(
	context: GetStaticPropsContext,
): Promise<GetStaticPropsResult<ImprintPageProps>> {
	const locale = getCurrentLocale(context.locale);

	const html = await getImprint(locale);

	return {
		props: {
			labels: labels[locale],
			page: { html },
		},
	};
}

/**
 * Imprint page.
 */
export default function ImprintPage(props: ImprintPageProps): JSX.Element {
	const canonicalUrl = useCanonicalUrl();
	const alternateUrls = useAlternateUrls();

	return (
		<Fragment>
			<Metadata
				title={props.labels.page.title}
				canonicalUrl={canonicalUrl}
				languageAlternates={alternateUrls}
				nofollow
				noindex
			/>
			<Container className="prose" as="main">
				<h1>{props.labels.page.title}</h1>
				<div dangerouslySetInnerHTML={{ __html: props.page.html }} />
			</Container>
		</Fragment>
	);
}
