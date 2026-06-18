import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSoftwareLogo } from "../content/brandAssets";
import {
  publicSiteFallback,
  type PublicCompany,
  type PublicPlatform,
  type PublicPosition,
  type PublicProject,
  type PublicSiteDataModel,
} from "../data/public-site-fallback";

type PublicSiteDataContextValue = {
  data: PublicSiteDataModel;
  status: "fallback" | "live" | "mixed";
  projects: PublicProject[];
  companies: PublicCompany[];
  platforms: PublicPlatform[];
  positions: PublicPosition[];
};

const PublicSiteDataContext = createContext<PublicSiteDataContextValue>({
  data: publicSiteFallback,
  status: "fallback",
  projects: publicSiteFallback.collections.projects,
  companies: publicSiteFallback.collections.companies,
  platforms: publicSiteFallback.collections.platforms,
  positions: publicSiteFallback.collections.positions,
});

const ADMIN_PUBLIC_SITE_DATA_URL = import.meta.env.VITE_ADMIN_PUBLIC_SITE_DATA_URL || "";

export function PublicSiteDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PublicSiteDataModel>(publicSiteFallback);

  useEffect(() => {
    if (!ADMIN_PUBLIC_SITE_DATA_URL) {
      return;
    }

    const controller = new AbortController();
    fetch(ADMIN_PUBLIC_SITE_DATA_URL, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("public_site_data_fetch_failed"))))
      .then((payload) => {
        const normalized = normalizePublicSiteData(payload, publicSiteFallback);
        setData(normalized);
      })
      .catch(() => {
        setData(publicSiteFallback);
      });

    return () => controller.abort();
  }, []);

  const value = useMemo<PublicSiteDataContextValue>(() => {
    const status = data.source === "static_fallback" ? "fallback" : data.source === "mixed_fallback" ? "mixed" : "live";
    return {
      data,
      status,
      projects: data.collections.projects,
      companies: data.collections.companies,
      platforms: data.collections.platforms,
      positions: data.collections.positions,
    };
  }, [data]);

  return <PublicSiteDataContext.Provider value={value}>{children}</PublicSiteDataContext.Provider>;
}

export function usePublicSiteData() {
  return useContext(PublicSiteDataContext);
}

export function normalizePublicSiteData(payload: unknown, fallback: PublicSiteDataModel = publicSiteFallback): PublicSiteDataModel {
  if (!isRecord(payload) || payload.ok !== true || payload.schemaVersion !== "danielclancy-public-site-data.v1") {
    return fallback;
  }

  const rawCollections = isRecord(payload.collections) ? payload.collections : {};
  const fallbackProjects = fallback.collections.projects;
  const fallbackCompanies = fallback.collections.companies;
  const fallbackPlatforms = fallback.collections.platforms;
  const fallbackPositions = fallback.collections.positions;
  const companies = mergeById(
    fallbackCompanies,
    normalizeRows(rawCollections.companies, normalizeCompany),
  );
  const platforms = mergeById(
    fallbackPlatforms,
    normalizeRows(rawCollections.platforms, normalizePlatform),
  );
  const projects = normalizeRows(rawCollections.projects, (project) =>
    normalizeProject(project, fallbackProjects, companies, platforms),
  );
  const positions = normalizeRows(rawCollections.positions, (position) =>
    normalizePosition(position, fallbackPositions, companies),
  );

  return {
    schemaVersion: "danielclancy-public-site-data.v1",
    generatedAt: asString(payload.generatedAt) || fallback.generatedAt,
    source: asString(payload.source) === "admin_kv_reconciled" ? "admin_kv_reconciled" : "admin_baseline_reconciled",
    collections: {
      projects: projects.length ? mergeProjects(fallbackProjects, projects) : fallbackProjects,
      companies: companies.length ? companies : fallbackCompanies,
      platforms: platforms.length ? platforms : fallbackPlatforms,
      positions: positions.length ? mergeById(fallbackPositions, positions) : fallbackPositions,
    },
    assets: normalizeAssets(payload.assets, fallback.assets),
    warnings: Array.isArray(payload.warnings) ? payload.warnings.map(asString).filter(Boolean) : [],
  };
}

