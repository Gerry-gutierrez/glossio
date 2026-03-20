// Mock for https://esm.sh/@supabase/supabase-js@2
import { vi } from 'vitest'

// Chainable mock that tracks calls
export function createMockChain() {
  const results: Record<string, any> = {}
  const calls: Array<{ method: string; args: any[] }> = []

  const chain: any = {}
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'in', 'is', 'gte', 'lte', 'order', 'limit', 'single', 'rpc', 'upsert', 'not', 'like', 'ilike', 'textSearch']

  for (const method of methods) {
    chain[method] = vi.fn((...args: any[]) => {
      calls.push({ method, args })
      // If single() is called, return the result promise
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

  return { chain, calls, setResult: (r: any) => { results._next = r } }
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
const authAdminMock = {
  updateUserById: vi.fn().mockResolvedValue({ error: null }),
}

export const createClient = vi.fn(() => ({
  from: vi.fn((table: string) => {
    if (tables[table]) return tables[table].chain
    // Return a default no-op chain
    return createMockChain().chain
  }),
  rpc: vi.fn((name: string, params: any) => {
    return Promise.resolve(rpcResults[name] || { data: null, error: null })
  }),
  auth: {
    admin: authAdminMock,
  },
}))

export { authAdminMock }
