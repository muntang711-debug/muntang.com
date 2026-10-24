import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import worker, { canonicalLocation } from '../worker.js';
import { getCatalog, parseCatalogRequest, catalogCacheKey } from '../lib/catalog.js';
import { readUpstream, collectCatalog, fetchPage } from '../lib/youtube.js';
import { parseEmbeddedJson, collectYouTubeVideos, findYouTubeContinuation } from '../lib/youtube-parser.js';
import { mergeVideos, filterVideos, pageTypes, formatDate } from '../public/video-state.js';

test('canonical host and protocol preserve path/query while language has its own URL', () => {
  for (const origin of ['http://muntang.com', 'http://www.muntang.com', 'https://www.muntang.com']) assert.equal(canonicalLocation(new URL(origin + '/en/?a=1')), 'https://muntang.com/en/?a=1');
  assert.equal(canonicalLocation(new URL('https://muntang.com/')), null);
  assert.equal(canonicalLocation(new URL('http://localhost:8787/')), null);
  assert.equal(canonicalLocation(new URL('https://muntang.com/en')), 'https://muntang.com/en/');
});
test('tracking queries and explicit Korean use one normalized cache entry', () => {
  const a = parseCatalogRequest(new URL('https://muntang.com/api/youtube'));
  const b = parseCatalogRequest(new URL('https://muntang.com/api/youtube?hl=ko&utm_source=test&type=shorts'));
  assert.equal(catalogCacheKey(a).url, catalogCacheKey(b).url);
  assert.notEqual(catalogCacheKey(a).url, catalogCacheKey({ ...a, language: 'en' }).url);
  assert.ok(parseCatalogRequest(new URL('https://muntang.com/api/youtube?continuation=%3Cbad%3E')).error);
});
const params = { language: 'ko', type: 'videos', continuation: '' };
function memoryCache() { const entries = new Map(); return { entries, match: async request => entries.get(request.url)?.clone(), put: async (request, response) => entries.set(request.url, response.clone()) }; }
test('stale catalog returns immediately and refreshes in waitUntil', async () => {
  const cache = memoryCache(), tasks = [];
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const result = await getCatalog(params, { waitUntil: task => tasks.push(task) }, { cache, collector: () => pending });
  assert.equal(result.status, 'stale'); assert.ok(result.videos.length); assert.equal(cache.entries.size, 0);
  finish({ ok: true, status: 'fresh', language: 'ko', videos: [{ id: 'abcdefghijk', title: '새 영상' }] });
  await Promise.all(tasks);
  assert.equal((await getCatalog(params, null, { cache, collector: () => assert.fail('fresh cache should not refetch') })).status, 'fresh');
});
test('complete upstream failure preserves last known data without caching fake success', async () => {
  const cache = memoryCache();
  const result = await getCatalog(params, null, { cache, collector: async () => { throw new Error('upstream offline'); } });
  assert.equal(result.status, 'stale'); assert.ok(result.videos.every(video => video.title)); assert.equal(cache.entries.size, 0);
  const next = await getCatalog({ ...params, continuation: 'valid-token' }, null, { cache, pageFetcher: async () => ({ ok: false }) });
  assert.equal(next.ok, false); assert.equal(next.status, 'unavailable'); assert.equal(cache.entries.size, 0);
});
test('Shorts continuations use a separate upstream tab and token', async () => {
  const cache = memoryCache(); let args;
  const result = await getCatalog({ ...params, type: 'shorts', continuation: 'short-token' }, null, { cache, pageFetcher: async (...values) => { args = values; return { ok: true, videos: [], nextContinuation: 'short-next' }; } });
  assert.deepEqual(args, ['shorts', 'ko', 'short-token']); assert.equal(result.nextContinuations.shorts, 'short-next'); assert.equal(result.complete.shorts, false);
});
test('upstream timeout aborts a hanging fetch and large responses are rejected', async t => {
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = (_, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));
  await assert.rejects(readUpstream('https://example.com', {}, 15), { name: 'AbortError' });
  globalThis.fetch = async () => new Response('too large');
  await assert.rejects(readUpstream('https://example.com', {}, 1000, 3), /TooLarge/);
});
test('all YouTube sources failing never synthesize a fresh empty catalog', async t => {
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => new Response('', { status: 503 });
  await assert.rejects(collectCatalog('ko'), /AllSourcesUnavailable/);
  assert.equal((await fetchPage('shorts', 'ko', 'bad')).ok, false);
});
test('parser handles escaped braces and continuation items', () => {
  assert.deepEqual(parseEmbeddedJson('var x = {"a":"}\\\"{","b":{"v":1}};', 'var x ='), { a: '}"{', b: { v: 1 } });
  const data = { richGridRenderer: { contents: [{ videoRenderer: { videoId: 'abcdefghijk', title: { simpleText: 'A video' }, thumbnail: { thumbnails: [{ url: 'https://i.ytimg.com/a.jpg' }] } } }, { continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: 'next' } } } }] } };
  assert.equal(collectYouTubeVideos(data)[0].title, 'A video'); assert.equal(findYouTubeContinuation(data), 'next');
});
test('optional RSS outage retains known dates while healthy video tabs remain fresh', async t => {
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async url => {
    if (url.includes('/feeds/')) return new Response('', { status: 404 });
    if (url.includes('/oembed')) return Response.json({ title: 'Featured', thumbnail_url: 'https://i.ytimg.com/featured.jpg' });
    const content = url.includes('/shorts?') ? { reelItemRenderer: { videoId: '12345678901', headline: { simpleText: 'Short' } } } : { videoRenderer: { videoId: 'abcdefghijk', title: { simpleText: 'Video' }, thumbnail: { thumbnails: [{ url: 'https://i.ytimg.com/video.jpg' }] } } };
    return new Response('var ytInitialData = ' + JSON.stringify({ richGridRenderer: { contents: [content] } }) + ';');
  };
  const result = await collectCatalog('en', { videos: [{ id: 'abcdefghijk', title: 'Old title', published: '2026-10-18T00:00:00Z' }] });
  assert.equal(result.status, 'fresh'); assert.ok(result.warnings.includes('rss'));
  assert.equal(result.videos.find(video => video.id === 'abcdefghijk').published, '2026-10-18T00:00:00Z');
});
test('localized metadata replaces old text and all filters can load additional pages', () => {
  const videos = mergeVideos([{ id: 'abcdefghijk', title: '한국어', publishedText: '5일 전' }], [{ id: 'abcdefghijk', title: 'English', publishedText: '5d ago', published: '2026-10-18T00:00:00Z' }]);
  assert.equal(videos[0].publishedText, '5d ago'); assert.match(formatDate(videos[0], 'en'), /Oct/);
  assert.deepEqual(pageTypes('shorts', { videos: 'v', shorts: 's' }), ['shorts']);
  assert.equal(filterVideos(videos, 'videos', 'ENGLISH').length, 1);
  assert.equal(mergeVideos([], [{ id: 'bad', title: 'invalid' }]).length, 0);
});
test('worker revalidates HTML, makes versioned files immutable and returns useful 404/405', async () => {
  const assets = { fetch: async request => new Response(new URL(request.url).pathname === '/404' ? '<h1>404 home</h1>' : '<h1>home</h1>', { status: new URL(request.url).pathname === '/missing' ? 404 : 200 }) };
  const home = await worker.fetch(new Request('https://muntang.com/'), { ASSETS: assets });
  assert.equal(home.headers.get('Cache-Control'), 'public, max-age=0, must-revalidate'); assert.match(home.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
  const js = await worker.fetch(new Request('https://muntang.com/assets/app.123456abcdef.js'), { ASSETS: assets }); assert.match(js.headers.get('Cache-Control'), /immutable/);
  const missing = await worker.fetch(new Request('https://muntang.com/missing'), { ASSETS: assets }); assert.equal(missing.status, 404); assert.match(await missing.text(), /404 home/);
  const post = await worker.fetch(new Request('https://muntang.com/api/youtube', { method: 'POST' }), {}); assert.equal(post.status, 405);
  const invalid = await worker.fetch(new Request('https://muntang.com/api/youtube?type=bad', { method: 'HEAD' }), {}); assert.equal(invalid.status, 400); assert.equal(await invalid.text(), '');
});
test('built pages contain complete initial titles, distinct language metadata and working asset paths', async () => {
  for (const [language, file] of [['ko', 'dist/index.html'], ['en', 'dist/en/index.html']]) {
    const { document } = parseHTML(await fs.readFile(file, 'utf8'));
    assert.equal(document.documentElement.lang, language);
    assert.equal(document.querySelector('link[rel=canonical]').getAttribute('href'), language === 'en' ? 'https://muntang.com/en/' : 'https://muntang.com/');
    assert.ok(document.querySelectorAll('#videoGrid .video-card').length >= 17);
    const node = document.querySelector('#videoBootstrap'); const data = JSON.parse(node.content.textContent || node.textContent); assert.ok(data.videos.every(video => video.title));
    for (const node of document.querySelectorAll('script[src],link[rel=stylesheet]')) { const url = node.getAttribute('src') || node.getAttribute('href'); assert.match(url, /\.[a-f0-9]{12}\./); await fs.access('dist' + url); }
    assert.equal(document.querySelector('#videoModal'), null);
    for (const id of ['heroPause', 'heroPrevious', 'heroNext', 'playerStatus', 'siteDrawer']) assert.ok(document.getElementById(id));
  }
});
