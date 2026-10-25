import { createSlideClock, createFpsSampler } from './motion-clock.js';
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
  if (open) $('.drawer-head', drawer).appendChild(trigger); else document.body.appendChild(trigger);
  for (const node of background) node.inert = open;
  document.body.classList.toggle('drawer-open', open);
  document.documentElement.classList.toggle('drawer-open', open);
  drawer.classList.toggle('is-open', open);
  backdrop.classList.toggle('is-open', open);
  window.dispatchEvent(new Event('scene-visibilitychange'));
  if (open) requestAnimationFrame(() => { if (drawerOpen) $('.drawer-link', drawer)?.focus({ preventScroll: true }); });
  else if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  syncCarousel();
}
trigger.addEventListener('click', () => setDrawer(!drawerOpen));
backdrop.addEventListener('click', () => setDrawer(false));
$$('a[href]', drawer).forEach(link => link.addEventListener('click', () => setDrawer(false)));
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
let filter = 'all', loading = false, loadError = false, catalogStatus = 'stale', modalOpen = false, activeVideoId = '';
let heroVideos = [], carouselIndex = 0, heroInView = true, heroFocused = false, userPaused = false;
try { const node = $('#videoBootstrap'); const data = JSON.parse(node.content.textContent || node.textContent); videos = mergeVideos([], data.videos); } catch { /* The static links remain available if bootstrap fails. */ }

