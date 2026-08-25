import workSetCsv from "../../cmsdata/wix/collection-tables/WorkSet.csv?raw";
import type { PortfolioItem, PortfolioMediaItem } from "./siteContent";

const SHARED_PROJECT_DOCUMENT_FOLDER_URL =
  "https://dcdesignstudio-my.sharepoint.com/:f:/g/personal/daniel_brainstream_media/IgArejgfpFc-S7Wgd3Hkvg9gAWsmaO1USKdtnKHzXlz3LLA?e=UO9Etz";
const SHARED_PROJECT_DOCUMENT_FOLDER_NOTE =
  "Project documents temporarily open a shared OneDrive folder while individual cloud file links are being prepared.";
const documentFileNameAliases: Record<string, string> = {
  "pns_ar_da.pdf": "PNN_AR_DA.pdf",
};

const previewFallbackBySlug: Record<string, string> = {
  "cue-roadhouse": "/media/portfolio/cue-roadhouse-p1.webp",
  "curtin-creative-quarter-misc-details": "/media/portfolio/curtin-creative-quarter.png",
  "lake-joondalup-baptist-college-new-arts-building-structural-plans":
    "/media/portfolio/lake-joondalup-baptist-college.jpg",
  "redevelopment-of-highway-service-center-pheasants-nest-m31-north-and-south":
    "/media/portfolio/pheasants-nest.jpg",
  "spratt-residence-proposed-addition": "/media/portfolio/spratt-residence.jpg",
  "upss-beacon-hill-nsw": "/media/portfolio/upss-beacon-hill.jpg",
  "upss-homebush-nsw": "/media/portfolio/upss-homebush.jpg",
  "upss-wyoming-nsw": "/media/portfolio/upss-wyoming.jpg",
  "wungong-urban-water-master-plan": "/media/portfolio/wungong-masterplan-p1.webp",
};

