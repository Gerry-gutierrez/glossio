import { describe, it, expect, beforeEach } from 'vitest'
import { setupEdgeTest, getHandler, makeGetRequest, optionsRequest } from './helpers'
import { mockTable } from '../mocks/supabase'

beforeEach(() => setupEdgeTest())

await import('../../supabase/functions/public-profile/index.ts')

describe('public-profile', () => {
  it('returns ok for OPTIONS', async () => {
    const handler = getHandler()
    const res = await handler(optionsRequest())
    expect(res.status).toBe(200)
  })

  it('returns 400 when slug is missing', async () => {
    const handler = getHandler()
    const res = await handler(makeGetRequest())
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toBe('Slug required')
  })

  it('returns 404 when profile not found', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({ data: null, error: { message: 'not found' } })

    const handler = getHandler()
    const res = await handler(makeGetRequest({ slug: 'nonexistent' }))
    const data = await res.json()

    expect(res.status).toBe(404)
    expect(data.error).toBe('Profile not found')
  })

  it('returns profile with services, photos, and hours', async () => {
    const profiles = mockTable('profiles')
    profiles.setResult({
      data: { id: 'p-1', company_name: 'Test Co', slug: 'test-co' },
      error: null,
    })

    const services = mockTable('services')
    services.setResult({ data: [{ id: 's-1', name: 'Wash' }], error: null })

    const photos = mockTable('work_photos')
    photos.setResult({ data: [{ id: 'ph-1', url: 'https://img.test/1.jpg' }], error: null })

    const hours = mockTable('business_hours')
    hours.setResult({ data: [{ day_of_week: 1, is_open: true }], error: null })

    const handler = getHandler()
    const res = await handler(makeGetRequest({ slug: 'test-co' }))
    const data = await res.json()

    expect(data.profile.slug).toBe('test-co')
    expect(data.services).toHaveLength(1)
    expect(data.photos).toHaveLength(1)
    expect(data.hours).toHaveLength(1)
  })
})
