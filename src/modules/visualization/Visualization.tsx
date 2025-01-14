import { Fragment, useCallback, useMemo } from "react";
import type { QueryObserverResult } from "react-query";

import type {
	SolaEntityDetails,
	SolaEntityRelation,
	SolaEntityType,
	SolaListEntity,
} from "@/api/sola/client";
import { useCurrentLocale } from "@/lib/i18n/useCurrentLocale";
import type { SolaSelectedEntity } from "@/lib/sola/types";
import type { Node } from "@/modules/visualization/createNode";
import { createNode } from "@/modules/visualization/createNode";
import { Timelines } from "@/modules/visualization/Timelines";
import sola from "~/config/sola.json" assert { type: "json" };

const { colors } = sola;

const labels = {
	en: {
		passages: "Passages",
		other: "Other",
	},
	de: {
		passages: "Passagen",
		other: "Andere",
	},
};

export interface VisualizationProps {
	solaEntities: QueryObserverResult<
		{
			events: Record<number, SolaListEntity>;
			institutions: Record<number, SolaListEntity>;
			passages: Record<number, SolaListEntity>;
			persons: Record<number, SolaListEntity>;
			places: Record<number, SolaListEntity>;
			publications: Record<number, SolaListEntity>;
		},
		unknown
	>;
	filteredSolaPassages: QueryObserverResult<
		{
			passages: Record<number, SolaListEntity>;
		},
		unknown
	>;
	selectedSolaEntity: QueryObserverResult<SolaEntityDetails, unknown>;
	setSelectedSolaEntity: (entity: SolaSelectedEntity | null) => void;
	selectedSolaEntityRelations: Record<SolaEntityType, Array<SolaEntityRelation>>;
	entityTypeLabels: Record<SolaEntityType, readonly [string, string]>;
}

export function Visualization({
	solaEntities,
	filteredSolaPassages,
	selectedSolaEntity,
	setSelectedSolaEntity,
	selectedSolaEntityRelations,
	entityTypeLabels,
}: VisualizationProps): JSX.Element {
	const locale = useCurrentLocale();

	const events = useNodes(solaEntities.data?.events);
	const institutions = useNodes(solaEntities.data?.institutions);
	const passages = useNodes(solaEntities.data?.passages);
	const persons = useNodes(solaEntities.data?.persons);
	const places = useNodes(solaEntities.data?.places);
	const publications = useNodes(solaEntities.data?.publications);

	const timelines = useMemo(() => {
		return [
			{
				label: labels[locale].passages,
				type: "Passage",
				data: passages,
			},
			{
				label: labels[locale].other,
				type: "Other",
				data: [...events, ...institutions, ...persons, ...places, ...publications],
			},
		];
	}, [events, institutions, passages, persons, places, publications, locale]);

	const getLabelForNodeType = useCallback(
		function getLabelForNodeType(type: string) {
			return entityTypeLabels[type as SolaEntityType][0];
		},
		[entityTypeLabels],
	);

	const getTimelineForNodeType = useCallback(
		function getTimelineForNodeType(type: string) {
			if (type === "Passage") {
				return labels[locale].passages;
			}
			return labels[locale].other;
		},
		[locale],
	);

	const onNodeClick = useCallback(
		function onNodeClick(node: Node) {
			setSelectedSolaEntity({ id: node.id, type: node.type as SolaEntityType });
		},
		[setSelectedSolaEntity],
	);

	const isNodeSelected = useCallback(
		function isNodeSelected(node: Node) {
			if (selectedSolaEntity.data === undefined) return false;
			if (node.id === selectedSolaEntity.data.id && node.type === selectedSolaEntity.data.type) {
				return true;
			}
			return false;
		},
		[selectedSolaEntity.data],
	);

	const selectedSolaEntityRelationsSet = useMemo(() => {
		/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
		/* @ts-expect-error */
		const map: Record<SolaEntityType, Set<number>> = {};
		Object.entries(selectedSolaEntityRelations).forEach(([type, relations]) => {
			map[type as SolaEntityType] = new Set(
				relations.map((relation) => {
					return relation.related_entity.id;
				}),
			);
		});
		return map;
	}, [selectedSolaEntityRelations]);

	const isNodeHighlighted = useCallback(
		function isNodeHighlighted(node: Node) {
			switch (node.type as SolaEntityType) {
				case "Event": {
					if (selectedSolaEntityRelationsSet.Event.has(node.id)) {
						return true;
					}
					return false;
				}
				case "Institution": {
					if (selectedSolaEntityRelationsSet.Institution.has(node.id)) {
						return true;
					}
					return false;
				}
				case "Passage": {
					if (filteredSolaPassages.data === undefined) return false;
					if (filteredSolaPassages.data.passages[node.id] !== undefined) {
						return true;
					}
					return false;
				}
				case "Person": {
					if (selectedSolaEntityRelationsSet.Person.has(node.id)) {
						return true;
					}
					return false;
				}
				case "Place": {
					if (selectedSolaEntityRelationsSet.Place.has(node.id)) {
						return true;
					}
					return false;
				}
				case "Publication": {
					if (selectedSolaEntityRelationsSet.Publication.has(node.id)) {
						return true;
					}
					return false;
				}
				default:
					return false;
			}
		},
		[filteredSolaPassages, selectedSolaEntityRelationsSet],
	);

	return (
		<Fragment>
			<Timelines
				timelines={timelines}
				getTimelineForNodeType={getTimelineForNodeType}
				isNodeSelected={isNodeSelected}
				isNodeHighlighted={isNodeHighlighted}
				onNodeClick={onNodeClick}
				getLabelForNodeType={getLabelForNodeType}
			/>
			<Alternate
				filteredSolaPassages={filteredSolaPassages.data?.passages}
				setSelectedSolaEntity={setSelectedSolaEntity}
			/>
		</Fragment>
	);
}

function useNodes<T extends SolaListEntity>(map?: Record<number, T>) {
	return useMemo(() => {
		return Object.values(map ?? {})
			.filter(hasPrimaryDate)
			.map((entity) => {
				return createNode(entity, colors.text[entity.type]);
			});
	}, [map]);
}

function hasPrimaryDate(entity: SolaListEntity) {
	const hasDate = entity.primary_date != null && entity.primary_date.length > 0;
	if (!hasDate && entity.type !== "Place") {
		// console.log('Entity without primary date', entity)
	}
	return hasDate;
}

/**
 * Visually hidden alternative to the timeline visualization.
 */
function Alternate({
	filteredSolaPassages,
	setSelectedSolaEntity,
}: {
	filteredSolaPassages?: Record<number, SolaListEntity>;
	setSelectedSolaEntity: (entity: SolaSelectedEntity | null) => void;
}) {
	if (filteredSolaPassages === undefined) return null;

	return (
		<div className="sr-only">
			<h2>Passages matching active filters</h2>
			<ul>
				{Object.values(filteredSolaPassages).map((passage) => {
					return (
						<li key={passage.id}>
							<button
								onClick={() => {
									setSelectedSolaEntity({ id: passage.id, type: passage.type });
								}}
								// FIXME: Should these be included in the tab order or not?
								tabIndex={-1}
							>
								{passage.name}
							</button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
