import '@testing-library/jest-dom'

import { server } from '@/api/mocks/server'
import { queryClient } from '@/modules/providers/Providers'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
beforeEach(() => queryClient.getQueryCache().clear())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