export function resolveCompanyByIdNameSlug(
  companies: PublicCompany[],
  value?: string,
): PublicCompany | null {
  const key = slugify(value || "");
  if (!key) return null;
  return companies.find((company) => [company.id, company.slug, company.name].map(slugify).includes(key)) || null;
}

export function resolvePlatformByIdNameSlug(
  platforms: PublicPlatform[],
  value?: string,
): PublicPlatform | null {
  const key = slugifyPlatform(value || "");
  if (!key) return null;
  return (
    platforms.find((platform) =>
      [platform.id, platform.slug, platform.name, platform.vendor]
        .map((item) => slugifyPlatform(item || ""))
        .includes(key),
    ) || null
  );
}

export function getProjectCompanyLabel(project: PublicProject, companies: PublicCompany[]) {
  const resolved = resolveCompanyByIdNameSlug(companies, project.companyId || project.companyName || project.studio[0]);
  return project.companyName || resolved?.name || project.studio[0] || project.clientLabel || project.client || "Independent";
}

export function getPlatformIconPath(platform: PublicPlatform | null | undefined, fallbackLabel?: string) {
  if (!platform && fallbackLabel) return getSoftwareLogo(fallbackLabel) || "";
  const label = platform?.name || fallbackLabel || "";
  const imported = getSoftwareLogo(label);
  if (imported) return imported;
  const logoPath = platform?.logoPath || "";
  if (/^https?:\/\//i.test(logoPath) || logoPath.startsWith("/")) return logoPath;
  return "";
}

export function getProjectThumbnailUrl(project: PublicProject) {
  return firstPath(project.thumbnailPath, project.heroImage, project.galleryPaths?.[0], project.image);
}

export function getProjectHeroUrl(project: PublicProject) {
  return firstPath(project.heroImage, project.galleryPaths?.[0], project.image);
}

export function getProjectGalleryUrls(project: PublicProject) {
  return (project.galleryPaths || []).filter(isCleanPublicPath);
}

export function getProjectDocumentUrl(project: PublicProject) {
  return firstPath(project.documentPath?.startsWith("/docs/") ? project.documentPath : "", project.documentationUrl);
}

function normalizeProject(
  raw: unknown,
  fallbackProjects: PublicProject[],
  companies: PublicCompany[],
  platforms: PublicPlatform[],
): PublicProject | null {
  if (!isRecord(raw)) return null;
  const slug = asString(raw.slug || raw.id);
  const fallback = fallbackProjects.find((project) => project.slug === slug || project.id === slug);
  const title = asString(raw.title) || fallback?.title || "";
  if (!slug || !title) return null;

  const platformLabels = arrayOfStrings(raw.platformLabels || raw.software);
  const platformIds = arrayOfStrings(raw.platformIds);
  const resolvedPlatforms = uniqueStrings([
    ...platformLabels,
    ...platformIds.map((id) => resolvePlatformByIdNameSlug(platforms, id)?.name || ""),
  ]);
  const companyLabels = arrayOfStrings(raw.companyLabels || raw.studio);
  const companyIds = arrayOfStrings(raw.companyIds || raw.companyId);
  const companyName =
    asString(raw.companyName) ||
    companyLabels[0] ||
    companyIds.map((id) => resolveCompanyByIdNameSlug(companies, id)?.name || "").find(Boolean) ||
    fallback?.companyName ||
    fallback?.studio[0] ||
    "";
  const cleanGallery = arrayOfStrings(raw.galleryPaths || raw.gallery).filter(isCleanPublicPath);
  const fallbackMedia = fallback?.media || [];
  const mediaSource = cleanGallery.length
    ? cleanGallery.map((path, index) => ({
        id: `${slug}-gallery-${index}`,
        index,
        fileName: fileNameFromPath(path),
        src: path,
        alt: title,
        title: `${title} ${index + 1}`,
        description: `Documentation view ${index + 1} for ${title}.`,
        aspectRatio: 16 / 9,
      }))
    : fallbackMedia;
  const heroImage = firstPath(asString(raw.heroImage || raw.hero), cleanGallery[0], fallback?.heroImage, fallback?.image);
  const thumbnailPath = firstPath(asString(raw.thumbnailPath || raw.thumbnail), heroImage, cleanGallery[0], fallback?.thumbnailPath, fallback?.image);
  const documentPath = asString(raw.documentPath || raw.document);
  const documentationUrl = documentPath.startsWith("/docs/") ? documentPath : asString(raw.documentationUrl) || fallback?.documentationUrl || "";

  return {
    ...(fallback || ({} as PublicProject)),
    ...raw,
    id: asString(raw.id) || slug,
    slug,
    title,
    sortOrder: asNumber(raw.sortOrder, fallback?.sortOrder || 1000),
    client: asString(raw.clientLabel || raw.clientName || raw.client) || fallback?.client || companyName,
    clientName: asString(raw.clientName || raw.client) || fallback?.clientName,
    clientLabel: asString(raw.clientLabel || raw.clientName || raw.client) || fallback?.clientLabel,
    year: asString(raw.year) || fallback?.year || "Undated",
    dateLabel: asString(raw.dateLabel || raw.dates) || fallback?.dateLabel || "Undated",
    location: asString(raw.location) || fallback?.location,
    sector: asString(raw.sector || raw.category || raw.discipline) || fallback?.sector,
    studio: companyName ? [companyName] : fallback?.studio || [],
    companyName,
    companyIds,
    companyLabels: companyName ? [companyName] : companyLabels,
    disciplines: arrayOfStrings(raw.disciplines || raw.tags).length
      ? arrayOfStrings(raw.disciplines || raw.tags)
      : fallback?.disciplines || [],
    subtypes: arrayOfStrings(raw.tags || raw.subtypes).length ? arrayOfStrings(raw.tags || raw.subtypes) : fallback?.subtypes || [],
    software: resolvedPlatforms.length ? resolvedPlatforms : fallback?.software || [],
    platformIds,
    platformLabels: resolvedPlatforms,
    summary: asString(raw.summary) || fallback?.summary || "",
    description: asString(raw.description) || fallback?.description || asString(raw.summary),
    image: thumbnailPath,
    thumbnailPath,
    heroImage,
    galleryPaths: cleanGallery.length ? cleanGallery : fallback?.galleryPaths || [],
    media: mediaSource,
    featured: Boolean(raw.featured ?? fallback?.featured),
    sourceFolder: fallback?.sourceFolder || "admin_public_site_data",
    sourceFiles: fallback?.sourceFiles || mediaSource.map((item) => item.fileName).filter(Boolean),
    references: fallback?.references || [],
    detailNotes: fallback?.detailNotes || [],
    documentationUrl,
    documentPath: documentPath.startsWith("/docs/") ? documentPath : fallback?.documentPath || "",
    documentationAvailable: Boolean(documentationUrl),
  };
}

function normalizeCompany(raw: unknown): PublicCompany | null {
  if (!isRecord(raw)) return null;
  const name = asString(raw.name);
  const id = asString(raw.id || raw.slug || name);
  if (!name || !id) return null;
  return {
    id,
    slug: asString(raw.slug) || slugify(name),
    name,
    logoPath: asString(raw.logoPath),
    location: asString(raw.location),
    website: asString(raw.website),
    description: asString(raw.description || raw.details),
    status: asString(raw.status) || "active",
    sortOrder: asNumber(raw.sortOrder, 1000),
  };
}

function normalizePlatform(raw: unknown): PublicPlatform | null {
  if (!isRecord(raw)) return null;
  const name = asString(raw.name);
  const id = asString(raw.id || raw.slug || name);
  if (!name || !id) return null;
  return {
    id,
    slug: asString(raw.slug) || slugifyPlatform(name),
    name,
    vendor: asString(raw.vendor || raw.company),
    logoPath: asString(raw.logoPath),
    website: asString(raw.website),
    status: asString(raw.status) || "active",
    sortOrder: asNumber(raw.sortOrder, 1000),
  };
}

function normalizePosition(raw: unknown, fallbackPositions: PublicPosition[], companies: PublicCompany[]) {
  if (!isRecord(raw)) return null;
  const title = asString(raw.title);
  const companyId = asString(raw.companyId);
  const companyName = asString(raw.companyName) || resolveCompanyByIdNameSlug(companies, companyId)?.name || "";
  const id = asString(raw.id || raw.slug || `${companyName}-${title}`);
  if (!id || !title || !companyName) return null;
  const fallback = fallbackPositions.find((position) => position.id === id || position.slug === id);
  return {
    ...fallback,
    id,
    slug: asString(raw.slug) || slugify(id),
    title,
    companyId,
    companyName,
    location: asString(raw.location) || fallback?.location,
    startDate: asString(raw.startDate) || fallback?.startDate,
    endDate: asString(raw.endDate) || fallback?.endDate,
    current: Boolean(raw.current),
    summary: asString(raw.summary) || fallback?.summary,
    responsibilities: arrayOfStrings(raw.responsibilities),
    highlights: arrayOfStrings(raw.highlights || raw.responsibilities),
    platformIds: arrayOfStrings(raw.platformIds),
    period: fallback?.period,
    url: fallback?.url || resolveCompanyByIdNameSlug(companies, companyId)?.website,
    status: asString(raw.status) || "active",
    sortOrder: asNumber(raw.sortOrder, fallback?.sortOrder || 1000),
  };
}

function normalizeAssets(raw: unknown, fallback: PublicSiteDataModel["assets"]) {
  if (!isRecord(raw)) return fallback;
  return {
    portfolioThumbs: normalizeAssetRows(raw.portfolioThumbs, fallback.portfolioThumbs),
    portfolioImages: normalizeAssetRows(raw.portfolioImages, fallback.portfolioImages),
    docs: normalizeAssetRows(raw.docs, fallback.docs),
  };
}

function normalizeAssetRows(raw: unknown, fallback: Array<{ path: string; label?: string }>) {
  const rows = normalizeRows(raw, (item) => {
    if (!isRecord(item)) return null;
    const path = asString(item.path);
    return isCleanPublicPath(path) ? { path, label: asString(item.label) } : null;
  });
  return rows.length ? rows : fallback;
}

function mergeProjects(fallbackProjects: PublicProject[], liveProjects: PublicProject[]) {
  const bySlug = new Map(fallbackProjects.map((project) => [project.slug, project]));
  for (const project of liveProjects) bySlug.set(project.slug, project);
  return Array.from(bySlug.values()).sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));
}

