import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { useQuery } from 'react-query'

import type {
  Results,
  SolaEntity,
  SolaEntityDetails,
  SolaEntityType,
  SolaVocabulary,
} from '@/api/sola/client'
import {
  getSolaEventById,
  getSolaEvents,
  getSolaInstitutionById,
  getSolaInstitutions,
  getSolaPassageById,
  getSolaPassages,
  getSolaPassageTopics,
  getSolaPassageTypes,
  getSolaPersonById,
  getSolaPersons,
  getSolaPlaces,
  getSolaPublicationById,
  getSolaPublications,
  getSolaTextById,
  getSolaTextTypes,
} from '@/api/sola/client'
import type { SiteLocale } from '@/lib/getCurrentLocale'
import { getCurrentLocale } from '@/lib/getCurrentLocale'
import type { SolaPassagesFilter, SolaSelectedEntity } from '@/lib/sola/types'

/** No entitiy type has more than 1000 entries. */
const defaultQuery = { limit: 1000 }

/**
 * Fetches all SOLA entities and returns entities mapped by id.
 */
export function useSolaEntities() {
  const router = useRouter()
  const locale = getCurrentLocale(router)

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
 * Sets SOLA passages filter.
 */
export function useSolaPassagesFilter() {
  const [filter, setFilter] = useState<SolaPassagesFilter>({})

  function setSolaPassagesFilter(filter: SolaPassagesFilter) {
    setFilter((prev) => ({ ...prev, ...filter }))
  }

  return {
    solaPassagesFilter: filter,
    setSolaPassagesFilter,
  }
}

/**
 * Fetches SOLA passages matching the currently active filter.
 */
export function useSolaFilteredPassages(filter: SolaPassagesFilter) {
  const router = useRouter()
  const locale = getCurrentLocale(router)

  const query = useMemo(
    () =>
      sanitize({
        name__icontains: filter.name,
        kind__id__in: filter.types,
        topic__id__in: filter.topics,
        publication_set__id__in: filter.publications,
      }),
    [filter],
  )

  const passages = useQuery(
    ['getSolaPassages', locale, query],
    () => {
      return getSolaPassages({ query: { ...defaultQuery, ...query }, locale })
    },
    { select: mapResultsById },
  )

  return passages
}

/**
 * Fetches currently selected SOLA entity.
 */
export function useSolaSelectedEntity() {
  const router = useRouter()
  const locale = getCurrentLocale(router)

  const [selected, setSelected] = useState<SolaSelectedEntity | null>(null)

  const selectedSolaEntity = useQuery<SolaEntityDetails>(
    ['getSolaEntityById', locale, selected, {}],
    () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
          return getSolaPassageById({ id, locale })
        case 'Publication':
          return getSolaPublicationById({ id, locale })
      }
    },
    { enabled: selected !== null },
  )

  return {
    selectedSolaEntity,
    setSelectedSolaEntity: setSelected,
  }
}

/**
 * Fetches possible values for SOLA passage filters.
 */
export function useSolaFilterOptions() {
  const router = useRouter()
  const locale = getCurrentLocale(router)

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

  return {
    passageTopics,
    passageTypes,
    publications,
  }
}

/**
 * Fetches associated texts for a SOLA entity, filtered by current locale.
 */
export function useSolaTexts(entity: SolaEntityDetails | undefined) {
  const router = useRouter()
  const locale = getCurrentLocale(router)

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

  /**
   * These are hardcoded because there is currently no way to retrieve
   * info about the texttype locale from the backend.
   * `{ id: 5, label: 'Original text / citation' }` is included in all locales.
   * `{ id: 176: label: 'Inhalt (ist zu übertragen zu publications)' }` is ignored.
   */
  const textTypesByLocale: Record<
    SolaEntityType,
    Record<SiteLocale, Array<number>>
  > = {
    Event: { de: [253], en: [254] },
    Institution: { de: [180], en: [181] },
    Passage: { de: [2, 5, 6], en: [3, 5, 61] },
    Person: { de: [185], en: [186] },
    Place: { de: [], en: [] },
    Publication: { de: [178], en: [179] },
  }

  const texts = useQuery(
    ['getSolaTextsByIds', locale, ids, query],
    () => Promise.all(ids.map((id) => getSolaTextById({ id, query, locale }))),
    {
      enabled:
        entity !== undefined && ids.length > 0 && textTypes.data !== undefined,
      select: (results) => {
        const textsForCurrentLocale = results.filter((text) => {
          /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
          return textTypesByLocale[entity!.type][locale].includes(text.kind.id)
        })
        return textsForCurrentLocale.map((text) => {
          return {
            ...text,
            kind: {
              ...text.kind,
              /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
              label: textTypes.data![text.kind.id]!.name,
            },
          }
        })
      },
    },
  )

  return texts
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
function mapResultsById<T extends SolaEntity | SolaVocabulary>(
  data: Results<T>,
) {
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
