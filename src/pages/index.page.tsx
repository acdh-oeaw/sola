import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import Link from "next/link";
import { Fragment } from "react";

import type { CmsPage } from "@/api/cms";
import { getCmsPage } from "@/api/cms";
import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import { getCurrentLocale } from "@/lib/i18n/getCurrentLocale";
import { Metadata } from "@/modules/metadata/Metadata";
import { useAlternateUrls } from "@/modules/metadata/useAlternateUrls";
import { useCanonicalUrl } from "@/modules/metadata/useCanonicalUrl";

/**
 * i18n.
 */
export const labels = {
	en: {
		page: {
			title: "Home",
		},
		button: "Explore the dataset",
		heroImage: "Christus Sol Invictus mosaic, Vatican Necropolis (third century)",
	},
	de: {
		page: {
			title: "Startseite",
		},
		button: "Zur Datenbank",
		heroImage: "Christus Sol Invictus Mosaik, Vatikanische Nekropole (drittes Jahrhundert)",
	},
} as const;

export type CmsPageMetadata = {
	title: string;
};

export interface IndexPageProps {
	labels: (typeof labels)[SiteLocale];
	page: CmsPage<CmsPageMetadata>;
}

/**
 * Make page contents from CMS and localised labels available to client.
 */
export async function getStaticProps(
	context: GetStaticPropsContext,
): Promise<GetStaticPropsResult<IndexPageProps>> {
	const locale = getCurrentLocale(context.locale);

	const page = await getCmsPage<CmsPageMetadata>("index", locale);

	return {
		props: {
			labels: labels[locale],
			page,
		},
	};
}

/**
 * Index page.
 */
export default function IndexPage(props: IndexPageProps): JSX.Element {
	const canonicalUrl = useCanonicalUrl();
	const alternateUrls = useAlternateUrls();

	return (
		<Fragment>
			<Metadata
				title={props.labels.page.title}
				canonicalUrl={canonicalUrl}
				languageAlternates={alternateUrls}
			/>
			<main className="flex bg-gray-900">
				<div className="flex items-center flex-1 px-6 py-24 sm:px-12 sm:py-12">
					<div className="space-y-6 text-gray-100 max-w-65ch">
						<h1 className="text-4xl font-black xs:text-5xl lg:text-6xl xl:text-7xl">
							{props.page.metadata.title}
						</h1>
						<div
							className="font-medium leading-7"
							dangerouslySetInnerHTML={{ __html: props.page.html }}
						/>
						<Link
							href="/dataset"
							className="inline-block px-10 py-5 text-sm font-semibold tracking-wider text-gray-800 uppercase transition bg-yellow-400 rounded hover:bg-yellow-500 focus:outline-none focus-visible:bg-yellow-500"
						>
							{props.labels.button}
						</Link>
					</div>
				</div>
				<div className="relative flex-1 hidden sm:flex">
					<div className="absolute inset-0">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/assets/images/hero.jpg"
							alt={props.labels.heroImage}
							className="object-cover object-left-top w-full h-full"
							decoding="async"
							width="485"
							height="718"
						/>
					</div>
				</div>
			</main>
		</Fragment>
	);
}
