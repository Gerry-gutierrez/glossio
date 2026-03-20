// Mock for https://deno.land/std@0.177.0/http/server.ts
// Captures the handler so tests can invoke it directly

let _capturedHandler: ((req: Request) => Promise<Response>) | null = null

export function serve(handler: (req: Request) => Promise<Response>) {
  _capturedHandler = handler
}

export function getCapturedHandler() {
  return _capturedHandler
}

export function resetHandler() {
  _capturedHandler = null
}
