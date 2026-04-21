import { Link } from "react-router-dom";
import { CapabilityMeter } from "../components/CapabilityMeter";
import { CompanyLogoMark } from "../components/CompanyLogoMark";
import { MediaFrame } from "../components/MediaFrame";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { getSoftwareLogo, shellAssets } from "../content/brandAssets";
import {
  experienceItems,
  featuredEmployers,
  homeMetrics,
  homeSpotlightProjects,
  siteMeta,
} from "../content/siteContent";
import { getPortfolioSlug } from "../lib/portfolio";

const softwareCapabilities = [
  { name: "Autodesk Revit", score: 92, note: "Production documentation and coordination" },
  { name: "Autodesk AutoCAD", score: 95, note: "Drawing packages, markups, and technical revisions" },
  { name: "Adobe Creative Cloud", score: 84, note: "Presentation polish, layouts, and visual support" },
  { name: "Microsoft Office", score: 88, note: "Reports, schedules, and review packs" },
  { name: "Trimble SketchUp", score: 79, note: "Concept support and quick modelling" },
  { name: "QGIS", score: 68, note: "Spatial context and mapping support" },
];

export function HomePage() {
  const spotlightProjects = homeSpotlightProjects;
  const leadProject = spotlightProjects[0];
  const recentExperience = experienceItems.slice(0, 4);

  return (
    <>
      <Seo
        title="Daniel Clancy"
        description="Drafting, documentation, and project evidence for Daniel Clancy."
        path="/"
        image={shellAssets.professionalShare}
      />

      <section className="hero hero--professional-home">
        <div className="hero__backdrop hero__backdrop--portrait" aria-hidden="true" />
        <div className="container hero-split hero-split--home">
          <div className="hero-copy">
            <p className="kicker">Documentation-led design consultant</p>
            <h1>Drafting depth, disciplined project records, and a cleaner professional review path.</h1>
            <p className="hero-copy__lead">{siteMeta.heroSummary}</p>
            <p className="hero-copy__support">{siteMeta.heroSupport}</p>

            <div className="hero-actions">
              <Link className="button button--primary" to="/portfolio">
                Explore portfolio
              </Link>
              <Link className="button button--secondary" to="/cv">
                Review CV
              </Link>
            </div>

            <div className="metric-row">
              {homeMetrics.map((item) => (
                <article key={item.label} className="metric-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.note}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="hero-column">
            <article className="portrait-panel">
              <div className="portrait-panel__media">
                <MediaFrame
                  alt="Portrait of Daniel Clancy"
                  loading="eager"
                  aspectRatio={0.92}
                  src={shellAssets.heroPortrait}
                />
              </div>
              <div className="portrait-panel__body">
                <p className="kicker">Based in Sydney</p>
                <h2>Available for design documentation, drafting support, and portfolio review conversations.</h2>
              </div>
            </article>

            {leadProject ? (
              <article className="feature-panel">
                <p className="kicker">Selected work</p>
                <div className="feature-panel__header">
                  <div>
                    <h2>{leadProject.title}</h2>
                    <p>{leadProject.client}</p>
                  </div>
                  <span>{leadProject.dateLabel}</span>
                </div>
                <p>{leadProject.summary}</p>
                <div className="logo-row logo-row--small">
                  {leadProject.software.map((item) => {
                    const logo = getSoftwareLogo(item);
                    return logo ? (
                      <span key={`${leadProject.id}-${item}`} className="logo-pill">
                        <img alt="" src={logo} />
                        <small>{item}</small>
                      </span>
                    ) : null;
                  })}
                </div>
                <Link className="button button--ghost" to={`/portfolio/${getPortfolioSlug(leadProject)}`}>
                  Open project detail
                </Link>
              </article>
            ) : null}
          </div>
        </div>
      </section>

      <Section
        eyebrow="Selected projects"
        title="A tighter first pass through representative work."
        intro="The home page now moves directly from introduction to project evidence, software capability, and current chronology."
      >
        <div className="project-grid project-grid--featured">
          {spotlightProjects.map((project) => (
            <article key={project.id} className="project-card">
              <MediaFrame alt={project.title} src={project.image} />
              <div className="project-card__body">
                <div className="project-card__topline">
                  <p>{project.client}</p>
                  <span>{project.year}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <div className="project-card__meta">
                  <span>{project.studio.join(" / ")}</span>
                  <span>{project.location ?? project.sector ?? "Project record"}</span>
                </div>
                <Link className="text-link" to={`/portfolio/${getPortfolioSlug(project)}`}>
                  View detail
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Software capability"
        title="Core production tools with clear depth of use."
        intro="The strongest value signal here is not software name-dropping, but consistent ability across production drafting, documentation, presentation, and review support."
        className="section--muted"
      >
        <div className="capability-grid">
          <div className="capability-list">
            {softwareCapabilities.map((item) => {
              const logo = getSoftwareLogo(item.name);

              return (
                <CapabilityMeter key={item.name} logo={logo} name={item.name} note={item.note} score={item.score} />
              );
            })}
          </div>

          <div className="surface-stack">
            <article className="surface">
              <p className="kicker">Studios and employers</p>
              <div className="logo-grid logo-grid--employers">
                {featuredEmployers.map((item) => {
                  return (
                    <span key={item} className="logo-plate logo-plate--square">
                      <CompanyLogoMark company={item} variant="monochrome" />
                    </span>
                  );
                })}
              </div>
            </article>

            <article className="surface">
              <p className="kicker">Current emphasis</p>
              <h3>Readable drawing sets, restrained visual polish, and evidence that stands up to review.</h3>
              <p>
                The site keeps the tone calm and documentation-forward while still presenting the work
                with more intention than a plain archive dump.
              </p>
            </article>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Recent chronology"
        title="Recent roles and studio context."
        intro="A short timeline here keeps the home page useful without making it compete with the full CV."
      >
        <div className="timeline-list">
          {recentExperience.map((item) => {
            return (
              <article key={`${item.company}-${item.period}`} className="timeline-card">
                <div className="timeline-card__meta">
                  <span>{item.period}</span>
                  <small>{item.location}</small>
                </div>
                <div className="timeline-card__body">
                  <div className="timeline-card__heading">
                    <div>
                      <h3>{item.company}</h3>
                      <p>{item.role}</p>
                    </div>
                  </div>
                  <p>{item.summary}</p>
                  <div className="timeline-card__logo">
                    <CompanyLogoMark company={item.company} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="section-actions">
          <Link className="button button--secondary" to="/cv">
            View full CV
          </Link>
          <Link className="button button--ghost" to="/contact">
            Make contact
          </Link>
        </div>
      </Section>
    </>
  );
}
