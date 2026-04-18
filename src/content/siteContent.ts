export type ExperienceItem = {
  company: string;
  period: string;
  role: string;
  location: string;
  summary: string;
  url: string;
};

export type PortfolioItem = {
  title: string;
  client: string;
  year: string;
  platforms: string[];
  disciplines: string[];
  summary: string;
  image: string;
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
    "The current public build is focused on employer-facing review: CV access, selected project documentation, software fluency, and direct contact without the noise of a broader personal platform.",
};

export const homeMetrics: HighlightStat[] = [
  {
    label: "Experience depth",
    value: "17 years",
    note: "Drafting and design documentation work since 2008.",
  },
  {
    label: "Primary stack",
    value: "Revit / AutoCAD",
    note: "Core production tools supported by broader documentation software.",
  },
  {
    label: "Sector range",
    value: "Architecture / Structural / Urban",
    note: "Coverage across building, landscape, infrastructure, and master planning work.",
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

export const featuredProjects: PortfolioItem[] = [
  {
    title: "Ampol Highway Service Centre Redevelopment, Pheasants Nest NSW",
    client: "Ampol Australia Petroleum Pty Ltd",
    year: "2020–2021",
    platforms: ["Revit", "AutoCAD"],
    disciplines: ["Architecture", "General"],
    summary:
      "Redevelopment documentation including demolition, site analysis, layout, canopy, building, signage, and coordination elements for highway service centre works.",
    image: "/media/portfolio/pheasants-nest.jpg",
  },
  {
    title: "Ampol Highway Service Centre Redevelopment, Eastern Creek NSW",
    client: "Ampol Australia Petroleum Pty Ltd",
    year: "2020–2021",
    platforms: ["Revit", "AutoCAD"],
    disciplines: ["Architecture", "General"],
    summary:
      "Large-format service centre redevelopment material seeded from the Wix portfolio export for later expansion.",
    image: "/media/portfolio/eastern-creek.png",
  },
  {
    title: "Spratt Residence - Proposed Addition",
    client: "C & J Spratt",
    year: "2015",
    platforms: ["AutoCAD"],
    disciplines: ["Architecture"],
    summary:
      "Residential addition documentation covering plans, sections, details, structural notes, and material specifications.",
    image: "/media/portfolio/spratt-residence.jpg",
  },
  {
    title: "UPSS Wyoming, NSW",
    client: "Ampol Australia Petroleum Pty Ltd",
    year: "2020–2021",
    platforms: ["AutoCAD"],
    disciplines: ["Architecture", "General"],
    summary:
      "UPSS assessment and civil layout package covering fuel system upgrades, vehicle circulation, and kiosk-canopy arrangements.",
    image: "/media/portfolio/upss-wyoming.jpg",
  },
  {
    title: "Cottesloe Beach House - Landscape Design",
    client: "Minderoo Foundation",
    year: "2015",
    platforms: ["AutoCAD", "Revit", "SketchUp"],
    disciplines: ["Landscape", "Architecture"],
    summary:
      "Landscape redevelopment documentation including grading, softscape layouts, rooftop planting, and tree management detail.",
    image: "/media/portfolio/cottesloe-beach-house.jpg",
  },
  {
    title: "Wungong Urban Water Master Plan",
    client: "MRA / DevelopmentWA",
    year: "2014–2015",
    platforms: ["AutoCAD", "QGIS"],
    disciplines: ["Urban Planning", "General"],
    summary:
      "Master planning drawing set presenting land use, waterways, buffers, environmental constraints, and infrastructure reserves.",
    image: "/media/portfolio/wungong-master-plan.jpg",
  },
  {
    title: "Cue Roadhouse Traffic Management",
    client: "Riley Consulting",
    year: "2016",
    platforms: ["AutoCAD"],
    disciplines: ["Urban Planning", "General"],
    summary:
      "Site layout, parking, roadway, intersection, and landscape coordination documentation for roadhouse redevelopment works.",
    image: "/media/portfolio/cue-roadhouse.jpg",
  },
  {
    title: "Curtin Creative Quarter",
    client: "Curtin University",
    year: "2015–2016",
    platforms: ["AutoCAD", "SketchUp"],
    disciplines: ["Landscape", "General"],
    summary:
      "Container gallery, canopy, pod, and precinct detail work from the Curtin Creative Quarter concept and documentation sets.",
    image: "/media/portfolio/curtin-creative-quarter.png",
  },
];

export const portfolioDisclaimer =
  "Displayed materials represent selected work examples and may reflect different levels of completion. Sensitive, classified, or otherwise protected documents remain excluded for security and intellectual-property reasons.";

export const contactUseCases = [
  "Recruiter and hiring manager review",
  "CV and employment-history follow-up",
  "Project sample and drafting capability assessment",
];

export const migrationScope = {
  now: [
    "Primary route structure and navigation for Home, CV, Portfolio, and Contact.",
    "Refined visual system informed by the live Wix site's industrial dark composition and divider rhythm.",
    "Truthful employment timeline and curated work selection seeded from Wix-exported source data.",
    "Hidden /watch and /donate scaffolds isolated from primary SEO and navigation.",
  ],
  later: [
    "Full portfolio pagination, filtering, and broader project migration.",
    "Contact form delivery wiring, analytics, and production CMS/admin tooling.",
    "YouTube ingestion for /watch and payment integrations for /donate.",
    "Final content QA against all PDF/image source sets and recruiter-facing copy polish.",
  ],
};
