import { Link, useLocation, useParams } from "react-router-dom";
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
  getProjectDocumentUrl,
  getProjectGalleryUrls,
  getProjectHeroUrl,
  getProjectThumbnailSources,
  getProjectThumbnailUrl,
  resolvePlatformByIdNameSlug,
  usePublicSiteData,
} from "../lib/publicSiteData";

export function PortfolioDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const { projects: portfolioArchive, platforms, loading } = usePublicSiteData();
  const project = getPortfolioProjectBySlugFrom(portfolioArchive, slug);
  const archivePath = `/portfolio${location.search}`;

  if (!project) {
    return (
      <>
        <Seo
          title={loading ? "Loading project" : "Project not found"}
          description="Daniel Clancy portfolio project."
          path={`/portfolio/${slug || ""}`}
        />
        <section className="hero hero--subpage detail-not-found">
          <div className="container hero-copy">
            <p className="kicker">Project</p>
            {loading ? (
              <><h1>Loading project…</h1><p className="hero-copy__lead">Please wait while the project is opened.</p></>
            ) : (
              <>
                <h1>Project not found.</h1>
                <p className="hero-copy__lead">Check the address or return to the portfolio.</p>
              </>
            )}
            <div className="hero-actions">
              <Link className="button button--secondary" to={archivePath}>Browse portfolio</Link>
              <Link className="button button--ghost" to="/contact">Contact Daniel</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const { previousProject, nextProject } = getAdjacentPortfolioProjects(project, portfolioArchive);
  const relatedProjects = portfolioArchive
    .filter((item) => item.id !== project.id && getPortfolioFamily(item) === getPortfolioFamily(project))
    .slice(0, 3);
  const galleryPaths = getProjectGalleryUrls(project);
  const heroImage = getProjectHeroUrl(project);
  const mediaCount = new Set([
    ...(heroImage ? [heroImage] : []),
    ...galleryPaths,
    ...(project.media || []).map((item) => item.src),
  ]).size;
  const querySuffix = location.search;
  const softwareMarks = project.software.map((item, index) => {
    const platform = resolvePlatformByIdNameSlug(platforms, item);
    return {
      id: `${project.id}-software-${index}`,
      label: platform?.name || item,
      logo: getPlatformIconPath(platform, item),
    };
  }).filter((item) => item.logo);

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
        <div className="container detail-breadcrumb">
          <Link className="text-link" to={archivePath}>Portfolio</Link>
          <span aria-hidden="true">/</span>
          <span>{getPortfolioFamily(project)}</span>
        </div>

        <div className="container detail-heading">
          <div className="detail-heading__title">
            <p className="kicker">{getPortfolioFamily(project)} / {project.year}</p>
            <h1>{project.title}</h1>
          </div>
          <p className="detail-heading__summary">{project.summary}</p>
        </div>

        <div className="container detail-hero">
          <div className="detail-hero__media">
            <PortfolioMediaGallery
              documentationUrl={project.documentationUrl}
              documentUrl={getProjectDocumentUrl(project)}
              documentationAvailable={project.documentationAvailable}
              documentationStatusNote={project.documentationStatusNote}
              media={project.media}
              primaryImage={heroImage}
              galleryPaths={galleryPaths}
              projectTitle={project.title}
            />
          </div>

          <aside className="detail-hero__body" aria-label="Project details">
            <div className="detail-meta-grid">
              <div><span>Client</span><strong>{project.client}</strong></div>
              <div><span>Date</span><strong>{project.dateLabel}</strong></div>
              <div><span>Practice</span><strong>{getPortfolioFamily(project)}</strong></div>
              <div><span>Project type</span><strong>{getDocumentationType(project)}</strong></div>
              {project.location ? <div><span>Location</span><strong>{project.location}</strong></div> : null}
              {project.sector ? <div><span>Sector</span><strong>{project.sector}</strong></div> : null}
              <div><span>Media</span><strong>{mediaCount || "Unavailable"}</strong></div>
            </div>

            {softwareMarks.length ? (
              <div className="project-platforms" aria-label="Software used for this project" role="list">
                {softwareMarks.map((item) => (
                  <span
                    key={item.id}
                    aria-describedby={`${item.id}-tooltip`}
                    aria-label={item.label}
                    className="project-platform-icon"
                    role="listitem"
                    tabIndex={0}
                  >
                    <img alt="" decoding="async" src={item.logo} />
                    <span className="project-platform-icon__tooltip" id={`${item.id}-tooltip`} role="tooltip">
                      {item.label}
                    </span>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="hero-actions">
              <Link className="button button--secondary" to={archivePath}>Back to portfolio</Link>
              <Link className="button button--ghost" to="/contact">Discuss this work</Link>
            </div>
          </aside>
        </div>
      </section>

      <Section
        eyebrow="Project information"
        title="Scope and documentation"
        intro={project.description}
      >
        <div className="detail-context-grid">
          <article className="surface detail-context-card">
            <p className="kicker">Disciplines</p>
            <div className="tag-grid">
              {project.disciplines.map((item) => <span key={`${project.id}-discipline-${item}`} className="tag">{item}</span>)}
            </div>
          </article>
          <article className="surface detail-context-card">
            <p className="kicker">Scope</p>
            <div className="tag-grid">
              {project.subtypes.length ? project.subtypes.map((item) => (
                <span key={`${project.id}-scope-${item}`} className="tag">{item}</span>
              )) : <span className="surface-note">No additional scope details are available.</span>}
            </div>
          </article>
          <article className="surface detail-context-card detail-context-card--summary">
            <p className="kicker">Project summary</p>
            <p>{project.description}</p>
            {getProjectDocumentUrl(project) ? (
              <a className="text-link" href={getProjectDocumentUrl(project)} target="_blank" rel="noreferrer">
                Open project document
              </a>
            ) : null}
          </article>
        </div>
      </Section>

      {previousProject || nextProject ? (
        <Section eyebrow="Project navigation" title="Explore more projects" className="section--muted">
          <div className="feature-duo detail-sequence">
            {previousProject ? (
              <Link className="surface surface--compact nav-card" to={`/portfolio/${getPortfolioSlug(previousProject)}${querySuffix}`}>
                <p className="kicker">Previous project</p><h3>{previousProject.title}</h3><p>{previousProject.summary}</p>
              </Link>
            ) : <div className="surface surface--compact nav-card nav-card--empty"><p className="kicker">Previous project</p><h3>Start of portfolio</h3></div>}
            {nextProject ? (
              <Link className="surface surface--compact nav-card" to={`/portfolio/${getPortfolioSlug(nextProject)}${querySuffix}`}>
                <p className="kicker">Next project</p><h3>{nextProject.title}</h3><p>{nextProject.summary}</p>
              </Link>
            ) : <div className="surface surface--compact nav-card nav-card--empty"><p className="kicker">Next project</p><h3>End of portfolio</h3></div>}
          </div>
        </Section>
      ) : null}

      {relatedProjects.length ? (
        <Section eyebrow="Related projects" title="More from the same project group">
          <div className="project-grid project-grid--related">
            {relatedProjects.map((item) => {
              const thumbnail = getProjectThumbnailSources(item);
              return (
                <Link key={item.id} className="project-card project-card--clickable" to={`/portfolio/${getPortfolioSlug(item)}${querySuffix}`}>
                  <MediaFrame
                    alt={item.title}
                    aspectRatio={1.58}
                    fetchPriority="low"
                    fit="contain"
                    sizes="(max-width: 760px) calc(100vw - 3rem), 31vw"
                    src={thumbnail.src}
                    srcSet={thumbnail.srcSet}
                  />
                  <div className="project-card__body">
                    <div className="project-card__topline"><p>{item.client}</p><span>{item.year}</span></div>
                    <h3>{item.title}</h3><p>{item.summary}</p><span className="text-link">View project</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>
      ) : null}
    </>
  );
}
