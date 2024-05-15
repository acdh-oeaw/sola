import { createSchemaOrg, SchemaOrg } from '@stefanprobst/next-page-metadata'
import cx from 'clsx'
import type { GetStaticPropsContext, GetStaticPropsResult } from 'next'
import { useRouter } from 'next/router'
import type { FormEvent } from 'react'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import type { QueryObserverResult } from 'react-query'

import type {
  SolaBibsonomyReference,
  SolaEntityDetails,
  SolaEntityRelation,
  SolaEntityType,
  SolaListEntity,
  SolaPassageDetails,
  SolaTextDetails,
  SolaVocabulary,
} from '@/api/sola/client'
import { useDebouncedData } from '@/lib/data/useDebouncedData'
import type { Node } from '@/lib/data/useHierarchicalData'
import { useSortedData } from '@/lib/data/useSortedData'
import type { SiteLocale } from '@/lib/i18n/getCurrentLocale'
import { getCurrentLocale } from '@/lib/i18n/getCurrentLocale'
import { LabelsProvider, useLabels } from '@/lib/i18n/LabelsContext'
import { useCurrentLocale } from '@/lib/i18n/useCurrentLocale'
import {
  useSolaEntities,
  useSolaEntityBibliography,
  useSolaEntityRelations,
  useSolaFilteredPassages,
  useSolaFilterOptions,
  useSolaPassageMetadata,
  useSolaPassagesFilter,
  useSolaPassagesFilterOptionsTree,
  useSolaPassagesSearchTerm,
  useSolaSelectedEntity,
  useSolaTexts,
  useSolaUsers,
} from '@/lib/sola/hooks'
import type { SolaPassagesFilter, SolaSelectedEntity } from '@/lib/sola/types'
import { count } from '@/lib/util/count'
import { printHtml } from '@/lib/util/printHtml'
import { Document as DocumentIcon } from '@/modules/icons/Document'
import { Link as LinkIcon } from '@/modules/icons/Link'
import { Metadata } from '@/modules/metadata/Metadata'
import { useAlternateUrls } from '@/modules/metadata/useAlternateUrls'
import { useCanonicalUrl } from '@/modules/metadata/useCanonicalUrl'
import { Badge } from '@/modules/ui/Badge'
import { ClearButton } from '@/modules/ui/ClearButton'
import { Disclosure } from '@/modules/ui/Disclosure'
import { Item, ListBox, Section } from '@/modules/ui/ListBox'
import { Spinner } from '@/modules/ui/Spinner'
import { Item as TabItem, Tabs } from '@/modules/ui/Tabs'
import { TextField } from '@/modules/ui/TextField'
import { TooltipTrigger } from '@/modules/ui/TooltipTrigger'
import { DurationTimeline } from '@/modules/visualization/DurationTimeline'
import { Visualization } from '@/modules/visualization/Visualization'
import site from '~/config/site.json' assert { type: 'json' }
import sola from '~/config/sola.json' assert { type: 'json' }

const { url: baseUrl } = site
const { colors } = sola

/**
 * i18n.
 */
export const labels = {
  en: {
    page: {
      title: 'Passages',
    },
    h1: 'Passages',
    entityType: {
      Event: ['Event', 'Events'],
      Institution: ['Institution', 'Institutions'],
      Passage: ['Passage', 'Passages'],
      Person: ['Person', 'Persons'],
      Place: ['Place', 'Places'],
      Publication: ['Work', 'Works'],
    },
    options: 'Options',
    other: 'Other',
    filterPassages: 'Filter passages',
    filteredBy: 'Filtered by',
    reset: 'Reset',
    selectEntityForDetails: 'Please select an entity in the timeline above to view details.',
    authors: ['Author', 'Authors'],
    properties: 'Properties',
    search: 'Search',
    title: 'Title',
    topics: ['Topic', 'Topics'],
    types: ['Type', 'Types'],
    relations: 'Relations',
    relationsTo: 'Relations to',
    biblePassages: 'Bible passages',
    primaryText: 'Primary text',
    additionalTexts: 'Additional texts',
    bibliography: 'Bibliography',
    editedBy: 'Edited by',
    copyLink: 'Copy Link',
    printDocument: 'Print Document',
  },
  de: {
    page: {
      title: 'Passagen',
    },
    h1: 'Passagen',
    entityType: {
      Event: ['Ereignis', 'Ereignisse'],
      Institution: ['Institution', 'Institutionen'],
      Passage: ['Passage', 'Passagen'],
      Person: ['Person', 'Personen'],
      Place: ['Ort', 'Orte'],
      Publication: ['Werk', 'Werke'],
    },
    options: 'Optionen',
    other: 'Andere',
    filterPassages: 'Filter Passagen',
    filteredBy: 'Gefiltert nach',
    reset: 'Zurücksetzen',
    selectEntityForDetails: 'Bitte Punkt in der Visualisierung auswählen, um Details zu sehen.',
    authors: ['AutorIn', 'AutorInnen'],
    properties: 'Eigenschaften',
    search: 'Suchen',
    title: 'Titel',
    topics: ['Thema', 'Themen'],
    types: ['Gattung', 'Gattungen'],
    relations: 'Beziehungen',
    relationsTo: 'Beziehungen mit',
    biblePassages: 'Bibel-Passagen',
    primaryText: 'Primärtext',
    additionalTexts: 'Zusätzliche Texte',
    bibliography: 'Bibliographie',
    editedBy: 'Bearbeitet von',
    copyLink: 'Link kopieren',
    printDocument: 'Dokument drucken',
  },
} as const

