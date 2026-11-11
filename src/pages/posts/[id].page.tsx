import type {
	GetStaticPathsContext,
	GetStaticPathsResult,
	GetStaticPropsContext,
	GetStaticPropsResult,
} from "next";
import Image from "next/image";
import type { JSX } from "react";
import { Fragment } from "react";

import type { ContentPost } from "@/api/content";
import { getContentPostById, getContentPostIds } from "@/api/content";
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
		data: {
			attachments: "Attachments",
			images: "Images",
		},
	},
	de: {
		data: {
			attachments: "Anhänge",
			images: "Bilder",
		},
	},
} as const;

type PagePath = {
	id: string;
};

export interface PostPageProps {
	labels: (typeof labels)[SiteLocale];
	post: ContentPost;
}

/**
 * Create post page for every post id.
 */
export async function getStaticPaths(
	context: GetStaticPathsContext,
): Promise<GetStaticPathsResult<PagePath>> {
	const locales = (context.locales ?? []) as Array<SiteLocale>;

	const paths = (
		await Promise.all(
			locales.map(async (locale) => {
				const ids = await getContentPostIds(locale);
				return ids.map((id) => {
					return { params: { id }, locale };
				});
			}),
		)
	).flat();

	return {
		paths,
		fallback: false,
	};
}

/**
 * Make post contents from local files available to client.
 */
export async function getStaticProps(
	context: GetStaticPropsContext<PagePath>,
): Promise<GetStaticPropsResult<PostPageProps>> {
	const locale = getCurrentLocale(context.locale);
	const id = context.params?.id;

	/**
	 * this should never happen, since Next.js will automatically 404 for paths
	 * not returned from `getStaticPaths` when `fallback: false`.
	 */
	if (id === undefined || Array.isArray(id)) {
		throw new Error("Post Not Found.");
	}

	const post = await getContentPostById(id, locale);

	return {
		props: {
			labels: labels[locale],
			post,
		},
	};
}

/**
 * Post page.
 */
export default function PostPage(props: PostPageProps): JSX.Element {
	const canonicalUrl = useCanonicalUrl();
	const alternateUrls = useAlternateUrls();

	return (
		<Fragment>
			<Metadata
				title={props.post.metadata.title}
				canonicalUrl={canonicalUrl}
				languageAlternates={alternateUrls}
			/>
			<Container as="main">
				<div className="prose">
					<h1>{props.post.metadata.title}</h1>
					<div dangerouslySetInnerHTML={{ __html: props.post.html }} />
					<Attachments attachments={props.post.metadata.attachments} t={props.labels.data} />
				</div>
				<ImageGallery images={props.post.metadata.gallery} t={props.labels.data} />
			</Container>
		</Fragment>
	);
}

function Attachments({
	attachments,
	t,
}: {
	attachments?: ContentPost["metadata"]["attachments"];
	t: (typeof labels)[SiteLocale]["data"];
}) {
	if (attachments === undefined || attachments.length === 0) return null;

	return (
		<div>
			<h2>{t.attachments}</h2>
			<ul>
				{attachments.map((attachment, index) => {
					return (
						<li key={index}>
							<a
								className="text-gray-700 transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
								href={attachment.file}
							>
								{attachment.label}
							</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

function ImageGallery({
	images,
	t,
}: {
	images?: ContentPost["metadata"]["gallery"];
	t: (typeof labels)[SiteLocale]["data"];
}) {
	if (images === undefined || images.length === 0) return null;

	return (
		<div>
			<h2 className="mt-12 mb-6 text-2xl font-bold text-gray-700">{t.images}</h2>
			<ul className="grid gap-4 sm:grid-cols-2" style={{ gridAutoRows: "minmax(auto, 200px)" }}>
				{images.map((image, index) => {
					return (
						<li key={index} className="relative">
							<a href={image.image} target="_blank" rel="noopener noreferrer">
								<Image
									src={image.image}
									alt={image.alt ?? ""}
									layout="fill"
									objectFit="cover"
									sizes={"(max-width: 640px) 600px, 300px"}
								/>
							</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
