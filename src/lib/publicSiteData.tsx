import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSoftwareLogo } from "../content/brandAssets";
import {
  portfolioThumbnailPaths,
  publicSiteFallback,
  type PublicCompany,
  type PublicPlatform,
  type PublicPosition,
  type PublicProject,
  type PublicSiteDataModel,
  type PublicWatchMedia,
} from "../data/public-site-fallback";
import { isScaffoldWatchMediaEntry } from "./watchFeed";
import {
  getPortfolioLookupKeys,
  getPortfolioProjectBySlugFrom,
  normalizePortfolioRouteKey,
} from "./portfolio";

type PublicSiteDataContextValue = {
  data: PublicSiteDataModel;
  status: "fallback" | "live" | "mixed";
  loading: boolean;
  metadata: {
    source: PublicSiteDataModel["source"];
    revision?: string;
    publishedAt?: string | null;
    generatedAt?: string;
    usingFallback: boolean;
    loading: boolean;
    error?: string;
  };
  projects: PublicProject[];
  companies: PublicCompany[];
  platforms: PublicPlatform[];
  positions: PublicPosition[];
  watchMedia: PublicWatchMedia[];
};

const PublicSiteDataContext = createContext<PublicSiteDataContextValue>({
  data: publicSiteFallback,
  status: "fallback",
  loading: false,
  metadata: {
    source: publicSiteFallback.source,
    revision: publicSiteFallback.revision,
    publishedAt: publicSiteFallback.publishedAt,
    generatedAt: publicSiteFallback.generatedAt,
    usingFallback: true,
    loading: false,
  },
  projects: publicSiteFallback.collections.projects,
  companies: publicSiteFallback.collections.companies,
  platforms: publicSiteFallback.collections.platforms,
  positions: publicSiteFallback.collections.positions,
  watchMedia: publicSiteFallback.collections.watchMedia,
});

const ADMIN_PUBLIC_SITE_DATA_URL = import.meta.env.VITE_ADMIN_PUBLIC_SITE_DATA_URL || "";
let hasLoggedPublicDataDiagnostics = false;

export function PublicSiteDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PublicSiteDataModel>(publicSiteFallback);
  const [loading, setLoading] = useState(Boolean(ADMIN_PUBLIC_SITE_DATA_URL));

  useEffect(() => {
    if (!ADMIN_PUBLIC_SITE_DATA_URL) {
      logPublicDataDiagnostics({
        source: publicSiteFallback.source,
        revision: publicSiteFallback.revision,
        publishedAt: publicSiteFallback.publishedAt,
        generatedAt: publicSiteFallback.generatedAt,
        usingFallback: true,
        loading: false,
        note: "VITE_ADMIN_PUBLIC_SITE_DATA_URL is not configured; using committed public-site fallback data.",
      });
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    fetch(cacheBustedPublicSiteDataUrl(ADMIN_PUBLIC_SITE_DATA_URL), {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("public_site_data_fetch_failed"))))
      .then((payload) => {
        const normalized = normalizePublicSiteData(payload, publicSiteFallback);
        setData(normalized);
        setLoading(false);
        logPublicDataDiagnostics({
          source: normalized.source,
          revision: normalized.revision,
          publishedAt: normalized.publishedAt,
          generatedAt: normalized.generatedAt,
          usingFallback: Boolean(normalized.usingFallback),
          loading: false,
          note: "public site-data loaded",
        });
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        const fallback = {
          ...publicSiteFallback,
          usingFallback: true,
          error: safeErrorMessage(error),
        };
        setData(fallback);
        setLoading(false);
        logPublicDataDiagnostics({
          source: fallback.source,
          revision: fallback.revision,
          publishedAt: fallback.publishedAt,
          generatedAt: fallback.generatedAt,
          usingFallback: true,
          loading: false,
          error: fallback.error,
          note: "public site-data fetch failed; using committed fallback",
        });
      });

    return () => controller.abort();
  }, []);

  const value = useMemo<PublicSiteDataContextValue>(() => {
    const status = data.source === "static_fallback" ? "fallback" : data.source === "mixed_fallback" ? "mixed" : "live";
    return {
      data,
      status,
      loading,
      metadata: {
        source: data.source,
        revision: data.revision,
        publishedAt: data.publishedAt,
        generatedAt: data.generatedAt,
        usingFallback: Boolean(data.usingFallback || data.source === "static_fallback"),
        loading,
        error: data.error,
      },
      projects: data.collections.projects,
      companies: data.collections.companies,
      platforms: data.collections.platforms,
      positions: data.collections.positions,
      watchMedia: data.collections.watchMedia,
    };
  }, [data, loading]);

  return <PublicSiteDataContext.Provider value={value}>{children}</PublicSiteDataContext.Provider>;
}

