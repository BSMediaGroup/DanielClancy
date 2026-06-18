import { useState } from "react";
import { Link } from "react-router-dom";
import { MediaFrame } from "../components/MediaFrame";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { shellAssets } from "../content/brandAssets";
import { portfolioDisclaimer } from "../content/siteContent";
import {
  getDocumentationType,
  getPortfolioFamily,
  getPortfolioSlug,
  getSortedPortfolioFamilies,
} from "../lib/portfolio";
import {
  getPlatformIconPath,
  getProjectCompanyLabel,
  getProjectThumbnailUrl,
  resolvePlatformByIdNameSlug,
  usePublicSiteData,
} from "../lib/publicSiteData";

export function PortfolioPage() {
  const { projects: portfolioArchive, companies, platforms } = usePublicSiteData();
  const [scope, setScope] = useState<"all" | "featured">("all");
  const [family, setFamily] = useState("All families");
  const [discipline, setDiscipline] = useState("All disciplines");
  const [software, setSoftware] = useState("All software");
  const allDisciplines = Array.from(
    new Set(
      portfolioArchive.flatMap((project) =>
        project.disciplines.filter((item) => item !== "General"),
      ),
    ),
  ).sort((left, right) => left.localeCompare(right));
  const allSoftware = Array.from(new Set(portfolioArchive.flatMap((project) => project.software))).sort(
    (left, right) => left.localeCompare(right),
  );
  const allFamilies = getSortedPortfolioFamilies(portfolioArchive);

  const visibleProjects = portfolioArchive.filter((project) => {
    if (scope === "featured" && !project.featured) {
      return false;
    }

    if (family !== "All families" && getPortfolioFamily(project) !== family) {
      return false;
    }

    if (discipline !== "All disciplines" && !project.disciplines.includes(discipline)) {
      return false;
    }

    if (software !== "All software" && !project.software.includes(software)) {
      return false;
    }

    return true;
  });

  const leadProjects = (scope === "featured" ? visibleProjects : visibleProjects.filter((item) => item.featured)).slice(
    0,
    3,
  );

  return (
    <>
      <Seo
        title="Portfolio"
        description="Project archive and dedicated detail pages for Daniel Clancy."
        path="/portfolio"
        image={shellAssets.professionalShare}
      />

      <section className="hero hero--subpage">
        <div className="container hero-split hero-split--portfolio">
          <div className="hero-copy">
            <p className="kicker">Portfolio archive</p>
            <h1>Canonical project records with cleaner browsing and stronger detail pages.</h1>
            <p className="hero-copy__lead">
              The gallery now follows the canonical WorkSet archive, while each project detail page
              prioritises the drawing set, image sequence, and supporting context.
            </p>
            <div className="archive-summary">
              <article>
                <span>Archive entries</span>
                <strong>{portfolioArchive.length}</strong>
              </article>
              <article>
                <span>Project families</span>
                <strong>{allFamilies.length}</strong>
              </article>
              <article>
                <span>Detail routes</span>
                <strong>{portfolioArchive.length}</strong>
              </article>
            </div>
          </div>

          <aside className="surface archive-controls">
            <p className="kicker">Refine the archive</p>
            <div className="filter-stack">
              <div className="filter-group">
                <span className="filter-group__label">Scope</span>
                <div className="filter-chip-row">
                  <button
                    className={`filter-chip${scope === "all" ? " filter-chip--active" : ""}`}
                    type="button"
                    onClick={() => setScope("all")}
                  >
                    Full archive
                  </button>
                  <button
                    className={`filter-chip${scope === "featured" ? " filter-chip--active" : ""}`}
                    type="button"
                    onClick={() => setScope("featured")}
                  >
                    Featured only
                  </button>
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-group__label">Project family</span>
                <div className="filter-chip-row">
                  <button
                    className={`filter-chip${family === "All families" ? " filter-chip--active" : ""}`}
                    type="button"
                    onClick={() => setFamily("All families")}
                  >
                    All families
                  </button>
                  {allFamilies.map((item) => (
                    <button
                      key={item}
                      className={`filter-chip${family === item ? " filter-chip--active" : ""}`}
                      type="button"
                      onClick={() => setFamily(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-group__label">Discipline</span>
                <div className="filter-chip-row">
                  <button
                    className={`filter-chip${discipline === "All disciplines" ? " filter-chip--active" : ""}`}
                    type="button"
                    onClick={() => setDiscipline("All disciplines")}
                  >
                    All disciplines
                  </button>
                  {allDisciplines.map((item) => (
                    <button
                      key={item}
                      className={`filter-chip${discipline === item ? " filter-chip--active" : ""}`}
                      type="button"
                      onClick={() => setDiscipline(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <span className="filter-group__label">Software</span>
                <div className="filter-chip-row">
                  <button
                    className={`filter-chip${software === "All software" ? " filter-chip--active" : ""}`}
                    type="button"
                    onClick={() => setSoftware("All software")}
                  >
                    All software
                  </button>
                  {allSoftware.map((item) => (
                    <button
                      key={item}
                      className={`filter-chip${software === item ? " filter-chip--active" : ""}`}
                      type="button"
                      onClick={() => setSoftware(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="archive-controls__footer">
              <strong>{visibleProjects.length}</strong>
              <span>projects in view</span>
            </div>
          </aside>
        </div>
      </section>

      <Section
        eyebrow="Featured projects"
        title="Lead entries surfaced with a faster reading pattern."
        intro="Featured work stays selective, while the archive grid remains fully browseable and every card now opens its own project route."
      >
        <div className="project-grid project-grid--featured">
          {leadProjects.map((project) => {
            return (
              <Link
                key={project.id}
                className="project-card project-card--feature project-card--clickable"
                to={`/portfolio/${getPortfolioSlug(project)}`}
              >
                <MediaFrame alt={project.title} aspectRatio={1.58} src={getProjectThumbnailUrl(project)} />
                <div className="project-card__body">
                  <div className="project-card__topline">
                    <p>{project.client}</p>
                    <span>{project.year}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <div className="project-card__meta">
                    <span>{getPortfolioFamily(project)}</span>
                    <span>{getDocumentationType(project)}</span>
                  </div>
                  <div className="logo-row logo-row--small">
                    <span className="logo-pill logo-pill--text">
                      <small>{getProjectCompanyLabel(project, companies)}</small>
                    </span>
                    {project.software.slice(0, 2).map((item) => {
                      const platform = resolvePlatformByIdNameSlug(platforms, item);
                      const logo = getPlatformIconPath(platform, item);
                      return logo ? (
                        <span key={`${project.id}-${item}`} className="logo-pill" title={platform?.name || item}>
                          <img alt={platform?.name || item} src={logo} />
                          <small>{item}</small>
                        </span>
                      ) : null;
                    })}
                  </div>
                  <span className="text-link">Open project detail</span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="Archive gallery"
        title="Cleaner taxonomy, lighter cards, and clearer evidence cues."
        intro={portfolioDisclaimer}
        className="section--muted"
      >
        <div className="project-grid">
          {visibleProjects.map((project) => {
            return (
              <Link
                key={project.id}
                className="project-card project-card--clickable"
                to={`/portfolio/${getPortfolioSlug(project)}`}
              >
                <MediaFrame alt={project.title} aspectRatio={1.6} src={getProjectThumbnailUrl(project)} />
                <div className="project-card__body">
                  <div className="project-card__topline">
                    <p>{project.client}</p>
                    <span>{project.year}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <div className="project-card__meta">
                    <span>{getPortfolioFamily(project)}</span>
                    <span>{project.location ?? project.sector ?? "Project record"}</span>
                  </div>
                  <div className="logo-row logo-row--small">
                    <span className="logo-pill logo-pill--text">
                      <small>{getProjectCompanyLabel(project, companies)}</small>
                    </span>
                    {project.software.slice(0, 2).map((item) => {
                      const platform = resolvePlatformByIdNameSlug(platforms, item);
                      const logo = getPlatformIconPath(platform, item);
                      return logo ? (
                        <span key={`${project.id}-${item}`} className="logo-pill" title={platform?.name || item}>
                          <img alt={platform?.name || item} src={logo} />
                          <small>{item}</small>
                        </span>
                      ) : null;
                    })}
                  </div>
                  <span className="text-link">View detail page</span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>
    </>
  );
}
