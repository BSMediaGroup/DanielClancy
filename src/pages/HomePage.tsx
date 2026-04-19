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
  platformList,
  siteMeta,
  softwareGroups,
} from "../content/siteContent";

export function HomePage() {
  const spotlightProjects = homeSpotlightProjects;
  const recentExperience = experienceItems.slice(0, 4);

  return (
    <>
      <Seo
        title="Daniel Clancy"
        description="Professional drafting, design, CV, and portfolio presentation for Daniel Clancy."
        path="/"
      />

      <section className="hero hero--home">
        <div className="container hero__grid hero__grid--home">
          <div className="hero__copy hero__copy--home reveal">
            <p className="hero__eyebrow">Design consultant / drafting / portfolio review</p>
            <h1>Drafting and design documentation presented for employer review.</h1>
            <p className="hero__role">
              {siteMeta.name} · {siteMeta.role}
            </p>
            <p className="hero__summary">{siteMeta.heroSummary}</p>
            <p className="hero__support">{siteMeta.heroSupport}</p>

            <div className="hero__actions">
              <Link className="button button--primary" to="/cv">
                Open CV
              </Link>
              <Link className="button button--secondary" to="/portfolio">
                Explore portfolio
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
            <div className="hero-showcase__frame">
              <img
                src="/media/portfolio/pheasants-nest.jpg"
                alt="Selected documentation sample from the Pheasants Nest service centre redevelopment."
              />
              <div className="hero-showcase__overlay">
                <p className="hero-panel__label">Selected documentation sample</p>
                <strong>Pheasants Nest redevelopment</strong>
                <span>Architecture, site layout, signage, and coordination.</span>
              </div>
            </div>

            <div className="hero-showcase__stack">
              <div className="hero-showcase__card">
                <p className="hero-panel__label">Employers and studios</p>
                <div className="tag-grid tag-grid--compact">
                  {featuredEmployers.map((item) => (
                    <span key={item} className="tag tag--muted">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="hero-showcase__card hero-showcase__card--accent">
                <p className="hero-panel__label">Platform baseline</p>
                <ul className="bullet-list bullet-list--compact">
                  {platformList.slice(0, 4).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Section
        eyebrow="Software framing"
        title="Platform fluency, production discipline, and restrained presentation."
        intro="The live site leads with tools and experience. This version keeps that rhythm, but gives the competency framing a clearer editorial hierarchy."
        className="section--muted"
      >
        <div className="software-groups">
          {softwareGroups.map((group) => (
            <article key={group.label} className="surface surface--soft">
              <p className="contact-card__label">{group.label}</p>
              <h3>{group.label}</h3>
              <div className="tag-grid">
                {group.items.map((item) => (
                  <span key={item} className="tag">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="two-column-grid two-column-grid--offset">
          <div className="surface surface--soft">
            <p className="contact-card__label">Working focus</p>
            <h3>Documented, buildable, presentation-ready output.</h3>
            <div className="tag-grid">
              {focusAreas.map((item) => (
                <span key={item} className="tag tag--muted">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="surface surface--soft">
            <p className="contact-card__label">Public-site emphasis</p>
            <p>
              The current build keeps the attention on CV review, portfolio
              evidence, and direct contact rather than mixing in personal utility
              routes or speculative product features.
            </p>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Employment history"
        title="Experience remains the central proof point."
        intro="The live site gives employment history clear prominence. This home page keeps that emphasis with a shorter preview and a cleaner route into the full CV."
      >
        <div className="timeline-list">
          {recentExperience.map((item) => (
            <article key={`${item.company}-${item.period}`} className="timeline-item">
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
                <a href={item.url} target="_blank" rel="noreferrer">
                  Visit organisation
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="section-actions">
          <Link className="button button--secondary" to="/cv">
            View full CV timeline
          </Link>
        </div>
      </Section>

      <Section
        eyebrow="Selected work"
        title="Curated project documentation rather than a generic gallery."
        intro={`The live Wix portfolio is image-led and filter-driven. This home view keeps a deliberately mixed sample visible while handing ${portfolioArchive.length} curated archive entries into the portfolio page.`}
        className="section--deep"
      >
        <div className="project-grid project-grid--featured">
          {spotlightProjects.map((project) => (
            <article key={project.title} className="project-card project-card--featured">
              <img src={project.image} alt={project.title} loading="lazy" />
              <div className="project-card__body">
                <div className="project-card__header">
                  <p className="project-card__meta">{project.client}</p>
                  <span className="project-card__year">{project.year}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <div className="tag-grid tag-grid--compact">
                  {project.software.concat(project.disciplines).map((item) => (
                    <span key={`${project.title}-${item}`} className="tag tag--muted">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="section-actions">
          <Link className="button button--primary" to="/portfolio">
            Open portfolio page
          </Link>
        </div>
      </Section>

      <Section
        eyebrow="Direct contact"
        title="Prepared for CV review, hiring conversations, and portfolio follow-up."
        intro="The live site stays direct on contact. This pass keeps that simplicity while giving the call-to-action area a more finished, employer-facing shell."
      >
        <div className="cta-panel cta-panel--contact">
          <div>
            <p className="cta-panel__eyebrow">Primary contact</p>
            <h3>{siteMeta.contact.email}</h3>
            <p>{siteMeta.contact.phone}</p>
            <p>{siteMeta.contact.postal}</p>
          </div>

          <div className="cta-panel__actions">
            <Link className="button button--primary" to="/contact">
              Open contact page
            </Link>
            <Link className="button button--secondary" to="/cv">
              Download CV
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
