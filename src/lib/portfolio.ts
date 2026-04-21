import { portfolioArchive, type PortfolioItem } from "../content/siteContent";

export const portfolioFamilyOrder = [
  "Ampol highway service centres",
  "Ampol UPSS upgrades",
  "Curtin Creative Quarter",
  "ACCE structural archive",
  "Urban master planning",
  "Urbis public-domain details",
  "Traffic management",
  "Residential additions",
  "Residential landscape",
  "GHD buildings archive",
];

export const disciplineOrder = ["Architecture", "Structural", "Landscape", "Urban Planning", "General"];

export function getPrimaryDiscipline(disciplines: string[]) {
  return disciplines.find((discipline) => discipline !== "General") ?? disciplines[0];
}

export function getPortfolioFamily(project: PortfolioItem) {
  if (project.projectFamily) {
    return project.projectFamily;
  }

  if (project.title.includes("Ampol Highway Service Centre")) {
    return "Ampol highway service centres";
  }

  if (project.title.includes("Pump System Upgrades")) {
    return "Ampol UPSS upgrades";
  }

  if (project.title.includes("Curtin Creative Quarter")) {
    return "Curtin Creative Quarter";
  }

  if (project.title.includes("Spratt Residence")) {
    return "Residential additions";
  }

  if (project.title.includes("Cottesloe Beach House")) {
    return "Residential landscape";
  }

  if (project.title.includes("Wungong")) {
    return "Urban master planning";
  }

  if (project.title.includes("Cue Roadhouse")) {
    return "Traffic management";
  }

  return getPrimaryDiscipline(project.disciplines);
}

export function getDocumentationType(project: PortfolioItem) {
  return project.documentationType ?? project.subtypes[0] ?? "Documented archive sample";
}

export function getPortfolioSlug(project: PortfolioItem) {
  return project.id;
}

export function getPortfolioProjectBySlug(slug?: string) {
  return portfolioArchive.find((project) => getPortfolioSlug(project) === slug) ?? null;
}

export function getSortedPortfolioFamilies() {
  return Array.from(new Set(portfolioArchive.map((project) => getPortfolioFamily(project)))).sort(
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
