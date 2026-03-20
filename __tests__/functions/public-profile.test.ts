import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeGetEvent, parseBody } from '../helpers'
import { resetMocks, mockTable } from '../mocks/supabase'

vi.mock('@supabase/supabase-js')

const { handler } = await import('../../netlify/functions/public-profile.mjs') as any

describe('public-profile', () => {
  beforeEach(() => resetMocks())

  it('returns 405 for non-GET', async () => {
    const res = await handler({ httpMethod: 'POST', body: '{}', headers: {} })
    expect(res.statusCode).toBe(405)
  })

  it('returns 400 when slug is missing', async () => {
    const res = await handler(makeGetEvent())
    expect(res.statusCode).toBe(400)
    expect(parseBody(res).error).toBe('Slug required')
  })

  it('returns 404 when profile not found', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: null, error: { message: 'not found' } })

    const res = await handler(makeGetEvent({ slug: 'nonexistent' }))
    expect(res.statusCode).toBe(404)
    expect(parseBody(res).error).toBe('Profile not found')
  })

  it('returns profile with services, photos, and hours', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: { id: 'p-1', company_name: 'Test Co', slug: 'test-co' }, error: null })

    const services = mockTable('services')
    services.setResult({ data: [{ id: 's-1', name: 'Wash' }], error: null })

    const photos = mockTable('work_photos')
    photos.setResult({ data: [{ id: 'ph-1', url: 'https://img.test/1.jpg' }], error: null })

    const hours = mockTable('business_hours')
    hours.setResult({ data: [{ day_of_week: 1, is_open: true }], error: null })

    const res = await handler(makeGetEvent({ slug: 'test-co' }))
    const data = parseBody(res)

    expect(data.profile.slug).toBe('test-co')
    expect(data.services).toHaveLength(1)
    expect(data.photos).toHaveLength(1)
    expect(data.hours).toHaveLength(1)
  })
})
