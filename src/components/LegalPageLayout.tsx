import { ReactNode } from "react";
import { Seo } from "./Seo";
import { shellAssets } from "../content/brandAssets";

export type LegalSectionDefinition = {
  id: string;
  title: string;
  summary?: string;
  children: ReactNode;
};

type LegalPageLayoutProps = {
  title: string;
  subtitle: string;
  description: string;
  path: string;
  lastUpdated: string;
  sections: LegalSectionDefinition[];
};

type ExternalLinkProps = {
  href: string;
  children: ReactNode;
};

export function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <a className="legal-link" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}

export function LegalPageLayout({
  title,
  subtitle,
  description,
  path,
  lastUpdated,
  sections,
}: LegalPageLayoutProps) {
  return (
    <>
      <Seo title={title} description={description} path={path} image={shellAssets.professionalShare} />

      <article className="legal-page">
        <section className="hero hero--subpage legal-hero">
          <div className="container hero-split legal-hero__grid">
            <div className="hero-copy legal-hero__copy">
              <p className="kicker">DanielClancy.net legal</p>
              <h1>{title}</h1>
              <p className="hero-copy__lead">{subtitle}</p>
              <p className="legal-plain-note">
                This page is intended to describe the website's practices and terms in plain English.
                It is not a substitute for legal advice.
              </p>
            </div>

            <aside className="surface legal-hero__meta" aria-label={`${title} metadata`}>
              <p className="kicker">Last updated</p>
              <strong>{lastUpdated}</strong>
              <p>
                Contact <a href="mailto:mail@danielclancy.net">mail@danielclancy.net</a> for policy
                questions, correction requests, or privacy-related website enquiries.
              </p>
            </aside>
          </div>
        </section>

        <section className="section legal-content-section">
          <div className="section__band" aria-hidden="true" />
          <div className="container legal-content">
            <nav className="surface legal-anchor-menu" aria-label={`${title} sections`}>
              <div className="legal-anchor-menu__header">
                <p className="kicker">Jump to</p>
                <span>{sections.length} sections</span>
              </div>
              <div className="legal-anchor-menu__links">
                {sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`}>
                    {section.title}
                  </a>
                ))}
              </div>
            </nav>

            <div className="legal-section-list">
              {sections.map((section, index) => {
                const headingId = `${section.id}-heading`;

                return (
                  <section
                    key={section.id}
                    id={section.id}
                    className="surface legal-section"
                    aria-labelledby={headingId}
                  >
                    <div className="legal-section__index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="legal-section__header">
                      <h2 id={headingId}>
                        <span>{section.title}</span>
                        <a
                          className="legal-section__hash-link"
                          href={`#${section.id}`}
                          aria-label={`Link to ${section.title}`}
                        >
                          #
                        </a>
                      </h2>
                      {section.summary ? <p>{section.summary}</p> : null}
                    </div>
                    <div className="legal-copy">{section.children}</div>
                  </section>
                );
              })}
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
