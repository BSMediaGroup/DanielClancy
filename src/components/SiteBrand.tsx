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
      <svg className="clancy-wordmark__a" viewBox="-8 0 596 651" focusable="false">
        <path
          d="M157 0 192.57453 145 380.87577 145 416 0H588L388 651H192L-8 0ZM236 322C244 353.33333 252.33333 387.33333 261 424 269.66667 460.66667 277.33333 495.66667 284 529H288C296 495.66667 304.16667 460.66667 312.5 424 320.83333 387.33333 329.33333 353.33333 338 322L350.35404 271H223.48758Z"
          transform="translate(0 651) scale(1 -1)"
        />
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