const videoModal = $('#videoModal'), videoFrame = $('#videoModalFrame'), modalClose = $('#videoModalClose');
let modalReturnFocus, modalCloseTimer = 0, modalBackground = [];
function closePlayer() {
  if (!modalOpen) return;
  modalOpen = false;
  videoModal.classList.remove('is-open');
  videoFrame.src = 'about:blank';
  document.body.classList.remove('video-playing', 'video-modal-open');
  document.documentElement.classList.remove('video-modal-open');
  for (const [node, wasInert] of modalBackground) node.inert = wasInert;
  modalBackground = [];
  const fallback = $$('[data-id]', grid).find(node => node.dataset.id === activeVideoId)?.querySelector('.video-frame');
  const returnTo = modalReturnFocus?.isConnected ? modalReturnFocus : fallback;
  returnTo?.focus({ preventScroll: true });
  modalReturnFocus = null;
  videoModal.setAttribute('aria-hidden', 'true');
  clearTimeout(modalCloseTimer);
  modalCloseTimer = setTimeout(() => { videoModal.hidden = true; }, reduced || ldmEnabled ? 0 : 360);
  window.dispatchEvent(new Event('scene-visibilitychange'));
  announce(text('영상을 닫았습니다.', 'Video closed.'));
  syncCarousel();
}
function openPlayer(card, video) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(video.id)) return;
  if (heroTransitionBusy) settleHeroTransition();
  clearTimeout(modalCloseTimer);
  if (!modalOpen) {
    modalReturnFocus = card;
    modalBackground = [...background, trigger, drawer, backdrop].map(node => [node, node.inert]);
    for (const [node] of modalBackground) node.inert = true;
  }
  modalOpen = true; activeVideoId = video.id;
  $('#ldmSuggestion').hidden = true;
  $('#videoModalTitle').textContent = video.title;
  $('#videoModalExternal').href = video.url || 'https://www.youtube.com/watch?v=' + video.id;
  videoFrame.title = video.title + text(' 플레이어', ' player');
  videoFrame.src = 'https://www.youtube-nocookie.com/embed/' + video.id + '?autoplay=1&rel=0&playsinline=1&controls=1';
  videoModal.hidden = false;
  videoModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('video-playing', 'video-modal-open');
  document.documentElement.classList.add('video-modal-open');
  window.dispatchEvent(new Event('scene-visibilitychange'));
  requestAnimationFrame(() => { if (modalOpen) { videoModal.classList.add('is-open'); modalClose.focus({ preventScroll: true }); } });
  announce(video.title + text(' 재생. Escape로 닫을 수 있습니다.', ' playing. Press Escape to close.'));
  syncCarousel();
}
modalClose.addEventListener('click', closePlayer);
videoModal.addEventListener('click', event => { if (event.target === videoModal || event.target.closest('[data-modal-dismiss]')) closePlayer(); });
document.addEventListener('keydown', event => {
  if (!modalOpen) return;
  if (event.key === 'Escape') { event.preventDefault(); closePlayer(); return; }
  if (event.key === 'Tab') {
    const items = $$('a[href],button:not(:disabled),iframe', videoModal);
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
function makeCard(video, index) {
  const card = create('article', 'video-card is-visible'), frame = create('div', 'video-frame');
  card.dataset.id = video.id; frame.dataset.videoTitle = video.title;
  frame.setAttribute('role', 'button'); frame.tabIndex = 0;
  frame.setAttribute('aria-label', video.title + ' — ' + text('팝업에서 재생', 'Play in popup'));
  const image = document.createElement('img'); thumbnail(image, video); image.loading = 'lazy'; image.width = 480; image.height = 360;
  frame.append(image, create('span', 'video-index', String(index + 1).padStart(2, '0')), create('span', 'video-kind', video.type === 'short' ? text('쇼츠', 'SHORTS') : text('동영상', 'VIDEO')), create('span', 'video-play', '▶'));
  frame.addEventListener('click', () => { openPlayer(frame, video); });
  frame.addEventListener('keydown', event => { if (event.target === frame && ['Enter', ' '].includes(event.key)) { event.preventDefault(); openPlayer(frame, video); } });
  const copy = create('div', 'video-card-text'), title = create('div', 'video-card-title', video.title);
  const date = formatDate(video, language); if (date) title.appendChild(create('span', 'video-card-date', date));
  card.addEventListener('click', event => { if (!event.target.closest('.video-frame,a')) openPlayer(frame, video); });
  const link = create('a', 'video-card-arrow', '↗'); link.href = video.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.setAttribute('aria-label', video.title + ' — ' + text('유튜브에서 열기', 'Open on YouTube'));
  copy.append(title, link); card.append(frame, copy); return card;
}
function renderVideos() {
  const matches = filterVideos(videos, filter, search.value);
  const fragment = document.createDocumentFragment();
  matches.forEach((video, index) => fragment.appendChild(makeCard(video, index)));
  if (!matches.length) fragment.appendChild(create('div', 'video-empty', text('불러온 영상에서 검색 결과가 없습니다.', 'No matches among the loaded videos.')));
  grid.replaceChildren(fragment);
  $('#videoCount').textContent = String(matches.length).padStart(2, '0');
  $('#videoCountSuffix').textContent = text('개 영상', 'videos');
  status.textContent = loadError ? text('불러오지 못했습니다. 다시 시도해 주세요.', 'Could not update. Please try again.') : '';
  status.parentElement.hidden = !loadError;
  const remaining = pageTypes(filter, tokens);
  const uncertain = filter === 'all' ? !complete.videos || !complete.shorts : !complete[filter];
  $('#videoLoadWrap').hidden = !remaining.length && !uncertain && !loadError;
  loadButton.disabled = loading;
  loadButton.textContent = loading ? text('불러오는 중…', 'Loading…') : loadError ? text('불러오기 실패 · 다시 시도', 'Could not load · Try again') : remaining.length ? text('목록 더 불러오기', 'Load more videos') : text('목록 새로 확인', 'Refresh list');
  $('#videoGrid').setAttribute('aria-busy', String(loading));
  $$('[data-video-filter]').forEach(button => { const active = button.dataset.videoFilter === filter; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
}

let heroTransitionBusy = false;
const heroCards = [$('#heroVideo'), $('#heroPeek')];
const transitionTimeouts = new Set();
let transitionFrame = 0;
function scheduleHeroTransitionTimeout(callback, delay) {
  const id = setTimeout(() => { transitionTimeouts.delete(id); callback(); }, delay);
  transitionTimeouts.add(id);
}
function settleHeroTransition() {
  for (const id of transitionTimeouts) clearTimeout(id);
  transitionTimeouts.clear(); cancelAnimationFrame(transitionFrame);
  heroTransitionBusy = false;
  heroCards.forEach((card, i) => { card.removeAttribute('style'); card.classList.remove('hero-handoff-flight', 'hero-return-flight', 'hero-role-settle'); card.id = i ? 'heroPeek' : 'heroVideo'; });
  paintHero();
}
window.addEventListener('resize', () => { if (heroTransitionBusy) settleHeroTransition(); }, { passive: true });
function renderHeroRole(card,video,role,suppressEntrance,stagedUI){
  if(!card||!video)return;
  var keepFlight=card.classList.contains('hero-handoff-flight');
  var keepReturn=card.classList.contains('hero-return-flight');
  var main=role==='main';
  card.id=main?'heroVideo':'heroPeek';
  card.className=main?'feature-card':'float-card';
  if(keepFlight)card.classList.add('hero-handoff-flight');
  if(keepReturn)card.classList.add('hero-return-flight');
  if(suppressEntrance)card.classList.add('hero-card-live');
  var retainedImage=card.querySelector('img');
  card.removeAttribute('href');
  card.dataset.videoId=video.id;
  card.dataset.videoTitle=video.title||'';
  card.dataset.videoUrl=video.url||'';
  card.dataset.videoType=video.type||'';
  card.setAttribute('role','button');
  card.setAttribute('tabindex','0');
  card.setAttribute('aria-label',(video.title||text('영상', 'Video'))+' '+text('재생', 'Play'));
  card.textContent='';
  var imageWrap=create('div',main?'feature-image':'float-image');
  if(stagedUI&&!main)imageWrap.classList.add('hero-preview-enter');
  var image=(retainedImage&&(retainedImage.getAttribute('src')===video.thumbnail_url||retainedImage.src===video.thumbnail_url))?retainedImage:document.createElement('img');
  image.id=main?'heroThumbnail':'peekThumbnail';
  thumbnail(image,video);
  image.alt=(video.title||text('영상', 'Video'))+' '+text('썸네일', 'thumbnail');
  image.decoding='async';
  imageWrap.appendChild(image);
  if(main){
    var play=create('span','feature-play');
    play.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.4c0-.8.87-1.28 1.56-.86l10.04 5.74a1.98 1.98 0 0 1 0 3.44l-10.04 5.74A1.04 1.04 0 0 1 8 18.6V5.4Z"/></svg>';
    if(stagedUI)play.classList.add('hero-ui-enter','hero-play-enter');
    imageWrap.appendChild(play);
  }else{
    imageWrap.appendChild(create('span','float-orb',''));
  }
  card.appendChild(imageWrap);
  if(main){
    var info=create('div','feature-info');
    var title=create('div','feature-title',video.title||text('영상', 'Video'));
    title.id='heroTitle';
    if(stagedUI)title.classList.add('hero-ui-enter','hero-title-enter');
    info.appendChild(title);
    var external=create('a','feature-arrow','↗');
    external.href=video.url||('https://www.youtube.com/watch?v='+encodeURIComponent(video.id));
    external.target='_blank';
    external.rel='noopener noreferrer';
    external.dataset.externalVideo='true';
    external.setAttribute('aria-label',text('유튜브에서 열기', 'Open on YouTube'));
    if(stagedUI)external.classList.add('hero-ui-enter','hero-arrow-enter');
    info.appendChild(external);
    card.appendChild(info);
  }else{
    var infoSmall=create('div','float-info');
    var smallTitle=create('span','peek-video-title',video.title||text('영상', 'Video'));
    smallTitle.id='peekTitle';
    var no=create('span','float-index','');
    no.id='peekIndex';
    infoSmall.appendChild(smallTitle);
    infoSmall.appendChild(no);
    if(stagedUI){infoSmall.classList.add('hero-preview-enter');smallTitle.classList.add('hero-preview-enter');no.classList.add('hero-preview-enter');}
    card.appendChild(infoSmall);
  }
  if(stagedUI){
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        card.querySelectorAll('.hero-ui-enter,.hero-preview-enter').forEach(function(node){node.classList.add('is-entered');});
      });
    });
  }
}

function refreshHero() {
  const currentId = heroVideos[carouselIndex]?.id;
  const next = videos.filter(video => video.type !== 'short');
  const changed = next.map(v => v.id).join(',') !== heroVideos.map(v => v.id).join(',');
  heroVideos = next;
  if (!heroVideos.length) return;
  carouselIndex = Math.max(0, heroVideos.findIndex(video => video.id === currentId));
  if (changed || !heroTransitionBusy) {
    if (heroTransitionBusy) settleHeroTransition(); else paintHero();
  }
  preloadHeroThumbnail(heroVideos[(carouselIndex + 1) % heroVideos.length]);
  syncCarousel();
}
function paintHero() {
  if (!heroVideos.length) return;
  renderHeroRole($('#heroVideo'),heroVideos[carouselIndex],'main',true);
  renderHeroRole($('#heroPeek'),heroVideos[(carouselIndex+1)%heroVideos.length],'small',true);
  $('#heroIndex').textContent = String(carouselIndex+1).padStart(2,'0');
  $('#heroTotal').textContent = String(heroVideos.length).padStart(2,'0');
  $('#peekIndex').textContent = String((carouselIndex+1)%heroVideos.length+1).padStart(2,'0');
}
function advanceHero(direction = 1, manual = false){
  if(heroTransitionBusy||heroVideos.length<2||document.visibilityState==='hidden')return false;
  if(modalOpen)return false;
  var main=$('#heroVideo'),small=$('#heroPeek');
  if(!main||!small)return false;
  var nextIndex=(carouselIndex+direction+heroVideos.length)%heroVideos.length;
  var nextVideo=heroVideos[nextIndex],following=heroVideos[(nextIndex+1)%heroVideos.length];
  if(ldmEnabled || reduced){
    carouselIndex=nextIndex;
    paintHero();
    slideClock.reset();
    if(manual) $('#heroCarouselStatus').textContent=nextVideo.title;
    return true;
  }
  preloadHeroThumbnail(following);
  preloadHeroThumbnail(nextVideo);
  slideClock.reset();
  if(manual) $('#heroCarouselStatus').textContent=nextVideo.title;
  var origin={left:small.offsetLeft,top:small.offsetTop,width:small.offsetWidth,height:small.offsetHeight};
  var target={left:main.offsetLeft,top:main.offsetTop,width:main.offsetWidth,height:main.offsetHeight};
  heroTransitionBusy=true;
  // Update the counter as soon as the next card starts moving.
  carouselIndex=nextIndex;
  var heroIndexNode=$('#heroIndex');
  if(heroIndexNode)heroIndexNode.textContent=String(nextIndex+1).padStart(2,'0');
  if (direction < 0) {
    retreatHero(main, small, target, origin, nextVideo, following);
    return true;
  }
  small.style.position='absolute';
  small.style.left=origin.left+'px';small.style.top=origin.top+'px';
  small.style.right='auto';small.style.bottom='auto';
  small.style.width=origin.width+'px';small.style.height=origin.height+'px';
  small.style.margin='0';small.style.boxSizing='border-box';
  small.style.transformOrigin='center center';
  small.style.transform='rotate(-9deg)';
  small.style.transition='none';
  small.style.animation='none';
  small.style.zIndex='12';
  small.style.pointerEvents='none';
  void small.offsetWidth;
  small.style.transition='left .82s cubic-bezier(.2,.8,.2,1),top .82s cubic-bezier(.2,.8,.2,1),width .82s cubic-bezier(.2,.8,.2,1),height .82s cubic-bezier(.2,.8,.2,1),transform .82s cubic-bezier(.2,.8,.2,1),padding .82s cubic-bezier(.2,.8,.2,1),box-shadow .82s cubic-bezier(.2,.8,.2,1)';
  small.classList.add('hero-handoff-flight');
  main.style.transition='opacity .62s ease,transform .82s cubic-bezier(.2,.8,.2,1)';
  main.style.pointerEvents='none';
  transitionFrame = requestAnimationFrame(function(){
    small.style.left=target.left+'px';small.style.top=target.top+'px';
    small.style.width=target.width+'px';small.style.height=target.height+'px';
    small.style.transform='rotateY(-10deg) rotateZ(2.1deg)';
    main.style.opacity='0';
    main.style.transform='translate3d(-14px,8px,0) scale(.975)';
  });
  scheduleHeroTransitionTimeout(function(){
    var oldInfo=small.querySelector('.float-info');
    var oldOrb=small.querySelector('.float-orb');
    [oldInfo,oldOrb].forEach(function(node){
      if(!node)return;
      node.style.transition='opacity .18s ease,transform .22s ease,filter .22s ease';
      node.style.opacity='0';
      node.style.transform='translate3d(0,8px,0) scale(.94)';
      node.style.filter='blur(3px)';
    });
  },500);
  scheduleHeroTransitionTimeout(function(){
    main.id='heroVideo-outgoing';
    renderHeroRole(small,nextVideo,'main',true,true);
  },620);
  scheduleHeroTransitionTimeout(function(){
    small.classList.remove('hero-handoff-flight');
    small.removeAttribute('style');
    main.removeAttribute('style');
    main.id='heroPeek';
    renderHeroRole(main,following,'small',true,true);
    main.style.opacity='0';
    main.style.transform='translate3d(0,13px,0) scale(.9) rotate(-5deg)';
    main.style.transition='opacity .48s ease,transform .58s cubic-bezier(.2,.8,.2,1)';
    transitionFrame = requestAnimationFrame(function(){
      main.style.opacity='1';
      main.style.transform='rotate(-9deg)';
    });
    var heroTotalNode=$('#heroTotal'),peekIndexNode=$('#peekIndex');
    if(heroTotalNode)heroTotalNode.textContent=String(heroVideos.length).padStart(2,'0');
    if(peekIndexNode)peekIndexNode.textContent=String((heroVideos.findIndex(function(item){return item.id===following.id;})+1)||1).padStart(2,'0');
    preloadHeroThumbnail(heroVideos[(carouselIndex+2)%heroVideos.length]);
    scheduleHeroTransitionTimeout(function(){
      main.removeAttribute('style');
      heroTransitionBusy=false;
    },620);
  },900);
  return true;
}

function retreatHero(main, small, origin, target, previousVideo, currentVideo) {
  // Keep the current image on the same node as it travels back to the preview slot.
  const rotation = getComputedStyle(main).transform;
  const previewRotation = getComputedStyle(small).transform;
  const previewStyle = getComputedStyle(small);
  const scaleX = target.width / origin.width, scaleY = target.height / origin.height;
  const padding = [previewStyle.paddingTop, previewStyle.paddingRight, previewStyle.paddingBottom, previewStyle.paddingLeft]
    .map((value, index) => parseFloat(value) / (index % 2 ? scaleX : scaleY) + 'px').join(' ');
  Object.assign(main.style, {
    left: origin.left + 'px', top: origin.top + 'px', right: 'auto', bottom: 'auto',
    width: origin.width + 'px', height: origin.height + 'px', margin: '0',
    boxSizing: 'border-box', transformOrigin: 'center center', transform: rotation, transition: 'none',
    animation: 'none', zIndex: '12', pointerEvents: 'none',
  });
  main.classList.add('hero-return-flight');
  small.style.transition = 'opacity .24s ease';
  small.style.pointerEvents = 'none';
  void main.offsetWidth;
  main.style.transition = 'left .82s cubic-bezier(.2,.8,.2,1),top .82s cubic-bezier(.2,.8,.2,1),transform .82s cubic-bezier(.2,.8,.2,1),padding .82s cubic-bezier(.2,.8,.2,1)';
  transitionFrame = requestAnimationFrame(() => {
    // Scale the entire card, including its text and controls, without reflowing the title.
    Object.assign(main.style, {
      left: target.left - (origin.width - target.width) / 2 + 'px',
      top: target.top - (origin.height - target.height) / 2 + 'px',
      transform: previewRotation + ` scale(${scaleX},${scaleY})`, padding,
    });
    small.style.opacity = '0';
  });
  scheduleHeroTransitionTimeout(() => {
    main.id = 'heroVideo-outgoing';
    renderHeroRole(small, previousVideo, 'main', true, true);
    small.style.transition = 'opacity .48s ease';
    transitionFrame = requestAnimationFrame(() => { small.style.opacity = '1'; });
  }, 320);
  scheduleHeroTransitionTimeout(() => {
    for (const node of $$('.feature-info,.feature-play', main)) {
      node.style.transition = 'opacity .18s ease,transform .22s ease,filter .22s ease';
      node.style.opacity = '0';
      node.style.transform = 'translate3d(0,8px,0) scale(.94)';
      node.style.filter = 'blur(3px)';
    }
  }, 500);
  scheduleHeroTransitionTimeout(() => {
    // Change only the inner UI; keep the card, thumbnail wrapper and image attached.
    main.id = 'heroPeek';
    main.className = 'float-card hero-card-live hero-role-settle';
    const image = $('img', main), imageWrap = image.parentElement;
    image.id = 'peekThumbnail';
    imageWrap.className = 'float-image';
    $('.feature-play', imageWrap)?.remove();
    const orb = create('span', 'float-orb hero-preview-enter');
    imageWrap.appendChild(orb);
    const info = $('.feature-info', main);
    info.removeAttribute('style');
    info.className = 'float-info hero-preview-enter';
    const title = create('span', 'peek-video-title hero-preview-enter', currentVideo.title);
    title.id = 'peekTitle';
    const index = create('span', 'float-index hero-preview-enter', String((carouselIndex + 1) % heroVideos.length + 1).padStart(2, '0'));
    index.id = 'peekIndex';
    info.replaceChildren(title, index);
    main.removeAttribute('style');
    // Commit the new layout with transitions disabled before restoring hover effects.
    void main.offsetWidth;
    transitionFrame = requestAnimationFrame(() => {
      main.classList.remove('hero-role-settle');
      $$('.hero-preview-enter', main).forEach(node => node.classList.add('is-entered'));
    });
    small.removeAttribute('style');
    heroTransitionBusy = false;
  }, 900);
}

const heroPreloadedThumbnails = new Map();
function preloadHeroThumbnail(video) {
  if (!video || heroPreloadedThumbnails.has(video.id)) return;
  const image = new Image(); image.decoding = 'async';
  image.src = video.thumbnail_url;
  heroPreloadedThumbnails.set(video.id, image);
  image.decode?.().catch(() => {});
}
const slideClock = createSlideClock({
  now: () => performance.now(), request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id),
  progress: fraction => { $('#heroTimerProgress').style.transform = 'scaleX(' + fraction + ')'; },
  advance: () => advanceHero(1),
});
function syncCarousel() {
  const paused = userPaused || reduced || drawerOpen || modalOpen || document.hidden || !heroInView || heroFocused;
  const pauseButton = $('#heroPause');
  const label = reduced ? text('자동 전환 꺼짐', 'Slideshow off') : userPaused ? text('자동 전환 시작', 'Start slideshow') : text('자동 전환 정지', 'Pause slideshow');
  pauseButton.setAttribute('aria-label', label);
  pauseButton.title = label;
  $('[data-play-icon]', pauseButton).toggleAttribute('hidden', !userPaused && !reduced);
  $('[data-pause-icon]', pauseButton).toggleAttribute('hidden', userPaused || reduced);
  $('#heroPause').setAttribute('aria-pressed', String(userPaused));
  $('#heroPause').disabled = reduced;
  slideClock.setRunning(!paused && heroVideos.length > 1);
}
$('#heroPrevious').addEventListener('click', () => { advanceHero(-1, true); syncCarousel(); });
$('#heroNext').addEventListener('click', () => { advanceHero(1, true); syncCarousel(); });
$('#heroPause').addEventListener('click', () => { userPaused = !userPaused; syncCarousel(); });
const stage = $('#heroStage');
stage.addEventListener('focusin', event => { heroFocused = heroCards.includes(event.target) && event.target.matches(':focus-visible'); syncCarousel(); });
stage.addEventListener('focusout', event => { heroFocused = heroCards.includes(event.relatedTarget) && event.relatedTarget.matches(':focus-visible'); syncCarousel(); });
if ('IntersectionObserver' in window) new IntersectionObserver(entries => { heroInView = entries[0].isIntersecting; syncCarousel(); }).observe(stage);
document.addEventListener('visibilitychange', syncCarousel);
motion.addEventListener('change', () => { reduced = motion.matches; window.dispatchEvent(new Event('ldmchange')); updateScroll(); syncCarousel(); });
window.addEventListener('ldmchange', () => { if (heroTransitionBusy && (ldmEnabled || reduced)) settleHeroTransition(); updateScroll(); syncFpsMonitor(); });
[$('#heroVideo'), $('#heroPeek')].forEach(card => {
  const play = () => {
    const video = videos.find(video => video.id === card.dataset.videoId); if (!video) return;
    openPlayer(card, video);
  };
  card.addEventListener('click', event => { if (!event.target.closest('a')) play(); });
  card.addEventListener('keydown', event => { if (event.target === card && ['Enter', ' '].includes(event.key)) { event.preventDefault(); play(); } });
});

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
window.addEventListener('pagehide', () => { fetchController?.abort(); clearTimeout(refreshTimer); slideClock.setRunning(false); settleHeroTransition(); stopFpsMonitor(); });