const publicGalleryBySlug: Record<string, string[]> = {
  "proposed-retail-development-for-dawesville-iga": [
    "/media/portfolio/dawesville-p1.webp",
    "/media/portfolio/dawesville-p2.webp",
    "/media/portfolio/dawesville-p3.webp",
  ],
  "cue-roadhouse": [
    "/media/portfolio/cue-roadhouse-p1.webp",
    "/media/portfolio/cue-roadhouse-p2.webp",
  ],
  "redevelopment-of-highway-service-center-pheasants-nest-m31-north-and-south": [
    "/media/portfolio/pnn-xx-009.webp",
    "/media/portfolio/PNN_AR_DA_Page_29.webp",
    "/media/portfolio/PNN_AR_DA_Page_17.webp",
    "/media/portfolio/PNN_AR_DA_Page_21.webp",
    "/media/portfolio/pnn-xx-003.webp",
    "/media/portfolio/PNN_AR_DA_Page_31.webp",
    "/media/portfolio/PNN_AR_DA_Page_32.webp",
    "/media/portfolio/pnn-xx-007.webp",
    "/media/portfolio/pnn-xx-010.webp",
    "/media/portfolio/PNN_AR_DA_Page_25.webp",
    "/media/portfolio/pnn-xx-006.webp",
    "/media/portfolio/pnn-xx-008.webp",
    "/media/portfolio/pnn-xx-004.webp",
    "/media/portfolio/pnn-xx-005.webp",
    "/media/portfolio/pnn-xx-000.webp",
    "/media/portfolio/pnn-xx-002.webp",
    "/media/portfolio/pnn-xx-001.webp",
    "/media/portfolio/pnn-xx-011.webp",
    "/media/portfolio/pnn-xx-012.webp",
    "/media/portfolio/pnn-xx-013.webp",
    "/media/portfolio/PNN_AR_DA_Page_30.webp",
    "/media/portfolio/PNN_AR_DA_Page_34.webp",
    "/media/portfolio/PNN_AR_DA_Page_26.webp",
    "/media/portfolio/PNN_AR_DA_Page_27.webp",
    "/media/portfolio/PNN_AR_DA_Page_22.webp",
    "/media/portfolio/PNN_AR_DA_Page_33.webp",
    "/media/portfolio/PNN_AR_DA_Page_24.webp",
    "/media/portfolio/PNN_AR_DA_Page_18.webp",
    "/media/portfolio/PNN_AR_DA_Page_20.webp",
    "/media/portfolio/PNN_AR_DA_Page_16.webp",
    "/media/portfolio/PNN_AR_DA_Page_15.webp",
  ],
  "proposed-boundary-re-alignment-of-lot-1-on-dp-d073414-234-jull-st-armadale-6112": [
    "/media/portfolio/jull-st.jpg",
  ],
  "curtin-creative-quarter-misc-details": [
    "/media/portfolio/ccq3.webp",
    "/media/portfolio/ccq24.webp",
    "/media/portfolio/ccq25.webp",
    "/media/portfolio/ccq23.webp",
    "/media/portfolio/ccq22.webp",
    "/media/portfolio/ccq21.webp",
    "/media/portfolio/ccq20.webp",
    "/media/portfolio/ccq19.webp",
    "/media/portfolio/ccq18.webp",
    "/media/portfolio/ccq14.webp",
    "/media/portfolio/ccq17.webp",
    "/media/portfolio/ccq16.webp",
    "/media/portfolio/ccq15.webp",
    "/media/portfolio/ccq11.webp",
    "/media/portfolio/ccq13.webp",
    "/media/portfolio/ccq12.webp",
    "/media/portfolio/ccq9.webp",
    "/media/portfolio/ccq10.webp",
    "/media/portfolio/ccq8.webp",
    "/media/portfolio/ccq7.webp",
    "/media/portfolio/ccq5.webp",
    "/media/portfolio/ccq6.webp",
    "/media/portfolio/ccq1.webp",
    "/media/portfolio/ccq2.webp",
    "/media/portfolio/ccq4.webp",
  ],
  "lot-500-eighth-road-land-resumption": ["/media/portfolio/eighth-rd.jpg"],
  "cockburn-coast": [
    "/media/portfolio/cockburn-coast-details-000.webp",
    "/media/portfolio/cockburn-coast-details-930.webp",
    "/media/portfolio/cockburn-coast-details-931.webp",
    "/media/portfolio/cockburn-coast-details-932.webp",
    "/media/portfolio/cockburn-coast-details-933.webp",
  ],
  "spratt-residence-proposed-addition": [
    "/media/portfolio/spratt-residence-p1.webp",
    "/media/portfolio/spratt-residence-p2.webp",
    "/media/portfolio/spratt-residence-p3.webp",
  ],
  "upss-homebush-nsw": [
    "/media/portfolio/upss-homebush-p2.webp",
    "/media/portfolio/upss-homebush-p1.webp",
    "/media/portfolio/upss-homebush-p3.webp",
    "/media/portfolio/upss-homebush-p4.webp",
  ],
  "wungong-urban-water-master-plan": ["/media/portfolio/wungong-masterplan-p1.webp"],
  "upss-beacon-hill-nsw": [
    "/media/portfolio/upss-beacon-hill-p1.webp",
    "/media/portfolio/upss-beacon-hill-p2.webp",
    "/media/portfolio/upss-beacon-hill-p4.webp",
    "/media/portfolio/upss-beacon-hill-p3.webp",
  ],
  "henry-street-residence-structural-documentation": [
    "/media/portfolio/henry-st-p1.webp",
    "/media/portfolio/henry-st-p2.webp",
    "/media/portfolio/henry-st-p3.webp",
    "/media/portfolio/henry-st-p4.webp",
    "/media/portfolio/henry-st-p5.webp",
    "/media/portfolio/henry-st-p6.webp",
  ],
  "lake-joondalup-baptist-college-new-arts-building-structural-plans": [
    "/media/portfolio/lake-joondalup-baptist-college.webp",
  ],
  "cottesloe-beach-house-landscape-design": Array.from(
    { length: 10 },
    (_, index) => `/media/portfolio/cottesloe-beach-house-p${index + 1}.webp`,
  ),
  "upss-wyoming-nsw": [
    "/media/portfolio/upss-wyoming-p4.webp",
    "/media/portfolio/upss-wyoming-p3.webp",
    "/media/portfolio/upss-wyoming-p1.webp",
  ],
  "geraldton-fire-station-structural-documentation": Array.from(
    { length: 4 },
    (_, index) => `/media/portfolio/fesa-fire0${index + 1}.webp`,
  ),
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
  const publicGallery = publicGalleryBySlug[slug] || [];

  if (publicGallery.length) {
    return {
      items: publicGallery.map((src, index) => ({
        id: `${slug}-public-${index}`,
        index,
        fileName: getFileName(src),
        src,
        alt: title,
        title: projectLabelFromIndex(title, index),
        description: `Documentation view ${index + 1} for ${title}.`,
        aspectRatio: 16 / 9,
      })),
      missingFileNames: [],
      usingPreviewFallback: false,
    };
  }

  const referencedFileNames = gallery
    .filter((item) => (item.type || "image") === "image")
    .map((item, index) => item.fileName?.trim() || getFileName(item.src || "") || `${title}-${index + 1}.jpg`)
    .filter(Boolean);
  const singleImageFileName = getFileName(singleImage);

  if (singleImageFileName && !referencedFileNames.includes(singleImageFileName)) {
    referencedFileNames.push(singleImageFileName);
  }

  const previewFallback = previewFallbackBySlug[slug];

  if (!previewFallback) {
    return {
      items: [],
      missingFileNames: referencedFileNames,
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
    missingFileNames: referencedFileNames,
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
