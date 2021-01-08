import { rest } from 'msw'

/**
 * Mock request handlers.
 */
export const handlers = [
  rest.get('/api/search', async (_request, response, context) => {
    return response(
      context.status(200),
      context.json({
        results: [],
      }),
    )
  }),
]
