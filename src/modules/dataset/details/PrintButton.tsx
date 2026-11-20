import { Fragment, useRef } from "react";

import type {
	SolaBibsonomyReference,
	SolaEntityDetails,
	SolaEntityRelation,
	SolaEntityType,
	SolaListEntity,
	SolaTextDetails,
} from "@/api/sola/client";
import { useCurrentLocale } from "@/lib/i18n/useCurrentLocale";
import { useSolaUsers } from "@/lib/sola/hooks";
import { printHtml } from "@/lib/util/printHtml";
import { BibliographicReference } from "@/modules/dataset/details/Bibliography";
import { useDatasetLabels } from "@/modules/dataset/labels";
import { Document as DocumentIcon } from "@/modules/icons/Document";
import site from "~/config/site.json" with { type: "json" };

const { url: baseUrl } = site;

export function PrintButton({
	entity,
	authors,
	relations,
	biblePassages,
	primary,
	texts,
	bibliography,
	editorId,
}: {
	entity?: SolaEntityDetails;
	authors?: Array<SolaListEntity>;
	relations: Record<SolaEntityType, Array<SolaEntityRelation>>;
	biblePassages?: Record<string, string>;
	primary?: SolaTextDetails;
	texts: Array<SolaTextDetails>;
	bibliography?: Array<SolaBibsonomyReference>;
	editorId?: { label: string } | null;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const t = useDatasetLabels();
	const locale = useCurrentLocale();

	const users = useSolaUsers();
	const userId = editorId?.label;
	const editor = userId !== undefined ? users.data?.[userId] : undefined;

	if (entity == null) return null;

	function print() {
		if (containerRef.current == null) return;
		const style = `
      mark {
        background: #eee;
        padding: 3px;
        border-radius: 3px;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
        color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    `;
		const html = `<!doctype html><html><head><title>${document.title}</title><style>${style}</style></head><body>${containerRef.current.innerHTML}</body></html>`;
		printHtml(html);
	}

	function createUrl() {
		if (entity == null) return "";
		const url = new URL([locale, "dataset"].join("/"), baseUrl);
		url.searchParams.set("id", String(entity.id));
		url.searchParams.set("type", entity.type);
		return String(url);
	}

	return (
		<Fragment>
			<div className="hidden" ref={containerRef}>
				<h1>{entity.name}</h1>
				<dl>
					{authors && authors.length ? (
						<Fragment>
							<dt>{t.authors[authors.length === 1 ? 0 : 1]}:</dt>
							<dd>
								{authors
									.map((author) => {
										return author.name;
									})
									.join(", ")}
							</dd>
						</Fragment>
					) : null}
					{entity.type === "Passage" ? (
						<Fragment>
							{entity.kind.length ? (
								<Fragment>
									<dt>{t.types[1]}</dt>
									<dd>
										{entity.kind
											.map((type) => {
												return type.label;
											})
											.join(", ")}
									</dd>
								</Fragment>
							) : null}
							{entity.topic.length ? (
								<Fragment>
									<dt>{t.topics[1]}</dt>
									<dd>
										{entity.topic
											.map((topic) => {
												return topic.label;
											})
											.join(", ")}
									</dd>
								</Fragment>
							) : null}
						</Fragment>
					) : null}
					{Object.entries(relations).map(([type, relations]) => {
						if (relations.length === 0) return null;
						return (
							<Fragment key={type}>
								<dt>
									{t.relationsTo} {t.entityType[type as SolaEntityType][1]}:
								</dt>
								<dd>
									{relations
										.map((relation) => {
											return relation.label;
										})
										.join(", ")}
								</dd>
							</Fragment>
						);
					})}
					{biblePassages && Object.keys(biblePassages).length ? (
						<Fragment>
							<dt>{t.biblePassages}</dt>
							<dd>{Object.keys(biblePassages).join(", ")}</dd>
						</Fragment>
					) : null}
				</dl>
				{primary ? (
					<Fragment>
						<h2>{primary.kind.label}</h2>
						<div
							style={{ whiteSpace: "pre-wrap" }}
							dangerouslySetInnerHTML={{ __html: primary.text }}
						/>
					</Fragment>
				) : null}
				{texts.map((text) => {
					return (
						<Fragment key={text.id}>
							<h2>{text.kind.label}</h2>
							<div
								style={{ whiteSpace: "pre-wrap" }}
								dangerouslySetInnerHTML={{ __html: text.text }}
							/>
						</Fragment>
					);
				})}
				{bibliography && bibliography.length > 0 ? (
					<Fragment>
						<h2>{t.bibliography}</h2>
						{bibliography.map((reference) => {
							return <BibliographicReference key={reference.pk} reference={reference} />;
						})}
					</Fragment>
				) : null}
				{editor !== undefined ? (
					<p>
						<small>
							{t.editedBy} {[editor.first_name, editor.last_name].join(" ")}
						</small>
					</p>
				) : null}
				<p>
					<small>{createUrl()}</small>
				</p>
			</div>
			<button
				className="inline-flex items-center px-2 py-1 space-x-1 text-xs font-medium text-gray-700 transition bg-gray-200 rounded-sm hover:bg-gray-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-900"
				onClick={print}
				type="button"
			>
				<DocumentIcon />
				<span>{t.printDocument}</span>
			</button>
		</Fragment>
	);
}
