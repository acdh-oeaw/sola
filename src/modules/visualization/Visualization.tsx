import { useCallback, useMemo } from 'react'
import type { QueryObserverResult } from 'react-query'

import type {
  SolaEntity,
  SolaEntityDetails,
  SolaEntityRelation,
  SolaEntityType,
  SolaEvent,
  SolaInstitution,
  SolaPassage,
  SolaPerson,
  SolaPlace,
  SolaPublication,
} from '@/api/sola/client'
import { useCurrentLocale } from '@/lib/i18n/useCurrentLocale'
import type { SolaSelectedEntity } from '@/lib/sola/types'
import type { Node } from '@/modules/visualization/createNode'
import { createNode } from '@/modules/visualization/createNode'
import { Timelines } from '@/modules/visualization/Timelines'
import { colors } from '~/config/sola.json'

const labels = {
  en: {
    passages: 'Passages',
    other: 'Other',
  },
  de: {
    passages: 'Passagen',
    other: 'Andere',
  },
}

export interface VisualizationProps {
  solaEntities: {
    events: QueryObserverResult<Record<number, SolaEvent>, unknown>
    institutions: QueryObserverResult<Record<number, SolaInstitution>, unknown>
    passages: QueryObserverResult<Record<number, SolaPassage>, unknown>
    persons: QueryObserverResult<Record<number, SolaPerson>, unknown>
    places: QueryObserverResult<Record<number, SolaPlace>, unknown>
    publications: QueryObserverResult<Record<number, SolaPublication>, unknown>
  }
  filteredSolaPassages: QueryObserverResult<
    Record<number, SolaPassage>,
    unknown
  >
  selectedSolaEntity: QueryObserverResult<SolaEntityDetails, unknown>
  setSelectedSolaEntity: (entity: SolaSelectedEntity | null) => void
  selectedSolaEntityRelations: Record<SolaEntityType, Array<SolaEntityRelation>>
}

export function Visualization({
  solaEntities,
  filteredSolaPassages,
  selectedSolaEntity,
  setSelectedSolaEntity,
  selectedSolaEntityRelations,
}: VisualizationProps): JSX.Element {
  const locale = useCurrentLocale()

  const events = useNodes(solaEntities.events.data)
  const institutions = useNodes(solaEntities.institutions.data)
  const passages = useNodes(solaEntities.passages.data)
  const persons = useNodes(solaEntities.persons.data)
  const places = useNodes(solaEntities.places.data)
  const publications = useNodes(solaEntities.publications.data)

  const timelines = useMemo(() => {
    return [
      {
        label: labels[locale].passages,
        type: 'Passage',
        data: passages,
      },
      {
        label: labels[locale].other,
        type: 'Other',
        data: [
          ...events,
          ...institutions,
          ...persons,
          ...places,
          ...publications,
        ],
      },
    ]
  }, [events, institutions, passages, persons, places, publications, locale])

  const getTimelineForNodeType = useCallback(
    function getTimelineForNodeType(type: string) {
      if (type === 'Passage') {
        return labels[locale].passages
      }
      return labels[locale].other
    },
    [locale],
  )

  const onNodeClick = useCallback(
    function onNodeClick(node: Node) {
      setSelectedSolaEntity({ id: node.id, type: node.type as SolaEntityType })
    },
    [setSelectedSolaEntity],
  )

  const isNodeSelected = useCallback(
    function isNodeSelected(node: Node) {
      if (selectedSolaEntity.data === undefined) return false
      if (
        node.id === selectedSolaEntity.data.id &&
        node.type === selectedSolaEntity.data.type
      ) {
        return true
      }
      return false
    },
    [selectedSolaEntity.data],
  )

  const selectedSolaEntityRelationsSet = useMemo(() => {
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    /* @ts-expect-error */
    const map: Record<SolaEntityType, Set<number>> = {}
    Object.entries(selectedSolaEntityRelations).forEach(([type, relations]) => {
      map[type as SolaEntityType] = new Set(
        relations.map((relation) => relation.related_entity.id),
      )
    })
    return map
  }, [selectedSolaEntityRelations])

  const isNodeHighlighted = useCallback(
    function isNodeHighlighted(node: Node) {
      switch (node.type as SolaEntityType) {
        case 'Event': {
          if (selectedSolaEntityRelationsSet.Event.has(node.id)) {
            return true
          }
          return false
        }
        case 'Institution': {
          if (selectedSolaEntityRelationsSet.Institution.has(node.id)) {
            return true
          }
          return false
        }
        case 'Passage': {
          if (filteredSolaPassages.data === undefined) return false
          if (filteredSolaPassages.data[node.id] !== undefined) {
            return true
          }
          return false
        }
        case 'Person': {
          if (selectedSolaEntityRelationsSet.Person.has(node.id)) {
            return true
          }
          return false
        }
        case 'Place': {
          if (selectedSolaEntityRelationsSet.Place.has(node.id)) {
            return true
          }
          return false
        }
        case 'Publication': {
          if (selectedSolaEntityRelationsSet.Publication.has(node.id)) {
            return true
          }
          return false
        }
        default:
          return false
      }
    },
    [filteredSolaPassages, selectedSolaEntityRelationsSet],
  )

  return (
    <Timelines
      timelines={timelines}
      getTimelineForNodeType={getTimelineForNodeType}
      isNodeSelected={isNodeSelected}
      isNodeHighlighted={isNodeHighlighted}
      onNodeClick={onNodeClick}
    />
  )
}

function useNodes<T extends SolaEntity>(map?: Record<number, T>) {
  return useMemo(
    () =>
      Object.values(map ?? {})
        .filter(hasPrimaryDate)
        .map((entity) => createNode(entity, colors.text[entity.type])),
    [map],
  )
}

function hasPrimaryDate(entity: SolaEntity) {
  const hasDate = entity.primary_date != null && entity.primary_date.length > 0
  if (!hasDate && entity.type !== 'Place') {
    console.log('Entity without primary date', entity)
  }
  return hasDate
}
