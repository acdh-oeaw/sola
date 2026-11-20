import type { QueryObserverResult } from "@tanstack/react-query";
import cx from "clsx";
import { useExtracted } from "next-intl";
import { Fragment } from "react";

import type { SolaEntityDetails, SolaEntityRelation, SolaEntityType } from "@/api/sola/client";
import { useSolaEntityBibliography, useSolaPassageMetadata, useSolaTexts } from "@/lib/sola/hooks";
import type { SolaPassagesFilter, SolaSelectedEntity } from "@/lib/sola/types";
import { Authors } from "@/modules/dataset/details/Authors";
import { BiblePassages } from "@/modules/dataset/details/BiblePassages";
import { CopyLinkButton } from "@/modules/dataset/details/CopyLinkButton";
import { Duration } from "@/modules/dataset/details/Duration";
import { EditedBy } from "@/modules/dataset/details/EditedBy";
import { EntityType } from "@/modules/dataset/details/EntityType";
import { PrintButton } from "@/modules/dataset/details/PrintButton";
import { Properties } from "@/modules/dataset/details/Properties";
import { Relations } from "@/modules/dataset/details/Relations";
import { Texts } from "@/modules/dataset/details/Texts";
import { createSchemaOrg, SchemaOrg } from "@/modules/metadata/SchemaOrg";
import { Spinner } from "@/modules/ui/Spinner";
import { DurationTimeline } from "@/modules/visualization/DurationTimeline";

/**
 * Texts and metadata for the currently selected entity.
 */
export function DetailsPanel({
	selectedSolaEntity,
	setSelectedSolaEntity,
	selectedSolaEntityRelations,
	setFilter,
}: {
	selectedSolaEntity: QueryObserverResult<SolaEntityDetails, unknown>;
	setSelectedSolaEntity: (entity: SolaSelectedEntity | null) => void;
	selectedSolaEntityRelations: Record<SolaEntityType, Array<SolaEntityRelation>>;
	setFilter: (filter: SolaPassagesFilter) => void;
}) {
	const t = useExtracted();

	const solaEntityTexts = useSolaTexts(selectedSolaEntity.data);
	const solaEntityBibliography = useSolaEntityBibliography(selectedSolaEntity.data);

	const [primaryText, ...texts] = solaEntityTexts.data ?? [];

	const { authors, biblePassages } = useSolaPassageMetadata(
		selectedSolaEntity.data?.type === "Passage" ? selectedSolaEntity.data : undefined,
	);

	if (
		selectedSolaEntity.isLoading ||
		solaEntityTexts.isLoading ||
		solaEntityBibliography.isLoading
	) {
		return (
			<div className="flex flex-col items-center justify-center text-yellow-400">
				<Spinner className="w-6 h-6" />
			</div>
		);
	}

	if (selectedSolaEntity.data === undefined) {
		return (
			<div className="flex flex-col items-center justify-center text-gray-500">
				<p className="p-6 text-center">
					{t("Please select an entity in the timeline above to view details.")}
				</p>
			</div>
		);
	}

	/**
	 * When switching entities, the previous entity is kept as placeholder while the next one
	 * loads. Dependent texts and bibliography are prefetched with the entity, so they switch
	 * together with it.
	 */
	const isLoadingNextEntity = selectedSolaEntity.isPlaceholderData;

	/** Updating metadata on the client is not optimal for SEO, but better than nothing. */
	let metadata = null;

	const entity = selectedSolaEntity.data;
	switch (entity.type) {
		case "Event":
			metadata = createSchemaOrg({ "@type": "Event", name: entity.name });
			break;
		case "Institution":
			metadata = createSchemaOrg({ "@type": "Organization", name: entity.name });
			break;
		case "Passage":
			metadata = createSchemaOrg({ "@type": "CreativeWork", name: entity.name });
			break;
		case "Person":
			metadata = createSchemaOrg({ "@type": "Person", name: entity.name });
			break;
		case "Place":
			metadata = createSchemaOrg({ "@type": "Place", name: entity.name });
			break;
		case "Publication":
			metadata = createSchemaOrg({ "@type": "CreativeWork", name: entity.name });
			break;
	}

	return (
		<Fragment>
			<SchemaOrg schema={metadata} />
			<section
				className="overflow-y-auto focus:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-400"
				style={{ gridArea: "details" }}
				aria-busy={isLoadingNextEntity || undefined}
			>
				<div
					className={cx(
						"grid min-h-full gap-6 p-6 details-panel transition-opacity",
						/** Delay fading out, so fast responses don't cause a flash. */
						isLoadingNextEntity ? "opacity-50 duration-300 delay-200" : "duration-150",
					)}
				>
					<div className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<EntityType type={selectedSolaEntity.data.type} />
								<div className="space-x-1">
									<CopyLinkButton />
									<PrintButton
										entity={selectedSolaEntity.data}
										authors={authors.data}
										relations={selectedSolaEntityRelations}
										biblePassages={biblePassages.data}
										primary={primaryText}
										texts={texts}
										bibliography={solaEntityBibliography.data}
										editorId={selectedSolaEntity.data.assigned_user}
									/>
								</div>
							</div>
							<h2 className="text-xl font-semibold leading-6 text-gray-700">
								{selectedSolaEntity.data.name}
							</h2>
							<Authors authors={authors} setSelectedSolaEntity={setSelectedSolaEntity} />
						</div>
						<Duration
							from={selectedSolaEntity.data.start_date_written}
							fromIso={selectedSolaEntity.data.start_date}
							to={selectedSolaEntity.data.end_date_written}
							toIso={selectedSolaEntity.data.end_date}
						/>
						{selectedSolaEntity.data.primary_date != null ? (
							<div className="relative flex h-8">
								<DurationTimeline entity={selectedSolaEntity.data} />
							</div>
						) : null}
						<Properties entity={selectedSolaEntity.data} setFilter={setFilter} />
						<Relations
							relations={selectedSolaEntityRelations}
							setSelectedSolaEntity={setSelectedSolaEntity}
						/>
						<BiblePassages passages={biblePassages} />
						<EditedBy editorId={selectedSolaEntity.data.assigned_user} />
					</div>
					<Texts primary={primaryText} texts={texts} bibliography={solaEntityBibliography.data} />
				</div>
			</section>
		</Fragment>
	);
}