export interface DatasetPageProps {
  labels: typeof labels[SiteLocale]
}

/**
 * Make localised labels available to client.
 */
export function getStaticProps(
  context: GetStaticPropsContext,
): GetStaticPropsResult<DatasetPageProps> {
  const locale = getCurrentLocale(context.locale)

  return {
    props: {
      labels: labels[locale],
    },
  }
}

/**
 * Dataset page.
 */
export default function DatasetPage(props: DatasetPageProps): JSX.Element {
  const router = useRouter()
  /**
   * No need for additional sanity checks for `id` and `type` here,
   * since these are checked in `useSolaSelectedEntity`.
   * If a user enters bogus values these should still not be indexed, since
   * they will not be included in the sitemap.
   */
  const { id, type } = router.query
  const query = id !== undefined && type !== undefined ? { id, type } : undefined
  const canonicalUrl = useCanonicalUrl(query)
  const alternateUrls = useAlternateUrls(query)

  return (
    <Fragment>
      <Metadata
        title={props.labels.page.title}
        canonicalUrl={canonicalUrl}
        languageAlternates={alternateUrls}
      />
      <LabelsProvider labels={props.labels}>
        <Dashboard />
      </LabelsProvider>
    </Fragment>
  )
}

/**
 * Page container with shared page-level data requirements.
 */
function Dashboard(): JSX.Element {
  const { searchTerm, setSearchTerm } = useSolaPassagesSearchTerm()
  const { solaPassagesFilter, setSolaPassagesFilter } = useSolaPassagesFilter()

  return (
    <main className="grid main-panel bg-gray-50" style={{ gridArea: 'main' }}>
      <FilterPanel
        filter={solaPassagesFilter}
        setFilter={setSolaPassagesFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <ContentPanel
        filter={solaPassagesFilter}
        setFilter={setSolaPassagesFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </main>
  )
}

/**
 * Facets to filter passages highlighted in the timeline visualization.
 */
function FilterPanel({
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
}: {
  filter: SolaPassagesFilter
  setFilter: (filter: SolaPassagesFilter) => void
  searchTerm: string | undefined
  setSearchTerm: (searchTerm: string | undefined) => void
}) {
  const t = useLabels() as typeof labels[SiteLocale]

  const { authors, passageTopics, passageTypes, publications } = useSolaFilterOptions()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
  }

  const [title, setTitle] = useState(filter.name ?? '')
  const debouncedTitle = useDebouncedData(title.trim(), 150)

  useEffect(() => {
    setFilter({ name: debouncedTitle })
  }, [debouncedTitle, setFilter])

  useEffect(() => {
    /** Clear text input. */
    if (filter.name === undefined) {
      setTitle('')
    }
  }, [filter.name])

  const [searchTermInput, setSearchTermInput] = useState(searchTerm ?? '')
  const debouncedSearchTermInput = useDebouncedData(searchTermInput.trim(), 150)

  useEffect(() => {
    setSearchTerm(debouncedSearchTermInput)
  }, [debouncedSearchTermInput, setSearchTerm])

  useEffect(() => {
    /** Clear text input. */
    if (searchTerm === undefined) {
      setSearchTermInput('')
    }
  }, [searchTerm])

  const sortedAuthors = useSortedData(authors.data, 'name')
  const sortedPublications = useSortedData(publications.data, 'name')
  const { passageTopicsTree, passageTypesTree } = useSolaPassagesFilterOptionsTree(
    passageTopics.data,
    passageTypes.data,
    t.other,
  )

  if (
    authors.data === undefined ||
    passageTopics.data === undefined ||
    passageTypes.data === undefined ||
    publications.data === undefined
  ) {
    return (
      <aside
        className="flex items-center justify-center px-4 py-6 text-gray-100 bg-gray-900"
        style={{ gridArea: 'panel' }}
      >
        <Spinner className="w-6 h-6" />
      </aside>
    )
  }

  return (
    <aside
      className="overflow-y-auto bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-400"
      style={{ gridArea: 'panel' }}
    >
      <form className="flex flex-col px-4 py-6 space-y-3" onSubmit={onSubmit}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-300">{t.filterPassages}</h2>
          <ClearButton
            aria-label={t.reset}
            className="p-2 text-gray-300 transition rounded hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 hover:bg-gray-800"
            onClick={() => {
              setFilter({
                authors: undefined,
                name: undefined,
                publications: undefined,
                topics: undefined,
                types: undefined,
              })
              setSearchTerm(undefined)
            }}
          />
        </div>
        {/* <TextField
          label={t.title}
          value={title}
          onChange={setTitle}
          className="transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
        /> */}
        <TextField
          label={t.search}
          value={searchTermInput}
          onChange={setSearchTermInput}
          className="transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
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
              if (ids === 'all') return
              setFilter({ authors: Array.from(ids) as Array<number> })
            }}
          >
            {(item) => {
              return <Item>{item.name}</Item>
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
              if (ids === 'all') return
              setFilter({ publications: Array.from(ids) as Array<number> })
            }}
          >
            {(item) => {
              return <Item>{item.name}</Item>
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
              if (ids === 'all') return
              setFilter({ types: Array.from(ids) as Array<number> })
            }}
          >
            {(item) => {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              if (item.children !== undefined && item.children.size > 0) {
                return (
                  <Section key={`section-${item.id}`} title={item.name} items={item.children}>
                    {(item) => {
                      return <Item>{item.name}</Item>
                    }}
                  </Section>
                )
              } else {
                return <Item>{item.name}</Item>
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
          )
        })}
      </form>
    </aside>
  )
}

