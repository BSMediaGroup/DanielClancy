import { Helmet } from "react-helmet-async";

type SeoProps = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  image?: string;
  type?: "website" | "article";
};

const SITE_TITLE = "Daniel Clancy";
const SITE_URL = "https://www.danielclancy.net";

function toAbsoluteAssetUrl(value?: string) {
  if (!value) {
    return undefined;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}

export function Seo({
  title,
  description,
  path,
  noIndex = false,
  image,
  type = "website",
}: SeoProps) {
  const canonicalUrl = `${SITE_URL}${path}`;
  const pageTitle = title === SITE_TITLE ? SITE_TITLE : `${title} | ${SITE_TITLE}`;
  const robots = noIndex ? "noindex, nofollow, noarchive" : "index, follow";
  const imageUrl = toAbsoluteAssetUrl(image);

  return (
    <Helmet>
      <html lang="en-AU" />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_TITLE} />
      {imageUrl ? <meta property="og:image" content={imageUrl} /> : null}
      <meta name="twitter:card" content={imageUrl ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      {imageUrl ? <meta name="twitter:image" content={imageUrl} /> : null}
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}
