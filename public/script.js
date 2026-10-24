import { initScene } from './scene.js';
import { mergeVideos, filterVideos, pageTypes, formatDate } from './video-state.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const language = document.documentElement.lang === 'en' ? 'en' : 'ko';
const en = language === 'en';
const text = (ko, english) => en ? english : ko;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let reduced = motion.matches;
let ldmEnabled = false;
try { ldmEnabled = localStorage.getItem('muntang-ldm') === '1'; } catch { /* Storage is optional. */ }
document.body.classList.add('js-ready');
document.body.classList.toggle('ldm-mode', ldmEnabled);
const playerStatus = $('#playerStatus');
const announce = message => { playerStatus.textContent = message; };
const trigger = $('#menuTrigger'), drawer = $('#siteDrawer'), backdrop = $('#drawerBackdrop');
const background = [$('.header'), $('main'), $('.footer'), $('.skip-link')];
let drawerOpen = false, previousFocus;
document.body.appendChild(trigger);
function setDrawer(open) {
  drawerOpen = open;
  if (open) previousFocus = document.activeElement;
  drawer.inert = !open;
  drawer.setAttribute('aria-hidden', String(!open));
  trigger.setAttribute('aria-expanded', String(open));
  trigger.setAttribute('aria-label', open ? text('메뉴 닫기', 'Close menu') : text('메뉴 열기', 'Open menu'));
  if (open) drawer.prepend(trigger); else document.body.appendChild(trigger);
  for (const node of background) node.inert = open;
  document.body.classList.toggle('drawer-open', open);
  document.documentElement.classList.toggle('drawer-open', open);
  drawer.classList.toggle('is-open', open);
  backdrop.classList.toggle('is-open', open);
  window.dispatchEvent(new Event('scene-visibilitychange'));
  if (open) trigger.focus(); else if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  syncCarousel();
}
trigger.addEventListener('click', () => setDrawer(!drawerOpen));
backdrop.addEventListener('click', () => setDrawer(false));
$$('.drawer-link', drawer).forEach(link => link.addEventListener('click', () => setDrawer(false)));
document.addEventListener('keydown', event => {
  if (drawerOpen && event.key === 'Escape') { event.preventDefault(); setDrawer(false); }
  if (drawerOpen && event.key === 'Tab') {
    const items = $$('a[href],button:not(:disabled)', drawer).filter(el => el.offsetParent !== null);
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

function setLdm(enabled) {
  ldmEnabled = enabled;
  document.body.classList.toggle('ldm-mode', enabled);
  $('#ldmToggle').setAttribute('aria-pressed', String(enabled));
  $('#ldmToggle').setAttribute('aria-label', enabled ? text('저사양 모드 끄기', 'Disable low detail mode') : text('저사양 모드 켜기', 'Enable low detail mode'));
  $('#ldmStatus').textContent = enabled ? text('켬', 'On') : text('끔', 'Off');
  try { localStorage.setItem('muntang-ldm', enabled ? '1' : '0'); } catch { /* Storage is optional. */ }
  window.dispatchEvent(new Event('ldmchange'));
  syncCarousel();
}
$('#ldmToggle').addEventListener('click', () => setLdm(!ldmEnabled));

let storyPending = false;
function fitStory() {
  const section = $('#showreel'), sticky = $('#storySticky'), track = $('#storyTrack');
  const vertical = innerWidth <= 760 || reduced || ldmEnabled;
  section.classList.toggle('story-vertical', vertical);
  if (vertical) {
    section.style.height = 'auto'; track.style.transform = 'none';
    $$('.story-panel', track).forEach(panel => panel.classList.add('is-active'));
    return;
  }
  const distance = Math.max(0, track.scrollWidth - sticky.clientWidth);
  section.style.height = (sticky.clientHeight + distance) + 'px';
  const progress = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / (distance || 1)));
  track.style.transform = `translate3d(${-distance * progress}px,0,0)`;
  let nearest = 0, delta = Infinity;
  $$('.story-panel', track).forEach((panel, i) => {
    const d = Math.abs(panel.offsetLeft + panel.offsetWidth / 2 - (distance * progress + sticky.clientWidth / 2));
    if (d < delta) { nearest = i; delta = d; }
  });
  $$('.story-panel', track).forEach((panel, i) => panel.classList.toggle('is-active', i === nearest));
  $('#storyCurrent').textContent = String(nearest + 1).padStart(2, '0');
  $('#storyProgress').style.transform = `scaleX(${progress})`;
  $('#storyProgressDot').style.left = `${progress * 100}%`;
}
function updateScroll() {
  if (storyPending) return;
  storyPending = true;
  requestAnimationFrame(() => {
    storyPending = false;
    const range = document.documentElement.scrollHeight - innerHeight;
    $('#progressBar').style.transform = `scaleX(${range > 0 ? scrollY / range : 0})`;
    fitStory();
  });
}
window.addEventListener('scroll', updateScroll, { passive: true });
window.addEventListener('resize', updateScroll, { passive: true });
window.addEventListener('load', updateScroll, { once: true });
document.fonts?.ready.then(updateScroll);
const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
}, { threshold: .05 }) : null;
$$('[data-reveal]').forEach(node => { if (observer && !reduced) observer.observe(node); else node.classList.add('is-visible'); });
if ('IntersectionObserver' in window) new IntersectionObserver(entries => $('#showreel').classList.toggle('story-in-view', entries[0].isIntersecting)).observe($('#storySticky'));

