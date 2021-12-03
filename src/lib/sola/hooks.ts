import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import { useQuery } from 'react-query'

import type {
  Results,
  SolaEntity,
  SolaEntityDetails,
  SolaEntityRelation,
  SolaEntityType,
  SolaPassageDetails,
  SolaPassageSearchResult,
  SolaTextDetails,
  SolaUser,
  SolaVocabulary,
} from '@/api/sola/client'
import {
  getSolaEntityBibliographyById,
  getSolaEventById,
  getSolaEvents,
  getSolaInstitutionById,
  getSolaInstitutions,
  getSolaPassageById,
  getSolaPassagePublicationRelations,
  getSolaPassages,
  getSolaPassageTopics,
  getSolaPassageTypes,
  getSolaPersonById,
  getSolaPersons,
  getSolaPlaceById,
  getSolaPlaces,
  getSolaPublicationById,
  getSolaPublications,
  getSolaTextById,
  getSolaTextTypes,
  getSolaUsers,
  searchSolaPassages,
} from '@/api/sola/client'
import { useHierarchicalData } from '@/lib/data/useHierarchicalData'
import type { SiteLocale } from '@/lib/i18n/getCurrentLocale'
import { useCurrentLocale } from '@/lib/i18n/useCurrentLocale'
import type { SolaPassagesFilter, SolaSelectedEntity } from '@/lib/sola/types'
import { getQueryParam } from '@/lib/url/getQueryParam'
import { capitalize } from '@/lib/util/capitalize'
import bibleBooks from '~/config/bible.json'

/** No entitiy type has more than 1000 entries. */
const defaultQuery = { limit: 1000 }

/**
 * Fetches all SOLA entities and returns entities mapped by id.
 */
export function useSolaEntities() {
  const locale = useCurrentLocale()

  const events = useQuery(
    ['getSolaEvents', locale, {}],
    () => {
      return getSolaEvents({ query: defaultQuery, locale })
    },
    { select: mapResultsById },
  )
  const institutions = useQuery(
    ['getSolaInstitutions', locale, {}],
    () => {
      return getSolaInstitutions({ query: defaultQuery, locale })
    },
    { select: mapResultsById },
  )
  const passages = useQuery(
    ['getSolaPassages', locale, {}],
    () => {
      return getSolaPassages({ query: defaultQuery, locale })
    },
    { select: mapResultsById },
  )
  const persons = useQuery(
    ['getSolaPersons', locale, {}],
    () => {
      return getSolaPersons({ query: defaultQuery, locale })
    },
    { select: mapResultsById },
  )
  const places = useQuery(
    ['getSolaPlaces', locale, {}],
    () => {
      return getSolaPlaces({ query: defaultQuery, locale })
    },
    { select: mapResultsById },
  )
  const publications = useQuery(
    ['getSolaPublications', locale, {}],
    () => {
      return getSolaPublications({ query: defaultQuery, locale })
    },
    { select: mapResultsById },
  )

  return {
    events,
    institutions,
    passages,
    persons,
    places,
    publications,
  }
}

/**
 * Sets SOLA passages search term.
 */
export function useSolaPassagesSearchTerm() {
  const [searchTerm, setSearchTerm] = useState<string | undefined>()

  const setSolaPassagesSearch = useCallback(function setSolaPassagesSearch(
    searchTerm: string | undefined,
  ) {
    setSearchTerm(searchTerm)
  },
  [])

  return {
    searchTerm,
    setSearchTerm: setSolaPassagesSearch,
  }
}

/**
 * Sets SOLA passages filter.
 */
export function useSolaPassagesFilter() {
  const [filter, setFilter] = useState<SolaPassagesFilter>({})

  const setSolaPassagesFilter = useCallback(function setSolaPassagesFilter(
    filter: SolaPassagesFilter,
  ) {
    setFilter((prev) => ({ ...prev, ...filter }))
  },
  [])

  return {
    solaPassagesFilter: filter,
    setSolaPassagesFilter,
  }
}

