import { readTag, parseEmbeddedJson, collectYouTubeVideos, findYouTubeContinuation } from './youtube-parser.js';
export const channelUrl = 'https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4';
const channelId = 'UC6XrgnovmMLGkfLDYEUbHww';

export async function readUpstream(url, options = {}, timeout = 6000, maxBytes = 4_000_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  let reader;
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error('UpstreamHTTP' + response.status);
    if (Number(response.headers.get('Content-Length')) > maxBytes) throw new Error('UpstreamTooLarge');
    reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new Error('UpstreamTooLarge');
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return new TextDecoder().decode(bytes);
  } finally {
    clearTimeout(timer);
    if (reader) { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  }
}

function sourceFailure(source, error) {
  console.warn(JSON.stringify({ event: 'youtube_source_failed', source, reason: error?.name === 'AbortError' ? 'timeout' : String(error?.message || 'unavailable').slice(0, 80) }));
}

export async function fetchPage(type, language, continuation = '') {
  try {
    const pageUrl = channelUrl + '/' + type + '?hl=' + language;
    const html = await readUpstream(pageUrl, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': language === 'en' ? 'en-US,en;q=0.9' : 'ko-KR,ko;q=0.9' } });
    let data = parseEmbeddedJson(html, 'var ytInitialData =') || parseEmbeddedJson(html, 'ytInitialData =') || parseEmbeddedJson(html, '"ytInitialData":');
    if (continuation) {
      const key = html.match(/"INNERTUBE_API_KEY"\s*:\s*"([^"]+)"/)?.[1];
      const context = parseEmbeddedJson(html, '"INNERTUBE_CONTEXT":');
      if (!key || !context?.client) throw new Error('MissingBrowseContext');
      context.client.hl = language;
      data = JSON.parse(await readUpstream('https://www.youtube.com/youtubei/v1/browse?key=' + encodeURIComponent(key), {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://www.youtube.com', Referer: pageUrl, 'X-YouTube-Client-Name': '1', 'X-YouTube-Client-Version': context.client.clientVersion },
        body: JSON.stringify({ context, continuation }),
      }));
      if (!data.onResponseReceivedActions && !data.onResponseReceivedEndpoints && !data.continuationContents) throw new Error('InvalidBrowsePage');
    }
    if (!data) throw new Error('MissingPageData');
    const videos = collectYouTubeVideos(data).filter(video => type === 'shorts' ? video.type === 'short' : video.type !== 'short');
    if (!continuation && !videos.length) throw new Error('EmptyInitialPage');
    return { ok: true, videos, nextContinuation: findYouTubeContinuation(data) };
  } catch (error) { sourceFailure(type, error); return { ok: false, videos: [], nextContinuation: '' }; }
}

export async function fetchFeed() {
  try {
    const xml = await readUpstream('https://www.youtube.com/feeds/videos.xml?channel_id=' + channelId, {}, 6000, 300_000);
    const videos = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)).map(([, entry]) => {
      const id = readTag(entry, 'yt:videoId');
      return { id, title: readTag(entry, 'title'), published: readTag(entry, 'published'), thumbnail_url: 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg', url: 'https://www.youtube.com/watch?v=' + id };
    }).filter(video => /^[A-Za-z0-9_-]{11}$/.test(video.id) && video.title);
    if (!videos.length) throw new Error('EmptyFeed');
    return { ok: true, videos };
  } catch (error) { sourceFailure('rss', error); return { ok: false, videos: [] }; }
}

export async function collectCatalog(language, previous) {
  const [videos, shorts, feed] = await Promise.all([fetchPage('videos', language), fetchPage('shorts', language), fetchFeed()]);
  if (!videos.ok && !shorts.ok && !feed.ok) throw new Error('AllSourcesUnavailable');
  const merged = new Map();
  const oldItems = new Map((previous?.videos || []).map(video => [video.id, video]));
  const add = video => {
    if (video?.id && video.title) {
      const old = merged.get(video.id) || oldItems.get(video.id) || {};
      merged.set(video.id, { ...old, ...video, published: video.published || old.published || '' });
    }
  };
  for (const item of previous?.videos || []) if (item.type === 'short' ? !shorts.ok : !videos.ok) add(item);
  feed.videos.forEach(add);
  shorts.videos.forEach(add);
  videos.videos.forEach(add);
  const sources = { videos: videos.ok, shorts: shorts.ok, rss: feed.ok };
  const catalog = Array.from(merged.values()).map(item => ({ ...item, type: item.type === 'short' || item.url?.includes('/shorts/') ? 'short' : 'video' })).sort((a, b) => (Date.parse(b.published) || 0) - (Date.parse(a.published) || 0));
  return {
    ok: true, status: videos.ok && shorts.ok ? 'fresh' : 'degraded', language,
    channelTitle: language === 'en' ? 'Muntang' : '문탕이', channelUrl,
    videos: catalog,
    nextContinuation: videos.ok ? videos.nextContinuation : '',
    nextContinuations: { videos: videos.ok ? videos.nextContinuation : '', shorts: shorts.ok ? shorts.nextContinuation : '' },
    complete: { videos: videos.ok && !videos.nextContinuation, shorts: shorts.ok && !shorts.nextContinuation },
    sources, warnings: Object.keys(sources).filter(key => !sources[key]), updatedAt: new Date().toISOString(),
  };
}
