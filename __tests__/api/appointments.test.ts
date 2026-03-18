import { describe, it, expect, vi, beforeEach } from 'vitest'

// Track all .single() calls in order
let singleCallIndex = 0
const singleResults: Array<{ data: unknown; error: unknown }> = []

const chainable = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  single: vi.fn(() => {
    const result = singleResults[singleCallIndex] || { data: null, error: null }
    singleCallIndex++
    return Promise.resolve(result)
  }),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => chainable,
  }),
}))

vi.mock('@/lib/logger', () => ({
  logInfo: vi.fn(),
  logError: vi.fn(),
}))

const { POST } = await import('@/app/api/appointments/route')

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost:3000/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const VALID_BODY = {
  slug: 'carlos-detail-co',
  serviceId: 'svc-123',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+12395550100',
  email: 'john@example.com',
  vehicleYear: '2023',
  vehicleMake: 'Tesla',
  vehicleModel: 'Model 3',
  vehicleColor: 'White',
  scheduledDate: '2026-03-25',
  scheduledTime: '10:00 AM',
  howHeard: 'Instagram',
  notes: '',
  price: '159.99',
}

function setSingleResults(...results: Array<{ data: unknown; error: unknown }>) {
  singleCallIndex = 0
  singleResults.length = 0
  singleResults.push(...results)
}

describe('POST /api/appointments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    singleCallIndex = 0
    singleResults.length = 0
  })

  it('returns 400 when required fields are missing', async () => {
    const res = await POST(makeRequest({ slug: 'test' }))
    const data = await res.json()
    expect(res.status).toBe(400)
    expect(data.error).toContain('Missing required fields')
  })

  it('returns 400 when slug is empty', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, slug: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when phone is empty', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, phone: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 404 when profile not found', async () => {
    setSingleResults(
      { data: null, error: { message: 'not found' } }, // profile lookup
    )

    const res = await POST(makeRequest(VALID_BODY))
    const data = await res.json()
    expect(res.status).toBe(404)
    expect(data.error).toBe('Detailer profile not found')
  })

  it('creates appointment with new client', async () => {
    setSingleResults(
      { data: { id: 'profile-1' }, error: null },    // profile found
      { data: null, error: null },                     // no existing client
      { data: { id: 'client-1' }, error: null },       // new client created
      { data: null, error: null },                     // no duplicate appt
      { data: { id: 'appt-1' }, error: null },         // appointment created
    )

    const res = await POST(makeRequest(VALID_BODY))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.appointmentId).toBe('appt-1')
    expect(data.clientId).toBe('client-1')
  })

  it('returns 409 for duplicate booking', async () => {
    setSingleResults(
      { data: { id: 'profile-1' }, error: null },     // profile found
      { data: { id: 'client-1' }, error: null },       // existing client found
      { data: { id: 'existing-appt' }, error: null },  // duplicate appointment
    )

    const res = await POST(makeRequest(VALID_BODY))
    const data = await res.json()
    expect(res.status).toBe(409)
    expect(data.error).toContain('already have a booking')
  })
})