function createListboxLabel(label: string, total?: number, selected?: number) {
  if (total === undefined || total === 0) return label
  if (selected === undefined || selected === 0) return `${label} (${total})`
  return `${label} (${selected}/${total})`
}

function PassageTopicListBox({
  topic,
  filter,
  setFilter,
  t,
}: {
  topic: Node<SolaVocabulary>
  filter: Array<number> | undefined
  setFilter: (filter: SolaPassagesFilter) => void
  t: typeof labels[SiteLocale]
}) {
  const topics = useMemo(() => {
    if (topic.children.size === 0) return []

    /** Sort alphabetically, sort "Other" to end. */
    return Array.from(topic.children).sort((a, b) => {
      return a.id === topic.id ? 1 : b.id === topic.id ? -1 : a.name.localeCompare(b.name)
    })
  }, [topic])

  const selectedCount = useMemo(() => {
    const childIds = new Set(
      topics.map((topic) => {
        return topic.id
      }),
    )
    return filter?.filter((topicId) => {
      return childIds.has(topicId)
    }).length
  }, [topics, filter])

  if (topic.children.size === 0) return null

  const id = `passage-topic-${topic.id}-filter`

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
            if (ids === 'all') return
            setFilter({ topics: Array.from(ids) as Array<number> })
          }}
        >
          {(item) => {
            return <Item>{item.name}</Item>
          }}
        </ListBox>
      </Disclosure>
    </Fragment>
  )
}

/**
 * Container with shared data requirements for main content area.
 */
