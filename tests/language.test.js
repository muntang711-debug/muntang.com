import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const source = await fs.readFile(new URL('../public/language.js', import.meta.url), 'utf8');
function visit(pathname, saved, blocked = false) {
  const redirects = [], writes = [], listeners = {};
  const location = { pathname, search: '?ref=test', hash: '#videos', replace: value => redirects.push(value) };
  vm.runInNewContext(source, {
    location,
    localStorage: {
      getItem: () => { if (blocked) throw new Error('Blocked'); return saved; },
      setItem: (key, value) => { if (blocked) throw new Error('Blocked'); writes.push([key, value]); },
    },
    document: { addEventListener: (name, callback) => { listeners[name] = callback; } },
  });
  return { redirects, writes, click(language, extra = {}) { listeners.click?.({ button: 0, target: { closest: () => ({ getAttribute: () => language }) }, ...extra }); } };
}

test('saved language selects the matching home without loops and preserves query/hash', () => {
  assert.deepEqual(visit('/', 'en').redirects, ['/en/?ref=test#videos']);
  assert.deepEqual(visit('/en/', 'ko').redirects, ['/?ref=test#videos']);
  assert.deepEqual(visit('/mll', 'en').redirects, ['/en/mll?ref=test#videos']);
  assert.deepEqual(visit('/en/mll', 'ko').redirects, ['/mll?ref=test#videos']);
  assert.deepEqual(visit('/mll/100', 'en').redirects, ['/en/mll/100?ref=test#videos']);
  assert.deepEqual(visit('/en/mll/150', 'ko').redirects, ['/mll/150?ref=test#videos']);
  for (const [path, saved] of [['/', null], ['/', 'ko'], ['/en/', 'en'], ['/', 'invalid'], ['/tools/', 'en']]) assert.deepEqual(visit(path, saved).redirects, []);
});

test('explicit language choices persist while blocked storage keeps navigation usable', () => {
  const page = visit('/', null);
  page.click('en'); page.click('ko'); page.click('invalid'); page.click('en', { ctrlKey: true });
  assert.deepEqual(page.writes, [['muntang-language', 'en'], ['muntang-language', 'ko']]);
  const blocked = visit('/', null, true);
  assert.doesNotThrow(() => blocked.click('en'));
  assert.deepEqual(blocked.redirects, []);
});
