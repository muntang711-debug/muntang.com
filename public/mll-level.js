import { renderDetail } from './mll-view.js';
import { initMllShell } from './mll-shell.js';
import { fetchDemonlist } from './mll-data.js';

const $ = selector => document.querySelector(selector);
const language = document.documentElement.lang === 'en' ? 'en' : 'ko', en = language === 'en';
const rank = Number(document.body.dataset.rank), base = en ? '/en/mll' : '/mll';
const shell = initMllShell(language);
let key = '', loading = false, lastRequestAt = 0;
$('#previousLevel').hidden = rank === 1; $('#previousLevel').href = base + '/' + (rank - 1);
$('#nextLevel').hidden = rank === 150; $('#nextLevel').href = base + '/' + (rank + 1);
async function refresh() {
  if (loading) return;
  loading = true; lastRequestAt = Date.now(); $('#retryLevel').disabled = true;
  try {
    const data = await fetchDemonlist();
    const demon = data.demons.find(demon => demon.position === rank);
    if (!demon) throw new Error('LevelUnavailable');
    const nextKey = JSON.stringify(demon);
    if (key !== nextKey) {
      $('#levelDetail').innerHTML = renderDetail(demon, language, 'h1');
      key = nextKey;
      document.title = `#${rank} ${demon.name} · MLL`;
    }
    $('#levelStatus').textContent = data.status === 'stale' ? (en ? 'Updates are delayed. Showing the last verified ranking.' : '최근 갱신이 지연되어 마지막으로 확인한 순위를 표시합니다.') : '';
    $('#retryLevel').hidden = true;
    shell.progress();
  } catch {
    $('#levelStatus').textContent = en ? 'Could not refresh level information. Please try again.' : '레벨 정보를 불러오지 못했습니다. 다시 시도해 주세요.';
    $('#retryLevel').hidden = false;
  } finally { loading = false; $('#retryLevel').disabled = false; }
}
$('#retryLevel').addEventListener('click', refresh);
setInterval(() => {if (!document.hidden) void refresh();}, 300000);
document.addEventListener('visibilitychange', () => {if (!document.hidden && Date.now()-lastRequestAt>=300000) void refresh();});
void refresh();
