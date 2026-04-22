import {
  featuredProjects as workSetFeaturedProjects,
  homeSpotlightProjects as workSetHomeSpotlightProjects,
  portfolioArchive as workSetPortfolioArchive,
} from "./workSetPortfolio";

export type ExperienceItem = {
  company: string;
  period: string;
  role: string;
  location: string;
  summary: string;
  url: string;
};

export type PortfolioReference = {
  label: string;
  path: string;
};

export type PortfolioEvidenceAsset = {
  label: string;
  path: string;
  kind: "image" | "pdf" | "folder";
};

export type PortfolioMediaItem = {
  id: string;
  index: number;
  fileName: string;
  src: string;
  alt: string;
  title: string;
  description: string;
  width?: number;
  height?: number;
  aspectRatio: number;
};

export type PortfolioItem = {
  id: string;
  slug: string;
  sortOrder: number;
  title: string;
  client: string;
  year: string;
  dateLabel: string;
  location?: string;
  sector?: string;
  color?: string;
  studio: string[];
  disciplines: string[];
  subtypes: string[];
  software: string[];
  summary: string;
  description: string;
  image: string;
  media: PortfolioMediaItem[];
  featured: boolean;
  sourceFolder: string;
  sourceFiles: string[];
  references: PortfolioReference[];
  detailNotes: string[];
  projectFamily?: string;
  documentationType?: string;
  sourceConfidence?: "High" | "Medium" | "Low";
  evidenceAssets?: PortfolioEvidenceAsset[];
  internalSourceNote?: string;
  sensitivityNote?: string;
  documentationUrl?: string;
  documentationFileName?: string;
  documentationAvailable?: boolean;
  documentationStatus?: "available" | "detached";
  documentationStatusNote?: string;
  constructionType?: string;
};

export type HighlightStat = {
  label: string;
  value: string;
  note: string;
};

export type SoftwareGroup = {
  label: string;
  items: string[];
};

export const siteMeta = {
  name: "Daniel Clancy",
  role: "Design Consultant",
  contact: {
    email: "mail@danielclancy.net",
    phone: "+61 458 747 524",
    location: "Potts Point, New South Wales, Australia",
    postal: "PO Box 422, Potts Point NSW 1335",
  },
  heroSummary:
    "With 17 years of drafting and design experience since 2008, Daniel Clancy has contributed to structural, architectural, urban, landscape, and infrastructure work for firms including GHD, Urbis, PLACE Laboratory, Richmond+Ross, and Meriton Group.",
  heroSupport:
    "The public site now reads as a cleaner, wider, documentation-forward review surface built around Daniel Clancy's established visual language.",
};

export const homeMetrics: HighlightStat[] = [
  {
    label: "Experience depth",
    value: "17 years",
    note: "Drafting and design documentation work since 2008.",
  },
  {
    label: "Canonical archive",
    value: "16 projects",
    note: "Portfolio listings now rebuilt from the WorkSet source-of-truth export.",
  },
  {
    label: "Primary stack",
    value: "Revit / AutoCAD",
    note: "Core production tools supported by presentation, reporting, and mapping software.",
  },
];

export const platformList = [
  "Autodesk AutoCAD",
  "Autodesk Revit",
  "Adobe Creative Cloud",
  "Trimble SketchUp",
  "Microsoft Office",
  "QGIS",
];

export const softwareGroups: SoftwareGroup[] = [
  {
    label: "Drafting and BIM",
    items: ["Autodesk AutoCAD", "Autodesk Revit"],
  },
  {
    label: "Presentation and coordination",
    items: ["Adobe Creative Cloud", "Microsoft Office"],
  },
  {
    label: "Spatial and modelling support",
    items: ["Trimble SketchUp", "QGIS"],
  },
];

export const focusAreas = [
  "Architectural drafting",
  "Structural documentation",
  "Urban and landscape documentation",
  "Revit and AutoCAD production",
  "Tender and construction packages",
];

export const featuredEmployers = [
  "Richmond+Ross",
  "Meriton Group",
  "Leffler Simes Architects",
  "PLACE Laboratory",
  "Urbis",
  "GHD",
];

