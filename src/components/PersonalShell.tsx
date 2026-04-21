import { NavLink, Outlet } from "react-router-dom";
import { PersonalHeaderAccount } from "./PersonalHeaderAccount";
import { SiteBrand } from "./SiteBrand";

const navItems = [
  { to: "/home", label: "Home" },
  { to: "/watch", label: "Watch" },
  { to: "/donate", label: "Donate" },
];

export function PersonalShell() {
  return (
    <div className="site-shell site-shell--personal">
      <header className="site-header site-header--personal">
        <div className="container personal-header">
          <div className="personal-header__main">
            <SiteBrand homeTo="/home" subtitle="Studio Journal" theme="personal" />

            <nav aria-label="Personal navigation" className="site-nav site-nav--personal">
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

          <div className="personal-header__account">
            <PersonalHeaderAccount />
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
