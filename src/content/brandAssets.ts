import danielLogo from "../../assets/logos/logo-danielclancy.svg";
import linkedinIcon from "../../assets/icons/linkedin-0.svg";
import youtubeIcon from "../../assets/icons/youtube.svg";
import rumbleIcon from "../../assets/icons/rumble.svg";
import patreonIcon from "../../assets/icons/patreon.svg";
import kofiIcon from "../../assets/icons/kofi.svg";
import localsIcon from "../../assets/icons/locals.svg";
import telegramIcon from "../../assets/icons/telegram.svg";
import appleIcon from "../../assets/icons/apple.svg";
import googleIcon from "../../assets/icons/google.svg";
import paymentIcon from "../../assets/icons/ui/payments.svg";
import profileAvatar from "../../assets/portraits/profileavatar.webp";
import heroPortrait from "../../assets/backgrounds/danielclancy-portrait.webp";
import professionalShare from "../../assets/backgrounds/seothumb-pro.jpg";
import personalShare from "../../assets/backgrounds/seothumb.webp";
import companyAcce from "../../assets/logos/company-acce.svg";
import companyDcDesignStudio from "../../assets/logos/company-dcdesignstudio.svg";
import companyFleetwood from "../../assets/logos/company-fleetwood.svg";
import companyGhd from "../../assets/logos/company-ghd.svg";
import companyLefflerSimes from "../../assets/logos/company-lefflersimes.svg";
import companyMeriton from "../../assets/logos/company-meriton.svg";
import companyPlaceLab from "../../assets/logos/company-placelab.svg";
import companyRichmondRoss from "../../assets/logos/company-richmondross.svg";
import companyUrbis from "../../assets/logos/company-urbis.svg";
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
  professionalShare,
  personalShare,
};

export const socialIcons = {
  youtube: youtubeIcon,
  rumble: rumbleIcon,
  patreon: patreonIcon,
  kofi: kofiIcon,
  locals: localsIcon,
  telegram: telegramIcon,
  apple: appleIcon,
  google: googleIcon,
  payments: paymentIcon,
};

const companyLogoMap: Record<string, string> = {
  "Richmond+Ross": companyRichmondRoss,
  "Meriton Group": companyMeriton,
  "Leffler Simes Architects": companyLefflerSimes,
  "Fleetwood Australia": companyFleetwood,
  "Place Laboratory": companyPlaceLab,
  "PLACE Laboratory": companyPlaceLab,
  "DC Design Studio": companyDcDesignStudio,
  "Urbis Pty Ltd": companyUrbis,
  Urbis: companyUrbis,
  "ACCE Pty Ltd": companyAcce,
  "GHD Pty Ltd": companyGhd,
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

export function getCompanyLogo(company: string) {
  return companyLogoMap[company];
}

export function getSoftwareLogo(software: string) {
  return softwareLogoMap[software];
}
