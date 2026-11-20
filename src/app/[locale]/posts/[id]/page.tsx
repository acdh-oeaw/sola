import type { Metadata } from "next";
import { getExtracted, getLocale } from "next-intl/server";
import Image from "next/image";
import type { JSX } from "react";

import { type ContentPost, getContentPostById, getContentPostIds } from "@/api/content";
import { routing } from "@/i18n/routing";
import { createMetadata } from "@/modules/metadata/createMetadata";
import { Container } from "@/modules/ui/Container";

interface PostPageProps {
	params: Promise<{ locale: string; id: string }>;
}

/**
 * Create post page for every post id, in every locale.
 */
export async function generateStaticParams(): Promise<Array<{ locale: string; id: string }>> {
	const params = await Promise.all(
		routing.locales.map(async (locale) => {
			const ids = await getContentPostIds(locale);
			return ids.map((id) => {
				return { locale, id };
			});
		}),
	);

	return params.flat();
}

/** Only serve posts which exist at build time. */
export const dynamicParams = false;

export async function generateMetadata(props: PostPageProps): Promise<Metadata> {
	const locale = await getLocale();
	const { id } = await props.params;

	const post = await getContentPostById(id, locale);

	return createMetadata({ locale, title: post.metadata.title, path: `/posts/${id}` });
}

/**
 * Post page.
 */
export default async function PostPage(props: PostPageProps): Promise<JSX.Element> {
	const locale = await getLocale();
	const { id } = await props.params;
	const t = await getExtracted();
	const dataLabels = { attachments: t("Attachments"), images: t("Images") };

	const post = await getContentPostById(id, locale);

	return (
		<Container as="main">
			<div className="prose">
				<h1>{post.metadata.title}</h1>
				<div dangerouslySetInnerHTML={{ __html: post.html }} />
				<Attachments attachments={post.metadata.attachments} t={dataLabels} />
			</div>
			<ImageGallery images={post.metadata.gallery} t={dataLabels} />
		</Container>
	);
}

function Attachments({
	attachments,
	t,
}: {
	attachments?: ContentPost["metadata"]["attachments"];
	t: { attachments: string; images: string };
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
	t: { attachments: string; images: string };
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
									className="object-cover"
									fill={true}
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
