import type { Metadata } from "next";
import type { Locale } from "next-intl";
import { getExtracted, getLocale } from "next-intl/server";
import { type JSX, Fragment } from "react";

import { type ContentPostBase, getContentPage, getContentPostsOverview } from "@/api/content";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/i18n/formatDate";
import { createMetadata } from "@/modules/metadata/createMetadata";
import { Container } from "@/modules/ui/Container";

const MAX_POSTS = 10;

type ContentPageMetadata = {
	title: string;
};

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getLocale();
	const t = await getExtracted();

	return createMetadata({ locale, title: t("News"), path: "/posts" });
}

/**
 * Posts page.
 */
export default async function PostsPage(): Promise<JSX.Element> {
	const locale = await getLocale();
	const t = await getExtracted();

	const page = await getContentPage<ContentPageMetadata>("news", locale);
	const posts = (await getContentPostsOverview(locale)).slice(0, MAX_POSTS);

	return (
		<Container as="main">
			<div className="prose">
				<h1>{page.metadata.title}</h1>
				<div dangerouslySetInnerHTML={{ __html: page.html }} />
			</div>
			<ul className="my-8 space-y-10">
				{posts.map((post) => {
					return (
						<li key={post.id}>
							<Post locale={locale} post={post} readMore={t("Read more")} />
						</li>
					);
				})}
			</ul>
		</Container>
	);
}

function Post({
	locale,
	post,
	readMore,
}: {
	locale: Locale;
	post: ContentPostBase;
	readMore: string;
}) {
	const href = `/posts/${post.id}`;

	return (
		<Fragment>
			<Link
				href={href}
				className="focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
			>
				<h2 className="my-4 text-2xl font-bold text-gray-700">{post.metadata.title}</h2>
			</Link>
			<time className="text-sm text-gray-500" dateTime={post.metadata.date}>
				{formatDate(post.metadata.date, locale)}
			</time>
			<p className="my-3 leading-7 text-gray-700">{post.metadata.abstract}</p>
			<Link
				href={href}
				className="inline-block px-4 py-2 text-sm font-semibold tracking-wider text-gray-700 uppercase transition bg-yellow-400 rounded-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400 hover:bg-yellow-500"
			>
				{readMore}
			</Link>
		</Fragment>
	);
}
