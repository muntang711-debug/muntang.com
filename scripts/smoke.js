import assert from 'node:assert/strict';
const base = new URL(process.argv[2] || 'http://localhost:8787');
for (const pathname of ['/', '/en/']) {
  const response = await fetch(new URL(pathname, base));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'public, max-age=0, must-revalidate');
  const html = await response.text();
  assert.match(html, new RegExp(`<html[^>]+lang="${pathname === '/' ? 'ko' : 'en'}"`));
  const script = html.match(/src="(\/assets\/app\.[a-f0-9]{12}\.js)"/)?.[1];
  assert.ok(script);
  const asset = await fetch(new URL(script, base)); assert.equal(asset.status, 200); assert.match(asset.headers.get('Cache-Control'), /immutable/);
}
const missing = await fetch(new URL('/missing-smoke-check', base)); assert.equal(missing.status, 404); assert.match(await missing.text(), /404/);
const mllPage = await fetch(new URL('/mll', base)); assert.equal(mllPage.status, 200); assert.equal(new URL(mllPage.url).pathname, '/mll');
const mllHtml = await mllPage.text(); assert.equal((mllHtml.match(/class="level-row/g) || []).length, 150);
const mllApi = await fetch(new URL('/api/mll', base)); assert.equal(mllApi.status, 200);
const mllData = await mllApi.json(); assert.equal(mllData.demons.length, 150); assert.equal(mllData.demons[0].position, 1); assert.equal(mllData.demons.at(-1).position, 150);
const mllSlash = await fetch(new URL('/mll/', base), { redirect: 'manual' }); assert.equal(mllSlash.status, 308); assert.equal(new URL(mllSlash.headers.get('location')).pathname, '/mll');
const post = await fetch(new URL('/api/youtube', base), { method: 'POST' }); assert.equal(post.status, 405);
for (const language of ['ko', 'en']) {
  const response = await fetch(new URL('/api/youtube?hl=' + language, base)); assert.equal(response.status, 200);
  const data = await response.json(); assert.equal(data.language, language); assert.ok(data.videos.length > 0); assert.ok(data.videos.every(video => video.title)); assert.ok(data.nextContinuations);
}
if (base.hostname === 'muntang.com') {
  for (const origin of ['http://muntang.com', 'http://www.muntang.com', 'https://www.muntang.com']) {
    const response = await fetch(origin + '/en/?check=canonical', { redirect: 'manual' });
    assert.ok([301, 308].includes(response.status)); assert.equal(response.headers.get('Location'), 'https://muntang.com/en/?check=canonical');
  }
}
console.log('HTTP smoke checks passed for', base.origin);
