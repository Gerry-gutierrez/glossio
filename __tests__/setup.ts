// Global test setup — runs before each test file

// Set standard env vars for all tests
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.TWILIO_ACCOUNT_SID = 'ACtest123'
process.env.TWILIO_AUTH_TOKEN = 'test-auth-token'
process.env.TWILIO_PHONE_NUMBER = '+15551234567'
process.env.STRIPE_SECRET_KEY = 'sk_test_123'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
process.env.URL = 'https://glossio.org'
