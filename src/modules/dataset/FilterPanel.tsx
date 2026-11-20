import { type SubmitEvent, Fragment, useEffect, useMemo, useState } from "react";

import type { SolaVocabulary } from "@/api/sola/client";
import { useDebouncedData } from "@/lib/data/useDebouncedData";
import type { Node } from "@/lib/data/useHierarchicalData";
import { useSortedData } from "@/lib/data/useSortedData";
import { useSolaFilterOptions, useSolaPassagesFilterOptionsTree } from "@/lib/sola/hooks";
import type { SolaPassagesFilter } from "@/lib/sola/types";
import { type DatasetLabels, useDatasetLabels } from "@/modules/dataset/labels";
import { ClearButton } from "@/modules/ui/ClearButton";
import { Disclosure } from "@/modules/ui/Disclosure";
import { ListBox, ListBoxItem, ListBoxSection } from "@/modules/ui/ListBox";
import { Spinner } from "@/modules/ui/Spinner";
import { TextField } from "@/modules/ui/TextField";

/**
 * Facets to filter passages highlighted in the timeline visualization.
 */
export function FilterPanel({
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
	const t = useDatasetLabels();

	const { authors, passageTopics, passageTypes, publications } = useSolaFilterOptions();

	function onSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	const [title, setTitle] = useState(filter.name ?? "");
	const debouncedTitle = useDebouncedData(title.trim(), 150);

	useEffect(() => {
		setFilter({ name: debouncedTitle });
	}, [debouncedTitle, setFilter]);

	useEffect(() => {
		/** Clear text input. */
		if (filter.name === undefined) {
			setTitle("");
		}
	}, [filter.name]);

	const [searchTermInput, setSearchTermInput] = useState(searchTerm ?? "");
	const debouncedSearchTermInput = useDebouncedData(searchTermInput.trim(), 150);

	useEffect(() => {
		setSearchTerm(debouncedSearchTermInput);
	}, [debouncedSearchTermInput, setSearchTerm]);

	useEffect(() => {
		/** Clear text input. */
		if (searchTerm === undefined) {
			setSearchTermInput("");
		}
	}, [searchTerm]);

	const sortedAuthors = useSortedData(authors, "name");
	const sortedPublications = useSortedData(publications, "name");
	const { passageTopicsTree, passageTypesTree } = useSolaPassagesFilterOptionsTree(
		passageTopics.data,
		passageTypes.data,
		t.other,
	);

	if (
		authors === undefined ||
		passageTopics.data === undefined ||
		passageTypes.data === undefined ||
		publications === undefined
	) {
		return (
			<aside
				className="flex items-center justify-center px-4 py-6 text-gray-100 bg-gray-900"
				style={{ gridArea: "panel" }}
			>
				<Spinner className="w-6 h-6" />
			</aside>
		);
	}

	return (
		<aside
			className="overflow-y-auto bg-gray-900 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-400"
			style={{ gridArea: "panel" }}
		>
			<form className="flex flex-col px-4 py-6 space-y-3" onSubmit={onSubmit}>
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-gray-300">{t.filterPassages}</h2>
					<ClearButton
						aria-label={t.reset}
						className="p-2 text-gray-300 transition rounded-sm hover:text-gray-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400 hover:bg-gray-800"
						onClick={() => {
							setFilter({
								authors: undefined,
								name: undefined,
								publications: undefined,
								topics: undefined,
								types: undefined,
							});
							setSearchTerm(undefined);
						}}
					/>
				</div>
				{/* <TextField
          label={t.title}
          value={title}
          onChange={setTitle}
          className="transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
        /> */}
				<TextField
					label={t.search}
					value={searchTermInput}
					onChange={setSearchTermInput}
					className="transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-yellow-400"
				/>
				<hr className="border-gray-500" />
				<Disclosure
					id="authors-filter"
					panelId="authors-filter-panel"
					className="text-gray-300 transition hover:text-white"
					title={createListboxLabel(t.authors[1], sortedAuthors.length, filter.authors?.length)}
				>
					<ListBox
						selectionMode="multiple"
						aria-labelledby="authors-filter"
						items={sortedAuthors}
						selectedKeys={filter.authors ?? []}
						onSelectionChange={(ids) => {
							if (ids === "all") return;
							setFilter({ authors: Array.from(ids) as Array<number> });
						}}
					>
						{(item) => {
							return <ListBoxItem>{item.name}</ListBoxItem>;
						}}
					</ListBox>
				</Disclosure>
				<hr className="border-gray-500" />
				<Disclosure
					id="publications-filter"
					panelId="publications-filter-panel"
					className="text-gray-300 transition hover:text-white"
					title={createListboxLabel(
						t.entityType.Publication[1],
						sortedPublications.length,
						filter.publications?.length,
					)}
				>
					<ListBox
						selectionMode="multiple"
						aria-labelledby="publications-filter"
						items={sortedPublications}
						selectedKeys={filter.publications ?? []}
						onSelectionChange={(ids) => {
							if (ids === "all") return;
							setFilter({ publications: Array.from(ids) as Array<number> });
						}}
					>
						{(item) => {
							return <ListBoxItem>{item.name}</ListBoxItem>;
						}}
					</ListBox>
				</Disclosure>
				<hr className="border-gray-500" />
				<Disclosure
					id="passage-types-filter"
					panelId="passage-types-filter-panel"
					className="text-gray-300 transition hover:text-white"
					title={createListboxLabel(t.types[1], passageTypesTree.length, filter.types?.length)}
				>
					<ListBox
						selectionMode="multiple"
						aria-labelledby="passage-types-filter"
						items={passageTypesTree}
						selectedKeys={filter.types ?? []}
						onSelectionChange={(ids) => {
							if (ids === "all") return;
							setFilter({ types: Array.from(ids) as Array<number> });
						}}
					>
						{(item) => {
							if (item.children !== undefined && item.children.size > 0) {
								return (
									<ListBoxSection
										id={`section-${String(item.id)}`}
										title={item.name}
										items={item.children}
									>
										{(item) => {
											return <ListBoxItem>{item.name}</ListBoxItem>;
										}}
									</ListBoxSection>
								);
							} else {
								return <ListBoxItem>{item.name}</ListBoxItem>;
							}
						}}
					</ListBox>
				</Disclosure>
				{passageTopicsTree.map((topic) => {
					return (
						<PassageTopicListBox
							key={topic.id}
							topic={topic}
							filter={filter.topics}
							setFilter={setFilter}
							t={t}
						/>
					);
				})}
			</form>
		</aside>
	);
}

function createListboxLabel(label: string, total?: number, selected?: number) {
	if (total === undefined || total === 0) return label;
	if (selected === undefined || selected === 0) return `${label} (${String(total)})`;
	return `${label} (${String(selected)}/${String(total)})`;
}

function PassageTopicListBox({
	topic,
	filter,
	setFilter,
	t,
}: {
	topic: Node<SolaVocabulary>;
	filter: Array<number> | undefined;
	setFilter: (filter: SolaPassagesFilter) => void;
	t: DatasetLabels;
}) {
	const topics = useMemo(() => {
		if (topic.children.size === 0) return [];

		/** Sort alphabetically, sort "Other" to end. */
		return Array.from(topic.children).sort((a, b) => {
			return a.id === topic.id ? 1 : b.id === topic.id ? -1 : a.name.localeCompare(b.name);
		});
	}, [topic]);

	const selectedCount = useMemo(() => {
		const childIds = new Set(
			topics.map((topic) => {
				return topic.id;
			}),
		);
		return filter?.filter((topicId) => {
			return childIds.has(topicId);
		}).length;
	}, [topics, filter]);

	if (topic.children.size === 0) return null;

	const id = `passage-topic-${String(topic.id)}-filter`;

	return (
		<Fragment>
			<hr className="border-gray-500" />
			<Disclosure
				id={id}
				panelId={`${id}-panel`}
				className="text-gray-300 transition hover:text-white"
				title={createListboxLabel(`${t.topics[0]}: ${topic.name}`, topics.length, selectedCount)}
			>
				<ListBox
					selectionMode="multiple"
					aria-labelledby={id}
					items={topics}
					selectedKeys={filter ?? []}
					onSelectionChange={(ids) => {
						if (ids === "all") return;
						setFilter({ topics: Array.from(ids) as Array<number> });
					}}
				>
					{(item) => {
						return <ListBoxItem>{item.name}</ListBoxItem>;
					}}
				</ListBox>
			</Disclosure>
		</Fragment>
	);
}
