import { useSolaFilterOptions } from "@/lib/sola/hooks";
import type { SolaPassagesFilter } from "@/lib/sola/types";
import { useDatasetLabels } from "@/modules/dataset/labels";
import { Badge } from "@/modules/ui/Badge";
import { ClearButton } from "@/modules/ui/ClearButton";
import { TooltipTrigger } from "@/modules/ui/TooltipTrigger";

/** Filters which select passages by a list of vocabulary ids. */
type IdsFilterKey = "authors" | "publications" | "topics" | "types";

interface IdsFilterGroup {
	key: IdsFilterKey;
	/** Singular and plural label. */
	label: readonly [string, string];
	ids: Array<number>;
	names: Record<number, { name: string } | undefined>;
}

export function ActiveFilterList({
	filter,
	setFilter,
}: {
	filter: SolaPassagesFilter;
	setFilter: (filter: SolaPassagesFilter) => void;
	searchTerm: string | undefined;
	setSearchTerm: (searchTerm: string | undefined) => void;
}) {
	const t = useDatasetLabels();

	const options = useSolaFilterOptions();

	if (
		options.authors === undefined ||
		options.passageTopics.data === undefined ||
		options.passageTypes.data === undefined ||
		options.publications === undefined
	) {
		return <div className="pb-2 text-xs">&nbsp;</div>;
	}

	const { name } = filter;
	const hasNameFilter = name !== undefined && name.length > 0;

	const groups: Array<IdsFilterGroup> = [
		{ key: "authors", label: t.authors, ids: filter.authors ?? [], names: options.authors },
		{
			key: "publications",
			label: t.entityType.Publication,
			ids: filter.publications ?? [],
			names: options.publications,
		},
		{
			key: "topics",
			label: t.topics,
			ids: filter.topics ?? [],
			names: options.passageTopics.data,
		},
		{ key: "types", label: t.types, ids: filter.types ?? [], names: options.passageTypes.data },
	];
	const activeGroups = groups.filter((group) => {
		return group.ids.length > 0;
	});

	if (!hasNameFilter && activeGroups.length === 0) {
		return <div className="pb-2 text-xs">&nbsp;</div>;
	}

	return (
		<div className="flex flex-wrap items-center text-xs text-gray-500 md:justify-end">
			<h2 className="sr-only">{t.filteredBy}:</h2>
			<ul className="flex flex-wrap items-center min-w-0 md:justify-end md:space-x-1">
				{hasNameFilter ? (
					<li className="flex min-w-0 mb-1 mr-1 md:mr-0">
						<dl className="flex items-center min-w-0">
							<dt className="sr-only">{t.title}:</dt>
							<dd className="flex min-w-0">
								<ActiveFilterBadge
									label={name}
									tooltip={`${t.filteredBy} ${t.title}: ${name}`}
									onRemove={() => {
										setFilter({ name: undefined });
									}}
								/>
							</dd>
						</dl>
					</li>
				) : null}
				{activeGroups.map(({ key, label, ids, names }) => {
					return (
						<li key={key} className="flex min-w-0 mr-1 md:mr-0">
							<dl className="flex items-center min-w-0">
								<dt className="sr-only">{label[1]}:</dt>
								<dd className="flex min-w-0">
									<ul className="flex flex-wrap items-center min-w-0 md:justify-end md:space-x-1">
										{ids.map((id) => {
											const name = names[id]?.name;
											return (
												<li key={id} className="flex min-w-0 mb-1 mr-1 md:mr-0">
													<ActiveFilterBadge
														label={name}
														tooltip={`${t.filteredBy} ${label[0]}: ${name ?? ""}`}
														onRemove={() => {
															const remaining = ids.filter((selectedId) => {
																return selectedId !== id;
															});
															setFilter({ [key]: remaining.length > 0 ? remaining : undefined });
														}}
													/>
												</li>
											);
										})}
									</ul>
								</dd>
							</dl>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

function ActiveFilterBadge({
	label,
	tooltip,
	onRemove,
}: {
	label: string | undefined;
	tooltip: string;
	onRemove: () => void;
}) {
	return (
		<Badge className="min-w-0 space-x-1 text-gray-100 bg-gray-900 cursor-default select-none">
			<TooltipTrigger tooltip={tooltip}>
				<button
					type="button"
					className="font-medium truncate rounded-sm cursor-default focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
				>
					{label}
				</button>
			</TooltipTrigger>
			<ClearButton
				className="rounded-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
				onClick={onRemove}
			/>
		</Badge>
	);
}
