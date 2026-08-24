import { Link } from "react-router-dom";
import { CompanyLogoMark } from "../components/CompanyLogoMark";
import { Section } from "../components/Section";
import { Seo } from "../components/Seo";
import { getSoftwareLogo, shellAssets } from "../content/brandAssets";
import { siteMeta, softwareGroups } from "../content/siteContent";
import {
  getPlatformIconPath,
  resolveCompanyByIdNameSlug,
  resolvePlatformByIdNameSlug,
  usePublicSiteData,
} from "../lib/publicSiteData";

export function CvPage() {
  const { companies, platforms, positions } = usePublicSiteData();

  return (
    <>
      <Seo
        title="CV"
        description="CV overview, experience chronology, and software summary for Daniel Clancy."
        path="/cv"
        image={shellAssets.professionalShare}
      />

      <section className="hero hero--subpage cv-hero">
        <div className="container cv-hero__grid">
          <div className="cv-hero__copy">
            <p className="kicker">Curriculum vitae / 2026</p>
            <h1>Drafting, design and technical documentation.</h1>
            <p className="hero-copy__lead">{siteMeta.heroSummary}</p>
            <div className="hero-actions">
              <a
                className="button button--primary"
                href="/docs/Daniel_Clancy_CV_2026.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Open dark PDF
              </a>
              <a
                className="button button--secondary"
                href="/docs/Daniel_Clancy_CV_2026_Light.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Open light PDF
              </a>
            </div>
          </div>

          <aside className="cv-contact-sheet" aria-label="Professional contact details">
            <div className="cv-contact-sheet__head">
              <span>DC / CV</span>
              <span>Curriculum vitae</span>
            </div>
            <dl className="cv-contact-sheet__details">
              <div><dt>Role</dt><dd>{siteMeta.role}</dd></div>
              <div><dt>Location</dt><dd>{siteMeta.contact.location}</dd></div>
              <div>
                <dt>Email</dt>
                <dd><a href={`mailto:${siteMeta.contact.email}`}>{siteMeta.contact.email}</a></dd>
              </div>
              <div>
                <dt>Telephone</dt>
                <dd><a href="tel:+61458747524">{siteMeta.contact.phone}</a></dd>
              </div>
              <div><dt>Postal</dt><dd>{siteMeta.contact.postal}</dd></div>
            </dl>
          </aside>
        </div>
      </section>

      <Section
        eyebrow="Capabilities"
        title="Production platforms"
        intro="A concise view of the established drafting, BIM, presentation, coordination and spatial toolset."
        className="section--muted cv-capabilities"
      >
        <div className="cv-software-groups">
          {softwareGroups.map((group, groupIndex) => (
            <article key={group.label} className="cv-software-group">
              <div className="cv-software-group__head">
                <span>{String(groupIndex + 1).padStart(2, "0")}</span>
                <h3>{group.label}</h3>
              </div>
              <div className="cv-software-group__tools">
                {group.items.map((item) => {
                  const platform = resolvePlatformByIdNameSlug(platforms, item);
                  const logo = getPlatformIconPath(platform, item) || getSoftwareLogo(item);
                  return (
                    <div key={item} className="cv-tool" title={platform?.name || item}>
                      {logo ? <img alt="" src={logo} /> : null}
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Employment chronology"
        title="Professional experience"
        intro="Roles, employers, locations and existing role descriptions."
      >
        <div className="cv-timeline" role="list">
          {positions.map((item, index) => {
            const company = resolveCompanyByIdNameSlug(companies, item.companyId || item.companyName);
            const period = item.period || formatPositionPeriod(item.startDate, item.endDate, item.current);
            const companyUrl = item.url || company?.website;
            return (
              <article key={`${item.companyName}-${period}`} className="cv-role" role="listitem">
                <div className="cv-role__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="cv-role__period">
                  <strong>{period}</strong>
                  {item.location ? <span>{item.location}</span> : null}
                </div>
                <div className="cv-role__body">
                  <p className="kicker">{item.companyName}</p>
                  <h3>{item.title}</h3>
                  {item.summary ? <p>{item.summary}</p> : null}
                  {item.responsibilities?.length ? (
                    <ul className="bullet-list">
                      {item.responsibilities.map((responsibility) => <li key={responsibility}>{responsibility}</li>)}
                    </ul>
                  ) : null}
                  {item.highlights?.length ? (
                    <ul className="bullet-list">
                      {item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                    </ul>
                  ) : null}
                  {companyUrl ? (
                    <a className="text-link" href={companyUrl} target="_blank" rel="noreferrer">
                      {companyUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  ) : null}
                </div>
                <div className="cv-role__mark">
                  <CompanyLogoMark company={item.companyName} variant="monochrome" />
                </div>
              </article>
            );
          })}
        </div>

        <div className="cv-closing">
          <div>
            <p className="kicker">Selected projects</p>
            <h2>View projects from across the career history.</h2>
          </div>
          <div className="section-actions">
            <Link className="button button--secondary" to="/portfolio">View portfolio</Link>
            <Link className="button button--ghost" to="/contact">Contact Daniel</Link>
          </div>
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
  return new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric" }).format(parsed);
}