/**
 * Fetches SOLA passages matching the currently active filter,
 * and merges in search results retuned by the free-form search.
 */
export function useSolaFilteredPassages(
  filter: SolaPassagesFilter,
  searchTerm: string | undefined = '',
) {
  const locale = useCurrentLocale()

  const { person, passage } = useSolaRelationTypes()

  const query = useMemo(() => {
    const hasAuthorsFilter =
      filter.authors !== undefined && filter.authors.length > 0

    return sanitize({
      name__icontains: filter.name,
      kind__id__in: filter.types,
      topic__id__in: filter.topics,
      publication_set__id__in: filter.publications,
      /** Filter passage by publication authors. */
      publication_set__person_set__id__in: filter.authors,
      publication_set__person_relationtype_set__id: hasAuthorsFilter
        ? person.isAuthorOf
        : undefined,
      publication_relationtype_set__id: hasAuthorsFilter
        ? passage.isIncludedIn
        : undefined,
    })
  }, [filter, person, passage])

  const filteredPassages = useQuery(
    ['getSolaPassages', locale, query],
    () => {
      return getSolaPassages({ query: { ...defaultQuery, ...query }, locale })
    },
    { select: mapResultsById },
  )

  const passagesSearchResults = useQuery(
    ['searchSolaPassages', locale, searchTerm],
    () => {
      return searchSolaPassages({
        query: { ...defaultQuery, search: searchTerm },
        locale,
      })
    },
    { select: mapResultsById },
  )

  const passagesSearchResultsData = passagesSearchResults.data
  const filteredPassagesData = filteredPassages.data as typeof passagesSearchResultsData

  const passages = useMemo(() => {
    if (filteredPassagesData == null) return passagesSearchResultsData
    if (passagesSearchResultsData == null) return filteredPassagesData

    const merged = {} as typeof passagesSearchResultsData

    Object.entries(filteredPassagesData).forEach(([id, entry]) => {
      // @ts-expect-error Number as index
      if (passagesSearchResultsData[id] != null) {
        // @ts-expect-error Number as index
        merged[id] = entry
      }
    })

    return merged
  }, [filteredPassagesData, passagesSearchResultsData])

  return {
    data: passages,
    isLoading: filteredPassages.isLoading || passagesSearchResults.isLoading,
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    error: filteredPassages.error || passagesSearchResults.error,
  }
}

/**
 * Type guard for valid SOLA entity type.
 */
export function isSolaEntityType(type: string): type is SolaEntityType {
  const allowedTypes: Array<SolaEntityType> = [
    'Event',
    'Institution',
    'Passage',
    'Person',
    'Place',
    'Publication',
  ]
  return (allowedTypes as Array<unknown>).includes(type)
}

/**
 * Fetches currently selected SOLA entity.
 */
export function useSolaSelectedEntity() {
  const router = useRouter()
  const locale = useCurrentLocale()

  const setSelectedSolaEntity = useCallback(
    function setSelectedSolaEntity(entity: SolaSelectedEntity | null) {
      if (entity !== null) {
        const { id, type } = entity
        router.push({ query: { ...router.query, id, type } }, undefined, {
          shallow: true,
        })
      } else {
        const { id, type, ...query } = router.query
        if (id !== undefined || type !== undefined) {
          router.push({ query }, undefined, { shallow: true })
        }
      }
    },
    [router],
  )

  const selected: SolaSelectedEntity | null = useMemo(() => {
    if (router.isReady) {
      const { query } = router
      const id = getQueryParam(query.id, false, Number)
      if (id !== undefined && id > 0) {
        const type = getQueryParam(query.type, false, capitalize)
        if (type !== undefined && isSolaEntityType(type)) {
          return { id, type }
        }
      }
    }

    return null
  }, [router])

  const selectedSolaEntity = useQuery<SolaEntityDetails>(
    ['getSolaEntityById', locale, selected, {}],
    () => {
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      const { id, type } = selected!
      switch (type) {
        case 'Event':
          return getSolaEventById({ id, locale })
        case 'Institution':
          return getSolaInstitutionById({ id, locale })
        case 'Passage':
          return getSolaPassageById({ id, locale })
        case 'Person':
          return getSolaPersonById({ id, locale })
        case 'Place':
          return getSolaPlaceById({ id, locale })
        case 'Publication':
          return getSolaPublicationById({ id, locale })
      }
    },
    { enabled: selected !== null },
  )

  return {
    selectedSolaEntity,
    setSelectedSolaEntity,
  }
}

