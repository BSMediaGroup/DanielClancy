import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { shellAssets } from "../content/brandAssets";
import { siteMeta } from "../content/siteContent";
import { HeaderMenuButton } from "./HeaderMenuButton";
import { SiteBrand } from "./SiteBrand";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/cv", label: "CV" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/contact", label: "Contact" },
];

type ProfessionalTheme = "dark" | "light";

const themeStorageKey = "dc-professional-theme";

function getInitialTheme(): ProfessionalTheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey);
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ProfessionalShell() {
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const mobileNavId = useId();
  const isHomeRoute = location.pathname === "/";
  const [homeHeaderProgress, setHomeHeaderProgress] = useState(isHomeRoute ? 0 : 1);
  const [homeHeaderOffset, setHomeHeaderOffset] = useState(isHomeRoute ? 76 : 0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState<ProfessionalTheme>(getInitialTheme);

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, theme);
    document.documentElement.style.colorScheme = theme;

    return () => {
      document.documentElement.style.removeProperty("color-scheme");
    };
  }, [theme]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth > 760) {
        setIsMobileNavOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileNavOpen(false);
      }
    };

    window.addEventListener("resize", closeOnDesktop);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("resize", closeOnDesktop);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

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
  }, [isHomeRoute, isMobileNavOpen]);

  const homeShellStyle = isHomeRoute
    ? ({
        "--home-header-offset": `${homeHeaderOffset}px`,
        "--home-header-progress": homeHeaderProgress,
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={`site-shell site-shell--professional${isHomeRoute ? " site-shell--home" : ""}`}
      data-professional-theme={theme}
      style={homeShellStyle}
    >
      <header
        ref={headerRef}
        className={`site-header${isHomeRoute ? " site-header--home" : ""}`}
      >
        <div className="container site-header__inner">
          <SiteBrand homeTo="/" theme="professional" />

          <div className="site-header__actions">
            <nav aria-label="Professional navigation" className="site-nav site-nav--desktop">
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

            <button
              aria-label={`Use ${theme === "dark" ? "light" : "dark"} theme`}
              className="theme-toggle"
              title={`Use ${theme === "dark" ? "light" : "dark"} theme`}
              type="button"
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? (
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3.5" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M20.4 15.3A8.5 8.5 0 0 1 8.7 3.6 8.5 8.5 0 1 0 20.4 15.3Z" />
                </svg>
              )}
            </button>

            <HeaderMenuButton
              controls={mobileNavId}
              isOpen={isMobileNavOpen}
              onToggle={() => setIsMobileNavOpen((current) => !current)}
            />
          </div>
        </div>

        <div className={`container mobile-nav-shell${isMobileNavOpen ? " mobile-nav-shell--open" : ""}`}>
          <nav
            id={mobileNavId}
            aria-label="Professional mobile navigation"
            className="site-nav site-nav--mobile"
          >
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
            <h2>Design documentation, selected projects, and direct contact.</h2>
            <p className="footer-copy">
              Independent drafting and design presentation spanning architecture, urban work,
              structural coordination, and technical documentation.
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
