// Sets up global Deno mock for vitest
const envStore: Record<string, string> = {}

export function setEnv(key: string, value: string) {
  envStore[key] = value
}

export function resetEnv() {
  Object.keys(envStore).forEach(k => delete envStore[k])
}

export function setupDenoGlobal() {
  ;(globalThis as any).Deno = {
    env: {
      get: (key: string) => envStore[key] || undefined,
    },
  }
}

export function teardownDenoGlobal() {
  delete (globalThis as any).Deno
}

// Set standard test env vars
export function setStandardEnv() {
  setEnv('SUPABASE_URL', 'https://test.supabase.co')
  setEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
  setEnv('TWILIO_ACCOUNT_SID', 'ACtest123')
  setEnv('TWILIO_AUTH_TOKEN', 'test-auth-token')
  setEnv('TWILIO_PHONE_NUMBER', '+15551234567')
  setEnv('STRIPE_SECRET_KEY', 'sk_test_123')
  setEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test')
  setEnv('SITE_URL', 'https://glossio.org')
}
