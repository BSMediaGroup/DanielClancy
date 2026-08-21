import { Link } from "react-router-dom";
import { CompanyLogoMark } from "../components/CompanyLogoMark";
import { MediaFrame } from "../components/MediaFrame";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { getSoftwareLogo, shellAssets } from "../content/brandAssets";
import { featuredEmployers, homeMetrics, siteMeta } from "../content/siteContent";
import {
  disciplineOrder,
  getDocumentationType,
  getPortfolioFamily,
  getPortfolioSlug,
} from "../lib/portfolio";
import {
  getPlatformIconPath,
  getProjectThumbnailUrl,
  resolvePlatformByIdNameSlug,
  usePublicSiteData,
} from "../lib/publicSiteData";

const softwareTools = [
  { name: "Autodesk AutoCAD", note: "Drawing packages, markups, and technical revisions", category: "Core drafting" },
  { name: "Autodesk Revit", note: "Production documentation and coordination", category: "Core BIM" },
  { name: "Adobe Creative Cloud", note: "Presentation polish, layouts, and visual support", category: "Presentation" },
  { name: "Trimble SketchUp", note: "Concept support and quick modelling", category: "3D support" },
  { name: "Microsoft Office", note: "Reports, schedules, and review packs", category: "Coordination" },
  { name: "QGIS", note: "Spatial context and mapping support", category: "Spatial" },
];

