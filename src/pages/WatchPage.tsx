import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import { PersonalFooter } from "../components/PersonalShell";
import { PersonalHeaderAccount } from "../components/PersonalHeaderAccount";
import { SocialLinkRow } from "../components/SocialLinkRow";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { shellAssets, socialIcons } from "../content/brandAssets";
import { usePublicSiteData } from "../lib/publicSiteData";
import {
  compareWatchMediaNewestFirst,
  formatWatchDate,
  isScaffoldWatchMediaEntry,
  isVisibleWatchMediaEntry,
  isWatchHeroEligible,
  normalizeWatchPlatform,
  safeCloudflareStreamEmbedUrl,
  safeCloudflareStreamUid,
  safeCustomEmbedUrl,
  safeHlsUrl,
  safeRumbleEmbedUrl,
  type WatchFeedResponse,
  type WatchFeedVideo,
} from "../lib/watchFeed";
import type { PublicWatchMedia } from "../data/public-site-fallback";

type FeedStatus = "loading" | "ready" | "empty" | "error";

const LOADING_CARDS = Array.from({ length: 4 }, (_, index) => `loading-${index}`);
const LANDSCAPE_GALLERY_PAGE_SIZE = 6;
const SHORT_GALLERY_PAGE_SIZE = 8;
const FALLBACK_MESSAGE =
  "Fresh uploads will appear here again once the channel connection is available.";
const WATCH_CHROME_LINKS = [
  {
    label: "Rumble",
    href: "https://rumble.com/DanielClancy",
    icon: socialIcons.rumble,
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@danielclancy",
    icon: socialIcons.youtube,
  },
  {
    label: "Twitter/X",
    href: "https://x.com/danielclancy",
    icon: socialIcons.x,
  },
  {
    label: "StreamSuites",
    href: "https://streamsuites.app/@danielclancy",
    icon: socialIcons.streamSuites,
  },
  {
    label: "GitHub",
    href: "https://github.com/bsmediagroup",
    icon: socialIcons.github,
  },
];

type EmbedOptions = {
  autoplay: boolean;
  muted: boolean;
};

type WatchPlayerSource =
  | { kind: "iframe"; src: string; title: string }
  | { kind: "video"; src: string; poster?: string; title: string }
  | { kind: "external"; reason: "external-only" | "offline" | "upcoming" | "no-live-source" };

function normalizePlatform(video: WatchFeedVideo | null) {
  return normalizeWatchPlatform(video);
}

function getPlatformLabel(video: WatchFeedVideo | null) {
  const platform = normalizePlatform(video);
  const type = String(video?.entryType || "").toLowerCase();

  if (type === "livestream") {
    if (platform === "cloudflare_stream" || platform === "hls") return "Livestream";
    return "Live video";
  }

  if (platform === "youtube") {
    return type === "short" || isLikelyYouTubeShort(video) ? "YouTube Short" : "YouTube";
  }

  if (platform === "rumble") {
    return type === "short" ? "Rumble Short" : "Rumble";
  }

  if (platform === "cloudflare_stream") return "Cloudflare Stream";
  if (platform === "hls") return "Live video";
  if (platform === "custom_embed") return "Embedded video";

  return "Source platform";
}

function getSourceCtaLabel(video: WatchFeedVideo | null) {
  const platformLabel = getPlatformLabel(video);
  return platformLabel === "Source platform" ? "Watch on source platform" : `Watch on ${platformLabel}`;
}

function stripDecorativeLiveMarker(title: string) {
  return title.replace(/^\u{1F534}\s*/u, "").trim() || title;
}

function getPlatformIcon(video: WatchFeedVideo | null) {
  const platform = normalizePlatform(video);

  if (platform === "youtube") {
    return socialIcons.youtube;
  }

  if (platform === "rumble") {
    return socialIcons.rumble;
  }

  return socialIcons.link;
}

function getThumbnailUrl(video: WatchFeedVideo | null | undefined) {
  return video?.thumbnailUrl || "";
}

