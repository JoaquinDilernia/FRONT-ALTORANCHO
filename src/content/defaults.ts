import type { SiteContent } from "./schema";
import { VIDEOS } from "./site";
import { HELP_PAGES } from "./ayuda";

// Contenido de arranque: lo que la tienda muestra mientras nadie guardó cambios en /admin.
// Es la misma home y los mismos textos que estaban escritos en el código.

const emptyBanner = { copy: "", imageMobile: "", textInImage: false, videoId: "", cta: "" };

export const DEFAULT_CONTENT: SiteContent = {
  home: {
    sections: [
      {
        id: "hero",
        type: "hero",
        visible: true,
        banner: {
          ...emptyBanner,
          title: "New in. Lámparas inalámbricas",
          copy: "Sin cables, del living a la galería.",
          href: "/c/lamparas-inalambricas",
          image: "3f506fbd-bannerinalambricas_home-01",
          imageMobile: "d90c04fe-bannerinalambricas_home-02",
          textInImage: true,
        },
        primary: { label: "Comprar lámparas inalámbricas", href: "/c/lamparas-inalambricas" },
        actions: [
          { label: "Las más vendidas", href: "/c/lamparas-inalambricas?orden=best-selling#productos" },
          { label: "Menor precio", href: "/c/lamparas-inalambricas?orden=price-ascending#productos" },
          { label: "Ver el video", href: "#video-getaway" },
        ],
        productsCategory: "lamparas-inalambricas",
        productsTitle: "Las más elegidas",
      },
      {
        id: "spotlight",
        type: "tiles",
        visible: true,
        items: [
          { label: "New in", href: "/c/new-in-1gtoi", image: "2d0b160b-lmparahongoarayasenjardn" },
          { label: "Mushrooms", href: "/c/mushroom", image: "264e50eb-altorancho-fresh-368" },
          { label: "Mini size", href: "/c/mini-size-15xo8", image: "93438e41-altorancho-fresh-477" },
          { label: "Outdoor", href: "/c/outdoor1", image: "606a49a8-altorancho-timeless-479" },
        ],
      },
      {
        id: "new-in",
        type: "rail",
        visible: true,
        title: "New in | Lámparas inalámbricas",
        href: "/c/new-in-1gtoi",
        category: "new-in-1gtoi",
        sort: "created-at-descending",
        count: 12,
        autoLight: true,
      },
      { id: "video-getaway", type: "video", visible: true, videoId: VIDEOS.getaway.id, title: VIDEOS.getaway.title, anchor: "video-getaway" },
      {
        id: "getaway",
        type: "cards",
        visible: true,
        items: [
          { image: "cb6a2f05-_c6a6260", title: "The Getaway Club.", copy: "La colección de exterior completa.", href: "/c/the-getaway-club" },
          { image: "f1f2c4ac-_c6a5923", title: "Tendencia Timeless.", copy: "Negro, vidrio y flores blancas.", href: "/c/tendencia-timeless" },
          { image: "9361c8bc-_c6a6103", title: "Tendencia Iconic.", copy: "Piezas con carácter propio.", href: "/c/tendencia-iconic" },
          { image: "b7d4a3bf-img_0003_1_vertical", title: "Tendencia Fresh.", copy: "Tonos claros para comer afuera.", href: "/c/tendencia-fresh" },
        ],
      },
      { id: "muebles", type: "rail", visible: true, title: "Muebles", href: "/c/muebles1", category: "muebles1", sort: "best-selling", count: 12, autoLight: false },
      {
        id: "room-comedor",
        type: "room",
        visible: true,
        image: "cb6a2f05-_c6a6260",
        ratio: 480 / 533,
        alt: "Comedor exterior con sillas Menorca y mesa Urban en tono malbec",
        title: "armá tu comedor afuera.",
        copy: "Sillas Menorca y mesa Urban de chapa, pensadas para quedarse en la galería todo el año.",
        reverse: false,
        hotspots: [
          { handle: "silla-con-estructura-metalica-y-tejido-en-asiento-y-respaldo-vino-yuxok", x: 22, y: 64 },
          { handle: "mesa-rectangular-de-chapa-color-malbec-1pu7l", x: 64, y: 44 },
        ],
      },
      { id: "sillas", type: "rail", visible: true, title: "Sillas", href: "/c/sillas2", category: "sillas2", sort: "best-selling", count: 12, autoLight: false },
      {
        id: "banner-rey",
        type: "banner",
        visible: true,
        banner: {
          ...emptyBanner,
          title: "The beauty of simplicity.",
          href: "/c/silla-rey",
          image: "b0043677-bannerprincipal_sillarey-03",
          imageMobile: "d203f2d3-bannerprincipal_sillarey-04",
          textInImage: true,
        },
      },
      { id: "silla-rey", type: "rail", visible: true, title: "Silla Rey", href: "/c/silla-rey", category: "silla-rey", sort: "best-selling", count: 12, autoLight: false },
      {
        id: "categorias",
        type: "categories",
        visible: true,
        title: "comprá por categoría.",
        items: [
          { handle: "muebles", label: "Muebles", image: "", highlight: false },
          { handle: "sillas", label: "Sillas", image: "", highlight: false },
          { handle: "iluminacion41", label: "Iluminación", image: "", highlight: false },
          { handle: "bazar", label: "Bazar", image: "", highlight: false },
          { handle: "textil", label: "Textil", image: "", highlight: false },
          { handle: "decoracion", label: "Decoración", image: "", highlight: false },
          { handle: "sale", label: "SALE", image: "", highlight: true },
        ],
      },
      {
        id: "room-living",
        type: "room",
        visible: true,
        image: "8d2a1445-_c6a6112",
        ratio: 480 / 320,
        alt: "Sillones Fold y mesa ratona Urban sobre el pasto",
        title: "un living bajo los árboles.",
        copy: "Sillones Fold de chapa plegada y mesa ratona Urban. Livianos para moverlos a la sombra.",
        reverse: true,
        hotspots: [
          { handle: "sillon-individual-de-chapa-plegada-greige-1k04n", x: 20, y: 56 },
          { handle: "mesa-ratona-rectangular-de-chapa-greige-978zw", x: 46, y: 62 },
          { handle: "sillon-doble-de-chapa-plegada-greige-opw7q", x: 62, y: 46 },
        ],
      },
      {
        id: "sales",
        type: "sales",
        visible: true,
        title: "sale.",
        href: "/c/sale",
        handles: ["hasta-30-off-en-sillas", "hasta-30-off-en-iluminacion", "hasta-40-off-en-muebles", "hasta-40-off-en-deco-bazar"],
      },
      { id: "mas-elegidos", type: "rail", visible: true, title: "los más elegidos.", href: "/buscar?orden=best-selling", category: "", sort: "best-selling", count: 12, autoLight: false },
      { id: "recent", type: "recent", visible: true },
      { id: "benefits", type: "benefits", visible: true },
    ],
  },
  promos: {
    marquee: [
      "3 cuotas sin interés",
      "6 cuotas sin interés superando $300.000",
      "12 cuotas sin interés superando $600.000",
      "20% off por transferencia",
    ],
    benefits: [
      { icon: "truck", title: "Envío gratis al AMBA", copy: "En compras mayores a $600.000" },
      { icon: "card", title: "Cuotas sin interés", copy: "12 cuotas sin interés a partir de $600.000" },
      { icon: "bank", title: "Pago por transferencia", copy: "20% off por transferencia bancaria" },
    ],
  },
  ayuda: {
    pages: HELP_PAGES.map((p) => ({ slug: p.slug, title: p.title, intro: p.intro, original: p.original, body: p.body ?? [] })),
  },
};
