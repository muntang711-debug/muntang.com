import { collectCatalog, fetchPage } from './youtube.js';
import { SYNC_INTERVAL } from './sync-config.js';
export const CATALOG_INTERVAL = SYNC_INTERVAL;
export const catalogStorageKey = language => 'youtube:catalog:v1:' + language;
export function parseCatalogRequest(url) {
  const continuation = url.searchParams.get('continuation') || '';
  const language = url.searchParams.get('hl') === 'en' ? 'en' : 'ko';
  const type = url.searchParams.get('type') || 'videos';
  if (!['videos', 'shorts'].includes(type)) return { error: 'Invalid video type' };
  if (continuation.length > 4096 || (continuation && !/^[A-Za-z0-9._~!()*+,;=:@%\/-]+$/.test(continuation))) return { error: 'Invalid continuation token' };
  return { language, type, continuation };
}
export function catalogCacheKey({ language, type, continuation }) {
  const url = new URL('https://muntang.com/__catalog/v5/' + language + '/' + (continuation ? type : 'initial'));
  if (continuation) url.searchParams.set('continuation', continuation);
  return new Request(url);
}

function unavailable() { return { ok: false, status: 'unavailable', videos: [], warnings: ['source_unavailable'] }; }
export async function syncCatalogLanguage(storage, language, { collector = collectCatalog, now = Date.now() } = {}) {
  if (!storage) throw new Error('MissingCatalogStorage');
  const key = catalogStorageKey(language);
  const previous = await storage.get(key, 'json');
  const data = await collector(language, previous?.data);
  if (!data.ok || !data.videos?.length) throw new Error('InvalidCatalog');
  const checkedAt = new Date(now).toISOString();
  const saved = { checkedAt, data: { ...data, updatedAt: checkedAt } };
  await storage.put(key, JSON.stringify(saved));
  console.log(JSON.stringify({ event: 'youtube_catalog_synced', language, count: data.videos.length, checkedAt }));
  return saved;
}
export async function syncCatalog(env, options = {}) {
  const results = await Promise.allSettled(['ko', 'en'].map(language => syncCatalogLanguage(env.MLL_DATA, language, options)));
  const failures = results.filter(result => result.status === 'rejected');
  if (failures.length) throw new AggregateError(failures.map(result => result.reason), 'CatalogSyncFailed');
}
export async function getCatalog(params, ctx, options = {}) {
  const cache = options.cache || globalThis.caches?.default;
  const storage = options.storage;
  try {
    if (!params.continuation) {
      if (!storage) throw new Error('MissingCatalogStorage');
      // Only initialize missing storage on demand. Regular refreshes run on the cron.
      const saved = await storage.get(catalogStorageKey(params.language), 'json') || await syncCatalogLanguage(storage, params.language, options);
      return { ...saved.data, checkedAt: saved.checkedAt, syncIntervalSeconds: SYNC_INTERVAL / 1000,
        status: (options.now ?? Date.now()) - Date.parse(saved.checkedAt) > CATALOG_INTERVAL + 90_000 ? 'stale' : saved.data.status };
    }
    const key = catalogCacheKey(params);
    const cached = cache ? await cache.match(key) : null;
    if (cached) return cached.json();
    const page = await (options.pageFetcher || fetchPage)(params.type, params.language, params.continuation);
    if (!page.ok) return unavailable();
    const data = { ok: true, status: 'fresh', language: params.language, videos: page.videos, nextContinuation: page.nextContinuation,
      nextContinuations: { [params.type]: page.nextContinuation }, complete: { [params.type]: !page.nextContinuation }, updatedAt: new Date().toISOString() };
    if (cache) await cache.put(key, Response.json(data, { headers: { 'Cache-Control': 'public, max-age=' + SYNC_INTERVAL / 1000 } }));
    return data;
  } catch (error) {
    console.warn(JSON.stringify({ event: 'catalog_unavailable', language: params.language, reason: error?.message || 'unavailable' }));
    return unavailable();
  }
}
