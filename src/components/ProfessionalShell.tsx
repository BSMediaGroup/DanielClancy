import { NavLink, Outlet } from "react-router-dom";
import { shellAssets } from "../content/brandAssets";
import { siteMeta } from "../content/siteContent";
import { SiteBrand } from "./SiteBrand";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/cv", label: "CV" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/contact", label: "Contact" },
];

export function ProfessionalShell() {
  return (
    <div className="site-shell site-shell--professional">
      <header className="site-header">
        <div className="container site-header__inner">
          <SiteBrand homeTo="/" subtitle="Design Consultant" theme="professional" />

          <nav aria-label="Professional navigation" className="site-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `site-nav__link${isActive ? " site-nav__link--active" : ""}`
                }
                end={item.to === "/"}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer site-footer--professional">
        <div className="container footer-grid">
          <div>
            <p className="kicker">Daniel Clancy</p>
            <h2>Design documentation, project evidence, and direct contact.</h2>
            <p className="footer-copy">
              Independent drafting and design presentation spanning architecture, urban work,
              structural coordination, and project record keeping.
            </p>
          </div>

          <div>
            <p className="kicker">Direct contact</p>
            <div className="footer-contact">
              <a href={`mailto:${siteMeta.contact.email}`}>{siteMeta.contact.email}</a>
              <a href="tel:+61458747524">{siteMeta.contact.phone}</a>
              <span>{siteMeta.contact.location}</span>
            </div>
          </div>

          <div>
            <p className="kicker">Elsewhere</p>
            <a
              className="footer-icon-link"
              href="https://www.linkedin.com/in/danielmarkclancy/"
              target="_blank"
              rel="noreferrer"
            >
              <img alt="" src={shellAssets.linkedinIcon} />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
