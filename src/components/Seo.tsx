import { Helmet } from "react-helmet-async";

type SeoProps = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

const SITE_TITLE = "Daniel Clancy";
const SITE_URL = "https://www.danielclancy.net";

export function Seo({ title, description, path, noIndex = false }: SeoProps) {
  const canonicalUrl = `${SITE_URL}${path}`;
  const pageTitle = title === SITE_TITLE ? SITE_TITLE : `${title} | ${SITE_TITLE}`;
  const robots = noIndex ? "noindex, nofollow, noarchive" : "index, follow";

  return (
    <Helmet>
      <html lang="en-AU" />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}
