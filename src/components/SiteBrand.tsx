import { NavLink } from "react-router-dom";
import { shellAssets } from "../content/brandAssets";

type SiteBrandProps = {
  homeTo: string;
  subtitle: string;
  theme?: "professional" | "personal";
};

export function SiteBrand({ homeTo, subtitle, theme = "professional" }: SiteBrandProps) {
  return (
    <NavLink className={`brand brand--${theme}`} to={homeTo}>
      <span className="brand__mark" aria-hidden="true">
        <img alt="" src={shellAssets.danielLogo} />
      </span>
      <span className="brand__copy">
        <span className="brand__title">Daniel Clancy</span>
        <span className="brand__subtitle">{subtitle}</span>
      </span>
    </NavLink>
  );
}
