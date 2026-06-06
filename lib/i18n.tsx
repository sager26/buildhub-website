"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "ar";

const EN = {
  nav: { about: "About", why: "Why Us", products: "Products", contact: "Contact" },
  ui: {
    quote: "Get a Quote",
    quoteWhatsapp: "Get a Quote on WhatsApp",
    explore: "Explore Products",
    chat: "Chat on WhatsApp",
    inspect: "Inspect in 3D",
    drag: "Drag to rotate",
    downloadCatalog: "Download Catalog",
    catalogTitle: "Get the full product catalog",
    catalogBody: "62 pages of Foam Stone, columns, cornices, arches and finishes — sent to your WhatsApp instantly.",
    namePh: "Your name",
    phonePh: "WhatsApp number",
    getCatalog: "Send me the catalog",
    catalogNote: "We'll open WhatsApp and your download will start.",
  },
  hero: {
    eyebrow: "Foam Stone & Architectural Facades · Jordan",
    title: "Elevate Your Facade",
    body: "Jordan's leading provider of Foam Stone and architectural facade solutions. Custom-made decorative elements, fast installation, lightweight systems, and premium finishes for villas and commercial projects.",
  },
  about: {
    eyebrow: "About Us",
    title: "Facades, reimagined in Jordan",
    body: "BuildHub is a Jordanian company specializing in innovative facade solutions and architectural decorative systems. We manufacture and supply Foam Stone products, decorative moldings, columns, arches, and custom facade elements designed to enhance the appearance of residential and commercial buildings. Our solutions combine aesthetics, durability, and efficiency while offering faster execution and lower costs compared to traditional methods.",
    body2: "Unlike traditional stone, our Foam Stone system is manufactured using Expanded Polystyrene (EPS) technology bonded with a cement-polymer exterior coat. The result is an architectural finish that looks identical to natural stone — but installs in days, not weeks, and places no extra load on the structure.",
    diffs: [
      "Local manufacturer — not an importer. Every piece is produced in Jordan.",
      "Works with architects, contractors, and villa owners directly.",
      "Custom orders accepted from single pieces to full project supply.",
    ],
    makeEyebrow: "What We Make",
    makeTitle1: "Full facade capability,",
    makeTitle2: "under one roof",
    services: [
      { title: "Foam Stone Cladding", body: "EPS-core panels with a stone-textured exterior coat — lightweight, insulating, and weatherproof. Replaces natural stone at a fraction of the weight and cost." },
      { title: "Decorative Moldings", body: "Window surrounds, cornices, sills, and string courses made to your exact dimensions. Supplied pre-finished and ready to install." },
      { title: "Columns & Capitals", body: "Classical and contemporary column systems — Doric, Ionic, Corinthian, and custom profiles. Full column kits including base, shaft, capital, and plinth." },
      { title: "Architectural Arches", body: "Semicircular, segmental, and custom-profile arch systems for entrances, windows, and facades. Precision-cut for perfect fit on site." },
      { title: "Custom Elements", body: "One-off decorative pieces designed from your drawings or reference images — medallions, pilasters, balustrades, pediments, and bespoke ornaments." },
      { title: "Full Facade Systems", body: "Turn-key facade packages from design to delivery. We coordinate all elements — cladding, trim, columns, arches — as a single engineered system." },
    ],
  },
  why: {
    eyebrow: "Why Choose BuildHub",
    title: "Built better, finished faster",
    items: [
      { title: "Local Manufacturing", body: "Proudly manufactured in Jordan." },
      { title: "Fast Execution", body: "Shorter production and installation times." },
      { title: "Custom Designs", body: "Made according to project requirements." },
      { title: "Lightweight Systems", body: "Reduced structural load compared to traditional materials." },
      { title: "Durable Exterior Finish", body: "Designed to withstand outdoor conditions." },
      { title: "Sustainable Solutions", body: "Environmentally conscious materials and processes." },
    ],
  },
  products: {
    eyebrow: "Our Products",
    title: "A complete facade system",
    body: "From insulating Foam Stone to bespoke columns and arches — every element is custom-made for your project.",
    label: "Products",
    items: [
      { name: "Foam Stone", body: "Decorative and insulating facade system combining EPS technology with a durable exterior finish." },
      { name: "Decorative Moldings", body: "Architectural details for windows, roofs, and facades." },
      { name: "Columns & Capitals", body: "Classical and modern decorative columns." },
      { name: "Arches", body: "Custom-designed architectural arches for entrances and facades." },
      { name: "Custom Facade Elements", body: "Tailored decorative solutions designed specifically for each project." },
    ],
  },
  gallery: { eyebrow: "Project Gallery", title: "Built across Jordan", body: "Residential villas, commercial towers, and landmark buildings — every project finished with BuildHub facade systems." },
  process: {
    eyebrow: "How It Works",
    title: "From sketch to standing facade",
    steps: [
      { title: "Design", body: "We translate your drawings or ideas into precise, custom facade elements." },
      { title: "Manufacture", body: "Produced locally in Jordan with EPS technology and a durable exterior finish." },
      { title: "Install", body: "Lightweight pieces mean faster, lower-cost installation on site." },
    ],
  },
  stats: ["Lighter than natural stone", "Faster to install", "Made in Jordan"],
  contact: {
    eyebrow: "Let's build",
    title1: "Ready to elevate",
    title2: "your facade?",
    body: "Send us your drawings or ideas and we'll get back with a custom quote. Fast, lightweight, made in Jordan.",
    email: "Email",
    location: "Location",
    openMaps: "Open in Google Maps ↗",
  },
  footer: {
    blurb: "Foam Stone & architectural facade solutions, proudly manufactured in Jordan.",
    explore: "Explore", contact: "Contact", start: "Start",
    rights: "All rights reserved.", made: "Made in Jordan · Elevate Your Facade",
  },
  showroom: [
    { name: "Foam Stone", tag: "Wall Cladding", detail: "EPS core + cement-polymer stone coat. 80% lighter than natural stone — no extra structural load, fast to install." },
    { name: "Decorative Moldings", tag: "Cornices & Trim", detail: "Cornices, window surrounds, sills and string-courses cut to exact dimensions. Pre-finished, ready to fix." },
    { name: "Columns & Capitals", tag: "Structural Decor", detail: "Full column kits — reeded shaft, Doric to Corinthian capital, base & plinth. Stacks and bonds on site." },
    { name: "Architectural Arches", tag: "Entry Systems", detail: "Semicircular & segmental arch kits with precision-cut voussoirs, keystone, impost blocks & archivolt." },
    { name: "Balustrades", tag: "Railings", detail: "Turned baluster railings for balconies, terraces and staircases. Posts, rails and balusters supplied as a kit." },
    { name: "Window Surrounds", tag: "Facade Trim", detail: "Molded window & door surrounds with sill, jambs and keystone. Frames any opening with classical detail." },
  ],
};

