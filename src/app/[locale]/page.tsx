import type { Metadata } from "next";
import { getExtracted, getLocale } from "next-intl/server";
import type { JSX } from "react";

import { getContentPage } from "@/api/content";
import { Link } from "@/i18n/navigation";
import { createMetadata } from "@/modules/metadata/createMetadata";

type ContentPageMetadata = {
	title: string;
};

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();
	const t = await getExtracted();

	return createMetadata({ locale, title: t("Home"), path: "/" });
}

/**
 * Index page.
 */
export default async function IndexPage(): Promise<JSX.Element> {
	const locale = await getLocale();
	const t = await getExtracted();

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
						href="/dataset"
						className="inline-block px-10 py-5 text-sm font-semibold tracking-wider text-gray-800 uppercase transition bg-yellow-400 rounded-sm hover:bg-yellow-500 focus:outline-hidden focus-visible:bg-yellow-500"
					>
						{t("Explore the dataset")}
					</Link>
				</div>
			</div>
			<div className="relative flex-1 hidden sm:flex">
				<div className="absolute inset-0">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="/assets/images/hero.jpg"
						alt={t("Christus Sol Invictus mosaic, Vatican Necropolis (third century)")}
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