function create(tag, cls, value) { const node = document.createElement(tag); if (cls) node.className = cls; if (value !== undefined) node.textContent = value; return node; }
function thumbnail(image, video) {
  const base = 'https://i.ytimg.com/vi/' + video.id + '/';
  let attempt = 0;
  image.src = /^https:\/\/i\.ytimg\.com\//.test(video.thumbnail_url || '') ? video.thumbnail_url : base + 'hqdefault.jpg';
  image.alt = video.title;
  image.decoding = 'async';
  image.onerror = () => { if (++attempt < 3) image.src = base + (attempt === 1 ? 'mqdefault.jpg' : 'default.jpg'); else image.onerror = null; };
}

const grid = $('#videoGrid'), search = $('#videoSearch'), status = $('#archiveStatus'), loadButton = $('#loadMore');
let videos = [], tokens = { videos: '', shorts: '' }, complete = { videos: false, shorts: false };
let filter = 'all', loading = false, loadError = false, catalogStatus = 'stale', activeInlineFrame = null, activeVideoId = '';
let heroVideos = [], carouselIndex = 0, heroTimer = 0, heroInView = true, heroHover = false, heroFocused = false, userPaused = false;
try { const node = $('#videoBootstrap'); const data = JSON.parse(node.content.textContent || node.textContent); videos = mergeVideos([], data.videos); } catch { /* The static links remain available if bootstrap fails. */ }

