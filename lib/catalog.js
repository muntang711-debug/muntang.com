import koSnapshot from '../data/youtube-ko.json' with { type: 'json' };
import enSnapshot from '../data/youtube-en.json' with { type: 'json' };
import { collectCatalog, fetchPage } from './youtube.js';
const FRESH_MS = 300_000;
const RETAIN_SECONDS = 604800;

export function parseCatalogRequest(url) {
  const continuation = url.searchParams.get('continuation') || '';
  const language = url.searchParams.get('hl') === 'en' ? 'en' : 'ko';
  const type = url.searchParams.get('type') || 'videos';
  if (!['videos', 'shorts'].includes(type)) return { error: 'Invalid video type' };
  if (continuation.length > 4096 || (continuation && !/^[A-Za-z0-9._~!()*+,;=:@%\/-]+$/.test(continuation))) return { error: 'Invalid continuation token' };
  return { language, type, continuation };
}
export function catalogCacheKey({ language, type, continuation }) {
  const url = new URL('https://muntang.com/__catalog/v3/' + language + '/' + (continuation ? type : 'initial'));
  if (continuation) url.searchParams.set('continuation', continuation);
  return new Request(url);
}
function snapshot(language) {
  const source = language === 'en' ? enSnapshot : koSnapshot;
  return { ...source, language, status: 'stale', warnings: ['saved_snapshot'], nextContinuations: { videos: '', shorts: '' }, complete: { videos: false, shorts: false } };
}
function unavailable() { return { ok: false, status: 'unavailable', videos: [], warnings: ['source_unavailable'] }; }
export async function getCatalog(params, ctx, options = {}) {
  const cache = options.cache || globalThis.caches?.default;
  const collector = options.collector || collectCatalog;
  const pageFetcher = options.pageFetcher || fetchPage;
  const cacheRequest = catalogCacheKey(params);
  const cachedResponse = cache ? await cache.match(cacheRequest) : null;
  const cached = cachedResponse ? await cachedResponse.json() : null;
  if (cached && Date.now() - cached.savedAt < FRESH_MS) return cached.data;
  const previous = cached?.data || (!params.continuation ? snapshot(params.language) : null);
  const refresh = async () => {
    try {
      let data;
      if (params.continuation) {
        const page = await pageFetcher(params.type, params.language, params.continuation);
        if (!page.ok) return unavailable();
        data = { ok: true, status: 'fresh', language: params.language, videos: page.videos, nextContinuation: page.nextContinuation, nextContinuations: { [params.type]: page.nextContinuation }, complete: { [params.type]: !page.nextContinuation }, updatedAt: new Date().toISOString() };
      } else data = await collector(params.language, previous);
      if (cache && data.ok) await cache.put(cacheRequest, Response.json({ savedAt: Date.now(), data }, { headers: { 'Cache-Control': 'public, max-age=' + RETAIN_SECONDS } }));
      return data;
    } catch (error) {
      console.warn(JSON.stringify({ event: 'catalog_refresh_failed', language: params.language, type: params.type, reason: error?.message || 'unavailable' }));
      return previous ? { ...previous, status: 'stale', warnings: [...new Set([...(previous.warnings || []), 'refresh_failed'])] } : unavailable();
    }
  };
  if (previous && ctx?.waitUntil) {
    ctx.waitUntil(refresh());
    return { ...previous, status: 'stale', warnings: [...new Set([...(previous.warnings || []), 'refreshing'])] };
  }
  return refresh();
}
