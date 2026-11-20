import { groupBy, keyBy } from "@acdh-oeaw/lib";
import { keepPreviousData, queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";

import {
	type Results,
	type SolaEntity,
	type SolaEntityDetails,
	type SolaEntityRelation,
	type SolaEntityType,
	type SolaListEntity,
	type SolaPassageDetails,
	type SolaTextDetails,
	type SolaUser,
	type SolaVocabulary,
	getSolaEntities,
	getSolaEntityBibliographyById,
	getSolaEventById,
	getSolaInstitutionById,
	getSolaPassageById,
	getSolaPassagePublicationRelations,
	getSolaPassageTopics,
	getSolaPassageTypes,
	getSolaPersonById,
	getSolaPlaceById,
	getSolaPublicationById,
	getSolaTextById,
	getSolaTextTypes,
	getSolaUsers,
} from "@/api/sola/client";
import { useHierarchicalData } from "@/lib/data/useHierarchicalData";
import type { SiteLocale } from "@/lib/i18n/getCurrentLocale";
import { useCurrentLocale } from "@/lib/i18n/useCurrentLocale";
import type { SolaPassagesFilter, SolaSelectedEntity } from "@/lib/sola/types";
import { getQueryParam } from "@/lib/url/getQueryParam";
import { capitalize } from "@/lib/util/capitalize";
import bibleBooks from "~/config/bible.json" with { type: "json" };

function noop() {
	/** Noop. */
}

/** Fetch everything from the list endpoint in one request. */
const defaultQuery = { limit: 10_000 };

/**
 * Fetches all SOLA entities and returns entities mapped by id.
 */
export function useSolaEntities() {
	const locale = useCurrentLocale();

	return useQuery({
		queryKey: ["getSolaEntities", locale, {}],
		queryFn: async () => {
			const data = await getSolaEntities({ query: defaultQuery, locale });

			const grouped = groupBy(data.results, (result) => {
				return result.type;
			});

			const results = {
				events: keyBy(grouped.Event ?? [], (entry) => {
					return entry.id;
				}),
				institutions: keyBy(grouped.Institution ?? [], (entry) => {
					return entry.id;
				}),
				passages: keyBy(grouped.Passage ?? [], (entry) => {
					return entry.id;
				}),
				persons: keyBy(grouped.Person ?? [], (entry) => {
					return entry.id;
				}),
				places: keyBy(grouped.Place ?? [], (entry) => {
					return entry.id;
				}),
				publications: keyBy(grouped.Publication ?? [], (entry) => {
					return entry.id;
				}),
			};

			return results;
		},
	});
}

/**
 * Sets SOLA passages search term.
 */
export function useSolaPassagesSearchTerm() {
	const [searchTerm, setSearchTerm] = useState<string | undefined>();

	const setSolaPassagesSearch = useCallback(function setSolaPassagesSearch(
		searchTerm: string | undefined,
	) {
		setSearchTerm(searchTerm);
	}, []);

	return {
		searchTerm,
		setSearchTerm: setSolaPassagesSearch,
	};
}

/**
 * Sets SOLA passages filter.
 */
export function useSolaPassagesFilter() {
	const [filter, setFilter] = useState<SolaPassagesFilter>({});

	const setSolaPassagesFilter = useCallback(function setSolaPassagesFilter(
		filter: SolaPassagesFilter,
	) {
		setFilter((prev) => {
			return { ...prev, ...filter };
		});
	}, []);

	return {
		solaPassagesFilter: filter,
		setSolaPassagesFilter,
	};
}

/**
 * Fetches SOLA passages matching the currently active filter,
 * and merges in search results retuned by the free-form search.
 */
export function useSolaFilteredPassages(
	filter: SolaPassagesFilter,
	searchTerm: string | undefined = "",
) {
	const locale = useCurrentLocale();

	const { passage } = useSolaRelationTypes();

	const query = useMemo(() => {
		const hasAuthorsFilter = filter.authors !== undefined && filter.authors.length > 0;

		return sanitize({
			search: searchTerm,
			name__icontains: filter.name,
			kind__id__in: filter.types,
			topic__id__in: filter.topics,
			publication_set__id__in: filter.publications,
			/** Filter passage by publication authors with the updated endpoint. */
			publication_set__person_set__id__in: filter.authors,
			/** This should no longer be necessary. */
			// publication_set__person_relationtype_set__id: hasAuthorsFilter
			//   ? person.isAuthorOf
			//   : undefined,
			publication_relationtype_set__id: hasAuthorsFilter ? passage.isIncludedIn : undefined,
		});
	}, [filter, searchTerm, passage]);

	return useQuery({
		queryKey: ["getSolaEntities", locale, query],
		queryFn: async () => {
			const data = await getSolaEntities({ query: { ...defaultQuery, ...query }, locale });

			const grouped = groupBy(data.results, (result) => {
				return result.type;
			});

			const results = {
				events: keyBy(grouped.Event ?? [], (entry) => {
					return entry.id;
				}),
				institutions: keyBy(grouped.Institution ?? [], (entry) => {
					return entry.id;
				}),
				passages: keyBy(grouped.Passage ?? [], (entry) => {
					return entry.id;
				}),
				persons: keyBy(grouped.Person ?? [], (entry) => {
					return entry.id;
				}),
				places: keyBy(grouped.Place ?? [], (entry) => {
					return entry.id;
				}),
				publications: keyBy(grouped.Publication ?? [], (entry) => {
					return entry.id;
				}),
			};

			return results;
		},
	});
}

/**
 * Type guard for valid SOLA entity type.
 */
export function isSolaEntityType(type: string): type is SolaEntityType {
	const allowedTypes: Array<SolaEntityType> = [
		"Event",
		"Institution",
		"Passage",
		"Person",
		"Place",
		"Publication",
	];
	return (allowedTypes as Array<unknown>).includes(type);
}

/**
 * Fetches currently selected SOLA entity.
 */
export function useSolaSelectedEntity() {
	const router = useRouter();
	const locale = useCurrentLocale();
	const queryClient = useQueryClient();

	const setSelectedSolaEntity = useCallback(
		function setSelectedSolaEntity(entity: SolaSelectedEntity | null) {
			if (entity !== null) {
				const { id, type } = entity;
				void router.push({ query: { ...router.query, id, type } }, undefined, {
					shallow: true,
				});
			} else {
				const { id, type, ...query } = router.query;
				if (id !== undefined || type !== undefined) {
					void router.push({ query }, undefined, { shallow: true });
				}
			}
		},
		[router],
	);

	const selected: SolaSelectedEntity | null = useMemo(() => {
		if (router.isReady) {
			const { query } = router;
			const id = getQueryParam(query.id, false, Number);
			if (id !== undefined && id > 0) {
				const type = getQueryParam(query.type, false, capitalize);
				if (type !== undefined && isSolaEntityType(type)) {
					return { id, type };
				}
			}
		}

		return null;
	}, [router]);

	const selectedSolaEntity = useQuery<SolaEntityDetails>({
		queryKey: ["getSolaEntityById", locale, selected, {}],
		/**
		 * Texts, bibliography, and passage authors and bible passages are fetched in dependent
		 * queries. Prefetch them before resolving, so the details panel can switch to the new entity
		 * in one go, instead of individual sections loading one after the other.
		 *
		 * Prefetch errors are ignored, and left to the dependent queries to handle.
		 */
		queryFn: async () => {
			const { id, type } = selected!;

			const bibliography = queryClient
				.query(solaEntityBibliographyQueryOptions(locale, id, type))
				.catch(noop);
			const textTypes = queryClient.query(solaTextTypesQueryOptions(locale)).catch(noop);

			const entity = await getSolaEntityById(id, type, locale);

			const textIds = getSolaTextIds(entity);
			const texts =
				textIds.length > 0
					? queryClient.query(solaTextsQueryOptions(locale, textIds)).catch(noop)
					: null;

			const passage = entity.type === "Passage" ? entity : undefined;
			const publicationId = getSolaPassagePublicationId(passage);
			const authors =
				publicationId !== undefined
					? queryClient.query(solaPublicationQueryOptions(locale, publicationId)).catch(noop)
					: null;
			const bibleRelationIds = getSolaBibleRelationIds(passage);
			const biblePassages =
				bibleRelationIds.length > 0
					? queryClient
							.query(solaPassagePublicationRelationsQueryOptions(locale, bibleRelationIds))
							.catch(noop)
					: null;

			await Promise.all([bibliography, textTypes, texts, authors, biblePassages]);

			return entity;
		},
		enabled: selected !== null,
		/**
		 * Keep showing the previous entity while switching entities, but not when the selection
		 * has been cleared: disabled queries would otherwise keep placeholder data indefinitely.
		 */
		placeholderData: selected !== null ? keepPreviousData : undefined,
	});

	return {
		selectedSolaEntity,
		setSelectedSolaEntity,
	};
}

function getSolaEntityById(
	id: number,
	type: SolaEntityType,
	locale: SiteLocale,
): Promise<SolaEntityDetails> {
	switch (type) {
		case "Event":
			return getSolaEventById({ id, locale });
		case "Institution":
			return getSolaInstitutionById({ id, locale });
		case "Passage":
			return getSolaPassageById({ id, locale });
		case "Person":
			return getSolaPersonById({ id, locale });
		case "Place":
			return getSolaPlaceById({ id, locale });
		case "Publication":
			return getSolaPublicationById({ id, locale });
	}
}

/**
 * Fetches possible values for SOLA passage filters.
 */
export function useSolaFilterOptions() {
	const locale = useCurrentLocale();

	const passageTopics = useQuery({
		queryKey: ["getSolaPassageTopics", locale, {}],
		queryFn: () => {
			return getSolaPassageTopics({ query: defaultQuery, locale });
		},
		select: mapResultsById,
	});
	const passageTypes = useQuery({
		queryKey: ["getSolaPassageTypes", locale, {}],
		queryFn: () => {
			return getSolaPassageTypes({ query: defaultQuery, locale });
		},
		select: mapResultsById,
	});

	const { data } = useSolaEntities();
	const publications = data?.publications;
	const authors = data?.persons;

	return {
		authors,
		passageTopics,
		passageTypes,
		publications,
	};
}

/**
 * Adds necessary modifications to SOLA passages filter options
 * for use in listboxes.
 */
export function useSolaPassagesFilterOptionsTree(
	passageTopics: Record<number, SolaVocabulary> | undefined,
	passageTypes: Record<number, SolaVocabulary> | undefined,
	translation: string,
) {
	const getParentId = useCallback((entity: SolaVocabulary) => {
		return entity.parent_class?.id ?? null;
	}, []);
	const _passageTopics = useHierarchicalData(passageTopics, getParentId);
	const _passageTypes = useHierarchicalData(passageTypes, getParentId);

	/**
	 * Add a "Other" entry for every top-level passage topic,
	 * since topics which have child topics can themselves have
	 * passages associated with them.
	 */
	const passageTopicsTree = useMemo(() => {
		return _passageTopics.map((parent) => {
			if (parent.children.size === 0) return parent;

			const childTopics = Array.from(parent.children);
			if (
				!childTopics.find((topic) => {
					return topic.id === parent.id;
				})
			) {
				parent.children.add({
					id: parent.id,
					name: translation,
					parent_class: null,
					children: new Set(),
				});
			}

			return parent;
		});
	}, [_passageTopics, translation]);

	/**
	 * Add a "Other" entry for every top-level passage type,
	 * since types which have child types can themselves have
	 * passages associated with them.
	 * Also, group types without children in their own section.
	 */
	const passageTypesTree = useMemo(() => {
		const otherSection = _passageTypes.find((type) => {
			return type.id === -1;
		}) ?? {
			id: -1,
			name: translation,
			children: new Set(),
		};

		const result = [otherSection];

		_passageTypes.forEach((parent) => {
			if (parent.id === -1) return;

			if (parent.children.size === 0) {
				otherSection.children.add(parent);
				return;
			}

			const childTopics = Array.from(parent.children);
			if (
				!childTopics.find((topic) => {
					return topic.id === parent.id;
				})
			) {
				parent.children.add({
					id: parent.id,
					name: translation,
					parent_class: null,
					children: new Set(),
				});
			}
			result.unshift(parent);
		});

		return result;
	}, [_passageTypes, translation]);

	return {
		passageTopicsTree,
		passageTypesTree,
	};
}

/**
 * Returns relation type ids, mapped by entity type.
 */
export function useSolaRelationTypes() {
	return solaRelationTypes;
}

const solaRelationTypes = {
	passage: {
		hasBibleCitation: 205,
		hasBibleReference: 204,
		isIncludedIn: 189,
	},
	person: {
		isAuthorOf: 187,
	},
};

function getSolaPassagePublicationId(passage: SolaPassageDetails | undefined) {
	const isIncludedInRelation = passage?.relations.find((relation) => {
		return (
			relation.related_entity.type === "Publication" &&
			relation.relation_type.id === solaRelationTypes.passage.isIncludedIn
		);
	});
	return isIncludedInRelation?.related_entity.id;
}

function getSolaBibleRelationIds(passage: SolaPassageDetails | undefined): Array<number> {
	const bibleRelations = passage?.relations.filter((relation) => {
		return (
			relation.related_entity.type === "Publication" &&
			relation.related_entity.id === 248 /* bible id */ &&
			[
				solaRelationTypes.passage.hasBibleCitation || solaRelationTypes.passage.hasBibleReference,
			].includes(relation.relation_type.id)
		);
	});
	return (
		bibleRelations?.map((relation) => {
			return relation.id;
		}) ?? []
	);
}

function solaPublicationQueryOptions(locale: SiteLocale, id: number | undefined) {
	return queryOptions({
		queryKey: ["getPublicationById", locale, id, {}],
		queryFn: () => {
			return getSolaPublicationById({ id: id!, locale });
		},
	});
}

function solaPassagePublicationRelationsQueryOptions(locale: SiteLocale, ids: Array<number>) {
	const query = { id__in: ids };
	return queryOptions({
		queryKey: ["getSolaPassagePublicationRelations", locale, query],
		queryFn: () => {
			return getSolaPassagePublicationRelations({ query, locale });
		},
	});
}

/**
 * Returns SOLA entity metadata specific for passages:
 * publication authors and bible passages.
 */
export function useSolaPassageMetadata(passage: SolaPassageDetails | undefined) {
	const locale = useCurrentLocale();

	const relationTypes = useSolaRelationTypes();

	/**
	 * Fetch publication author: first fetch related publication with relation type
	 * "is_included_in" (id 189), then get related author of that publication with
	 * relation type "is_author_of" (id 187).
	 */
	const publicationId = getSolaPassagePublicationId(passage);

	/**
	 * No need to fetch authors with `getSolaPersons?id__in=authorIds`,
	 * since we already have all persons cached.
	 */
	const q = useSolaEntities();
	const persons = q.data?.persons;

	const authors = useQuery({
		...solaPublicationQueryOptions(locale, publicationId),
		enabled: publicationId !== undefined && persons !== undefined,
		/** Never show data of a previously selected entity. */
		placeholderData: undefined,
		select: (results) => {
			const isAuthorOfRelations = results.relations.filter((relation) => {
				return (
					relation.related_entity.type === "Person" &&
					relation.relation_type.id === relationTypes.person.isAuthorOf
				);
			});
			const authorIds = isAuthorOfRelations.map((relation) => {
				return relation.related_entity.id;
			});

			return authorIds.map((id) => {
				return persons![id]!;
			});
		},
	});

	/**
	 * Fetch relations to bible and corresponding bible passages. Info about the referenced/cited
	 * bible passage is a property of passage->publication relation.
	 */
	const bibleRelationIds = getSolaBibleRelationIds(passage);
	const biblePassages = useQuery({
		...solaPassagePublicationRelationsQueryOptions(locale, bibleRelationIds),
		enabled: bibleRelationIds.length > 0,
		/** Never show data of a previously selected entity. */
		placeholderData: undefined,
		select: (results) => {
			const map: Record<string, string> = {};
			results.results.forEach((result) => {
				if (
					result.bible_book_ref == null &&
					result.bible_chapter_ref == null &&
					result.bible_verse_ref == null
				) {
					return;
				}
				const label = [
					/**
					 * The backend lowercases bible book ref, but we want to display correctly capitalized
					 * bible book names. Instead of a string lookup on the frontend, the backend just should
					 * not touch capitalization at all!
					 */
					(bibleBooks as Record<string, string>)[result.bible_book_ref!] ?? result.bible_book_ref,
					[result.bible_chapter_ref, result.bible_verse_ref].filter(Boolean).join(":"),
				]
					.filter(Boolean)
					.join(" ");
				const reference = [
					result.bible_book_ref,
					[result.bible_chapter_ref, result.bible_verse_ref].filter(Boolean).join(":"),
				]
					.filter(Boolean)
					.join(".");
				const url = new URL("https://stepbible.org");
				url.searchParams.set("q", `reference=${reference}`);
				map[label] = String(url);
			});
			return map;
		},
	});

	return {
		authors,
		biblePassages,
	};
}

/**
 * Maps entity relations by type of related entity.
 */
export function useSolaEntityRelations(entity: SolaEntityDetails | undefined) {
	return useMemo(() => {
		const map: Record<SolaEntityType, Array<SolaEntityRelation>> = {
			Event: [],
			Institution: [],
			Passage: [],
			Person: [],
			Place: [],
			Publication: [],
		};
		if (entity === undefined) return map;
		entity.relations.forEach((relation) => {
			map[relation.related_entity.type].push(relation);
		});
		return map;
	}, [entity]);
}

function solaEntityBibliographyQueryOptions(
	locale: SiteLocale,
	id: number | undefined,
	type: SolaEntityType | undefined,
) {
	return queryOptions({
		queryKey: [
			"getSolaEntityBibliographyById",
			locale,
			id,
			{ attribute: "include", contenttype: type },
		],
		queryFn: () => {
			const query = { attribute: "include", contenttype: type! };
			return getSolaEntityBibliographyById({ id: id!, query, locale });
		},
	});
}

/**
 * Fetches bibliography for SOLA entity.
 */
export function useSolaEntityBibliography(entity: SolaEntity | undefined) {
	const locale = useCurrentLocale();

	const id = entity?.id;
	const type = entity?.type;

	const bibliography = useQuery({
		...solaEntityBibliographyQueryOptions(locale, id, type),
		enabled: id !== undefined && type !== undefined,
		/** Never show data of a previously selected entity. */
		placeholderData: undefined,
	});

	return bibliography;
}

/**
 * Returns text type ids mapped by entity type and locale.
 *
 * These are hardcoded to avoid fetching *all* text types, and because there is
 * currently no way to retrieve info about the texttype locale from the backend.
 * `{ id: 5, label: 'Original text / citation' }` is included in all locales.
 * `{ id: 176: label: 'Inhalt (ist zu übertragen zu publications)' }` is ignored.
 */
export function useSolaTextTypes() {
	const textTypesByLocale: Record<
		SolaEntityType,
		Record<SiteLocale, Array<number>>
	> = useMemo(() => {
		return {
			Event: { de: [253], en: [254] },
			Institution: { de: [180], en: [181] },
			Passage: { de: [5, 2, 6], en: [5, 3, 61] },
			Person: { de: [185], en: [186] },
			Place: { de: [], en: [] },
			Publication: { de: [178], en: [179] },
		};
	}, []);
	return textTypesByLocale;
}

function solaTextTypesQueryOptions(locale: SiteLocale) {
	return queryOptions({
		queryKey: ["getTextTypes", locale, {}],
		queryFn: () => {
			return getSolaTextTypes({ locale, query: defaultQuery });
		},
	});
}

/** Include annotations and inline HTML `<mark>` elements. */
const solaTextsQuery = { highlight: true, inline_annotations: true };

function solaTextsQueryOptions(locale: SiteLocale, ids: Array<number>) {
	return queryOptions({
		queryKey: ["getSolaTextsByIds", locale, ids, solaTextsQuery],
		queryFn: () => {
			return Promise.all(
				ids.map((id) => {
					return getSolaTextById({ id, query: solaTextsQuery, locale });
				}),
			);
		},
	});
}

function getSolaTextIds(entity: SolaEntityDetails | undefined): Array<number> {
	return (
		entity?.text.map((text) => {
			return text.id;
		}) ?? []
	);
}

/**
 * Fetches associated texts for a SOLA entity, filtered by current locale.
 *
 * The order of the returned texts matches the order of text type ids
 * in `useSolaTextTypes`.
 */
export function useSolaTexts(entity: SolaEntityDetails | undefined) {
	const locale = useCurrentLocale();

	/**
	 * Fetch all text types so we can get the localised text type label, because
	 * labels on `text.kind.label` are not localised.
	 */
	const textTypes = useQuery({
		...solaTextTypesQueryOptions(locale),
		select: mapResultsById,
	});

	const ids = getSolaTextIds(entity);

	const textTypesByLocale = useSolaTextTypes();

	const texts = useQuery({
		...solaTextsQueryOptions(locale, ids),
		enabled: entity !== undefined && ids.length > 0 && textTypes.data !== undefined,
		/** Never show data of a previously selected entity. */
		placeholderData: undefined,
		select: (results) => {
			const map: Record<number, SolaTextDetails> = {};
			results.forEach((text) => {
				map[text.kind.id] = text;
			});

			const textsForCurrentLocale: Array<SolaTextDetails> = [];
			textTypesByLocale[entity!.type][locale].forEach((textTypeId) => {
				const text = map[textTypeId];
				if (text) {
					textsForCurrentLocale.push(text);
				}
			});

			/** Use localised label and cut off trailing "(DE)" and "(EN)". */
			const textsWithLocalisedLabel = textsForCurrentLocale.map((text) => {
				return {
					...text,
					kind: {
						...text.kind,
						label: textTypes.data![text.kind.id]!.name.replace(/\s\((DE|EN)\)$/, ""),
					},
				};
			});

			return textsWithLocalisedLabel;
		},
	});

	return texts;
}

/**
 * Provides full user info, grouped by username.
 */
export function useSolaUsers() {
	const locale = useCurrentLocale();

	const users = useQuery({
		queryKey: ["users"],
		queryFn: () => {
			return getSolaUsers({ locale });
		},
		select(data) {
			const map: Record<string, SolaUser> = {};

			data.results.forEach((user) => {
				map[user.username] = user;
			});

			return map;
		},
	});

	return users;
}

/**
 * Maps entities by their id.
 */
function mapById<T extends { id: number }>(entities: Array<T>) {
	const mapped: Record<number, T> = {};
	entities.forEach((entity) => {
		mapped[entity.id] = entity;
	});
	return mapped;
}

/**
 * Removes pagination info and maps entities by id.
 */
function mapResultsById<T extends SolaEntity | SolaListEntity | SolaVocabulary>(data: Results<T>) {
	return mapById(data.results);
}

/**
 * Removes nulls, empty strings and empty arrays, to avoid cache misses
 * in `react-query`, e.g. between `{ key: null }` and `{ key: [] }`.
 */
function sanitize<T extends Record<string, unknown>>(filter: T) {
	const sanitized: Record<string, unknown> = {};
	Object.entries(filter).forEach(([key, value]) => {
		if (value == null) return;
		if (typeof value === "string" && value.length === 0) return;
		if (Array.isArray(value) && value.length === 0) return;
		sanitized[key] = value;
	});
	return sanitized as Partial<T>;
}
