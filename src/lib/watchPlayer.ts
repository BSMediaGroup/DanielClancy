import {
  normalizeWatchPlatform,
  safeCloudflareStreamEmbedUrl,
  safeCloudflareStreamUid,
  safeCustomEmbedUrl,
  safeHlsUrl,
  safeRumbleEmbedUrl,
  type WatchFeedVideo,
} from "./watchFeed";

export type EmbedOptions = {
  autoplay: boolean;
  muted: boolean;
};

export type WatchPlayerSource =
  | { kind: "iframe"; src: string; title: string }
  | { kind: "video"; src: string; poster?: string; title: string }
  | { kind: "external"; reason: "external-only" | "offline" | "upcoming" | "no-live-source" };

export function getYouTubeVideoId(video: WatchFeedVideo | null) {
  if (!video) {
    return "";
  }

  if (video.id) {
    return video.id;
  }

  const candidateUrl = video.videoUrl || video.embedUrl;

  try {
    const parsed = new URL(candidateUrl);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }

    if (parsed.pathname.includes("/embed/")) {
      return parsed.pathname.split("/embed/")[1]?.split("/")[0] || "";
    }

    return parsed.searchParams.get("v") || "";
  } catch (_error) {
    return "";
  }
}

export function buildYouTubeEmbedUrl(video: WatchFeedVideo | null, options: EmbedOptions) {
  if (!video) {
    return "";
  }

  const videoId = getYouTubeVideoId(video);
  const baseUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : video.embedUrl;

  if (!baseUrl) {
    return "";
  }

  try {
    const url = new URL(baseUrl);
    // Keep controls static-compatible by rebuilding iframe params instead of shipping a player API bridge.
    url.searchParams.set("autoplay", options.autoplay ? "1" : "0");
    url.searchParams.set("mute", options.muted ? "1" : "0");
    url.searchParams.set("playsinline", "1");
    url.searchParams.set("rel", "0");
    url.searchParams.set("modestbranding", "1");
    return url.toString();
  } catch (_error) {
    return "";
  }
}

export function resolveWatchPlayerSource(video: WatchFeedVideo | null, options: EmbedOptions): WatchPlayerSource {
  if (!video) {
    return { kind: "external", reason: "no-live-source" };
  }

  const liveStatus = String(video.liveStatus || "").toLowerCase();
  if (liveStatus === "offline" || liveStatus === "upcoming" || liveStatus === "no-live-source") {
    return { kind: "external", reason: liveStatus };
  }

  const platform = normalizeWatchPlatform(video);
  if (platform === "rumble") {
    const src = video.heroEmbeddable === false || video.galleryOnly ? "" : safeRumbleEmbedUrl(video.embedUrl);
    return src ? { kind: "iframe", src, title: video.title } : { kind: "external", reason: "external-only" };
  }

  if (platform === "youtube") {
    const src = buildYouTubeEmbedUrl(video, options);
    return src ? { kind: "iframe", src, title: video.title } : { kind: "external", reason: "external-only" };
  }

  if (platform === "cloudflare_stream") {
    const embedUrl = safeCloudflareStreamEmbedUrl(video.embedUrl || "");
    const uid = safeCloudflareStreamUid(video.cloudflareStreamUid || video.streamUid || "");
    const src = embedUrl || (uid ? `https://iframe.videodelivery.net/${uid}?autoplay=${options.autoplay ? "true" : "false"}&muted=${options.muted ? "true" : "false"}` : "");
    return src ? { kind: "iframe", src, title: video.title } : { kind: "external", reason: "no-live-source" };
  }

  if (platform === "hls") {
    const src = safeHlsUrl(video.hlsUrl || video.videoUrl || "");
    return src ? { kind: "video", src, poster: video.thumbnailUrl || "", title: video.title } : { kind: "external", reason: "no-live-source" };
  }

  if (platform === "custom_embed") {
    const src = safeCustomEmbedUrl(video.customEmbedUrl || video.embedUrl || "");
    return src ? { kind: "iframe", src, title: video.title } : { kind: "external", reason: "no-live-source" };
  }

  return { kind: "external", reason: "external-only" };
}
