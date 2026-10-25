import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';
import translations from '../lib/translations.js';
import { applySiteMenu } from '../lib/navigation.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.resolve(root, 'dist');
if (path.dirname(dist) !== root || path.basename(dist) !== 'dist') throw new Error('Unsafe build directory');
await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(path.join(dist, 'assets'), { recursive: true });
await fs.cp(path.join(root, 'public'), dist, { recursive: true, filter: source => !/\.(?:js|css)$/.test(source) && !['index.html', 'mll.html'].includes(path.basename(source)) });

const outputs = {};
for (const [name, entry] of Object.entries({ app: 'script.js', style: 'styles.css', language: 'language.js', mll: 'mll.js', 'mll-level': 'mll-level.js', 'mll-style': 'mll.css' })) {
  const result = await build({ entryPoints: [path.join(root, 'public', entry)], bundle: true, minify: true, target: 'es2022', write: false, legalComments: 'inline', format: 'iife' });
  const content = result.outputFiles[0].contents;
  const ext = entry.endsWith('.css') ? 'css' : 'js';
  const hash = createHash('sha256').update(content).digest('hex').slice(0, 12);
  const key = ['app', 'style'].includes(name) ? ext : name;
  outputs[key] = `/assets/${name}.${hash}.${ext}`;
  await fs.writeFile(path.join(dist, outputs[key]), content);
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
    document.querySelector('#videoModalExternal').innerHTML = 'YouTube <b>↗</b>';
    document.querySelector('#videoModalClose').setAttribute('aria-label', 'Close video player');
    document.querySelector('#videoModalTitle').textContent = 'YouTube video';
    document.querySelector('#videoModalFrame').setAttribute('title', 'YouTube video player');
    document.querySelector('#ldmSuggestionDismiss').setAttribute('aria-label', 'Dismiss suggestion');
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
    for (const [id, label] of [['heroPrevious', 'Previous video'], ['heroNext', 'Next video'], ['heroPause', 'Pause slideshow']]) {
      document.getElementById(id).setAttribute('aria-label', label);
      document.getElementById(id).setAttribute('title', label);
    }
    document.querySelector('.subtitle-example-note').innerHTML = 'The window below demonstrates subtitle translation and placement. <a href="https://www.youtube.com/watch?v=5D9M7hhDNlY&amp;cc_load_policy=1&amp;cc_lang_pref=en" target="_blank" rel="noopener noreferrer">Watch a video with English captions ↗</a>';
    document.querySelector('.subtitle-window').setAttribute('aria-label', 'Subtitle translation example');
  }
  const toggle = document.querySelector('#languageToggle');
  applySiteMenu(document, language);
  toggle.textContent = en ? 'KO' : 'EN'; toggle.setAttribute('href', en ? '/' : '/en/'); toggle.setAttribute('lang', en ? 'ko' : 'en');
  toggle.setAttribute('aria-label', en ? '한국어로 전환' : 'Switch site language to English');
  document.querySelector('link[rel="canonical"]').href = url;
  document.querySelector('meta[property="og:url"]').content = url;
  document.querySelector('link[href="/styles.css"]').href = outputs.css;
  document.querySelector('script[src="/script.js"]').src = outputs.js;
  document.querySelector('script[src="/language.js"]').src = outputs.language;
  document.querySelector('#videoCount').textContent = String(data.videos.length);
  document.querySelector('#archiveStatus').textContent = '';

  document.querySelector('#videoBootstrap').innerHTML = escape(JSON.stringify(data));
  document.querySelector('#videoGrid').innerHTML = data.videos.map((video, index) => `<article class="video-card is-visible"><a href="${escape(video.url)}" target="_blank" rel="noopener noreferrer"><div class="video-frame"><img src="${escape(video.thumbnail_url)}" alt="${escape(video.title)}" width="480" height="360" loading="lazy"><span class="video-index">${index + 1}</span></div><div class="video-card-text"><span class="video-card-title">${escape(video.title)}</span><span class="video-card-arrow" aria-hidden="true">↗</span></div></a></article>`).join('');
  const featured = data.featured?.[0] || data.videos.find(v => v.type !== 'short');
  if (featured) { document.querySelector('#heroTitle').textContent = featured.title; document.querySelector('#heroVideo').dataset.videoId = featured.id; }
  const target = en ? path.join(dist, 'en/index.html') : path.join(dist, 'index.html');
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, '<!doctype html>\n' + document.documentElement.outerHTML);
}
const mllSource = await fs.readFile(path.join(root, 'public/mll.html'), 'utf8');
const { document: homeShell } = parseHTML(original);
for (const language of ['ko', 'en']) {
  const { document: mll } = parseHTML(mllSource), en = language === 'en';
  const text = (ko, english) => en ? english : ko;
  const base = en ? '/en/mll' : '/mll', home = en ? '/en/' : '/';
  mll.documentElement.lang = language;
  // Reuse the actual home header and drawer, not a separately styled imitation.
  mll.querySelector('#siteShell').outerHTML = ['.header', '.drawer-backdrop', '.drawer'].map(selector => homeShell.querySelector(selector).outerHTML).join('');
  const brand = mll.querySelector('.brand'); brand.innerHTML = 'MLL<span class="brand-dot">.</span>'; brand.href = base; brand.setAttribute('aria-label', text('MLL 홈', 'MLL home'));
  mll.querySelector('.nav-channel').remove();
  const toggle = mll.querySelector('#languageToggle');
  toggle.textContent = en ? 'KO' : 'EN'; toggle.href = en ? '/mll' : '/en/mll'; toggle.setAttribute('lang', en ? 'ko' : 'en'); toggle.setAttribute('aria-label', en ? '한국어로 전환' : 'Switch site language to English');
  mll.querySelector('.nav').setAttribute('aria-label', text('주요 메뉴', 'Main navigation'));
  mll.querySelector('#menuTrigger').setAttribute('aria-label', text('메뉴 열기', 'Open menu'));
  mll.querySelector('#siteDrawer').setAttribute('aria-label', text('사이트 메뉴', 'Site menu'));
  mll.querySelector('.drawer-menu-title').innerHTML = text('메뉴', 'Menu') + '<span class="brand-dot">.</span>';
  applySiteMenu(mll, language);
  mll.querySelector('#ldmStatus').textContent = text('끔', 'Off');
  mll.querySelector('#ldmToggle').setAttribute('aria-label', text('LDM 저사양 모드 켜기', 'Enable Low Detail Mode'));
  mll.querySelector('.footer-brand').href = base; mll.querySelector('#mainSiteLink').href = home;
  mll.querySelector('link[rel=canonical]').href = 'https://muntang.com' + base;
  mll.querySelector('meta[property="og:url"]').content = 'https://muntang.com' + base;
  mll.querySelector('link[href="/styles.css"]').href = outputs.css;
  mll.querySelector('link[href="/mll.css"]').href = outputs['mll-style'];
  mll.querySelector('script[src="/mll.js"]').src = outputs.mll;
  mll.querySelector('script[src="/language.js"]').src = outputs.language;
  if (en) {
    const strings = { listDescription:'Pointercrate Demonlist #1–150', originalListText:'Original list', resultCount:'Loading…', searchLabel:'Search level, publisher, verifier or ID', retrySync:'Try again', rankLabel:'Video', levelLabel:'Rank / Level / Publisher', verifierLabel:'Verifier', emptyState:'Loading the demonlist…', mainSiteLink:'Muntang.com ↗', dataCredit:'Rankings: Pointercrate ↗' };
    for (const [id, value] of Object.entries(strings)) mll.getElementById(id).textContent = value;
    mll.querySelector('#levelSearch').placeholder = 'Search levels';
    mll.querySelector('.skip-link').textContent = 'Skip to demonlist';
    mll.querySelector('#ranking').setAttribute('aria-label', 'Demonlist rankings');
    mll.querySelector('#demonRows').setAttribute('aria-label', 'Ranks 1 through 150');
    mll.querySelector('#noScriptText').innerHTML = 'Enable JavaScript to load the current demonlist. <a href="https://pointercrate.com/demonlist/">View on Pointercrate ↗</a>';
    mll.querySelector('meta[name="description"]').content = 'Muntang Level List. View the top 150 Pointercrate demons and verification videos.';
    mll.querySelector('meta[property="og:description"]').content = 'Pointercrate Demonlist #1–150';
  }
  const directory = path.join(dist, en ? 'en/mll' : 'mll');
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'index.html'), '<!doctype html>\n' + mll.documentElement.outerHTML);
  for (let rank = 1; rank <= 150; rank++) {
    const { document: level } = parseHTML(mll.documentElement.outerHTML);
    const route = base + '/' + rank;
    level.body.dataset.rank = String(rank);
    level.body.classList.add('mll-level-page');
    level.querySelector('main').innerHTML = `<nav class="level-pagination" aria-label="${text('레벨 이동', 'Level navigation')}"><a id="previousLevel" href="${base}/${rank-1}">← ${text('이전 순위', 'Previous rank')}</a><a href="${base}">${text('목록', 'Demonlist')}</a><a id="nextLevel" href="${base}/${rank+1}">${text('다음 순위', 'Next rank')} →</a></nav><article id="levelDetail" class="standalone-detail"><h1>${text('불러오는 중…', 'Loading…')}</h1></article><p id="levelStatus" role="status"></p><button id="retryLevel" class="retry-level" type="button" hidden>${text('다시 시도', 'Try again')}</button>`;
    if (rank === 1) level.querySelector('#previousLevel').hidden = true;
    if (rank === 150) level.querySelector('#nextLevel').hidden = true;
    level.querySelector('.skip-link').href = '#levelDetail';
    level.querySelector('.skip-link').textContent = text('레벨 정보로 건너뛰기', 'Skip to level details');
    level.querySelector('#languageToggle').href = (en ? '/mll/' : '/en/mll/') + rank;
    level.querySelector('script[src="' + outputs.mll + '"]').src = outputs['mll-level'];
    level.querySelector('link[rel=canonical]').href = 'https://muntang.com' + route;
    level.querySelector('meta[property="og:url"]').content = 'https://muntang.com' + route;
    for (const alternate of level.querySelectorAll('link[rel=alternate]')) alternate.href += '/' + rank;
    level.title = '#' + rank + ' · MLL';
    const levelDirectory = path.join(directory,String(rank));
    await fs.mkdir(levelDirectory,{recursive:true});
    await fs.writeFile(path.join(levelDirectory,'index.html'),'<!doctype html>\n' + level.documentElement.outerHTML);
  }
}
await fs.writeFile(path.join(dist, 'asset-manifest.json'), JSON.stringify(outputs) + '\n');
console.log('Built Korean, English and MLL pages with versioned JS/CSS:', outputs);
