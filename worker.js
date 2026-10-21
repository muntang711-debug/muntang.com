const featuredIds = ["5D9M7hhDNlY", "JupaczQCTFk"];
const channelHandleUrl = "https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4";

function decodeXml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function readTag(text, tag) {
  const expression = new RegExp("<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + tag + ">");
  const match = String(text || "").match(expression);
  return match ? decodeXml(match[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim()) : "";
}

function jsonResponse(value, status, extraHeaders) {
  return new Response(JSON.stringify(value), {
    status: status || 200,
    headers: Object.assign({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
    }, extraHeaders || {})
  });
}

async function fetchOEmbed(id) {
  try {
    const target = "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
    const endpoint = "https://www.youtube.com/oembed?url=" + encodeURIComponent(target) + "&format=json";
    const response = await fetch(endpoint, { headers: { "Accept": "application/json" } });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      id: id,
      title: data.title || "",
      author_name: data.author_name || "",
      author_url: data.author_url || "https://www.youtube.com/@%EB%AC%B8%ED%83%95%EC%9D%B4",
      thumbnail_url: data.thumbnail_url || ("https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"),
      url: target
    };
  } catch (_) {
    return null;
  }
}

async function fetchChannelFeed() {
  let channelHtml = "";
  let channelTitle = "문탕이";
  let channelId = "";
  try {
    const channelResponse = await fetch(channelHandleUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MuntangSite/1.0)", "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8" },
      redirect: "follow"
    });
    if (channelResponse.ok) {
      channelHtml = await channelResponse.text();
      const idMatch = channelHtml.match(/"externalId"\s*:\s*"(UC[^"]+)"/) ||
        channelHtml.match(/"channelId"\s*:\s*"(UC[^"]+)"/) ||
        channelHtml.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]+)/);
      if (idMatch) channelId = idMatch[1];
      const titleMatch = channelHtml.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i) ||
        channelHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
      if (titleMatch && titleMatch[1]) channelTitle = decodeXml(titleMatch[1]).replace(/\s*-\s*YouTube\s*$/i, "");
    }
  } catch (_) {}

  if (!channelId) return { channelTitle: channelTitle, channelId: "", recent: [] };
  try {
    const feedResponse = await fetch("https://www.youtube.com/feeds/videos.xml?channel_id=" + encodeURIComponent(channelId), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MuntangSite/1.0)", "Accept": "application/atom+xml, application/xml;q=0.9, */*;q=0.8" }
    });
    if (!feedResponse.ok) return { channelTitle: channelTitle, channelId: channelId, recent: [] };
    const xml = await feedResponse.text();
    const recent = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)).map(function(match) {
      const entry = match[1];
      const id = readTag(entry, "yt:videoId");
      if (!id) return null;
      const published = readTag(entry, "published");
      return {
        id: id,
        title: readTag(entry, "title"),
        published: published,
        author_name: readTag(entry, "name"),
        thumbnail_url: "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg",
        url: "https://www.youtube.com/watch?v=" + encodeURIComponent(id)
      };
    }).filter(Boolean).slice(0, 12);
    const feedAuthor = xml.match(/<author>\s*<name>([\s\S]*?)<\/name>/);
    if (feedAuthor && feedAuthor[1]) channelTitle = decodeXml(feedAuthor[1]);
    return { channelTitle: channelTitle, channelId: channelId, recent: recent };
  } catch (_) {
    return { channelTitle: channelTitle, channelId: channelId, recent: [] };
  }
}


function parseEmbeddedJson(source, marker) {
  const text = String(source || "");
  const at = text.indexOf(marker);
  if (at < 0) return null;
  const start = text.indexOf("{", at + marker.length);
  if (start < 0) return null;
  let depth = 0, quoted = false, escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') quoted = false;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(text.slice(start, i + 1)); } catch (_) { return null; }
      }
    }
  }
  return null;
}

function textFromYouTubeRuns(value) {
  if (!value) return "";
  if (typeof value.simpleText === "string") return value.simpleText;
  if (Array.isArray(value.runs)) return value.runs.map(function(run) { return run && run.text || ""; }).join("");
  return "";
}

function collectYouTubeVideos(data) {
  const videos = [];
  const seen = new Set();
  const stack = [data];
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    if (Array.isArray(current)) {
      for (let i = current.length - 1; i >= 0; i--) stack.push(current[i]);
      continue;
    }
    const lockup = current.lockupViewModel || (current.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" ? current : null);
    if (lockup && typeof lockup.contentId === "string" &&
        /^[A-Za-z0-9_-]{11}$/.test(lockup.contentId) && !seen.has(lockup.contentId)) {
      const lockTitle = lockup.metadata && lockup.metadata.lockupMetadataViewModel &&
        lockup.metadata.lockupMetadataViewModel.title && lockup.metadata.lockupMetadataViewModel.title.content || "";
      const sources = lockup.contentImage && lockup.contentImage.thumbnailViewModel &&
        lockup.contentImage.thumbnailViewModel.image && lockup.contentImage.thumbnailViewModel.image.sources || [];
      const lockMeta = lockup.metadata && lockup.metadata.lockupMetadataViewModel &&
        lockup.metadata.lockupMetadataViewModel.metadata && lockup.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel &&
        lockup.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows || [];
      const metaParts = lockMeta.reduce(function(all, row) {
        return all.concat((row.metadataParts || []).map(function(part) {
          return part && part.text && part.text.content || "";
        }).filter(Boolean));
      }, []);
      const lockThumbnail = sources.length && sources[sources.length - 1].url ||
        ("https://i.ytimg.com/vi/" + lockup.contentId + "/hqdefault.jpg");
      if (lockTitle) {
        seen.add(lockup.contentId);
        videos.push({
          id: lockup.contentId,
          title: lockTitle,
          thumbnail_url: lockThumbnail,
          publishedText: metaParts.length ? metaParts[metaParts.length - 1] : "",
          url: "https://www.youtube.com/watch?v=" + encodeURIComponent(lockup.contentId)
        });
      }
    }
    const reel = current.reelItemRenderer;
    if (reel && typeof reel.videoId === "string" && /^[A-Za-z0-9_-]{11}$/.test(reel.videoId) && !seen.has(reel.videoId)) {
      const reelId = reel.videoId;
      const reelTitle = textFromYouTubeRuns(reel.headline) || textFromYouTubeRuns(reel.accessibility && reel.accessibility.accessibilityData && reel.accessibility.accessibilityData.label);
      if (reelTitle) {
        seen.add(reelId);
        videos.push({ id: reelId, title: reelTitle, thumbnail_url: "https://i.ytimg.com/vi/" + reelId + "/hqdefault.jpg", publishedText: "", url: "https://www.youtube.com/shorts/" + encodeURIComponent(reelId), type: "short" });
      }
    }
    const id = current.videoId;
    if (typeof id === "string" && /^[A-Za-z0-9_-]{11}$/.test(id) && current.title && current.thumbnail && !seen.has(id)) {
      const title = textFromYouTubeRuns(current.title);
      const thumbnails = current.thumbnail && current.thumbnail.thumbnails;
      const thumbnail = Array.isArray(thumbnails) && thumbnails.length
        ? (thumbnails[thumbnails.length - 1].url || "")
        : "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
      if (title) {
        seen.add(id);
        videos.push({
          id: id,
          title: title,
          thumbnail_url: thumbnail,
          publishedText: textFromYouTubeRuns(current.publishedTimeText),
          viewCountText: textFromYouTubeRuns(current.viewCountText || current.shortViewCountText),
          url: "https://www.youtube.com/watch?v=" + encodeURIComponent(id)
        });
      }
    }
    const keys = Object.keys(current);
    for (let i = keys.length - 1; i >= 0; i--) {
      const value = current[keys[i]];
      if (value && typeof value === "object") stack.push(value);
    }
  }
  return videos;
}

function findYouTubeContinuation(data) {
  const scan = [data];
  const seen = new Set();
  const roots = [];
  while (scan.length) {
    const current = scan.pop();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);
    if (Array.isArray(current)) {
      for (let i = current.length - 1; i >= 0; i--) scan.push(current[i]);
      continue;
    }
    if (current.richGridRenderer) roots.push(current.richGridRenderer);
    if (current.richGridContinuation) roots.push(current.richGridContinuation);
    if (current.appendContinuationItemsAction &&
        Array.isArray(current.appendContinuationItemsAction.continuationItems)) {
      roots.push(current.appendContinuationItemsAction.continuationItems);
    }
    const keys = Object.keys(current);
    for (let i = keys.length - 1; i >= 0; i--) {
      const value = current[keys[i]];
      if (value && typeof value === "object") scan.push(value);
    }
  }

  for (const root of roots) {
    const pending = [root];
    const visited = new Set();
    let token = "";
    while (pending.length) {
      const current = pending.pop();
      if (!current || typeof current !== "object" || visited.has(current)) continue;
      visited.add(current);
      if (Array.isArray(current)) {
        for (let i = current.length - 1; i >= 0; i--) pending.push(current[i]);
        continue;
      }
      const item = current.continuationItemRenderer;
      if (item && item.continuationEndpoint && item.continuationEndpoint.continuationCommand &&
          item.continuationEndpoint.continuationCommand.token) {
        token = item.continuationEndpoint.continuationCommand.token;
      }
      if (current.nextContinuationData && current.nextContinuationData.continuation) {
        token = current.nextContinuationData.continuation;
      }
      if (Array.isArray(current.continuations)) {
        current.continuations.forEach(function(entry) {
          if (entry && entry.nextContinuationData && entry.nextContinuationData.continuation) {
            token = entry.nextContinuationData.continuation;
          }
        });
      }
      const keys = Object.keys(current);
      for (let i = keys.length - 1; i >= 0; i--) {
        const value = current[keys[i]];
        if (value && typeof value === "object") pending.push(value);
      }
    }
    if (token) return token;
  }
  return "";
}

let channelPageHtmlCache = "";
let channelPageHtmlCacheUntil = 0;

async function fetchChannelVideoPage(continuation) {
  try {
    let pageHtml = "";
    if (channelPageHtmlCache && Date.now() < channelPageHtmlCacheUntil) {
      pageHtml = channelPageHtmlCache;
    } else {
      const pageResponse = await fetch(channelHandleUrl + "/videos", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8"
        },
        redirect: "follow"
      });
      if (!pageResponse.ok) return { videos: [], nextContinuation: "" };
      pageHtml = await pageResponse.text();
      channelPageHtmlCache = pageHtml;
      channelPageHtmlCacheUntil = Date.now() + 300000;
    }
    const apiKeyMatch = pageHtml.match(/"INNERTUBE_API_KEY"\s*:\s*"([^"]+)"/);
    const context = parseEmbeddedJson(pageHtml, '"INNERTUBE_CONTEXT":');
    let pageData = parseEmbeddedJson(pageHtml, "var ytInitialData =");
    if (!pageData) pageData = parseEmbeddedJson(pageHtml, '"ytInitialData":');
    let nextContinuation = "";

    if (continuation && apiKeyMatch && apiKeyMatch[1]) {
      const clientVersionMatch = pageHtml.match(/"INNERTUBE_CONTEXT_CLIENT_VERSION"\s*:\s*"([^"]+)"/);
      const clientVersion = clientVersionMatch ? clientVersionMatch[1] :
        (context && context.client && context.client.clientVersion) || "2.20261018.01.00";
      const fallbackContext = {
        client: { clientName: "WEB", clientVersion: clientVersion, hl: "ko", gl: "KR" }
      };
      const response = await fetch("https://www.youtube.com/youtubei/v1/browse?key=" + encodeURIComponent(apiKeyMatch[1]), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Origin": "https://www.youtube.com",
          "Referer": channelHandleUrl + "/videos",
          "X-YouTube-Client-Name": "1",
          "X-YouTube-Client-Version": clientVersion
        },
        body: JSON.stringify({
          context: context || fallbackContext,
          continuation: continuation
        })
      });
      if (response.ok) pageData = await response.json();
      else pageData = null;
    }

    if (!pageData) return { videos: [], nextContinuation: "" };
    const videos = collectYouTubeVideos(pageData);
    nextContinuation = findYouTubeContinuation(pageData);
    return { videos: videos, nextContinuation: nextContinuation };
  } catch (_) {
    return { videos: [], nextContinuation: "" };
  }
}

async function fetchChannelShortsPage() {
  try {
    const response = await fetch(channelHandleUrl + "/shorts");
    if (!response.ok) return [];
    const html = await response.text();
    const data = parseEmbeddedJson(html, "var ytInitialData =") || parseEmbeddedJson(html, '"ytInitialData":');
    return data ? collectYouTubeVideos(data).map(function(video) {
      return Object.assign({}, video, { thumbnail_url: "https://i.ytimg.com/vi/" + video.id + "/hqdefault.jpg", url: "https://www.youtube.com/shorts/" + video.id, type: "short" });
    }) : [];
  } catch (_) { return []; }
}

async function handleYouTubeApi(request) {
  const requestUrl = new URL(request.url);
  const continuation = requestUrl.searchParams.get("continuation") || "";
  if (continuation) {
    const page = await fetchChannelVideoPage(continuation);
    return jsonResponse({
      ok: true,
      videos: page.videos,
      nextContinuation: page.nextContinuation,
      source: "YouTube channel videos"
    });
  }

  const results = await Promise.all([
    Promise.all(featuredIds.map(fetchOEmbed)),
    fetchChannelFeed(),
    fetchChannelVideoPage(""),
    fetchChannelShortsPage()
  ]);
  const fetchedFeatured = results[0].filter(Boolean);
  const feed = results[1];
  const page = results[2];
  const shorts = results[3] || [];
  const featured = featuredIds.map(function(id) {
    return fetchedFeatured.find(function(video) { return video.id === id; }) || {
      id: id,
      title: "",
      author_name: "",
      author_url: channelHandleUrl,
      thumbnail_url: "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=" + encodeURIComponent(id)
    };
  });
  let videos = (page.videos || []).slice();
  const videoIds = new Set(videos.map(function(video) { return video.id; }));
  shorts.forEach(function(video) {
    if (!videoIds.has(video.id)) { videoIds.add(video.id); videos.push(video); }
  });
  videos = videos.map(function(video) {
    return Object.assign({}, video, {
      thumbnail_url: "https://i.ytimg.com/vi/" + video.id + "/hqdefault.jpg",
      url: video.type === "short" ? "https://www.youtube.com/shorts/" + video.id : (video.url || "https://www.youtube.com/watch?v=" + video.id)
    });
  });
  if (!videos.length) {
    videos = (feed.recent || []).slice();
    featured.forEach(function(video) {
      if (!videos.some(function(item) { return item.id === video.id; })) videos.push(video);
    });
  }
  return jsonResponse({
    ok: true,
    channelTitle: feed.channelTitle || (fetchedFeatured[0] && fetchedFeatured[0].author_name) || "문탕이",
    channelUrl: channelHandleUrl,
    featured: featured,
    videos: videos,
    nextContinuation: page.nextContinuation || "",
    source: "YouTube channel videos, public oEmbed and channel RSS",
    updatedAt: new Date().toISOString()
  });
}


export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.muntang.com") {
      return Response.redirect("https://muntang.com" + url.pathname + url.search, 301);
    }
    if (url.pathname === "/api/youtube") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return jsonResponse({ error: "Method Not Allowed" }, 405, { "Allow": "GET, HEAD" });
      }
      const continuation = url.searchParams.get("continuation") || "";
      if (request.method === "HEAD") {
        return new Response(null, { status: 200, headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": continuation ? "public, max-age=300, stale-while-revalidate=600" : "public, max-age=300, stale-while-revalidate=900",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        }});
      }
      if (continuation.length > 4096 || (continuation && !/^[A-Za-z0-9._~!()*+,;=:@%\/-]+$/.test(continuation))) {
        return jsonResponse({ error: "Invalid continuation token" }, 400, { "Cache-Control": "no-store" });
      }
      const cache = caches.default;
      const cacheRequest = new Request(url.origin + url.pathname + url.search, { method: "GET" });
      let response = await cache.match(cacheRequest);
      if (!response) {
        response = await handleYouTubeApi(new Request(request.url, { method: "GET", headers: request.headers }));
        if (response.ok) {
          const headers = new Headers(response.headers);
          headers.set("Cache-Control", continuation ? "public, max-age=300, stale-while-revalidate=600" : "public, max-age=300, stale-while-revalidate=900");
          headers.set("X-Content-Type-Options", "nosniff");
          headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
          headers.set("X-Frame-Options", "DENY");
          response = new Response(response.body, { status: response.status, headers });
          await cache.put(cacheRequest, response.clone());
        }
      }
      return response;
    }
    if (url.pathname === "/sitemap.xml") {
      return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://muntang.com/</loc></url></urlset>\n', {
        headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" }
      });
    }
    if (url.pathname === "/robots.txt") {
      return new Response("User-agent: *\nAllow: /\nSitemap: https://muntang.com/sitemap.xml\n", {
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" }
      });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { "Allow": "GET, HEAD" } });
    }
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response("Not Found", { status: 404 });
  }
};