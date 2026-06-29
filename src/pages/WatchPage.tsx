import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { SocialLinkRow } from "../components/SocialLinkRow";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { shellAssets } from "../content/brandAssets";
import { formatWatchDate, type WatchFeedResponse, type WatchFeedVideo } from "../lib/watchFeed";

type FeedStatus = "loading" | "ready" | "empty" | "error";

const LOADING_CARDS = Array.from({ length: 4 }, (_, index) => `loading-${index}`);
const FALLBACK_MESSAGE =
  "Fresh uploads will appear here again once the channel feed is reachable.";

type EmbedOptions = {
  autoplay: boolean;
  muted: boolean;
};

function normalizePlatform(video: WatchFeedVideo | null) {
  const provider = String(video?.provider || "").toLowerCase();
  const source = String(video?.videoUrl || video?.embedUrl || "").toLowerCase();

  if (provider.includes("youtube") || source.includes("youtube.com") || source.includes("youtu.be")) {
    return "youtube";
  }

  if (provider.includes("rumble") || source.includes("rumble.com")) {
    return "rumble";
  }

  return provider || "source";
}

function getPlatformLabel(video: WatchFeedVideo | null) {
  const platform = normalizePlatform(video);

  if (platform === "youtube") {
    return "YouTube";
  }

  if (platform === "rumble") {
    return "Rumble";
  }

  return "Source platform";
}

