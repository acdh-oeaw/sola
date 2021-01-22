import cx from 'clsx'
import type { GetStaticPropsContext, GetStaticPropsResult } from 'next'
import { useRouter } from 'next/router'
import type { FormEvent } from 'react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import type { QueryObserverResult } from 'react-query'

import type {
  SolaBibsonomyReference,
  SolaEntityDetails,
  SolaEntityRelation,
  SolaEntityType,
  SolaEvent,
  SolaInstitution,
  SolaPassage,
  SolaPassageDetails,
  SolaPerson,
  SolaPlace,
  SolaPublication,
  SolaTextDetails,
  SolaVocabulary,
} from '@/api/sola/client'
import { useDebouncedData } from '@/lib/data/useDebouncedData'
import type { Node } from '@/lib/data/useHierarchicalData'
import { useSortedData } from '@/lib/data/useSortedData'
import type { SiteLocale } from '@/lib/i18n/getCurrentLocale'
import { getCurrentLocale } from '@/lib/i18n/getCurrentLocale'
import { LabelsProvider, useLabels } from '@/lib/i18n/LabelsContext'
import {
  useSolaEntities,
  useSolaEntityBibliography,
  useSolaEntityRelations,
  useSolaFilteredPassages,
  useSolaFilterOptions,
  useSolaPassageMetadata,
  useSolaPassagesFilter,
  useSolaPassagesFilterOptionsTree,
  useSolaSelectedEntity,
  useSolaTexts,
} from '@/lib/sola/hooks'
import type { SolaPassagesFilter, SolaSelectedEntity } from '@/lib/sola/types'
import { count } from '@/lib/util/count'
import { Link as LinkIcon } from '@/modules/icons/Link'
import { Metadata } from '@/modules/metadata/Metadata'
import { useCanonicalUrl } from '@/modules/metadata/useCanonicalUrl'
import { Badge } from '@/modules/ui/Badge'
import { ClearButton } from '@/modules/ui/ClearButton'
import { Disclosure } from '@/modules/ui/Disclosure'
import { InlineButton } from '@/modules/ui/InlineButton'
import { Item, ListBox, Section } from '@/modules/ui/ListBox'
import { Spinner } from '@/modules/ui/Spinner'
import { Item as TabItem, Tabs } from '@/modules/ui/Tabs'
import { TextField } from '@/modules/ui/TextField'
import { DurationTimeline } from '@/modules/visualization/DurationTimeline'
import { Visualization } from '@/modules/visualization/Visualization'
import { url as baseUrl } from '~/config/site.json'
import { colors } from '~/config/sola.json'

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
      Publication: ['Publication', 'Publications'],
    },
    options: 'Options',
    other: 'Other',
    filterPassages: 'Filter passages',
    filteredBy: 'Filtered by',
    reset: 'Reset',
    selectEntityForDetails:
      'Please select an entity in the timeline above to view details.',
    authors: ['Author', 'Authors'],
    properties: 'Properties',
    gender: 'Gender',
    coordinates: 'Coordinates',
    title: 'Title',
    topics: ['Topic', 'Topics'],
    types: ['Type', 'Types'],
    relations: 'Relations',
    biblePassages: 'Bible passages',
    primaryText: 'Primary text',
    additionalTexts: 'Additional texts',
    bibliography: 'Bibliography',
    editedBy: 'Edited by',
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
      Publication: ['Publikation', 'Publikationen'],
    },
    options: 'Optionen',
    other: 'Andere',
    filterPassages: 'Filter Passagen',
    filteredBy: 'Gefiltert nach',
    reset: 'Zurücksetzen',
    selectEntityForDetails:
      'Bitte Punkt in der Visualisierung auswählen, um Details zu sehen.',
    authors: ['AutorIn', 'AutorInnen'],
    properties: 'Eigenschaften',
    gender: 'Gender',
    coordinates: 'Koordinaten',
    title: 'Titel',
    topics: ['Thema', 'Themen'],
    types: ['Gattung', 'Gattungen'],
    relations: 'Beziehungen',
    biblePassages: 'Bibel-Passagen',
    primaryText: 'Primärtext',
    additionalTexts: 'Zusätzliche Texte',
    bibliography: 'Bibliographie',
    editedBy: 'Bearbeitet von',
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
  const canonicalUrl = useCanonicalUrl()

  return (
    <Fragment>
      <Metadata title={props.labels.page.title} canonicalUrl={canonicalUrl} />
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
  const { solaPassagesFilter, setSolaPassagesFilter } = useSolaPassagesFilter()

  return (
    <main
      className="grid bg-gray-50"
      style={{
        gridArea: 'main',
        gridTemplateColumns: 'var(--sidepanel-width, 240px) 1fr',
        gridTemplateRows: 'var(--visualization-height, 400px) 1fr',
        gridTemplateAreas: '"panel visualization" "panel details"',
        maxHeight: 'calc(100vh - var(--header-height, 60px))',
      }}
    >
      <FilterPanel
        filter={solaPassagesFilter}
        setFilter={setSolaPassagesFilter}
      />
      <ContentPanel
        filter={solaPassagesFilter}
        setFilter={setSolaPassagesFilter}
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
}: {
  filter: SolaPassagesFilter
  setFilter: (filter: SolaPassagesFilter) => void
}) {
  const t = useLabels() as typeof labels[SiteLocale]

  const {
    authors,
    passageTopics,
    passageTypes,
    publications,
  } = useSolaFilterOptions()

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

  const sortedAuthors = useSortedData(authors.data, 'name')
  const sortedPublications = useSortedData(publications.data, 'name')
  const {
    passageTopicsTree,
    passageTypesTree,
  } = useSolaPassagesFilterOptionsTree(
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
      className="overflow-y-auto bg-gray-900"
      style={{ gridArea: 'panel' }}
    >
      <form className="flex flex-col px-4 py-6 space-y-4" onSubmit={onSubmit}>
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
            }}
          />
        </div>
        <TextField
          label={t.title}
          value={title}
          onChange={setTitle}
          className="transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
        />
        <Disclosure
          id="authors-filter"
          panelId="authors-filter-panel"
          className="text-gray-300 transition hover:text-white"
          title={createListboxLabel(
            t.authors[1],
            sortedAuthors.length,
            filter.authors?.length,
          )}
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
            {(item) => <Item>{item.name}</Item>}
          </ListBox>
        </Disclosure>
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
            {(item) => <Item>{item.name}</Item>}
          </ListBox>
        </Disclosure>
        <Disclosure
          id="passage-types-filter"
          panelId="passage-types-filter-panel"
          className="text-gray-300 transition hover:text-white"
          title={createListboxLabel(
            t.types[1],
            passageTypesTree.length,
            filter.types?.length,
          )}
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
              if (item.children !== undefined && item.children.size > 0) {
                return (
                  <Section
                    key={`section-${item.id}`}
                    title={item.name}
                    items={item.children}
                  >
                    {(item) => <Item>{item.name}</Item>}
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
    if (topic.children === undefined) return []

    /** Sort alphabetically, sort "Other" to end. */
    return Array.from(topic.children).sort((a, b) =>
      a.id === topic.id ? 1 : a.name.localeCompare(b.name),
    )
  }, [topic])

  const selectedCount = useMemo(() => {
    const childIds = new Set(topics.map((topic) => topic.id))
    return filter?.filter((topicId) => childIds.has(topicId)).length
  }, [topics, filter])

  if (topic.children === undefined) return null

  const id = `passage-topic-${topic.id}-filter`

  return (
    <Disclosure
      id={id}
      panelId={`${id}-panel`}
      className="text-gray-300 transition hover:text-white"
      title={createListboxLabel(
        `${t.topics[0]}: ${topic.name}`,
        topics.length,
        selectedCount,
      )}
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
        {(item) => <Item>{item.name}</Item>}
      </ListBox>
    </Disclosure>
  )
}

