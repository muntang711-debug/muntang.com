import { filterDemons, renderRows } from './mll-view.js';
import { initMllShell } from './mll-shell.js';
import { fetchDemonlist, showCheckedAt } from './mll-data.js';

const $ = selector => document.querySelector(selector);
const language = document.documentElement.lang === 'en' ? 'en' : 'ko', en = language === 'en';
const text = (ko, english) => en ? english : ko;
const shell = initMllShell(language);
let snapshot = { demons: [] }, loading = false, lastRequestAt = 0;
const rows = $('#demonRows'), search = $('#levelSearch');

function render(entering = false) {
  const demons = filterDemons(snapshot.demons, search.value);
  const focusedHref = document.activeElement?.closest('.level-row a')?.getAttribute('href');
  rows.innerHTML = renderRows(demons, null, search.value, language);
  rows.classList.toggle('is-entering', entering && shell.motionEnabled());
  if (focusedHref) [...rows.querySelectorAll('a')].find(node => node.getAttribute('href') === focusedHref)?.focus({preventScroll:true});
  $('#emptyState').hidden = demons.length > 0;
  $('#emptyState').textContent = text('검색 결과가 없습니다. 다른 검색어를 입력해 주세요.', 'No matching levels. Try another search.');
  $('#resultCount').textContent = en ? `${demons.length} levels${search.value.trim() ? ' / 150' : ''}` : `${demons.length}개 레벨${search.value.trim() ? ' / 150' : ''}`;
}
search.addEventListener('input', () => render());
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
    const data = await fetchDemonlist();
    const first = !snapshot.demons.length;
    const changed = JSON.stringify(data.demons) !== JSON.stringify(snapshot.demons);
    snapshot = data;
    showCheckedAt($('#lastChecked'), data, language);
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