/**
 * Fetches possible values for SOLA passage filters.
 */
export function useSolaFilterOptions() {
  const locale = useCurrentLocale()

  const { person } = useSolaRelationTypes()

  const passageTopics = useQuery(
    ['getSolaPassageTopics', locale, {}],
    () => {
      return getSolaPassageTopics({ query: defaultQuery, locale })
    },
    { select: mapResultsById },
  )
  const passageTypes = useQuery(
    ['getSolaPassageTypes', locale, {}],
    () => {
      return getSolaPassageTypes({ query: defaultQuery, locale })
    },
    { select: mapResultsById },
  )
  const publications = useQuery(
    ['getSolaPublications', locale, {}],
    () => {
      return getSolaPublications({ query: defaultQuery, locale })
    },
    { select: mapResultsById },
  )
  const authorQuery = { publication_relationtype_set__id: person.isAuthorOf }
  const authors = useQuery(
    ['getSolaPersons', locale, authorQuery],
    () => {
      return getSolaPersons({
        query: { ...authorQuery, ...defaultQuery },
        locale,
      })
    },
    { select: mapResultsById },
  )

  return {
    authors,
    passageTopics,
    passageTypes,
    publications,
  }
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
  const getParentId = useCallback((entity) => entity.parent_class?.id, [])
  const _passageTopics = useHierarchicalData(passageTopics, getParentId)
  const _passageTypes = useHierarchicalData(passageTypes, getParentId)

  /**
   * Add a "Other" entry for every top-level passage topic,
   * since topics which have child topics can themselves have
   * passages associated with them.
   */
  const passageTopicsTree = useMemo(() => {
    return _passageTopics.map((parent) => {
      if (parent.children.size === 0) return parent

      const childTopics = Array.from(parent.children)
      if (!childTopics.find((topic) => topic.id === parent.id)) {
        parent.children.add({
          id: parent.id,
          name: translation,
          parent_class: null,
          children: new Set(),
        })
      }

      return parent
    })
  }, [_passageTopics, translation])

  /**
   * Add a "Other" entry for every top-level passage type,
   * since types which have child types can themselves have
   * passages associated with them.
   * Also, group types without children in their own section.
   */
  const passageTypesTree = useMemo(() => {
    const otherSection = _passageTypes.find((type) => type.id === -1) ?? {
      id: -1,
      name: translation,
      children: new Set(),
    }

    const result = [otherSection]

    _passageTypes.forEach((parent) => {
      if (parent.id === -1) return

      if (parent.children.size === 0) {
        otherSection.children.add(parent)
        return
      }

      const childTopics = Array.from(parent.children)
      if (!childTopics.find((topic) => topic.id === parent.id)) {
        parent.children.add({
          id: parent.id,
          name: translation,
          parent_class: null,
          children: new Set(),
        })
      }
      result.unshift(parent)
    })

    return result
  }, [_passageTypes, translation])

  return {
    passageTopicsTree,
    passageTypesTree,
  }
}

/**
 * Returns relation type ids, mapped by entity type.
 */
export function useSolaRelationTypes() {
  const relationTypes = useMemo(
    () => ({
      passage: {
        hasBibleCitation: 205,
        hasBibleReference: 204,
        isIncludedIn: 189,
      },
      person: {
        isAuthorOf: 187,
      },
    }),
    [],
  )
  return relationTypes
}

/**
 * Returns SOLA entity metadata specific for passages:
 * publication authors and bible passages.
 */