export const experienceItems: ExperienceItem[] = [
  {
    company: "Richmond+Ross",
    period: "October 2019 – November 2021",
    role: "Revit Draftsperson & Technician",
    location: "Crows Nest, NSW",
    summary:
      "Retail, public domain, fuel, tourism, and industrial documentation across projects ranging from small tenancies to large regional centres.",
    url: "https://www.richmondross.com.au/",
  },
  {
    company: "Meriton Group",
    period: "March 2019 – May 2019",
    role: "Structural Revit Draftsman",
    location: "Sydney, NSW",
    summary:
      "Residential tower and apartment documentation within a major east coast developer-builder environment.",
    url: "https://www.meriton.com.au/",
  },
  {
    company: "Leffler Simes Architects",
    period: "September 2018 – November 2018",
    role: "Architectural Revit Draftsman",
    location: "Melbourne, VIC",
    summary:
      "Retail-focused architectural drafting for a long-established Australian practice with national reach.",
    url: "https://www.lefflersimes.com.au/",
  },
  {
    company: "Fleetwood Australia",
    period: "July 2018 – August 2018",
    role: "Revit Draftsperson",
    location: "Melbourne, VIC",
    summary:
      "Modular construction documentation support tied to housing and community infrastructure delivery.",
    url: "https://www.fleetwood.com.au/",
  },
  {
    company: "Place Laboratory",
    period: "January 2017 – January 2018",
    role: "Draftsman",
    location: "Perth, WA",
    summary:
      "Public realm, urban, and landscape-oriented drafting supporting walkable and socially engaged place-making work.",
    url: "https://www.placelaboratory.com/",
  },
  {
    company: "DC Design Studio",
    period: "June 2015 – May 2018",
    role: "Design Consultant",
    location: "Perth, WA",
    summary:
      "Boutique design documentation consultancy delivering CAD sketches, building plans, and supporting visual material.",
    url: "https://www.danielclancy.net/",
  },
  {
    company: "Urbis Pty Ltd",
    period: "August 2014 – June 2015",
    role: "Drafting Technician",
    location: "Perth, WA",
    summary:
      "Property, city, and community documentation work within a multidisciplinary consulting environment.",
    url: "https://urbis.com.au/",
  },
  {
    company: "ACCE Pty Ltd",
    period: "January 2012 – March 2014",
    role: "Structural Draftsman",
    location: "Como, WA",
    summary:
      "Structural documentation across residential, commercial, industrial, and institutional projects.",
    url: "https://www.acce.net.au/",
  },
  {
    company: "GHD Pty Ltd",
    period: "August 2008 – November 2011",
    role: "Draftsman",
    location: "Geraldton & Perth, WA",
    summary:
      "Early-career multidisciplinary drafting across property, buildings, energy, resources, and transport-related work.",
    url: "https://www.ghd.com/",
  },
];

export const portfolioArchive = workSetPortfolioArchive;
export const featuredProjects = workSetFeaturedProjects;
export const homeSpotlightProjects = workSetHomeSpotlightProjects;

export const portfolioDisclaimer =
  "Displayed materials represent selected work examples only. The public archive now follows the canonical WorkSet record, while sensitive or protected material remains withheld.";

export const contactUseCases = [
  "Professional introductions and hiring enquiries",
  "Project sample and documentation follow-up",
  "Collaboration, drafting, and design support conversations",
];

export const migrationScope = {
  now: [
    "Separate professional and personal shells with route-specific headers, footers, and metadata.",
    "Professional home, CV, portfolio, portfolio detail, and contact presentation updates.",
    "Personal home, watch, and donate routes with dedicated noindex/share-preview handling.",
    "Contact delivery prepared for Cloudflare Pages Functions with Resend.",
    "Canonical WorkSet.csv portfolio rebuild with improved gallery and detail-page UX.",
  ],
  later: [
    "Deployment, DNS cutover, and Cloudflare secret provisioning.",
    "Later provider migration for /watch beyond the current YouTube-backed feed.",
    "PayPal support and any broader donation admin workflow for /donate.",
    "Admin-side content tooling and deeper archive QA.",
  ],
};