export function HomePage() {
  const { projects, positions, platforms } = usePublicSiteData();
  const spotlightProjects = projects.filter((project) => project.featured).slice(0, 3);
  const selectedProjects = spotlightProjects.length ? spotlightProjects : projects.slice(0, 3);
  const leadProject = selectedProjects[0];
  const recentExperience = positions.slice(0, 4);
  const disciplineRecords = disciplineOrder
    .map((name) => ({
      name,
      count: projects.filter((project) => project.disciplines.includes(name)).length,
    }))
    .filter((item) => item.count > 0);

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
        <div className="container professional-hero">
          <div className="professional-hero__copy">
            <p className="kicker">Professional profile · Sydney, Australia</p>
            <h1 aria-label="Daniel Clancy">
              <span>Daniel</span>
              <span className="professional-hero__outline">Clancy</span>
            </h1>
            <p className="professional-hero__role">{siteMeta.role}</p>
            <p className="professional-hero__summary">{siteMeta.heroSummary}</p>

            <div className="professional-hero__disciplines" aria-label="Primary disciplines">
              {disciplineRecords.slice(0, 4).map((item) => (
                <span key={item.name}>{item.name}</span>
              ))}
            </div>

            <div className="hero-actions">
              <Link className="button button--primary" to="/portfolio">
                Review selected work
              </Link>
              <Link className="button button--secondary" to="/cv">
                Open CV overview
              </Link>
            </div>

            <dl className="professional-hero__contact" aria-label="Professional contact summary">
              <div>
                <dt>Location</dt>
                <dd>{siteMeta.contact.location}</dd>
              </div>
              <div>
                <dt>Telephone</dt>
                <dd>
                  <a href="tel:+61458747524">{siteMeta.contact.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${siteMeta.contact.email}`}>{siteMeta.contact.email}</a>
                </dd>
              </div>
            </dl>
          </div>

          {leadProject ? (
            <Link
              className="professional-evidence-board"
              to={`/portfolio/${getPortfolioSlug(leadProject)}`}
              aria-label={`Open project record for ${leadProject.title}`}
            >
              <div className="professional-evidence-board__head">
                <span>Project evidence / drawing record</span>
                <span>Sheet 01 · Public</span>
              </div>
              <div className="professional-evidence-board__media">
                <MediaFrame
                  alt={leadProject.title}
                  fit="contain"
                  loading="eager"
                  src={getProjectThumbnailUrl(leadProject)}
                />
                <div className="professional-evidence-board__callout">
                  <strong>Evidence first</strong>
                  <span>Scope, software, studio context, and project documentation.</span>
                </div>
              </div>
              <div className="professional-evidence-board__foot">
                <div>
                  <span>Current feature</span>
                  <strong>{leadProject.title}</strong>
                </div>
                <div>
                  <span>Studio</span>
                  <strong>{getPortfolioFamily(leadProject)}</strong>
                </div>
                <div>
                  <span>Year</span>
                  <strong>{leadProject.year}</strong>
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </section>

      <section className="professional-metrics" aria-label="Professional profile summary">
        <div className="container professional-metrics__grid">
          <article>
            <strong>{homeMetrics[0].value}</strong>
            <span>Drafting and design</span>
          </article>
          <article>
            <strong>{String(positions.length).padStart(2, "0")}</strong>
            <span>Employment entries</span>
          </article>
          <article>
            <strong>{String(platforms.length).padStart(2, "0")}</strong>
            <span>Core platforms</span>
          </article>
          <article>
            <strong>{String(projects.length).padStart(2, "0")}</strong>
            <span>Published projects</span>
          </article>
        </div>
      </section>

      <Section
        eyebrow="Selected portfolio evidence"
        title="Work presented as evidence, not decoration."
        intro="Representative projects foreground scope, studio context, dates, disciplines, and the documentation available in the complete archive."
        className="section--professional-grid"
      >
        <div className="project-grid project-grid--featured home-feature-grid">
          {selectedProjects.map((project, index) => (
            <Link
              key={project.id}
              className="project-card project-card--clickable"
              to={`/portfolio/${getPortfolioSlug(project)}`}
            >
              <div className="project-card__media-shell">
                <MediaFrame alt={project.title} src={getProjectThumbnailUrl(project)} />
                <span className="project-card__index">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="project-card__body">
                <div className="project-card__topline">
                  <p>{getPortfolioFamily(project)}</p>
                  <span>{project.year}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <div className="project-card__meta">
                  <span>{project.client}</span>
                  <span>{getDocumentationType(project)}</span>
                </div>
                <span className="text-link">Open project record</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="section-actions">
          <Link className="button button--secondary" to="/portfolio">
            Browse all {projects.length} projects
          </Link>
        </div>
      </Section>

      <Section
        eyebrow="Sectors and disciplines"
        title="A documented practice across multiple project types."
        intro="The published catalogue shows where each discipline appears, without flattening distinct project records into generic capability claims."
        className="section--muted discipline-section"
      >
        <div className="discipline-matrix">
          {disciplineRecords.map((item, index) => (
            <article key={item.name}>
              <span className="discipline-matrix__index">{String(index + 1).padStart(2, "0")}</span>
              <strong>{item.name}</strong>
              <span>{item.count} published project{item.count === 1 ? "" : "s"}</span>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Recent chronology"
        title="Experience in context."
        intro="A concise recent sequence here leads into the complete, authoritative employment chronology on the web CV."
        className="section--professional-grid experience-section"
      >
        <div className="experience-layout">
          <div className="experience-layout__aside">
            <p>
              The homepage keeps recent roles concise while the CV retains every available employment
              entry and its current factual copy.
            </p>
            <Link className="button button--secondary" to="/cv">
              Review full CV
            </Link>
          </div>

          <div className="experience-list">
            {recentExperience.map((item, index) => (
              <article key={`${item.companyName}-${item.period || item.startDate}`} className="experience-row">
                <div className="experience-row__when">
                  <span>{item.period || formatPositionPeriod(item.startDate, item.endDate, item.current)}</span>
                  <small>{item.location}</small>
                </div>
                <div className="experience-row__body">
                  <span className="experience-row__index">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.companyName}</h3>
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                </div>
                <div className="experience-row__logo">
                  <CompanyLogoMark company={item.companyName} variant="monochrome" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Skills and platforms"
        title="Production tools, clearly categorised."
        intro="Software is described by the role it plays in drafting, modelling, presentation, coordination, and spatial work—without arbitrary percentage scores."
        className="section--muted"
      >
        <div className="tool-grid">
          {softwareTools.map((item) => {
            const platform = resolvePlatformByIdNameSlug(platforms, item.name);
            const logo = getPlatformIconPath(platform, item.name) || getSoftwareLogo(item.name);

            return (
              <article key={item.name} className="tool-card">
                <span className="tool-card__mark">
                  {logo ? <img alt="" src={logo} /> : item.name.slice(0, 3).toUpperCase()}
                </span>
                <div>
                  <h3>{item.name}</h3>
                  <p>{item.note}</p>
                </div>
                <span className="tool-card__category">{item.category}</span>
              </article>
            );
          })}
        </div>

        <div className="professional-cv-cta">
          <div>
            <p className="kicker">Curriculum vitae</p>
            <h3>One chronology, available on the web and as two PDF presentations.</h3>
          </div>
          <div className="hero-actions">
            <Link className="button button--primary" to="/cv">
              Open web CV
            </Link>
            <Link className="button button--secondary" to="/contact">
              Contact Daniel
            </Link>
          </div>
        </div>

        <div className="employer-mark-row" aria-label="Selected employers and studios">
          {featuredEmployers.map((item) => (
            <span key={item} className="employer-mark-row__item">
              <CompanyLogoMark company={item} variant="monochrome" />
            </span>
          ))}
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
