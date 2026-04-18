import { Link } from "react-router-dom";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import {
  experienceItems,
  featuredProjects,
  focusAreas,
  platformList,
  siteMeta,
} from "../content/siteContent";

export function HomePage() {
  const spotlightProjects = featuredProjects.slice(0, 4);
  const recentExperience = experienceItems.slice(0, 4);

  return (
    <>
      <Seo
        title="Daniel Clancy"
        description="Professional drafting, design, CV, and portfolio presentation for Daniel Clancy."
        path="/"
      />

      <section className="hero hero--home">
        <div className="container hero__grid">
          <div className="hero__copy reveal">
            <p className="hero__eyebrow">Employer-facing public site</p>
            <h1>{siteMeta.name}</h1>
            <p className="hero__role">{siteMeta.role}</p>
            <p className="hero__summary">{siteMeta.heroSummary}</p>
            <p className="hero__support">{siteMeta.heroSupport}</p>

            <div className="hero__actions">
              <Link className="button button--primary" to="/portfolio">
                Review portfolio
              </Link>
              <Link className="button button--secondary" to="/cv">
                View CV
              </Link>
            </div>
          </div>

          <div className="hero-panel reveal reveal--delay">
            <p className="hero-panel__label">Current foundation priorities</p>
            <ul className="bullet-list">
              <li>Professional, recruiter-friendly presentation</li>
              <li>Clear evidence of drafting and documentation depth</li>
              <li>Clean route separation for later social and support utilities</li>
            </ul>

            <div className="metric-strip">
              <div>
                <span>Experience</span>
                <strong>17 years</strong>
              </div>
              <div>
                <span>Core tools</span>
                <strong>Revit / AutoCAD</strong>
              </div>
              <div>
                <span>Coverage</span>
                <strong>Architecture / Structural / Urban</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Capabilities"
        title="A restrained public front end built around credibility."
        intro="The live Wix site emphasises platform fluency, employment history, and practical work samples. This scaffold preserves that structure while making it easier to refine."
      >
        <div className="two-column-grid">
          <div className="surface">
            <h3>Focus areas</h3>
            <div className="tag-grid">
              {focusAreas.map((item) => (
                <span key={item} className="tag">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="surface">
            <h3>Platforms and software</h3>
            <div className="platform-list">
              {platformList.map((item) => (
                <div key={item} className="platform-list__item">
                  <span className="platform-list__dot" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Experience"
        title="Selected employment history."
        intro="The complete timeline lives on the CV page. This home view keeps the first pass concise and employer-focused."
      >
        <div className="timeline-list">
          {recentExperience.map((item) => (
            <article key={`${item.company}-${item.period}`} className="timeline-item">
              <div className="timeline-item__meta">
                <p>{item.period}</p>
                <span>{item.location}</span>
              </div>
              <div className="timeline-item__body">
                <h3>{item.company}</h3>
                <p className="timeline-item__role">{item.role}</p>
                <p>{item.summary}</p>
                <a href={item.url} target="_blank" rel="noreferrer">
                  Visit organisation
                </a>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Work samples"
        title="Featured project selection."
        intro="This first milestone uses a curated subset of the Wix export to create a presentable portfolio landing surface without attempting a full migration."
      >
        <div className="project-grid">
          {spotlightProjects.map((project) => (
            <article key={project.title} className="project-card">
              <img src={project.image} alt={project.title} loading="lazy" />
              <div className="project-card__body">
                <p className="project-card__meta">{project.client}</p>
                <h3>{project.title}</h3>
                <p>{project.summary}</p>
                <div className="tag-grid">
                  {project.platforms.map((platform) => (
                    <span key={platform} className="tag tag--muted">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Contact"
        title="Ready for CV review, portfolio assessment, and hiring conversations."
        intro="The direct contact route remains simple in this milestone: clear details, an unwired form scaffold, and an easy hand-off to later integrations."
      >
        <div className="cta-panel">
          <div>
            <p className="cta-panel__eyebrow">Direct line</p>
            <h3>{siteMeta.contact.email}</h3>
            <p>{siteMeta.contact.phone}</p>
            <p>{siteMeta.contact.postal}</p>
          </div>

          <div className="cta-panel__actions">
            <Link className="button button--primary" to="/contact">
              Open contact page
            </Link>
            <Link className="button button--secondary" to="/cv">
              Download CV
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
