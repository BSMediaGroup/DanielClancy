import danielLogo from "../../assets/logos/logo-danielclancy.svg";
import linkedinIcon from "../../assets/icons/linkedin-0.svg";
import youtubeIcon from "../../assets/icons/youtube.svg";
import rumbleIcon from "../../assets/icons/rumble.svg";
import githubIcon from "../../assets/icons/github.svg";
import xIcon from "../../assets/icons/x.svg";
import patreonIcon from "../../assets/icons/patreon.svg";
import kofiIcon from "../../assets/icons/kofi.svg";
import localsIcon from "../../assets/icons/locals.svg";
import telegramIcon from "../../assets/icons/telegram.svg";
import appleIcon from "../../assets/icons/apple.svg";
import googleIcon from "../../assets/icons/google.svg";
import paymentIcon from "../../assets/icons/ui/payments.svg";
import keyIcon from "../../assets/icons/ui/key.svg";
import profileIcon from "../../assets/icons/ui/profile.svg";
import streamSuitesIcon from "../../assets/icons/streamsuites.svg";
import profileAvatar from "../../assets/portraits/profileavatar.webp";
import professionalHeroBanner from "../../assets/backgrounds/banner-stripesgeneral.webp";
import heroPortrait from "../../assets/backgrounds/danielclancy-portrait.webp";
import professionalShare from "../../assets/backgrounds/seothumb-pro.jpg";
import personalShare from "../../assets/backgrounds/seothumb.webp";
import companyAcce from "../../assets/logos/company-acce.svg";
import companyAcceMono from "../../assets/logos/company-acce-0.svg";
import companyDcDesignStudio from "../../assets/logos/company-dcdesignstudio.svg";
import companyDcDesignStudioMono from "../../assets/logos/company-dcdesignstudio-0.svg";
import companyFleetwood from "../../assets/logos/company-fleetwood.svg";
import companyFleetwoodMono from "../../assets/logos/company-fleetwood-0.svg";
import companyGhd from "../../assets/logos/company-ghd.svg";
import companyGhdMono from "../../assets/logos/company-ghd-0.svg";
import companyLefflerSimes from "../../assets/logos/company-lefflersimes.svg";
import companyLefflerSimesMono from "../../assets/logos/company-lefflersimes-0.svg";
import companyMeriton from "../../assets/logos/company-meriton.svg";
import companyMeritonMono from "../../assets/logos/company-meriton-0.svg";
import companyPlaceLab from "../../assets/logos/company-placelab.svg";
import companyPlaceLabMono from "../../assets/logos/company-placelab-0.svg";
import companyRichmondRoss from "../../assets/logos/company-richmondross.svg";
import companyRichmondRossMono from "../../assets/logos/company-richmondross-0.svg";
import companyUrbis from "../../assets/logos/company-urbis.svg";
import companyUrbisMono from "../../assets/logos/company-urbis-0.svg";
import softwareAutoCad from "../../assets/logos/software-autocad.svg";
import softwareCreativeCloud from "../../assets/logos/software-creativecloud.svg";
import softwareOffice365 from "../../assets/logos/software-office365.svg";
import softwareQgis from "../../assets/logos/software-qgis.svg";
import softwareRevit from "../../assets/logos/software-revit.svg";
import softwareSketchUp from "../../assets/logos/software-sketchup.svg";

export const shellAssets = {
  danielLogo,
  linkedinIcon,
  heroPortrait,
  profileAvatar,
  keyIcon,
  profileIcon,
  professionalHeroBanner,
  professionalShare,
  personalShare,
};

export const socialIcons = {
  youtube: youtubeIcon,
  rumble: rumbleIcon,
  github: githubIcon,
  x: xIcon,
  streamSuites: streamSuitesIcon,
  patreon: patreonIcon,
  kofi: kofiIcon,
  locals: localsIcon,
  telegram: telegramIcon,
  apple: appleIcon,
  google: googleIcon,
  payments: paymentIcon,
};

type CompanyLogoVariant = "default" | "monochrome";
type CompanyLogoTreatment = "square" | "portrait" | "landscape" | "long";

const companyAliases: Record<string, string> = {
  "PLACE Laboratory": "Place Laboratory",
  "Urbis Pty Ltd": "Urbis",
  "ACCE Pty Ltd": "ACCE",
  "GHD Pty Ltd": "GHD",
};

const companyLogoMap: Record<CompanyLogoVariant, Record<string, string>> = {
  default: {
    ACCE: companyAcce,
    "DC Design Studio": companyDcDesignStudio,
    "Fleetwood Australia": companyFleetwood,
    GHD: companyGhd,
    "Leffler Simes Architects": companyLefflerSimes,
    "Meriton Group": companyMeriton,
    "Place Laboratory": companyPlaceLab,
    "Richmond+Ross": companyRichmondRoss,
    Urbis: companyUrbis,
  },
  monochrome: {
    ACCE: companyAcceMono,
    "DC Design Studio": companyDcDesignStudioMono,
    "Fleetwood Australia": companyFleetwoodMono,
    GHD: companyGhdMono,
    "Leffler Simes Architects": companyLefflerSimesMono,
    "Meriton Group": companyMeritonMono,
    "Place Laboratory": companyPlaceLabMono,
    "Richmond+Ross": companyRichmondRossMono,
    Urbis: companyUrbisMono,
  },
};

const companyLogoTreatmentMap: Record<string, CompanyLogoTreatment> = {
  ACCE: "portrait",
  "DC Design Studio": "square",
  "Fleetwood Australia": "long",
  GHD: "square",
  "Leffler Simes Architects": "long",
  "Meriton Group": "square",
  "Place Laboratory": "square",
  "Richmond+Ross": "long",
  Urbis: "landscape",
};

const softwareLogoMap: Record<string, string> = {
  AutoCAD: softwareAutoCad,
  Revit: softwareRevit,
  "Autodesk AutoCAD": softwareAutoCad,
  "Autodesk Revit": softwareRevit,
  "Adobe Creative Cloud": softwareCreativeCloud,
  "Trimble SketchUp": softwareSketchUp,
  "Microsoft Office": softwareOffice365,
  "Microsoft Office 365": softwareOffice365,
  QGIS: softwareQgis,
};

function normalizeCompany(company: string) {
  return companyAliases[company] ?? company;
}

export function getCompanyLogo(company: string, variant: CompanyLogoVariant = "default") {
  return companyLogoMap[variant][normalizeCompany(company)];
}

export function getCompanyLogoTreatment(company: string): CompanyLogoTreatment {
  return companyLogoTreatmentMap[normalizeCompany(company)] ?? "landscape";
}

export function getSoftwareLogo(software: string) {
  return softwareLogoMap[software];
}