function closePlayer({ restoreFocus = true } = {}) {
  if (!activeInlineFrame) return;
  const frame = activeInlineFrame;
  frame.replaceChildren(...frame._originalNodes);
  delete frame._originalNodes;
  frame.classList.remove('inline-playing');
  frame.setAttribute('role', 'button'); frame.tabIndex = 0;
  frame.setAttribute('aria-label', frame.dataset.videoTitle + ' — ' + text('페이지 안에서 재생', 'Play on this page'));
  activeInlineFrame = null; activeVideoId = '';
  document.body.classList.remove('video-playing');
  window.dispatchEvent(new Event('scene-visibilitychange'));
  if (restoreFocus && frame.isConnected) frame.focus({ preventScroll: true });
  announce(text('영상을 닫았습니다.', 'Video closed.'));
  syncCarousel();
}
function openPlayer(frame, video) {
  if (activeVideoId === video.id && activeInlineFrame === frame) return;
  closePlayer({ restoreFocus: false });
  frame._originalNodes = [...frame.childNodes];
  frame.classList.add('inline-playing'); frame.setAttribute('role', 'region'); frame.tabIndex = -1;
  frame.setAttribute('aria-label', video.title);
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1&controls=1`;
  iframe.title = video.title + text(' 플레이어', ' player');
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  const close = create('button', 'inline-player-close', '×'); close.type = 'button'; close.setAttribute('aria-label', text('영상 닫기', 'Close video'));
  close.addEventListener('click', event => { event.stopPropagation(); closePlayer(); });
  frame.replaceChildren(iframe, close);
  activeInlineFrame = frame; activeVideoId = video.id;
  document.body.classList.add('video-playing');
  window.dispatchEvent(new Event('scene-visibilitychange'));
  close.focus({ preventScroll: true });
  announce(video.title + text(' 재생. 닫기 버튼으로 돌아갈 수 있습니다.', ' playing. Use Close video to return.'));
  syncCarousel();
}
function makeCard(video, index) {
  const card = create('article', 'video-card is-visible'), frame = create('div', 'video-frame');
  card.dataset.id = video.id; frame.dataset.videoTitle = video.title;
  frame.setAttribute('role', 'button'); frame.tabIndex = 0;
  frame.setAttribute('aria-label', video.title + ' — ' + text('페이지 안에서 재생', 'Play on this page'));
  const image = document.createElement('img'); thumbnail(image, video); image.loading = 'lazy'; image.width = 480; image.height = 360;
  frame.append(image, create('span', 'video-index', String(index + 1).padStart(2, '0')), create('span', 'video-kind', video.type === 'short' ? text('쇼츠', 'SHORTS') : text('동영상', 'VIDEO')), create('span', 'video-play', '▶'));
  frame.addEventListener('click', () => { if (!frame.classList.contains('inline-playing')) openPlayer(frame, video); });
  frame.addEventListener('keydown', event => { if (event.target === frame && ['Enter', ' '].includes(event.key)) { event.preventDefault(); openPlayer(frame, video); } });
  const copy = create('div', 'video-card-text'), title = create('div', 'video-card-title', video.title);
  const date = formatDate(video, language); if (date) title.appendChild(create('span', 'video-card-date', date));
  const link = create('a', 'video-card-arrow', '↗'); link.href = video.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.setAttribute('aria-label', video.title + ' — ' + text('유튜브에서 열기', 'Open on YouTube'));
  copy.append(title, link); card.append(frame, copy); return card;
}
function renderVideos() {
  const matches = filterVideos(videos, filter, search.value);
  // Reuse the playing card when it remains in the current result set.
  const retained = activeInlineFrame?.closest('.video-card');
  const preserve = retained && matches.some(video => video.id === activeVideoId);
  const focusWasPlaying = activeInlineFrame?.contains(document.activeElement);
  if (retained && !preserve) closePlayer({ restoreFocus: false });
  if (preserve) {
    // Moving an iframe through a fragment reloads its browsing context. Leave it attached.
    for (const child of [...grid.childNodes]) if (child !== retained) child.remove();
    let afterPlayer = false;
    matches.forEach((video, index) => {
      if (video.id === activeVideoId) { afterPlayer = true; return; }
      const card = makeCard(video, index);
      if (afterPlayer) grid.appendChild(card); else grid.insertBefore(card, retained);
    });
  } else {
    const fragment = document.createDocumentFragment();
    matches.forEach((video, index) => fragment.appendChild(makeCard(video, index)));
    if (!matches.length) fragment.appendChild(create('div', 'video-empty', text('불러온 영상에서 검색 결과가 없습니다.', 'No matches among the loaded videos.')));
    grid.replaceChildren(fragment);
  }
  if (focusWasPlaying && !preserve) search.focus({ preventScroll: true });
  $('#videoCount').textContent = String(matches.length).padStart(2, '0');
  $('#videoCountSuffix').textContent = text('개 영상', 'videos');
  const suffix = loadError ? text(' · 불러오지 못했습니다. 다시 시도해 주세요.', ' · Could not update. Please try again.') : catalogStatus === 'stale' ? text(' · 저장된 목록입니다. 최신 정보를 확인합니다.', ' · Saved list; checking for updates.') : catalogStatus === 'degraded' ? text(' · 일부 정보를 일시적으로 확인할 수 없습니다.', ' · Some details are temporarily unavailable.') : '';
  status.textContent = (en ? `Showing ${matches.length} of ${videos.length} loaded videos` : `불러온 영상 ${videos.length}개 중 ${matches.length}개 표시`) + suffix;
  const remaining = pageTypes(filter, tokens);
  const uncertain = filter === 'all' ? !complete.videos || !complete.shorts : !complete[filter];
  $('#videoLoadWrap').hidden = !remaining.length && !uncertain && !loadError;
  loadButton.disabled = loading;
  loadButton.textContent = loading ? text('불러오는 중…', 'Loading…') : loadError ? text('불러오기 실패 · 다시 시도', 'Could not load · Try again') : remaining.length ? text('목록 더 불러오기', 'Load more videos') : text('목록 새로 확인', 'Refresh list');
  $('#videoGrid').setAttribute('aria-busy', String(loading));
  $$('[data-video-filter]').forEach(button => { const active = button.dataset.videoFilter === filter; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
}

function refreshHero() {
  const currentId = heroVideos[carouselIndex]?.id;
  heroVideos = videos.filter(video => video.type !== 'short');
  if (!heroVideos.length) return;
  carouselIndex = Math.max(0, heroVideos.findIndex(video => video.id === currentId));
  paintHero(); syncCarousel();
}
function paintHero() {
  if (!heroVideos.length) return;
  [$('#heroVideo'), $('#heroPeek')].forEach((card, i) => {
    const video = heroVideos[(carouselIndex + i) % heroVideos.length];
    card.classList.add('hero-card-live'); card.setAttribute('aria-label', video.title + ' — ' + text('재생', 'Play'));
    thumbnail($('img', card), video);
    $(i ? '#peekTitle' : '#heroTitle', card).textContent = video.title;
    card.dataset.videoId = video.id;
    if (i) $('#peekIndex').textContent = String((carouselIndex + 1) % heroVideos.length + 1).padStart(2, '0');
  });
  $('#heroIndex').textContent = String(carouselIndex + 1).padStart(2, '0');
  $('#heroTotal').textContent = String(heroVideos.length).padStart(2, '0');
}
function advanceHero(direction, manual = false) {
  if (!heroVideos.length) return;
  carouselIndex = (carouselIndex + direction + heroVideos.length) % heroVideos.length; paintHero();
  if (manual) $('#heroCarouselStatus').textContent = heroVideos[carouselIndex].title;
}
function syncCarousel() {
  clearInterval(heroTimer); heroTimer = 0;
  const paused = userPaused || reduced || ldmEnabled || drawerOpen || activeInlineFrame || document.hidden || !heroInView || heroHover || heroFocused;
  $('#heroPause').textContent = reduced || ldmEnabled ? text('자동 전환 꺼짐', 'Slideshow off') : userPaused ? text('자동 전환 시작', 'Start slideshow') : text('자동 전환 정지', 'Pause slideshow');
  $('#heroPause').setAttribute('aria-pressed', String(userPaused));
  $('#heroPause').disabled = reduced || ldmEnabled;
  $('#heroTimerProgress').style.transform = paused ? 'scaleX(0)' : 'scaleX(1)';
  if (!paused && heroVideos.length > 1) heroTimer = setInterval(() => advanceHero(1), 6400);
}
$('#heroPrevious').addEventListener('click', () => { advanceHero(-1, true); syncCarousel(); });
$('#heroNext').addEventListener('click', () => { advanceHero(1, true); syncCarousel(); });
$('#heroPause').addEventListener('click', () => { userPaused = !userPaused; syncCarousel(); });
const stage = $('#heroStage');
stage.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { heroHover = true; syncCarousel(); } });
stage.addEventListener('pointerleave', () => { heroHover = false; syncCarousel(); });
stage.addEventListener('focusin', () => { heroFocused = true; syncCarousel(); });
stage.addEventListener('focusout', event => { heroFocused = stage.contains(event.relatedTarget); syncCarousel(); });
if ('IntersectionObserver' in window) new IntersectionObserver(entries => { heroInView = entries[0].isIntersecting; syncCarousel(); }).observe(stage);
document.addEventListener('visibilitychange', syncCarousel);
motion.addEventListener('change', () => { reduced = motion.matches; window.dispatchEvent(new Event('ldmchange')); updateScroll(); syncCarousel(); });
window.addEventListener('ldmchange', updateScroll);
[$('#heroVideo'), $('#heroPeek')].forEach(card => {
  const play = () => {
    const video = videos.find(video => video.id === card.dataset.videoId); if (!video) return;
    filter = 'videos'; search.value = ''; renderVideos();
    const frame = $$('[data-id]', grid).find(node => node.dataset.id === video.id)?.querySelector('.video-frame');
    if (frame) { frame.scrollIntoView({ behavior: reduced || ldmEnabled ? 'auto' : 'smooth', block: 'center' }); openPlayer(frame, video); }
  };
  card.addEventListener('click', event => { if (!event.target.closest('a')) play(); });
  card.addEventListener('keydown', event => { if (event.target === card && ['Enter', ' '].includes(event.key)) { event.preventDefault(); play(); } });
});
document.addEventListener('keydown', event => { if (event.key === 'Escape' && activeInlineFrame) { event.preventDefault(); closePlayer(); } });

let fetchController, refreshTimer = 0, refreshChecks = 0;
async function loadMore(initial = false) {
  if (loading) return;
  const types = pageTypes(filter, tokens);
  const type = !initial && types[0];
  loading = true; loadError = false; renderVideos();
  fetchController = new AbortController();
  const timeout = setTimeout(() => fetchController.abort(), 15000);
  try {
    const params = new URLSearchParams({ hl: language });
    if (type) { params.set('type', type); params.set('continuation', tokens[type]); }
    const response = await fetch('/api/youtube?' + params, { signal: fetchController.signal, headers: { Accept: 'application/json' } });
    const data = await response.json();
    if (!response.ok || !data.ok || data.language !== language) throw new Error('CatalogUnavailable');
    videos = initial || !type ? mergeVideos([], data.videos) : mergeVideos(videos, data.videos);
    tokens = { ...tokens, ...(data.nextContinuations || {}) };
    complete = { ...complete, ...(data.complete || {}) };
    catalogStatus = data.status || 'degraded';
    refreshHero();
    if (!type && data.status === 'stale' && data.warnings?.includes('refreshing') && refreshChecks++ < 2) {
      clearTimeout(refreshTimer); refreshTimer = setTimeout(() => loadMore(true), 7500);
    }
  } catch (error) {
    if (error.name !== 'AbortError' || !document.hidden) loadError = true;
  } finally { clearTimeout(timeout); loading = false; renderVideos(); }
}
search.addEventListener('input', renderVideos);
$$('[data-video-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.videoFilter; renderVideos(); }));
loadButton.addEventListener('click', () => loadMore(false));
window.addEventListener('pagehide', () => { fetchController?.abort(); clearTimeout(refreshTimer); clearInterval(heroTimer); });
setLdm(ldmEnabled);
initScene($, () => reduced, () => ldmEnabled);
renderVideos(); refreshHero(); updateScroll(); loadMore(true);