function ContentPanel({
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
}: {
  filter: SolaPassagesFilter
  setFilter: (filter: SolaPassagesFilter) => void
  searchTerm: string | undefined
  setSearchTerm: (searchTerm: string | undefined) => void
}) {
  const solaEntities = useSolaEntities()

  const { selectedSolaEntity, setSelectedSolaEntity } = useSolaSelectedEntity()
  const selectedSolaEntityRelations = useSolaEntityRelations(selectedSolaEntity.data)

  /** Reset detail view when filter set changes. */
  useEffect(() => {
    setSelectedSolaEntity(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const isLoadingInitialData = solaEntities.status === 'loading'

  if (isLoadingInitialData) {
    return (
      <div
        className="flex flex-col items-center justify-center text-yellow-400"
        style={{ gridRow: 'span 2' }}
      >
        <Spinner className="w-12 h-12" />
      </div>
    )
  }

  return (
    <Fragment>
      <VisualizationPanel
        solaEntities={solaEntities}
        filter={filter}
        setFilter={setFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSolaEntity={selectedSolaEntity}
        setSelectedSolaEntity={setSelectedSolaEntity}
        selectedSolaEntityRelations={selectedSolaEntityRelations}
      />
      <DetailsPanel
        selectedSolaEntity={selectedSolaEntity}
        setSelectedSolaEntity={setSelectedSolaEntity}
        selectedSolaEntityRelations={selectedSolaEntityRelations}
        setFilter={setFilter}
      />
    </Fragment>
  )
}

/**
 * Timelines for passages and other entities.
 * Passages matching the currently active filter set are highlighted.
 */
function VisualizationPanel({
  solaEntities,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  selectedSolaEntity,
  setSelectedSolaEntity,
  selectedSolaEntityRelations,
}: {
  solaEntities: QueryObserverResult<
    {
      events: Record<number, SolaListEntity>
      institutions: Record<number, SolaListEntity>
      passages: Record<number, SolaListEntity>
      persons: Record<number, SolaListEntity>
      places: Record<number, SolaListEntity>
      publications: Record<number, SolaListEntity>
    },
    unknown
  >
  filter: SolaPassagesFilter
  setFilter: (filter: SolaPassagesFilter) => void
  searchTerm: string | undefined
  setSearchTerm: (searchterm: string | undefined) => void
  selectedSolaEntity: QueryObserverResult<SolaEntityDetails, unknown>
  setSelectedSolaEntity: (entity: SolaSelectedEntity | null) => void
  selectedSolaEntityRelations: Record<SolaEntityType, Array<SolaEntityRelation>>
}) {
  const t = useLabels() as typeof labels[SiteLocale]

  const filteredSolaPassages = useSolaFilteredPassages(filter, searchTerm)

  const countedSolaEvents = count(solaEntities.data?.events)
  const countedSolaInstitutions = count(solaEntities.data?.institutions)
  const countedSolaPassages = count(solaEntities.data?.passages)
  const countedSolaPersons = count(solaEntities.data?.persons)
  const countedSolaPlaces = count(solaEntities.data?.places)
  const countedSolaPublications = count(solaEntities.data?.publications)

  return (
    <section
      className="flex flex-col min-w-0 pb-4 border-b border-gray-200"
      style={{ gridArea: 'visualization' }}
    >
      <div className="flex flex-col justify-between px-6 pt-6 pb-4 space-y-4 md:space-y-0 md:flex-row md:space-x-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">{t.h1}</h1>
          {filteredSolaPassages.isLoading ? (
            <Spinner className="w-6 h-6" />
          ) : (
            <div className="w-6 h-6" />
          )}
        </div>
        <div className="flex flex-col space-y-1">
          <ul className="flex flex-wrap text-xs text-gray-500 md:justify-end md:space-x-2">
            <li className="flex items-center mb-1 mr-2 space-x-1 md:mr-0">
              <div className={cx('w-3 h-3 transition', colors.bg['Event'])} />
              <span>
                {countedSolaEvents} {t.entityType['Event'][1]}
              </span>
            </li>
            <li className="flex items-center mb-1 mr-2 space-x-1 md:mr-0">
              <div className={cx('w-3 h-3 transition', colors.bg['Institution'])} />
              <span>
                {countedSolaInstitutions} {t.entityType['Institution'][1]}
              </span>
            </li>
            <li className="flex items-center mb-1 mr-2 space-x-1 md:mr-0">
              <div className={cx('w-3 h-3 transition', colors.bg['Passage'])} />
              <span>
                {countedSolaPassages} {t.entityType['Passage'][1]}
              </span>
            </li>
            <li className="flex items-center mb-1 mr-2 space-x-1 md:mr-0">
              <div className={cx('w-3 h-3 transition', colors.bg['Person'])} />
              <span>
                {countedSolaPersons} {t.entityType['Person'][1]}
              </span>
            </li>
            <li className="flex items-center mb-1 mr-2 space-x-1 md:mr-0">
              <div className={cx('w-3 h-3 transition', colors.bg['Place'])} />
              <span>
                {countedSolaPlaces} {t.entityType['Place'][1]}
              </span>
            </li>
            <li className="flex items-center mb-1 mr-2 space-x-1 md:mr-0">
              <div className={cx('w-3 h-3 transition', colors.bg['Publication'])} />
              <span>
                {countedSolaPublications} {t.entityType['Publication'][1]}
              </span>
            </li>
          </ul>
          <ActiveFilterList
            filter={filter}
            setFilter={setFilter}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </div>
      <div className="relative flex-1 mx-6">
        <Visualization
          solaEntities={solaEntities}
          filteredSolaPassages={filteredSolaPassages}
          selectedSolaEntity={selectedSolaEntity}
          setSelectedSolaEntity={setSelectedSolaEntity}
          selectedSolaEntityRelations={selectedSolaEntityRelations}
          entityTypeLabels={t.entityType}
        />
      </div>
    </section>
  )
}

function ActiveFilterList({
  filter,
  setFilter,
}: {
  filter: SolaPassagesFilter
  setFilter: (filter: SolaPassagesFilter) => void
  searchTerm: string | undefined
  setSearchTerm: (searchTerm: string | undefined) => void
}) {
  const t = useLabels() as typeof labels[SiteLocale]

  const options = useSolaFilterOptions()

  if (
    options.authors.data === undefined ||
    options.passageTopics.data === undefined ||
    options.passageTypes.data === undefined ||
    options.publications.data === undefined
  ) {
    return <div className="pb-2 text-xs">&nbsp;</div>
  }

  const { name, authors, publications, topics, types } = filter

  const hasAuthorsFilter = authors !== undefined && authors.length > 0
  const hasNameFilter = name !== undefined && name.length > 0
  const hasPublicationFilter = publications !== undefined && publications.length > 0
  const hasPassageTopicsFilter = topics !== undefined && topics.length > 0
  const hasPassageTypesFilter = types !== undefined && types.length > 0

  if (
    !hasAuthorsFilter &&
    !hasNameFilter &&
    !hasPublicationFilter &&
    !hasPassageTopicsFilter &&
    !hasPassageTypesFilter
  ) {
    return <div className="pb-2 text-xs">&nbsp;</div>
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
                      className="font-medium truncate rounded cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                    >
                      {name}
                    </button>
                  </TooltipTrigger>
                  <ClearButton
                    className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                    onClick={() => {
                      setFilter({ name: undefined })
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
                    const name = options.authors.data?.[id]?.name
                    return (
                      <li className="flex min-w-0 mb-1 mr-1 md:mr-0" key={id}>
                        <Badge className="min-w-0 space-x-1 text-gray-100 bg-gray-900 cursor-default select-none">
                          <TooltipTrigger tooltip={`${t.filteredBy} ${t.authors[0]}: ${name}`}>
                            <button
                              type="button"
                              className="font-medium truncate rounded cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                            >
                              {name}
                            </button>
                          </TooltipTrigger>
                          <ClearButton
                            className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                            onClick={() => {
                              setFilter({
                                authors:
                                  filter.authors === undefined || filter.authors.length === 1
                                    ? undefined
                                    : filter.authors.filter((authorId) => {
                                        return authorId !== id
                                      }),
                              })
                            }}
                          />
                        </Badge>
                      </li>
                    )
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
                    const name = options.publications.data?.[id]?.name
                    return (
                      <li className="flex min-w-0 mb-1 mr-1 md:mr-0" key={id}>
                        <Badge className="min-w-0 space-x-1 text-gray-100 bg-gray-900 cursor-default select-none">
                          <TooltipTrigger
                            tooltip={`${t.filteredBy} ${t.entityType.Publication[0]}: ${name}`}
                          >
                            <button
                              type="button"
                              className="font-medium truncate rounded cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                            >
                              {name}
                            </button>
                          </TooltipTrigger>
                          <ClearButton
                            className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                            onClick={() => {
                              setFilter({
                                publications:
                                  filter.publications === undefined ||
                                  filter.publications.length === 1
                                    ? undefined
                                    : filter.publications.filter((publicationId) => {
                                        return publicationId !== id
                                      }),
                              })
                            }}
                          />
                        </Badge>
                      </li>
                    )
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
                    const name = options.passageTopics.data?.[id]?.name
                    return (
                      <li className="flex min-w-0 mb-1 mr-1 md:mr-0" key={id}>
                        <Badge className="min-w-0 space-x-1 text-gray-100 bg-gray-900 cursor-default select-none">
                          <TooltipTrigger tooltip={`${t.filteredBy} ${t.topics[0]}: ${name}`}>
                            <button
                              type="button"
                              className="font-medium truncate rounded cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                            >
                              {name}
                            </button>
                          </TooltipTrigger>
                          <ClearButton
                            className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                            onClick={() => {
                              setFilter({
                                topics:
                                  filter.topics === undefined || filter.topics.length === 1
                                    ? undefined
                                    : filter.topics.filter((topicId) => {
                                        return topicId !== id
                                      }),
                              })
                            }}
                          />
                        </Badge>
                      </li>
                    )
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
                    const name = options.passageTypes.data?.[id]?.name
                    return (
                      <li className="flex min-w-0 mb-1 mr-1 md:mr-0" key={id}>
                        <Badge className="min-w-0 space-x-1 text-gray-100 bg-gray-900 cursor-default select-none">
                          <TooltipTrigger tooltip={`${t.filteredBy} ${t.types[0]}: ${name}`}>
                            <button
                              type="button"
                              className="font-medium truncate rounded cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                            >
                              {name}
                            </button>
                          </TooltipTrigger>
                          <ClearButton
                            className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                            onClick={() => {
                              setFilter({
                                types:
                                  filter.types === undefined || filter.types.length === 1
                                    ? undefined
                                    : filter.types.filter((typeId) => {
                                        return typeId !== id
                                      }),
                              })
                            }}
                          />
                        </Badge>
                      </li>
                    )
                  })}
                </ul>
              </dd>
            </dl>
          </li>
        ) : null}
      </ul>
    </div>
  )
}

/**
 * Texts and metadata for the currently selected entity.
 */
function DetailsPanel({
  selectedSolaEntity,
  setSelectedSolaEntity,
  selectedSolaEntityRelations,
  setFilter,
}: {
  selectedSolaEntity: QueryObserverResult<SolaEntityDetails, unknown>
  setSelectedSolaEntity: (entity: SolaSelectedEntity | null) => void
  selectedSolaEntityRelations: Record<SolaEntityType, Array<SolaEntityRelation>>
  setFilter: (filter: SolaPassagesFilter) => void
}) {
  const t = useLabels() as typeof labels[SiteLocale]

  const solaEntityTexts = useSolaTexts(selectedSolaEntity.data)
  const solaEntityBibliography = useSolaEntityBibliography(selectedSolaEntity.data)

  const [primaryText, ...texts] = solaEntityTexts.data ?? []

  const { authors, biblePassages } = useSolaPassageMetadata(
    selectedSolaEntity.data?.type === 'Passage' ? selectedSolaEntity.data : undefined,
  )

  if (
    selectedSolaEntity.status === 'loading' ||
    solaEntityTexts.status === 'loading' ||
    solaEntityBibliography.status === 'loading'
  ) {
    return (
      <div className="flex flex-col items-center justify-center text-yellow-400">
        <Spinner className="w-6 h-6" />
      </div>
    )
  }

  if (selectedSolaEntity.data === undefined) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-500">
        <p className="p-6 text-center">{t.selectEntityForDetails}</p>
      </div>
    )
  }

  /** Updating metadata on the client is not optimal for SEO, but better than nothing. */
  let metadata = null

  const entity = selectedSolaEntity.data
  switch (entity.type) {
    case 'Event':
      metadata = createSchemaOrg({ '@type': 'Event', name: entity.name })
      break
    case 'Institution':
      metadata = createSchemaOrg({ '@type': 'Organization', name: entity.name })
      break
    case 'Passage':
      metadata = createSchemaOrg({ '@type': 'CreativeWork', name: entity.name })
      break
    case 'Person':
      metadata = createSchemaOrg({ '@type': 'Person', name: entity.name })
      break
    case 'Place':
      metadata = createSchemaOrg({ '@type': 'Place', name: entity.name })
      break
    case 'Publication':
      metadata = createSchemaOrg({ '@type': 'CreativeWork', name: entity.name })
      break
  }

  return (
    <Fragment>
      <SchemaOrg schema={metadata} />
      <section
        className="overflow-y-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-yellow-400"
        style={{ gridArea: 'details' }}
      >
        <div className="grid min-h-full gap-6 p-6 details-panel">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <EntityType type={selectedSolaEntity.data.type} />
                <div className="space-x-1">
                  <CopyLinkButton />
                  <PrintButton
                    entity={selectedSolaEntity.data}
                    authors={authors.data}
                    relations={selectedSolaEntityRelations}
                    biblePassages={biblePassages.data}
                    primary={primaryText}
                    texts={texts}
                    bibliography={solaEntityBibliography.data}
                    editorId={selectedSolaEntity.data.assigned_user}
                  />
                </div>
              </div>
              <h2 className="text-xl font-semibold leading-6 text-gray-700">
                {selectedSolaEntity.data.name}
              </h2>
              <Authors authors={authors} setSelectedSolaEntity={setSelectedSolaEntity} />
            </div>
            <Duration
              from={selectedSolaEntity.data.start_date_written}
              fromIso={selectedSolaEntity.data.start_date}
              to={selectedSolaEntity.data.end_date_written}
              toIso={selectedSolaEntity.data.end_date}
            />
            {selectedSolaEntity.data.primary_date != null ? (
              <div className="relative flex h-8">
                <DurationTimeline entity={selectedSolaEntity.data} />
              </div>
            ) : null}
            <Properties entity={selectedSolaEntity.data} setFilter={setFilter} />
            <Relations
              relations={selectedSolaEntityRelations}
              setSelectedSolaEntity={setSelectedSolaEntity}
            />
            <BiblePassages passages={biblePassages} />
            <EditedBy editorId={selectedSolaEntity.data.assigned_user} />
          </div>
          <Texts primary={primaryText} texts={texts} bibliography={solaEntityBibliography.data} />
        </div>
      </section>
    </Fragment>
  )
}

