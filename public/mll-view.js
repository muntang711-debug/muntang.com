export const escapeHtml = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export function filterDemons(demons, query, range = 'all') {
  const search = query.trim().toLocaleLowerCase();
  return demons.filter(demon => {
    if (range === '1-75' && demon.position > 75) return false;
    if (range === '76-150' && demon.position < 76) return false;
    return !search || [demon.name, demon.publisher.name, demon.verifier.name, demon.level_id, '#' + demon.position]
      .some(value => String(value ?? '').toLocaleLowerCase().includes(search));
  });
}

export function renderRows(demons, selectedId) {
  return demons.map(demon => `<li class="level-row${demon.id === selectedId ? ' is-selected' : ''}"><a class="level-select" href="https://pointercrate.com/demonlist/${demon.id}/" data-level-id="${demon.id}"${demon.id === selectedId ? ' aria-current="true"' : ''}><span class="level-rank">#${demon.position}</span><span class="level-copy"><strong>${escapeHtml(demon.name)}</strong><small>${escapeHtml(demon.publisher.name)}</small></span><span class="level-verifier">${escapeHtml(demon.verifier.name)}</span><span class="level-arrow" aria-hidden="true">↗</span></a></li>`).join('');
}

export function renderDetail(demon) {
  if (!demon) return '<p class="detail-empty">검색 결과가 없습니다.</p>';
  return `<div class="detail-heading"><span class="detail-rank">#${demon.position}</span><span>POINTERCRATE DEMONLIST</span></div>
    <h2 id="detailTitle">${escapeHtml(demon.name)}</h2>
    ${demon.thumbnail ? `<div class="detail-image"><img src="${escapeHtml(demon.thumbnail)}" alt="${escapeHtml(demon.name)} 영상 썸네일" width="480" height="270" loading="lazy"></div>` : '<div class="detail-image image-empty">미리보기 없음</div>'}
    <dl class="detail-facts"><div><dt>업로더</dt><dd>${escapeHtml(demon.publisher.name)}</dd></div><div><dt>베리파이어</dt><dd>${escapeHtml(demon.verifier.name)}</dd></div><div><dt>레벨 ID</dt><dd class="level-id">${demon.level_id ?? '미공개'}</dd></div><div><dt>리스트 최소 기록</dt><dd>${demon.requirement}%</dd></div></dl>
    <div class="detail-actions">${demon.video ? `<a class="watch-link" href="${escapeHtml(demon.video)}" target="_blank" rel="noopener noreferrer">클리어 영상 <span aria-hidden="true">↗</span></a>` : ''}<a class="source-link" href="https://pointercrate.com/demonlist/${demon.id}/" target="_blank" rel="noopener noreferrer">Pointercrate에서 보기 <span aria-hidden="true">↗</span></a></div>`;
}
