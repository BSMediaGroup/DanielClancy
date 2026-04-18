import { Link, NavLink, Outlet } from "react-router-dom";
import { siteMeta } from "../content/siteContent";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/cv", label: "CV" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/contact", label: "Contact" },
];

export function SiteLayout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container site-header__inner">
          <NavLink className="brand" to="/">
            <span className="brand__eyebrow">Daniel Clancy</span>
            <span className="brand__title">Design Consultant</span>
          </NavLink>

          <nav aria-label="Primary" className="site-nav">
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

      <footer className="site-footer">
        <div className="container site-footer__inner">
          <div className="site-footer__primary">
            <p className="footer-label">Employer-facing public site</p>
            <p className="footer-copy">
              Refined public front end for CV review, portfolio assessment, and
              direct hiring enquiries.
            </p>
          </div>

          <div className="footer-contact">
            <a href={`mailto:${siteMeta.contact.email}`}>{siteMeta.contact.email}</a>
            <a href="tel:+61458747524">{siteMeta.contact.phone}</a>
            <span>{siteMeta.contact.location}</span>
          </div>
        </div>

        <div className="container site-footer__utility">
          <div>
            <p className="footer-label">Secondary utility routes</p>
            <p className="footer-copy footer-copy--muted">
              Kept outside the primary navigation and excluded from indexing.
            </p>
          </div>

          <div className="footer-utility-links" aria-label="Secondary utility routes">
            <Link to="/watch">Watch</Link>
            <Link to="/donate">Donate</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
