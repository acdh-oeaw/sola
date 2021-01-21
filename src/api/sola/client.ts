import { request } from '@/api/sola/runtime'
import type { SiteLocale } from '@/lib/i18n/getCurrentLocale'

export interface SolaEntityBase {
  id: number
  name: string

  assigned_user: { id: number; label: string } | null

  primary_date: string | null
  end_date: string | null
  end_date_is_exact: boolean | null
  end_date_written: string | null
  start_date: string | null
  start_date_is_exact: boolean | null
  start_date_written: string | null

  kind: Array<{ id: number; label: string }>
  text: Array<{ id: number; label: string }>
}
export interface SolaEvent extends SolaEntityBase {
  type: 'Event'
}
export interface SolaInstitution extends SolaEntityBase {
  type: 'Institution'
}
export interface SolaPassage extends SolaEntityBase {
  type: 'Passage'
  migne_number: string | null
  topic: Array<{ id: number; label: string; parent_id: number }>
}
export interface SolaPerson extends SolaEntityBase {
  type: 'Person'
  gender: 'male' | 'female' | null
}
export interface SolaPlace extends SolaEntityBase {
  type: 'Place'
  lat: number | null
  lng: number | null
}
export interface SolaPublication extends SolaEntityBase {
  type: 'Publication'
  clavis_number: string | null
  migne_number: string | null
  language: { id: number; label: string }
}

export interface SolaEntityRelation {
  id: number
  label: string
  relation_type: { id: number; label: string }
  related_entity: { id: number; label: string; type: SolaEntityType }
}
export interface SolaEntityDetailsBase {
  relations: Array<SolaEntityRelation>
}
export interface SolaEventDetails extends SolaEvent, SolaEntityDetailsBase {}
export interface SolaInstitutionDetails
  extends SolaInstitution,
    SolaEntityDetailsBase {}
export interface SolaPassageDetails
  extends SolaPassage,
    SolaEntityDetailsBase {}
export interface SolaPersonDetails extends SolaPerson, SolaEntityDetailsBase {}
export interface SolaPlaceDetails extends SolaPlace, SolaEntityDetailsBase {}
export interface SolaPublicationDetails
  extends SolaPublication,
    SolaEntityDetailsBase {}

export type SolaEntity =
  | SolaEvent
  | SolaInstitution
  | SolaPassage
  | SolaPerson
  | SolaPlace
  | SolaPublication
export type SolaEntityDetails =
  | SolaEventDetails
  | SolaInstitutionDetails
  | SolaPassageDetails
  | SolaPersonDetails
  | SolaPlaceDetails
  | SolaPublicationDetails
/**
 * Entity types are uppercase to match the backend.
 * E.g. `/vocabularies/texttype` returns an `entity`.
 */
export type SolaEntityType = SolaEntity['type']

export interface SolaVocabulary {
  id: number
  name: string
  parent_class: { id: number; label: string } | null
}

export interface SolaText {
  id: number
  text: string
  kind: { id: number; label: string }
}
export interface SolaTextDetails extends SolaText {
  annotations: Array<SolaTextAnnotation> | null
}
export interface SolaTextAnnotation {
  id: number
  start: number
  end: number
  related_object: { id: number; label: string }
}

export interface SolaTextType extends SolaVocabulary {
  entity: SolaEntityType
}

export interface SolaRelation {
  id: number

  primary_date: string
  end_date: string | null
  end_date_is_exact: boolean | null
  end_date_written: string | null
  start_date: string | null
  start_date_is_exact: boolean | null
  start_date_written: string | null

  relation_type: { id: number; label: string }
}
export interface SolaPassagePublicationRelation extends SolaRelation {
  related_passage: { id: number; label: string }
  related_publication: { id: number; label: string }

  bible_book_ref: string | null
  bible_chapter_ref: string | null
  bible_verse_ref: string | null
}

export interface SolaBibsonomyReference {
  pk: number
  /** The entity attribute the reference is attached to, or `null` for the entity itself. */
  attribute: string | null

  entrytype: string // 'book'
  author: string
  title: string
  address: string
  publisher: string
  year: string
  pages_end: string
  pages_start: string
  url: string
  /** Link to entry in bibsonomy collection. */
  href: string
}

type URLString = string

interface RequestConfig {
  options?: RequestInit
  locale: SiteLocale
}

interface GetAllRequestConfig<
  T extends Record<string, unknown> = Record<string, unknown>
> extends RequestConfig {
  query?: T & {
    limit?: number
    offset?: number
  }
}

interface GetByIdRequestConfig<
  T extends Record<string, unknown> = Record<string, unknown>
> extends RequestConfig {
  id: number
  query?: T
}

export interface Results<
  T extends SolaEntity | SolaRelation | SolaText | SolaVocabulary
> {
  limit: number
  offset: number
  count: number
  next: URLString | null
  previous: URLString | null
  results: Array<T>
}

