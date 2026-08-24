import { Link, useSearchParams } from "react-router-dom";
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

const filterDefaults = {
  scope: "all",
  family: "All families",
  discipline: "All disciplines",
  software: "All software",
} as const;

type FilterName = keyof typeof filterDefaults;

export function PortfolioPage() {
  const { projects: portfolioArchive, companies, platforms } = usePublicSiteData();
  const [searchParams, setSearchParams] = useSearchParams();
  const allDisciplines = Array.from(
    new Set(portfolioArchive.flatMap((project) => project.disciplines.filter((item) => item !== "General"))),
  ).sort((left, right) => left.localeCompare(right));
  const allSoftware = Array.from(new Set(portfolioArchive.flatMap((project) => project.software))).sort((left, right) =>
    left.localeCompare(right),
  );
  const allFamilies = getSortedPortfolioFamilies(portfolioArchive);
  const scope = searchParams.get("scope") === "featured" ? "featured" : "all";
  const requestedFamily = searchParams.get("family");
  const requestedDiscipline = searchParams.get("discipline");
  const requestedSoftware = searchParams.get("software");
  const family = requestedFamily && allFamilies.includes(requestedFamily) ? requestedFamily : filterDefaults.family;
  const discipline = requestedDiscipline && allDisciplines.includes(requestedDiscipline)
    ? requestedDiscipline
    : filterDefaults.discipline;
  const software = requestedSoftware && allSoftware.includes(requestedSoftware)
    ? requestedSoftware
    : filterDefaults.software;

  const setFilter = (name: FilterName, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === filterDefaults[name]) {
      nextParams.delete(name);
    } else {
      nextParams.set(name, value);
    }
    setSearchParams(nextParams);
  };

  const resetFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    Object.keys(filterDefaults).forEach((key) => nextParams.delete(key));
    setSearchParams(nextParams);
  };

  const visibleProjects = portfolioArchive.filter((project) => {
    if (scope === "featured" && !project.featured) return false;
    if (family !== filterDefaults.family && getPortfolioFamily(project) !== family) return false;
    if (discipline !== filterDefaults.discipline && !project.disciplines.includes(discipline)) return false;
    if (software !== filterDefaults.software && !project.software.includes(software)) return false;
    return true;
  });
  const leadProjects = visibleProjects.filter((item) => item.featured).slice(0, 3);
  const querySuffix = searchParams.toString() ? `?${searchParams.toString()}` : "";

  return (
    <>
      <Seo
        title="Portfolio"
        description="Selected professional projects and technical documentation by Daniel Clancy."
        path="/portfolio"
        image={shellAssets.professionalShare}
      />

      <section className="hero hero--subpage portfolio-hero">
        <div className="container portfolio-hero__grid">
          <div className="portfolio-hero__copy">
            <p className="kicker">Portfolio</p>
            <h1>Selected professional work.</h1>
            <p className="hero-copy__lead">
              Architecture, structures, public realm and infrastructure work presented with project
              context, dates and available drawings.
            </p>
            <div className="archive-summary" aria-label="Portfolio summary">
              <article><span>Projects</span><strong>{portfolioArchive.length}</strong></article>
              <article><span>Project groups</span><strong>{allFamilies.length}</strong></article>
              <article><span>Showing</span><strong>{visibleProjects.length}</strong></article>
            </div>
          </div>

          <aside className="archive-controls" aria-label="Portfolio filters">
            <div className="archive-controls__head">
              <p className="kicker">Filter projects</p>
              <button className="text-button" type="button" onClick={resetFilters}>Reset</button>
            </div>
            <FilterGroup
              label="Scope"
              activeValue={scope}
              options={[{ label: "All projects", value: "all" }, { label: "Featured projects", value: "featured" }]}
              onChange={(value) => setFilter("scope", value)}
            />
            <FilterGroup
              label="Project family"
              activeValue={family}
              options={[filterDefaults.family, ...allFamilies].map((value) => ({ label: value, value }))}
              onChange={(value) => setFilter("family", value)}
            />
            <FilterGroup
              label="Discipline"
              activeValue={discipline}
              options={[filterDefaults.discipline, ...allDisciplines].map((value) => ({ label: value, value }))}
              onChange={(value) => setFilter("discipline", value)}
            />
            <FilterGroup
              label="Software"
              activeValue={software}
              options={[filterDefaults.software, ...allSoftware].map((value) => ({ label: value, value }))}
              onChange={(value) => setFilter("software", value)}
            />
          </aside>
        </div>
      </section>

      {leadProjects.length ? (
        <Section
          eyebrow="Selected work"
          title="Featured projects."
          intro="A selection of work showing project imagery, scope and practice context."
        >
          <div className="project-grid project-grid--featured">
            {leadProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                companies={companies}
                index={index}
                platforms={platforms}
                project={project}
                querySuffix={querySuffix}
                variant="feature"
              />
            ))}
          </div>
        </Section>
      ) : null}

      <Section
        eyebrow="All projects"
        title={`${visibleProjects.length} project${visibleProjects.length === 1 ? "" : "s"} in view.`}
        intro={portfolioDisclaimer}
        className="section--muted"
      >
        {visibleProjects.length ? (
          <div className="project-grid project-grid--archive">
            {visibleProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                companies={companies}
                index={index}
                platforms={platforms}
                project={project}
                querySuffix={querySuffix}
              />
            ))}
          </div>
        ) : (
          <div className="archive-empty surface">
            <p className="kicker">No projects match</p>
            <h3>Try a broader combination of filters.</h3>
            <button className="button button--secondary" type="button" onClick={resetFilters}>Reset filters</button>
          </div>
        )}
      </Section>
    </>
  );
}

