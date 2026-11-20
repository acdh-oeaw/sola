import type { SolaEntityDetails, SolaPassageDetails } from "@/api/sola/client";
import type { SolaPassagesFilter } from "@/lib/sola/types";
import { useDatasetLabels } from "@/modules/dataset/labels";
import { Badge } from "@/modules/ui/Badge";

export function Properties({
	entity,
	setFilter,
}: {
	entity?: SolaEntityDetails;
	setFilter: (filter: SolaPassagesFilter) => void;
}) {
	if (entity === undefined) return null;

	if (entity.type === "Passage") {
		return <PassageProperties entity={entity} setFilter={setFilter} />;
	}

	return null;
}

function PassageProperties({
	entity,
	setFilter,
}: {
	entity: SolaPassageDetails;
	setFilter: (filter: SolaPassagesFilter) => void;
}) {
	const t = useDatasetLabels();

	const hasPassageTopics = entity.topic.length > 0;
	const hasPassageTypes = entity.kind.length > 0;

	if (!hasPassageTopics && !hasPassageTypes) return null;

	return (
		<div className="space-y-1">
			<h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
				{t.properties}
			</h3>

			<dl className="space-y-1 text-xs text-gray-700">
				{hasPassageTopics ? (
					<div>
						<dt className="sr-only">{t.topics[1]}</dt>
						<dd>
							<ul className="flex flex-wrap items-center">
								{entity.topic.map((topic) => {
									return (
										<li className="min-w-0 mb-1 mr-1" key={topic.id}>
											<Badge
												variant="tight"
												className="inline-block max-w-full text-gray-100 transition bg-gray-800 hover:bg-black hover:text-gray-200"
											>
												<button
													className="rounded-sm px-2 py-0.5 inline-block font-medium truncate cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
													onClick={() => {
														setFilter({
															topics: [topic.id],
														});
													}}
													type="button"
												>
													{topic.label}
												</button>
											</Badge>
										</li>
									);
								})}
							</ul>
						</dd>
					</div>
				) : null}
				{hasPassageTypes ? (
					<div>
						<dt className="sr-only">{t.types[1]}</dt>
						<dd>
							<ul className="flex flex-wrap items-center">
								{entity.kind.map((kind) => {
									return (
										<li className="min-w-0 mb-1 mr-1" key={kind.id}>
											<Badge
												variant="tight"
												className="inline-block max-w-full text-gray-100 transition bg-gray-800 hover:bg-black hover:text-gray-200"
											>
												<button
													className="rounded-sm px-2 py-0.5 inline-block font-medium truncate cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
													onClick={() => {
														setFilter({
															types: [kind.id],
														});
													}}
													type="button"
												>
													{kind.label}
												</button>
											</Badge>
										</li>
									);
								})}
							</ul>
						</dd>
					</div>
				) : null}
			</dl>
		</div>
	);
}