export function useSolaPassageMetadata(
  passage: SolaPassageDetails | undefined,
) {
  const locale = useCurrentLocale()

  const relationTypes = useSolaRelationTypes()

  /**
   * Fetch publication author: first fetch related publication with relation type
   * "is_included_in" (id 189), then get related author of that publication with
   * relation type "is_author_of" (id 187).
   */
  const isIncludedInRelation = passage?.relations.find(
    (relation) =>
      relation.related_entity.type === 'Publication' &&
      relation.relation_type.id === relationTypes.passage.isIncludedIn,
  )
  const publicationId = isIncludedInRelation?.related_entity.id

  /**
   * No need to fetch authors with `getSolaPersons?id__in=authorIds`,
   * since we already have all persons cached.
   */
  const { persons } = useSolaEntities()

  const authors = useQuery(
    ['getPublicationById', locale, publicationId, {}],
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    () => getSolaPublicationById({ id: publicationId!, locale }),
    {
      enabled: publicationId !== undefined && persons.data !== undefined,
      select: (results) => {
        const isAuthorOfRelations = results.relations.filter(
          (relation) =>
            relation.related_entity.type === 'Person' &&
            relation.relation_type.id === relationTypes.person.isAuthorOf,
        )
        const authorIds = isAuthorOfRelations.map(
          (relation) => relation.related_entity.id,
        )
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        return authorIds.map((id) => persons.data![id]!)
      },
    },
  )

  /**
   * Fetch relations to bible and corresponding bible passages.
   */
  const bibleRelations = passage?.relations.filter(
    (relation) =>
      relation.related_entity.type === 'Publication' &&
      relation.related_entity.id === 248 /* bible id */ &&
      [
        relationTypes.passage.hasBibleCitation ||
          relationTypes.passage.hasBibleReference,
      ].includes(relation.relation_type.id),
  )

  /**
   * Info about the referenced/cited bible passage is a property of
   * passage->publication relation.
   */
  const bibleRelationIds = bibleRelations?.map((relation) => relation.id) ?? []
  const query = { id__in: bibleRelationIds }
  const biblePassages = useQuery(
    ['getSolaPassagePublicationRelations', locale, query],
    () => getSolaPassagePublicationRelations({ query, locale }),
    {
      enabled: bibleRelationIds.length > 0,
      select: (results) => {
        const map: Record<string, string> = {}
        results.results.forEach((result) => {
          if (
            result.bible_book_ref == null &&
            result.bible_chapter_ref == null &&
            result.bible_verse_ref == null
          ) {
            return
          }
          const label = [
            /**
             * The backend lowercases bible book ref, but we want to display correctly capitalized
             * bible book names. Instead of a string lookup on the frontend, the backend just should
             * not touch capitalization at all!
             */
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (bibleBooks as Record<string, string>)[result.bible_book_ref!] ??
              result.bible_book_ref,
            [result.bible_chapter_ref, result.bible_verse_ref]
              .filter(Boolean)
              .join(':'),
          ]
            .filter(Boolean)
            .join(' ')
          const reference = [
            result.bible_book_ref,
            [result.bible_chapter_ref, result.bible_verse_ref]
              .filter(Boolean)
              .join(':'),
          ]
            .filter(Boolean)
            .join('.')
          const url = new URL('https://stepbible.org')
          url.searchParams.set('q', `reference=${reference}`)
          map[label] = String(url)
        })
        return map
      },
    },
  )

  return {
    authors,
    biblePassages,
  }
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
    }
    if (entity === undefined) return map
    entity.relations.forEach((relation) => {
      map[relation.related_entity.type].push(relation)
    })
    return map
  }, [entity])
}

/**
 * Fetches bibliography for SOLA entity.
 */
