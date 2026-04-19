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

export type PortfolioItem = {
  id: string;
  title: string;
  client: string;
  year: string;
  location?: string;
  sector?: string;
  studio: string[];
  disciplines: string[];
  subtypes: string[];
  software: string[];
  summary: string;
  image: string;
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

export const portfolioArchive: PortfolioItem[] = [
  {
    id: "pheasants-nest",
    title: "Ampol Highway Service Centre Redevelopment, Pheasants Nest NSW",
    client: "Ampol Australia Petroleum Pty Ltd",
    year: "2020–2021",
    location: "Pheasants Nest, NSW",
    sector: "Highway service centre",
    studio: ["Richmond+Ross"],
    disciplines: ["Architecture", "General"],
    subtypes: ["Redevelopment", "Site analysis", "Canopy", "Signage"],
    software: ["Revit", "AutoCAD"],
    summary:
      "Redevelopment documentation including demolition, site analysis, layout, canopy, building, signage, and coordination elements for highway service centre works.",
    image: "/media/portfolio/pheasants-nest.jpg",
    featured: true,
    sourceFolder: "cmsdata/wix/portfolio/bimset",
    sourceFiles: [
      "PNN_AR_DA.pdf",
      "PNN_AR_DA_Page_17.jpg",
      "PNN_AR_DA_Page_21.jpg",
      "CANOPY BINDER.pdf",
    ],
    references: [
      { label: "Architectural drawing set", path: "cmsdata/wix/portfolio/bimset/PNN_AR_DA.pdf" },
      { label: "Canopy binder", path: "cmsdata/wix/portfolio/bimset/CANOPY BINDER.pdf" },
    ],
    detailNotes: [
      "The local source folder includes page exports as well as the full PDF set.",
      "Public presentation is intentionally limited to selected pages rather than the entire retained drawing package.",
    ],
    sensitivityNote:
      "Selected documentation only. Full source material remains in the local archive and is not exposed as a public download.",
  },
  {
    id: "eastern-creek",
    title: "Ampol Highway Service Centre Redevelopment, Eastern Creek NSW",
    client: "Ampol Australia Petroleum Pty Ltd",
    year: "2020–2021",
    location: "Eastern Creek, NSW",
    sector: "Highway service centre",
    studio: ["Richmond+Ross"],
    disciplines: ["Architecture", "General"],
    subtypes: ["Redevelopment", "Site planning", "Building layout"],
    software: ["Revit", "AutoCAD"],
    summary:
      "Large-format service centre redevelopment documentation drawn from the BIM and CAD export set retained in the local Wix portfolio archive.",
    image: "/media/portfolio/eastern-creek.png",
    featured: true,
    sourceFolder: "cmsdata/wix/portfolio/bimset",
    sourceFiles: ["004.PNG", "007.PNG", "008.PNG", "010.PNG"],
    references: [
      { label: "Rendered views and layout exports", path: "cmsdata/wix/portfolio/bimset/" },
    ],
    detailNotes: [
      "The Wix export groups this project into multiple image-led samples rather than a single public-facing summary PDF.",
      "The site surfaces it as a redevelopment archive entry rather than overstating missing metadata.",
    ],
  },
  {
    id: "upss-wyoming",
    title: "Ampol (Caltex) Pump System Upgrades - Wyoming",
    client: "Ampol (Caltex)",
    year: "2020–2021",
    location: "Wyoming, NSW",
    sector: "Fuel system upgrades",
    studio: ["Richmond+Ross"],
    disciplines: ["Architecture", "General"],
    subtypes: ["UPSS", "Site layout", "Canopy", "Kiosk"],
    software: ["AutoCAD"],
    summary:
      "UPSS assessment and civil layout package covering fuel system upgrades, vehicle circulation, and kiosk-canopy arrangements.",
    image: "/media/portfolio/upss-wyoming.jpg",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/cadset",
    sourceFiles: [
      "UPSS WYOMING(C).pdf",
      "UPSS WYOMING(C)_Page_1.jpg",
      "UPSS WYOMING(C)_Page_2.jpg",
      "UPSS WYOMING(C)_Page_3.jpg",
      "UPSS WYOMING(C)_Page_4.jpg",
    ],
    references: [
      { label: "Local UPSS PDF set", path: "cmsdata/wix/portfolio/cadset/UPSS WYOMING(C).pdf" },
    ],
    detailNotes: [
      "This project appears in the Design Portfolio table as a published AutoCAD entry.",
      "The retained local material includes both the PDF set and page-level JPEG exports.",
    ],
  },
  {
    id: "upss-north-richmond",
    title: "Ampol (Caltex) Pump System Upgrades - North Richmond",
    client: "Ampol (Caltex)",
    year: "2020–2021",
    location: "North Richmond, NSW",
    sector: "Fuel system upgrades",
    studio: ["Richmond+Ross"],
    disciplines: ["Architecture", "General"],
    subtypes: ["UPSS", "Site layout", "Fuel system upgrade"],
    software: ["AutoCAD"],
    summary:
      "Pump system upgrade documentation represented in the local archive by a short PDF set and multiple plan-sheet exports.",
    image: "/media/portfolio/upss-north-richmond.jpg",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/cadset",
    sourceFiles: [
      "UPSS NORTH RICHMOND(C).pdf",
      "UPSS NORTH RICHMOND(C)_Page_1.jpg",
      "UPSS NORTH RICHMOND(C)_Page_2.jpg",
      "UPSS NORTH RICHMOND(C)_Page_3.jpg",
      "UPSS NORTH RICHMOND(C)_Page_4.jpg",
    ],
    references: [
      {
        label: "Local UPSS PDF set",
        path: "cmsdata/wix/portfolio/cadset/UPSS NORTH RICHMOND(C).pdf",
      },
    ],
    detailNotes: [
      "The local source materials support this as a separate project family from Wyoming rather than a duplicate sample.",
    ],
  },
  {
    id: "upss-homebush",
    title: "Ampol (Caltex) Pump System Upgrades - Homebush",
    client: "Ampol (Caltex)",
    year: "2020–2021",
    location: "Homebush, NSW",
    sector: "Fuel system upgrades",
    studio: ["Richmond+Ross"],
    disciplines: ["Architecture", "General"],
    subtypes: ["UPSS", "Site layout", "Fuel system upgrade"],
    software: ["AutoCAD"],
    summary:
      "Homebush upgrade package presented from the local CAD export set with plans, supporting pages, and a retained PDF reference.",
    image: "/media/portfolio/upss-homebush.jpg",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/cadset",
    sourceFiles: [
      "UPSS HOMEBUSH(C).pdf",
      "UPSS HOMEBUSH(C)_Page_1.jpg",
      "UPSS HOMEBUSH(C)_Page_2.jpg",
      "UPSS HOMEBUSH(C)_Page_3.jpg",
      "UPSS HOMEBUSH(C)_Page_4.jpg",
    ],
    references: [
      { label: "Local UPSS PDF set", path: "cmsdata/wix/portfolio/cadset/UPSS HOMEBUSH(C).pdf" },
    ],
    detailNotes: [
      "Metadata is intentionally restrained to what the title, folder, and Wix table publish state make explicit.",
    ],
  },
  {
    id: "upss-brownsville",
    title: "Ampol (Caltex) Pump System Upgrades - Brownsville",
    client: "Ampol (Caltex)",
    year: "2020–2021",
    location: "Brownsville, NSW",
    sector: "Fuel system upgrades",
    studio: ["Richmond+Ross"],
    disciplines: ["Architecture", "General"],
    subtypes: ["UPSS", "Site layout", "Fuel system upgrade"],
    software: ["AutoCAD"],
    summary:
      "Brownsville upgrade sample retained as a compact set of page exports and a matching PDF document in the local CAD source folder.",
    image: "/media/portfolio/upss-brownsville.jpg",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/cadset",
    sourceFiles: [
      "UPSS BROWNSVILLE(C).pdf",
      "UPSS BROWNSVILLE(C)_Page_1.jpg",
      "UPSS BROWNSVILLE(C)_Page_2.jpg",
      "UPSS BROWNSVILLE(C)_Page_3.jpg",
      "UPSS BROWNSVILLE(C)_Page_4.jpg",
    ],
    references: [
      {
        label: "Local UPSS PDF set",
        path: "cmsdata/wix/portfolio/cadset/UPSS BROWNSVILLE(C).pdf",
      },
    ],
    detailNotes: [
      "Surfaced as part of the broader pump-system-upgrades archive rather than promoted to the featured set.",
    ],
  },
  {
    id: "upss-grafton",
    title: "Ampol (Caltex) Pump System Upgrades - Grafton",
    client: "Ampol (Caltex)",
    year: "2020–2021",
    location: "Grafton, NSW",
    sector: "Fuel system upgrades",
    studio: ["Richmond+Ross"],
    disciplines: ["Architecture", "General"],
    subtypes: ["UPSS", "Site layout", "Fuel system upgrade"],
    software: ["AutoCAD"],
    summary:
      "Grafton is represented by a compact UPSS package in the local archive, suitable for recruiter-facing evidence without overclaiming project scope.",
    image: "/media/portfolio/upss-grafton.jpg",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/cadset",
    sourceFiles: [
      "UPSS GRAFTON(D).pdf",
      "UPSS GRAFTON(D)_Page_1.jpg",
      "UPSS GRAFTON(D)_Page_2.jpg",
      "UPSS GRAFTON(D)_Page_3.jpg",
      "UPSS GRAFTON(D)_Page_4.jpg",
    ],
    references: [
      { label: "Local UPSS PDF set", path: "cmsdata/wix/portfolio/cadset/UPSS GRAFTON(D).pdf" },
    ],
    detailNotes: [
      "The archive entry focuses on document evidence and location naming taken directly from the source files.",
    ],
  },
  {
    id: "upss-beacon-hill",
    title: "Ampol (Caltex) Pump System Upgrades - Beacon Hill",
    client: "Ampol (Caltex)",
    year: "2020–2021",
    location: "Beacon Hill, NSW",
    sector: "Fuel system upgrades",
    studio: ["Richmond+Ross"],
    disciplines: ["Architecture", "General"],
    subtypes: ["UPSS", "Site layout", "Fuel system upgrade"],
    software: ["AutoCAD"],
    summary:
      "Beacon Hill extends the pump-system-upgrades group with another retained local PDF set and supporting drawing-sheet exports.",
    image: "/media/portfolio/upss-beacon-hill.jpg",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/cadset",
    sourceFiles: [
      "UPSS BEACON HILL(C).pdf",
      "UPSS BEACON HILL(C)_Page_1.jpg",
      "UPSS BEACON HILL(C)_Page_2.jpg",
      "UPSS BEACON HILL(C)_Page_3.jpg",
      "UPSS BEACON HILL(C)_Page_4.jpg",
    ],
    references: [
      {
        label: "Local UPSS PDF set",
        path: "cmsdata/wix/portfolio/cadset/UPSS BEACON HILL(C).pdf",
      },
    ],
    detailNotes: [
      "Grouped with the other UPSS entries to make the archive breadth legible without turning the page into an unstructured image wall.",
    ],
  },
  {
    id: "spratt-residence",
    title: "Spratt Residence - Proposed Addition",
    client: "C & J Spratt",
    year: "2015",
    sector: "Residential",
    studio: ["DC Design Studio"],
    disciplines: ["Architecture"],
    subtypes: ["Residence addition", "Plans", "Sections", "Details"],
    software: ["AutoCAD"],
    summary:
      "Residential addition documentation covering plans, sections, details, structural notes, and material specifications.",
    image: "/media/portfolio/spratt-residence.jpg",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/cadset",
    sourceFiles: ["CJSPRATT.pdf", "CJSPRATT_Page_1.jpg", "CJSPRATT_Page_2.jpg", "CJSPRATT_Page_3.jpg"],
    references: [
      { label: "Local residence PDF set", path: "cmsdata/wix/portfolio/cadset/CJSPRATT.pdf" },
    ],
    detailNotes: [
      "The source folder makes this one of the clearest self-contained residential drawing packages in the archive.",
    ],
  },
  {
    id: "cottesloe-beach-house",
    title: "Cottesloe Beach House - Landscape Design",
    client: "Minderoo Foundation",
    year: "2015",
    location: "Cottesloe, WA",
    sector: "Residential landscape",
    studio: ["DC Design Studio"],
    disciplines: ["Landscape", "Architecture"],
    subtypes: ["Landscape design", "Grading", "Softscape", "Tree management"],
    software: ["AutoCAD", "Revit", "SketchUp"],
    summary:
      "Landscape redevelopment documentation including grading, softscape layouts, rooftop planting, and tree management detail.",
    image: "/media/portfolio/cottesloe-beach-house.jpg",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/cadset",
    sourceFiles: [
      "BEACH HOUSE COT.pdf",
      "BEACH HOUSE COT_Page_1.jpg",
      "BEACH HOUSE COT_Page_2.jpg",
      "BEACH HOUSE COT_Page_3.jpg",
      "BEACH HOUSE COT_Page_4.jpg",
    ],
    references: [
      {
        label: "Local landscape PDF set",
        path: "cmsdata/wix/portfolio/cadset/BEACH HOUSE COT.pdf",
      },
    ],
    detailNotes: [
      "This entry stays intentionally close to the existing seeded wording because the local source material is largely drawing-set based.",
    ],
  },
  {
    id: "wungong-master-plan",
    title: "Wungong Urban Water Master Plan",
    client: "MRA / DevelopmentWA",
    year: "2014–2015",
    location: "Wungong, WA",
    sector: "Master planning",
    studio: ["Urbis Pty Ltd"],
    disciplines: ["Urban Planning", "General"],
    subtypes: ["Master plan", "Waterways", "Environmental constraints"],
    software: ["AutoCAD", "QGIS"],
    summary:
      "Master planning drawing set presenting land use, waterways, buffers, environmental constraints, and infrastructure reserves.",
    image: "/media/portfolio/wungong-master-plan.jpg",
    featured: true,
    sourceFolder: "cmsdata/wix/portfolio/cadset",
    sourceFiles: [
      "ND1152-URBIS.pdf",
      "ND1152-URBIS_Page_1.jpg",
      "ND1152-URBIS_Page_2.jpg",
      "ND1152-URBIS_Page_3.jpg",
      "ND1152-URBIS_Page_4.jpg",
    ],
    references: [
      { label: "Local master plan PDF set", path: "cmsdata/wix/portfolio/cadset/ND1152-URBIS.pdf" },
    ],
    detailNotes: [
      "The local archive presents this as a drawing-led planning set rather than a long narrative case study.",
    ],
  },
  {
    id: "cue-roadhouse",
    title: "Cue Roadhouse Traffic Management",
    client: "Riley Consulting",
    year: "2016",
    location: "Cue, WA",
    sector: "Traffic management",
    studio: ["DC Design Studio"],
    disciplines: ["Urban Planning", "General"],
    subtypes: ["Traffic management", "Parking", "Roadway coordination"],
    software: ["AutoCAD"],
    summary:
      "Site layout, parking, roadway, intersection, and landscape coordination documentation for roadhouse redevelopment works.",
    image: "/media/portfolio/cue-roadhouse.jpg",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/cadset",
    sourceFiles: ["17402-GA001_B.jpg", "17402-GA002_B.jpg"],
    references: [
      { label: "Plan-sheet exports", path: "cmsdata/wix/portfolio/cadset/17402-GA001_B.jpg" },
      { label: "Plan-sheet exports", path: "cmsdata/wix/portfolio/cadset/17402-GA002_B.jpg" },
    ],
    detailNotes: [
      "No single PDF package is surfaced in the current source set, so the archive entry stays image-led.",
    ],
  },
  {
    id: "curtin-container-gallery",
    title: "Curtin Creative Quarter - Container Gallery Concept",
    client: "Curtin University",
    year: "2015",
    sector: "Creative precinct concept",
    studio: ["DC Design", "Place Laboratory"],
    disciplines: ["Landscape", "General"],
    subtypes: ["Container gallery", "Concept study", "Precinct detail"],
    software: ["SketchUp", "AutoCAD"],
    summary:
      "Container gallery concept work retained as mixed SketchUp views and CAD detail sheets inside the local Curtin Creative Quarter source sets.",
    image: "/media/portfolio/curtin-container-gallery.jpg",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/cadset and cmsdata/wix/portfolio/skpset",
    sourceFiles: ["CURTIN CREATIVE QUARTER - MISC DETAILS.pdf", "PS3.jpg", "PS7.png"],
    references: [
      {
        label: "Curtin details PDF set",
        path: "cmsdata/wix/portfolio/cadset/CURTIN CREATIVE QUARTER - MISC DETAILS.pdf",
      },
      { label: "SketchUp export", path: "cmsdata/wix/portfolio/skpset/PS7.png" },
    ],
    detailNotes: [
      "The Wix export contains multiple entries for Curtin concept work, so the public archive separates them into clearer sub-projects.",
    ],
  },
  {
    id: "curtin-study-pod",
    title: "Curtin Creative Quarter - Outdoor Study Pod Concept",
    client: "Curtin University",
    year: "2015",
    sector: "Creative precinct concept",
    studio: ["DC Design", "Place Laboratory"],
    disciplines: ["Landscape", "General"],
    subtypes: ["Study pod", "Concept study", "SketchUp visuals"],
    software: ["SketchUp", "AutoCAD"],
    summary:
      "Outdoor study pod concept represented by repeated SketchUp export views and supporting CAD material in the local source archive.",
    image: "/media/portfolio/curtin-study-pod.png",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/skpset",
    sourceFiles: ["PODAX1B.png", "PODAX2B.png", "PODAX3B.png"],
    references: [
      { label: "SketchUp concept exports", path: "cmsdata/wix/portfolio/skpset/" },
    ],
    detailNotes: [
      "This archive entry is intentionally framed as concept evidence because the source material is visual rather than documentation-heavy.",
    ],
  },
  {
    id: "curtin-canopy",
    title: "Curtin Creative Quarter - Canopy Concept",
    client: "Curtin University",
    year: "2015–2016",
    sector: "Creative precinct concept",
    studio: ["DC Design", "Place Laboratory"],
    disciplines: ["Landscape", "General"],
    subtypes: ["Canopy concept", "SketchUp visuals", "Mixed detail set"],
    software: ["SketchUp", "AutoCAD"],
    summary:
      "Canopy concept package combining rendered SketchUp perspectives with drawing-set material from the Curtin Creative Quarter archive.",
    image: "/media/portfolio/curtin-canopy.png",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/bimset and cmsdata/wix/portfolio/cadset",
    sourceFiles: [
      "3D View 4B.png",
      "3D View 4D.png",
      "CURTIN CREATIVE QUARTER - MISC DETAILS_Page_11.jpg",
      "CURTIN CREATIVE QUARTER - MISC DETAILS_Page_12.jpg",
    ],
    references: [
      { label: "Canopy perspective export", path: "cmsdata/wix/portfolio/bimset/3D View 4D.png" },
      {
        label: "Curtin details PDF set",
        path: "cmsdata/wix/portfolio/cadset/CURTIN CREATIVE QUARTER - MISC DETAILS.pdf",
      },
    ],
    detailNotes: [
      "The canopy concept is kept separate from the container gallery and study pod entries so the Curtin work reads as a documented body of concept variations.",
    ],
  },
  {
    id: "lake-joondalup-baptist-college",
    title: "Lake Joondalup Baptist College - Year 4 Classrooms",
    client: "Lake Joondalup Baptist College",
    year: "2013",
    location: "Joondalup, WA",
    sector: "Education",
    studio: ["ACCE Pty Ltd"],
    disciplines: ["Structural", "Architecture"],
    subtypes: ["Footing plan", "Ground slab plan", "General notes"],
    software: ["AutoCAD"],
    summary:
      "Retained structural sheet evidence from the ACCE archive, presented conservatively as a documented classroom package rather than a reconstructed case study.",
    image: "/media/portfolio/lake-joondalup-baptist-college.jpg",
    featured: true,
    sourceFolder: "cmsdata/wix/portfolio/cadset",
    sourceFiles: ["ACCE_Page_17.jpg", "ACCE_Page_16.jpg", "ACCE_Page_18.jpg"],
    references: [
      { label: "Primary titleblock sheet", path: "cmsdata/wix/portfolio/cadset/ACCE_Page_17.jpg" },
      { label: "Supporting ACCE sheet group", path: "cmsdata/wix/portfolio/cadset/" },
    ],
    detailNotes: [
      "The titleblock clearly identifies the project, drawing title, location, date, company, and Daniel Clancy as the drafter.",
      "Supporting ACCE pages remain useful as evidence, but only the clearly readable titleblock sheet is used for project promotion.",
    ],
    projectFamily: "ACCE structural archive",
    documentationType: "Structural detail sheet",
    sourceConfidence: "High",
    evidenceAssets: [
      {
        label: "General notes, footing & ground slab plan",
        path: "cmsdata/wix/portfolio/cadset/ACCE_Page_17.jpg",
        kind: "image",
      },
      {
        label: "Adjacent ACCE support sheet",
        path: "cmsdata/wix/portfolio/cadset/ACCE_Page_16.jpg",
        kind: "image",
      },
    ],
    internalSourceNote:
      "Promoted from readable titleblock metadata in the retained ACCE JPEG export set.",
  },
  {
    id: "rowell-residence",
    title: "Proposed Rowell Residence",
    client: "Greg Davies Architects",
    year: "2013",
    location: "Applecross, WA",
    sector: "Residential",
    studio: ["ACCE Pty Ltd"],
    disciplines: ["Structural", "Architecture"],
    subtypes: ["Roof details", "Residential detailing"],
    software: ["AutoCAD"],
    summary:
      "Residential structural documentation surfaced from the ACCE export archive with wording limited to what the readable roof-details sheet makes explicit.",
    image: "/media/portfolio/rowell-residence.jpg",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/cadset",
    sourceFiles: ["ACCE_Page_34.jpg", "ACCE_Page_33.jpg"],
    references: [
      { label: "Primary titleblock sheet", path: "cmsdata/wix/portfolio/cadset/ACCE_Page_34.jpg" },
      { label: "Supporting ACCE sheet group", path: "cmsdata/wix/portfolio/cadset/" },
    ],
    detailNotes: [
      "The promoted sheet names Greg Davies Architects, the Applecross address, and the roof-details drawing title.",
      "This remains a sheet-led archive record rather than a full residential project narrative.",
    ],
    projectFamily: "ACCE structural archive",
    documentationType: "Structural detail sheet",
    sourceConfidence: "High",
    evidenceAssets: [
      {
        label: "Roof details sheet",
        path: "cmsdata/wix/portfolio/cadset/ACCE_Page_34.jpg",
        kind: "image",
      },
      {
        label: "Adjacent ACCE support sheet",
        path: "cmsdata/wix/portfolio/cadset/ACCE_Page_33.jpg",
        kind: "image",
      },
    ],
    internalSourceNote:
      "Promoted from readable titleblock metadata in the retained ACCE JPEG export set.",
  },
  {
    id: "south-perth-promenade",
    title: "South Perth Promenade",
    client: "City of South Perth",
    year: "Undated in retained sheet",
    location: "South Perth, WA",
    sector: "Public domain",
    studio: ["Urbis Pty Ltd"],
    disciplines: ["Urban Planning", "Landscape"],
    subtypes: ["Detail sheet", "Promenade details", "Public-domain documentation"],
    software: ["AutoCAD"],
    summary:
      "Public-domain detail-sheet evidence from the retained unsorted archive, kept deliberately neutral because the available source is a single readable drawing export rather than a complete project set.",
    image: "/media/portfolio/south-perth-promenade.jpg",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/cadset",
    sourceFiles: ["GENERAL - UNSORTED_Page_11.jpg"],
    references: [
      {
        label: "Readable detail-sheet export",
        path: "cmsdata/wix/portfolio/cadset/GENERAL - UNSORTED_Page_11.jpg",
      },
    ],
    detailNotes: [
      "The titleblock names Urbis, City of South Perth, South Perth Promenade, and the F9 details drawing title.",
      "No complete drawing package has been promoted yet, so the entry is framed as retained documentation evidence only.",
    ],
    projectFamily: "Urbis public-domain details",
    documentationType: "Detail sheet",
    sourceConfidence: "High",
    evidenceAssets: [
      {
        label: "F9 details sheet",
        path: "cmsdata/wix/portfolio/cadset/GENERAL - UNSORTED_Page_11.jpg",
        kind: "image",
      },
    ],
    internalSourceNote:
      "Promoted from the unsorted export only because the titleblock remained readable and self-contained.",
  },
  {
    id: "aqwest-bcp-laboratory",
    title: "BCP / Laboratory & Storage Facility",
    client: "Aqwest",
    year: "Undated in retained sheet",
    sector: "Utilities / buildings",
    studio: ["GHD Pty Ltd"],
    disciplines: ["Architecture", "General"],
    subtypes: ["Sections and elevations", "Building documentation"],
    software: ["AutoCAD"],
    summary:
      "Early-career buildings documentation retained from the GHD archive and promoted only at the level supported by the readable sections-and-elevations sheet.",
    image: "/media/portfolio/aqwest-bcp-laboratory.jpg",
    featured: false,
    sourceFolder: "cmsdata/wix/portfolio/cadset",
    sourceFiles: ["32-5.jpg", "32-6.jpg"],
    references: [
      { label: "Primary titleblock sheet", path: "cmsdata/wix/portfolio/cadset/32-5.jpg" },
      { label: "Adjacent GHD sheet group", path: "cmsdata/wix/portfolio/cadset/" },
    ],
    detailNotes: [
      "The titleblock identifies Aqwest, GHD, and the sections-and-elevations drawing title for the BCP / laboratory facility.",
      "Location and broader delivery claims remain withheld because they are not fully legible in the retained export reviewed for this tranche.",
    ],
    projectFamily: "GHD buildings archive",
    documentationType: "Sections and elevations sheet",
    sourceConfidence: "High",
    evidenceAssets: [
      {
        label: "Sections and elevations sheet",
        path: "cmsdata/wix/portfolio/cadset/32-5.jpg",
        kind: "image",
      },
      {
        label: "Adjacent GHD support sheet",
        path: "cmsdata/wix/portfolio/cadset/32-6.jpg",
        kind: "image",
      },
    ],
    internalSourceNote:
      "Promoted from readable titleblock metadata in the retained GHD JPEG export group.",
  },
];

export const featuredProjects = portfolioArchive.filter((project) => project.featured);
export const homeSpotlightProjectIds = [
  "pheasants-nest",
  "wungong-master-plan",
  "lake-joondalup-baptist-college",
];
export const homeSpotlightProjects = homeSpotlightProjectIds
  .map((id) => portfolioArchive.find((project) => project.id === id))
  .filter((project): project is PortfolioItem => Boolean(project));

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
    "Truthful employment timeline and a broader portfolio archive seeded from Wix-exported source data.",
    "Hidden /watch and /donate scaffolds isolated from primary SEO and navigation.",
  ],
  later: [
    "Optional deep-linked project routes or CMS-backed portfolio ingestion when the admin workflow is ready.",
    "Contact form delivery wiring, analytics, and production CMS/admin tooling.",
    "YouTube ingestion for /watch and payment integrations for /donate.",
    "Final content QA against all PDF/image source sets and recruiter-facing copy polish.",
  ],
};
