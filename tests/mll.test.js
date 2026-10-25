import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import worker, { canonicalLocation } from '../worker.js';
import { collectDemonlist, normalizeDemons, syncDemonlist, getDemonlist, DEMONLIST_KEY, DEMONLIST_CRON } from '../lib/demonlist.js';
import { filterDemons, renderRows, renderDetail, highlight, youtubeId } from '../public/mll-view.js';
// Synthetic test records only. Production has no bundled demonlist.
const saved = { checkedAt: '2026-10-25T00:00:00Z', updatedAt: '2026-10-25T00:00:00Z', demons: Array.from({length:150}, (_, i) => ({ id:9000+i, position:i+1, name:`Test Level ${i+1}`, publisher:{name:`Publisher ${i+1}`}, verifier:{name:`Verifier ${i+1}`}, level_id:100000+i, requirement:50, video:'https://www.youtube.com/watch?v=abcdefghijk', thumbnail:null })) };

const clone = value => structuredClone(value);
function storage(initial = null) {
  let value = clone(initial);
  const writes = [];
  return { writes, get: async key => { assert.equal(key, DEMONLIST_KEY); return clone(value); }, put: async (key, json) => { assert.equal(key, DEMONLIST_KEY); value = JSON.parse(json); writes.push(clone(value)); } };
}

test('collector bounds both pages to ranks 1–150', async () => {
  const calls = [];
  const demons = await collectDemonlist(async (raw, options) => {
    const url = new URL(raw); calls.push(url);
    assert.equal(url.origin + url.pathname, 'https://pointercrate.com/api/v2/demons/listed/');
    assert.equal(options.headers.Accept, 'application/json');
    const after = Number(url.searchParams.get('after')), before = Number(url.searchParams.get('before'));
    return JSON.stringify(saved.demons.filter(demon => demon.position > after && demon.position < before));
  });
  assert.equal(calls.length, 2);
  assert.deepEqual(calls.map(url => Object.fromEntries(url.searchParams)), [{ after: '0', before: '101', limit: '100' }, { after: '100', before: '151', limit: '50' }]);
  assert.deepEqual(demons, saved.demons);
});

test('incomplete pages, rank 151 and duplicate demons are rejected', async () => {
  await assert.rejects(collectDemonlist(async () => '[]'), /InvalidDemonlistPage/);
  await assert.rejects(collectDemonlist(async raw => {
    const second = new URL(raw).searchParams.get('after') === '100';
    const page = clone(saved.demons.slice(second ? 100 : 0, second ? 150 : 100));
    if (second) page[49].position = 151;
    return JSON.stringify(page);
  }), /InvalidDemonlistPage/);
  const duplicate = clone(saved.demons); duplicate[100].id = duplicate[0].id;
  assert.throws(() => normalizeDemons(duplicate), /InvalidDemonlistRanks/);
  const gap = clone(saved.demons); gap[149].position = 151;
  assert.throws(() => normalizeDemons(gap), /InvalidDemonlistRanks/);
});

test('Rated+ positions are translated to actual Demonlist ranks without fetching rank 151', async () => {
  const raw = [];
  for (const demon of saved.demons) {
    if (demon.position % 15 === 0) raw.push({...demon,id:20000+demon.id,rated_position:null});
    raw.push({...demon,rated_position:demon.position});
  }
  raw.forEach((demon,index) => { demon.position = index+1; });
  // A rank-151 sentinel must never be requested.
  raw.push({...saved.demons[0],id:99999,position:161,rated_position:151});
  const fetched = [], calls = [];
  const list = await collectDemonlist(async value => {
    const params = new URL(value).searchParams; calls.push(Object.fromEntries(params));
    const page = raw.filter(demon => demon.position > Number(params.get('after')) && demon.position < Number(params.get('before')));
    fetched.push(...page);
    return JSON.stringify(page);
  });
  assert.equal(list.length,150); assert.deepEqual(list.map(demon=>demon.name),saved.demons.map(demon=>demon.name));
  assert.equal(list[149].position,150); assert.ok(calls.length>=3);
  assert.ok(fetched.every(demon=>demon.rated_position === null || demon.rated_position <= 150));
  assert.equal(list[149].id,saved.demons[149].id);
});

