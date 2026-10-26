export function mergeVideos(current, incoming) {
  const items = new Map(current.map(video => [video.id, video]));
  for (const video of incoming || []) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(video?.id || '') || !video.title) continue;
    const old = items.get(video.id) || {};
    const isShort = video.type === 'short' || video.url?.includes('/shorts/');
    items.set(video.id, { ...old, ...video, published: video.published || old.published || '', publishedText: video.publishedText || '', type: isShort ? 'short' : 'video', url: 'https://www.youtube.com/' + (isShort ? 'shorts/' : 'watch?v=') + video.id });
  }
  return [...items.values()];
}
export function filterVideos(videos, filter, query) {
  const text = query.trim().toLocaleLowerCase();
  return videos.filter(video => (filter === 'all' || (filter === 'shorts') === (video.type === 'short')) && (!text || video.title.toLocaleLowerCase().includes(text)));
}
export function pageTypes(filter, tokens) { return (filter === 'all' ? ['videos', 'shorts'] : [filter]).filter(type => tokens[type]); }
export function formatDate(video, language, now = Date.now()) {
  const en = language === 'en';
  let age = video.publishedText && !/조회수|\bviews?\b/i.test(video.publishedText) ? video.publishedText : '';
  if (video.published && Number.isFinite(Date.parse(video.published))) {
    const seconds = Math.max(0, (now - Date.parse(video.published)) / 1000);
    const units = [[31536000, 'year'], [2592000, 'month'], [604800, 'week'], [86400, 'day'], [3600, 'hour'], [60, 'minute']];
    const [size, unit] = units.find(([size]) => seconds >= size) || [1, 'second'];
    age = new Intl.RelativeTimeFormat(en ? 'en' : 'ko', { numeric: 'always' }).format(-Math.floor(seconds / size), unit);
  }
  let views = video.viewCountText || (/조회수|\bviews?\b/i.test(video.publishedText || '') ? video.publishedText : '');
  if (!views && video.viewCount !== undefined && Number.isFinite(Number(video.viewCount))) {
    const count = new Intl.NumberFormat(en ? 'en' : 'ko', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(video.viewCount));
    views = en ? `${count} views` : `조회수 ${count}회`;
  }
  return `${age || (en ? 'Date unavailable' : '게시일 확인 중')} · ${views || (en ? 'Views unavailable' : '조회수 확인 중')}`;
}
