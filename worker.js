import { getCatalog, parseCatalogRequest } from './lib/catalog.js';

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' https://i.ytimg.com data:; font-src 'self' https://cdn.jsdelivr.net data:; frame-src https://www.youtube-nocookie.com; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'",
};

function withHeaders(response, request, extra = {}) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries({ ...securityHeaders, ...extra })) headers.set(name, value);
  if (new URL(request.url).protocol === 'https:') headers.set('Strict-Transport-Security', 'max-age=31536000');
  return new Response(request.method === 'HEAD' ? null : response.body, { status: response.status, headers });
}

export function canonicalLocation(url) {
  if (url.hostname === 'www.muntang.com' || (url.hostname === 'muntang.com' && url.protocol !== 'https:')) return 'https://muntang.com' + url.pathname + url.search;
  if (url.pathname === '/index.html') return url.origin + '/' + url.search;
  if (url.pathname === '/en' || url.pathname === '/en/index.html') return url.origin + '/en/' + url.search;
  return null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const location = canonicalLocation(url);
    if (location) return withHeaders(new Response(null, { status: 308, headers: { Location: location } }), request);
    if (!['GET', 'HEAD'].includes(request.method)) return withHeaders(new Response('Method Not Allowed', { status: 405 }), request, { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' });
    try {
      if (url.pathname === '/api/youtube') {
        const params = parseCatalogRequest(url);
        if (params.error) return withHeaders(Response.json({ ok: false, error: params.error }, { status: 400 }), request, { 'Cache-Control': 'no-store' });
        const data = request.method === 'HEAD' ? null : await getCatalog(params, ctx);
        const code = data?.ok === false ? 503 : 200;
        return withHeaders(Response.json(data, { status: code }), request, { 'Cache-Control': 'no-store', ...(code === 503 ? { 'Retry-After': '30' } : {}) });
      }
      if (url.pathname === '/robots.txt') return withHeaders(new Response('User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://muntang.com/sitemap.xml\n'), request, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
      if (url.pathname === '/sitemap.xml') {
        const xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' + ['/', '/en/'].map(path => '<url><loc>https://muntang.com' + path + '</loc><xhtml:link rel="alternate" hreflang="ko" href="https://muntang.com/"/><xhtml:link rel="alternate" hreflang="en" href="https://muntang.com/en/"/></url>').join('') + '</urlset>';
        return withHeaders(new Response(xml), request, { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
      }
      if (!env?.ASSETS) return withHeaders(new Response('Not Found', { status: 404 }), request);
      let response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        const page = await env.ASSETS.fetch(new Request(new URL('/404', url), request));
        response = new Response(page.body, { status: 404, headers: page.headers });
      }
      const immutable = /^\/assets\/[a-z0-9.-]+\.[a-f0-9]{12}\.(?:js|css)$/.test(url.pathname);
      return withHeaders(response, request, {
        'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
        ...((url.pathname === '/' || url.pathname === '/en/') ? { 'Content-Language': url.pathname === '/en/' ? 'en' : 'ko' } : {}),
        ...(url.hostname.endsWith('.workers.dev') ? { 'X-Robots-Tag': 'noindex' } : {}),
      });
    } catch (error) {
      console.error(JSON.stringify({ event: 'request_failed', path: url.pathname, error: error?.name || 'Error' }));
      return withHeaders(new Response('Temporarily unavailable. Please try again.', { status: 503 }), request, { 'Cache-Control': 'no-store', 'Retry-After': '30' });
    }
  },
};
