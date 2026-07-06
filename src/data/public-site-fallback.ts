import {
  experienceItems,
  platformList,
  portfolioArchive,
  type ExperienceItem,
  type PortfolioItem,
} from "../content/siteContent";
import generatedFallback from "./public-site-fallback.generated.json";

export type PublicCompany = {
  id: string;
  slug: string;
  name: string;
  logoPath?: string;
  location?: string;
  website?: string;
  description?: string;
  status?: string;
  sortOrder?: number;
};

export type PublicPlatform = {
  id: string;
  slug: string;
  name: string;
  vendor?: string;
  logoPath?: string;
  website?: string;
  status?: string;
  sortOrder?: number;
};

export type PublicPosition = {
  id: string;
  slug: string;
  title: string;
  companyId: string;
  companyName: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  summary?: string;
  responsibilities?: string[];
  highlights?: string[];
  platformIds?: string[];
  period?: string;
  url?: string;
  status?: string;
  sortOrder?: number;
};

export type PublicProject = PortfolioItem & {
  code?: string;
  category?: string;
  discipline?: string;
  tags?: string[];
  thumbnailPath?: string;
  heroImage?: string;
  galleryPaths?: string[];
  documentPath?: string;
  companyId?: string;
  companyName?: string;
  companyIds?: string[];
  companyLabels?: string[];
  clientName?: string;
  clientLabel?: string;
  platformIds?: string[];
  platformLabels?: string[];
  dates?: string;
  visibility?: string;
  source?: string;
};

export type PublicWatchMedia = {
  id: string;
  sourcePlatform: "youtube" | "rumble" | "manual" | string;
  entryType: "video" | "short" | "livestream" | "other" | string;
  source: "autofetch" | "manual" | string;
  title: string;
  description?: string;
  excerpt?: string;
  thumbnailUrl?: string;
  sourceUrl?: string;
  embedUrl?: string;
  externalUrl?: string;
  canonicalUrl?: string;
  cloudflareStreamUid?: string;
  streamUid?: string;
  hlsUrl?: string;
  customEmbedUrl?: string;
  platformVideoId?: string;
  platformChannelId?: string;
  liveStatus?: string;
  publishedAt?: string | null;
  enteredAt?: string;
  sortDate?: string;
  createdAt?: string;
  visible?: boolean;
  featured?: boolean;
  manualHeroEligible?: boolean;
  heroEmbeddable?: boolean;
  galleryOnly?: boolean;
  aspect?: "landscape" | "portrait" | "square" | "16:9" | "9:16" | "1:1" | string;
  tags?: string[];
  updatedAt?: string;
};

export type PublicSiteDataModel = {
  schemaVersion: "danielclancy-public-site-data.v1";
  generatedAt: string;
  source: "static_fallback" | "published_kv_snapshot" | "live_reconciled_fallback" | "baseline_fallback" | "admin_kv_reconciled" | "admin_baseline_reconciled" | "mixed_fallback";
  revision?: string;
  publishedAt?: string | null;
  usingFallback?: boolean;
  error?: string;
  collections: {
    projects: PublicProject[];
    companies: PublicCompany[];
    platforms: PublicPlatform[];
    positions: PublicPosition[];
    watchMedia: PublicWatchMedia[];
  };
  assets: {
    portfolioThumbs: Array<{ path: string; label?: string }>;
    portfolioImages: Array<{ path: string; label?: string }>;
    docs: Array<{ path: string; label?: string }>;
  };
  warnings: string[];
};

const thumbnailBySlug: Record<string, string> = {
  "wungong-urban-water-master-plan": "/media/portfolio/thumbs/wungong-masterplan-thumb.webp",
  "upss-wyoming-nsw": "/media/portfolio/thumbs/upss-wyoming.webp",
  "upss-north-richmond-nsw": "/media/portfolio/thumbs/upss-north-richmond.webp",
  "upss-homebush-nsw": "/media/portfolio/thumbs/upss-homebush.webp",
  "upss-grafton-nsw": "/media/portfolio/thumbs/upss-grafton.webp",
  "upss-brownsville-nsw": "/media/portfolio/thumbs/upss-brownsville.webp",
  "upss-beacon-hill-nsw": "/media/portfolio/thumbs/upss-beacon-hill.webp",
  "proposed-retail-development-for-dawesville-iga": "/media/portfolio/thumbs/thumb-dawesville.webp",
  "south-perth-promenade": "/media/portfolio/thumbs/south-perth-promenade-thumb.webp",
  "redevelopment-of-highway-service-center-pheasants-nest-m31-north-and-south":
    "/media/portfolio/thumbs/pheasants-nest-thumb.webp",
  "proposed-boundary-re-alignment-of-lot-1-on-dp-d073414-234-jull-st-armadale-6112":
    "/media/portfolio/thumbs/jull-st.jpg",
  "gardencity-redevelopment": "/media/portfolio/thumbs/gardencity-thumb.webp",
  "geraldton-fire-station-structural-documentation": "/media/portfolio/thumbs/fesa-fire-thumb.webp",
  "lot-500-eighth-road-land-resumption": "/media/portfolio/thumbs/eighth-rd.jpg",
  "curtin-creative-quarter-misc-details": "/media/portfolio/thumbs/curtin-creative-quarter-bus-stand.webp",
  "cue-roadhouse": "/media/portfolio/thumbs/cue-roadhouse-thumb.webp",
  "cottesloe-beach-house-landscape-design": "/media/portfolio/thumbs/cottesloe-beach-house-thumb.webp",
  "cockburn-coast": "/media/portfolio/thumbs/cockburn-coast-details-thumb.webp",
};

