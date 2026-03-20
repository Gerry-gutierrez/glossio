// Mock for @supabase/supabase-js (used via vitest alias)
import { vi } from 'vitest'

// Chainable mock that tracks calls
export function createMockChain() {
  const results: Record<string, any> = {}

  const chain: any = {}
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'in', 'is', 'gte', 'lte', 'order', 'limit', 'single', 'rpc', 'upsert', 'not', 'like', 'ilike', 'textSearch']

  for (const method of methods) {
    chain[method] = vi.fn((..._args: any[]) => {
      if (method === 'single') {
        return Promise.resolve(results._next || { data: null, error: null })
      }
      return chain
    })
  }

  // Make chain thenable for queries without .single()
  chain.then = (resolve: any) => {
    const result = results._next || { data: [], error: null }
    resolve(result)
  }

  return { chain, setResult: (r: any) => { results._next = r } }
}

// Per-table mock chains
const tables: Record<string, ReturnType<typeof createMockChain>> = {}
const rpcResults: Record<string, any> = {}

export function mockTable(name: string) {
  const mock = createMockChain()
  tables[name] = mock
  return mock
}

export function mockRpc(name: string, result: any) {
  rpcResults[name] = result
}

export function resetMocks() {
  Object.keys(tables).forEach(k => delete tables[k])
  Object.keys(rpcResults).forEach(k => delete rpcResults[k])
}

// Auth admin mock
export const authAdminMock = {
  updateUserById: vi.fn().mockResolvedValue({ error: null }),
}

export const createClient = vi.fn(() => ({
  from: vi.fn((table: string) => {
    if (tables[table]) return tables[table].chain
    return createMockChain().chain
  }),
  rpc: vi.fn((name: string, _params: any) => {
    return Promise.resolve(rpcResults[name] || { data: null, error: null })
  }),
  auth: {
    admin: authAdminMock,
  },
}))
