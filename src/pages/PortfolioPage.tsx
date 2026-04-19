import { useState } from "react";
import { Section } from "../components/Section";
import {
  featuredProjects,
  portfolioArchive,
  portfolioDisclaimer,
  type PortfolioItem,
} from "../content/siteContent";
import { Seo } from "../components/Seo";

type ViewMode = "all" | "featured";

const disciplineOrder = ["Architecture", "Structural", "Landscape", "Urban Planning", "General"];
const familyOrder = [
  "Ampol highway service centres",
  "Ampol UPSS upgrades",
  "Curtin Creative Quarter",
  "ACCE structural archive",
  "Urban master planning",
  "Urbis public-domain details",
  "Traffic management",
  "Residential additions",
  "Residential landscape",
  "GHD buildings archive",
];

function getPrimaryDiscipline(disciplines: string[]) {
  return disciplines.find((discipline) => discipline !== "General") ?? disciplines[0];
}

function getProjectFamily(project: PortfolioItem) {
  if (project.projectFamily) {
    return project.projectFamily;
  }

  if (project.title.includes("Ampol Highway Service Centre")) {
    return "Ampol highway service centres";
  }

  if (project.title.includes("Pump System Upgrades")) {
    return "Ampol UPSS upgrades";
  }

  if (project.title.includes("Curtin Creative Quarter")) {
    return "Curtin Creative Quarter";
  }

  if (project.title.includes("Spratt Residence")) {
    return "Residential additions";
  }

  if (project.title.includes("Cottesloe Beach House")) {
    return "Residential landscape";
  }

  if (project.title.includes("Wungong")) {
    return "Urban master planning";
  }

  if (project.title.includes("Cue Roadhouse")) {
    return "Traffic management";
  }

  return getPrimaryDiscipline(project.disciplines);
}

function getDocumentationType(project: PortfolioItem) {
  return project.documentationType ?? project.subtypes[0] ?? "Documented archive sample";
}

const allDisciplines = Array.from(
  new Set(
    portfolioArchive.flatMap((project) =>
      project.disciplines.filter((discipline) => discipline !== "General"),
    ),
  ),
);
const allSoftware = Array.from(new Set(portfolioArchive.flatMap((project) => project.software)));
const allProjectFamilies = Array.from(
  new Set(portfolioArchive.map((project) => getProjectFamily(project))),
).sort((left, right) => {
  const leftIndex = familyOrder.indexOf(left);
  const rightIndex = familyOrder.indexOf(right);

  if (leftIndex === -1 && rightIndex === -1) {
    return left.localeCompare(right);
  }

  if (leftIndex === -1) {
    return 1;
  }

  if (rightIndex === -1) {
    return -1;
  }

  return leftIndex - rightIndex;
});

