export type CatalogFlavor = {
  slug: string;
  name: string;
  code: string;
  traits: string;
  description: string;
  pack: string;
  price: string;
  image: string;
  alt: string;
  accent: string;
  available: boolean;
};

export const catalogFlavors: CatalogFlavor[] = [
  {
    slug: "static-lime",
    name: "STATIC LIME",
    code: "001 / PRIME ENERGY",
    traits: "BRIGHT / FEARLESS / ORIGINAL",
    description: "Sharp lime. Crisp yuzu. A high-voltage citrus finish.",
    pack: "12 × 330 ML",
    price: "$32.00",
    image: "/images/products/static-lime.png",
    alt: "Static Lime can on a dark pedestal",
    accent: "#cdff3f",
    available: true,
  },
  {
    slug: "solar-peach",
    name: "SOLAR PEACH",
    code: "002 / PRIME ENERGY",
    traits: "JUICY / WARM / UNFILTERED",
    description: "Ripe white peach meets a flash of blood orange.",
    pack: "12 × 330 ML",
    price: "$32.00",
    image: "/images/products/solar-peach.png",
    alt: "Solar Peach can on a dark pedestal",
    accent: "#ff9b53",
    available: true,
  },
  {
    slug: "night-berry",
    name: "NIGHT BERRY",
    code: "003 / PRIME ENERGY",
    traits: "DARK / DEEP / UNEXPECTED",
    description: "Dark blackberry. Tart blackcurrant. After-hours energy.",
    pack: "12 × 330 ML",
    price: "$32.00",
    image: "/images/products/night-berry.png",
    alt: "Night Berry can on a dark pedestal",
    accent: "#c8a5ff",
    available: false,
  },
  {
    slug: "glacial-rush",
    name: "GLACIAL RUSH",
    code: "004 / PRIME ENERGY",
    traits: "COOL / CRISP / RELENTLESS",
    description: "Cool blue raspberry with an ice-clean citrus edge.",
    pack: "12 × 330 ML",
    price: "$32.00",
    image: "/images/products/glacial-rush.png",
    alt: "Glacial Rush can on a dark pedestal",
    accent: "#94dce1",
    available: true,
  },
];

export const discoveryPack = {
  id: "discovery-pack",
  name: "ALL FOUR ALL IN",
  kicker: "THE DISCOVERY DROP / 12-PACK",
  description:
    "All four flavors. Three of each. Your all-access pass to the PRIME universe. Start here. Go anywhere.",
  price: "$32.00",
  pack: "12 × 330 ML",
  image: "/images/products/discovery-pack.png",
  alt: "PRIME variety pack with four flavor cans",
};
