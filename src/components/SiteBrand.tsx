import { NavLink } from "react-router-dom";
import { shellAssets } from "../content/brandAssets";

type SiteBrandProps = {
  homeTo: string;
  subtitle?: string;
  theme?: "professional" | "personal";
};

export function SiteBrand({ homeTo, subtitle, theme = "professional" }: SiteBrandProps) {
  return (
    <NavLink className={`brand brand--${theme}`} to={homeTo}>
      <span className="brand__mark" aria-hidden="true">
        <img alt="" src={shellAssets.danielLogo} />
      </span>
      <span className="brand__copy">
        {theme === "professional" ? (
          <span className="brand__title brand__title--stacked" aria-label="Daniel Clancy">
            <span className="brand__name-line">Daniel</span>
            <span className="brand__name-line brand__name-line--outline">Clancy</span>
          </span>
        ) : (
          <span className="brand__title">Daniel Clancy</span>
        )}
        {subtitle ? <span className="brand__subtitle">{subtitle}</span> : null}
      </span>
    </NavLink>
  );
}
