import { portfolioArchive, type PortfolioItem } from "../content/siteContent";

export const portfolioFamilyOrder = [
  "Richmond+Ross",
  "Place Laboratory",
  "ACCE",
  "DC Design Studio",
  "Urbis",
  "Riley Consulting",
];

export const disciplineOrder = [
  "Architectural",
  "Civil",
  "Landscape",
  "Structural",
  "Transport",
  "Urban Planning",
];

export function getPrimaryDiscipline(disciplines: string[]) {
  return disciplines[0] ?? "General";
}

export function getPortfolioFamily(project: PortfolioItem) {
  return project.projectFamily ?? project.studio[0] ?? getPrimaryDiscipline(project.disciplines);
}

export function getDocumentationType(project: PortfolioItem) {
  return project.documentationType ?? project.constructionType ?? project.disciplines[0] ?? "Project documentation";
}

export function getPortfolioSlug(project: PortfolioItem) {
  return project.slug;
}

export function getPortfolioProjectBySlug(slug?: string) {
  return getPortfolioProjectBySlugFrom(portfolioArchive, slug);
}

export function getPortfolioProjectBySlugFrom<T extends PortfolioItem>(projects: T[], slug?: string): T | null {
  const key = normalizePortfolioRouteKey(slug || "");
  if (!key) return null;
  return projects.find((project) => getPortfolioLookupKeys(project).includes(key)) ?? null;
}

export function getPortfolioProjectIndex(project: PortfolioItem, projects = portfolioArchive) {
  const projectKeys = getPortfolioLookupKeys(project as PortfolioItem & Record<string, unknown>);
  return projects.findIndex((item) =>
    getPortfolioLookupKeys(item as PortfolioItem & Record<string, unknown>).some((key) =>
      projectKeys.includes(key),
    ),
  );
}

export function getAdjacentPortfolioProjects(project: PortfolioItem, projects = portfolioArchive) {
  const index = getPortfolioProjectIndex(project, projects);

  if (index === -1) {
    return {
      previousProject: null,
      nextProject: null,
    };
  }

  return {
    previousProject: projects[index - 1] ?? null,
    nextProject: projects[index + 1] ?? null,
  };
}

export function getSortedPortfolioFamilies(projects = portfolioArchive) {
  return Array.from(new Set(projects.map((project) => getPortfolioFamily(project)))).sort(
    (left, right) => {
      const leftIndex = portfolioFamilyOrder.indexOf(left);
      const rightIndex = portfolioFamilyOrder.indexOf(right);

      if (leftIndex === -1 && rightIndex === -1) {
        return left.localeCompare(right);
      }

      if (leftIndex === -1) {
        return 1;
      }

      if (rightIndex === -1) {
        return -1;
      }

      return leftIndex - rightIndex;
    },
  );
}

export function getPortfolioLookupKeys(project: PortfolioItem & Record<string, unknown>) {
  const keys = [
    project.slug,
    project.id,
    String(project.code || ""),
    project.title,
    lastPathSegment(String(project.livePage || "")),
    lastPathSegment(String(project.path || "")),
    lastPathSegment(String(project.url || "")),
  ];
  return Array.from(new Set(keys.map(normalizePortfolioRouteKey).filter(Boolean)));
}

export function normalizePortfolioRouteKey(value: string) {
  return lastPathSegment(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function lastPathSegment(value: string) {
  const withoutQuery = value.trim().split("#")[0].split("?")[0];
  const segment = (withoutQuery.split("/").filter(Boolean).pop() || withoutQuery).trim();

  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
