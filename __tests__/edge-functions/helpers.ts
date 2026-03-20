// Shared test helpers for Supabase Edge Function tests
import { getCapturedHandler, resetHandler } from '../mocks/deno-serve'
import { resetMocks } from '../mocks/supabase'
import { resetEnv, setStandardEnv, setupDenoGlobal } from '../mocks/deno-globals'

export function setupEdgeTest() {
  resetHandler()
  resetMocks()
  resetEnv()
  setupDenoGlobal()
  setStandardEnv()
}

export function getHandler() {
  const handler = getCapturedHandler()
  if (!handler) throw new Error('No handler captured — did the edge function import correctly?')
  return handler
}

export function makeRequest(body: Record<string, unknown>, method = 'POST') {
  return new Request('http://localhost/test', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method !== 'GET' ? JSON.stringify(body) : undefined,
  })
}

export function makeGetRequest(params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString()
  return new Request(`http://localhost/test${qs ? '?' + qs : ''}`, {
    method: 'GET',
  })
}

export function optionsRequest() {
  return new Request('http://localhost/test', { method: 'OPTIONS' })
}
