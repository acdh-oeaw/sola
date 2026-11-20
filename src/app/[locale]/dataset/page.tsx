import type { Metadata } from "next";
import type { JSX } from "react";

import { getLocale } from "@/lib/i18n/getLocale";
import { LabelsProvider } from "@/lib/i18n/LabelsContext";
import { Dashboard } from "@/modules/dataset/Dashboard";
import { labels } from "@/modules/dataset/labels";
import { createMetadata } from "@/modules/metadata/createMetadata";

interface DatasetPageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<Record<string, Array<string> | string | undefined>>;
}

/**
 * Canonical and alternate URLs include the selected entity, so every entity page listed in the
 * sitemap is indexed separately. Reading search params renders this page on request.
 */
export async function generateMetadata(props: DatasetPageProps): Promise<Metadata> {
	const locale = await getLocale(props.params);

	/**
	 * No need for additional sanity checks for `id` and `type` here, since these are checked in
	 * `useSolaSelectedEntity`. If a user enters bogus values these should still not be indexed,
	 * since they will not be included in the sitemap.
	 */
	const { id, type } = await props.searchParams;
	const query = typeof id === "string" && typeof type === "string" ? { id, type } : undefined;

	return createMetadata({ locale, title: labels[locale].page.title, path: "/dataset", query });
}

/**
 * Dataset page.
 */
export default async function DatasetPage(props: DatasetPageProps): Promise<JSX.Element> {
	const locale = await getLocale(props.params);

	return (
		<LabelsProvider labels={labels[locale]}>
			<Dashboard />
		</LabelsProvider>
	);
}
