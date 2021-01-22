import { rest } from 'msw'

import events from '@/api/mocks/sola/events.json'
import institutions from '@/api/mocks/sola/institutions.json'
import passageTopics from '@/api/mocks/sola/passage-topics.json'
import passageTypes from '@/api/mocks/sola/passage-types.json'
import passages from '@/api/mocks/sola/passages.json'
import persons from '@/api/mocks/sola/persons.json'
import places from '@/api/mocks/sola/places.json'
import publications from '@/api/mocks/sola/publications.json'
import { api as baseUrl } from '~/config/site.json'

function createSolaEndpoint(path: string) {
  return String(new URL(path, baseUrl))
}

/**
 * Mock request handlers.
 */
export const handlers = [
  rest.get(
    createSolaEndpoint('/apis/api/entities/event/'),
    async (_request, response, context) => {
      return response(context.status(200), context.json(events))
    },
  ),
  rest.get(
    createSolaEndpoint('/apis/api/entities/institution/'),
    async (_request, response, context) => {
      return response(context.status(200), context.json(institutions))
    },
  ),
  rest.get(
    createSolaEndpoint('/apis/api/entities/passage/'),
    async (_request, response, context) => {
      return response(context.status(200), context.json(passages))
    },
  ),
  rest.get(
    createSolaEndpoint('/apis/api/entities/person/'),
    async (_request, response, context) => {
      return response(context.status(200), context.json(persons))
    },
  ),
  rest.get(
    createSolaEndpoint('/apis/api/entities/place/'),
    async (_request, response, context) => {
      return response(context.status(200), context.json(places))
    },
  ),
  rest.get(
    createSolaEndpoint('/apis/api/entities/publication/'),
    async (_request, response, context) => {
      return response(context.status(200), context.json(publications))
    },
  ),

  rest.get(
    createSolaEndpoint('/apis/api/vocabularies/passagetopics/'),
    async (_request, response, context) => {
      return response(context.status(200), context.json(passageTopics))
    },
  ),
  rest.get(
    createSolaEndpoint('/apis/api/vocabularies/passagetype/'),
    async (_request, response, context) => {
      return response(context.status(200), context.json(passageTypes))
    },
  ),
]
