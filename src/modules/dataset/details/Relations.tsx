import cx from "clsx";
import { useExtracted } from "next-intl";

import type { SolaEntityRelation, SolaEntityType } from "@/api/sola/client";
import type { SolaSelectedEntity } from "@/lib/sola/types";
import { useEntityTypeLabels } from "@/modules/dataset/useEntityTypeLabels";
import { Badge } from "@/modules/ui/Badge";
import sola from "~/config/sola.json" with { type: "json" };

const { colors } = sola;

export function Relations({
	relations,
	setSelectedSolaEntity,
}: {
	relations: Record<SolaEntityType, Array<SolaEntityRelation>>;
	setSelectedSolaEntity: (entity: SolaSelectedEntity | null) => void;
}) {
	const t = useExtracted();
	const entityTypeLabels = useEntityTypeLabels();

	if (
		relations.Event.length === 0 &&
		relations.Institution.length === 0 &&
		relations.Passage.length === 0 &&
		relations.Person.length === 0 &&
		relations.Place.length === 0 &&
		relations.Publication.length === 0
	) {
		return null;
	}

	return (
		<div className="space-y-1">
			<h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
				{t("Relations")}
			</h3>
			<dl className="space-y-1 text-xs text-gray-700">
				{Object.entries(relations).map(([type, relations]) => {
					if (relations.length === 0) return null;

					/**
					 * Only show unique related entities.
					 *
					 * TODO: should be memoized.
					 */
					const seenIds = new Set();

					return (
						<div key={type}>
							<dt className="sr-only">{entityTypeLabels[type as SolaEntityType][1]}</dt>
							<dd>
								<ul className="flex flex-wrap items-center">
									{relations.map((relation) => {
										/** Only show unique related entities. */
										if (seenIds.has(relation.related_entity.id)) return null;
										seenIds.add(relation.related_entity.id);

										return (
											<li className="min-w-0 mb-1 mr-1" key={relation.id}>
												<Badge
													variant="tight"
													className={cx(
														"inline-block max-w-full transition",
														colors.bg[type as SolaEntityType],
													)}
												>
													<button
														className="px-2 py-0.5 rounded-sm inline-block font-medium truncate cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-900"
														onClick={() => {
															setSelectedSolaEntity({
																id: relation.related_entity.id,
																type: relation.related_entity.type,
															});
														}}
														type="button"
													>
														{relation.related_entity.label}
													</button>
												</Badge>
											</li>
										);
									})}
								</ul>
							</dd>
						</div>
					);
				})}
			</dl>
		</div>
	);
}
