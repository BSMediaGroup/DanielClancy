import workSetCsv from "../../cmsdata/wix/collection-tables/WorkSet.csv?raw";
import type { PortfolioItem, PortfolioMediaItem } from "./siteContent";

const assetModules = import.meta.glob("../../cmsdata/wix/portfolio/**/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

const SHARED_PROJECT_DOCUMENT_FOLDER_URL =
  "https://dcdesignstudio-my.sharepoint.com/:f:/g/personal/daniel_brainstream_media/IgArejgfpFc-S7Wgd3Hkvg9gAWsmaO1USKdtnKHzXlz3LLA?e=UO9Etz";
const SHARED_PROJECT_DOCUMENT_FOLDER_NOTE =
  "Project documents temporarily open a shared OneDrive folder while individual cloud file links are being prepared.";
const documentFileNameAliases: Record<string, string> = {
  "pns_ar_da.pdf": "PNN_AR_DA.pdf",
};

const imageAssetIndex = createAssetIndex(assetModules);

const previewFallbackBySlug: Record<string, string> = {
  "cue-roadhouse": "/media/portfolio/cue-roadhouse.jpg",
  "curtin-creative-quarter-misc-details": "/media/portfolio/curtin-creative-quarter.png",
  "lake-joondalup-baptist-college-new-arts-building-structural-plans":
    "/media/portfolio/lake-joondalup-baptist-college.jpg",
  "redevelopment-of-highway-service-center-pheasants-nest-m31-north-and-south":
    "/media/portfolio/pheasants-nest.jpg",
  "spratt-residence-proposed-addition": "/media/portfolio/spratt-residence.jpg",
  "upss-beacon-hill-nsw": "/media/portfolio/upss-beacon-hill.jpg",
  "upss-homebush-nsw": "/media/portfolio/upss-homebush.jpg",
  "upss-wyoming-nsw": "/media/portfolio/upss-wyoming.jpg",
  "wungong-urban-water-master-plan": "/media/portfolio/wungong-master-plan.jpg",
};

const preferredFeaturedTitles = [
  "Redevelopment of Highway Service Center Pheasants Nest",
  "Wungong Urban Water Master Plan",
  "Lake Joondalup Baptist College",
  "Cottesloe Beach House - Landscape Design",
  "Curtin Creative Quarter",
  "Cockburn Coast Streetscapes",
];

const preferredSpotlightTitles = [
  "Redevelopment of Highway Service Center Pheasants Nest",
  "Wungong Urban Water Master Plan",
  "Lake Joondalup Baptist College",
];

type WorkSetRow = Record<string, string>;

type WorkSetGalleryItem = {
  description?: string;
  fileName?: string;
  alt?: string;
  src?: string;
  title?: string;
  type?: string;
  settings?: {
    width?: number;
    height?: number;
  };
};

type ResolvedAsset = {
  src: string;
  matchedFileName: string;
};

type ResolvedDocument = {
  fileName: string;
  src: string;
  available: boolean;
  status: "available" | "detached";
  statusNote?: string;
};

type MediaResolution = {
  items: PortfolioMediaItem[];
  missingFileNames: string[];
  usingPreviewFallback: boolean;
};

const workSetRows = parseCsv(workSetCsv)
  .map(normalizeWorkSetRow)
  .filter((row) => row.Status === "PUBLISHED");

export const portfolioArchive: PortfolioItem[] = workSetRows
  .map(createPortfolioItem)
  .sort((left, right) => left.sortOrder - right.sortOrder);

export const featuredProjects = portfolioArchive.filter((project) => project.featured);

export const homeSpotlightProjects = preferredSpotlightTitles
  .map((title) => portfolioArchive.find((project) => project.title.includes(title)))
  .filter((project): project is PortfolioItem => Boolean(project));

function createPortfolioItem(row: WorkSetRow): PortfolioItem {
  const title = row.projectTitle.trim();
  const disciplines = parseJsonArray(row.discipline);
  const studio = parseJsonArray(row.company);
  const software = parseJsonArray(row.softwarePlatform);
  const gallery = parseJsonArray<WorkSetGalleryItem>(row.imageGallery);
  const location = parseLocation(row.projectLocation);
  const slug = createSlug(row["Project Page (Item)"] || title);
  const primaryStudio = studio[0] ?? "Independent";
  const description = tidySentence(row.technicalDescription);
  const summary = createSummary(description);
  const projectDate = row.projectDate;
  const year = projectDate ? new Date(projectDate).getFullYear().toString() : "Undated";
  const resolvedDocument = resolveDocumentUrl(row.singleDoc);
  const documentationUrl = resolvedDocument?.src ?? "";
  const mediaResolution = createMediaItems({
    title,
    slug,
    gallery,
    singleImage: row.singleImage,
  });
  const media = mediaResolution.items;
  const primaryImage = media[0]?.src ?? "";
  const constructionType = tidySentence(row.constructionType);
  const tags = [constructionType, ...disciplines].filter(Boolean);
  const references = [
    row.companyUrl ? { label: `${primaryStudio} website`, path: row.companyUrl } : null,
    row.clientUrl ? { label: `${row.client || "Client"} website`, path: row.clientUrl } : null,
    documentationUrl ? { label: "Project documents folder", path: documentationUrl } : null,
  ].filter((item): item is { label: string; path: string } => Boolean(item));

  return {
    id: slug,
    slug,
    sortOrder: Number(row.globalSort || row.itemSort || Number.MAX_SAFE_INTEGER),
    title,
    client: row.client.trim() || primaryStudio,
    year,
    dateLabel: formatProjectDate(projectDate),
    location,
    sector: constructionType,
    color: row.Color.trim(),
    studio,
    disciplines,
    subtypes: tags,
    software,
    summary,
    description,
    image: primaryImage,
    media,
    featured: preferredFeaturedTitles.some((item) => title.includes(item)),
    sourceFolder: "cmsdata/wix/collection-tables/WorkSet.csv",
    sourceFiles: media.map((item) => item.fileName).filter(Boolean),
    references,
    detailNotes: [
      `${disciplines.join(" / ")} documentation record drawn from the canonical WorkSet export.`,
      constructionType ? `Project type: ${constructionType}.` : null,
      location ? `Recorded location: ${location}.` : null,
      resolvedDocument?.status === "available" ? resolvedDocument.statusNote : null,
      mediaResolution.usingPreviewFallback
        ? "No matching Wix-exported image files were found for this WorkSet row, so the public view falls back to an existing local preview image."
        : null,
      mediaResolution.missingFileNames.length
        ? `${mediaResolution.missingFileNames.length} WorkSet media reference${
            mediaResolution.missingFileNames.length === 1 ? " was" : "s were"
          } not found under cmsdata/wix/portfolio and remain excluded from the public gallery.`
        : null,
    ].filter((item): item is string => Boolean(item)),
    projectFamily: primaryStudio,
    documentationType: constructionType || disciplines[0] || "Project documentation",
    sourceConfidence:
      mediaResolution.usingPreviewFallback || mediaResolution.missingFileNames.length ? "Medium" : "High",
    evidenceAssets: media.slice(0, 4).map((item) => ({
      label: item.title || item.fileName || projectLabelFromIndex(title, item.index),
      path: item.src,
      kind: "image" as const,
    })),
    internalSourceNote:
      "Canonical portfolio data now derives from WorkSet.csv, with prior wording only retained where consistent with the CSV record.",
    sensitivityNote: "Public-facing summary only. Protected or withheld documentation remains excluded.",
    documentationUrl,
    documentationFileName: resolvedDocument?.fileName,
    documentationAvailable: resolvedDocument?.available ?? false,
    documentationStatus: resolvedDocument?.status,
    documentationStatusNote: resolvedDocument?.statusNote,
    constructionType,
  };
}

function createMediaItems({
  title,
  slug,
  gallery,
  singleImage,
}: {
  title: string;
  slug: string;
  gallery: WorkSetGalleryItem[];
  singleImage: string;
}): MediaResolution {
  const missingFileNames = new Set<string>();
  const singleImageFileName = getFileName(singleImage);
  const galleryItems = gallery.reduce<PortfolioMediaItem[]>((items, item, index) => {
    if ((item.type || "image") !== "image") {
      return items;
    }

    const canonicalFileName = item.fileName?.trim() || `${title}-${index + 1}.jpg`;
    const resolvedAsset = resolveImageAsset(index, canonicalFileName, item.src, singleImageFileName);
    const width = Number(item.settings?.width || 0) || undefined;
    const height = Number(item.settings?.height || 0) || undefined;

    if (!resolvedAsset) {
      missingFileNames.add(canonicalFileName);
      return items;
    }

    items.push({
      id: `${slugify(resolvedAsset.matchedFileName)}-${index}`,
      index,
      fileName: resolvedAsset.matchedFileName,
      src: resolvedAsset.src,
      alt: item.alt?.trim() || item.title?.trim() || title,
      title: item.title?.trim() || projectLabelFromIndex(title, index),
      description:
        tidySentence(item.description ?? "") || `Documentation view ${index + 1} for ${title}.`,
      width,
      height,
      aspectRatio: width && height ? width / height : 16 / 9,
    });

    return items;
  }, []);

  if (galleryItems.length) {
    return {
      items: galleryItems,
      missingFileNames: Array.from(missingFileNames),
      usingPreviewFallback: false,
    };
  }

  const localSingleImage = singleImageFileName ? resolveLocalAsset(singleImageFileName) : null;

  if (localSingleImage) {
    return {
      items: [
        {
          id: `${slugify(localSingleImage.matchedFileName)}-0`,
          index: 0,
          fileName: localSingleImage.matchedFileName,
          src: localSingleImage.src,
          alt: title,
          title,
          description: `Documentation view for ${title}.`,
          aspectRatio: 16 / 9,
        },
      ],
      missingFileNames: Array.from(missingFileNames),
      usingPreviewFallback: false,
    };
  }

  const previewFallback = previewFallbackBySlug[slug];

  if (!previewFallback) {
    return {
      items: [],
      missingFileNames: Array.from(missingFileNames),
      usingPreviewFallback: false,
    };
  }

  return {
    items: [
      {
        id: `${slug}-preview`,
        index: 0,
        fileName: getFileName(previewFallback),
        src: previewFallback,
        alt: title,
        title,
        description: `Local preview image for ${title}.`,
        aspectRatio: 16 / 9,
      },
    ],
    missingFileNames: Array.from(missingFileNames),
    usingPreviewFallback: true,
  };
}

function parseCsv(input: string): WorkSetRow[] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let index = 0;
  let inQuotes = false;

  while (index < input.length) {
    const character = input[index];

    if (inQuotes) {
      if (character === "\"") {
        if (input[index + 1] === "\"") {
          currentField += "\"";
          index += 2;
          continue;
        }

        inQuotes = false;
        index += 1;
        continue;
      }

      currentField += character;
      index += 1;
      continue;
    }

    if (character === "\"") {
      inQuotes = true;
      index += 1;
      continue;
    }

    if (character === ",") {
      currentRow.push(currentField);
      currentField = "";
      index += 1;
      continue;
    }

    if (character === "\r") {
      index += 1;
      continue;
    }

    if (character === "\n") {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = "";
      index += 1;
      continue;
    }

    currentField += character;
    index += 1;
  }

  if (currentField.length || currentRow.length) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  const [headerRow, ...bodyRows] = rows;
  const headers = (headerRow ?? []).map((header, headerIndex) =>
    headerIndex === 0 ? header.replace(/^\uFEFF/, "") : header,
  );

  return bodyRows.map((row) =>
    Object.fromEntries(headers.map((header, headerIndex) => [header, row[headerIndex] ?? ""])),
  );
}

