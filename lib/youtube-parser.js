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

function textFromYouTubeContent(value) {
  if (typeof value === "string") return value;
  if (!value) return "";
  if (typeof value.content === "string") return value.content;
  return textFromYouTubeRuns(value);
}

function findShortsVideoId(model) {
  const pending = [model];
  const visited = new Set();
  while (pending.length) {
    const current = pending.pop();
    if (!current || typeof current !== "object" || visited.has(current)) continue;
    visited.add(current);
    const endpoint = current.reelWatchEndpoint || current.watchEndpoint;
    if (endpoint && typeof endpoint.videoId === "string" && /^[A-Za-z0-9_-]{11}$/.test(endpoint.videoId)) {
      return endpoint.videoId;
    }
    if (current === model && typeof current.videoId === "string" && /^[A-Za-z0-9_-]{11}$/.test(current.videoId)) {
      return current.videoId;
    }
    const keys = Object.keys(current);
    for (let i = keys.length - 1; i >= 0; i--) {
      const value = current[keys[i]];
      if (value && typeof value === "object") pending.push(value);
    }
  }
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
    const lockup = current.lockupViewModel ||
      (/^LOCKUP_CONTENT_TYPE_(?:VIDEO|SHORTS|REEL)$/.test(String(current.contentType || "")) ? current : null);
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
        const isShortLockup = /SHORT|REEL/i.test(String(lockup.contentType || ""));
        videos.push({
          id: lockup.contentId,
          title: lockTitle,
          thumbnail_url: lockThumbnail,
          publishedText: metaParts.length ? metaParts[metaParts.length - 1] : "",
          url: isShortLockup
            ? "https://www.youtube.com/shorts/" + encodeURIComponent(lockup.contentId)
            : "https://www.youtube.com/watch?v=" + encodeURIComponent(lockup.contentId),
          type: isShortLockup ? "short" : ""
        });
      }
    }
    const shortsLockup = current.shortsLockupViewModel ||
      (current.onTap && current.thumbnail && (current.overlayMetadata || current.accessibilityText) ? current : null);
    if (shortsLockup) {
      const shortsId = findShortsVideoId(shortsLockup);
      const overlay = shortsLockup.overlayMetadata || {};
      const shortsTitle = textFromYouTubeContent(overlay.primaryText) ||
        textFromYouTubeContent(shortsLockup.title) ||
        textFromYouTubeContent(shortsLockup.headline) ||
        textFromYouTubeContent(shortsLockup.accessibilityText);
      const thumbnailModel = shortsLockup.thumbnail;
      const thumbnailSources = (thumbnailModel && thumbnailModel.sources) ||
        (thumbnailModel && thumbnailModel.thumbnailViewModel && thumbnailModel.thumbnailViewModel.image &&
          thumbnailModel.thumbnailViewModel.image.sources) || [];
      if (shortsId && shortsTitle && !seen.has(shortsId)) {
        seen.add(shortsId);
        videos.push({
          id: shortsId,
          title: shortsTitle,
          thumbnail_url: thumbnailSources.length && thumbnailSources[thumbnailSources.length - 1].url ||
            "https://i.ytimg.com/vi/" + shortsId + "/hqdefault.jpg",
          publishedText: textFromYouTubeContent(overlay.secondaryText),
          url: "https://www.youtube.com/shorts/" + encodeURIComponent(shortsId),
          type: "short"
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


export { readTag, parseEmbeddedJson, collectYouTubeVideos, findYouTubeContinuation };
