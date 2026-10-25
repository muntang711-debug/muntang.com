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
  node.textContent = (en ? 'Checked ' : '최근 확인 ') + new Intl.DateTimeFormat(en ? 'en-GB' : 'ko-KR', {hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Seoul'}).format(date);
  node.title = new Intl.DateTimeFormat(en ? 'en-GB' : 'ko-KR', {dateStyle:'medium',timeStyle:'long',timeZone:'Asia/Seoul'}).format(date) + (en ? ' · Syncs every 5 minutes' : ' · 5분마다 동기화');
  node.hidden = false;
}
