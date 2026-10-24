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
export function formatDate(video, language) {
  if (video.published && !Number.isNaN(Date.parse(video.published))) return new Date(video.published).toLocaleDateString(language === 'en' ? 'en-US' : 'ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
  return video.publishedText || '';
}
