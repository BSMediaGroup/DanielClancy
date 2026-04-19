import { Link } from "react-router-dom";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { experienceItems, platformList, siteMeta } from "../content/siteContent";

export function CvPage() {
  return (
    <>
      <Seo
        title="CV"
        description="CV overview, downloadable PDF, experience timeline, and software summary for Daniel Clancy."
        path="/cv"
      />

      <section className="hero hero--subpage hero--document hero--casefile">
        <div className="container hero__grid hero__grid--document">
          <div className="hero__copy reveal">
            <p className="hero__eyebrow">Curriculum vitae / 2026</p>
            <h1>Digital CV casefile</h1>
            <p className="hero__summary">{siteMeta.heroSummary}</p>
            <p className="hero__support">
              Structured for recruiter review with a direct PDF route, a readable chronology, and a
              clearer split between biography, software, and actions.
            </p>

            <div className="hero__actions">
              <a
                className="button button--primary"
                href="/docs/Daniel_Clancy_CV_2026.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Open PDF
              </a>
              <a className="button button--secondary" href="/docs/Daniel_Clancy_CV_2026.pdf" download>
                Download PDF
              </a>
            </div>
          </div>

          <aside className="download-panel reveal reveal--delay">
            <div className="download-panel__group">
              <p className="download-panel__eyebrow">Review notes</p>
              <h2>Current public CV asset</h2>
              <p>
                The repo ships a PDF-first review flow for Cloudflare Pages compatibility. Any DOCX or
                structured export can remain a later enhancement.
              </p>
            </div>

            <div className="download-panel__grid">
              <div>
                <span>Review format</span>
                <strong>PDF</strong>
              </div>
              <div>
                <span>Archive route</span>
                <strong>/portfolio</strong>
              </div>
              <div>
                <span>Contact</span>
                <strong>{siteMeta.contact.email}</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Section
        eyebrow="Review context"
        title="Core tools and route discipline."
        intro="The page keeps Daniel's résumé readable in seconds while making it easier to pivot into project evidence or direct contact."
        className="section--muted"
      >
        <div className="two-column-grid two-column-grid--offset">
          <article className="surface surface--soft">
            <p className="contact-card__label">Production stack</p>
            <h3>Software in regular use</h3>
            <div className="tag-grid">
              {platformList.map((item) => (
                <span key={item} className="tag">
                  {item}
                </span>
              ))}
            </div>
          </article>

          <article className="surface surface--soft">
            <p className="contact-card__label">Review path</p>
            <h3>CV first, evidence second, contact third.</h3>
            <p>
              The rebuild keeps the recruiter journey explicit instead of hiding it behind stylistic novelty.
            </p>
            <div className="hero__actions hero__actions--inline">
              <Link className="button button--secondary" to="/portfolio">
                Open portfolio
              </Link>
              <Link className="button button--secondary" to="/contact">
                Contact Daniel
              </Link>
            </div>
          </article>
        </div>
      </Section>

      <Section
        eyebrow="Employment chronology"
        title="Experience timeline"
        intro="Presented as a cleaner digital dossier: readable on desktop, still scannable on mobile, and faithful to the locally retained employment record."
        className="section--deep"
      >
        <div className="timeline-list timeline-list--document">
          {experienceItems.map((item) => (
            <article key={`${item.company}-${item.period}`} className="timeline-item timeline-item--document">
              <div className="timeline-item__meta">
                <p>{item.period}</p>
                <span>{item.location}</span>
              </div>
              <div className="timeline-item__body">
                <div className="timeline-item__heading">
                  <h3>{item.company}</h3>
                  <p className="timeline-item__role">{item.role}</p>
                </div>
                <p>{item.summary}</p>
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.url.replace("https://", "").replace(/\/$/, "")}
                </a>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