const builtInFallback: PublicSiteDataModel = {
  schemaVersion: "danielclancy-public-site-data.v1",
  generatedAt: "static-fallback",
  source: "static_fallback",
  usingFallback: true,
  collections: {
    projects: portfolioArchive.map(toFallbackProject),
    companies: experienceItems.map(toFallbackCompany),
    platforms: platformList.map(toFallbackPlatform),
    positions: experienceItems.map(toFallbackPosition),
    watchMedia: [],
  },
  assets: {
    portfolioThumbs: Object.values(thumbnailBySlug).map((path) => ({ path })),
    portfolioImages: portfolioArchive.flatMap((project) => project.media.map((item) => ({ path: item.src, label: item.title }))),
    docs: [
      { path: "/docs/Daniel_Clancy_CV_2026.pdf", label: "Daniel Clancy CV 2026" },
      { path: "/docs/Daniel_Clancy_CV_2026_Light.pdf", label: "Daniel Clancy CV 2026 Light" },
    ],
  },
  warnings: [],
};

export const publicSiteFallback: PublicSiteDataModel = isGeneratedPublicSiteFallback(generatedFallback)
  ? normalizeGeneratedFallback(generatedFallback)
  : builtInFallback;

function toFallbackProject(project: PortfolioItem): PublicProject {
  const companyName = project.studio[0] || project.client;
  const platformLabels = project.software;
  return {
    ...project,
    thumbnailPath: thumbnailBySlug[project.slug] || project.image,
    heroImage: project.image,
    galleryPaths: project.media.map((item) => item.src),
    documentPath: project.documentationUrl?.startsWith("/docs/") ? project.documentationUrl : "",
    companyName,
    companyLabels: project.studio,
    companyIds: project.studio.map(slugify),
    clientName: project.client,
    clientLabel: project.client,
    platformIds: platformLabels.map(slugifyPlatform),
    platformLabels,
    dates: project.dateLabel,
    visibility: "public",
    source: "static_fallback",
  };
}

function toFallbackCompany(item: ExperienceItem, index: number): PublicCompany {
  return {
    id: slugify(item.company),
    slug: slugify(item.company),
    name: item.company,
    location: item.location,
    website: item.url,
    status: "active",
    sortOrder: (index + 1) * 10,
  };
}

function toFallbackPlatform(name: string, index: number): PublicPlatform {
  return {
    id: slugifyPlatform(name),
    slug: slugifyPlatform(name),
    name,
    status: "active",
    sortOrder: (index + 1) * 10,
  };
}

function toFallbackPosition(item: ExperienceItem, index: number): PublicPosition {
  return {
    id: slugify(`${item.company}-${item.role}`),
    slug: slugify(`${item.company}-${item.role}`),
    title: item.role,
    companyId: slugify(item.company),
    companyName: item.company,
    location: item.location,
    summary: item.summary,
    period: item.period,
    url: item.url,
    status: "active",
    sortOrder: (index + 1) * 10,
  };
}

function normalizeGeneratedFallback(value: PublicSiteDataModel): PublicSiteDataModel {
  return {
    ...value,
    source: "static_fallback",
    usingFallback: true,
    collections: {
      projects: value.collections.projects.map(normalizeGeneratedProject),
      companies: value.collections.companies.length ? value.collections.companies : builtInFallback.collections.companies,
      platforms: value.collections.platforms.length ? value.collections.platforms : builtInFallback.collections.platforms,
      positions: value.collections.positions.length ? value.collections.positions : builtInFallback.collections.positions,
      watchMedia: Array.isArray(value.collections.watchMedia) ? value.collections.watchMedia.filter((item) => !isScaffoldFallbackWatchMedia(item)) : [],
    },
    assets: {
      portfolioThumbs: value.assets.portfolioThumbs.length ? value.assets.portfolioThumbs : builtInFallback.assets.portfolioThumbs,
      portfolioImages: value.assets.portfolioImages.length ? value.assets.portfolioImages : builtInFallback.assets.portfolioImages,
      docs: value.assets.docs.length ? value.assets.docs : builtInFallback.assets.docs,
    },
    warnings: Array.isArray(value.warnings) ? value.warnings : [],
  };
}

