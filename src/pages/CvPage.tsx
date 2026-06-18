import { Link } from "react-router-dom";
import { CompanyLogoMark } from "../components/CompanyLogoMark";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { getSoftwareLogo, shellAssets } from "../content/brandAssets";
import { siteMeta } from "../content/siteContent";
import {
  getPlatformIconPath,
  resolveCompanyByIdNameSlug,
  resolvePlatformByIdNameSlug,
  usePublicSiteData,
} from "../lib/publicSiteData";

export function CvPage() {
  const { companies, platforms, positions } = usePublicSiteData();
  const platformList = platforms.map((platform) => platform.name);
  return (
    <>
      <Seo
        title="CV"
        description="CV overview, experience chronology, and software summary for Daniel Clancy."
        path="/cv"
        image={shellAssets.professionalShare}
      />

      <section className="hero hero--subpage">
        <div className="container hero-split hero-split--document">
          <div className="hero-copy">
            <p className="kicker">Curriculum vitae</p>
            <h1>A clear chronology, direct PDF access, and credible software context.</h1>
            <p className="hero-copy__lead">{siteMeta.heroSummary}</p>
            <div className="hero-actions">
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

          <aside className="surface">
            <p className="kicker">CV highlights</p>
            <div className="info-list">
              <div>
                <span>Role</span>
                <strong>{siteMeta.role}</strong>
              </div>
              <div>
                <span>Base</span>
                <strong>{siteMeta.contact.location}</strong>
              </div>
              <div>
                <span>Contact</span>
                <strong>{siteMeta.contact.email}</strong>
              </div>
              <div>
                <span>Evidence</span>
                <strong>Portfolio detail routes</strong>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Section
        eyebrow="Software"
        title="Production tools used across documentation, presentation, and review."
        intro="The layout stays documentation-first, with company marks and software marks kept subtle rather than oversized."
        className="section--muted"
      >
        <div className="logo-card-grid">
          {platformList.map((item) => {
            const platform = resolvePlatformByIdNameSlug(platforms, item);
            const logo = getPlatformIconPath(platform, item) || getSoftwareLogo(item);

            return (
              <article key={item} className="surface surface--compact">
                <div className="icon-heading" title={platform?.name || item}>
                  {logo ? <img alt={platform?.name || item} src={logo} /> : null}
                  <h3>{item}</h3>
                </div>
              </article>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="Employment chronology"
        title="Experience timeline"
        intro="Roles are ordered as a readable digital record, with the company mark present where a reliable local asset exists."
      >
        <div className="timeline-list timeline-list--document">
          {positions.map((item) => {
            const company = resolveCompanyByIdNameSlug(companies, item.companyId || item.companyName);
            const period = item.period || formatPositionPeriod(item.startDate, item.endDate, item.current);
            return (
              <article key={`${item.companyName}-${period}`} className="timeline-card timeline-card--document">
                <div className="timeline-card__meta">
                  <span>{period}</span>
                  <small>{item.location}</small>
                </div>

                <div className="timeline-card__body">
                  <div className="timeline-card__heading">
                    <div>
                      <h3>{item.companyName}</h3>
                      <p>{item.title}</p>
                    </div>
                  </div>
                  <p>{item.summary}</p>
                  {item.url || company?.website ? (
                    <a className="text-link" href={item.url || company?.website} target="_blank" rel="noreferrer">
                      {(item.url || company?.website || "").replace("https://", "").replace(/\/$/, "")}
                    </a>
                  ) : null}
                  <div className="timeline-card__logo">
                    <CompanyLogoMark company={item.companyName} variant="monochrome" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="section-actions">
          <Link className="button button--secondary" to="/portfolio">
            Browse project archive
          </Link>
          <Link className="button button--ghost" to="/contact">
            Contact Daniel
          </Link>
        </div>
      </Section>
    </>
  );
}

function formatPositionPeriod(startDate?: string, endDate?: string, current?: boolean) {
  const start = formatMonthYear(startDate);
  const end = current ? "Present" : formatMonthYear(endDate);
  if (start && end) return `${start} – ${end}`;
  return start || end || "Undated";
}

function formatMonthYear(value?: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
  }).format(parsed);
}
