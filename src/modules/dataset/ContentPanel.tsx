import { Fragment, useEffect } from "react";

import { useSolaEntities, useSolaEntityRelations, useSolaSelectedEntity } from "@/lib/sola/hooks";
import type { SolaPassagesFilter } from "@/lib/sola/types";
import { DetailsPanel } from "@/modules/dataset/DetailsPanel";
import { VisualizationPanel } from "@/modules/dataset/VisualizationPanel";
import { Spinner } from "@/modules/ui/Spinner";

/**
 * Container with shared data requirements for main content area.
 */
export function ContentPanel({
	filter,
	setFilter,
	searchTerm,
	setSearchTerm,
}: {
	filter: SolaPassagesFilter;
	setFilter: (filter: SolaPassagesFilter) => void;
	searchTerm: string | undefined;
	setSearchTerm: (searchTerm: string | undefined) => void;
}) {
	const solaEntities = useSolaEntities();

	const { selectedSolaEntity, setSelectedSolaEntity } = useSolaSelectedEntity();
	const selectedSolaEntityRelations = useSolaEntityRelations(selectedSolaEntity.data);

	/** Reset detail view when filter set changes. */
	useEffect(() => {
		setSelectedSolaEntity(null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filter]);

	const isLoadingInitialData = solaEntities.status === "pending";

	if (isLoadingInitialData) {
		return (
			<div
				className="flex flex-col items-center justify-center text-yellow-400"
				style={{ gridRow: "span 2" }}
			>
				<Spinner className="w-12 h-12" />
			</div>
		);
	}

	return (
		<Fragment>
			<VisualizationPanel
				solaEntities={solaEntities}
				filter={filter}
				setFilter={setFilter}
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				selectedSolaEntity={selectedSolaEntity}
				setSelectedSolaEntity={setSelectedSolaEntity}
				selectedSolaEntityRelations={selectedSolaEntityRelations}
			/>
			<DetailsPanel
				selectedSolaEntity={selectedSolaEntity}
				setSelectedSolaEntity={setSelectedSolaEntity}
				selectedSolaEntityRelations={selectedSolaEntityRelations}
				setFilter={setFilter}
			/>
		</Fragment>
	);
}
