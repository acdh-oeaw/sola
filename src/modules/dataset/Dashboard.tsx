import type { JSX } from "react";

import { useSolaPassagesFilter, useSolaPassagesSearchTerm } from "@/lib/sola/hooks";
import { ContentPanel } from "@/modules/dataset/ContentPanel";
import { FilterPanel } from "@/modules/dataset/FilterPanel";

/**
 * Page container with shared page-level data requirements.
 */
export function Dashboard(): JSX.Element {
	const { searchTerm, setSearchTerm } = useSolaPassagesSearchTerm();
	const { solaPassagesFilter, setSolaPassagesFilter } = useSolaPassagesFilter();

	return (
		<main className="grid main-panel bg-gray-50" style={{ gridArea: "main" }}>
			<FilterPanel
				filter={solaPassagesFilter}
				setFilter={setSolaPassagesFilter}
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
			/>
			<ContentPanel
				filter={solaPassagesFilter}
				setFilter={setSolaPassagesFilter}
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
			/>
		</main>
	);
}