export function useSolaEntityBibliography(entity: SolaEntity | undefined) {
  const locale = useCurrentLocale()

  const id = entity?.id
  const query = {
    attribute: 'include',
    contenttype: entity?.type as SolaEntityType,
  }

  const bibliography = useQuery(
    ['getSolaEntityBibliographyById', locale, id, query],
    () => getSolaEntityBibliographyById({ id: id!, query, locale }),
    { enabled: id !== undefined },
  )

  return bibliography
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
  > = useMemo(
    () => ({
      Event: { de: [253], en: [254] },
      Institution: { de: [180], en: [181] },
      Passage: { de: [5, 2, 6], en: [5, 3, 61] },
      Person: { de: [185], en: [186] },
      Place: { de: [], en: [] },
      Publication: { de: [178], en: [179] },
    }),
    [],
  )
  return textTypesByLocale
}

/**
 * Fetches associated texts for a SOLA entity, filtered by current locale.
 *
 * The order of the returned texts matches the order of text type ids
 * in `useSolaTextTypes`.
 */
export function useSolaTexts(entity: SolaEntityDetails | undefined) {
  const locale = useCurrentLocale()

  /**
   * Fetch all text types so we can get the localised text type label, because
   * labels on `text.kind.label` are not localised.
   */
  const textTypes = useQuery(
    ['getTextTypes', locale, {}],
    () => getSolaTextTypes({ locale, query: defaultQuery }),
    { select: mapResultsById },
  )

  /** Include annotations and inline HTML `<mark>` elements. */
  const query = { highlight: true, inline_annotations: true }

  const ids = entity?.text.map((text) => text.id) ?? []

  const textTypesByLocale = useSolaTextTypes()

  const texts = useQuery(
    ['getSolaTextsByIds', locale, ids, query],
    () => Promise.all(ids.map((id) => getSolaTextById({ id, query, locale }))),
    {
      enabled:
        entity !== undefined && ids.length > 0 && textTypes.data !== undefined,
      select: (results) => {
        const map: Record<number, SolaTextDetails> = {}
        results.forEach((text) => {
          map[text.kind.id] = text
        })

        const textsForCurrentLocale: Array<SolaTextDetails> = []
        /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
        textTypesByLocale[entity!.type][locale].forEach((textTypeId) => {
          const text = map[textTypeId]
          if (text) {
            textsForCurrentLocale.push(text)
          }
        })

        /** Use localised label and cut off trailing "(DE)" and "(EN)". */
        const textsWithLocalisedLabel = textsForCurrentLocale.map((text) => {
          return {
            ...text,
            kind: {
              ...text.kind,
              /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
              label: textTypes.data![text.kind.id]!.name.replace(
                /\s\((DE|EN)\)$/,
                '',
              ),
            },
          }
        })

        return textsWithLocalisedLabel
      },
    },
  )

  return texts
}

/**
 * Provides full user info, grouped by username.
 */
export function useSolaUsers() {
  const locale = useCurrentLocale()

  const users = useQuery(['users'], () => getSolaUsers({ locale }), {
    select(data) {
      const map: Record<string, SolaUser> = {}

      data.results.forEach((user) => {
        map[user.username] = user
      })

      return map
    },
  })

  return users
}

/**
 * Maps entities by their id.
 */
function mapById<T extends { id: number }>(entities: Array<T>) {
  const mapped: Record<number, T> = {}
  entities.forEach((entity) => {
    mapped[entity.id] = entity
  })
  return mapped
}

/**
 * Removes pagination info and maps entities by id.
 */
function mapResultsById<
  T extends SolaEntity | SolaVocabulary | SolaPassageSearchResult
>(data: Results<T>) {
  return mapById(data.results)
}

/**
 * Removes nulls, empty strings and empty arrays, to avoid cache misses
 * in `react-query`, e.g. between `{ key: null }` and `{ key: [] }`.
 */
function sanitize<T extends Record<string, unknown>>(filter: T) {
  const sanitized: Record<string, unknown> = {}
  Object.entries(filter).forEach(([key, value]) => {
    if (value == null) return
    if (typeof value === 'string' && value.length === 0) return
    if (Array.isArray(value) && value.length === 0) return
    sanitized[key] = value
  })
  return sanitized as Partial<T>
}
