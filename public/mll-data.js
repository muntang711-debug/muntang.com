import { SYNC_INTERVAL } from '../lib/sync-config.js';

export async function fetchDemonlist() {
  const response = await fetch('/api/mll', { cache: 'no-store', signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error('ListUnavailable');
  const data = await response.json();
  if (!data.ok || data.demons?.length !== 150) throw new Error('InvalidList');
  return data;
}

export function showCheckedAt(node, data, language = 'ko') {
  const date = new Date(data.checkedAt);
  if (!Number.isFinite(date.getTime())) { node.hidden = true; return; }
  const en = language === 'en';
  node.dateTime = date.toISOString();
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23',timeZoneName:'short',timeZone:'Asia/Seoul'}).formatToParts(date).map(part => [part.type,part.value]));
  node.textContent = (en ? 'Checked ' : '최근 확인 ') + `${parts.year}.${parts.month}.${parts.day}. ${parts.hour}:${parts.minute}:${parts.second} ${parts.timeZoneName}`;
  node.title = new Intl.DateTimeFormat(en ? 'en-GB' : 'ko-KR', {dateStyle:'medium',timeStyle:'long',timeZone:'Asia/Seoul'}).format(date) + (en ? ` · Syncs every ${SYNC_INTERVAL / 60000} minutes` : ` · ${SYNC_INTERVAL / 60000}분마다 동기화`);
  node.hidden = false;
}
