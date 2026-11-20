"use client";

import { type JSX, Suspense } from "react";

import { useSolaPassagesFilter, useSolaPassagesSearchTerm } from "@/lib/sola/hooks";
import { ContentPanel, ContentPanelLoading } from "@/modules/dataset/ContentPanel";
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
			{/* Reads the selected entity from search params, which requires a Suspense boundary. */}
			<Suspense fallback={<ContentPanelLoading />}>
				<ContentPanel
					filter={solaPassagesFilter}
					setFilter={setSolaPassagesFilter}
					searchTerm={searchTerm}
					setSearchTerm={setSearchTerm}
				/>
			</Suspense>
		</main>
	);
}