export const baseUrl = 'https://sola.acdh-dev.oeaw.ac.at'

export async function getSolaEvents({
  query,
  locale,
  options,
}: GetAllRequestConfig): Promise<Results<SolaEvent>> {
  const type = 'Event'
  const data = await request<Results<SolaEvent>>({
    path: '/apis/api/entities/event/',
    baseUrl,
    query,
    options,
  })
  return {
    ...data,
    results: data.results.map((result) => addEntityType(result, type, locale)),
  }
}
export async function getSolaInstitutions({
  query,
  locale,
  options,
}: GetAllRequestConfig): Promise<Results<SolaInstitution>> {
  const type = 'Institution'
  const data = await request<Results<SolaInstitution>>({
    path: '/apis/api/entities/institution/',
    baseUrl,
    query,
    options,
  })
  return {
    ...data,
    results: data.results.map((result) => addEntityType(result, type, locale)),
  }
}
type GetSolaPassages = GetAllRequestConfig<{
  name__icontains?: string
  kind__id__in?: Array<number>
  topic__id__in?: Array<number>
  publication_set__id__in?: Array<number>
}>
export async function getSolaPassages({
  query,
  locale,
  options,
}: GetSolaPassages): Promise<Results<SolaPassage>> {
  const type = 'Passage'
  const data = await request<Results<SolaPassage>>({
    path: '/apis/api/entities/passage/',
    baseUrl,
    query,
    options,
  })
  return {
    ...data,
    results: data.results.map((result) => addEntityType(result, type, locale)),
  }
}
export async function getSolaPersons({
  query,
  locale,
  options,
}: GetAllRequestConfig): Promise<Results<SolaPerson>> {
  const type = 'Person'
  const data = await request<Results<SolaPerson>>({
    path: '/apis/api/entities/person/',
    baseUrl,
    query,
    options,
  })
  return {
    ...data,
    results: data.results.map((result) => ({
      ...addEntityType(result, type, locale),
      /**
       * Other than all other SOLA entities, persons don't have `kind`.
       */
      kind: [],
    })),
  }
}
export async function getSolaPlaces({
  query,
  locale,
  options,
}: GetAllRequestConfig): Promise<Results<SolaPlace>> {
  const type = 'Place'
  const data = await request<Results<SolaPlace>>({
    path: '/apis/api/entities/place/',
    baseUrl,
    query,
    options,
  })
  return {
    ...data,
    results: data.results.map((result) => addEntityType(result, type, locale)),
  }
}
export async function getSolaPublications({
  query,
  locale,
  options,
}: GetAllRequestConfig): Promise<Results<SolaPublication>> {
  const type = 'Publication'
  const data = await request<Results<SolaPublication>>({
    path: '/apis/api/entities/publication/',
    baseUrl,
    query,
    options,
  })
  return {
    ...data,
    results: data.results.map((result) => addEntityType(result, type, locale)),
  }
}

export async function getSolaEventById({
  id,
  query,
  locale,
  options,
}: GetByIdRequestConfig): Promise<SolaEventDetails> {
  const type = 'Event'
  const data = await request<SolaEventDetails>({
    path: `/apis/api/entities/event/${id}/`,
    baseUrl,
    query,
    options,
  })
  return addEntityType(data, type, locale)
}
export async function getSolaInstitutionById({
  id,
  query,
  locale,
  options,
}: GetByIdRequestConfig): Promise<SolaInstitutionDetails> {
  const type = 'Institution'
  const data = await request<SolaInstitutionDetails>({
    path: `/apis/api/entities/institution/${id}/`,
    baseUrl,
    query,
    options,
  })
  return addEntityType(data, type, locale)
}
export async function getSolaPassageById({
  id,
  query,
  locale,
  options,
}: GetByIdRequestConfig): Promise<SolaPassageDetails> {
  const type = 'Passage'
  const data = await request<SolaPassageDetails>({
    path: `/apis/api/entities/passage/${id}/`,
    baseUrl,
    query,
    options,
  })
  return addEntityType(data, type, locale)
}
export async function getSolaPersonById({
  id,
  query,
  locale,
  options,
}: GetByIdRequestConfig): Promise<SolaPersonDetails> {
  const type = 'Person'
  const data = await request<SolaPersonDetails>({
    path: `/apis/api/entities/person/${id}/`,
    baseUrl,
    query,
    options,
  })
  return {
    ...addEntityType(data, type, locale),
    /**
     * Other than all other SOLA entities, persons don't have `kind`.
     */
    kind: [],
  }
}
export async function getSolaPlaceById({
  id,
  query,
  locale,
  options,
}: GetByIdRequestConfig): Promise<SolaPlaceDetails> {
  const type = 'Place'
  const data = await request<SolaPlaceDetails>({
    path: `/apis/api/entities/place/${id}/`,
    baseUrl,
    query,
    options,
  })
  return addEntityType(data, type, locale)
}
export async function getSolaPublicationById({
  id,
  query,
  locale,
  options,
}: GetByIdRequestConfig): Promise<SolaPublicationDetails> {
  const type = 'Publication'
  const data = await request<SolaPublicationDetails>({
    path: `/apis/api/entities/publication/${id}/`,
    baseUrl,
    query,
    options,
  })
  return addEntityType(data, type, locale)
}