function normalizeWorkSetRow(row: WorkSetRow) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.replace(/^\uFEFF/, ""), value]),
  );
}

function parseJsonArray<T = string>(value: string) {
  if (!value.trim()) {
    return [] as T[];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [] as T[];
  }
}

function parseLocation(rawLocation: string) {
  if (!rawLocation.trim()) {
    return "";
  }

  try {
    const parsed = JSON.parse(rawLocation) as {
      formatted?: string;
      city?: string;
      subdivision?: string;
    };

    return parsed.formatted || [parsed.city, parsed.subdivision].filter(Boolean).join(", ");
  } catch {
    return "";
  }
}

function resolveLocalAsset(fileName: string) {
  const assetUrl = imageAssetIndex.byFileName[fileName.toLowerCase()];

  return assetUrl
    ? {
        src: assetUrl,
        matchedFileName: fileName,
      }
    : null;
}

function resolveImageAsset(index: number, canonicalFileName: string, rawSrc: string | undefined, singleImageFileName: string) {
  const exactMatch = resolveLocalAsset(canonicalFileName);

  if (exactMatch) {
    return exactMatch;
  }

  if (index === 0 && singleImageFileName) {
    const singleImageMatch = resolveLocalAsset(singleImageFileName);

    if (singleImageMatch) {
      return singleImageMatch;
    }
  }

  const srcFileName = getFileName(rawSrc || "");
  return srcFileName ? resolveLocalAsset(srcFileName) : null;
}

