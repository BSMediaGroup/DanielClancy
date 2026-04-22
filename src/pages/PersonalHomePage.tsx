import { Link } from "react-router-dom";
import { PersonalProfileWidget } from "../components/PersonalProfileWidget";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { SocialLinkRow } from "../components/SocialLinkRow";
import { shellAssets, socialIcons } from "../content/brandAssets";

const channelHighlights = [
  {
    title: "Watch",
    body: "Featured video layout, server-hydrated YouTube releases, and a clean seam for a later Rumble migration.",
    to: "/watch",
  },
  {
    title: "Donate",
    body: "Prepared support blocks for one-off contributions, hosted payments, and future wallet messaging.",
    to: "/donate",
  },
];

export function PersonalHomePage() {
  return (
    <>
      <Seo
        title="Home"
        description="Personal home for Daniel Clancy channels, releases, and supporter links."
        path="/home"
        noIndex
        image={shellAssets.personalShare}
      />

      <section className="hero hero--personal-home">
        <div className="container hero-split hero-split--personal">
          <div className="hero-copy">
            <p className="kicker">Personal home</p>
            <h1>Channel updates, supporter paths, and future member tools.</h1>
            <p className="hero-copy__lead">
              This space is for Daniel Clancy&apos;s content-facing pages: watching, supporting, and
              future member access without crossing back into the professional portfolio navigation.
            </p>
            <div className="hero-actions">
              <Link className="button button--primary" to="/watch">
                Go to watch
              </Link>
              <Link className="button button--secondary" to="/donate">
                Support the work
              </Link>
            </div>
            <SocialLinkRow className="social-link-row--hero" />
          </div>

          <div className="surface-stack">
            <PersonalProfileWidget />

            <article className="surface surface--glow">
              <p className="kicker">Channel stack</p>
              <div className="logo-row">
                <span className="logo-pill">
                  <img alt="" src={socialIcons.youtube} />
                  <small>YouTube</small>
                </span>
                <span className="logo-pill">
                  <img alt="" src={socialIcons.rumble} />
                  <small>Rumble</small>
                </span>
                <span className="logo-pill">
                  <img alt="" src={socialIcons.locals} />
                  <small>Locals</small>
                </span>
              </div>
              <p>
                The shell stays ready for future channel hydration, supporter links, and account-aware
                features while remaining clean and intentional today.
              </p>
            </article>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Inside this shell"
        title="A personal landing page that points naturally to content and support."
        intro="The layout stays related to the broader Daniel Clancy brand, but its job is different: media, releases, and audience support."
      >
        <div className="feature-duo">
          {channelHighlights.map((item) => (
            <article key={item.title} className="surface">
              <p className="kicker">{item.title}</p>
              <h3>{item.title === "Watch" ? "Featured content and latest drops." : "Support current work and future releases."}</h3>
              <p>{item.body}</p>
              <Link className="text-link" to={item.to}>
                Open {item.title.toLowerCase()}
              </Link>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
