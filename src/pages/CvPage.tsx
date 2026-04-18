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

      <section className="hero hero--subpage">
        <div className="container hero__grid hero__grid--single">
          <div className="hero__copy reveal">
            <p className="hero__eyebrow">Curriculum vitae</p>
            <h1>CV foundation</h1>
            <p className="hero__summary">
              A recruiter-friendly version of the current Wix CV page, seeded from
              the local exported employment history and local PDF asset.
            </p>
          </div>

          <div className="download-panel reveal reveal--delay">
            <div>
              <p className="download-panel__eyebrow">Available now</p>
              <h2>Daniel Clancy CV 2026 PDF</h2>
              <p>
                The exported PDF is wired into the public scaffold. A DOCX version
                can be added later when the source asset is available in-repo.
              </p>
            </div>
            <div className="download-panel__actions">
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
        </div>
      </section>

      <Section
        eyebrow="Profile"
        title="Professional summary"
        intro={siteMeta.heroSummary}
      >
        <div className="two-column-grid">
          <div className="surface">
            <h3>Core software</h3>
            <div className="tag-grid">
              {platformList.map((item) => (
                <span key={item} className="tag">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="surface">
            <h3>Current scaffold status</h3>
            <p>
              This route presents a truthful first migration from the existing live
              page and local export tables. Full CV formatting refinement is
              deferred to a later content pass.
            </p>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Experience timeline"
        title="Employment history"
        intro="Timeline entries below are seeded from the local Wix collection export and kept concise for the first rebuild milestone."
      >
        <div className="timeline-list">
          {experienceItems.map((item) => (
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
                  {item.url.replace("https://", "")}
                </a>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
