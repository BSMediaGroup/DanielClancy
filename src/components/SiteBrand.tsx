import { NavLink } from "react-router-dom";
import { shellAssets } from "../content/brandAssets";

type SiteBrandProps = {
  homeTo: string;
  subtitle?: string;
  theme?: "professional" | "personal";
};

type ClancyWordmarkProps = {
  className?: string;
};

export function ClancyWordmark({ className = "" }: ClancyWordmarkProps) {
  return (
    <span className={`clancy-wordmark ${className}`.trim()} aria-hidden="true">
      <span className="clancy-wordmark__letters">CL</span>
      <svg className="clancy-wordmark__a" viewBox="0 0 100 100" focusable="false">
        <path d="M5 96 50 4 95 96M25 62H75" />
      </svg>
      <span className="clancy-wordmark__letters">NCY</span>
    </span>
  );
}

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
            <ClancyWordmark className="brand__name-line brand__name-line--outline" />
          </span>
        ) : (
          <span className="brand__title">Daniel Clancy</span>
        )}
        {subtitle ? <span className="brand__subtitle">{subtitle}</span> : null}
      </span>
    </NavLink>
  );
}
