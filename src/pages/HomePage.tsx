import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CapabilityMeter } from "../components/CapabilityMeter";
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

const softwareCapabilities = [
  { name: "Autodesk AutoCAD", score: 95, note: "Drawing packages, markups, and technical revisions" },
  { name: "Autodesk Revit", score: 92, note: "Production documentation and coordination" },
  { name: "Microsoft Office", score: 88, note: "Reports, schedules, and review packs" },
  { name: "Adobe Creative Cloud", score: 84, note: "Presentation polish, layouts, and visual support" },
  { name: "Trimble SketchUp", score: 79, note: "Concept support and quick modelling" },
  { name: "QGIS", score: 68, note: "Spatial context and mapping support" },
];

export function HomePage() {
  const { projects, positions, platforms } = usePublicSiteData();
  const spotlightProjects = projects.filter((project) => project.featured);
  const selectedProjects = spotlightProjects.length ? spotlightProjects.slice(0, 3) : projects.slice(0, 3);
  const featuredSlides = spotlightProjects.length ? spotlightProjects : projects.slice(0, 1);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const recentExperience = positions.slice(0, 4);
  const disciplineRecords = disciplineOrder
    .map((name) => ({
      name,
      count: projects.filter((project) => project.disciplines.includes(name)).length,
    }))
    .filter((item) => item.count > 0);

  useEffect(() => {
    setActiveFeatureIndex((current) => Math.min(current, Math.max(featuredSlides.length - 1, 0)));
  }, [featuredSlides.length]);

  useEffect(() => {
    if (featuredSlides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveFeatureIndex((current) => (current + 1) % featuredSlides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [featuredSlides.length]);

  return (
    <>
      <Seo
        title="Daniel Clancy"
        description="Professional drafting, documentation, and selected project work by Daniel Clancy."
        path="/"
        image={shellAssets.professionalShare}
      />

      <section className="hero hero--professional-home">
        <div
          className="hero-home__backdrop"
          aria-hidden="true"
          style={{ backgroundImage: `url(${shellAssets.professionalHeroBanner})` }}
        />
        <div className="hero-technical-field" aria-hidden="true">
          <svg className="hero-technical-field__drawing" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice">
            <g className="hero-technical-field__structure">
              <path d="M90 558H1110V138H744V86H405V138H90Z" />
              <path d="M156 497H1042V207H801V163H463V207H156Z" />
              <path d="M156 324H1042M371 207V497M801 207V497" />
              <path d="M234 258H318V326H234ZM516 258H671V326H516ZM862 258H972V326H862Z" />
              <path d="M234 382H318V446H234ZM516 382H671V446H516ZM862 382H972V446H862Z" />
            </g>
            <g className="hero-technical-field__dimensions">
              <path d="M90 596H1110M90 585V608M1110 585V608" />
              <path d="M52 558V138M41 558H64M41 138H64" />
              <path d="M405 56H744M405 45V67M744 45V67" />
            </g>
            <path className="hero-technical-field__route" d="M-40 536C170 438 326 670 533 550S863 438 1240 570" />
            <g className="hero-technical-field__nodes">
              <circle cx="156" cy="324" r="5" />
              <circle cx="371" cy="324" r="5" />
              <circle cx="801" cy="324" r="5" />
              <circle cx="1042" cy="324" r="5" />
            </g>
          </svg>
        </div>
        <div className="container professional-hero">
          <div className="professional-hero__copy">
            <div className="professional-hero__intro">
              <p className="kicker">Professional profile · Sydney, Australia</p>
            </div>
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

          {featuredSlides.length ? (
            <div className="professional-feature-slideshow" aria-label="Featured projects">
              {featuredSlides.map((project, index) => (
                <Link
                  key={project.id}
                  aria-hidden={index !== activeFeatureIndex}
                  aria-label={`View featured project: ${project.title}`}
                  className={`professional-evidence-board${index === activeFeatureIndex ? " professional-evidence-board--active" : ""}`}
                  tabIndex={index === activeFeatureIndex ? 0 : -1}
                  to={`/portfolio/${getPortfolioSlug(project)}`}
                >
                  <div className="professional-evidence-board__head">
                    <span>Featured project</span>
                    <span>{String(index + 1).padStart(2, "0")} / {String(featuredSlides.length).padStart(2, "0")}</span>
                  </div>
                  <div className="professional-evidence-board__media">
                    <MediaFrame
                      alt={project.title}
                      fit="contain"
                      loading={index === 0 ? "eager" : "lazy"}
                      src={getProjectThumbnailUrl(project)}
                    />
                  </div>
                  <div className="professional-evidence-board__foot">
                    <div>
                      <span>Project</span>
                      <strong>{project.title}</strong>
                    </div>
                    <div>
                      <span>Practice</span>
                      <strong>{getPortfolioFamily(project)}</strong>
                    </div>
                    <div>
                      <span>Year</span>
                      <strong>{project.year}</strong>
                    </div>
                  </div>
                </Link>
              ))}
              {featuredSlides.length > 1 ? (
                <div className="professional-feature-slideshow__controls" aria-label="Choose featured project">
                  {featuredSlides.map((project, index) => (
                    <button
                      key={project.id}
                      aria-label={`Show ${project.title}`}
                      aria-pressed={index === activeFeatureIndex}
                      className={index === activeFeatureIndex ? "is-active" : ""}
                      type="button"
                      onClick={() => setActiveFeatureIndex(index)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
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
            <span>Portfolio projects</span>
          </article>
        </div>
      </section>

      <Section
        eyebrow="Selected projects"
        title="Selected work across architecture, civil and landscape."
        intro="Project imagery is presented with practice, date, discipline and available drawing context."
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
                <span className="text-link">View project</span>
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
        title="Disciplines applied across the portfolio."
        intro="Each discipline reflects work represented in the selected projects."
        className="section--muted discipline-section"
      >
        <div className="discipline-matrix">
          {disciplineRecords.map((item, index) => (
            <article key={item.name}>
              <span className="discipline-matrix__index">{String(index + 1).padStart(2, "0")}</span>
              <DisciplineIcon name={item.name} />
              <strong>{item.name}</strong>
              <span>{item.count} project{item.count === 1 ? "" : "s"}</span>
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
            <div className="experience-list__footer">
              <Link className="button button--secondary" to="/cv">
                See full CV
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Skills and platforms"
        title="Established production depth, shown clearly."
        intro="Established platform proficiency is shown alongside the role each tool plays in drafting, modelling, presentation, coordination, and spatial work."
        className="section--muted capability-section"
      >
        <div className="capability-showcase">
          <div className="capability-list capability-list--home">
            {softwareCapabilities.map((item) => {
              const platform = resolvePlatformByIdNameSlug(platforms, item.name);
              const logo = getPlatformIconPath(platform, item.name) || getSoftwareLogo(item.name);
              return (
                <CapabilityMeter
                  key={item.name}
                  logo={logo}
                  name={item.name}
                  note={item.note}
                  score={item.score}
                />
              );
            })}
          </div>

          <aside className="capability-context">
            <div>
              <p className="kicker">Working range</p>
              <h3>Drafting precision supported by modelling, presentation and spatial tools.</h3>
              <p>
                Platform familiarity supports the drafting, modelling, presentation and spatial work
                represented throughout the portfolio.
              </p>
            </div>
            <div className="employer-mark-row" aria-label="Selected employers and studios">
              {featuredEmployers.map((item) => (
                <span key={item} className="employer-mark-row__item">
                  <CompanyLogoMark company={item} variant="monochrome" />
                </span>
              ))}
            </div>
          </aside>
        </div>

        <div className="professional-cv-cta">
          <div>
            <p className="kicker">Curriculum vitae</p>
            <h3>Complete career history on the web and in two PDF presentations.</h3>
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
      </Section>
    </>
  );
}

function DisciplineIcon({ name }: { name: string }) {
  const commonProps = {
    className: "discipline-matrix__icon",
    viewBox: "0 0 64 64",
    "aria-hidden": true,
    focusable: false,
  } as const;

  switch (name) {
    case "Architectural":
      return (
        <svg {...commonProps}>
          <path d="M8 54V25L32 8l24 17v29M20 54V32h24v22M32 8v46" />
        </svg>
      );
    case "Civil":
      return (
        <svg {...commonProps}>
          <path d="M7 43h50M11 43l7-17h28l7 17M18 26l7-12h14l7 12M15 51h34" />
        </svg>
      );
    case "Landscape":
      return (
        <svg {...commonProps}>
          <path d="M32 55V29M32 35c-12 0-19-7-19-18 12 0 19 7 19 18ZM32 43c12 0 19-7 19-18-12 0-19 7-19 18ZM10 55h44" />
        </svg>
      );
    case "Structural":
      return (
        <svg {...commonProps}>
          <path d="M10 10h44M14 10v44M50 10v44M10 54h44M14 26h36M14 42h36M14 10l36 44M50 10 14 54" />
        </svg>
      );
    case "Transport":
      return (
        <svg {...commonProps}>
          <path d="M13 55c10-9 13-18 13-27S22 13 18 9M51 55c-10-9-13-18-13-27s4-15 8-19M32 8v8M32 24v8M32 40v8M32 56v1" />
        </svg>
      );
    case "Urban Planning":
      return (
        <svg {...commonProps}>
          <path d="M8 55h48M13 55V27h13v28M26 55V10h15v45M41 55V20h10v35M17 33h5M17 41h5M31 18h5M31 27h5M31 36h5M45 28h3M45 36h3" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <circle cx="32" cy="32" r="21" />
          <path d="M11 32h42M32 11v42" />
        </svg>
      );
  }
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
