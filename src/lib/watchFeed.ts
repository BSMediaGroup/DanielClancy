export type WatchFeedVideo = {
  id: string;
  provider: "youtube" | "rumble" | "manual" | (string & {});
  sourcePlatform?: "youtube" | "rumble" | "manual" | (string & {});
  entryType?: "video" | "short" | "livestream" | "other" | (string & {});
  source?: "autofetch" | "manual" | (string & {});
  title: string;
  description: string;
  excerpt: string;
  publishedAt: string | null;
  enteredAt?: string;
  sortDate?: string;
  createdAt?: string;
  thumbnailUrl: string;
  videoUrl: string;
  embedUrl: string;
  externalUrl?: string;
  canonicalUrl?: string;
  platformVideoId?: string;
  platformChannelId?: string;
  channelTitle: string;
  visible?: boolean;
  featured?: boolean;
  manualHeroEligible?: boolean;
  heroEmbeddable?: boolean;
  galleryOnly?: boolean;
  aspect?: "landscape" | "portrait" | (string & {});
  tags?: string[];
};

export type WatchFeedState = "ready" | "partial" | "empty" | "unavailable";

export type WatchFeedResponse = {
  provider: "youtube" | (string & {});
  state: WatchFeedState;
  fetchedAt: string;
  message: string;
  channel: {
    id: string;
    title: string;
    url: string;
  };
  featured: WatchFeedVideo | null;
  recentUploads: WatchFeedVideo[];
  items: WatchFeedVideo[];
  metadata?: {
    youtubeCount?: number;
    targetCount?: number;
  };
};

type WatchMediaLike = Partial<WatchFeedVideo> & {
  slug?: string;
  status?: string;
  visibility?: string;
  platform?: string;
  updatedAt?: string;
};

const SCAFFOLD_WATCH_MEDIA_EXACT = new Set([
  "latest-youtube-release-scaffold",
  "latest youtube release scaffold",
  "scheduled-livestream-scaffold",
  "scheduled livestream scaffold",
  "archived-replay-scaffold",
  "archived replay scaffold",
]);
const SCAFFOLD_WATCH_MEDIA_TERMS = [
  "scaffold",
  "demo",
  "sample",
  "placeholder",
  "seeded watch media",
  "local placeholder",
];

export function isScaffoldWatchMediaEntry(item: WatchMediaLike | null | undefined) {
  const candidates = [item?.id, item?.slug, item?.title]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean);
  return candidates.some((value) => SCAFFOLD_WATCH_MEDIA_EXACT.has(value) || SCAFFOLD_WATCH_MEDIA_TERMS.some((term) => value.includes(term)));
}

export function watchMediaSortTime(item: WatchMediaLike | null | undefined) {
  const parsed = new Date(item?.sortDate || item?.publishedAt || item?.enteredAt || item?.createdAt || item?.updatedAt || 0).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

export function compareWatchMediaNewestFirst<T extends WatchMediaLike>(left: T, right: T) {
  const delta = watchMediaSortTime(right) - watchMediaSortTime(left);
  if (delta) return delta;
  return String(left.title || left.id || "").localeCompare(String(right.title || right.id || ""));
}

export function isVisibleWatchMediaEntry(item: WatchMediaLike | null | undefined) {
  if (!item || item.visible === false || isScaffoldWatchMediaEntry(item)) return false;
  const status = String(item.status || "").toLowerCase();
  const visibility = String(item.visibility || "").toLowerCase();
  return !["draft", "hidden", "private", "archived"].includes(status) && !["draft", "hidden", "private"].includes(visibility);
}

export function normalizeWatchPlatform(item: WatchMediaLike | null | undefined) {
  const provider = String(item?.sourcePlatform || item?.provider || item?.platform || "").toLowerCase();
  const source = String(`${item?.videoUrl || ""} ${item?.embedUrl || ""} ${item?.externalUrl || ""} ${item?.canonicalUrl || ""}`).toLowerCase();
  if (provider.includes("youtube") || source.includes("youtube.com") || source.includes("youtu.be")) return "youtube";
  if (provider.includes("rumble") || source.includes("rumble.com")) return "rumble";
  return provider || "source";
}

export function isWatchHeroEligible(item: WatchMediaLike | null | undefined) {
  if (!isVisibleWatchMediaEntry(item)) return false;
  if (item?.galleryOnly || item?.heroEmbeddable === false) return false;
  const platform = normalizeWatchPlatform(item);
  const entryType = String(item?.entryType || "video").toLowerCase();
  if (platform === "rumble") {
    return entryType === "video" && Boolean(safeRumbleEmbedUrl(item?.embedUrl || ""));
  }
  if (platform === "youtube") {
    return Boolean(safeYouTubeEmbedUrl(item?.embedUrl || "") || safeYouTubeVideoId(item));
  }
  return false;
}

export function safeRumbleEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "rumble.com" && url.pathname.startsWith("/embed/")
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function safeYouTubeEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith("youtube.com") && url.pathname.startsWith("/embed/")
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function safeYouTubeVideoId(item: WatchMediaLike | null | undefined) {
  if (!item) return "";
  if (normalizeWatchPlatform(item) !== "youtube") return "";
  const candidateUrl = item.videoUrl || item.embedUrl || "";
  try {
    const parsed = new URL(candidateUrl);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.replace("/", "");
    if (parsed.pathname.includes("/embed/")) return parsed.pathname.split("/embed/")[1]?.split("/")[0] || "";
    return parsed.searchParams.get("v") || "";
  } catch {
    return String(item.id || "");
  }
}

export function formatWatchDate(value: string | null) {
  if (!value) {
    return "Publishing date pending";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Publishing date pending";
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function isWatchFeedReady(feed: WatchFeedResponse | null) {
  return Boolean(feed?.featured);
}
