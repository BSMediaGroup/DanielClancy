import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { shellAssets, socialIcons } from "../content/brandAssets";

const contentCards = [
  {
    title: "Recent upload",
    body: "Reserved for the latest recorded piece once YouTube hydration is enabled.",
  },
  {
    title: "Livestream replay",
    body: "A future seam for live-session replay, summary copy, and outbound platform links.",
  },
  {
    title: "Archive pick",
    body: "A rotating older release or standout conversation from the wider content library.",
  },
];

export function WatchPage() {
  return (
    <>
      <Seo
        title="Watch"
        description="Daniel Clancy channel page with a featured latest-video layout and future platform seams."
        path="/watch"
        noIndex
        image={shellAssets.personalShare}
      />

      <section className="hero hero--watch">
        <div className="container watch-hero">
          <div className="watch-player">
            <div className="watch-player__screen">
              <span className="status-pill">Latest video</span>
              <div className="watch-player__playhead" />
            </div>
          </div>

          <div className="watch-details">
            <p className="kicker">Featured release</p>
            <h1>Latest video block with room for embeds, metadata, and cross-platform routing.</h1>
            <p>
              The hero is now ready for a live embed or thumbnail takeover, with adjacent detail space
              for title, release notes, runtime, and outbound watch actions.
            </p>

            <div className="info-list">
              <div>
                <span>Primary source</span>
                <strong>YouTube first</strong>
              </div>
              <div>
                <span>Secondary source</span>
                <strong>Rumble-ready</strong>
              </div>
              <div>
                <span>Future data</span>
                <strong>Runtime, publish date, links</strong>
              </div>
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
          </div>
        </div>
      </section>

      <Section
        eyebrow="Channel rows"
        title="A cleaner gallery for releases, replays, and archive picks."
        intro="These blocks are designed to hydrate cleanly later without needing another visual rewrite."
      >
        <div className="project-grid">
          {contentCards.map((item) => (
            <article key={item.title} className="surface surface--compact">
              <div className="placeholder-thumb" aria-hidden="true" />
              <p className="kicker">{item.title}</p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
