import { getCompanyLogo, getCompanyLogoTreatment } from "../content/brandAssets";

type CompanyLogoMarkProps = {
  company: string;
  variant?: "default" | "monochrome";
  className?: string;
};

export function CompanyLogoMark({
  company,
  variant = "default",
  className = "",
}: CompanyLogoMarkProps) {
  const src = getCompanyLogo(company, variant);

  if (!src) {
    return null;
  }

  const treatment = getCompanyLogoTreatment(company);

  return (
    <span
      className={`company-logo company-logo--${treatment} ${className}`.trim()}
      data-company={company}
    >
      <img alt="" src={src} />
    </span>
  );
}
