import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { featuredProjects } from "../content/siteContent";

export function PortfolioPage() {
  return (
    <>
      <Seo
        title="Portfolio"
        description="Selected drafting and design work samples for Daniel Clancy."
        path="/portfolio"
      />

      <section className="hero hero--subpage">
        <div className="container hero__grid hero__grid--single">
          <div className="hero__copy reveal">
            <p className="hero__eyebrow">Selected work</p>
            <h1>Portfolio baseline</h1>
            <p className="hero__summary">
              The live Wix portfolio mixes featured images, broad discipline tags,
              and many individual items. This first pass establishes a cleaner
              showcase surface with room for later filtering and deeper project
              pages.
            </p>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Migration note"
        title="Curated, not exhaustive."
        intro="This route intentionally ships a manageable subset of truthfully sourced project material. Full item migration and richer categorisation remain deferred."
      >
        <div className="surface surface--notice">
          <p>
            Showcased documents remain at varying levels of completion. Sensitive,
            classified, or protected material is not exposed in this milestone.
          </p>
        </div>
      </Section>

      <Section
        eyebrow="Project selection"
        title="Seeded from Wix export data and local image sets."
        intro="Images are copied from the local `cmsdata/wix/portfolio` folders into public media so the app can build and deploy cleanly on Cloudflare Pages."
      >
        <div className="project-grid project-grid--dense">
          {featuredProjects.map((project) => (
            <article key={project.title} className="project-card">
              <img src={project.image} alt={project.title} loading="lazy" />
              <div className="project-card__body">
                <div className="project-card__header">
                  <p className="project-card__meta">{project.client}</p>
                  <span className="project-card__year">{project.year}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <div className="tag-grid">
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
