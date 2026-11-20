import type { Metadata } from "next";
import Link from "next/link";
import type { JSX } from "react";

import { getContentPage } from "@/api/content";
import { getLocale } from "@/lib/i18n/getLocale";
import { createLocalePath } from "@/lib/i18n/localePath";
import { createMetadata } from "@/modules/metadata/createMetadata";

const labels = {
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

type ContentPageMetadata = {
	title: string;
};

interface IndexPageProps {
	params: Promise<{ locale: string }>;
}

export async function generateMetadata(props: IndexPageProps): Promise<Metadata> {
	const locale = await getLocale(props.params);

	return createMetadata({ locale, title: labels[locale].page.title, path: "/" });
}

/**
 * Index page.
 */
export default async function IndexPage(props: IndexPageProps): Promise<JSX.Element> {
	const locale = await getLocale(props.params);
	const t = labels[locale];

	const page = await getContentPage<ContentPageMetadata>("index", locale);

	return (
		<main className="flex bg-gray-900">
			<div className="flex items-center flex-1 px-6 py-24 sm:px-12 sm:py-12">
				<div className="space-y-6 text-gray-100 max-w-65ch">
					<h1 className="text-4xl font-black xs:text-5xl lg:text-6xl xl:text-7xl">
						{page.metadata.title}
					</h1>
					<div className="font-medium leading-7" dangerouslySetInnerHTML={{ __html: page.html }} />
					<Link
						href={createLocalePath(locale, "/dataset")}
						className="inline-block px-10 py-5 text-sm font-semibold tracking-wider text-gray-800 uppercase transition bg-yellow-400 rounded-sm hover:bg-yellow-500 focus:outline-hidden focus-visible:bg-yellow-500"
					>
						{t.button}
					</Link>
				</div>
			</div>
			<div className="relative flex-1 hidden sm:flex">
				<div className="absolute inset-0">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="/assets/images/hero.jpg"
						alt={t.heroImage}
						className="object-cover object-left-top w-full h-full"
						decoding="async"
						width="485"
						height="718"
					/>
				</div>
			</div>
		</main>
	);
}
