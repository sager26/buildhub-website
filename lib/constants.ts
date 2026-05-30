export const BRAND = {
  name: "BuildHub",
  tagline: "Elevate Your Facade",
  phoneDisplay: "+962 7 9743 5635",
  phoneHref: "tel:+962797435635",
  whatsapp: "https://wa.me/962797435635",
  email: "Buildhub.jo@gmail.com",
  emailHref: "mailto:Buildhub.jo@gmail.com",
  maps: "https://maps.app.goo.gl/YcxbsLucr8H4255YA",
  location: "Amman, Jordan",
};

export const WHATSAPP_QUOTE = `${BRAND.whatsapp}?text=${encodeURIComponent(
  "Hi BuildHub, I'd like a quote for a facade project."
)}`;

export const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Why Us", href: "#why" },
  { label: "Products", href: "#products" },
  { label: "Contact", href: "#contact" },
];

export const HERO = {
  eyebrow: "Foam Stone & Architectural Facades · Jordan",
  title: "Elevate Your Facade",
  body: "Jordan's leading provider of Foam Stone and architectural facade solutions. Custom-made decorative elements, fast installation, lightweight systems, and premium finishes for villas and commercial projects.",
};

export const ABOUT = {
  eyebrow: "About Us",
  title: "Facades, reimagined in Jordan",
  body: "BuildHub is a Jordanian company specializing in innovative facade solutions and architectural decorative systems. We manufacture and supply Foam Stone products, decorative moldings, columns, arches, and custom facade elements designed to enhance the appearance of residential and commercial buildings. Our solutions combine aesthetics, durability, and efficiency while offering faster execution and lower costs compared to traditional methods.",
};

export const WHY = {
  eyebrow: "Why Choose BuildHub",
  title: "Built better, finished faster",
  items: [
    {
      title: "Local Manufacturing",
      body: "Proudly manufactured in Jordan.",
      icon: "factory",
    },
    {
      title: "Fast Execution",
      body: "Shorter production and installation times.",
      icon: "bolt",
    },
    {
      title: "Custom Designs",
      body: "Made according to project requirements.",
      icon: "ruler",
    },
    {
      title: "Lightweight Systems",
      body: "Reduced structural load compared to traditional materials.",
      icon: "feather",
    },
    {
      title: "Durable Exterior Finish",
      body: "Designed to withstand outdoor conditions.",
      icon: "shield",
    },
    {
      title: "Sustainable Solutions",
      body: "Environmentally conscious materials and processes.",
      icon: "leaf",
    },
  ],
};

export type Product = {
  id: string;
  name: string;
  body: string;
  image?: string;
  /** CSS object-position to crop the best part of each catalog page */
  imagePosition?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "foam-stone",
    name: "Foam Stone",
    body: "Decorative and insulating facade system combining EPS technology with a durable exterior finish.",
    image: "/catalog-pages/page-50.png",
    imagePosition: "center center",
  },
  {
    id: "decorative-moldings",
    name: "Decorative Moldings",
    body: "Architectural details for windows, roofs, and facades.",
    image: "/catalog-pages/page-26.png",
    imagePosition: "center bottom",
  },
  {
    id: "columns-capitals",
    name: "Columns & Capitals",
    body: "Classical and modern decorative columns.",
    image: "/catalog-pages/page-46.png",
    imagePosition: "center center",
  },
  {
    id: "arches",
    name: "Arches",
    body: "Custom-designed architectural arches for entrances and facades.",
    image: "/catalog-pages/page-14.png",
    imagePosition: "center bottom",
  },
  {
    id: "custom-facade",
    name: "Custom Facade Elements",
    body: "Tailored decorative solutions designed specifically for each project.",
    image: "/catalog-pages/page-30.png",
    imagePosition: "center center",
  },
];

export const PROCESS = {
  eyebrow: "How It Works",
  title: "From sketch to standing facade",
  steps: [
    {
      n: "01",
      title: "Design",
      body: "We translate your drawings or ideas into precise, custom facade elements.",
    },
    {
      n: "02",
      title: "Manufacture",
      body: "Produced locally in Jordan with EPS technology and a durable exterior finish.",
    },
    {
      n: "03",
      title: "Install",
      body: "Lightweight pieces mean faster, lower-cost installation on site.",
    },
  ],
};

export const STATS = [
  { value: 90, suffix: "%", label: "Lighter than natural stone" },
  { value: 3, suffix: "x", label: "Faster to install" },
  { value: 100, suffix: "%", label: "Made in Jordan" },
];
