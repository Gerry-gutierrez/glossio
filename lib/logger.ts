// Simple structured logger for API routes
// Outputs JSON to stdout for Railway log aggregation

type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  route: string
  action: string
  userId?: string
  [key: string]: unknown
}

function log(entry: LogEntry) {
  const timestamp = new Date().toISOString()
  console.log(JSON.stringify({ timestamp, ...entry }))
}

export function logInfo(route: string, action: string, data?: Record<string, unknown>) {
  log({ level: 'info', route, action, ...data })
}

export function logWarn(route: string, action: string, data?: Record<string, unknown>) {
  log({ level: 'warn', route, action, ...data })
}

export function logError(route: string, action: string, error: unknown, data?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined
  log({ level: 'error', route, action, error: message, stack, ...data })
}
