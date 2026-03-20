// Mock for twilio (used via vitest alias)
// Netlify functions do: const twilio = require("twilio"); const client = twilio(sid, token);
import { vi } from 'vitest'

export const messagesCreateMock = vi.fn().mockResolvedValue({ sid: 'SM123' })

function twilioMock(_sid?: string, _token?: string) {
  return {
    messages: {
      create: messagesCreateMock,
    },
  }
}

export default twilioMock
