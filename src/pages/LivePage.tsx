import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Seo } from "../components/Seo";
import { SocialLinkRow } from "../components/SocialLinkRow";
import { shellAssets, socialIcons } from "../content/brandAssets";
import type { PublicWatchMedia } from "../data/public-site-fallback";
import { usePublicSiteData } from "../lib/publicSiteData";
import {
  compareWatchMediaNewestFirst,
  isScaffoldWatchMediaEntry,
  isVisibleWatchMediaEntry,
  normalizeWatchPlatform,
  type WatchFeedVideo,
} from "../lib/watchFeed";
import { resolveWatchPlayerSource } from "../lib/watchPlayer";

type LiveStatusKind = "live" | "upcoming" | "offline" | "replay";

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

function DetailsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 5h16v14H4z" />
      <path d="M7 15h8M7 11h10" />
    </svg>
  );
}

function isLivestreamCandidate(item: PublicWatchMedia) {
  if (!isVisibleWatchMediaEntry(item) || isScaffoldWatchMediaEntry(item)) return false;
  const entryType = String(item.entryType || "").toLowerCase();
  const liveStatus = String(item.liveStatus || "").toLowerCase();
  const platform = normalizeWatchPlatform({
    provider: item.sourcePlatform,
    sourcePlatform: item.sourcePlatform,
    videoUrl: item.sourceUrl || item.externalUrl || item.canonicalUrl || "",
    embedUrl: item.embedUrl || "",
    hlsUrl: item.hlsUrl || "",
    customEmbedUrl: item.customEmbedUrl || "",
    cloudflareStreamUid: item.cloudflareStreamUid || item.streamUid || "",
  });

  return (
    entryType === "livestream" ||
    ["live", "ready", "upcoming", "offline", "no-live-source", "replay", "ended"].includes(liveStatus) ||
    platform === "cloudflare_stream" ||
    platform === "hls"
  );
}

function normalizeLiveItem(item: PublicWatchMedia): WatchFeedVideo {
  const sourcePlatform = String(item.sourcePlatform || "manual").toLowerCase();
  const sourceUrl = item.sourceUrl || item.externalUrl || item.canonicalUrl || "";
  return {
    id: item.id,
    provider: sourcePlatform as WatchFeedVideo["provider"],
    sourcePlatform,
    entryType: item.entryType || "livestream",
    source: item.source || "manual",
    title: item.title,
    description: item.description || "",
    excerpt: item.excerpt || item.description || "",
    publishedAt: item.publishedAt || null,
    enteredAt: item.enteredAt,
    sortDate: item.sortDate || item.scheduledStartAt || item.publishedAt || item.enteredAt || item.createdAt || item.updatedAt,
    createdAt: item.createdAt,
    thumbnailUrl: item.thumbnailUrl || "",
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
    channelTitle: "Daniel Clancy",
    liveStatus: item.liveStatus,
    scheduledStartAt: item.scheduledStartAt,
    startedAt: item.startedAt,
    endedAt: item.endedAt,
    visible: item.visible,
    featured: item.featured,
    manualHeroEligible: item.manualHeroEligible,
    heroEmbeddable: item.heroEmbeddable,
    galleryOnly: item.galleryOnly,
    aspect: item.aspect || "landscape",
    tags: item.tags || [],
  };
}

function resolveLiveStatus(video: WatchFeedVideo | null): LiveStatusKind {
  if (!video) return "offline";
  const liveStatus = String(video.liveStatus || "").toLowerCase();
  if (liveStatus === "live" || liveStatus === "ready") return "live";
  if (liveStatus === "upcoming") return "upcoming";
  if (liveStatus === "replay" || liveStatus === "ended") return "replay";
  return "offline";
}

function getStatusCopy(status: LiveStatusKind, video: WatchFeedVideo | null) {
  if (status === "live") {
    return {
      label: "Live now",
      title: video?.title || "Daniel Clancy is live",
      body: video?.excerpt || video?.description || "The broadcast is active. Use theatre or fullscreen mode for a larger viewing experience.",
    };
  }

  if (status === "upcoming") {
    return {
      label: "Upcoming broadcast",
      title: video?.title || "Next live broadcast",
      body: video?.excerpt || video?.description || "The next broadcast will be available here when it begins.",
    };
  }

  if (status === "replay") {
    return {
      label: "Replay",
      title: video?.title || "Broadcast replay",
      body: video?.excerpt || video?.description || "This broadcast has ended. Watch the replay here when a public replay is available.",
    };
  }

  return {
    label: "Offline",
    title: "Daniel is offline right now",
    body: "The next broadcast will appear here when it is available.",
  };
}

function formatLiveDate(video: WatchFeedVideo | null, status: LiveStatusKind) {
  const value =
    status === "upcoming"
      ? video?.scheduledStartAt || video?.sortDate || video?.publishedAt
      : status === "live"
        ? video?.startedAt || video?.scheduledStartAt || video?.sortDate || video?.publishedAt
        : status === "replay"
          ? video?.endedAt || video?.publishedAt || video?.sortDate
          : "";

  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(parsed);
}