function normalizeGeneratedProject(project: PublicProject): PublicProject {
  const builtIn = portfolioArchive.find((item) => item.slug === project.slug || item.id === project.id);
  const studio = arrayOfStrings(project.studio).length
    ? arrayOfStrings(project.studio)
    : arrayOfStrings(project.companyLabels).length
      ? arrayOfStrings(project.companyLabels)
      : project.companyName
        ? [project.companyName]
        : builtIn?.studio || [];
  const software = arrayOfStrings(project.software).length
    ? arrayOfStrings(project.software)
    : arrayOfStrings(project.platformLabels).length
      ? arrayOfStrings(project.platformLabels)
      : builtIn?.software || [];
  const disciplines = arrayOfStrings(project.disciplines).length
    ? arrayOfStrings(project.disciplines)
    : arrayOfStrings(project.tags).length
      ? arrayOfStrings(project.tags)
      : project.discipline || project.category
        ? [String(project.discipline || project.category)]
        : builtIn?.disciplines || ["General"];
  const subtypes = arrayOfStrings(project.subtypes).length
    ? arrayOfStrings(project.subtypes)
    : arrayOfStrings(project.tags).filter((item) => !disciplines.includes(item));
  const galleryPaths = arrayOfStrings(project.galleryPaths).map(cleanPublicPath).filter(Boolean);
  const thumbnailPath = firstPublicPath(project.thumbnailPath, project.heroImage, galleryPaths[0], builtIn?.image);
  const heroImage = firstPublicPath(project.heroImage, galleryPaths[0], builtIn?.image, thumbnailPath);
  const media = galleryPaths.length
    ? galleryPaths.map((path, index) => ({
        id: `${project.slug}-gallery-${index}`,
        index,
        fileName: fileNameFromPath(path),
        src: path,
        alt: project.title,
        title: `${project.title} ${index + 1}`,
        description: `Documentation view ${index + 1} for ${project.title}.`,
        aspectRatio: 16 / 9,
      }))
    : builtIn?.media || [];

  return {
    ...(builtIn || ({} as PublicProject)),
    ...project,
    id: project.id || project.slug,
    slug: project.slug || project.id,
    client: project.client || project.clientLabel || project.clientName || project.companyName || builtIn?.client || "Independent",
    clientName: project.clientName || project.client || builtIn?.client,
    clientLabel: project.clientLabel || project.clientName || project.client || builtIn?.client,
    dateLabel: project.dateLabel || project.dates || builtIn?.dateLabel || "Undated",
    year: project.year || builtIn?.year || "Undated",
    studio,
    software,
    disciplines,
    subtypes,
    projectFamily: project.projectFamily || studio[0] || builtIn?.projectFamily,
    documentationType: project.documentationType || project.category || project.discipline || builtIn?.documentationType,
    constructionType: project.constructionType || project.sector || project.category || builtIn?.constructionType,
    summary: project.summary || builtIn?.summary || "",
    description: project.description || project.summary || builtIn?.description || "",
    image: thumbnailPath || heroImage,
    thumbnailPath,
    heroImage,
    galleryPaths,
    media,
    detailNotes: arrayOfStrings(project.detailNotes).length ? arrayOfStrings(project.detailNotes) : builtIn?.detailNotes || [],
    sourceFiles: arrayOfStrings(project.sourceFiles).length ? arrayOfStrings(project.sourceFiles) : builtIn?.sourceFiles || [],
    references: project.references?.length ? project.references : builtIn?.references || [],
    documentationUrl: project.documentationUrl || builtIn?.documentationUrl || "",
    documentPath: cleanPublicPath(project.documentPath),
    documentationAvailable: Boolean(project.documentationUrl || cleanPublicPath(project.documentPath)),
  };
}

function isScaffoldFallbackWatchMedia(item: PublicWatchMedia) {
  const terms = ["scaffold", "demo", "sample", "placeholder", "seeded watch media", "local placeholder"];
  const exact = new Set([
    "latest-youtube-release-scaffold",
    "latest youtube release scaffold",
    "scheduled-livestream-scaffold",
    "scheduled livestream scaffold",
    "archived-replay-scaffold",
    "archived replay scaffold",
  ]);
  return [item.id, item.title]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter(Boolean)
    .some((value) => exact.has(value) || terms.some((term) => value.includes(term)));
}

function slugifyPlatform(value: string) {
  return slugify(value.replace(/^Autodesk /, ""));
}

function firstPublicPath(...values: Array<string | undefined>) {
  for (const value of values) {
    const clean = cleanPublicPath(value);
    if (clean) return clean;
  }
  return "";
}

function cleanPublicPath(value?: string) {
  const text = String(value || "").trim().replace(/\\/g, "/");
  if (!text || text.startsWith("../")) return "";
  if (/^https?:\/\//i.test(text)) return text;
  const stripped = text.replace(/^\.?\//, "").replace(/^\/+/, "");
  if (stripped.startsWith("media/portfolio/") || stripped.startsWith("docs/")) return `/${stripped}`;
  return "";
}

function fileNameFromPath(value: string) {
  return decodeURIComponent((value.split("/").pop() || "").split("?")[0].split("#")[0]);
}

function arrayOfStrings(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  const single = String(value || "").trim();
  return single ? [single] : [];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isGeneratedPublicSiteFallback(value: unknown): value is PublicSiteDataModel {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as PublicSiteDataModel;
  return candidate.schemaVersion === "danielclancy-public-site-data.v1" && Boolean(candidate.collections?.projects?.length);
}
