export type Product = {
  name: string;
  code: string;
  traits: string;
  description: string;
  pack: string;
  price: string;
  image: string;
  alt: string;
  accent: string;
};

export const products: Product[] = [
  {
    name: "STATIC LIME",
    code: "001 / PRIME ENERGY",
    traits: "BRIGHT / FEARLESS / ORIGINAL",
    description: "Sharp lime. Crisp yuzu. A high-voltage citrus finish.",
    pack: "12 × 330 ML",
    price: "$32.00",
    image: "/images/can-static-lime.png",
    alt: "Static Lime energy can",
    accent: "#cdff3f",
  },
  {
    name: "SOLAR PEACH",
    code: "002 / PRIME ENERGY",
    traits: "JUICY / WARM / UNFILTERED",
    description: "Ripe white peach meets a flash of blood orange.",
    pack: "12 × 330 ML",
    price: "$32.00",
    image: "/images/can-solar-peach.png",
    alt: "Solar Peach energy can",
    accent: "#ff9b53",
  },
  {
    name: "NIGHT BERRY",
    code: "003 / PRIME ENERGY",
    traits: "DARK / DEEP / UNEXPECTED",
    description: "Dark blackberry. Tart blackcurrant. After-hours energy.",
    pack: "12 × 330 ML",
    price: "$32.00",
    image: "/images/can-night-berry.png",
    alt: "Night Berry energy can",
    accent: "#c8a5ff",
  },
  {
    name: "GLACIAL RUSH",
    code: "004 / PRIME ENERGY",
    traits: "COOL / CRISP / RELENTLESS",
    description: "Cool blue raspberry with an ice-clean citrus edge.",
    pack: "12 × 330 ML",
    price: "$32.00",
    image: "/images/can-glacial-rush.png",
    alt: "Glacial Rush energy can",
    accent: "#94dce1",
  },
];

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/formula", label: "Formula" },
  { href: "/support", label: "Support" },
];

export const formulaPillars = [
  {
    value: "160",
    unit: "MG",
    label: "CAFFEINE",
    copy: "A precise hit of caffeine. For whatever’s next.",
  },
  {
    value: "0",
    unit: "G",
    label: "SUGAR",
    copy: "Full-throttle flavor. No sugar in the equation.",
  },
  {
    value: "B3/6/12",
    unit: "",
    label: "B VITAMINS",
    copy: "Essential B vitamins to support normal energy metabolism.",
  },
  {
    value: "10",
    unit: "KCAL",
    label: "PER CAN",
    copy: "Light on calories. Never light on character.",
  },
];

export const footerGroups = [
  {
    title: "EXPLORE",
    links: [
      { label: "Shop all flavors", href: "/products" },
      { label: "Variety pack", href: "/products" },
      { label: "Our DNA", href: "/about" },
    ],
  },
  {
    title: "SUPPORT",
    links: [
      { label: "Shipping & returns", href: "/shipping" },
      { label: "FAQs", href: "/faq" },
      { label: "Support", href: "/support" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    title: "CONNECT",
    links: [
      { label: "Become a stockist", href: "/contact?topic=stockist" },
      { label: "Join the collective", href: "/#inner-circuit" },
      { label: "Press & partnerships", href: "/contact?topic=press" },
      { label: "hello@prime.energy", href: "mailto:hello@prime.energy" },
    ],
  },
];
