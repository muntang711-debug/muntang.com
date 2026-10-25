import { filterDemons, renderRows, renderDetail } from './mll-view.js';

const $ = selector => document.querySelector(selector);
const bootstrap = $('#mllBootstrap');
let snapshot = JSON.parse(bootstrap.content.textContent || bootstrap.textContent);
let selectedId = snapshot.demons[0]?.id;
let range = 'all', loading = false, lastRequestAt = 0;
const rows = $('#demonRows'), detail = $('#levelDetail'), search = $('#levelSearch');
const filters = [...document.querySelectorAll('[data-range]')];

function render() {
  const demons = filterDemons(snapshot.demons, search.value, range);
  if (!demons.some(demon => demon.id === selectedId)) selectedId = demons[0]?.id;
  const focusedId = document.activeElement?.dataset.levelId;
  rows.innerHTML = renderRows(demons, selectedId);
  if (focusedId) rows.querySelector(`[data-level-id="${Number(focusedId)}"]`)?.focus({ preventScroll: true });
  detail.innerHTML = renderDetail(demons.find(demon => demon.id === selectedId));
  $('#noResults').hidden = demons.length > 0;
  $('#resultCount').textContent = `${demons.length}개 레벨${demons.length !== 150 ? ' / 전체 150개' : ''}`;
  rows.setAttribute('aria-label', range === 'all' ? '1위부터 150위까지' : range + '위');
}

search.addEventListener('input', render);
for (const button of filters) button.addEventListener('click', () => {
  range = button.dataset.range;
  for (const filter of filters) filter.setAttribute('aria-pressed', String(filter === button));
  render();
});
rows.addEventListener('click', event => {
  const link = event.target.closest('[data-level-id]');
  if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  selectedId = Number(link.dataset.levelId);
  render();
  if (matchMedia('(max-width: 700px)').matches) detail.scrollIntoView({ block: 'start' });
});

function showStatus(data, failed = false) {
  const fresh = !failed && data.status === 'fresh';
  const date = new Date(data.checkedAt);
  const time = Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }).format(date) : '';
  $('#syncStatus').textContent = fresh ? `최근 확인 ${time}` : `${failed ? '최신 목록 확인 실패' : '저장된 목록 표시 중'}${time ? ' · 마지막 확인 ' + time : ''}`;
  $('.sync-line').classList.toggle('is-stale', !fresh);
  $('#retrySync').hidden = fresh;
}

async function refresh() {
  if (loading) return;
  loading = true;
  lastRequestAt = Date.now();
  $('#retrySync').disabled = true;
  try {
    const response = await fetch('/api/mll', { cache: 'no-store', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('ListUnavailable');
    const data = await response.json();
    if (!data.ok || data.demons?.length !== 150) throw new Error('InvalidList');
    const changed = JSON.stringify(data.demons) !== JSON.stringify(snapshot.demons);
    snapshot = data;
    if (changed) render();
    showStatus(data);
  } catch { showStatus(snapshot, true); }
  finally { loading = false; $('#retrySync').disabled = false; }
}
$('#retrySync').addEventListener('click', refresh);
setInterval(() => { if (!document.hidden) void refresh(); }, 300000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - lastRequestAt >= 300000) void refresh(); });
void refresh();

const menu = $('#mllMenu'), menuOpen = $('#mllMenuOpen');
menuOpen.addEventListener('click', () => { menu.showModal(); menuOpen.setAttribute('aria-expanded', 'true'); });
$('#mllMenuClose').addEventListener('click', () => menu.close());
menu.addEventListener('close', () => { menuOpen.setAttribute('aria-expanded', 'false'); menuOpen.focus(); });
menu.addEventListener('click', event => {
  if (event.target.closest('a')) menu.close();
  if (event.target === menu) {
    const bounds = menu.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) menu.close();
  }
});
