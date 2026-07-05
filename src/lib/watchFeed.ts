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
