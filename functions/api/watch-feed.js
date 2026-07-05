const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const SUCCESS_CACHE_CONTROL = "public, max-age=0, s-maxage=900, stale-while-revalidate=3600";
const ERROR_CACHE_CONTROL = "no-store";
const WATCH_FEED_TARGET_COUNT = 12;

function json(body, status = 200, cacheControl = ERROR_CACHE_CONTROL) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });
}

function sanitizeEnv(value, maxLength = 200) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

function createExcerpt(text, maxLength = 180) {
  const cleanedLines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^https?:\/\//i.test(line))
    .filter((line) => !/^twitter:?$/i.test(line))
    .filter((line) => !/^follow me everywhere/i.test(line))
    .filter((line) => !/^donate directly/i.test(line))
    .filter((line) => !/^contact:?/i.test(line));

  const normalized = cleanedLines.join(" ").replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "Latest release from Daniel Clancy's channel.";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function pickThumbnail(thumbnails) {
  return (
    thumbnails?.maxres?.url ||
    thumbnails?.standard?.url ||
    thumbnails?.high?.url ||
    thumbnails?.medium?.url ||
    thumbnails?.default?.url ||
    ""
  );
}

function toVideoUrl(videoId) {
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";
}

function toEmbedUrl(videoId) {
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}

function normalizeVideo(item, channelTitle) {
  const videoId = item?.contentDetails?.videoId || item?.snippet?.resourceId?.videoId || "";
  const snippet = item?.snippet || {};
  const description = String(snippet.description || "").trim();

  return {
    id: videoId,
    provider: "youtube",
    title: String(snippet.title || "").trim(),
    description,
    excerpt: createExcerpt(description),
    publishedAt: snippet.publishedAt || null,
    thumbnailUrl: pickThumbnail(snippet.thumbnails),
    videoUrl: toVideoUrl(videoId),
    embedUrl: toEmbedUrl(videoId),
    channelTitle: String(snippet.videoOwnerChannelTitle || channelTitle || "").trim(),
  };
}

async function fetchYouTubeJson(path, searchParams, apiKey) {
  const url = new URL(`${YOUTUBE_API_BASE}/${path}`);
  url.search = new URLSearchParams({ ...searchParams, key: apiKey }).toString();

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`YouTube API request failed with status ${response.status}.`);
  }

  return response.json();
}

async function buildWatchFeed(env) {
  const apiKey = sanitizeEnv(env?.YOUTUBE_API_KEY_DANIEL);
  const channelId = sanitizeEnv(env?.YOUTUBE_CHANNEL_ID_DANIEL);
  const channelUrl = channelId ? `https://www.youtube.com/channel/${channelId}` : "";

  if (!channelId) {
    return {
      provider: "youtube",
      state: "unavailable",
      fetchedAt: new Date().toISOString(),
      message: "The video feed is temporarily unavailable.",
      channel: {
        id: "",
        title: "Daniel Clancy",
        url: "",
      },
      featured: null,
      recentUploads: [],
      items: [],
      metadata: {
        youtubeCount: 0,
        targetCount: WATCH_FEED_TARGET_COUNT,
      },
    };
  }

  if (!apiKey) {
    return {
      provider: "youtube",
      state: "unavailable",
      fetchedAt: new Date().toISOString(),
      message: "Latest uploads are not available right now.",
      channel: {
        id: channelId,
        title: "Daniel Clancy",
        url: channelUrl,
      },
      featured: null,
      recentUploads: [],
      items: [],
      metadata: {
        youtubeCount: 0,
        targetCount: WATCH_FEED_TARGET_COUNT,
      },
    };
  }

  try {
    const channelResponse = await fetchYouTubeJson(
      "channels",
      {
        part: "snippet,contentDetails",
        id: channelId,
        maxResults: "1",
      },
      apiKey,
    );

    const channel = channelResponse?.items?.[0];
    const uploadsPlaylistId = channel?.contentDetails?.relatedPlaylists?.uploads;
    const channelTitle = String(channel?.snippet?.title || "Daniel Clancy").trim();

    if (!uploadsPlaylistId) {
      return {
        provider: "youtube",
        state: "empty",
        fetchedAt: new Date().toISOString(),
        message: "No uploads are available to show right now.",
        channel: {
          id: channelId,
          title: channelTitle,
          url: channelUrl,
        },
          featured: null,
          recentUploads: [],
          items: [],
          metadata: {
            youtubeCount: 0,
            targetCount: WATCH_FEED_TARGET_COUNT,
          },
        };
    }

    const uploadsResponse = await fetchYouTubeJson(
      "playlistItems",
      {
        part: "snippet,contentDetails",
        playlistId: uploadsPlaylistId,
        maxResults: String(WATCH_FEED_TARGET_COUNT),
      },
      apiKey,
    );

    const items = (uploadsResponse?.items || [])
      .map((item) => normalizeVideo(item, channelTitle))
      .filter((item) => item.id && item.title && item.videoUrl);

    const featured = items[0] || null;
    const recentUploads = items.slice(1);
    const state = featured ? (recentUploads.length ? "ready" : "partial") : "empty";
    const message = featured
      ? "Latest uploads loaded successfully."
      : "No uploads are available to show right now.";

    return {
      provider: "youtube",
      state,
      fetchedAt: new Date().toISOString(),
      message,
      channel: {
        id: channelId,
        title: channelTitle,
        url: channelUrl,
      },
      featured,
      recentUploads,
      items,
      metadata: {
        youtubeCount: items.length,
        targetCount: WATCH_FEED_TARGET_COUNT,
      },
    };
  } catch (_error) {
    return {
      provider: "youtube",
      state: "unavailable",
      fetchedAt: new Date().toISOString(),
      message: "Latest uploads are temporarily unavailable.",
      channel: {
        id: channelId,
        title: "Daniel Clancy",
        url: channelUrl,
      },
      featured: null,
      recentUploads: [],
      items: [],
      metadata: {
        youtubeCount: 0,
        targetCount: WATCH_FEED_TARGET_COUNT,
      },
    };
  }
}

export async function onRequestGet(context) {
  const payload = await buildWatchFeed(context.env);
  const isRecoverableState = payload.state === "ready" || payload.state === "partial" || payload.state === "empty";
  const status = payload.state === "unavailable" ? 503 : 200;

  return json(payload, status, isRecoverableState ? SUCCESS_CACHE_CONTROL : ERROR_CACHE_CONTROL);
}
