import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeEvent, parseBody } from '../helpers'
import { resetMocks, authAdminMock } from '../mocks/supabase'

vi.mock('@supabase/supabase-js')

const { handler } = await import('../../netlify/functions/confirm-email.mjs') as any

describe('confirm-email', () => {
  beforeEach(() => {
    resetMocks()
    authAdminMock.updateUserById.mockReset()
    authAdminMock.updateUserById.mockResolvedValue({ error: null })
  })

  it('returns 405 for non-POST', async () => {
    const res = await handler({ httpMethod: 'GET', body: null, headers: {} })
    expect(res.statusCode).toBe(405)
  })

  it('returns 400 when userId is missing', async () => {
    const res = await handler(makeEvent({}))
    expect(res.statusCode).toBe(400)
    expect(parseBody(res).error).toBe('userId required')
  })

  it('confirms email successfully', async () => {
    const res = await handler(makeEvent({ userId: 'user-123' }))
    const data = parseBody(res)

    expect(data.success).toBe(true)
    expect(authAdminMock.updateUserById).toHaveBeenCalledWith('user-123', { email_confirm: true })
  })

  it('returns 400 when admin update fails', async () => {
    authAdminMock.updateUserById.mockResolvedValueOnce({ error: { message: 'User not found' } })

    const res = await handler(makeEvent({ userId: 'bad-id' }))
    expect(res.statusCode).toBe(400)
    expect(parseBody(res).error).toBe('User not found')
  })
})
