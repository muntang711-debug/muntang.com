import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import worker, { canonicalLocation } from '../worker.js';
import { collectDemonlist, normalizeDemons, syncDemonlist, getDemonlist, DEMONLIST_KEY, DEMONLIST_CRON } from '../lib/demonlist.js';
import { filterDemons, renderRows, renderDetail } from '../public/mll-view.js';
import saved from '../data/demonlist.json' with { type: 'json' };

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

test('read API uses stored data or fallback without upstream requests', async t => {
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = () => assert.fail('Read requests must not contact Pointercrate');
  const kv = storage(saved);
  assert.equal((await getDemonlist({ MLL_DATA: kv }, Date.parse(saved.checkedAt))).status, 'fresh');
  for (const env of [{}, { MLL_DATA: storage() }, { MLL_DATA: { get: async () => { throw new Error('StorageDown'); } } }]) {
    const data = await getDemonlist(env); assert.equal(data.status, 'stale'); assert.equal(data.demons.length, 150);
  }
  const response = await worker.fetch(new Request('https://muntang.com/api/mll?limit=999&after=150'), { MLL_DATA: kv });
  assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store'); assert.equal((await response.json()).demons.length, 150);
  const head = await worker.fetch(new Request('https://muntang.com/api/mll', { method: 'HEAD' }), {});
  assert.equal(head.status, 200); assert.equal(await head.text(), '');
  assert.equal((await worker.fetch(new Request('https://muntang.com/api/mll', { method: 'POST' }), {})).status, 405);
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

test('search and ranges preserve absolute ranks; unsafe media and HTML are blocked', () => {
  assert.equal(filterDemons(saved.demons, '', '1-75').length, 75);
  const extended = filterDemons(saved.demons, '', '76-150'); assert.equal(extended.length, 75); assert.equal(extended[0].position, 76);
  const demon = saved.demons[0];
  for (const query of [demon.name.toLowerCase(), demon.publisher.name, demon.verifier.name, String(demon.level_id)]) assert.ok(filterDemons(saved.demons, query).some(row => row.id === demon.id));
  assert.equal(filterDemons(saved.demons, 'no such level 1234').length, 0);
  const unsafe = { ...demon, name: '<script>alert(1)</script>' };
  assert.doesNotMatch(renderRows([unsafe], unsafe.id), /<script>/); assert.doesNotMatch(renderDetail(unsafe), /<script>/);
  const input = clone(saved.demons); input[0].video = 'javascript:alert(1)'; input[0].thumbnail = 'https://evil.example/tracking.jpg';
  const normalized = normalizeDemons(input); assert.equal(normalized[0].video, null); assert.equal(normalized[0].thumbnail, null);
});

test('built MLL has all 150 real levels, versioned assets and home menu links', async () => {
  const { document } = parseHTML(await fs.readFile('dist/mll/index.html', 'utf8'));
  const rows = [...document.querySelectorAll('#demonRows li')];
  assert.equal(rows.length, 150); assert.equal(rows.at(-1).querySelector('.level-rank').textContent, '#150');
  const boot = document.querySelector('#mllBootstrap'); assert.equal(JSON.parse(boot.content.textContent || boot.textContent).demons.length, 150);
  assert.equal(document.querySelector('link[rel=canonical]').getAttribute('href'), 'https://muntang.com/mll');
  for (const node of document.querySelectorAll('script[src],link[rel=stylesheet]')) {
    const url = node.getAttribute('src') || node.getAttribute('href'); assert.match(url, /\.[a-f0-9]{12}\./); await fs.access('dist' + url);
  }
  for (const file of ['dist/index.html', 'dist/en/index.html']) {
    const { document: home } = parseHTML(await fs.readFile(file, 'utf8'));
    assert.equal(home.querySelector('.drawer-link[href="/mll"] span').textContent, 'MLL');
  }
});
