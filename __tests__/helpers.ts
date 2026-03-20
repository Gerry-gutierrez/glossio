// Shared test helpers for Netlify Functions tests

/** Build a Netlify event object for POST requests */
export function makeEvent(body: Record<string, unknown>, method = 'POST'): any {
  return {
    httpMethod: method,
    body: method !== 'GET' ? JSON.stringify(body) : null,
    headers: { 'content-type': 'application/json' },
    queryStringParameters: {},
  }
}

/** Build a Netlify event object for GET requests with query params */
export function makeGetEvent(params: Record<string, string> = {}): any {
  return {
    httpMethod: 'GET',
    body: null,
    headers: {},
    queryStringParameters: params,
  }
}

/** Parse the JSON body from a Netlify function response */
export function parseBody(result: { statusCode: number; body: string }) {
  return JSON.parse(result.body)
}