function mergeById<T extends { id: string; sortOrder?: number; name?: string; title?: string }>(fallbackRows: T[], liveRows: T[]) {
  const byId = new Map(fallbackRows.map((row) => [row.id, row]));
  for (const row of liveRows) byId.set(row.id, { ...(byId.get(row.id) || {}), ...row });
  return Array.from(byId.values()).sort(
    (left, right) => (left.sortOrder || 1000) - (right.sortOrder || 1000) || String(left.name || left.title || "").localeCompare(String(right.name || right.title || "")),
  );
}

function normalizeRows<T>(value: unknown, normalize: (item: unknown) => T | null): T[] {
  return Array.isArray(value) ? value.map(normalize).filter((item): item is T => Boolean(item)) : [];
}

function firstPath(...values: Array<string | undefined>) {
  return values.find((value) => value && (isCleanPublicPath(value) || /^https?:\/\//i.test(value))) || "";
}

function isCleanPublicPath(value?: string) {
  return Boolean(value && (value.startsWith("/media/portfolio/") || value.startsWith("/docs/") || /^https?:\/\//i.test(value)));
}

function fileNameFromPath(value: string) {
  return decodeURIComponent((value.split("/").pop() || "").split("?")[0].split("#")[0]);
}

function arrayOfStrings(value: unknown) {
  if (Array.isArray(value)) return value.map(asString).filter(Boolean);
  const single = asString(value);
  return single ? [single] : [];
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map(asString).filter(Boolean)));
}

function asString(value: unknown) {
  return String(value ?? "").trim();
}

function asNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function slugifyPlatform(value: string) {
  return slugify(value.replace(/^Autodesk /i, ""));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