export async function getSolaPassageTopics({
  query,
  locale,
  options,
}: GetAllRequestConfig): Promise<Results<SolaVocabulary>> {
  const data = await request<Results<SolaVocabulary>>({
    path: '/apis/api/vocabularies/passagetopics/',
    baseUrl,
    query,
    options,
  })
  return {
    ...data,
    results: data.results.map((result) => localise(result, locale)),
  }
}
export async function getSolaPassageTypes({
  query,
  locale,
  options,
}: GetAllRequestConfig): Promise<Results<SolaVocabulary>> {
  const data = await request<Results<SolaVocabulary>>({
    path: '/apis/api/vocabularies/passagetype/',
    baseUrl,
    query,
    options,
  })
  return {
    ...data,
    results: data.results.map((result) => localise(result, locale)),
  }
}

type GetSolaTexts = GetAllRequestConfig<{
  id__in?: Array<number>
}>
export async function getSolaTexts({
  query,
  // locale,
  options,
}: GetSolaTexts): Promise<Results<SolaText>> {
  const data = await request<Results<SolaText>>({
    path: '/apis/api/metainfo/text/',
    baseUrl,
    query,
    options,
  })
  return data
}
type GetSolaTextById = GetByIdRequestConfig<{
  /**
   * Includes array of `annotations`.
   */
  highlight?: boolean
  /**
   * Disables inlining annotations as HTML `<mark>` elements in `text`
   * when set to `false`. Does nothing when `highlight` is not
   * included in query.
   */
  inline_annotations?: boolean
  /**
   * Content type ids of annotation types to show, e.g. `PersonPlace`.
   */
  types?: Array<string>
}>
export async function getSolaTextById({
  id,
  query,
  // locale,
  options,
}: GetSolaTextById): Promise<SolaTextDetails> {
  const data = await request<SolaTextDetails>({
    path: `/apis/api/metainfo/text/${id}/`,
    baseUrl,
    query,
    options,
  })
  return data
}

export async function getSolaTextTypes({
  query,
  locale,
  options,
}: GetAllRequestConfig): Promise<Results<SolaTextType>> {
  const data = await request<Results<SolaTextType>>({
    path: '/apis/api/vocabularies/texttype/',
    baseUrl,
    query,
    options,
  })
  return {
    ...data,
    results: data.results.map((result) => localise(result, locale)),
  }
}

type GetSolaPassagePublicationRelations = GetAllRequestConfig<{
  id__in?: Array<number>
}>
export async function getSolaPassagePublicationRelations({
  query,
  // locale,
  options,
}: GetSolaPassagePublicationRelations): Promise<
  Results<SolaPassagePublicationRelation>
> {
  const data = await request<Results<SolaPassagePublicationRelation>>({
    path: '/apis/api/relations/passagepublication/',
    baseUrl,
    query,
    options,
  })
  return data
}

type GetSolaEntityBibliographyById = GetByIdRequestConfig<{
  /**
   * When no `attribute` is specified, will return all bibsonomy references on
   * the entity itself.
   * When `?attribute=all`, will return all bibsonomy references on entity
   * attributes.
   * When `?attribute=include`, will return all bibsonomy references on the
   * entity itself, as well as references on entity attributes.
   * When `?attribute=[key: string]`, will return all bibsonomy references on
   * this specific attribute.
   */
  attribute?: 'all' | 'include' | string
  contenttype: SolaEntityType
}>
export async function getSolaEntityBibliographyById({
  id,
  query,
  // locale,
  options,
}: GetSolaEntityBibliographyById): Promise<Array<SolaBibsonomyReference>> {
  const data = await request<Array<SolaBibsonomyReference>>({
    path: '/bibsonomy/save_get/',
    baseUrl,
    query: { object_pk: id, ...query },
    options,
  })
  return data
}

/**
 * Until the backend implements proper i18n, manually map the `name` field.
 */
function localise<T extends SolaEntityBase | SolaVocabulary>(
  entity: T,
  locale: SiteLocale,
) {
  if (locale === 'de') return entity
  const nameEnglish = (entity as { name_english?: string | null }).name_english
  if (nameEnglish != null && nameEnglish.length > 0) {
    entity.name = nameEnglish
  }
  return entity
}

/**
 * Adds entity type and localises entity label.
 */
function addEntityType<T extends SolaEntityBase>(
  entity: T,
  type: SolaEntityType,
  locale: SiteLocale,
) {
  return localise({ ...entity, type }, locale)
}