function CopyLinkButton() {
  const router = useRouter()
  const t = useLabels() as typeof labels[SiteLocale]

  return (
    <button
      className="inline-flex items-center px-2 py-1 space-x-1 text-xs font-medium text-gray-700 transition bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
      onClick={() => {
        const url = new URL(router.asPath, baseUrl)
        navigator.clipboard.writeText(String(url))
      }}
      type="button"
    >
      <LinkIcon />
      <span>{t.copyLink}</span>
    </button>
  )
}

function PrintButton({
  entity,
  authors,
  relations,
  biblePassages,
  primary,
  texts,
  bibliography,
  editorId,
}: {
  entity?: SolaEntityDetails
  authors?: Array<SolaListEntity>
  relations: Record<SolaEntityType, Array<SolaEntityRelation>>
  biblePassages?: Record<string, string>
  primary?: SolaTextDetails
  texts: Array<SolaTextDetails>
  bibliography?: Array<SolaBibsonomyReference>
  editorId?: { label: string } | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const t = useLabels() as typeof labels[SiteLocale]
  const locale = useCurrentLocale()

  const users = useSolaUsers()
  const userId = editorId?.label
  const editor = userId !== undefined ? users.data?.[userId] : undefined

  if (entity == null) return null

  function print() {
    if (containerRef.current == null) return
    const style = `
      mark {
        background: #eee;
        padding: 3px;
        border-radius: 3px;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
        color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    `
    const html = `<!doctype html><html><head><title>${document.title}</title><style>${style}</style></head><body>${containerRef.current.innerHTML}</body></html>`
    printHtml(html)
  }

  function createUrl() {
    if (entity == null) return ''
    const url = new URL([locale, 'dataset'].join('/'), baseUrl)
    url.searchParams.set('id', String(entity.id))
    url.searchParams.set('type', entity.type)
    return String(url)
  }

  return (
    <Fragment>
      <div className="hidden" ref={containerRef}>
        <h1>{entity.name}</h1>
        <dl>
          {authors && authors.length ? (
            <Fragment>
              <dt>{t.authors[authors.length === 1 ? 0 : 1]}:</dt>
              <dd>
                {authors
                  .map((author) => {
                    return author.name
                  })
                  .join(', ')}
              </dd>
            </Fragment>
          ) : null}
          {entity.type === 'Passage' ? (
            <Fragment>
              {entity.kind.length ? (
                <Fragment>
                  <dt>{t.types[1]}</dt>
                  <dd>
                    {entity.kind
                      .map((type) => {
                        return type.label
                      })
                      .join(', ')}
                  </dd>
                </Fragment>
              ) : null}
              {entity.topic.length ? (
                <Fragment>
                  <dt>{t.topics[1]}</dt>
                  <dd>
                    {entity.topic
                      .map((topic) => {
                        return topic.label
                      })
                      .join(', ')}
                  </dd>
                </Fragment>
              ) : null}
            </Fragment>
          ) : null}
          {Object.entries(relations).map(([type, relations]) => {
            if (relations.length === 0) return null
            return (
              <Fragment key={type}>
                <dt>
                  {t.relationsTo} {t.entityType[type as SolaEntityType][1]}:
                </dt>
                <dd>
                  {relations
                    .map((relation) => {
                      return relation.label
                    })
                    .join(', ')}
                </dd>
              </Fragment>
            )
          })}
          {biblePassages && Object.keys(biblePassages).length ? (
            <Fragment>
              <dt>{t.biblePassages}</dt>
              <dd>{Object.keys(biblePassages).join(', ')}</dd>
            </Fragment>
          ) : null}
        </dl>
        {primary ? (
          <Fragment>
            <h2>{primary.kind.label}</h2>
            <div
              style={{ whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: primary.text }}
            />
          </Fragment>
        ) : null}
        {texts.map((text) => {
          return (
            <Fragment key={text.id}>
              <h2>{text.kind.label}</h2>
              <div
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{ __html: text.text }}
              />
            </Fragment>
          )
        })}
        {bibliography && bibliography.length > 0 ? (
          <Fragment>
            <h2>{t.bibliography}</h2>
            {bibliography.map((reference) => {
              return <BibliographicReference key={reference.pk} reference={reference} />
            })}
          </Fragment>
        ) : null}
        {editor !== undefined ? (
          <p>
            <small>
              {t.editedBy} {[editor.first_name, editor.last_name].join(' ')}
            </small>
          </p>
        ) : null}
        <p>
          <small>{createUrl()}</small>
        </p>
      </div>
      <button
        className="inline-flex items-center px-2 py-1 space-x-1 text-xs font-medium text-gray-700 transition bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
        onClick={print}
        type="button"
      >
        <DocumentIcon />
        <span>{t.printDocument}</span>
      </button>
    </Fragment>
  )
}

