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

      <section className="hero hero--subpage hero--document">
        <div className="container hero__grid hero__grid--document">
          <div className="hero__copy reveal">
            <p className="hero__eyebrow">Curriculum vitae</p>
            <h1>CV / 2026</h1>
            <p className="hero__summary">{siteMeta.heroSummary}</p>
            <p className="hero__support">
              Structured for recruiter review with direct PDF access, concise
              software framing, and a readable employment chronology.
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
              <a
                className="button button--secondary"
                href="/docs/Daniel_Clancy_CV_2026.pdf"
                download
              >
                Download PDF
              </a>
            </div>
          </div>

          <div className="download-panel reveal reveal--delay">
            <div className="download-panel__group">
              <p className="download-panel__eyebrow">Document notes</p>
              <h2>Daniel Clancy CV 2026</h2>
              <p>
                The public build currently ships the PDF asset already present in
                the repo. A DOCX counterpart can be added later when a source file
                is available.
              </p>
            </div>

            <div className="download-panel__grid">
              <div>
                <span>Primary review route</span>
                <strong>PDF</strong>
              </div>
              <div>
                <span>Supporting page</span>
                <strong>/portfolio</strong>
              </div>
              <div>
                <span>Direct contact</span>
                <strong>{siteMeta.contact.email}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section
        eyebrow="Profile"
        title="Software and documentation context."
        intro="The live CV page is compact and direct. This version keeps the same information priorities but improves separation between summary, downloads, and chronology."
        className="section--muted"
      >
        <div className="two-column-grid two-column-grid--offset">
          <div className="surface surface--soft">
            <p className="contact-card__label">Core software</p>
            <h3>Production stack</h3>
            <div className="tag-grid">
              {platformList.map((item) => (
                <span key={item} className="tag">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="surface surface--soft">
            <p className="contact-card__label">Supporting routes</p>
            <h3>Recruiter-friendly review flow</h3>
            <p>
              Reviewers can move from this CV into the portfolio and contact pages
              without leaving the core employer-facing section of the site.
            </p>
            <div className="hero__actions hero__actions--inline">
              <Link className="button button--secondary" to="/portfolio">
                Review portfolio
              </Link>
              <Link className="button button--secondary" to="/contact">
                Contact Daniel
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Employment chronology"
        title="Employment history"
        intro="Timeline entries below are seeded from the local Wix collection export and presented in a more legible recruiter-facing format."
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
