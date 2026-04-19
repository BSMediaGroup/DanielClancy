import { Link } from "react-router-dom";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import {
  experienceItems,
  featuredEmployers,
  focusAreas,
  homeSpotlightProjects,
  homeMetrics,
  portfolioArchive,
  siteMeta,
  softwareGroups,
} from "../content/siteContent";

const portraitImage = new URL("../../assets/backgrounds/danielclancy-portrait.webp", import.meta.url)
  .href;

export function HomePage() {
  const spotlightProjects = homeSpotlightProjects;
  const recentExperience = experienceItems.slice(0, 4);
  const leadProject = spotlightProjects[0];

  return (
    <>
      <Seo
        title="Daniel Clancy"
        description="Professional drafting, design, CV, and portfolio presentation for Daniel Clancy."
        path="/"
      />

      <section className="hero hero--home hero--poster">
        <div className="hero__backdrop" aria-hidden="true" />
        <div className="container hero__grid hero__grid--home">
          <div className="hero__copy hero__copy--home reveal">
            <p className="hero__eyebrow">Architecture / drafting / digital portfolio</p>
            <h1>Daniel Clancy</h1>
            <p className="hero__role">Design consultant with 17 years of production-focused documentation experience.</p>
            <p className="hero__summary">{siteMeta.heroSummary}</p>
            <p className="hero__support">{siteMeta.heroSupport}</p>

            <div className="hero__actions">
              <Link className="button button--primary" to="/cv">
                Review CV
              </Link>
              <Link className="button button--secondary" to="/portfolio">
                Open portfolio
              </Link>
            </div>

            <div className="metric-strip metric-strip--hero">
              {homeMetrics.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.note}</small>
                </div>
              ))}
            </div>
          </div>

          <aside className="hero-showcase reveal reveal--delay">
            <div className="hero-portrait">
              <div className="hero-portrait__frame">
                <img
                  src={portraitImage}
                  alt="Portrait of Daniel Clancy."
                />
              </div>

              <div className="hero-portrait__note">
                <p className="hero-panel__label">Current focus</p>
                <strong>Recruiter-ready documentation archive</strong>
                <span>Architecture, drafting, and technical design evidence presented with clearer editorial structure.</span>
              </div>
            </div>

            {leadProject ? (
              <div className="hero-showcase__card hero-showcase__card--spotlight">
                <p className="hero-panel__label">Selected evidence</p>
                <h2>{leadProject.title}</h2>
                <p>{leadProject.summary}</p>
                <div className="tag-grid tag-grid--compact">
                  {leadProject.software.concat(leadProject.disciplines).slice(0, 4).map((item) => (
                    <span key={`${leadProject.id}-${item}`} className="tag tag--muted">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <Section
        eyebrow="Selected work"
        title="Curated documentation, not generic portfolio filler."
        intro={`The public site now opens with stronger composition, but the core hiring job stays the same: surface ${portfolioArchive.length} truthful archive records quickly and let featured work carry the first impression.`}
        className="section--muted"
      >
        <div className="project-grid project-grid--featured">
          {spotlightProjects.map((project, index) => (
            <article
              key={project.id}
              className={`project-card project-card--featured project-card--offset-${index + 1}`}
            >
              <img src={project.image} alt={project.title} loading="lazy" />
              <div className="project-card__body">
                <div className="project-card__header">
                  <p className="project-card__meta">{project.client}</p>
                  <span className="project-card__year">{project.year}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <div className="project-card__meta-list">
                  <span>{project.studio.join(" / ")}</span>
                  <span>{project.location ?? project.sector ?? "Archive entry"}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Professional profile"
        title="Experience depth, software fluency, and a direct review path."
        intro="The middle of the site now behaves more like an editorial dossier: large evidence moments on one side, denser review information on the other."
      >
        <div className="editorial-grid">
          <article className="surface surface--feature">
            <p className="contact-card__label">Recent chronology</p>
            <div className="timeline-list timeline-list--compact">
              {recentExperience.map((item) => (
                <article key={`${item.company}-${item.period}`} className="timeline-item timeline-item--compact">
                  <div className="timeline-item__meta">
                    <p>{item.period}</p>
                    <span>{item.location}</span>
                  </div>
                  <div className="timeline-item__body">
                    <div className="timeline-item__heading">
                      <h3>{item.company}</h3>
                      <p className="timeline-item__role">{item.role}</p>
                    </div>
                    <p>{item.summary}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="section-actions">
              <Link className="button button--secondary" to="/cv">
                View full CV timeline
              </Link>
            </div>
          </article>

          <div className="editorial-grid__stack">
            <article className="surface surface--soft">
              <p className="contact-card__label">Studios and employers</p>
              <div className="tag-grid">
                {featuredEmployers.map((item) => (
                  <span key={item} className="tag tag--muted">
                    {item}
                  </span>
                ))}
              </div>
            </article>

            <article className="surface surface--soft">
              <p className="contact-card__label">Working focus</p>
              <div className="tag-grid">
                {focusAreas.map((item) => (
                  <span key={item} className="tag">
                    {item}
                  </span>
                ))}
              </div>
            </article>

            <article className="surface surface--soft">
              <p className="contact-card__label">Software framing</p>
              <div className="software-columns">
                {softwareGroups.map((group) => (
                  <div key={group.label}>
                    <span className="filter-stack__label">{group.label}</span>
                    <ul className="bullet-list bullet-list--compact">
                      {group.items.map((item) => (
                        <li key={`${group.label}-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Contact"
        title="Prepared for CV review, project follow-up, and direct hiring conversation."
        intro="The employer-facing routes stay explicit: review the CV, inspect the archive, or contact Daniel directly."
        className="section--deep"
      >
        <div className="cta-panel cta-panel--contact">
          <div>
            <p className="cta-panel__eyebrow">Primary contact</p>
            <h3>{siteMeta.contact.email}</h3>
            <p>{siteMeta.contact.phone}</p>
            <p>{siteMeta.contact.location}</p>
          </div>

          <div className="cta-panel__actions">
            <Link className="button button--primary" to="/contact">
              Contact Daniel
            </Link>
            <Link className="button button--secondary" to="/portfolio">
              Browse archive
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
