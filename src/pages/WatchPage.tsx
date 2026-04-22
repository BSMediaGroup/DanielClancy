import { useEffect, useState } from "react";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { shellAssets, socialIcons } from "../content/brandAssets";
import { formatWatchDate, type WatchFeedResponse } from "../lib/watchFeed";

type FeedStatus = "loading" | "ready" | "empty" | "error";

const LOADING_CARDS = Array.from({ length: 3 }, (_, index) => `loading-${index}`);
const FALLBACK_MESSAGE =
  "Fresh uploads will appear here again once the channel feed is reachable.";

export function WatchPage() {
  const [feed, setFeed] = useState<WatchFeedResponse | null>(null);
  const [status, setStatus] = useState<FeedStatus>("loading");

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

  const featured = feed?.featured ?? null;
  const recentUploads = feed?.recentUploads ?? [];
  const hasChannelLink = Boolean(feed?.channel.url);
  const heroTitle =
    featured?.title ||
    "Latest channel releases, replays, and uploads in one clean watch surface.";
  const heroDescription =
    featured?.excerpt ||
    feed?.message ||
    "The watch page keeps the latest release in focus and stays usable even when the live feed is temporarily unavailable.";
  const heroDate = featured ? formatWatchDate(featured.publishedAt) : "Feed status";
  const sectionIntro =
    status === "ready"
      ? "Recent uploads stay close to the featured release so the page can move cleanly to a future provider later."
      : "The gallery holds its place and returns to live uploads as soon as the channel feed becomes available again.";

  return (
    <>
      <Seo
        title="Watch"
        description="Daniel Clancy watch page with the latest featured YouTube release, recent uploads, and a future-ready platform seam."
        path="/watch"
        noIndex
        image={shellAssets.personalShare}
      />

      <section className="hero hero--watch">
        <div className="container watch-hero">
          <div className="watch-player">
            {featured ? (
              <div className="watch-player__frame">
                <span className="status-pill watch-player__status">Latest release</span>
                <iframe
                  className="watch-player__embed"
                  src={featured.embedUrl}
                  title={featured.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="watch-player__screen watch-player__screen--fallback">
                <span className="status-pill">{status === "loading" ? "Loading feed" : "Channel update"}</span>
                <div className="watch-player__fallback-copy">
                  <strong>{status === "empty" ? "No uploads are available right now." : "Latest video will return here shortly."}</strong>
                  <p>{status === "loading" ? "Checking the latest release." : FALLBACK_MESSAGE}</p>
                </div>
                <div className="watch-player__playhead" />
              </div>
            )}
          </div>

          <div className="watch-details">
            <p className="kicker">Featured release</p>
            <h1>{heroTitle}</h1>
            <p>{heroDescription}</p>

            <div className="info-list">
              <div>
                <span>Primary source</span>
                <strong>YouTube</strong>
              </div>
              <div>
                <span>Published</span>
                <strong>{heroDate}</strong>
              </div>
              <div>
                <span>Feed state</span>
                <strong>{status === "ready" ? "Live uploads" : "Fallback mode"}</strong>
              </div>
            </div>

            <div className="watch-actions">
              {featured ? (
                <a className="button button--primary" href={featured.videoUrl} target="_blank" rel="noreferrer">
                  Watch on YouTube
                </a>
              ) : null}
              {hasChannelLink ? (
                <a className="button button--secondary" href={feed?.channel.url} target="_blank" rel="noreferrer">
                  Open channel
                </a>
              ) : null}
            </div>

            <div className="logo-row">
              <span className="logo-pill">
                <img alt="" src={socialIcons.youtube} />
                <small>YouTube</small>
              </span>
              <span className="logo-pill">
                <img alt="" src={socialIcons.rumble} />
                <small>Rumble</small>
              </span>
            </div>

            {status !== "ready" ? <p className="surface-note">{feed?.message || FALLBACK_MESSAGE}</p> : null}
          </div>
        </div>
      </section>

      <Section
        eyebrow="Recent uploads"
        title="A rolling gallery of the latest channel releases."
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
        ) : recentUploads.length ? (
          <div className="project-grid">
            {recentUploads.map((item) => (
              <article key={item.id} className="surface surface--compact watch-card">
                <a href={item.videoUrl} target="_blank" rel="noreferrer" className="watch-card__thumb-link">
                  <img className="watch-card__thumb" src={item.thumbnailUrl} alt={item.title} loading="lazy" />
                </a>
                <p className="kicker">{formatWatchDate(item.publishedAt)}</p>
                <h3>{item.title}</h3>
                <p>{item.excerpt || "Open the upload on YouTube for the full release notes."}</p>
                <a className="text-link" href={item.videoUrl} target="_blank" rel="noreferrer">
                  Watch this upload
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
              <a className="button button--secondary" href={feed?.channel.url} target="_blank" rel="noreferrer">
                Visit the channel directly
              </a>
            ) : null}
          </article>
        )}
      </Section>
    </>
  );
}
