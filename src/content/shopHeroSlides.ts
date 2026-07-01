import shopHero00 from "../../assets/backgrounds/shopheroslides/shophero-00.webp";
import shopHero01 from "../../assets/backgrounds/shopheroslides/shophero-01.webp";
import shopHero02 from "../../assets/backgrounds/shopheroslides/shophero-02.webp";

export const staticShopHeroSlides = [
  {
    id: "shophero-00",
    label: "Shop hero 00",
    src: shopHero00,
    staticPath: "/assets/backgrounds/shopheroslides/shophero-00.webp",
    sortOrder: 1,
  },
  {
    id: "shophero-01",
    label: "Shop hero 01",
    src: shopHero01,
    staticPath: "/assets/backgrounds/shopheroslides/shophero-01.webp",
    sortOrder: 2,
  },
  {
    id: "shophero-02",
    label: "Shop hero 02",
    src: shopHero02,
    staticPath: "/assets/backgrounds/shopheroslides/shophero-02.webp",
    sortOrder: 3,
  },
] as const;
