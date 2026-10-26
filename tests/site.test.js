import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import worker, { canonicalLocation } from '../worker.js';
import { getCatalog, parseCatalogRequest, catalogCacheKey, syncCatalogLanguage, syncCatalog, catalogStorageKey } from '../lib/catalog.js';
import { readUpstream, collectCatalog, fetchPage } from '../lib/youtube.js';
import { parseEmbeddedJson, collectYouTubeVideos, findYouTubeContinuation } from '../lib/youtube-parser.js';
import { mergeVideos, filterVideos, pageTypes, formatDate } from '../public/video-state.js';
import { createSlideClock, createFpsSampler } from '../public/motion-clock.js';

test('slide progress uses active time and survives pauses without duplicate clocks', () => {
  let time = 0, callback, progress = 0, advances = 0, requests = 0;
  const clock = createSlideClock({ now: () => time, request: fn => { callback = fn; return ++requests; }, cancel: () => { callback = null; }, progress: value => { progress = value; }, advance: () => { advances++; return true; } });
  const step = value => { time = value; callback?.(time); };
  clock.setRunning(true); clock.setRunning(true);
  assert.equal(requests, 1);
  step(3200); assert.equal(progress, .5); assert.equal(advances, 0);
  clock.setRunning(false); step(13200); assert.equal(progress, .5);
  clock.setRunning(true); step(16399); assert.ok(progress < 1); assert.equal(advances, 0);
  step(16400); assert.equal(advances, 1); assert.equal(progress, 0);
  clock.reset(); step(18000); assert.equal(progress, .25);
});

test('LDM recommendation requires sustained low FPS and resets after recovery or suspension', () => {
  const reports = [];
  const sampler = createFpsSampler(fps => reports.push(fps));
  let time = 0;
  sampler.sample(time);
  const frames = (count, interval) => { for (let i = 0; i < count; i++) sampler.sample(time += interval); };
  frames(50, 50); assert.equal(reports.length, 0);
  frames(150, 1000 / 60); frames(51, 50); assert.equal(reports.length, 0);
  frames(51, 50); assert.equal(reports.at(-1), 20);
  sampler.reset(); reports.length = 0;
  time += 60000; sampler.sample(time); frames(50, 50); assert.equal(reports.length, 0);
});

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
function memoryStorage() {
  const entries = new Map();
  return { entries, get: async key => entries.has(key) ? JSON.parse(entries.get(key)) : null, put: async (key, value) => entries.set(key, value) };
}
const collected = language => ({ ok: true, status: 'fresh', language, videos: [{id:'abcdefghijk',title:language === 'en' ? 'Live title' : '실제 수집 제목',type:'video'}],nextContinuations:{videos:'',shorts:''} });
test('scheduled catalogs are stored separately and visitor reads never collect again', async () => {
  const storage = memoryStorage(); const now = Date.now();
  await syncCatalog({MLL_DATA:storage}, {collector: async language => collected(language),now});
  assert.equal(storage.entries.size, 2);
  for (const language of ['ko','en']) {
    const data = await getCatalog({...params,language},null,{storage,now:now+60_000,collector:()=>assert.fail('stored catalogs must not collect on reads')});
    assert.equal(data.language,language); assert.equal(data.status,'fresh'); assert.equal(data.syncIntervalSeconds,300);
  }
  const old = await getCatalog(params,null,{storage,now:now+600_000,collector:()=>assert.fail('stale catalogs wait for the cron')});
  assert.equal(old.status,'stale'); assert.equal(old.videos[0].title,'실제 수집 제목');
});
test('failed sync preserves only previously collected KV data; missing data is unavailable', async () => {
  const storage = memoryStorage();
  await syncCatalogLanguage(storage,'ko',{collector:async()=>collected('ko')});
  const before = storage.entries.get(catalogStorageKey('ko'));
  await assert.rejects(syncCatalogLanguage(storage,'ko',{collector:async()=>{throw new Error('upstream offline')}}));
  assert.equal(storage.entries.get(catalogStorageKey('ko')),before);
  const empty = await getCatalog(params,null,{storage:memoryStorage(),collector:async()=>{throw new Error('upstream offline')}});
  assert.equal(empty.ok,false); assert.equal(empty.status,'unavailable'); assert.deepEqual(empty.videos,[]);
  const invalid = memoryStorage();
  await assert.rejects(syncCatalogLanguage(invalid,'ko',{collector:async()=>({...collected('ko'),videos:[]})}),/InvalidCatalog/);
  assert.equal(invalid.entries.size,0);
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
  assert.equal(videos[0].publishedText, '5d ago'); assert.match(formatDate(videos[0], 'en', Date.parse('2026-10-26T00:00:00Z')), /^1 week ago ·/);
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
test('built pages contain no video data and keep distinct language metadata and working asset paths', async () => {
  for (const [language, file] of [['ko', 'dist/index.html'], ['en', 'dist/en/index.html']]) {
    const { document } = parseHTML(await fs.readFile(file, 'utf8'));
    assert.equal(document.documentElement.lang, language);
    assert.equal(document.querySelector('link[rel=canonical]').getAttribute('href'), language === 'en' ? 'https://muntang.com/en/' : 'https://muntang.com/');
    assert.equal(document.querySelectorAll('#videoGrid .video-card').length,0);
    assert.equal(document.querySelector('#videoBootstrap'),null);
    assert.equal(document.querySelector('#heroThumbnail').getAttribute('src'),null);
    assert.equal(document.querySelectorAll('[data-video-id]').length,0);
    for (const node of document.querySelectorAll('script[src],link[rel=stylesheet]')) { const url = node.getAttribute('src') || node.getAttribute('href'); assert.match(url, /\.[a-f0-9]{12}\./); await fs.access('dist' + url); }
    assert.ok(document.querySelector('#videoModal').hasAttribute('hidden'));
    assert.equal(document.querySelector('#videoDialog').getAttribute('role'), 'dialog');
    assert.equal(document.querySelector('#videoDialog').getAttribute('aria-modal'), 'true');
    assert.equal(document.querySelector('#videoModalFrame').getAttribute('src'), 'about:blank');
    assert.equal(document.querySelector('#videoModalClose').getAttribute('aria-label'), language === 'en' ? 'Close video player' : '영상 창 닫기');
    assert.equal(document.querySelector('#archiveStatus').textContent, '');
    assert.ok(document.querySelector('#ldmSuggestion').hasAttribute('hidden'));
    assert.equal(document.querySelector('#ldmSuggestionEnable').textContent, language === 'en' ? 'Enable now' : '지금 켜기');
    for (const id of ['heroPause', 'heroPrevious', 'heroNext', 'playerStatus', 'siteDrawer']) assert.ok(document.getElementById(id));
  }
});
