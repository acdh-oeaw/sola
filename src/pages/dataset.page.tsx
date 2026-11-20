import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import { type JSX, Fragment } from "react";

import { getCurrentLocale } from "@/lib/i18n/getCurrentLocale";
import { LabelsProvider } from "@/lib/i18n/LabelsContext";
import { Dashboard } from "@/modules/dataset/Dashboard";
import { type DatasetLabels, labels } from "@/modules/dataset/labels";
import { Metadata } from "@/modules/metadata/Metadata";
import { useAlternateUrls } from "@/modules/metadata/useAlternateUrls";
import { useCanonicalUrl } from "@/modules/metadata/useCanonicalUrl";

export interface DatasetPageProps {
	labels: DatasetLabels;
}

/**
 * Make localised labels available to client.
 */
export function getStaticProps(
	context: GetStaticPropsContext,
): GetStaticPropsResult<DatasetPageProps> {
	const locale = getCurrentLocale(context.locale);

	return {
		props: {
			labels: labels[locale],
		},
	};
}

/**
 * Dataset page.
 */
export default function DatasetPage(props: DatasetPageProps): JSX.Element {
	const router = useRouter();
	/**
	 * No need for additional sanity checks for `id` and `type` here,
	 * since these are checked in `useSolaSelectedEntity`.
	 * If a user enters bogus values these should still not be indexed, since
	 * they will not be included in the sitemap.
	 */
	const { id, type } = router.query;
	const query = id !== undefined && type !== undefined ? { id, type } : undefined;
	const canonicalUrl = useCanonicalUrl(query);
	const alternateUrls = useAlternateUrls(query);

	return (
		<Fragment>
			<Metadata
				title={props.labels.page.title}
				canonicalUrl={canonicalUrl}
				languageAlternates={alternateUrls}
			/>
			<LabelsProvider labels={props.labels}>
				<Dashboard />
			</LabelsProvider>
		</Fragment>
	);
}
