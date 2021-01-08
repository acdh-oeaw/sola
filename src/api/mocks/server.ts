import { rest } from 'msw'
import { setupServer } from 'msw/node'

import { handlers } from '@/api/mocks/handlers'

/**
 * Mock server.
 */
const server = setupServer(...handlers)

export { rest, server }
