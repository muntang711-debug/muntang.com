export const escapeHtml = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
export const labels = language => language === 'en' ? {
  publisher: 'Publisher', verifier: 'Verifier', levelId: 'Level ID', requirement: 'List requirement', source: 'View on Pointercrate',
  select: 'Show level', external: 'Open on Pointercrate', unavailable: 'No verification video available.', unpublished: 'Not published', empty: 'No matching levels.', video: 'Verification video',
} : {
  publisher: '업로더', verifier: '베리파이어', levelId: '레벨 ID', requirement: '리스트 최소 기록', source: 'Pointercrate에서 보기',
  select: '레벨 정보 보기', external: 'Pointercrate에서 열기', unavailable: '등록된 베리파이 영상이 없습니다.', unpublished: '미공개', empty: '검색 결과가 없습니다.', video: '베리파이 영상',
};

export function highlight(value, query = '') {
  const text = String(value ?? ''), needle = query.trim().toLowerCase();
  if (!needle) return escapeHtml(text);
  const lower = text.toLowerCase();
  let start = 0, result = '', index;
  while ((index = lower.indexOf(needle, start)) !== -1) {
    result += escapeHtml(text.slice(start, index)) + '<mark>' + escapeHtml(text.slice(index, index + needle.length)) + '</mark>';
    start = index + needle.length;
  }
  return result + escapeHtml(text.slice(start));
}

export const pointercrateUrl = demon => `https://pointercrate.com/demonlist/${demon.position}/`;
export function youtubeId(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname)) return null;
    const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.pathname.startsWith('/embed/') ? url.pathname.split('/')[2] : url.searchParams.get('v');
    return /^[\w-]{11}$/.test(id || '') ? id : null;
  } catch { return null; }
}

export function filterDemons(demons, query = '') {
  const search = query.trim().toLowerCase();
  return demons.filter(demon => !search || [demon.name, demon.publisher.name, demon.level_id, '#' + demon.position]
    .some(value => String(value ?? '').toLowerCase().includes(search)));
}

export function renderRows(demons, selectedId, query = '', language = 'ko') {
  const t = labels(language), needle = query.trim().toLowerCase();
  return demons.map((demon, index) => {
    const idMatch = needle && String(demon.level_id ?? '').includes(needle);
    const video = youtubeId(demon.video);
    const thumbnail = video ? `<img src="https://i.ytimg.com/vi/${video}/hqdefault.jpg" alt="" width="480" height="270" loading="lazy" decoding="async">` : '';
    return `<li class="level-row${demon.id === selectedId ? ' is-selected' : ''}" style="--row-delay:${Math.min(index, 9) * 24}ms">
      <a class="level-select" href="${language === 'en' ? '/en/mll' : '/mll'}/${demon.position}" aria-label="${escapeHtml(t.select + ': ' + demon.name)}"><span class="level-rank">${highlight('#' + demon.position, query)}</span><span class="level-thumbnail">${thumbnail}</span><span class="level-copy"><strong class="level-name">${highlight(demon.name, query)}</strong><span class="level-publisher">${highlight(demon.publisher.name, query)}${idMatch ? `<span class="level-match">ID ${highlight(demon.level_id, query)}</span>` : ''}</span></span></a>
      <a class="level-external" href="${pointercrateUrl(demon)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(t.external + ': #' + demon.position + ' ' + demon.name)}" title="${escapeHtml(t.external)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M7 17 17 7M6 7h11v11"/></svg></a></li>`;
  }).join('');
}

export function renderDetail(demon, language = 'ko', heading = 'h2') {
  const t = labels(language);
  if (!demon) return `<p class="detail-empty">${t.empty}</p>`;
  const id = youtubeId(demon.video);
  const tag = heading === 'h1' ? 'h1' : 'h2';
  return `<div class="detail-title"><div><span class="detail-rank">#${demon.position}</span><${tag} id="detailTitle">${escapeHtml(demon.name)}</${tag}></div></div>
    <div class="verification-video">${id ? `<iframe id="verificationPlayer" src="https://www.youtube-nocookie.com/embed/${id}?rel=0" title="${escapeHtml(demon.name + ' · ' + t.video)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : `<p>${t.unavailable}</p>`}</div>
    <div class="detail-info"><dl class="detail-facts"><div><dt>${t.publisher}</dt><dd>${escapeHtml(demon.publisher.name)}</dd></div><div><dt>${t.verifier}</dt><dd>${escapeHtml(demon.verifier.name)}</dd></div><div><dt>${t.levelId}</dt><dd class="level-id">${demon.level_id ?? t.unpublished}</dd></div><div><dt>${t.requirement}</dt><dd>${demon.requirement}%</dd></div></dl><a class="detail-source" href="${pointercrateUrl(demon)}" target="_blank" rel="noopener noreferrer">${t.source}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M7 17 17 7M6 7h11v11"/></svg></a></div>`;
}