/**
 * Container with shared data requirements for main content area.
 */
function ContentPanel({
  filter,
  setFilter,
}: {
  filter: SolaPassagesFilter
  setFilter: (filter: SolaPassagesFilter) => void
}) {
  const solaEntities = useSolaEntities()

  const { selectedSolaEntity, setSelectedSolaEntity } = useSolaSelectedEntity()
  const selectedSolaEntityRelations = useSolaEntityRelations(
    selectedSolaEntity.data,
  )

  const isLoadingInitialData =
    solaEntities.events.status === 'loading' ||
    solaEntities.institutions.status === 'loading' ||
    solaEntities.passages.status === 'loading' ||
    solaEntities.persons.status === 'loading' ||
    solaEntities.places.status === 'loading' ||
    solaEntities.publications.status === 'loading'

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
  selectedSolaEntity,
  setSelectedSolaEntity,
  selectedSolaEntityRelations,
}: {
  solaEntities: {
    events: QueryObserverResult<Record<number, SolaEvent>, unknown>
    institutions: QueryObserverResult<Record<number, SolaInstitution>, unknown>
    passages: QueryObserverResult<Record<number, SolaPassage>, unknown>
    persons: QueryObserverResult<Record<number, SolaPerson>, unknown>
    places: QueryObserverResult<Record<number, SolaPlace>, unknown>
    publications: QueryObserverResult<Record<number, SolaPublication>, unknown>
  }
  filter: SolaPassagesFilter
  setFilter: (filter: SolaPassagesFilter) => void
  selectedSolaEntity: QueryObserverResult<SolaEntityDetails, unknown>
  setSelectedSolaEntity: (entity: SolaSelectedEntity | null) => void
  selectedSolaEntityRelations: Record<SolaEntityType, Array<SolaEntityRelation>>
}) {
  const t = useLabels() as typeof labels[SiteLocale]

  const filteredSolaPassages = useSolaFilteredPassages(filter)

  const countedSolaEvents = count(solaEntities.events.data)
  const countedSolaInstitutions = count(solaEntities.institutions.data)
  const countedSolaPassages = count(solaEntities.passages.data)
  const countedSolaPersons = count(solaEntities.persons.data)
  const countedSolaPlaces = count(solaEntities.places.data)
  const countedSolaPublications = count(solaEntities.publications.data)

  return (
    <section
      className="flex flex-col pb-4 border-b border-gray-200"
      style={{ gridArea: 'visualization' }}
    >
      <div className="flex justify-between px-6 pt-6 pb-4 space-x-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold">{t.h1}</h1>
          {filteredSolaPassages.status === 'loading' ? (
            <Spinner className="w-6 h-6" />
          ) : (
            <div className="w-6 h-6" />
          )}
        </div>
        <div className="flex flex-col items-end space-y-1">
          <ul className="flex flex-wrap justify-end space-x-2 text-xs text-gray-500">
            <li className="flex items-center space-x-1">
              <div className={cx('w-3 h-3 transition', colors.bg['Event'])} />
              <span>
                {countedSolaEvents} {t.entityType['Event'][1]}
              </span>
            </li>
            <li className="flex items-center space-x-1">
              <div
                className={cx('w-3 h-3 transition', colors.bg['Institution'])}
              />
              <span>
                {countedSolaInstitutions} {t.entityType['Institution'][1]}
              </span>
            </li>
            <li className="flex items-center space-x-1">
              <div className={cx('w-3 h-3 transition', colors.bg['Passage'])} />
              <span>
                {countedSolaPassages} {t.entityType['Passage'][1]}
              </span>
            </li>
            <li className="flex items-center space-x-1">
              <div className={cx('w-3 h-3 transition', colors.bg['Person'])} />
              <span>
                {countedSolaPersons} {t.entityType['Person'][1]}
              </span>
            </li>
            <li className="flex items-center space-x-1">
              <div className={cx('w-3 h-3 transition', colors.bg['Place'])} />
              <span>
                {countedSolaPlaces} {t.entityType['Place'][1]}
              </span>
            </li>
            <li className="flex items-center space-x-1">
              <div
                className={cx('w-3 h-3 transition', colors.bg['Publication'])}
              />
              <span>
                {countedSolaPublications} {t.entityType['Publication'][1]}
              </span>
            </li>
          </ul>
          <ActiveFilterList filter={filter} setFilter={setFilter} />
        </div>
      </div>
      <div className="relative flex-1 mx-6">
        <Visualization
          solaEntities={solaEntities}
          filteredSolaPassages={filteredSolaPassages}
          selectedSolaEntity={selectedSolaEntity}
          setSelectedSolaEntity={setSelectedSolaEntity}
          selectedSolaEntityRelations={selectedSolaEntityRelations}
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
}) {
  const t = useLabels() as typeof labels[SiteLocale]

  const options = useSolaFilterOptions()

  if (
    options.authors.data === undefined ||
    options.passageTopics.data === undefined ||
    options.passageTypes.data === undefined ||
    options.publications.data === undefined
  ) {
    return null
  }

  const { name, authors, publications, topics, types } = filter

  const hasAuthorsFilter = authors !== undefined && authors.length > 0
  const hasNameFilter = name !== undefined && name.length > 0
  const hasPublicationFilter =
    publications !== undefined && publications.length > 0
  const hasPassageTopicsFilter = topics !== undefined && topics.length > 0
  const hasPassageTypesFilter = types !== undefined && types.length > 0

  if (
    !hasAuthorsFilter &&
    !hasNameFilter &&
    !hasPublicationFilter &&
    !hasPassageTopicsFilter &&
    !hasPassageTypesFilter
  ) {
    return <div className="h-6">&nbsp;</div>
  }

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500">
      <div className="flex-shrink-0 mb-1">{t.filteredBy}:</div>
      <ul className="inline space-x-2">
        {hasNameFilter ? (
          <li>
            <span className="mb-1 font-medium">{t.title}: </span>
            <Badge className="inline-flex items-center mb-1 space-x-2 text-gray-100 bg-gray-900 cursor-default select-none">
              <span>{name}</span>
              <ClearButton
                className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                onClick={() => {
                  setFilter({ name: undefined })
                }}
              />
            </Badge>
          </li>
        ) : null}
        {hasAuthorsFilter ? (
          <li>
            <span className="mb-1 font-medium">{t.authors[1]}:</span>{' '}
            {authors?.map((id) => {
              return (
                <Badge
                  key={id}
                  className="inline-flex items-center mb-1 space-x-2 text-gray-100 bg-gray-900 cursor-default select-none"
                >
                  <span>{options.authors.data?.[id]?.name}</span>
                  <ClearButton
                    className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                    onClick={() => {
                      setFilter({
                        authors:
                          filter.authors === undefined ||
                          filter.authors.length === 1
                            ? undefined
                            : filter.authors.filter(
                                (authorId) => authorId !== id,
                              ),
                      })
                    }}
                  />
                </Badge>
              )
            })}
          </li>
        ) : null}
        {hasPublicationFilter ? (
          <li>
            <span className="mb-1 font-medium">
              {t.entityType.Publication[1]}:
            </span>{' '}
            {publications?.map((id) => {
              return (
                <Badge
                  key={id}
                  className="inline-flex items-center mb-1 space-x-2 text-gray-100 bg-gray-900 cursor-default select-none"
                >
                  <span>{options.publications.data?.[id]?.name}</span>
                  <ClearButton
                    className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                    onClick={() => {
                      setFilter({
                        publications:
                          filter.publications === undefined ||
                          filter.publications.length === 1
                            ? undefined
                            : filter.publications.filter(
                                (publicationId) => publicationId !== id,
                              ),
                      })
                    }}
                  />
                </Badge>
              )
            })}
          </li>
        ) : null}
        {hasPassageTopicsFilter ? (
          <li>
            <span className="mb-1 font-medium">{t.topics[1]}:</span>{' '}
            {topics?.map((id) => {
              return (
                <Badge
                  key={id}
                  className="inline-flex items-center mb-1 space-x-2 text-gray-100 bg-gray-900 cursor-default select-none"
                >
                  <span>{options.passageTopics.data?.[id]?.name}</span>
                  <ClearButton
                    className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                    onClick={() => {
                      setFilter({
                        topics:
                          filter.topics === undefined ||
                          filter.topics.length === 1
                            ? undefined
                            : filter.topics.filter((topicId) => topicId !== id),
                      })
                    }}
                  />
                </Badge>
              )
            })}
          </li>
        ) : null}
        {hasPassageTypesFilter ? (
          <li>
            <span className="mb-1 font-medium">{t.types[1]}:</span>{' '}
            {types?.map((id) => {
              return (
                <Badge
                  key={id}
                  className="inline-flex items-center mb-1 space-x-2 text-gray-100 bg-gray-900 cursor-default select-none"
                >
                  <span>{options.passageTypes.data?.[id]?.name}</span>
                  <ClearButton
                    className="rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                    onClick={() => {
                      setFilter({
                        types:
                          filter.types === undefined ||
                          filter.types.length === 1
                            ? undefined
                            : filter.types.filter((typeId) => typeId !== id),
                      })
                    }}
                  />
                </Badge>
              )
            })}
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
  const solaEntityBibliography = useSolaEntityBibliography(
    selectedSolaEntity.data,
  )

  const [primaryText, ...texts] = solaEntityTexts.data ?? []

  const { authors, biblePassages } = useSolaPassageMetadata(
    selectedSolaEntity.data?.type === 'Passage'
      ? selectedSolaEntity.data
      : undefined,
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
        <p>{t.selectEntityForDetails}</p>
      </div>
    )
  }

  return (
    <section className="overflow-y-auto" style={{ gridArea: 'details' }}>
      <div
        className="grid min-h-full gap-6 p-6"
        style={{
          gridTemplateColumns: 'var(--details-sidepanel-width, 320px) 1fr',
        }}
      >
        <div className="space-y-4">
          <div className="flex space-x-2">
            <CopyLinkButton />
          </div>
          <div className="space-y-1">
            <EntityType type={selectedSolaEntity.data.type} />
            <h2 className="text-xl font-semibold leading-6 text-gray-700">
              {selectedSolaEntity.data.name}
            </h2>
            <Authors
              authors={authors}
              setSelectedSolaEntity={setSelectedSolaEntity}
            />
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
          <EditedBy editor={selectedSolaEntity.data.assigned_user} />
        </div>
        <Texts
          primary={primaryText}
          texts={texts}
          bibliography={solaEntityBibliography.data}
        />
      </div>
    </section>
  )
}

