// Adapters so each endpoint is written once and served by both Vite (Node req/res)
// and Netlify Functions (web Request/Response).

/** @param {(params: URLSearchParams) => Promise<{status: number, body: object}>} handler */
export function toConnect(handler) {
  return async (req, res) => {
    const { status, body } = await handler(new URL(req.url, 'http://localhost').searchParams);
    res.statusCode = status;
    res.setHeader('content-type', 'application/json');
    // the client caches in localStorage; a browser HTTP cache on top would hide fixes
    res.setHeader('cache-control', 'no-store');
    res.end(JSON.stringify(body));
  };
}

/** @param {{ cdnSeconds?: number }} options how long Netlify's CDN may keep a 200 */
export function toNetlify(handler, { cdnSeconds = 0 } = {}) {
  return async (request) => {
    const { status, body } = await handler(new URL(request.url).searchParams);
    const headers = { 'cache-control': 'no-store' };
    // Netlify's CDN (not the browser) shares good answers between visitors, saving
    // upstream calls; durable keeps them across edge nodes.
    if (status === 200 && cdnSeconds) headers['netlify-cdn-cache-control'] = `public, durable, s-maxage=${cdnSeconds}`;
    return Response.json(body, { status, headers });
  };
}
