import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'https://deno.land/std@0.177.0/http/server.ts': path.resolve(__dirname, '__tests__/mocks/deno-serve.ts'),
      'https://esm.sh/@supabase/supabase-js@2': path.resolve(__dirname, '__tests__/mocks/supabase.ts'),
      'https://esm.sh/stripe@14?target=deno': path.resolve(__dirname, '__tests__/mocks/stripe.ts'),
    },
  },
})
