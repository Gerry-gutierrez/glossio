import { describe, it, expect, beforeEach } from 'vitest'
import { setupEdgeTest, getHandler, makeRequest, optionsRequest } from './helpers'
import { authAdminMock } from '../mocks/supabase'

beforeEach(() => {
  setupEdgeTest()
  authAdminMock.updateUserById.mockReset()
})

await import('../../supabase/functions/confirm-email/index.ts')

describe('confirm-email', () => {
  it('returns ok for OPTIONS', async () => {
    const handler = getHandler()
    const res = await handler(optionsRequest())
    expect(res.status).toBe(200)
  })

  it('returns 400 when userId is missing', async () => {
    const handler = getHandler()
    const res = await handler(makeRequest({}))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe('userId required')
  })

  it('confirms email successfully', async () => {
    authAdminMock.updateUserById.mockResolvedValueOnce({ error: null })

    const handler = getHandler()
    const res = await handler(makeRequest({ userId: 'user-123' }))
    const data = await res.json()

    expect(data.success).toBe(true)
    expect(authAdminMock.updateUserById).toHaveBeenCalledWith('user-123', { email_confirm: true })
  })

  it('returns 400 when admin update fails', async () => {
    authAdminMock.updateUserById.mockResolvedValueOnce({ error: { message: 'User not found' } })

    const handler = getHandler()
    const res = await handler(makeRequest({ userId: 'bad-id' }))
    const data = await res.json()

    expect(res.status).toBe(400)
    expect(data.error).toBe('User not found')
  })
})