test('synchronization detects changes while preserving updatedAt for unchanged lists', async () => {
  const kv = storage(), env = { MLL_DATA: kv };
  const now = Date.parse('2026-10-25T00:00:00Z');
  const collect = async () => clone(saved.demons);
  const first = await syncDemonlist(env, { collect, now });
  assert.equal(first.changed, true);
  const same = await syncDemonlist(env, { collect, now: now + 300000 });
  assert.equal(same.changed, false); assert.equal(same.updatedAt, first.updatedAt); assert.notEqual(same.checkedAt, first.checkedAt);
  const moved = clone(saved.demons); [moved[0], moved[1]] = [moved[1], moved[0]];
  moved[0].position = 1; moved[1].position = 2;
  const changed = await syncDemonlist(env, { collect: async () => moved, now: now + 600000 });
  assert.equal(changed.changed, true); assert.notEqual(changed.updatedAt, first.updatedAt); assert.equal(changed.demons[0].id, moved[0].id);
  moved[0].verifier.name = 'Updated verifier';
  assert.equal((await syncDemonlist(env, { collect: async () => moved, now: now + 900000 })).changed, true);
});

test('upstream failure preserves the complete last successful snapshot', async () => {
  const kv = storage(saved);
  await assert.rejects(syncDemonlist({ MLL_DATA: kv }, { collect: async () => { throw new Error('UpstreamHTTP429'); } }), /429/);
  assert.equal(kv.writes.length, 0); assert.deepEqual(await kv.get(DEMONLIST_KEY), saved);
  assert.equal((await getDemonlist({ MLL_DATA: kv }, Date.parse(saved.checkedAt) + 400000)).status, 'stale');
});

test('read API uses stored data without upstream requests; storage failure is explicit', async t => {
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = () => assert.fail('Read requests must not contact Pointercrate');
  const kv = storage(saved);
  assert.equal((await getDemonlist({ MLL_DATA: kv }, Date.parse(saved.checkedAt))).status, 'fresh');
  for (const env of [{}, { MLL_DATA: { get: async () => { throw new Error('StorageDown'); } } }]) {
    const data = await getDemonlist(env); assert.equal(data.status, 'unavailable'); assert.equal(data.ok, false); assert.equal(data.demons.length, 0);
  }
  const response = await worker.fetch(new Request('https://muntang.com/api/mll?limit=999&after=150'), { MLL_DATA: kv });
  assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store'); assert.equal((await response.json()).demons.length, 150);
  const head = await worker.fetch(new Request('https://muntang.com/api/mll', { method: 'HEAD' }), {});
  assert.equal(head.status, 200); assert.equal(await head.text(), '');
  assert.equal((await worker.fetch(new Request('https://muntang.com/api/mll', { method: 'POST' }), {})).status, 405);
});

test('empty storage bootstraps from the real collector, never hardcoded data', async t => {
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  let calls = 0;
  globalThis.fetch = async raw => { calls++; const after = Number(new URL(raw).searchParams.get('after')); return Response.json(saved.demons.slice(after, after === 0 ? 100 : 150)); };
  const kv = storage();
  const data = await getDemonlist({MLL_DATA:kv});
  assert.equal(data.ok, true); assert.equal(data.demons.length, 150); assert.equal(calls, 2); assert.equal(kv.writes.length, 1);
  globalThis.fetch = async () => new Response('offline', {status:503});
  const unavailable = await getDemonlist({MLL_DATA:storage()});
  assert.equal(unavailable.ok, false); assert.deepEqual(unavailable.demons, []);
});

test('cron synchronizes without any visitor requests', async t => {
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  let calls = 0;
  globalThis.fetch = async raw => {
    calls++;
    const after = Number(new URL(raw).searchParams.get('after'));
    return Response.json(saved.demons.slice(after, after === 0 ? 100 : 150));
  };
  const kv = storage();
  await worker.scheduled({ cron: DEMONLIST_CRON }, { MLL_DATA: kv });
  assert.equal(calls, 2); assert.equal(kv.writes.length, 1); assert.equal(kv.writes[0].demons.length, 150);
  await worker.scheduled({ cron: '0 * * * *' }, { MLL_DATA: kv }); assert.equal(calls, 2);
});

test('MLL canonical path resolves without a slash redirect loop', async () => {
  for (const pathname of ['/mll/', '/mll/index.html', '/mll.html']) assert.equal(canonicalLocation(new URL('https://muntang.com' + pathname + '?q=test')), 'https://muntang.com/mll?q=test');
  assert.equal(canonicalLocation(new URL('https://muntang.com/mll')), null);
  let assetPath;
  const response = await worker.fetch(new Request('https://muntang.com/mll'), { ASSETS: { fetch: async request => { assetPath = new URL(request.url).pathname; return new Response('MLL'); } } });
  assert.equal(response.status, 200); assert.equal(assetPath, '/mll/'); assert.equal(response.headers.get('content-language'), 'ko');
});