type FilterGroupProps = {
  label: string;
  activeValue: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
};

function FilterGroup({ label, activeValue, options, onChange }: FilterGroupProps) {
  return (
    <div className="filter-group" role="group" aria-label={label}>
      <span className="filter-group__label">{label}</span>
      <div className="filter-chip-row">
        {options.map((option) => (
          <button
            key={option.value}
            aria-pressed={activeValue === option.value}
            className={`filter-chip${activeValue === option.value ? " filter-chip--active" : ""}`}
            type="button"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

type ProjectCardProps = {
  companies: ReturnType<typeof usePublicSiteData>["companies"];
  index: number;
  platforms: ReturnType<typeof usePublicSiteData>["platforms"];
  project: ReturnType<typeof usePublicSiteData>["projects"][number];
  querySuffix: string;
  variant?: "feature";
};

function ProjectCard({ companies, index, platforms, project, querySuffix, variant }: ProjectCardProps) {
  return (
    <Link
      className={`project-card project-card--clickable${variant ? ` project-card--${variant}` : ""}`}
      to={`/portfolio/${getPortfolioSlug(project)}${querySuffix}`}
    >
      <div className="project-card__media">
        <MediaFrame alt={project.title} aspectRatio={variant ? 1.52 : 1.62} src={getProjectThumbnailUrl(project)} />
        <span className="project-card__index">P-{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="project-card__body">
        <div className="project-card__topline"><p>{project.client}</p><span>{project.year}</span></div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="project-card__meta">
          <span>{getPortfolioFamily(project)}</span>
          <span>{project.location || getDocumentationType(project)}</span>
        </div>
        <div className="project-card__footer">
          <span>{getProjectCompanyLabel(project, companies)}</span>
          <div className="project-card__platforms">
            {project.software.slice(0, 3).map((item) => {
              const platform = resolvePlatformByIdNameSlug(platforms, item);
              const logo = getPlatformIconPath(platform, item);
              return logo ? <img key={`${project.id}-${item}`} alt={platform?.name || item} src={logo} title={item} /> : null;
            })}
          </div>
        </div>
        <span className="text-link">View project</span>
      </div>
    </Link>
  );
}
