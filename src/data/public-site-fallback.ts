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
  ? {
      ...generatedFallback,
      source: "static_fallback",
      usingFallback: true,
      warnings: Array.isArray(generatedFallback.warnings) ? generatedFallback.warnings : [],
    }
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

function slugifyPlatform(value: string) {
  return slugify(value.replace(/^Autodesk /, ""));
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