function EntityType({ type }: { type?: SolaEntityType }) {
  if (type === undefined) return null

  const classNames = cx(
    'text-xs font-medium tracking-wider uppercase pointer-events-none py-1 px-2 rounded inline-block',
    colors.bg[type],
  )

  return <span className={classNames}>{type}</span>
}

function Authors({
  authors,
  setSelectedSolaEntity,
}: {
  authors: QueryObserverResult<Array<SolaListEntity>, unknown>
  setSelectedSolaEntity: (entity: SolaSelectedEntity | null) => void
}) {
  const t = useLabels() as typeof labels[SiteLocale]

  if (authors.status === 'loading')
    return (
      <div className="py-1">
        <Spinner className="w-4 h-4 text-gray-700" />
      </div>
    )
  if (authors.data === undefined || authors.data.length === 0) return null

  return (
    <dl className="pt-1 text-xs text-gray-700">
      <dt className="sr-only">{t.authors[authors.data.length === 1 ? 0 : 1]}</dt>
      <dd className="flex items-center space-x-1">
        {authors.data.map((author) => {
          return (
            <Badge key={author.id} className={cx('transition', colors.bg.Person)}>
              <button
                className="font-medium cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                onClick={() => {
                  setSelectedSolaEntity({
                    id: author.id,
                    type: 'Person',
                  })
                }}
                type="button"
              >
                {author.name}
              </button>
            </Badge>
          )
        })}
      </dd>
    </dl>
  )
}

