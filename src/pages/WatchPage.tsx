import { Link } from "react-router-dom";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";

const socialBlocks = [
  {
    title: "YouTube",
    status: "Placeholder",
    body: "Reserved for later channel integration via YouTube Data API v3 using YOUTUBE_API_KEY_DANIEL.",
  },
  {
    title: "Rumble",
    status: "Placeholder",
    body: "Reserved for stream and channel references if personal video distribution becomes part of the site footprint.",
  },
  {
    title: "Social updates",
    status: "Placeholder",
    body: "Reserved for short-form updates and outbound profile links once the public social direction is confirmed.",
  },
];

export function WatchPage() {
  return (
    <>
      <Seo
        title="Watch"
        description="Private utility scaffold for Daniel Clancy media and social link aggregation."
        path="/watch"
        noIndex
      />

      <section className="hero hero--utility">
        <div className="container hero__grid">
          <div className="hero__copy reveal">
            <p className="hero__eyebrow">Hidden utility route</p>
            <h1>Watch</h1>
            <p className="hero__summary">
              This page is intentionally separate from the employer-facing public
              experience. It is reserved for personal media, streaming, and social
              link aggregation work that may arrive later.
            </p>
            <p className="hero__support">
              It is visually aligned with the public-site system, but still kept
              clearly outside the recruiter-facing flow.
            </p>
            <div className="hero__actions">
              <Link className="button button--primary" to="/">
                Return to main site
              </Link>
            </div>
          </div>

          <div className="utility-profile reveal reveal--delay">
            <p className="utility-profile__label">Profile scaffold</p>
            <h2>Daniel Clancy</h2>
            <p>Creator / livestream / channel hub layer</p>
            <span className="utility-badge">Noindex utility route</span>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Social blocks"
        title="Placeholder seams for later platform wiring."
        intro="No API integration is implemented in this milestone. The structure below is ready for later data-source wiring."
      >
        <div className="utility-grid">
          {socialBlocks.map((item) => (
            <article key={item.title} className="surface surface--soft utility-card">
              <p className="utility-card__status">{item.status}</p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Content gallery scaffold"
        title="Latest content area"
        intro="Future YouTube ingestion can hydrate these slots without changing the route structure."
      >
        <div className="utility-gallery">
          {["Latest upload slot", "Recent livestream slot", "Archive highlight slot"].map(
            (item) => (
              <article key={item} className="surface surface--soft utility-gallery__item">
                <span className="utility-badge">Placeholder</span>
                <h3>{item}</h3>
                <p>
                  Reserved for thumbnail, title, publish time, and outbound watch
                  URL once ingestion is enabled.
                </p>
              </article>
            ),
          )}
        </div>
      </Section>
    </>
  );
}
