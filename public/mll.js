import { filterDemons, renderRows, renderDetail } from './mll-view.js';
import { initMllShell } from './mll-shell.js';

const $ = selector => document.querySelector(selector);
const language = document.documentElement.lang === 'en' ? 'en' : 'ko', en = language === 'en';
const text = (ko, english) => en ? english : ko;
const shell = initMllShell(language);
let snapshot = { demons: [] }, selectedId, loading = false, lastRequestAt = 0, detailKey = '';
const rows = $('#demonRows'), detail = $('#levelDetail'), search = $('#levelSearch');

function render(entering = false) {
  const demons = filterDemons(snapshot.demons, search.value);
  if (!demons.some(demon => demon.id === selectedId)) selectedId = demons[0]?.id;
  const focusedId = document.activeElement?.dataset.levelId;
  rows.innerHTML = renderRows(demons, selectedId, search.value, language);
  rows.classList.toggle('is-entering', entering && shell.motionEnabled());
  if (focusedId) rows.querySelector(`[data-level-id="${Number(focusedId)}"]`)?.focus({ preventScroll: true });
  const selected = demons.find(demon => demon.id === selectedId);
  const key = JSON.stringify(selected || null);
  if (key !== detailKey) {
    detail.innerHTML = renderDetail(selected, language);
    detailKey = key;
    detail.classList.remove('is-changing');
    if (shell.motionEnabled()) { void detail.offsetWidth; detail.classList.add('is-changing'); }
  }
  detail.hidden = !selected;
  $('#emptyState').hidden = demons.length > 0;
  $('#emptyState').textContent = text('검색 결과가 없습니다. 다른 검색어를 입력해 주세요.', 'No matching levels. Try another search.');
  $('#resultCount').textContent = en ? `${demons.length} levels${search.value.trim() ? ' / 150' : ''}` : `${demons.length}개 레벨${search.value.trim() ? ' / 150' : ''}`;
  shell.progress();
}
search.addEventListener('input', () => render());
rows.addEventListener('click', event => {
  const button = event.target.closest('[data-level-id]');
  if (!button) return;
  selectedId = Number(button.dataset.levelId);
  render();
  if (matchMedia('(max-width: 760px)').matches) detail.scrollIntoView({ block: 'start', behavior: shell.motionEnabled() ? 'smooth' : 'instant' });
});
function notice(message = '', retry = false) {
  $('.list-notice').hidden = !message;
  $('#listNotice').textContent = message;
  $('#retrySync').hidden = !retry;
}
async function refresh() {
  if (loading) return;
  loading = true; lastRequestAt = Date.now();
  $('#retrySync').disabled = true;
  rows.setAttribute('aria-busy', 'true');
  try {
    const response = await fetch('/api/mll', { cache: 'no-store', signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error('ListUnavailable');
    const data = await response.json();
    if (!data.ok || data.demons?.length !== 150) throw new Error('InvalidList');
    const first = !snapshot.demons.length;
    const changed = JSON.stringify(data.demons) !== JSON.stringify(snapshot.demons);
    snapshot = data;
    if (changed) render(first);
    notice(data.status === 'stale' ? text('최근 갱신이 지연되어 마지막으로 확인한 순위를 표시합니다.', 'Updates are delayed. Showing the last verified list.') : '');
  } catch {
    notice(snapshot.demons.length ? text('갱신에 실패했습니다. 마지막으로 확인한 순위를 표시합니다.', 'Refresh failed. Showing the last verified list.') : text('데몬리스트를 불러오지 못했습니다.', 'Could not load the demonlist.'), true);
    if (!snapshot.demons.length) { $('#emptyState').textContent = ''; $('#resultCount').textContent = ''; }
  } finally {
    loading = false; $('#retrySync').disabled = false; rows.setAttribute('aria-busy', 'false');
  }
}
$('#retrySync').addEventListener('click', refresh);
setInterval(() => { if (!document.hidden) void refresh(); }, 300000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - lastRequestAt >= 300000) void refresh(); });
void refresh();
