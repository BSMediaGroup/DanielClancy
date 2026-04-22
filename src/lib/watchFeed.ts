export type WatchFeedVideo = {
  id: string;
  provider: "youtube";
  title: string;
  description: string;
  excerpt: string;
  publishedAt: string | null;
  thumbnailUrl: string;
  videoUrl: string;
  embedUrl: string;
  channelTitle: string;
};

export type WatchFeedState = "ready" | "partial" | "empty" | "unavailable";

export type WatchFeedResponse = {
  provider: "youtube";
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
};

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