function Duration({
  from,
  fromIso,
  to,
  toIso,
}: {
  from?: string | null
  fromIso?: string | null
  to?: string | null
  toIso?: string | null
}) {
  if (from == null && to == null) return null

  const start = from != null && fromIso != null ? <time dateTime={fromIso}>{from}</time> : null
  const end = to != null && toIso != null ? <time dateTime={toIso}>{to}</time> : null

  return (
    <div className="text-sm text-gray-700">
      {start}
      {toIso !== fromIso ? (
        <Fragment>
          <span> &ndash; </span>
          {end}
        </Fragment>
      ) : null}
    </div>
  )
}

function Properties({
  entity,
  setFilter,
}: {
  entity?: SolaEntityDetails
  setFilter: (filter: SolaPassagesFilter) => void
}) {
  if (entity === undefined) return null

  switch (entity.type) {
    case 'Passage':
      return <PassageProperties entity={entity} setFilter={setFilter} />
    default:
      return null
  }
}

function PassageProperties({
  entity,
  setFilter,
}: {
  entity: SolaPassageDetails
  setFilter: (filter: SolaPassagesFilter) => void
}) {
  const t = useLabels() as typeof labels[SiteLocale]

  const hasPassageTopics = entity.topic.length > 0
  const hasPassageTypes = entity.kind.length > 0

  if (!hasPassageTopics && !hasPassageTypes) return null

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
                        className="inline-block max-w-full text-gray-100 transition bg-gray-800 hover:bg-black hover:gray-200"
                      >
                        <button
                          className="rounded px-2 py-0.5 inline-block font-medium truncate cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                          onClick={() => {
                            return setFilter({
                              topics: [topic.id],
                            })
                          }}
                          type="button"
                        >
                          {topic.label}
                        </button>
                      </Badge>
                    </li>
                  )
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
                        className="inline-block max-w-full text-gray-100 transition bg-gray-800 hover:bg-black hover:gray-200"
                      >
                        <button
                          className="rounded px-2 py-0.5 inline-block font-medium truncate cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                          onClick={() => {
                            return setFilter({
                              types: [kind.id],
                            })
                          }}
                          type="button"
                        >
                          {kind.label}
                        </button>
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  )
}

