import { Link, Navigate, useParams } from "react-router-dom";
import { MediaFrame } from "../components/MediaFrame";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { getCompanyLogo, getSoftwareLogo, shellAssets } from "../content/brandAssets";
import { portfolioArchive } from "../content/siteContent";
import {
  getDocumentationType,
  getPortfolioFamily,
  getPortfolioProjectBySlug,
  getPortfolioSlug,
} from "../lib/portfolio";

export function PortfolioDetailPage() {
  const { slug } = useParams();
  const project = getPortfolioProjectBySlug(slug);

  if (!project) {
    return <Navigate replace to="/portfolio" />;
  }

  const relatedProjects = portfolioArchive
    .filter(
      (item) => item.id !== project.id && getPortfolioFamily(item) === getPortfolioFamily(project),
    )
    .slice(0, 3);

  const companyLogo = getCompanyLogo(project.studio[0]);

  return (
    <>
      <Seo
        title={project.title}
        description={project.summary}
        path={`/portfolio/${getPortfolioSlug(project)}`}
        image={project.image}
        type="article"
      />

      <section className="hero hero--subpage hero--detail">
        <div className="container detail-hero">
          <div className="detail-hero__media">
            <MediaFrame alt={project.title} loading="eager" src={project.image} />
          </div>

          <div className="detail-hero__body">
            <p className="kicker">Project detail</p>
            <h1>{project.title}</h1>
            <p className="detail-hero__summary">{project.summary}</p>

            <div className="logo-row">
              {companyLogo ? (
                <span className="logo-pill">
                  <img alt="" src={companyLogo} />
                  <small>{project.studio[0]}</small>
                </span>
              ) : null}
              {project.software.map((item) => {
                const logo = getSoftwareLogo(item);
                return logo ? (
                  <span key={`${project.id}-${item}`} className="logo-pill">
                    <img alt="" src={logo} />
                    <small>{item}</small>
                  </span>
                ) : null;
              })}
            </div>

            <div className="detail-meta-grid">
              <div>
                <span>Client</span>
                <strong>{project.client}</strong>
              </div>
              <div>
                <span>Year</span>
                <strong>{project.year}</strong>
              </div>
              <div>
                <span>Project family</span>
                <strong>{getPortfolioFamily(project)}</strong>
              </div>
              <div>
                <span>Documentation type</span>
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
                  <span>Sector</span>
                  <strong>{project.sector}</strong>
                </div>
              ) : null}
              {project.sourceConfidence ? (
                <div>
                  <span>Source confidence</span>
                  <strong>{project.sourceConfidence}</strong>
                </div>
              ) : null}
            </div>

            <div className="hero-actions">
              <Link className="button button--secondary" to="/portfolio">
                Back to archive
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
        intro="The detail page keeps the tone factual and readable rather than over-claiming beyond the retained material."
      >
        <div className="two-column-grid">
          <article className="surface">
            <p className="kicker">Scope and disciplines</p>
            <div className="tag-grid">
              {project.disciplines.concat(project.subtypes).map((item) => (
                <span key={`${project.id}-${item}`} className="tag">
                  {item}
                </span>
              ))}
            </div>
          </article>

          <article className="surface">
            <p className="kicker">Archive notes</p>
            <ul className="bullet-list">
              {project.detailNotes.map((note) => (
                <li key={`${project.id}-${note}`}>{note}</li>
              ))}
            </ul>
            <p className="surface-note">
              {project.sourceFiles.length} retained source file
              {project.sourceFiles.length === 1 ? "" : "s"} support this public summary.
            </p>
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
            {project.evidenceAssets.map((asset) => (
              <article key={`${project.id}-${asset.label}`} className="surface surface--compact">
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

      {relatedProjects.length ? (
        <Section
          eyebrow="Related archive"
          title="More from the same project family"
          intro="Detail pages link back into the wider archive so repeated programmes and drawing sets remain easy to inspect."
        >
          <div className="project-grid">
            {relatedProjects.map((item) => (
              <article key={item.id} className="project-card">
                <MediaFrame alt={item.title} src={item.image} />
                <div className="project-card__body">
                  <div className="project-card__topline">
                    <p>{item.client}</p>
                    <span>{item.year}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <Link className="text-link" to={`/portfolio/${getPortfolioSlug(item)}`}>
                    Open detail
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
