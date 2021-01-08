import { rest, setupWorker } from 'msw'

import { handlers } from '@/api/mocks/handlers'

/**
 * Mock service worker.
 */
const worker = setupWorker(...handlers)

export { rest, worker }
