import { Link, Navigate, useParams } from "react-router-dom";
import { MediaFrame } from "../components/MediaFrame";
import { PortfolioMediaGallery } from "../components/PortfolioMediaGallery";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import {
  getAdjacentPortfolioProjects,
  getDocumentationType,
  getPortfolioFamily,
  getPortfolioProjectBySlugFrom,
  getPortfolioSlug,
} from "../lib/portfolio";
import {
  getPlatformIconPath,
  getProjectCompanyLabel,
  getProjectDocumentUrl,
  getProjectGalleryUrls,
  getProjectHeroUrl,
  getProjectThumbnailUrl,
  resolvePlatformByIdNameSlug,
  usePublicSiteData,
} from "../lib/publicSiteData";

export function PortfolioDetailPage() {
  const { slug } = useParams();
  const { projects: portfolioArchive, companies, platforms } = usePublicSiteData();
  const project = getPortfolioProjectBySlugFrom(portfolioArchive, slug);

  if (!project) {
    return <Navigate replace to="/portfolio" />;
  }

  const { previousProject, nextProject } = getAdjacentPortfolioProjects(project, portfolioArchive);
  const relatedProjects = portfolioArchive
    .filter(
      (item) => item.id !== project.id && getPortfolioFamily(item) === getPortfolioFamily(project),
    )
    .slice(0, 3);

  return (
    <>
      <Seo
        title={project.title}
        description={project.summary}
        path={`/portfolio/${getPortfolioSlug(project)}`}
        image={getProjectThumbnailUrl(project)}
        type="article"
      />

      <section className="hero hero--subpage hero--detail">
        <div className="container detail-hero">
          <div className="detail-hero__media">
            <PortfolioMediaGallery
              documentationUrl={project.documentationUrl}
              documentUrl={getProjectDocumentUrl(project)}
              documentationAvailable={project.documentationAvailable}
              documentationStatusNote={project.documentationStatusNote}
              media={project.media}
              primaryImage={getProjectHeroUrl(project)}
              galleryPaths={getProjectGalleryUrls(project)}
              projectTitle={project.title}
            />
          </div>

          <div className="detail-hero__body">
            <p className="kicker">Project detail</p>
            <h1>{project.title}</h1>
            <p className="detail-hero__summary">{project.description}</p>

            <div className="logo-row">
              <span className="logo-pill logo-pill--text">
                <small>{getProjectCompanyLabel(project, companies)}</small>
              </span>
              {project.software.map((item) => {
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

            <details className="detail-panel" open>
              <summary className="detail-panel__summary">
                <span>Project details</span>
                <span>Toggle</span>
              </summary>

              <div className="detail-meta-grid">
                <div>
                  <span>Client</span>
                  <strong>{project.client}</strong>
                </div>
                <div>
                  <span>Date</span>
                  <strong>{project.dateLabel}</strong>
                </div>
                <div>
                  <span>Studio</span>
                  <strong>{getPortfolioFamily(project)}</strong>
                </div>
                <div>
                  <span>Project type</span>
                  <strong>{getDocumentationType(project)}</strong>
                </div>
                {project.location ? (
                  <div>
                    <span>Location</span>
                    <strong>{project.location}</strong>
                  </div>
                ) : null}
                {project.sector ? (
                  <div>
                    <span>Construction</span>
                    <strong>{project.sector}</strong>
                  </div>
                ) : null}
                {project.sourceConfidence ? (
                  <div>
                    <span>Source confidence</span>
                    <strong>{project.sourceConfidence}</strong>
                  </div>
                ) : null}
                <div>
                  <span>Media count</span>
                  <strong>{project.media.length}</strong>
                </div>
              </div>

              <div className="detail-panel__notes surface surface--compact">
                <p className="kicker">Archive notes</p>
                <ul className="bullet-list">
                  {project.detailNotes.map((note) => (
                    <li key={`${project.id}-${note}`}>{note}</li>
                  ))}
                </ul>
              </div>
            </details>

            <div className="hero-actions">
              <Link className="button button--secondary" to="/portfolio">
                Back to gallery
              </Link>
              <Link className="button button--ghost" to="/contact">
                Discuss this work
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Documentation notes"
        title="Context retained with disciplined metadata."
        intro="The detail page now gives the project media most of the space, while supporting facts stay collapsible and readable."
      >
        <div className="two-column-grid">
          <article className="surface">
            <p className="kicker">Scope and disciplines</p>
            <div className="tag-grid">
              {Array.from(new Set(project.disciplines.concat(project.subtypes))).map((item) => (
                <span key={`${project.id}-${item}`} className="tag">
                  {item}
                </span>
              ))}
            </div>
          </article>

          <article className="surface">
            <p className="kicker">Project summary</p>
            <p>{project.description}</p>
            <p className="surface-note">
              {project.sourceFiles.length} retained source file
              {project.sourceFiles.length === 1 ? "" : "s"} support this public summary.
            </p>
            {getProjectDocumentUrl(project) ? (
              <a className="text-link" href={getProjectDocumentUrl(project)} target="_blank" rel="noreferrer">
                Open project document
              </a>
            ) : project.documentationStatusNote ? (
              <span className="text-link text-link--disabled" title={project.documentationStatusNote}>
                Document folder temporarily unavailable
              </span>
            ) : null}
            {project.documentationStatusNote ? <p className="surface-note">{project.documentationStatusNote}</p> : null}
          </article>
        </div>
      </Section>

      {project.evidenceAssets?.length ? (
        <Section
          eyebrow="Evidence set"
          title="Selected supporting material"
          intro="Evidence items are described by type and role in the record, without exposing internal archive paths on the public page."
          className="section--muted"
        >
          <div className="evidence-grid">
            {project.evidenceAssets.map((asset, index) => (
              <article key={`${project.id}-${asset.label}-${index}`} className="surface surface--compact">
                <p className="kicker">{asset.kind}</p>
                <h3>{asset.label}</h3>
                <p>
                  Included as part of the retained project record used to support this public-facing
                  summary.
                </p>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      {(previousProject || nextProject) ? (
        <Section
          eyebrow="Project navigation"
          title="Move through the archive"
          intro="Detail routes now connect sequentially so the archive can be reviewed like a documented set instead of isolated pages."
          className="section--muted"
        >
          <div className="feature-duo">
            {previousProject ? (
              <Link className="surface surface--compact nav-card" to={`/portfolio/${getPortfolioSlug(previousProject)}`}>
                <p className="kicker">Previous project</p>
                <h3>{previousProject.title}</h3>
                <p>{previousProject.summary}</p>
              </Link>
            ) : (
              <div className="surface surface--compact nav-card nav-card--empty">
                <p className="kicker">Previous project</p>
                <h3>Start of archive</h3>
                <p>The current project is the first item in the ordered archive.</p>
              </div>
            )}

            {nextProject ? (
              <Link className="surface surface--compact nav-card" to={`/portfolio/${getPortfolioSlug(nextProject)}`}>
                <p className="kicker">Next project</p>
                <h3>{nextProject.title}</h3>
                <p>{nextProject.summary}</p>
              </Link>
            ) : (
              <div className="surface surface--compact nav-card nav-card--empty">
                <p className="kicker">Next project</p>
                <h3>End of archive</h3>
                <p>The current project is the last item in the ordered archive.</p>
              </div>
            )}
          </div>
        </Section>
      ) : null}

      {relatedProjects.length ? (
        <Section
          eyebrow="Related archive"
          title="More from the same project family"
          intro="Detail pages link back into the wider archive so repeated programmes and drawing sets remain easy to inspect."
        >
          <div className="project-grid">
            {relatedProjects.map((item) => (
              <Link
                key={item.id}
                className="project-card project-card--clickable"
                to={`/portfolio/${getPortfolioSlug(item)}`}
              >
                <MediaFrame alt={item.title} aspectRatio={1.58} src={getProjectThumbnailUrl(item)} />
                <div className="project-card__body">
                  <div className="project-card__topline">
                    <p>{item.client}</p>
                    <span>{item.year}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span className="text-link">Open detail</span>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
