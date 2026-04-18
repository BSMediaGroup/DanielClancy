import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { featuredProjects, portfolioDisclaimer } from "../content/siteContent";

const platformFilters = Array.from(
  new Set(featuredProjects.flatMap((project) => project.platforms)),
);
const disciplineFilters = Array.from(
  new Set(featuredProjects.flatMap((project) => project.disciplines)),
);

export function PortfolioPage() {
  const featuredSet = featuredProjects.slice(0, 2);
  const archiveSet = featuredProjects.slice(2);

  return (
    <>
      <Seo
        title="Portfolio"
        description="Selected drafting and design work samples for Daniel Clancy."
        path="/portfolio"
      />

      <section className="hero hero--subpage hero--portfolio">
        <div className="container hero__grid hero__grid--document">
          <div className="hero__copy reveal">
            <p className="hero__eyebrow">Selected work</p>
            <h1>Portfolio</h1>
            <p className="hero__summary">
              Curated project documentation informed by the live Wix portfolio:
              filter-led, image-forward, and framed for professional review rather
              than casual browsing.
            </p>
          </div>

          <div className="surface surface--soft reveal reveal--delay">
            <p className="contact-card__label">Filter content</p>
            <div className="filter-stack">
              <div>
                <span className="filter-stack__label">Software</span>
                <div className="tag-grid tag-grid--compact">
                  {platformFilters.map((item) => (
                    <span key={item} className="tag tag--muted">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="filter-stack__label">Discipline</span>
                <div className="tag-grid tag-grid--compact">
                  {disciplineFilters.map((item) => (
                    <span key={item} className="tag tag--muted">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Disclosure"
        title="Curated, not exhaustive."
        intro="The live site keeps a security and intellectual-property disclaimer near the portfolio controls. The same boundary remains explicit here."
        className="section--muted"
      >
        <div className="surface surface--notice">
          <p>{portfolioDisclaimer}</p>
        </div>
      </Section>

      <Section
        eyebrow="Featured samples"
        title="Project documentation with stronger hierarchy."
        intro="The lead projects below carry the most visual weight, with the remaining archive presented as a tighter supporting set."
      >
        <div className="project-grid project-grid--showcase">
          {featuredSet.map((project) => (
            <article key={project.title} className="project-card project-card--showcase">
              <img src={project.image} alt={project.title} loading="lazy" />
              <div className="project-card__body">
                <div className="project-card__header">
                  <p className="project-card__meta">{project.client}</p>
                  <span className="project-card__year">{project.year}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <div className="tag-grid tag-grid--compact">
                  {project.platforms.concat(project.disciplines).map((item) => (
                    <span key={`${project.title}-${item}`} className="tag tag--muted">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Archive selection"
        title="Additional work samples"
        intro="All samples remain truthfully sourced from the seeded project set already copied into the repo."
        className="section--deep"
      >
        <div className="project-grid project-grid--dense">
          {archiveSet.map((project) => (
            <article key={project.title} className="project-card">
              <img src={project.image} alt={project.title} loading="lazy" />
              <div className="project-card__body">
                <div className="project-card__header">
                  <p className="project-card__meta">{project.client}</p>
                  <span className="project-card__year">{project.year}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <div className="tag-grid tag-grid--compact">
                  {project.platforms.concat(project.disciplines).map((item) => (
                    <span key={`${project.title}-${item}`} className="tag tag--muted">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