function getPlatformLabel(video: WatchFeedVideo | null) {
  const platform = normalizeWatchPlatform(video);
  if (platform === "youtube") return "YouTube";
  if (platform === "rumble") return "Rumble";
  if (platform === "cloudflare_stream") return "Live player";
  if (platform === "hls") return "Live video";
  if (platform === "custom_embed") return "Embedded video";
  return "";
}

function getPlatformIcon(video: WatchFeedVideo | null) {
  const platform = normalizeWatchPlatform(video);
  if (platform === "youtube") return socialIcons.youtube;
  if (platform === "rumble") return socialIcons.rumble;
  return socialIcons.link;
}

function getBackdropStyle(video: WatchFeedVideo | null) {
  const thumbnailUrl = video?.thumbnailUrl?.replace(/"/g, "%22");
  return thumbnailUrl ? ({ "--live-backdrop": `url("${thumbnailUrl}")` } as CSSProperties) : undefined;
}

export function LivePage() {
  const { watchMedia } = usePublicSiteData();
  const playerRef = useRef<HTMLDivElement | null>(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [muted, setMuted] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [theatreMode, setTheatreMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const liveVideo = useMemo(() => {
    const candidates = watchMedia
      .filter(isLivestreamCandidate)
      .map(normalizeLiveItem)
      .sort((left, right) => {
        const leftStatus = resolveLiveStatus(left);
        const rightStatus = resolveLiveStatus(right);
        const statusWeight: Record<LiveStatusKind, number> = { live: 0, upcoming: 1, replay: 2, offline: 3 };
        return statusWeight[leftStatus] - statusWeight[rightStatus] || compareWatchMediaNewestFirst(left, right);
      });
    return candidates[0] || null;
  }, [watchMedia]);

  const liveStatus = resolveLiveStatus(liveVideo);
  const statusCopy = getStatusCopy(liveStatus, liveVideo);
  const liveDate = formatLiveDate(liveVideo, liveStatus);
  const playerSource = resolveWatchPlayerSource(liveVideo, { autoplay: autoplayEnabled, muted });
  const sourceUrl = liveVideo?.externalUrl || liveVideo?.canonicalUrl || liveVideo?.videoUrl || "";
  const sourceLabel = getPlatformLabel(liveVideo);
  const sourceIcon = getPlatformIcon(liveVideo);
  const hasPlayableSource = playerSource.kind === "iframe" || playerSource.kind === "video";
  const showPlayer = hasPlayableSource && liveStatus !== "offline";

  async function handleFullscreenToggle() {
    const target = playerRef.current;
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
      // Browser/fullscreen policy failures fall back to the page-level theatre view.
    }

    setTheatreMode(true);
  }

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  return (
    <>
      <Seo
        title="Live"
        description="Watch Daniel Clancy live broadcasts, scheduled streams, and public replays from the dedicated live page."
        path="/live"
        image={shellAssets.personalShare}
      />

      <div className={`live-page${theatreMode ? " live-page--theatre" : ""}`} style={getBackdropStyle(liveVideo)}>
        <section className="live-hero" aria-labelledby="live-page-title">
          <div className="container live-hero__layout">
            <div className="live-player-shell">
              <div className="live-player-shell__topline" aria-live="polite">
                <span className={`live-status live-status--${liveStatus}`}>
                  <span aria-hidden="true" />
                  {statusCopy.label}
                </span>
                {liveDate ? <time dateTime={liveDate}>{liveDate}</time> : null}
              </div>

              <div className="live-player" ref={playerRef} aria-label={`${statusCopy.label}: ${statusCopy.title}`}>
                {showPlayer && liveVideo && playerSource.kind === "iframe" ? (
                  <iframe
                    key={`${liveVideo.id}-${autoplayEnabled ? "autoplay" : "manual"}-${muted ? "muted" : "sound"}`}
                    className="live-player__embed"
                    src={playerSource.src}
                    title={playerSource.title}
                    loading="eager"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : showPlayer && liveVideo && playerSource.kind === "video" ? (
                  <video
                    key={`${liveVideo.id}-${playerSource.src}`}
                    className="live-player__embed"
                    src={playerSource.src}
                    poster={playerSource.poster}
                    title={playerSource.title}
                    controls
                    autoPlay={autoplayEnabled}
                    muted={muted}
                    playsInline
                  />
                ) : (
                  <div className="live-player__state" role="status" aria-live="polite">
                    {liveVideo?.thumbnailUrl ? <img src={liveVideo.thumbnailUrl} alt="" /> : <img src={shellAssets.danielLogo} alt="" />}
                    <div>
                      <h1 id="live-page-title">{statusCopy.title}</h1>
                      <p>{statusCopy.body}</p>
                    </div>
                  </div>
                )}

                <div className={`live-player__shade${showDetails ? "" : " live-player__shade--quiet"}`} aria-hidden="true" />

                {showDetails && showPlayer ? (
                  <div className="live-player__overlay">
                    <p>{statusCopy.body}</p>
                    <h1 id="live-page-title">{statusCopy.title}</h1>
                  </div>
                ) : null}

                <div className="live-player__controls" aria-label="Live player controls">
                  <button
                    type="button"
                    aria-label={autoplayEnabled ? "Pause autoplay" : "Resume autoplay"}
                    aria-pressed={autoplayEnabled}
                    onClick={() => setAutoplayEnabled((current) => !current)}
                    disabled={!liveVideo}
                  >
                    {autoplayEnabled ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  <button
                    type="button"
                    aria-label={muted ? "Unmute live player" : "Mute live player"}
                    aria-pressed={!muted}
                    onClick={() => setMuted((current) => !current)}
                    disabled={!liveVideo}
                  >
                    {muted ? <MutedIcon /> : <VolumeIcon />}
                  </button>
                  <button
                    type="button"
                    aria-label={showDetails ? "Hide stream details" : "Show stream details"}
                    aria-pressed={showDetails}
                    onClick={() => setShowDetails((current) => !current)}
                  >
                    <DetailsIcon />
                  </button>
                  <button
                    type="button"
                    aria-label={theatreMode ? "Exit theatre view" : "Enter theatre view"}
                    aria-pressed={theatreMode}
                    onClick={() => setTheatreMode((current) => !current)}
                  >
                    <TheatreIcon />
                  </button>
                  <button
                    type="button"
                    aria-label={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
                    aria-pressed={isFullscreen}
                    onClick={handleFullscreenToggle}
                    disabled={!liveVideo}
                  >
                    <FullscreenIcon />
                  </button>
                </div>
              </div>
            </div>

            <aside className="live-side-panel" aria-label="Stream details">
              <span className={`live-status live-status--${liveStatus}`}>
                <span aria-hidden="true" />
                {statusCopy.label}
              </span>
              <h2>{statusCopy.title}</h2>
              <p>{statusCopy.body}</p>
              <dl className="live-meta-list">
                <div>
                  <dt>Status</dt>
                  <dd>{statusCopy.label}</dd>
                </div>
                {liveDate ? (
                  <div>
                    <dt>{liveStatus === "upcoming" ? "Scheduled" : liveStatus === "replay" ? "Recorded" : "Started"}</dt>
                    <dd>{liveDate}</dd>
                  </div>
                ) : null}
                {sourceLabel ? (
                  <div>
                    <dt>Platform</dt>
                    <dd>{sourceLabel}</dd>
                  </div>
                ) : null}
              </dl>
              <div className="live-side-panel__actions">
                {sourceUrl && liveStatus !== "offline" ? (
                  <a className="button button--secondary live-source-link" href={sourceUrl} target="_blank" rel="noopener noreferrer">
                    <span>{sourceLabel ? `Open on ${sourceLabel}` : "Open stream"}</span>
                    <img alt="" src={sourceIcon} />
                  </a>
                ) : null}
                <Link className="button" to="/donate">
                  Support the channel
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <section className="live-details-section">
          <div className="container live-details-grid">
            <article className="live-details-card">
              <p className="kicker">About the stream</p>
              <h2>{liveStatus === "offline" ? "Live broadcasts will appear here." : statusCopy.title}</h2>
              <p>
                {liveVideo?.description ||
                  "Broadcast notes, replays, and conversation will stay grouped here for each public live session."}
              </p>
            </article>

            <article className="live-engagement-panel" aria-label="Stream reactions">
              <div className="live-panel-header">
                <div>
                  <p className="kicker">Reactions</p>
                  <h2>Viewer feedback</h2>
                </div>
                <span>Not saved yet</span>
              </div>
              <div className="live-reaction-row">
                <button type="button" disabled aria-label="Like this broadcast">
                  Like
                </button>
                <button type="button" disabled aria-label="Dislike this broadcast">
                  Dislike
                </button>
              </div>
              <p>Reactions will be available when broadcast interaction is enabled.</p>
            </article>

            <article className="live-conversation-panel" aria-label="Live conversation">
              <div className="live-panel-header">
                <div>
                  <p className="kicker">Conversation</p>
                  <h2>Live discussion</h2>
                </div>
                <span>Read-only</span>
              </div>
              <div className="live-comment-list" role="log" aria-live="polite">
                <p>Live discussion will appear here during broadcasts.</p>
              </div>
              <label className="live-comment-box">
                <span>Message</span>
                <textarea disabled placeholder="Conversation opens during supported broadcasts." />
              </label>
              <button type="button" className="button button--secondary" disabled>
                Send message
              </button>
            </article>

            <article className="live-follow-panel">
              <p className="kicker">Follow</p>
              <h2>Keep up with new broadcasts.</h2>
              <p>Use the public channel links for live notifications, replays, and updates.</p>
              <SocialLinkRow className="live-social-row" />
            </article>
          </div>
        </section>
      </div>
    </>
  );
}
