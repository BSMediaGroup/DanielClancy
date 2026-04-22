import { useEffect, useRef, useState, type CSSProperties } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const isHomeRoute = location.pathname === "/";
  const [homeHeaderProgress, setHomeHeaderProgress] = useState(isHomeRoute ? 0 : 1);
  const [homeHeaderOffset, setHomeHeaderOffset] = useState(isHomeRoute ? 76 : 0);

  useEffect(() => {
    if (!isHomeRoute) {
      setHomeHeaderProgress(1);
      setHomeHeaderOffset(0);
      return;
    }

    let frame = 0;

    const updateHeaderState = () => {
      const headerHeight = headerRef.current?.offsetHeight ?? 0;
      const hero = document.querySelector<HTMLElement>(".hero--professional-home");
      const fadeDistance = hero ? Math.min(Math.max(hero.offsetHeight * 0.38, 140), 340) : 220;
      const nextProgress = Math.min(window.scrollY / fadeDistance, 1);

      setHomeHeaderOffset((current) => (current === headerHeight ? current : headerHeight));
      setHomeHeaderProgress((current) => (Math.abs(current - nextProgress) < 0.01 ? current : nextProgress));
    };

    const requestUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateHeaderState);
    };

    updateHeaderState();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [isHomeRoute]);

  const homeShellStyle = isHomeRoute
    ? ({
        "--home-header-offset": `${homeHeaderOffset}px`,
        "--home-header-progress": homeHeaderProgress,
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={`site-shell site-shell--professional${isHomeRoute ? " site-shell--home" : ""}`}
      style={homeShellStyle}
    >
      <header
        ref={headerRef}
        className={`site-header${isHomeRoute ? " site-header--home" : ""}`}
      >
        <div className="container site-header__inner">
          <SiteBrand homeTo="/" subtitle="Design Consultant" theme="professional" />

          <div className="site-header__actions">
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
