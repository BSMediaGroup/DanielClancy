import { NavLink, Outlet } from "react-router-dom";

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
            <span className="brand__title">Drafting and Design</span>
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
          <div>
            <p className="footer-label">Professional presentation</p>
            <p className="footer-copy">
              Employer-facing rebuild scaffold for DanielClancy.net, prepared for
              Cloudflare Pages static hosting.
            </p>
          </div>

          <div className="footer-contact">
            <a href="mailto:mail@danielclancy.net">mail@danielclancy.net</a>
            <a href="tel:+61458747524">+61 458 747 524</a>
            <span>Potts Point, New South Wales</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