function getYouTubeVideoId(video: WatchFeedVideo | null) {
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

function buildYouTubeEmbedUrl(video: WatchFeedVideo | null, options: EmbedOptions) {
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

function resolvePlayerSource(video: WatchFeedVideo | null, options: EmbedOptions): WatchPlayerSource {
  if (!video) {
    return { kind: "external", reason: "no-live-source" };
  }

  const liveStatus = String(video.liveStatus || "").toLowerCase();
  if (liveStatus === "offline" || liveStatus === "upcoming" || liveStatus === "no-live-source") {
    return { kind: "external", reason: liveStatus };
  }

  const platform = normalizePlatform(video);
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
    return src ? { kind: "video", src, poster: getThumbnailUrl(video), title: video.title } : { kind: "external", reason: "no-live-source" };
  }

  if (platform === "custom_embed") {
    const src = safeCustomEmbedUrl(video.customEmbedUrl || video.embedUrl || "");
    return src ? { kind: "iframe", src, title: video.title } : { kind: "external", reason: "no-live-source" };
  }

  return { kind: "external", reason: "external-only" };
}

function resolveVideos(feed: WatchFeedResponse | null, manualWatchMedia: PublicWatchMedia[]) {
  const sourceItems = feed?.items?.length
    ? feed.items
    : [feed?.featured, ...(feed?.recentUploads || [])].filter(Boolean);
  const seen = new Set<string>();
  const normalized = [
    ...sourceItems.map(normalizeYouTubeFeedItem),
    ...manualWatchMedia.map(normalizeManualWatchMediaItem),
  ].filter((item): item is WatchFeedVideo => Boolean(item?.id && item.title && isVisibleWatchMediaEntry(item)));

  return normalized
    .filter((item): item is WatchFeedVideo => {
    const key = watchMediaDedupeKey(item);
    if (!item?.id || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
    })
    .sort(compareWatchMediaNewestFirst);
}

function watchMediaDedupeKey(item: WatchFeedVideo) {
  const platform = normalizePlatform(item);
  const type = String(item.entryType || "video").toLowerCase();
  const source = item.videoUrl || item.externalUrl || item.canonicalUrl || item.embedUrl || "";
  return `${platform}:${type}:${item.platformVideoId || item.id}:${source}`;
}

function normalizeYouTubeFeedItem(item: WatchFeedVideo | null | undefined): WatchFeedVideo | null {
  if (!item?.id) return null;
  const short = isLikelyYouTubeShort(item);
  return {
    ...item,
    provider: "youtube",
    sourcePlatform: "youtube",
    source: "autofetch",
    entryType: short ? "short" : "video",
    sortDate: item.sortDate || item.publishedAt || undefined,
    visible: true,
    heroEmbeddable: true,
    galleryOnly: false,
    aspect: short ? "portrait" : "landscape",
  };
}

function normalizeManualWatchMediaItem(item: PublicWatchMedia): WatchFeedVideo | null {
  if (!item?.id || !isVisibleWatchMediaEntry(item) || isScaffoldWatchMediaEntry(item)) return null;
  const sourcePlatform = String(item.sourcePlatform || "manual").toLowerCase();
  const entryType = String(item.entryType || "video").toLowerCase();
  const sourceUrl = item.sourceUrl || item.externalUrl || item.canonicalUrl || "";
  const thumbnailUrl = item.thumbnailUrl || "";
  const galleryOnly = Boolean(item.galleryOnly || (sourcePlatform === "rumble" && entryType === "short"));
  return {
    id: item.id,
    provider: sourcePlatform as WatchFeedVideo["provider"],
    sourcePlatform,
    entryType,
    source: item.source || "manual",
    title: item.title,
    description: item.description || "",
    excerpt: item.excerpt || item.description || "",
    publishedAt: item.publishedAt || null,
    enteredAt: item.enteredAt,
    sortDate: item.sortDate || item.publishedAt || item.enteredAt || item.createdAt || item.updatedAt,
    createdAt: item.createdAt,
    thumbnailUrl,
    videoUrl: sourceUrl,
    embedUrl: item.embedUrl || "",
    externalUrl: item.externalUrl || sourceUrl,
    canonicalUrl: item.canonicalUrl || sourceUrl,
    cloudflareStreamUid: item.cloudflareStreamUid,
    streamUid: item.streamUid,
    hlsUrl: item.hlsUrl,
    customEmbedUrl: item.customEmbedUrl,
    platformVideoId: item.platformVideoId,
    platformChannelId: item.platformChannelId,
    channelTitle: sourcePlatform === "rumble" ? "Daniel Clancy on Rumble" : "Daniel Clancy",
    liveStatus: item.liveStatus,
    visible: true,
    featured: item.featured,
    manualHeroEligible: item.manualHeroEligible,
    heroEmbeddable: Boolean(item.heroEmbeddable && !galleryOnly && item.embedUrl),
    galleryOnly,
    aspect: item.aspect || (entryType === "short" ? "portrait" : "landscape"),
    tags: item.tags || [],
  };
}

function isHeroCandidate(item: WatchFeedVideo) {
  return isWatchHeroEligible(item);
}

function isPortraitItem(item: WatchFeedVideo) {
  const aspect = String(item.aspect || "").toLowerCase();
  return aspect === "portrait" || aspect === "9:16" || item.entryType === "short" || isLikelyYouTubeShort(item);
}

function isSquareItem(item: WatchFeedVideo) {
  const aspect = String(item.aspect || "").toLowerCase();
  return aspect === "square" || aspect === "1:1";
}

function isLandscapeItem(item: WatchFeedVideo) {
  return !isPortraitItem(item) && !isSquareItem(item);
}

function isLikelyYouTubeShort(video: WatchFeedVideo | null) {
  if (!video || normalizePlatform(video) !== "youtube") return false;
  const text = `${video.title || ""} ${video.description || ""} ${video.videoUrl || ""}`.toLowerCase();
  return text.includes("#shorts") || text.includes("/shorts/");
}

function getBackdropStyle(video: WatchFeedVideo | null): CSSProperties | undefined {
  const thumbnailUrl = getThumbnailUrl(video)?.replace(/"/g, "%22");

  if (!thumbnailUrl) {
    return undefined;
  }

  return {
    "--watch-backdrop": `url("${thumbnailUrl}")`,
  } as CSSProperties;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16.4 8.2a5 5 0 0 1 0 7.6l1.7 1.7a7.4 7.4 0 0 0 0-11z" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="m16 9 5 5M21 9l-5 5" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {direction === "previous" ? <path d="m15 5-7 7 7 7" /> : <path d="m9 5 7 7-7 7" />}
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M5 9V5h4M15 5h4v4M19 15v4h-4M9 19H5v-4" />
    </svg>
  );
}

function TheatreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 7h16v10H4z" />
      <path d="M7 20h10" />
    </svg>
  );
}

function OverlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 5h16v14H4z" />
      <path d="M7 15h8M7 11h10" />
    </svg>
  );
}

type GalleryRowKey = "landscapePrimary" | "landscapeSecondary" | "portrait" | "square";

type WatchGalleryRowProps = {
  title: string;
  intro: string;
  items: WatchFeedVideo[];
  page: number;
  pageSize: number;
  emptyText: string;
  activeVideoId?: string;
  onPageChange: (nextPage: number) => void;
};

function WatchGalleryRow({
  title,
  intro,
  items,
  page,
  pageSize,
  emptyText,
  activeVideoId,
  onPageChange,
}: WatchGalleryRowProps) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const visibleItems = items.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  return (
    <section className="watch-gallery-row" aria-label={title}>
      <div className="watch-gallery-row__header">
        <div>
          <h3>{title}</h3>
          <p>{intro}</p>
        </div>
        <div className="watch-gallery-row__pager" aria-label={`${title} pages`}>
          <button type="button" onClick={() => onPageChange(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>
            Previous
          </button>
          <span>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            Next
          </button>
        </div>
      </div>

      {visibleItems.length ? (
        <div className="watch-gallery-row__grid">
          {visibleItems.map((item) => (
            <WatchGalleryCard key={item.id} item={item} active={activeVideoId === item.id} />
          ))}
        </div>
      ) : (
        <p className="watch-gallery-row__empty">{emptyText}</p>
      )}
    </section>
  );
}

function WatchGalleryCard({ item, active }: { item: WatchFeedVideo; active: boolean }) {
  const sourceHref = item.videoUrl || item.externalUrl || item.canonicalUrl || "";
  const portrait = isPortraitItem(item);
  const square = isSquareItem(item);
  const thumbnailUrl = getThumbnailUrl(item);

  return (
    <article
      className={`surface surface--compact watch-card${portrait ? " watch-card--portrait" : ""}${square ? " watch-card--square" : ""}${
        active ? " watch-card--active" : ""
      }`}
    >
      {sourceHref ? (
        <a
          href={sourceHref}
          target="_blank"
          rel="noopener noreferrer"
          className="watch-card__thumb-link"
          aria-label={`Open ${item.title} on the source platform`}
        >
          {thumbnailUrl ? (
            <img className="watch-card__thumb" src={thumbnailUrl} alt={item.title} loading="lazy" />
          ) : (
            <span className="watch-card__thumb watch-card__thumb--placeholder" aria-hidden="true" />
          )}
        </a>
      ) : (
        <span className="watch-card__thumb watch-card__thumb--placeholder" aria-hidden="true" />
      )}
      <p className="kicker">
        {getPlatformLabel(item)} / {formatWatchDate(item.sortDate || item.publishedAt || null)}
      </p>
      <h3>{item.title}</h3>
      <p>{item.excerpt || "Open the release on the source platform for full details."}</p>
      {sourceHref ? (
        <a className="text-link" href={sourceHref} target="_blank" rel="noopener noreferrer">
          {getSourceCtaLabel(item)}
        </a>
      ) : null}
    </article>
  );
}

export function WatchPage() {
  const { watchMedia, metadata: publicSiteMetadata } = usePublicSiteData();
  const heroMediaRef = useRef<HTMLDivElement | null>(null);
  const selectorRailRef = useRef<HTMLDivElement | null>(null);
  const [feed, setFeed] = useState<WatchFeedResponse | null>(null);
  const [status, setStatus] = useState<FeedStatus>("loading");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [muted, setMuted] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [theatreMode, setTheatreMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [galleryPages, setGalleryPages] = useState<Record<GalleryRowKey, number>>({
    landscapePrimary: 0,
    landscapeSecondary: 0,
    portrait: 0,
    square: 0,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeed() {
      try {
        const response = await fetch("/api/watch-feed", {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const data = (await response.json()) as WatchFeedResponse;

        setFeed(data);

        if (data.featured) {
          setStatus("ready");
          return;
        }

        setStatus(data.state === "empty" ? "empty" : "error");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setStatus("error");
      }
    }

    loadFeed();

    return () => controller.abort();
  }, []);

  const videos = useMemo(() => resolveVideos(feed, watchMedia), [feed, watchMedia]);
  const heroCandidates = useMemo(() => videos.filter(isHeroCandidate), [videos]);
  const activeVideo = heroCandidates.find((item) => item.id === activeVideoId) || heroCandidates[0] || null;
  const sourceUrl = activeVideo?.videoUrl || activeVideo?.externalUrl || activeVideo?.canonicalUrl || "";
  const heroPlayerSource = resolvePlayerSource(activeVideo, { autoplay: autoplayEnabled, muted });
  const heroFallbackReason = heroPlayerSource.kind === "external" ? heroPlayerSource.reason : "external-only";
  const canEmbedHero = heroPlayerSource.kind === "iframe" || heroPlayerSource.kind === "video";
  const catalogueItems = videos;
  const landscapeItems = catalogueItems.filter(isLandscapeItem);
  const landscapeSplitIndex = Math.ceil(landscapeItems.length / 2);
  const primaryLandscapeItems = landscapeItems.slice(0, landscapeSplitIndex);
  const secondaryLandscapeItems = landscapeItems.slice(landscapeSplitIndex);
  const portraitItems = catalogueItems.filter(isPortraitItem);
  const squareItems = catalogueItems.filter(isSquareItem);
  const activeIndex = activeVideo ? heroCandidates.findIndex((item) => item.id === activeVideo.id) : -1;
  const hasSelectableVideos = heroCandidates.length > 1;
  const hasChannelLink = Boolean(feed?.channel.url);
  const heroTitle = stripDecorativeLiveMarker(
    activeVideo?.title ||
      "Latest channel releases, replays, and uploads in one clean watch surface.",
  );
  const heroDescription =
    activeVideo?.excerpt ||
    feed?.message ||
    "The watch page keeps the latest release in focus and stays usable when provider data is temporarily unavailable.";
  const heroDate = activeVideo ? formatWatchDate(activeVideo.sortDate || activeVideo.publishedAt) : "Media status";
  const platformLabel = getPlatformLabel(activeVideo);
  const ctaLabel = getSourceCtaLabel(activeVideo);
  const sourceIcon = getPlatformIcon(activeVideo);
  const sectionIntro =
    status === "ready"
      ? "Browse recent videos and shorts by format while keeping the featured player in focus."
      : "The gallery will refresh as soon as the latest media connection is available again.";
  const showDiagnostics = import.meta.env.DEV;
  const watchDebugMeta = {
    youtubeCount: feed?.metadata?.youtubeCount ?? (feed?.items?.length || 0),
    manualMediaCount: watchMedia.filter((item) => item.source === "manual" || item.sourcePlatform === "rumble").length,
    mergedCount: videos.length,
    heroId: activeVideo?.id || "",
    heroTitle: activeVideo?.title || "",
    heroPlatform: activeVideo ? getPlatformLabel(activeVideo) : "",
    overrideRevision: publicSiteMetadata.revision || "",
    overrideUpdatedAt: publicSiteMetadata.publishedAt || publicSiteMetadata.generatedAt || "",
  };

  function selectAdjacentVideo(direction: -1 | 1) {
    if (!heroCandidates.length) {
      return;
    }

    const currentIndex = activeIndex >= 0 ? activeIndex : 0;
    const nextIndex = (currentIndex + direction + heroCandidates.length) % heroCandidates.length;
    setActiveVideoId(heroCandidates[nextIndex].id);
  }

  function setGalleryPage(key: GalleryRowKey, nextPage: number) {
    setGalleryPages((current) => ({
      ...current,
      [key]: nextPage,
    }));
  }

  function scrollSelector(direction: -1 | 1) {
    const rail = selectorRailRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.82, 240),
      behavior: "smooth",
    });
  }

  function handleSelectorKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollSelector(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollSelector(1);
    }
  }

  async function handleFullscreenToggle() {
    const target = heroMediaRef.current;
    if (!target) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      if (target.requestFullscreen) {
        await target.requestFullscreen();
        return;
      }
    } catch (_error) {
      // Browser/fullscreen policy failures fall back to theatre mode.
    }

    setTheatreMode(true);
  }

  useEffect(() => {
    if (!heroCandidates.length) {
      setActiveVideoId(null);
      return;
    }

    setActiveVideoId(heroCandidates[0].id);
  }, [heroCandidates[0]?.id]);

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  return (
    <>
      <Seo
        title="Watch"
        description="Daniel Clancy watch page with the latest featured YouTube release, recent uploads, and a future-ready platform seam."
        path="/watch"
        noIndex
        image={shellAssets.personalShare}
      />

      <div
        className={`watch-immersive${theatreMode ? " watch-immersive--theatre" : ""}${showOverlay ? "" : " watch-immersive--clean"}`}
        style={getBackdropStyle(activeVideo)}
      >
        <header className="watch-chrome" aria-label="Daniel Clancy watch header">
          <Link className="watch-chrome__brand" to="/home" aria-label="Daniel Clancy personal studio home">
            <span className="watch-chrome__mark" aria-hidden="true">
              <img alt="" src={shellAssets.danielLogo} />
            </span>
            <span className="watch-chrome__brand-copy">
              <span>Daniel Clancy</span>
              <small>Personal Studio</small>
            </span>
          </Link>

          <div className="watch-chrome__actions">
            <nav className="watch-chrome__platforms" aria-label="Daniel Clancy platforms">
              {WATCH_CHROME_LINKS.map((link) => (
                <a
                  key={link.label}
                  className="watch-chrome__platform-link"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${link.label} (opens in a new tab)`}
                >
                  <img alt="" src={link.icon} />
                </a>
              ))}
            </nav>
            <div className="watch-chrome__account">
              <PersonalHeaderAccount surface="watch" />
            </div>
          </div>
        </header>

        <section className={`watch-hero${theatreMode ? " watch-hero--theatre" : ""}${showOverlay ? "" : " watch-hero--clean"}`} aria-label="Featured watch release">
          <div className="watch-hero__stage">
            <div className="watch-hero__media" ref={heroMediaRef}>
              {activeVideo && heroPlayerSource.kind === "iframe" ? (
                <iframe
                  key={`${activeVideo.id}-${autoplayEnabled ? "autoplay" : "manual"}-${muted ? "muted" : "sound"}`}
                  className="watch-hero__embed"
                  src={heroPlayerSource.src}
                  title={heroPlayerSource.title}
                  loading="eager"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : activeVideo && heroPlayerSource.kind === "video" ? (
                <video
                  key={`${activeVideo.id}-${heroPlayerSource.src}`}
                  className="watch-hero__embed"
                  src={heroPlayerSource.src}
                  poster={heroPlayerSource.poster}
                  title={heroPlayerSource.title}
                  controls
                  autoPlay={autoplayEnabled}
                  muted={muted}
                  playsInline
                />
              ) : (
                <div className="watch-hero__fallback">
                  {getThumbnailUrl(activeVideo) ? (
                    <img className="watch-hero__fallback-image" src={getThumbnailUrl(activeVideo)} alt="" />
                  ) : null}
                  {activeVideo ? (
                    <div className="watch-hero__fallback-copy">
                      <strong>{heroFallbackReason === "upcoming" ? "This stream is scheduled." : "Open this release on its source platform."}</strong>
                      <p>
                        {heroFallbackReason === "offline" || heroFallbackReason === "no-live-source"
                          ? "No live player source is available right now."
                          : "This release is available from the source link."}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="watch-hero__shade" aria-hidden="true" />

              {hasSelectableVideos ? (
                <>
                  <button
                    type="button"
                    className="watch-hero__nav watch-hero__nav--previous"
                    aria-label="Show previous video"
                    onClick={() => selectAdjacentVideo(-1)}
                  >
                    <ChevronIcon direction="previous" />
                  </button>
                  <button
                    type="button"
                    className="watch-hero__nav watch-hero__nav--next"
                    aria-label="Show next video"
                    onClick={() => selectAdjacentVideo(1)}
                  >
                    <ChevronIcon direction="next" />
                  </button>
                </>
              ) : null}

              {showOverlay ? (
                <div className="watch-hero__copy">
                  <p className="watch-hero__description">{heroDescription}</p>
                  <h1>
                    <span className="watch-hero__live-dot" aria-hidden="true" />
                    <span>{heroTitle}</span>
                  </h1>
                  <div className="watch-hero__meta" aria-label="Active video metadata">
                    <span>{platformLabel}</span>
                    <span>{heroDate}</span>
                    <span>{status === "ready" ? "Available now" : "Checking sources"}</span>
                  </div>
                </div>
              ) : null}

              <div className="watch-hero__utility">
                <div className="watch-hero__controls" aria-label="Hero video controls">
                  <button
                    type="button"
                    className="watch-hero__icon-button"
                    aria-label={autoplayEnabled ? "Pause autoplay" : "Resume autoplay"}
                    aria-pressed={autoplayEnabled}
                    title={autoplayEnabled ? "Autoplay on" : "Autoplay off"}
                    onClick={() => setAutoplayEnabled((current) => !current)}
                    disabled={!activeVideo}
                  >
                    {autoplayEnabled ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  <button
                    type="button"
                    className="watch-hero__icon-button"
                    aria-label={muted ? "Unmute hero video" : "Mute hero video"}
                    aria-pressed={!muted}
                    title={muted ? "Muted" : "Sound on"}
                    onClick={() => setMuted((current) => !current)}
                    disabled={!activeVideo}
                  >
                    {muted ? <MutedIcon /> : <VolumeIcon />}
                  </button>
                  <button
                    type="button"
                    className="watch-hero__icon-button"
                    aria-label={showOverlay ? "Hide video details overlay" : "Show video details overlay"}
                    aria-pressed={!showOverlay}
                    title={showOverlay ? "Hide details" : "Show details"}
                    onClick={() => setShowOverlay((current) => !current)}
                  >
                    <OverlayIcon />
                  </button>
                  <button
                    type="button"
                    className="watch-hero__icon-button"
                    aria-label={theatreMode ? "Exit theatre mode" : "Enter theatre mode"}
                    aria-pressed={theatreMode}
                    title={theatreMode ? "Standard view" : "Theatre view"}
                    onClick={() => setTheatreMode((current) => !current)}
                  >
                    <TheatreIcon />
                  </button>
                  <button
                    type="button"
                    className="watch-hero__icon-button"
                    aria-label={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
                    aria-pressed={isFullscreen}
                    title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                    onClick={handleFullscreenToggle}
                    disabled={!activeVideo && !canEmbedHero}
                  >
                    <FullscreenIcon />
                  </button>
                </div>

                <div className="watch-hero__actions">
                  {sourceUrl ? (
                    <a className="watch-hero__source-button" href={sourceUrl} target="_blank" rel="noopener noreferrer">
                      <span>{ctaLabel}</span>
                      <img alt="" src={sourceIcon} />
                    </a>
                  ) : null}
                  {hasChannelLink ? (
                    <a className="watch-hero__secondary-button" href={feed?.channel.url} target="_blank" rel="noopener noreferrer">
                      Open channel
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {status !== "ready" ? <p className="watch-hero__feed-note">{feed?.message || FALLBACK_MESSAGE}</p> : null}
          {showDiagnostics ? (
            <p className="watch-feed-diagnostics" aria-label="Local watch media check">
              Local media check: YouTube {watchDebugMeta.youtubeCount} / manual {watchDebugMeta.manualMediaCount} / total {watchDebugMeta.mergedCount}
              {watchDebugMeta.heroId ? ` / active ${watchDebugMeta.heroId} (${watchDebugMeta.heroPlatform}: ${watchDebugMeta.heroTitle})` : ""}
              {watchDebugMeta.overrideRevision ? ` / revision ${watchDebugMeta.overrideRevision}` : ""}
            </p>
          ) : null}
        </section>

        {status === "loading" || catalogueItems.length ? (
        <div className="watch-selector-strip" aria-label="Watch lineup">
          {status === "loading" ? (
            <div className="watch-selector__rail watch-selector__rail--loading" aria-label="Loading video selector">
              {LOADING_CARDS.map((key) => (
                <div key={key} className="watch-selector__item watch-selector__item--loading">
                  <div className="placeholder-thumb" aria-hidden="true" />
                </div>
              ))}
            </div>
          ) : catalogueItems.length ? (
            <>
              <button
                type="button"
                className="watch-selector__arrow"
                aria-label="Scroll to previous videos"
                onClick={() => scrollSelector(-1)}
              >
                <ChevronIcon direction="previous" />
              </button>
              <div
                className="watch-selector__rail"
                aria-label="Video selector"
                ref={selectorRailRef}
                tabIndex={0}
                onKeyDown={handleSelectorKeyDown}
              >
                {catalogueItems.map((item) => {
                  const isActive = activeVideo?.id === item.id;
                  const portrait = isPortraitItem(item);
                  const square = isSquareItem(item);
                  const itemSourceUrl = item.videoUrl || item.externalUrl || item.canonicalUrl || "";
                  const thumbnailUrl = getThumbnailUrl(item);

                  if (item.galleryOnly || !isHeroCandidate(item)) {
                    return (
                      <a
                        key={item.id}
                        className={`watch-selector__item watch-selector__item--link${portrait ? " watch-selector__item--portrait" : ""}${square ? " watch-selector__item--square" : ""}`}
                        href={itemSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${item.title} on the source platform`}
                      >
                        <span className="watch-selector__thumb">
                          {thumbnailUrl ? <img src={thumbnailUrl} alt="" loading="lazy" /> : null}
                        </span>
                      </a>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`watch-selector__item${isActive ? " watch-selector__item--active" : ""}${portrait ? " watch-selector__item--portrait" : ""}${square ? " watch-selector__item--square" : ""}`}
                      aria-current={isActive ? "true" : undefined}
                      aria-label={`Show ${item.title} in the hero player`}
                      onClick={() => setActiveVideoId(item.id)}
                    >
                      <span className="watch-selector__thumb">
                        {thumbnailUrl ? <img src={thumbnailUrl} alt="" loading="lazy" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="watch-selector__arrow"
                aria-label="Scroll to next videos"
                onClick={() => scrollSelector(1)}
              >
                <ChevronIcon direction="next" />
              </button>
            </>
          ) : null}
        </div>
        ) : null}
      </div>

      <Section
        className="watch-catalogue-section"
        eyebrow="Watch library"
        title="Browse the latest videos and shorts."
        intro={sectionIntro}
      >
        {status === "loading" ? (
          <div className="project-grid">
            {LOADING_CARDS.map((key) => (
              <article key={key} className="surface surface--compact watch-card watch-card--loading">
                <div className="placeholder-thumb" aria-hidden="true" />
                <p className="kicker">Loading</p>
                <h3>Latest upload</h3>
                <p>Checking the latest public videos.</p>
              </article>
            ))}
          </div>
        ) : catalogueItems.length ? (
          <div className="watch-gallery-stack">
            <WatchGalleryRow
              title="Videos"
              intro="Standard widescreen releases, newest first."
              items={primaryLandscapeItems}
              page={galleryPages.landscapePrimary}
              pageSize={LANDSCAPE_GALLERY_PAGE_SIZE}
              emptyText="No widescreen videos are available in this row yet."
              activeVideoId={activeVideo?.id}
              onPageChange={(nextPage) => setGalleryPage("landscapePrimary", nextPage)}
            />
            <WatchGalleryRow
              title="More videos"
              intro="Additional widescreen releases and replays."
              items={secondaryLandscapeItems}
              page={galleryPages.landscapeSecondary}
              pageSize={LANDSCAPE_GALLERY_PAGE_SIZE}
              emptyText="No additional widescreen videos are available yet."
              activeVideoId={activeVideo?.id}
              onPageChange={(nextPage) => setGalleryPage("landscapeSecondary", nextPage)}
            />
            <WatchGalleryRow
              title="Portrait shorts"
              intro="Vertical 9:16 shorts and quick-form releases."
              items={portraitItems}
              page={galleryPages.portrait}
              pageSize={SHORT_GALLERY_PAGE_SIZE}
              emptyText="No portrait shorts are available yet."
              activeVideoId={activeVideo?.id}
              onPageChange={(nextPage) => setGalleryPage("portrait", nextPage)}
            />
            <WatchGalleryRow
              title="Square shorts"
              intro="Square 1:1 clips where that format is supplied."
              items={squareItems}
              page={galleryPages.square}
              pageSize={SHORT_GALLERY_PAGE_SIZE}
              emptyText="No square clips are available yet."
              activeVideoId={activeVideo?.id}
              onPageChange={(nextPage) => setGalleryPage("square", nextPage)}
            />
          </div>
        ) : (
          <article className="surface watch-empty-state">
            <p className="kicker">Channel update</p>
            <h3>{status === "empty" ? "No uploads are available right now." : "The latest media is temporarily unavailable."}</h3>
            <p>{feed?.message || FALLBACK_MESSAGE}</p>
            {hasChannelLink ? (
              <a className="button button--secondary" href={feed?.channel.url} target="_blank" rel="noopener noreferrer">
                Visit the channel directly
              </a>
            ) : null}
          </article>
        )}

        <SocialLinkRow className="watch-social-row" />
      </Section>
      <PersonalFooter />
    </>
  );
}
