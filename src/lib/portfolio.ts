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
  return portfolioArchive.find((project) => getPortfolioSlug(project) === slug) ?? null;
}

export function getPortfolioProjectBySlugFrom(projects: PortfolioItem[], slug?: string) {
  return projects.find((project) => getPortfolioSlug(project) === slug) ?? null;
}

export function getPortfolioProjectIndex(project: PortfolioItem, projects = portfolioArchive) {
  return projects.findIndex((item) => item.id === project.id);
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