function resolveDocumentUrl(value: string) {
  if (!value.trim()) {
    return null;
  }

  const requestedFileName = getFileName(value);
  const fileName = documentFileNameAliases[requestedFileName.toLowerCase()] ?? requestedFileName;

  return {
    fileName,
    src: SHARED_PROJECT_DOCUMENT_FOLDER_URL,
    available: true,
    status: "available" as const,
    statusNote: SHARED_PROJECT_DOCUMENT_FOLDER_NOTE,
  };
}

function formatProjectDate(value: string) {
  if (!value.trim()) {
    return "Undated";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Undated";
  }

  return new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function createSummary(description: string) {
  const words = description.split(/\s+/).filter(Boolean);

  if (words.length <= 26) {
    return description;
  }

  return `${words.slice(0, 26).join(" ")}…`;
}

function createSlug(value: string) {
  const normalized = decodeURIComponent(value)
    .replace(/^\/workset\//, "")
    .replace(/[()]/g, "")
    .replace(/&/g, " and ");

  return slugify(normalized);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function tidySentence(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getFileName(value: string) {
  return decodeURIComponent((value.split("/").pop() ?? "").split("#")[0].split("?")[0]);
}

function projectLabelFromIndex(title: string, index: number) {
  return `${title} ${index + 1}`;
}

function createAssetIndex(modules: Record<string, unknown>) {
  const byFileName: Record<string, string> = {};

  for (const [path, assetUrl] of Object.entries(modules)) {
    byFileName[getFileName(path).toLowerCase()] = String(assetUrl);
  }

  return {
    byFileName,
  };
}
