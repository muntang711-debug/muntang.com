import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';
import translations from '../lib/translations.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.resolve(root, 'dist');
if (path.dirname(dist) !== root || path.basename(dist) !== 'dist') throw new Error('Unsafe build directory');
await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(path.join(dist, 'assets'), { recursive: true });
await fs.cp(path.join(root, 'public'), dist, { recursive: true, filter: source => !/\.(?:js|css)$/.test(source) && path.basename(source) !== 'index.html' });

const outputs = {};
for (const [name, entry] of Object.entries({ app: 'script.js', style: 'styles.css' })) {
  const result = await build({ entryPoints: [path.join(root, 'public', entry)], bundle: true, minify: true, target: 'es2022', write: false, legalComments: 'inline', format: 'iife' });
  const content = result.outputFiles[0].contents;
  const ext = entry.endsWith('.css') ? 'css' : 'js';
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
  outputs[ext] = `/assets/${name}.${hash}.${ext}`;
  await fs.writeFile(path.join(dist, outputs[ext]), content);
}

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const original = await fs.readFile(path.join(root, 'public/index.html'), 'utf8');
for (const language of ['ko', 'en']) {
  const { document } = parseHTML(original);
  const en = language === 'en';
  const data = JSON.parse(await fs.readFile(path.join(root, `data/youtube-${language}.json`), 'utf8'));
  const url = 'https://muntang.com' + (en ? '/en/' : '/');
  document.documentElement.lang = language;
  if (en) {
    for (const entry of translations) document.querySelectorAll(entry.s).forEach((node, index) => {
      const value = entry.en?.[index];
      if (value !== undefined) { if (entry.a) node.setAttribute(entry.a, value); else node.innerHTML = value; }
    });
    document.querySelector('#ldmSuggestionTitle').textContent = 'Frame rate is low.';
    document.querySelector('#ldmSuggestionDetail').textContent = 'Enable LDM?';
    document.querySelector('#ldmSuggestionEnable').textContent = 'Enable now';
    document.querySelector('#ldmSuggestionDismiss').textContent = 'Later';
    document.title = 'Muntang.com';
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) document.querySelector(selector).content = 'Muntang.com';
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) document.querySelector(selector).content = 'Muntang’s videos, creation process and English subtitles. Watch videos and Shorts from the channel.';
    document.querySelector('.skip-link').textContent = 'Skip to video library';
    document.querySelector('.brand').setAttribute('aria-label', 'Muntang.com home');
    document.querySelector('.hero-controls').setAttribute('aria-label', 'Featured video slideshow');
    document.querySelector('#heroPrevious').setAttribute('aria-label', 'Previous video');
    document.querySelector('#heroNext').setAttribute('aria-label', 'Next video');
    document.querySelector('#heroPause').textContent = 'Pause slideshow';
    document.querySelector('.subtitle-example-note').innerHTML = 'The window below demonstrates subtitle translation and placement. <a href="https://www.youtube.com/watch?v=5D9M7hhDNlY&amp;cc_load_policy=1&amp;cc_lang_pref=en" target="_blank" rel="noopener noreferrer">Watch a video with English captions ↗</a>';
    document.querySelector('.subtitle-window').setAttribute('aria-label', 'Subtitle translation example');
  }
  const toggle = document.querySelector('#languageToggle');
  toggle.textContent = en ? 'KO' : 'EN'; toggle.setAttribute('href', en ? '/' : '/en/'); toggle.setAttribute('lang', en ? 'ko' : 'en');
  toggle.setAttribute('aria-label', en ? '한국어로 전환' : 'Switch site language to English');
  document.querySelector('link[rel="canonical"]').href = url;
  document.querySelector('meta[property="og:url"]').content = url;
  document.querySelector('link[href="/styles.css"]').href = outputs.css;
  document.querySelector('script[src="/script.js"]').src = outputs.js;
  document.querySelector('#videoCount').textContent = String(data.videos.length);

  document.querySelector('#videoBootstrap').innerHTML = escape(JSON.stringify(data));
  document.querySelector('#videoGrid').innerHTML = data.videos.map((video, index) => `<article class="video-card is-visible"><a href="${escape(video.url)}" target="_blank" rel="noopener noreferrer"><div class="video-frame"><img src="${escape(video.thumbnail_url)}" alt="${escape(video.title)}" width="480" height="360" loading="lazy"><span class="video-index">${index + 1}</span></div><div class="video-card-text"><span class="video-card-title">${escape(video.title)}</span><span class="video-card-arrow" aria-hidden="true">↗</span></div></a></article>`).join('');
  const featured = data.featured?.[0] || data.videos.find(v => v.type !== 'short');
  if (featured) { document.querySelector('#heroTitle').textContent = featured.title; document.querySelector('#heroVideo').dataset.videoId = featured.id; }
  const target = en ? path.join(dist, 'en/index.html') : path.join(dist, 'index.html');
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, '<!doctype html>\n' + document.documentElement.outerHTML);
}
await fs.writeFile(path.join(dist, 'asset-manifest.json'), JSON.stringify(outputs) + '\n');
console.log('Built Korean and English pages with versioned JS/CSS:', outputs);