test('search highlights every matching field and external links use rank, never internal ID', () => {
  assert.equal(filterDemons(saved.demons, '').length, 150);
  const demon = saved.demons[0];
  for (const query of [demon.name.toLowerCase(), demon.publisher.name, demon.verifier.name, String(demon.level_id)]) assert.ok(filterDemons(saved.demons, query).some(row => row.id === demon.id));
  assert.equal(filterDemons(saved.demons, 'no such level 1234').length, 0);
  const unsafe = { ...demon, name: '<script>alert(1)</script>' };
  assert.doesNotMatch(renderRows([unsafe], unsafe.id), /<script>/); assert.doesNotMatch(renderDetail(unsafe), /<script>/);
  assert.equal(highlight('<Level & Level>', 'level'), '&lt;<mark>Level</mark> &amp; <mark>Level</mark>&gt;');
  assert.match(renderRows([demon], demon.id, 'publisher'), /<mark>Publisher<\/mark>/);
  assert.match(renderRows([demon], demon.id, '100000'), /ID <mark>100000<\/mark>/);
  const detail = renderDetail(demon);
  assert.match(detail, /href="https:\/\/pointercrate.com\/demonlist\/1\/"/);
  assert.doesNotMatch(detail, /demonlist\/9000/);
  assert.match(detail, /youtube-nocookie.com\/embed\/abcdefghijk/);
  assert.doesNotMatch(detail, /POINTERCRATE DEMONLIST|watch-link|<img/);
  assert.match(renderDetail(demon,'en'), /Publisher|Verifier|View on Pointercrate/);
  assert.equal(youtubeId('javascript:alert(1)'), null); assert.equal(youtubeId('https://evil.example/watch?v=abcdefghijk'), null);
  assert.equal(youtubeId('https://youtu.be/abcdefghijk'), 'abcdefghijk');
  const input = clone(saved.demons); input[0].video = 'javascript:alert(1)'; input[0].thumbnail = 'https://evil.example/tracking.jpg';
  const normalized = normalizeDemons(input); assert.equal(normalized[0].video, null); assert.equal(normalized[0].thumbnail, null);
});

test('MLL reuses the home header/drawer, has separate bilingual routes and embeds no ranking data', async () => {
  const { document: home } = parseHTML(await fs.readFile('dist/index.html', 'utf8'));
  for (const [language, path] of [['ko','dist/mll/index.html'],['en','dist/en/mll/index.html']]) {
    const { document } = parseHTML(await fs.readFile(path,'utf8'));
    assert.equal(document.documentElement.lang, language);
    assert.equal(document.querySelectorAll('#demonRows li').length, 0);
    assert.equal(document.querySelector('#mllBootstrap'), null);
    assert.equal(document.querySelector('[data-range]'), null);
    assert.equal(document.querySelector('.sync-line'), null);
    assert.equal(document.querySelector('.brand').getAttribute('href'), language === 'en' ? '/en/mll' : '/mll');
    assert.equal(document.querySelector('#languageToggle').getAttribute('href'), language === 'en' ? '/mll' : '/en/mll');
    assert.equal(document.querySelector('link[rel=canonical]').getAttribute('href'), 'https://muntang.com' + (language === 'en' ? '/en/mll' : '/mll'));
    assert.equal(document.querySelector('.header').className, home.querySelector('.header').className);
    assert.equal(document.querySelector('#siteDrawer').className, home.querySelector('#siteDrawer').className);
    assert.equal(document.querySelector('#ldmToggle').innerHTML, home.querySelector('#ldmToggle').innerHTML.replace('끔', language === 'en' ? 'Off' : '끔'));
    assert.equal(document.querySelector('.drawer-link[href="#showreel"]'), null);
    for (const node of document.querySelectorAll('script[src],link[rel=stylesheet]')) {
      const url = node.getAttribute('src') || node.getAttribute('href'); assert.match(url, /\.[a-f0-9]{12}\./); await fs.access('dist' + url);
    }
  }
  for (const file of ['dist/index.html', 'dist/en/index.html']) {
    const { document: home } = parseHTML(await fs.readFile(file, 'utf8'));
    assert.equal(home.querySelector('.drawer-link[href="' + (file.includes('/en/') ? '/en/mll' : '/mll') + '"] span').textContent, 'MLL');
  }
});