function Relations({
  relations,
  setSelectedSolaEntity,
}: {
  relations: Record<SolaEntityType, Array<SolaEntityRelation>>
  setSelectedSolaEntity: (entity: SolaSelectedEntity | null) => void
}) {
  const t = useLabels() as typeof labels[SiteLocale]

  if (
    relations.Event.length === 0 &&
    relations.Institution.length === 0 &&
    relations.Passage.length === 0 &&
    relations.Person.length === 0 &&
    relations.Place.length === 0 &&
    relations.Publication.length === 0
  ) {
    return null
  }

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
        {t.relations}
      </h3>
      <dl className="space-y-1 text-xs text-gray-700">
        {Object.entries(relations).map(([type, relations]) => {
          if (relations.length === 0) return null

          /**
           * Only show unique related entities.
           *
           * TODO: should be memoized.
           */
          const seenIds = new Set()

          return (
            <div key={type}>
              <dt className="sr-only">{t.entityType[type as SolaEntityType][1]}</dt>
              <dd>
                <ul className="flex flex-wrap items-center">
                  {relations.map((relation) => {
                    /** Only show unique related entities. */
                    if (seenIds.has(relation.related_entity.id)) return null
                    seenIds.add(relation.related_entity.id)

                    return (
                      <li className="min-w-0 mb-1 mr-1" key={relation.id}>
                        <Badge
                          variant="tight"
                          className={cx(
                            'inline-block max-w-full transition',
                            colors.bg[type as SolaEntityType],
                          )}
                        >
                          <button
                            className="px-2 py-0.5 rounded inline-block font-medium truncate cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                            onClick={() => {
                              setSelectedSolaEntity({
                                id: relation.related_entity.id,
                                type: relation.related_entity.type,
                              })
                            }}
                            type="button"
                          >
                            {relation.related_entity.label}
                          </button>
                        </Badge>
                      </li>
                    )
                  })}
                </ul>
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}

function BiblePassages({
  passages,
}: {
  passages: QueryObserverResult<Record<string, string>, unknown>
}) {
  const t = useLabels() as typeof labels[SiteLocale]

  if (passages.status === 'loading') return <span>Loading&hellip;</span>
  if (passages.data === undefined || count(passages.data) === 0) return null

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
        {t.biblePassages}
      </h3>
      <ul className="flex flex-wrap items-center text-xs">
        {Object.entries(passages.data).map(([reference, url]) => {
          return (
            <li className="min-w-0 mb-1 mr-1" key={reference}>
              <Badge
                variant="tight"
                className="inline-block max-w-full font-medium transition bg-blue-300"
              >
                <a
                  className="rounded px-2 py-0.5 inline-block font-medium truncate cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {reference}
                </a>
              </Badge>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function EditedBy({ editorId }: { editorId?: SolaEntityDetails['assigned_user'] }) {
  const t = useLabels() as typeof labels[SiteLocale]

  const users = useSolaUsers()
  const userId = editorId?.label
  const editor = userId !== undefined ? users.data?.[userId] : undefined

  if (editor == null) return null

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">{t.editedBy}</h3>
      <div className="text-sm text-gray-700">{[editor.first_name, editor.last_name].join(' ')}</div>
    </div>
  )
}

function Texts({
  primary,
  texts,
  bibliography,
}: {
  primary?: SolaTextDetails
  texts: Array<SolaTextDetails>
  bibliography?: Array<SolaBibsonomyReference>
}) {
  const t = useLabels() as typeof labels[SiteLocale]

  const hasPrimaryText = primary !== undefined
  const hasAdditionalTexts =
    texts.length > 0 || (bibliography !== undefined && bibliography.length > 0)

  if (!hasPrimaryText && !hasAdditionalTexts) return null

  const tabs = texts.map((text) => {
    return {
      id: text.kind.id,
      title: text.kind.label,
      children: (
        <div
          className="leading-6 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: text.text }}
        />
      ),
    }
  })
  if (bibliography !== undefined && bibliography.length > 0) {
    tabs.push({
      id: 0,
      title: t.bibliography,
      children: <Bibliography bibliography={bibliography} />,
    })
  }

  return (
    <div className="grid grid-cols-2 gap-6 p-6 text-sm bg-white rounded shadow">
      {hasPrimaryText ? (
        <div className="space-y-4">
          <div className="flex border-b border-gray-200">
            <div className="pb-2 font-semibold">{primary.kind.label}</div>
          </div>
          <div
            className="leading-6 whitespace-pre-wrap"
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            dangerouslySetInnerHTML={{ __html: primary.text ?? '' }}
          />
        </div>
      ) : null}
      {hasAdditionalTexts ? (
        <Tabs aria-label={t.additionalTexts} items={tabs}>
          {(item: typeof tabs[number]) => {
            return <TabItem title={item.title}>{item.children}</TabItem>
          }}
        </Tabs>
      ) : null}
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        mark {
          background-color: #fce7f3; /* bg-pink-100 */
        }
        mark[data-entity-class='PassagePublication'] {
          background-color: #dbeafe; /* bg-blue-100 */
        }
      `}</style>
    </div>
  )
}

function Bibliography({ bibliography }: { bibliography: Array<SolaBibsonomyReference> }) {
  const sorted = useMemo(() => {
    return bibliography.sort((a, b) => {
      if (a.author == null) return -1
      if (b.author == null) return 1
      return a.author.localeCompare(b.author)
    })
  }, [bibliography])

  return (
    <ul className="space-y-2">
      {sorted.map((reference) => {
        return (
          <li key={reference.pk} className="leading-6">
            <BibliographicReference reference={reference} />
          </li>
        )
      })}
    </ul>
  )
}

function BibliographicReference({ reference }: { reference: SolaBibsonomyReference }) {
  const entry = useMemo(() => {
    const text = []

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (reference.author) text.push(reference.author + ':')
    if (reference.title) text.push(reference.title + '.')
    if (reference.address) text.push(reference.address + ':')
    if (reference.publisher) text.push(reference.publisher)
    if (reference.year) {
      if (reference.pages_start) {
        text.push(reference.year + ',')
        const pages = []
        if (reference.pages_start) pages.push(reference.pages_start)
        if (reference.pages_end) pages.push(reference.pages_end)
        text.push(pages.join('-'))
      } else {
        text.push(reference.year)
      }
    }

    return text.join(' ') + '.'
  }, [reference])

  return <div>{entry}</div>
}