const suggestion = $('#ldmSuggestion');
let fpsFrame = 0, fpsDismissed = false;
const fpsSampler = createFpsSampler(fps => {
  if (fpsDismissed || ldmEnabled || reduced || drawerOpen || modalOpen) return;
  $('#ldmSuggestionDetail').textContent = text('현재 약 ' + fps + ' FPS입니다. LDM을 켤까요?', 'Running at about ' + fps + ' FPS. Enable LDM?');
  suggestion.hidden = false;
});
function stopFpsMonitor() { cancelAnimationFrame(fpsFrame); fpsFrame = 0; fpsSampler.reset(); }
function syncFpsMonitor() {
  stopFpsMonitor();
  if (ldmEnabled || reduced || fpsDismissed) suggestion.hidden = true;
  if (ldmEnabled || reduced || fpsDismissed || document.hidden) return;
  const sample = time => { fpsSampler.sample(time); fpsFrame = requestAnimationFrame(sample); };
  fpsFrame = requestAnimationFrame(sample);
}
$('#ldmSuggestionEnable').addEventListener('click', () => { suggestion.hidden = true; setLdm(true); });
$('#ldmSuggestionDismiss').addEventListener('click', () => { fpsDismissed = true; suggestion.hidden = true; syncFpsMonitor(); });
document.addEventListener('visibilitychange', syncFpsMonitor);

setLdm(ldmEnabled);
initScene($, () => reduced, () => ldmEnabled);
renderVideos(); refreshHero(); updateScroll(); loadMore(true);