export function usePublicSiteData() {
  return useContext(PublicSiteDataContext);
}

export function normalizePublicSiteData(payload: unknown, fallback: PublicSiteDataModel = publicSiteFallback): PublicSiteDataModel {
  if (!isRecord(payload) || payload.ok !== true || payload.schemaVersion !== "danielclancy-public-site-data.v1") {
    return {
      ...fallback,
      usingFallback: true,
      error: "invalid_public_site_data_response",
    };
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
  const watchMedia = normalizeRows(rawCollections.watchMedia, normalizeWatchMedia);

  return {
    schemaVersion: "danielclancy-public-site-data.v1",
    generatedAt: asString(payload.generatedAt) || fallback.generatedAt,
    source: normalizeSource(payload.source),
    revision: asString(payload.revision),
    publishedAt: asString(payload.publishedAt) || null,
    usingFallback: !projects.length || !normalizeRows(rawCollections.companies, normalizeCompany).length || !normalizeRows(rawCollections.platforms, normalizePlatform).length || !positions.length,
    collections: {
      projects: projects.length ? mergeProjects(fallbackProjects, projects) : fallbackProjects,
      companies: companies.length ? companies : fallbackCompanies,
      platforms: platforms.length ? platforms : fallbackPlatforms,
      positions: positions.length ? mergeById(fallbackPositions, positions) : fallbackPositions,
      watchMedia,
    },
    assets: normalizeAssets(payload.assets, fallback.assets),
    warnings: Array.isArray(payload.warnings) ? payload.warnings.map(asString).filter(Boolean) : [],
  };
}

function normalizeWatchMedia(raw: unknown): PublicWatchMedia | null {
  if (!isRecord(raw)) return null;
  if (isScaffoldWatchMediaEntry(raw)) return null;
  const id = asString(raw.id || raw.platformVideoId || raw.title);
  const title = asString(raw.title);
  const sourcePlatform = asString(raw.sourcePlatform || raw.platform || raw.provider);
  const sourceUrl = asString(raw.sourceUrl || raw.videoUrl || raw.externalUrl);
  const externalUrl = asString(raw.externalUrl || raw.canonicalUrl || sourceUrl);
  const embedUrl = asString(raw.embedUrl);
  const entryType = asString(raw.entryType || raw.type) || "video";
  const liveStatus = asString(raw.liveStatus || raw.streamStatus || raw.availability || raw.status);
  const scheduledStartAt = asString(raw.scheduledStartAt || raw.scheduledAt || raw.startsAt || raw.startTime);
  const startedAt = asString(raw.startedAt || raw.startAt || raw.liveStartedAt);
  const endedAt = asString(raw.endedAt || raw.endAt || raw.liveEndedAt);
  const cloudflareStreamUid = asString(raw.cloudflareStreamUid || raw.streamUid || raw.playerUid);
  const hlsUrl = asString(raw.hlsUrl || raw.streamUrl);
  const customEmbedUrl = asString(raw.customEmbedUrl || raw.playerUrl);
  const isLiveStateOnly =
    entryType === "livestream" && ["offline", "upcoming", "no-live-source"].includes(liveStatus.toLowerCase());
  if (
    !id ||
    !title ||
    !sourcePlatform ||
    (!sourceUrl && !externalUrl && !embedUrl && !cloudflareStreamUid && !hlsUrl && !customEmbedUrl && !isLiveStateOnly)
  ) return null;
  const visible = raw.visible !== false;
  const galleryOnly = Boolean(raw.galleryOnly || (sourcePlatform === "rumble" && entryType === "short"));
  return {
    id,
    sourcePlatform,
    entryType,
    source: asString(raw.source) || "manual",
    title,
    description: asString(raw.description),
    excerpt: asString(raw.excerpt || raw.description),
    thumbnailUrl: safePublicMediaUrl(raw.thumbnailUrl || raw.thumbnailPath || raw.thumbnail || raw.imageUrl || raw.posterUrl || raw.poster || raw.image),
    sourceUrl: safeHttpsUrl(sourceUrl),
    embedUrl: safeEmbedUrl(embedUrl),
    externalUrl: safeHttpsUrl(externalUrl),
    canonicalUrl: safeHttpsUrl(raw.canonicalUrl || externalUrl || sourceUrl),
    cloudflareStreamUid,
    streamUid: asString(raw.streamUid),
    hlsUrl: safeHttpsUrl(hlsUrl),
    customEmbedUrl: safeHttpsUrl(customEmbedUrl),
    platformVideoId: asString(raw.platformVideoId),
    platformChannelId: asString(raw.platformChannelId),
    liveStatus,
    scheduledStartAt,
    startedAt,
    endedAt,
    publishedAt: asString(raw.publishedAt) || null,
    enteredAt: asString(raw.enteredAt),
    sortDate: asString(raw.sortDate || raw.publishedAt || raw.enteredAt || raw.createdAt || raw.updatedAt),
    createdAt: asString(raw.createdAt),
    visible,
    featured: Boolean(raw.featured),
    manualHeroEligible: Boolean(raw.manualHeroEligible),
    heroEmbeddable: Boolean(raw.heroEmbeddable && !galleryOnly),
    galleryOnly,
    aspect: asString(raw.aspect) || (entryType === "short" ? "portrait" : "landscape"),
    tags: arrayOfStrings(raw.tags),
    updatedAt: asString(raw.updatedAt),
  };
}

function normalizeSource(value: unknown): PublicSiteDataModel["source"] {
  const source = asString(value);
  if (source === "published_kv_snapshot" || source === "live_reconciled_fallback" || source === "baseline_fallback" || source === "admin_kv_reconciled" || source === "admin_baseline_reconciled" || source === "mixed_fallback") {
    return source;
  }
  return "baseline_fallback";
}

function cacheBustedPublicSiteDataUrl(value: string) {
  try {
    const url = new URL(value, window.location.href);
    url.searchParams.set("_", String(Date.now()));
    return url.toString();
  } catch {
    return value;
  }
}

function safeErrorMessage(error: unknown) {
  const text = error instanceof Error ? error.message : String(error || "");
  return text.slice(0, 160) || "public_site_data_fetch_failed";
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

const responsivePortfolioThumbnailPaths = new Set(portfolioThumbnailPaths);

export function getProjectThumbnailSources(project: PublicProject) {
  const source = getProjectThumbnailUrl(project);
  if (!responsivePortfolioThumbnailPaths.has(source)) {
    return { src: source, srcSet: "" };
  }

  const fileName = source.split("/").pop()?.replace(/\.[^.]+$/, "");
  if (!fileName) {
    return { src: source, srcSet: "" };
  }

  const responsiveBase = `/media/portfolio/thumbs/responsive/${fileName}`;
  const small = `${responsiveBase}-480.webp`;
  const large = `${responsiveBase}-800.webp`;
  return {
    src: large,
    srcSet: `${small} 480w, ${large} 800w`,
  };
}

export function getProjectHeroUrl(project: PublicProject) {
  return firstPath(project.heroImage, project.galleryPaths?.[0], project.image);
}

export function getProjectGalleryUrls(project: PublicProject) {
  return (project.galleryPaths || []).map(normalizePublicAssetPath).filter(Boolean);
}

export function getProjectDocumentUrl(project: PublicProject) {
  return firstPath(project.documentPath, project.documentationUrl);
}

export function getPublicProjectLookupKeys(project: Pick<PublicProject, "slug" | "id" | "title" | "code"> & Record<string, unknown>) {
  return getPortfolioLookupKeys(project as PublicProject & Record<string, unknown>);
}

export function getPublicProjectByRouteKey(projects: PublicProject[], value?: string) {
  return getPortfolioProjectBySlugFrom(projects, value);
}

export function normalizePublicRouteKey(value: string) {
  return normalizePortfolioRouteKey(value);
}

export function normalizePublicAssetPath(value?: string) {
  const text = asString(value).replace(/\\/g, "/");
  if (!text || text.startsWith("../")) return "";
  if (/^https?:\/\//i.test(text)) return text;
  const withoutOrigin = text.replace(/^https?:\/\/[^/]+/i, "");
  const stripped = withoutOrigin.replace(/^\.?\//, "").replace(/^\/+/, "");
  if (stripped.startsWith("media/portfolio/") || stripped.startsWith("docs/")) {
    return `/${stripped}`;
  }
  return "";
}

function safePublicMediaUrl(value: unknown) {
  const text = asString(value).replace(/\\/g, "/");
  if (!text || text.startsWith("../")) return "";
  if (/^https:\/\//i.test(text)) return text;
  if (/^http:\/\//i.test(text)) return "";
  const stripped = text.replace(/^\.?\//, "").replace(/^\/+/, "");
  if (stripped.startsWith("media/") || stripped.startsWith("assets/")) return `/${stripped}`;
  return "";
}

function normalizeProject(
  raw: unknown,
  fallbackProjects: PublicProject[],
  companies: PublicCompany[],
  platforms: PublicPlatform[],
): PublicProject | null {
  if (!isRecord(raw)) return null;
  const slug = normalizePublicRouteKey(asString(raw.slug || raw.id || raw.code || raw.title));
  const fallback = getPublicProjectByRouteKey(fallbackProjects, slug);
  const title = asString(raw.title) || fallback?.title || "";
  if (!slug || !title) return null;

  const platformLabels = [
    ...arrayOfStrings(raw.platformLabels),
    ...arrayOfStrings(raw.software),
  ];
  const platformIds = arrayOfStrings(raw.platformIds);
  const resolvedPlatforms = uniqueStrings([
    ...platformLabels.map((label) => resolvePlatformByIdNameSlug(platforms, label)?.name || label),
    ...platformIds.map((id) => resolvePlatformByIdNameSlug(platforms, id)?.name || ""),
  ]);
  const companyLabels = [
    ...arrayOfStrings(raw.companyLabels),
    ...arrayOfStrings(raw.studio),
  ];
  const companyIds = uniqueStrings([
    ...arrayOfStrings(raw.companyIds),
    ...arrayOfStrings(raw.companyId),
  ]);
  const companyName =
    asString(raw.companyName) ||
    companyLabels[0] ||
    companyIds.map((id) => resolveCompanyByIdNameSlug(companies, id)?.name || "").find(Boolean) ||
    fallback?.companyName ||
    fallback?.studio[0] ||
    "";
  const cleanGallery = arrayOfStrings(raw.galleryPaths || raw.gallery).map(normalizePublicAssetPath).filter(Boolean);
  const fallbackGallery = (fallback?.galleryPaths || []).map(normalizePublicAssetPath).filter(Boolean);
  const galleryPaths = fallbackGallery.length ? fallbackGallery : cleanGallery;
  const fallbackMedia = fallback?.media || [];
  const mediaSource = galleryPaths.length
    ? galleryPaths.map((path, index) => ({
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
  const heroImage = firstPath(fallback?.heroImage, fallback?.image, galleryPaths[0], asString(raw.heroImage || raw.hero));
  const thumbnailPath = firstPath(fallback?.thumbnailPath, heroImage, galleryPaths[0], asString(raw.thumbnailPath || raw.thumbnail));
  const documentPath = asString(raw.documentPath || raw.document);
  const cleanDocumentPath = normalizePublicAssetPath(documentPath);
  const documentationUrl = cleanDocumentPath.startsWith("/docs/") ? cleanDocumentPath : firstPath(asString(raw.documentationUrl), fallback?.documentationUrl);
  const rawTags = arrayOfStrings(raw.tags);
  const configuredDisciplines = arrayOfStrings(raw.disciplines);
  const taxonomyDisciplines = splitTaxonomy(asString(raw.discipline || raw.category));
  const disciplines = uniqueStrings(
    configuredDisciplines.length
      ? configuredDisciplines
      : taxonomyDisciplines.length
        ? taxonomyDisciplines
        : fallback?.disciplines?.length
          ? fallback.disciplines
          : rawTags,
  );
  const configuredSubtypes = arrayOfStrings(raw.subtypes);
  const subtypes = uniqueStrings(
    configuredSubtypes.length
      ? configuredSubtypes
      : rawTags.length
        ? rawTags.filter((tag) => !disciplines.some((discipline) => slugify(discipline) === slugify(tag)))
        : fallback?.subtypes || [],
  );

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
    disciplines,
    subtypes,
    software: resolvedPlatforms.length ? resolvedPlatforms : fallback?.software || [],
    platformIds,
    platformLabels: resolvedPlatforms,
    summary: asString(raw.summary) || fallback?.summary || "",
    description: asString(raw.description) || fallback?.description || asString(raw.summary),
    image: thumbnailPath,
    thumbnailPath,
    heroImage,
    galleryPaths,
    media: mediaSource,
    featured: Boolean(raw.featured ?? fallback?.featured),
    sourceFolder: fallback?.sourceFolder || "admin_public_site_data",
    sourceFiles: fallback?.sourceFiles || mediaSource.map((item) => item.fileName).filter(Boolean),
    references: fallback?.references || [],
    detailNotes: fallback?.detailNotes || [],
    documentationUrl,
    documentPath: cleanDocumentPath.startsWith("/docs/") ? cleanDocumentPath : fallback?.documentPath || "",
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
    const path = normalizePublicAssetPath(asString(item.path));
    return path ? { path, label: asString(item.label) } : null;
  });
  return rows.length ? rows : fallback;
}

function mergeProjects(fallbackProjects: PublicProject[], liveProjects: PublicProject[]) {
  const rows: PublicProject[] = [...fallbackProjects];
  for (const project of liveProjects) {
    const index = rows.findIndex((row) =>
      getPublicProjectLookupKeys(row).some((key) => getPublicProjectLookupKeys(project).includes(key)),
    );
    if (index === -1) {
      rows.push(project);
    } else {
      rows[index] = { ...rows[index], ...project };
    }
  }
  return rows.sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));
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
  for (const value of values) {
    const normalized = normalizePublicAssetPath(value);
    if (normalized) return normalized;
  }
  return "";
}

function isCleanPublicPath(value?: string) {
  return Boolean(normalizePublicAssetPath(value));
}

function safeHttpsUrl(value: unknown) {
  const text = asString(value);
  if (!text) return "";
  try {
    const url = new URL(text);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function safeEmbedUrl(value: unknown) {
  const text = safeHttpsUrl(value);
  if (!text) return "";
  try {
    const url = new URL(text);
    if (url.hostname === "rumble.com" && url.pathname.startsWith("/embed/")) return url.toString();
    if (url.hostname.endsWith("youtube.com") && url.pathname.startsWith("/embed/")) return url.toString();
    if (url.hostname === "iframe.videodelivery.net") return url.toString();
    return "";
  } catch {
    return "";
  }
}

function fileNameFromPath(value: string) {
  return decodeURIComponent((value.split("/").pop() || "").split("?")[0].split("#")[0]);
}

function logPublicDataDiagnostics(details: {
  source: PublicSiteDataModel["source"];
  revision?: string;
  publishedAt?: string | null;
  generatedAt?: string;
  usingFallback: boolean;
  loading: boolean;
  error?: string;
  note: string;
}) {
  if (!import.meta.env.DEV || hasLoggedPublicDataDiagnostics) return;
  hasLoggedPublicDataDiagnostics = true;
  console.info("[DanielClancy] public site-data status", details);
}

function arrayOfStrings(value: unknown) {
  if (Array.isArray(value)) return value.map(asString).filter(Boolean);
  const single = asString(value);
  return single ? [single] : [];
}

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();
  return values.map(asString).filter((value) => {
    const key = value.toLocaleLowerCase();
    if (!value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function splitTaxonomy(value: string) {
  return value
    .split(/\s*(?:,|\/|\||;)\s*/)
    .map(asString)
    .filter(Boolean);
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