function CopyLinkButton() {
  const router = useRouter()
  return (
    <button
      className="inline-flex items-center px-2 py-1 space-x-1 text-xs font-medium text-gray-700 transition bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
      onClick={() => {
        const url = new URL(router.asPath, baseUrl)
        navigator.clipboard.writeText(String(url))
      }}
    >
      <LinkIcon />
      <span>Copy Link</span>
    </button>
  )
}

function EntityType({ type }: { type?: SolaEntityType }) {
  if (type === undefined) return null

  const classNames = cx(
    'text-xs font-medium tracking-wider uppercase pointer-events-none py-1 px-2 rounded inline-block mb-1',
    colors.bg[type],
  )

  return <span className={classNames}>{type}</span>
}

function Authors({
  authors,
  setSelectedSolaEntity,
}: {
  authors: QueryObserverResult<Array<SolaPerson>, unknown>
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
    <dl className="pt-1 text-sm text-gray-700">
      <dt className="sr-only">
        {t.authors[authors.data.length === 1 ? 0 : 1]}
      </dt>
      <dd>
        {authors.data.map((author) => {
          return (
            <Badge
              key={author.id}
              className={cx('transition', colors.bg.Person)}
            >
              <InlineButton
                className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                onPress={() => {
                  setSelectedSolaEntity({
                    id: author.id,
                    type: 'Person',
                  })
                }}
              >
                {author.name}
              </InlineButton>
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

  return (
    <div className="text-sm text-gray-700">
      {from != null && fromIso != null ? (
        <time dateTime={fromIso}>{from}</time>
      ) : null}
      <span> &ndash; </span>
      {to != null && toIso != null ? <time dateTime={toIso}>{to}</time> : null}
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

      <dl className="space-y-1 text-sm text-gray-700">
        {hasPassageTopics ? (
          <div>
            <dt className="sr-only">{t.topics[1]}</dt>
            <dd className="leading-7">
              {entity.topic.map((topic) => {
                return (
                  <Badge
                    key={topic.id}
                    className="text-gray-100 transition bg-gray-800 hover:bg-black hover:gray-200"
                  >
                    <InlineButton
                      className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                      onPress={() =>
                        setFilter({
                          topics: [topic.id],
                        })
                      }
                    >
                      {topic.label}
                    </InlineButton>
                  </Badge>
                )
              })}
            </dd>
          </div>
        ) : null}
        {hasPassageTypes ? (
          <div>
            <dt className="sr-only">{t.types[1]}</dt>
            <dd className="leading-7">
              {entity.kind.map((kind) => {
                return (
                  <Badge
                    key={kind.id}
                    className="text-gray-100 transition bg-gray-800 hover:bg-black hover:gray-200"
                  >
                    <InlineButton
                      className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                      onPress={() =>
                        setFilter({
                          types: [kind.id],
                        })
                      }
                    >
                      {kind.label}
                    </InlineButton>
                  </Badge>
                )
              })}
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
      <dl className="space-y-1 text-sm text-gray-700">
        {Object.entries(relations).map(([type, relations]) => {
          if (relations.length === 0) return null

          return (
            <div key={type}>
              <dt className="sr-only">
                {t.entityType[type as SolaEntityType][1]}
              </dt>
              <dd className="leading-7">
                {relations.map((relation) => {
                  return (
                    <Badge
                      key={relation.id}
                      className={cx(
                        'transition',
                        colors.bg[type as SolaEntityType],
                      )}
                    >
                      <InlineButton
                        className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
                        onPress={() => {
                          setSelectedSolaEntity({
                            id: relation.related_entity.id,
                            type: relation.related_entity.type,
                          })
                        }}
                      >
                        {relation.related_entity.label}
                      </InlineButton>
                    </Badge>
                  )
                })}
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
      <ul className="space-y-1 text-sm text-gray-700">
        {Object.entries(passages.data).map(([reference, url]) => {
          return (
            <li key={reference}>
              <Badge className="bg-pink-300">
                <a href={url}>{reference}</a>
              </Badge>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function EditedBy({ editor }: { editor?: SolaEntityDetails['assigned_user'] }) {
  const t = useLabels() as typeof labels[SiteLocale]

  if (editor == null) return null

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
        {t.editedBy}
      </h3>
      <div className="text-sm text-gray-700">{editor.label}</div>
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

  const tabs = texts.map((text) => ({
    id: text.kind.id,
    title: text.kind.label,
    children: (
      <div
        className="leading-6 whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: text.text }}
      />
    ),
  }))
  if (bibliography !== undefined && bibliography.length > 0) {
    tabs.push({
      id: 0,
      title: t.bibliography,
      children: (
        <ul>
          {bibliography.map((reference) => {
            return (
              <li key={reference.pk} className="leading-6">
                <BibliographicReference reference={reference} />
              </li>
            )
          })}
        </ul>
      ),
    })
  }

  return (
    <div className="grid grid-cols-2 gap-6 p-6 text-sm bg-white rounded shadow">
      {hasPrimaryText ? (
        <div className="space-y-4">
          <div className="flex border-b border-gray-200">
            <div className="py-2 font-semibold">{primary?.kind.label}</div>
          </div>
          <div
            className="leading-6 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: primary?.text ?? '' }}
          />
        </div>
      ) : null}
      {hasAdditionalTexts ? (
        <Tabs aria-label={t.additionalTexts} items={tabs}>
          {(item) => <TabItem title={item.title}>{item.children}</TabItem>}
        </Tabs>
      ) : null}
    </div>
  )
}

function BibliographicReference({
  reference,
}: {
  reference: SolaBibsonomyReference
}) {
  return (
    <div>
      {reference.author}: {reference.title}. {reference.address}:{' '}
      {reference.publisher} {reference.year}.
    </div>
  )
}
