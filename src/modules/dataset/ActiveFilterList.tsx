import { useSolaFilterOptions } from "@/lib/sola/hooks";
import type { SolaPassagesFilter } from "@/lib/sola/types";
import { useDatasetLabels } from "@/modules/dataset/labels";
import { Badge } from "@/modules/ui/Badge";
import { ClearButton } from "@/modules/ui/ClearButton";
import { TooltipTrigger } from "@/modules/ui/TooltipTrigger";

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

	const { name, authors, publications, topics, types } = filter;

	const hasAuthorsFilter = authors !== undefined && authors.length > 0;
	const hasNameFilter = name !== undefined && name.length > 0;
	const hasPublicationFilter = publications !== undefined && publications.length > 0;
	const hasPassageTopicsFilter = topics !== undefined && topics.length > 0;
	const hasPassageTypesFilter = types !== undefined && types.length > 0;

	if (
		!hasAuthorsFilter &&
		!hasNameFilter &&
		!hasPublicationFilter &&
		!hasPassageTopicsFilter &&
		!hasPassageTypesFilter
	) {
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
								<Badge className="min-w-0 space-x-1 text-gray-100 bg-gray-900 cursor-default select-none">
									<TooltipTrigger tooltip={`${t.filteredBy} ${t.title}: ${name}`}>
										<button
											type="button"
											className="font-medium truncate rounded-sm cursor-default focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
										>
											{name}
										</button>
									</TooltipTrigger>
									<ClearButton
										className="rounded-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
										onClick={() => {
											setFilter({ name: undefined });
										}}
									/>
								</Badge>
							</dd>
						</dl>
					</li>
				) : null}
				{hasAuthorsFilter ? (
					<li className="flex min-w-0 mr-1 md:mr-0">
						<dl className="flex items-center min-w-0">
							<dt className="sr-only">{t.authors[1]}:</dt>
							<dd className="flex min-w-0">
								<ul className="flex flex-wrap items-center min-w-0 md:justify-end md:space-x-1">
									{authors.map((id) => {
										const name = options.authors?.[id]?.name;
										return (
											<li className="flex min-w-0 mb-1 mr-1 md:mr-0" key={id}>
												<Badge className="min-w-0 space-x-1 text-gray-100 bg-gray-900 cursor-default select-none">
													<TooltipTrigger
														tooltip={`${t.filteredBy} ${t.authors[0]}: ${name ?? ""}`}
													>
														<button
															type="button"
															className="font-medium truncate rounded-sm cursor-default focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
														>
															{name}
														</button>
													</TooltipTrigger>
													<ClearButton
														className="rounded-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
														onClick={() => {
															setFilter({
																authors:
																	filter.authors === undefined || filter.authors.length === 1
																		? undefined
																		: filter.authors.filter((authorId) => {
																				return authorId !== id;
																			}),
															});
														}}
													/>
												</Badge>
											</li>
										);
									})}
								</ul>
							</dd>
						</dl>
					</li>
				) : null}
				{hasPublicationFilter ? (
					<li className="flex min-w-0 mr-1 md:mr-0">
						<dl className="flex items-center min-w-0">
							<dt className="sr-only">{t.entityType.Publication[1]}:</dt>
							<dd className="flex min-w-0">
								<ul className="flex flex-wrap items-center min-w-0 md:justify-end md:space-x-1">
									{publications.map((id) => {
										const name = options.publications?.[id]?.name;
										return (
											<li className="flex min-w-0 mb-1 mr-1 md:mr-0" key={id}>
												<Badge className="min-w-0 space-x-1 text-gray-100 bg-gray-900 cursor-default select-none">
													<TooltipTrigger
														tooltip={`${t.filteredBy} ${t.entityType.Publication[0]}: ${name ?? ""}`}
													>
														<button
															type="button"
															className="font-medium truncate rounded-sm cursor-default focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
														>
															{name}
														</button>
													</TooltipTrigger>
													<ClearButton
														className="rounded-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
														onClick={() => {
															setFilter({
																publications:
																	filter.publications === undefined ||
																	filter.publications.length === 1
																		? undefined
																		: filter.publications.filter((publicationId) => {
																				return publicationId !== id;
																			}),
															});
														}}
													/>
												</Badge>
											</li>
										);
									})}
								</ul>
							</dd>
						</dl>
					</li>
				) : null}
				{hasPassageTopicsFilter ? (
					<li className="flex min-w-0 mr-1 md:mr-0">
						<dl className="flex items-center min-w-0">
							<dt className="sr-only">{t.topics[1]}:</dt>
							<dd className="flex min-w-0">
								<ul className="flex flex-wrap items-center min-w-0 md:justify-end md:space-x-1">
									{topics.map((id) => {
										const name = options.passageTopics.data?.[id]?.name;
										return (
											<li className="flex min-w-0 mb-1 mr-1 md:mr-0" key={id}>
												<Badge className="min-w-0 space-x-1 text-gray-100 bg-gray-900 cursor-default select-none">
													<TooltipTrigger tooltip={`${t.filteredBy} ${t.topics[0]}: ${name ?? ""}`}>
														<button
															type="button"
															className="font-medium truncate rounded-sm cursor-default focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
														>
															{name}
														</button>
													</TooltipTrigger>
													<ClearButton
														className="rounded-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
														onClick={() => {
															setFilter({
																topics:
																	filter.topics === undefined || filter.topics.length === 1
																		? undefined
																		: filter.topics.filter((topicId) => {
																				return topicId !== id;
																			}),
															});
														}}
													/>
												</Badge>
											</li>
										);
									})}
								</ul>
							</dd>
						</dl>
					</li>
				) : null}
				{hasPassageTypesFilter ? (
					<li className="flex min-w-0 mr-1 md:mr-0">
						<dl className="flex items-center min-w-0">
							<dt className="sr-only">{t.types[1]}:</dt>
							<dd className="flex min-w-0">
								<ul className="flex flex-wrap items-center min-w-0 md:justify-end md:space-x-1">
									{types.map((id) => {
										const name = options.passageTypes.data?.[id]?.name;
										return (
											<li className="flex min-w-0 mb-1 mr-1 md:mr-0" key={id}>
												<Badge className="min-w-0 space-x-1 text-gray-100 bg-gray-900 cursor-default select-none">
													<TooltipTrigger tooltip={`${t.filteredBy} ${t.types[0]}: ${name ?? ""}`}>
														<button
															type="button"
															className="font-medium truncate rounded-sm cursor-default focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
														>
															{name}
														</button>
													</TooltipTrigger>
													<ClearButton
														className="rounded-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
														onClick={() => {
															setFilter({
																types:
																	filter.types === undefined || filter.types.length === 1
																		? undefined
																		: filter.types.filter((typeId) => {
																				return typeId !== id;
																			}),
															});
														}}
													/>
												</Badge>
											</li>
										);
									})}
								</ul>
							</dd>
						</dl>
					</li>
				) : null}
			</ul>
		</div>
	);
}
