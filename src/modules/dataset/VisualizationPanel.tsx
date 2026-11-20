import cx from "clsx";
import { useExtracted } from "next-intl";

import type { SolaEntityRelation, SolaEntityType } from "@/api/sola/client";
import { useSolaFilteredPassages } from "@/lib/sola/hooks";
import type { SolaPassagesFilter, SolaSelectedEntity } from "@/lib/sola/types";
import { count } from "@/lib/util/count";
import { ActiveFilterList } from "@/modules/dataset/ActiveFilterList";
import { useEntityTypeLabels } from "@/modules/dataset/useEntityTypeLabels";
import { Spinner } from "@/modules/ui/Spinner";
import { type VisualizationProps, Visualization } from "@/modules/visualization/Visualization";
import sola from "~/config/sola.json" with { type: "json" };

const { colors } = sola;

/**
 * Timelines for passages and other entities.
 * Passages matching the currently active filter set are highlighted.
 */
export function VisualizationPanel({
	solaEntities,
	filter,
	setFilter,
	searchTerm,
	setSearchTerm,
	selectedSolaEntity,
	setSelectedSolaEntity,
	selectedSolaEntityRelations,
}: {
	solaEntities: VisualizationProps["solaEntities"];
	filter: SolaPassagesFilter;
	setFilter: (filter: SolaPassagesFilter) => void;
	searchTerm: string | undefined;
	setSearchTerm: (searchterm: string | undefined) => void;
	selectedSolaEntity: VisualizationProps["selectedSolaEntity"];
	setSelectedSolaEntity: (entity: SolaSelectedEntity | null) => void;
	selectedSolaEntityRelations: Record<SolaEntityType, Array<SolaEntityRelation>>;
}) {
	const t = useExtracted();
	const entityTypeLabels = useEntityTypeLabels();

	const filteredSolaPassages = useSolaFilteredPassages(filter, searchTerm);

	const countedSolaEvents = count(solaEntities.data?.events);
	const countedSolaInstitutions = count(solaEntities.data?.institutions);
	const countedSolaPassages = count(solaEntities.data?.passages);
	const countedSolaPersons = count(solaEntities.data?.persons);
	const countedSolaPlaces = count(solaEntities.data?.places);
	const countedSolaPublications = count(solaEntities.data?.publications);

	return (
		<section
			className="flex flex-col min-w-0 pb-4 border-b border-gray-200"
			style={{ gridArea: "visualization" }}
		>
			<div className="flex flex-col justify-between px-6 pt-6 pb-4 space-y-4 md:space-y-0 md:flex-row md:space-x-4">
				<div className="flex items-center space-x-2">
					<h1 className="text-2xl font-bold">{t("Passages")}</h1>
					{filteredSolaPassages.isLoading ? (
						<Spinner className="w-6 h-6" />
					) : (
						<div className="w-6 h-6" />
					)}
				</div>
				<div className="flex flex-col space-y-1">
					<ul className="flex flex-wrap text-xs text-gray-500 md:justify-end md:gap-x-2">
						<li className="flex items-center mb-1 mr-2 space-x-1 md:mr-0">
							<div className={cx("w-3 h-3 transition", colors.bg.Event)} />
							<span>
								{countedSolaEvents} {entityTypeLabels.Event[1]}
							</span>
						</li>
						<li className="flex items-center mb-1 mr-2 space-x-1 md:mr-0">
							<div className={cx("w-3 h-3 transition", colors.bg.Institution)} />
							<span>
								{countedSolaInstitutions} {entityTypeLabels.Institution[1]}
							</span>
						</li>
						<li className="flex items-center mb-1 mr-2 space-x-1 md:mr-0">
							<div className={cx("w-3 h-3 transition", colors.bg.Passage)} />
							<span>
								{countedSolaPassages} {entityTypeLabels.Passage[1]}
							</span>
						</li>
						<li className="flex items-center mb-1 mr-2 space-x-1 md:mr-0">
							<div className={cx("w-3 h-3 transition", colors.bg.Person)} />
							<span>
								{countedSolaPersons} {entityTypeLabels.Person[1]}
							</span>
						</li>
						<li className="flex items-center mb-1 mr-2 space-x-1 md:mr-0">
							<div className={cx("w-3 h-3 transition", colors.bg.Place)} />
							<span>
								{countedSolaPlaces} {entityTypeLabels.Place[1]}
							</span>
						</li>
						<li className="flex items-center mb-1 mr-2 space-x-1 md:mr-0">
							<div className={cx("w-3 h-3 transition", colors.bg.Publication)} />
							<span>
								{countedSolaPublications} {entityTypeLabels.Publication[1]}
							</span>
						</li>
					</ul>
					<ActiveFilterList
						filter={filter}
						setFilter={setFilter}
						searchTerm={searchTerm}
						setSearchTerm={setSearchTerm}
					/>
				</div>
			</div>
			<div className="relative flex-1 mx-6">
				<Visualization
					solaEntities={solaEntities}
					filteredSolaPassages={filteredSolaPassages}
					selectedSolaEntity={selectedSolaEntity}
					setSelectedSolaEntity={setSelectedSolaEntity}
					selectedSolaEntityRelations={selectedSolaEntityRelations}
					entityTypeLabels={entityTypeLabels}
				/>
			</div>
		</section>
	);
}
