import { Link } from "react-router-dom";
import { CapabilityMeter } from "../components/CapabilityMeter";
import { CompanyLogoMark } from "../components/CompanyLogoMark";
import { MediaFrame } from "../components/MediaFrame";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { getSoftwareLogo, shellAssets } from "../content/brandAssets";
import {
  featuredEmployers,
  siteMeta,
} from "../content/siteContent";
import { getPortfolioSlug } from "../lib/portfolio";
import { getProjectThumbnailUrl, usePublicSiteData } from "../lib/publicSiteData";

const softwareCapabilities = [
  { name: "Autodesk Revit", score: 92, note: "Production documentation and coordination" },
  { name: "Autodesk AutoCAD", score: 95, note: "Drawing packages, markups, and technical revisions" },
  { name: "Adobe Creative Cloud", score: 84, note: "Presentation polish, layouts, and visual support" },
  { name: "Microsoft Office", score: 88, note: "Reports, schedules, and review packs" },
  { name: "Trimble SketchUp", score: 79, note: "Concept support and quick modelling" },
  { name: "QGIS", score: 68, note: "Spatial context and mapping support" },
];

const homeHeroDetails = ["Sydney, Australia", "17 years since 2008", "Revit / AutoCAD / Adobe CC"];

const homeHeroSummary =
  "Documentation-led design review, drafting depth, and project evidence shaped across structural, architectural, urban, landscape, and infrastructure work.";

export function HomePage() {
  const { projects, positions } = usePublicSiteData();
  const spotlightProjects = projects.filter((project) => project.featured).slice(0, 3);
  const recentExperience = positions.slice(0, 4);

  return (
    <>
      <Seo
        title="Daniel Clancy"
        description="Drafting, documentation, and project evidence for Daniel Clancy."
        path="/"
        image={shellAssets.professionalShare}
      />

      <section className="hero hero--professional-home">
        <div
          className="hero-home__backdrop"
          aria-hidden="true"
          style={{ backgroundImage: `url(${shellAssets.professionalHeroBanner})` }}
        />
        <div className="container hero-home__content">
          <div className="hero-home__inner">
            <div className="hero-home__portrait-shell">
              <img
                alt="Portrait of Daniel Clancy"
                className="hero-home__portrait"
                loading="eager"
                src={shellAssets.profileAvatar}
              />
            </div>

            <div className="hero-home__identity">
              <p className="kicker">Professional home</p>
              <h1>Daniel Clancy</h1>
              <p className="hero-home__role">{siteMeta.role}</p>
              <div className="hero-home__divider" aria-hidden="true" />
              <p className="hero-home__summary">{homeHeroSummary}</p>

              <div aria-label="Professional overview" className="hero-home__details">
                {homeHeroDetails.map((item) => (
                  <span key={item} className="hero-home__detail">
                    {item}
                  </span>
                ))}
              </div>

              <div className="hero-home__links">
                <Link className="text-link" to="/portfolio">
                  Explore portfolio
                </Link>
                <Link className="text-link" to="/cv">
                  Review CV
                </Link>
              </div>
            </div>
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
              <MediaFrame alt={project.title} src={getProjectThumbnailUrl(project)} />
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
              <article key={`${item.companyName}-${item.period || item.startDate}`} className="timeline-card">
                <div className="timeline-card__meta">
                  <span>{item.period || formatPositionPeriod(item.startDate, item.endDate, item.current)}</span>
                  <small>{item.location}</small>
                  <div className="timeline-card__logo">
                    <CompanyLogoMark company={item.companyName} variant="monochrome" />
                  </div>
                </div>
                <div className="timeline-card__body">
                  <div className="timeline-card__heading">
                    <div>
                      <h3>{item.companyName}</h3>
                      <p>{item.title}</p>
                    </div>
                  </div>
                  <p>{item.summary}</p>
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

function formatPositionPeriod(startDate?: string, endDate?: string, current?: boolean) {
  const start = formatMonthYear(startDate);
  const end = current ? "Present" : formatMonthYear(endDate);
  if (start && end) return `${start} – ${end}`;
  return start || end || "Undated";
}

function formatMonthYear(value?: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
  }).format(parsed);
}
