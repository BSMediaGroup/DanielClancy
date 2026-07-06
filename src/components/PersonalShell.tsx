import { useEffect, useId, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { HeaderMenuButton } from "./HeaderMenuButton";
import { PersonalHeaderAccount, PersonalHeaderCartButton } from "./PersonalHeaderAccount";
import { SiteBrand } from "./SiteBrand";

const navItems = [
  { to: "/home", label: "Home" },
  { to: "/watch", label: "Watch" },
  { to: "/donate", label: "Donate" },
  { to: "/shop", label: "Shop" },
];

const legalItems = [
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
];

export function PersonalShell() {
  const location = useLocation();
  const mobileNavId = useId();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isWatchRoute = location.pathname === "/watch";

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

  return (
    <div className={`site-shell site-shell--personal${isWatchRoute ? " site-shell--watch" : ""}`}>
      {isWatchRoute ? null : (
        <header className="site-header site-header--personal">
          <div className="container personal-header">
            <div className="personal-header__brand">
              <SiteBrand homeTo="/home" subtitle="Personal Studio" theme="personal" />
            </div>

            <div className="personal-header__actions">
              <nav aria-label="Personal navigation" className="site-nav site-nav--desktop site-nav--personal">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `site-nav__link${isActive ? " site-nav__link--active" : ""}`
                    }
                    end
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <HeaderMenuButton
                controls={mobileNavId}
                isOpen={isMobileNavOpen}
                onToggle={() => setIsMobileNavOpen((current) => !current)}
              />

              <div className="personal-header__account">
                <PersonalHeaderCartButton />
                <PersonalHeaderAccount />
              </div>
            </div>
          </div>

          <div className={`container mobile-nav-shell${isMobileNavOpen ? " mobile-nav-shell--open" : ""}`}>
            <nav
              id={mobileNavId}
              aria-label="Personal mobile navigation"
              className="site-nav site-nav--mobile site-nav--personal"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `site-nav__link${isActive ? " site-nav__link--active" : ""}`
                  }
                  end
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
      )}

      <main>
        <Outlet />
      </main>

      {isWatchRoute ? null : <PersonalFooter />}
    </div>
  );
}

export function PersonalFooter() {
  return (
    <footer className="site-footer site-footer--personal">
      <div className="container footer-grid footer-grid--personal">
        <div>
          <p className="kicker">Personal pages</p>
          <h2>Channels, releases, and supporter tools in one quiet shell.</h2>
          <p className="footer-copy">
            These pages are kept separate from the professional portfolio while staying aligned to
            the Daniel Clancy visual system.
          </p>
        </div>

        <div>
          <p className="kicker">Browse</p>
          <div className="footer-link-list">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <p className="kicker">Professional site</p>
          <div className="footer-link-list">
            <NavLink to="/">Portfolio and CV</NavLink>
            {legalItems.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