const AR: typeof EN = {
  nav: { about: "من نحن", why: "لماذا نحن", products: "المنتجات", contact: "تواصل معنا" },
  ui: {
    quote: "اطلب عرض سعر",
    quoteWhatsapp: "اطلب عرض سعر عبر واتساب",
    explore: "استكشف المنتجات",
    chat: "تحدث عبر واتساب",
    inspect: "استعرض ثلاثي الأبعاد",
    drag: "اسحب للتدوير",
    downloadCatalog: "حمّل الكتيّب",
    catalogTitle: "احصل على كتيّب المنتجات الكامل",
    catalogBody: "٦٢ صفحة من حجر الفوم والأعمدة والكرانيش والأقواس والتشطيبات — تصلك على واتساب فوراً.",
    namePh: "اسمك",
    phonePh: "رقم واتساب",
    getCatalog: "أرسل لي الكتيّب",
    catalogNote: "سنفتح واتساب وسيبدأ التنزيل تلقائياً.",
  },
  hero: {
    eyebrow: "حجر الفوم والواجهات المعمارية · الأردن",
    title: "ارتقِ بواجهتك",
    body: "المزوّد الرائد في الأردن لحلول حجر الفوم والواجهات المعمارية. عناصر زخرفية مصنوعة حسب الطلب، تركيب سريع، أنظمة خفيفة الوزن، وتشطيبات فاخرة للفلل والمشاريع التجارية.",
  },
  about: {
    eyebrow: "من نحن",
    title: "واجهات بحلّة جديدة في الأردن",
    body: "بيلدهَب شركة أردنية متخصصة في حلول الواجهات المبتكرة وأنظمة الديكور المعماري. نصنّع ونورّد منتجات حجر الفوم، والكرانيش الزخرفية، والأعمدة، والأقواس، وعناصر الواجهات المخصصة لتعزيز مظهر المباني السكنية والتجارية. تجمع حلولنا بين الجمال والمتانة والكفاءة مع تنفيذ أسرع وتكلفة أقل مقارنة بالطرق التقليدية.",
    body2: "على عكس الحجر التقليدي، يُصنع نظام حجر الفوم لدينا باستخدام تقنية البوليسترين الممدد (EPS) مع طبقة خارجية إسمنتية-بوليمرية. والنتيجة تشطيب معماري يبدو مطابقاً للحجر الطبيعي — لكنه يُركّب في أيام لا أسابيع، ولا يضيف أي حمل على المبنى.",
    diffs: [
      "مصنّع محلي — لسنا مستوردين. كل قطعة تُنتج في الأردن.",
      "نعمل مباشرة مع المهندسين والمقاولين وأصحاب الفلل.",
      "نقبل الطلبات المخصصة من قطعة واحدة إلى توريد مشروع كامل.",
    ],
    makeEyebrow: "ما الذي نصنعه",
    makeTitle1: "قدرات واجهات متكاملة،",
    makeTitle2: "تحت سقف واحد",
    services: [
      { title: "كسوة حجر الفوم", body: "ألواح بقلب EPS وطبقة خارجية بملمس الحجر — خفيفة وعازلة ومقاومة للعوامل الجوية. تحل محل الحجر الطبيعي بجزء من الوزن والتكلفة." },
      { title: "كرانيش زخرفية", body: "إطارات نوافذ وكرانيش وعتبات وأفاريز بأبعادك الدقيقة. تُورّد جاهزة التشطيب وللتركيب مباشرة." },
      { title: "أعمدة وتيجان", body: "أنظمة أعمدة كلاسيكية وحديثة — دوري وأيوني وكورنثي وتصاميم مخصصة. أطقم أعمدة كاملة تشمل القاعدة والبدن والتاج." },
      { title: "أقواس معمارية", body: "أنظمة أقواس نصف دائرية وقطعية ومخصصة للمداخل والنوافذ والواجهات. مقطوعة بدقة لتناسب الموقع تماماً." },
      { title: "عناصر مخصصة", body: "قطع زخرفية فريدة تُصمم من رسوماتك أو صورك — ميداليات وأكتاف وأعمدة درابزين وجمالونات وزخارف خاصة." },
      { title: "أنظمة واجهات كاملة", body: "حزم واجهات متكاملة من التصميم إلى التسليم. ننسّق كل العناصر — الكسوة والزخارف والأعمدة والأقواس — كنظام هندسي واحد." },
    ],
  },
  why: {
    eyebrow: "لماذا تختار بيلدهَب",
    title: "جودة أعلى، وإنجاز أسرع",
    items: [
      { title: "تصنيع محلي", body: "نُصنّع بفخر في الأردن." },
      { title: "تنفيذ سريع", body: "أوقات إنتاج وتركيب أقصر." },
      { title: "تصاميم مخصصة", body: "تُصنع وفق متطلبات المشروع." },
      { title: "أنظمة خفيفة الوزن", body: "حمل إنشائي أقل مقارنة بالمواد التقليدية." },
      { title: "تشطيب خارجي متين", body: "مصمم لتحمّل الظروف الخارجية." },
      { title: "حلول مستدامة", body: "مواد وعمليات صديقة للبيئة." },
    ],
  },
  products: {
    eyebrow: "منتجاتنا",
    title: "نظام واجهات متكامل",
    body: "من حجر الفوم العازل إلى الأعمدة والأقواس المصممة خصيصاً — كل عنصر مصنوع خصيصاً لمشروعك.",
    label: "المنتجات",
    items: [
      { name: "حجر الفوم", body: "نظام واجهات عازل وزخرفي يجمع تقنية EPS مع تشطيب خارجي متين." },
      { name: "كرانيش زخرفية", body: "تفاصيل معمارية للنوافذ والأسقف والواجهات." },
      { name: "أعمدة وتيجان", body: "أعمدة زخرفية كلاسيكية وحديثة." },
      { name: "أقواس", body: "أقواس معمارية مصممة خصيصاً للمداخل والواجهات." },
      { name: "عناصر واجهات مخصصة", body: "حلول زخرفية مصممة خصيصاً لكل مشروع." },
    ],
  },
  gallery: { eyebrow: "معرض المشاريع", title: "أُنجزت في كل أنحاء الأردن", body: "فلل سكنية وأبراج تجارية ومبانٍ مميزة — كل مشروع مُنجز بأنظمة واجهات بيلدهَب." },
  process: {
    eyebrow: "كيف نعمل",
    title: "من الرسم إلى واجهة قائمة",
    steps: [
      { title: "التصميم", body: "نحوّل رسوماتك أو أفكارك إلى عناصر واجهات دقيقة ومخصصة." },
      { title: "التصنيع", body: "يُنتج محلياً في الأردن بتقنية EPS وتشطيب خارجي متين." },
      { title: "التركيب", body: "القطع الخفيفة تعني تركيباً أسرع وأقل تكلفة في الموقع." },
    ],
  },
  stats: ["أخف من الحجر الطبيعي", "أسرع في التركيب", "صُنع في الأردن"],
  contact: {
    eyebrow: "لنبنِ معاً",
    title1: "جاهز للارتقاء",
    title2: "بواجهتك؟",
    body: "أرسل لنا رسوماتك أو أفكارك وسنعود إليك بعرض سعر مخصص. سريع، خفيف الوزن، وصُنع في الأردن.",
    email: "البريد الإلكتروني",
    location: "الموقع",
    openMaps: "افتح في خرائط جوجل ↗",
  },
  footer: {
    blurb: "حلول حجر الفوم والواجهات المعمارية، تُصنع بفخر في الأردن.",
    explore: "استكشف", contact: "تواصل", start: "ابدأ",
    rights: "جميع الحقوق محفوظة.", made: "صُنع في الأردن · ارتقِ بواجهتك",
  },
  showroom: [
    { name: "حجر الفوم", tag: "كسوة جدران", detail: "قلب EPS مع طبقة حجرية إسمنتية-بوليمرية. أخف بنسبة ٨٠٪ من الحجر الطبيعي — بلا حمل إنشائي إضافي وتركيب سريع." },
    { name: "كرانيش زخرفية", tag: "كرانيش وزخارف", detail: "كرانيش وإطارات نوافذ وعتبات وأفاريز مقطوعة بأبعاد دقيقة. جاهزة التشطيب وللتركيب." },
    { name: "أعمدة وتيجان", tag: "ديكور إنشائي", detail: "أطقم أعمدة كاملة — بدن مخدد وتاج من الدوري إلى الكورنثي وقاعدة. تُركّب وتُثبّت في الموقع." },
    { name: "أقواس معمارية", tag: "أنظمة مداخل", detail: "أطقم أقواس نصف دائرية وقطعية بأحجار مقطوعة بدقة وحجر مفتاح وكتل ارتكاز وإطار قوس." },
    { name: "درابزين", tag: "حواجز", detail: "درابزين بأعمدة مخروطة للشرفات والمصاطب والأدراج. الأعمدة والقضبان تُورّد كطقم." },
    { name: "إطارات نوافذ", tag: "زخارف الواجهة", detail: "إطارات نوافذ وأبواب مع عتبة وقوائم وحجر مفتاح. تؤطّر أي فتحة بتفاصيل كلاسيكية." },
  ],
};

const DICT = { en: EN, ar: AR };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: typeof EN; dir: "ltr" | "rtl" };
const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {}, t: EN, dir: "ltr" });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = (localStorage.getItem("bh_lang") as Lang) || "en";
    setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => { localStorage.setItem("bh_lang", l); setLangState(l); };

  return (
    <LangCtx.Provider value={{ lang, setLang, t: DICT[lang], dir: lang === "ar" ? "rtl" : "ltr" }}>
      {children}
    </LangCtx.Provider>
  );
}

export const useLang = () => useContext(LangCtx);