export function PortfolioPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [activeDiscipline, setActiveDiscipline] = useState<string>("All disciplines");
  const [activeSoftware, setActiveSoftware] = useState<string>("All software");
  const [activeFamily, setActiveFamily] = useState<string>("All families");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(featuredProjects[0]?.id ?? "");

  const visibleProjects = portfolioArchive.filter((project) => {
    if (viewMode === "featured" && !project.featured) {
      return false;
    }

    if (
      activeDiscipline !== "All disciplines" &&
      !project.disciplines.includes(activeDiscipline)
    ) {
      return false;
    }

    if (activeSoftware !== "All software" && !project.software.includes(activeSoftware)) {
      return false;
    }

    if (activeFamily !== "All families" && getProjectFamily(project) !== activeFamily) {
      return false;
    }

    return true;
  });

  const visibleFeatured = visibleProjects.filter((project) => project.featured);
  const visibleArchive = visibleProjects.filter(
    (project) => !project.featured || viewMode === "featured",
  );
  const selectedProject =
    visibleProjects.find((project) => project.id === selectedProjectId) ?? visibleProjects[0] ?? null;

  const groupedArchive = allProjectFamilies
    .map((family) => ({
      family,
      items: visibleArchive.filter((project) => getProjectFamily(project) === family),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <Seo
        title="Portfolio"
        description="Broader project archive and documentation view for Daniel Clancy."
        path="/portfolio"
      />

      <section className="hero hero--subpage hero--portfolio">
        <div className="container hero__grid hero__grid--portfolio">
          <div className="hero__copy reveal">
            <p className="hero__eyebrow">Curated project archive</p>
            <h1>Portfolio</h1>
            <p className="hero__summary">
              A broader recruiter-facing archive drawn from retained Wix source folders,
              with stronger structural and unsorted-sheet coverage, grouped project
              families, and evidence shown as documentation rather than sales copy.
            </p>
            <p className="hero__support">
              Metadata remains intentionally restrained. Where titleblock or table data is
              incomplete, the archive stays neutral and sheet-led.
            </p>

            <div className="archive-stat-strip">
              <div>
                <span>Archive entries</span>
                <strong>{portfolioArchive.length}</strong>
                <small>Curated from retained local source sets.</small>
              </div>
              <div>
                <span>Project families</span>
                <strong>{allProjectFamilies.length}</strong>
                <small>Grouped to keep repeated sets legible.</small>
              </div>
              <div>
                <span>Featured evidence</span>
                <strong>{featuredProjects.length}</strong>
                <small>Kept prominent for faster review.</small>
              </div>
            </div>
          </div>

          <div className="surface surface--soft reveal reveal--delay">
            <p className="contact-card__label">Archive controls</p>
            <div className="filter-stack">
              <div>
                <span className="filter-stack__label">Scope</span>
                <div className="filter-chip-row">
                  <button
                    className={`filter-chip${viewMode === "all" ? " filter-chip--active" : ""}`}
                    type="button"
                    onClick={() => setViewMode("all")}
                  >
                    Full archive
                  </button>
                  <button
                    className={`filter-chip${viewMode === "featured" ? " filter-chip--active" : ""}`}
                    type="button"
                    onClick={() => setViewMode("featured")}
                  >
                    Featured only
                  </button>
                </div>
              </div>

              <div>
                <span className="filter-stack__label">Project family</span>
                <div className="filter-chip-row">
                  <button
                    className={`filter-chip${activeFamily === "All families" ? " filter-chip--active" : ""}`}
                    type="button"
                    onClick={() => setActiveFamily("All families")}
                  >
                    All families
                  </button>
                  {allProjectFamilies.map((item) => (
                    <button
                      key={item}
                      className={`filter-chip${activeFamily === item ? " filter-chip--active" : ""}`}
                      type="button"
                      onClick={() => setActiveFamily(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="filter-stack__label">Discipline</span>
                <div className="filter-chip-row">
                  <button
                    className={`filter-chip${activeDiscipline === "All disciplines" ? " filter-chip--active" : ""}`}
                    type="button"
                    onClick={() => setActiveDiscipline("All disciplines")}
                  >
                    All disciplines
                  </button>
                  {allDisciplines.map((item) => (
                    <button
                      key={item}
                      className={`filter-chip${activeDiscipline === item ? " filter-chip--active" : ""}`}
                      type="button"
                      onClick={() => setActiveDiscipline(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="filter-stack__label">Software</span>
                <div className="filter-chip-row">
                  <button
                    className={`filter-chip${activeSoftware === "All software" ? " filter-chip--active" : ""}`}
                    type="button"
                    onClick={() => setActiveSoftware("All software")}
                  >
                    All software
                  </button>
                  {allSoftware.map((item) => (
                    <button
                      key={item}
                      className={`filter-chip${activeSoftware === item ? " filter-chip--active" : ""}`}
                      type="button"
                      onClick={() => setActiveSoftware(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="archive-filter-summary">
              <strong>{visibleProjects.length}</strong>
              <span>matching archive entries currently visible.</span>
            </div>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Disclosure"
        title="Curated, not exhaustive."
        intro="The archive remains documentation-forward and deliberately partial. Sensitive or protected sets are still withheld."
        className="section--muted"
      >
        <div className="surface surface--notice">
          <p>{portfolioDisclaimer}</p>
        </div>
      </Section>

      <Section
        eyebrow="Featured evidence"
        title="Projects carrying the strongest public review value."
        intro="These entries stay prominent because they provide the clearest recruiter-facing overview of Daniel Clancy's documentation range."
      >
        {visibleFeatured.length > 0 ? (
          <div className="project-grid project-grid--showcase">
            {visibleFeatured.map((project) => (
              <button
                key={project.id}
                type="button"
                className={`project-card project-card--showcase project-card--interactive${selectedProject?.id === project.id ? " project-card--selected" : ""}`}
                onClick={() => setSelectedProjectId(project.id)}
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
                    <span>{getProjectFamily(project)}</span>
                    <span>{getDocumentationType(project)}</span>
                  </div>
                  <div className="tag-grid tag-grid--compact">
                    {project.software.concat(project.subtypes.slice(0, 2)).map((item) => (
                      <span key={`${project.id}-${item}`} className="tag tag--muted">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="surface surface--soft archive-empty-state">
            <p className="contact-card__label">Featured set</p>
            <h3>No featured projects match the current filters.</h3>
            <p>Reset the family, discipline, or software controls to restore the lead samples.</p>
          </div>
        )}
      </Section>

      <Section
        eyebrow="Project detail"
        title="Selected archive entry"
        intro="Each card can be inspected as a documentation record without introducing a heavyweight route or CMS dependency."
        className="section--deep"
      >
        {selectedProject ? (
          <div className="portfolio-detail">
            <div className="portfolio-detail__media">
              <img src={selectedProject.image} alt={selectedProject.title} loading="lazy" />
            </div>

            <div className="portfolio-detail__body">
              <div className="portfolio-detail__header">
                <div>
                  <p className="contact-card__label">Selected archive entry</p>
                  <h3>{selectedProject.title}</h3>
                </div>
                <span className="portfolio-detail__year">{selectedProject.year}</span>
              </div>

              <p className="portfolio-detail__summary">{selectedProject.summary}</p>

              <div className="portfolio-detail__meta">
                <div>
                  <span>Client</span>
                  <strong>{selectedProject.client}</strong>
                </div>
                <div>
                  <span>Studio / company</span>
                  <strong>{selectedProject.studio.join(" / ")}</strong>
                </div>
                <div>
                  <span>Project family</span>
                  <strong>{getProjectFamily(selectedProject)}</strong>
                </div>
                <div>
                  <span>Documentation type</span>
                  <strong>{getDocumentationType(selectedProject)}</strong>
                </div>
                <div>
                  <span>Discipline</span>
                  <strong>{selectedProject.disciplines.join(" / ")}</strong>
                </div>
                <div>
                  <span>Software</span>
                  <strong>{selectedProject.software.join(" / ")}</strong>
                </div>
                {selectedProject.location ? (
                  <div>
                    <span>Location</span>
                    <strong>{selectedProject.location}</strong>
                  </div>
                ) : null}
                {selectedProject.sector ? (
                  <div>
                    <span>Sector</span>
                    <strong>{selectedProject.sector}</strong>
                  </div>
                ) : null}
                {selectedProject.sourceConfidence ? (
                  <div>
                    <span>Source confidence</span>
                    <strong>{selectedProject.sourceConfidence}</strong>
                  </div>
                ) : null}
              </div>

              <div className="portfolio-detail__tags">
                {selectedProject.subtypes.map((item) => (
                  <span key={`${selectedProject.id}-${item}`} className="tag">
                    {item}
                  </span>
                ))}
              </div>

              {selectedProject.evidenceAssets?.length ? (
                <div className="portfolio-evidence-strip">
                  {selectedProject.evidenceAssets.map((asset) => (
                    <article
                      key={`${selectedProject.id}-${asset.path}`}
                      className="portfolio-evidence-card"
                    >
                      <p className="contact-card__label">{asset.kind}</p>
                      <strong>{asset.label}</strong>
                      <code>{asset.path}</code>
                    </article>
                  ))}
                </div>
              ) : null}

              <div className="portfolio-detail__columns">
                <div className="surface surface--soft">
                  <p className="contact-card__label">Local source references</p>
                  <ul className="bullet-list bullet-list--compact">
                    {selectedProject.references.map((reference) => (
                      <li key={`${selectedProject.id}-${reference.path}`}>
                        {reference.label}: <code>{reference.path}</code>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="surface surface--soft">
                  <p className="contact-card__label">Archive notes</p>
                  <ul className="bullet-list bullet-list--compact">
                    {selectedProject.detailNotes.map((note) => (
                      <li key={`${selectedProject.id}-${note}`}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="portfolio-detail__footer">
                <span>{selectedProject.sourceFiles.length} retained source files noted.</span>
                {selectedProject.sensitivityNote ? <p>{selectedProject.sensitivityNote}</p> : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="surface surface--soft archive-empty-state">
            <p className="contact-card__label">Archive detail</p>
            <h3>No projects match the current filter state.</h3>
            <p>Clear one or more filters to restore the archive selection panel.</p>
          </div>
        )}
      </Section>

      <Section
        eyebrow="Broader archive"
        title="Grouped project families with clearer documentation cues."
        intro="Repeated studies, upgrade sets, and sheet-led records are grouped by project family so the archive reads as a professional record instead of an undifferentiated gallery."
      >
        {groupedArchive.length > 0 ? (
          <div className="archive-groups">
            {groupedArchive.map((group) => {
              const groupDisciplines = Array.from(
                new Set(
                  group.items
                    .map((project) => getPrimaryDiscipline(project.disciplines))
                    .sort((left, right) => disciplineOrder.indexOf(left) - disciplineOrder.indexOf(right)),
                ),
              );

              return (
                <div key={group.family} className="archive-group">
                  <div className="archive-group__heading">
                    <div>
                      <p className="contact-card__label">Project family</p>
                      <h3>{group.family}</h3>
                    </div>
                    <span>
                      {group.items.length} surfaced item{group.items.length === 1 ? "" : "s"} /{" "}
                      {groupDisciplines.join(" / ")}
                    </span>
                  </div>

                  <div className="project-grid">
                    {group.items.map((project) => (
                      <button
                        key={project.id}
                        type="button"
                        className={`project-card project-card--interactive${selectedProject?.id === project.id ? " project-card--selected" : ""}`}
                        onClick={() => setSelectedProjectId(project.id)}
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
                            <span>{getDocumentationType(project)}</span>
                            <span>{project.studio.join(" / ")}</span>
                          </div>
                          <div className="tag-grid tag-grid--compact">
                            {project.subtypes.slice(0, 3).map((item) => (
                              <span key={`${project.id}-${item}`} className="tag tag--muted">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="surface surface--soft archive-empty-state">
            <p className="contact-card__label">Archive group</p>
            <h3>No grouped archive entries are available for this combination.</h3>
            <p>A broader archive view returns when at least one filter is relaxed.</p>
          </div>
        )}
      </Section>
    </>
  );
}