function getSourceCtaLabel(video: WatchFeedVideo | null) {
  const platformLabel = getPlatformLabel(video);
  return platformLabel === "Source platform" ? "Watch on source platform" : `Watch on ${platformLabel}`;
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

function buildEmbedUrl(video: WatchFeedVideo | null, options: EmbedOptions) {
  if (!video || normalizePlatform(video) !== "youtube") {
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

function resolveVideos(feed: WatchFeedResponse | null) {
  const sourceItems = feed?.items?.length
    ? feed.items
    : [feed?.featured, ...(feed?.recentUploads || [])].filter(Boolean);
  const seen = new Set<string>();

  return sourceItems.filter((item): item is WatchFeedVideo => {
    if (!item?.id || seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function getBackdropStyle(video: WatchFeedVideo | null): CSSProperties | undefined {
  const thumbnailUrl = video?.thumbnailUrl?.replace(/"/g, "%22");

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

export function WatchPage() {
  const [feed, setFeed] = useState<WatchFeedResponse | null>(null);
  const [status, setStatus] = useState<FeedStatus>("loading");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [muted, setMuted] = useState(true);

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

  const videos = useMemo(() => resolveVideos(feed), [feed]);
  const activeVideo = videos.find((item) => item.id === activeVideoId) || videos[0] || null;
  const sourceUrl = activeVideo?.videoUrl || "";
  const heroEmbedUrl = buildEmbedUrl(activeVideo, { autoplay: autoplayEnabled, muted });
  const canEmbedHero = Boolean(heroEmbedUrl);
  const catalogueItems = videos;
  const hasChannelLink = Boolean(feed?.channel.url);
  const heroTitle =
    activeVideo?.title ||
    "Latest channel releases, replays, and uploads in one clean watch surface.";
  const heroDescription =
    activeVideo?.excerpt ||
    feed?.message ||
    "The watch page keeps the latest release in focus and stays usable even when the live feed is temporarily unavailable.";
  const heroDate = activeVideo ? formatWatchDate(activeVideo.publishedAt) : "Feed status";
  const platformLabel = getPlatformLabel(activeVideo);
  const ctaLabel = getSourceCtaLabel(activeVideo);
  const sectionIntro =
    status === "ready"
      ? "The complete fetched catalogue remains available below the cinematic player."
      : "The gallery holds its place and returns to live uploads as soon as the channel feed becomes available again.";

  useEffect(() => {
    if (!videos.length) {
      setActiveVideoId(null);
      return;
    }

    setActiveVideoId((current) => (current && videos.some((item) => item.id === current) ? current : videos[0].id));
  }, [videos]);

  return (
    <>
      <Seo
        title="Watch"
        description="Daniel Clancy watch page with the latest featured YouTube release, recent uploads, and a future-ready platform seam."
        path="/watch"
        noIndex
        image={shellAssets.personalShare}
      />

      <section className="hero hero--watch hero--watch-cinematic" style={getBackdropStyle(activeVideo)}>
        <div className="container watch-cinema">
          <div className="watch-cinema__stage">
            <div className="watch-cinema__player">
              {activeVideo && canEmbedHero ? (
                <iframe
                  key={`${activeVideo.id}-${autoplayEnabled ? "autoplay" : "manual"}-${muted ? "muted" : "sound"}`}
                  className="watch-player__embed watch-cinema__embed"
                  src={heroEmbedUrl}
                  title={activeVideo.title}
                  loading="eager"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="watch-player__screen watch-player__screen--fallback watch-cinema__fallback">
                  {activeVideo?.thumbnailUrl ? (
                    <img className="watch-cinema__fallback-image" src={activeVideo.thumbnailUrl} alt="" />
                  ) : null}
                  {activeVideo ? (
                    <>
                      <div className="watch-player__fallback-copy">
                        <strong>Open this release on its source platform.</strong>
                        <p>This platform is not embedded here, but the original release is available from the source link.</p>
                      </div>
                      <div className="watch-player__playhead" />
                    </>
                  ) : null}
                </div>
              )}

              <div className="watch-cinema__shade" aria-hidden="true" />

              <div className="watch-cinema__topbar">
                <span className="watch-cinema__status">{activeVideo ? "Latest release" : status === "loading" ? "Loading feed" : "Channel update"}</span>
                <div className="watch-cinema__controls" aria-label="Hero video controls">
                  <button
                    type="button"
                    className="watch-cinema__icon-button"
                    aria-label={autoplayEnabled ? "Turn autoplay off" : "Turn autoplay on"}
                    aria-pressed={autoplayEnabled}
                    title={autoplayEnabled ? "Autoplay on" : "Autoplay off"}
                    onClick={() => setAutoplayEnabled((current) => !current)}
                    disabled={!activeVideo}
                  >
                    {autoplayEnabled ? <PauseIcon /> : <PlayIcon />}
                  </button>
                  <button
                    type="button"
                    className="watch-cinema__icon-button"
                    aria-label={muted ? "Unmute hero video" : "Mute hero video"}
                    aria-pressed={!muted}
                    title={muted ? "Muted" : "Sound on"}
                    onClick={() => setMuted((current) => !current)}
                    disabled={!activeVideo}
                  >
                    {muted ? <MutedIcon /> : <VolumeIcon />}
                  </button>
                </div>
              </div>

              <div className="watch-cinema__content">
                <p className="watch-cinema__description">{heroDescription}</p>
                <h1>{heroTitle}</h1>
                <div className="watch-cinema__meta" aria-label="Active video metadata">
                  <span>{platformLabel}</span>
                  <span>{heroDate}</span>
                  <span>{status === "ready" ? "Live uploads" : "Fallback mode"}</span>
                </div>
                <div className="watch-actions watch-cinema__actions">
                  {sourceUrl ? (
                    <a className="button button--primary" href={sourceUrl} target="_blank" rel="noopener noreferrer">
                      {ctaLabel}
                    </a>
                  ) : null}
                  {hasChannelLink ? (
                    <a className="button button--secondary" href={feed?.channel.url} target="_blank" rel="noopener noreferrer">
                      Open channel
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {status === "loading" ? (
            <div className="watch-selector" aria-label="Loading video selector">
              <div className="watch-selector__rail">
                {LOADING_CARDS.map((key) => (
                  <div key={key} className="watch-selector__item watch-selector__item--loading">
                    <div className="placeholder-thumb" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </div>
          ) : catalogueItems.length ? (
            <div className="watch-selector" aria-label="Video selector">
              <div className="watch-selector__rail">
                {catalogueItems.map((item) => {
                  const isActive = activeVideo?.id === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`watch-selector__item${isActive ? " watch-selector__item--active" : ""}`}
                      aria-current={isActive ? "true" : undefined}
                      aria-label={`Show ${item.title} in the hero player`}
                      onClick={() => setActiveVideoId(item.id)}
                    >
                      <span className="watch-selector__thumb">
                        {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="" loading="lazy" /> : null}
                      </span>
                      <span className="watch-selector__caption">
                        <span>{formatWatchDate(item.publishedAt)}</span>
                        <strong>{item.title}</strong>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {status !== "ready" ? <p className="watch-cinema__feed-note">{feed?.message || FALLBACK_MESSAGE}</p> : null}
        </div>
      </section>

      <Section
        eyebrow="Full catalogue"
        title="All fetched channel releases remain available."
        intro={sectionIntro}
      >
        {status === "loading" ? (
          <div className="project-grid">
            {LOADING_CARDS.map((key) => (
              <article key={key} className="surface surface--compact watch-card watch-card--loading">
                <div className="placeholder-thumb" aria-hidden="true" />
                <p className="kicker">Loading</p>
                <h3>Latest upload</h3>
                <p>Pulling the current channel feed.</p>
              </article>
            ))}
          </div>
        ) : catalogueItems.length ? (
          <div className="project-grid">
            {catalogueItems.map((item) => (
              <article key={item.id} className="surface surface--compact watch-card">
                <a
                  href={item.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="watch-card__thumb-link"
                  aria-label={`Open ${item.title} on the source platform`}
                >
                  {item.thumbnailUrl ? (
                    <img className="watch-card__thumb" src={item.thumbnailUrl} alt={item.title} loading="lazy" />
                  ) : (
                    <span className="watch-card__thumb watch-card__thumb--placeholder" aria-hidden="true" />
                  )}
                </a>
                <p className="kicker">{formatWatchDate(item.publishedAt)}</p>
                <h3>{item.title}</h3>
                <p>{item.excerpt || "Open the upload on the source platform for the full release notes."}</p>
                <a className="text-link" href={item.videoUrl} target="_blank" rel="noopener noreferrer">
                  {getSourceCtaLabel(item)}
                </a>
              </article>
            ))}
          </div>
        ) : (
          <article className="surface watch-empty-state">
            <p className="kicker">Channel update</p>
            <h3>{status === "empty" ? "No uploads are available right now." : "The latest feed is temporarily unavailable."}</h3>
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
    </>
  );
}
