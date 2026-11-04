import { z } from "zod";

// Forma del contenido que se edita desde /admin. Todo lo que se guarda pasa por acá,
// así un dato mal cargado no rompe la tienda (se rechaza al guardar).

const text = (max = 300) => z.string().trim().max(max);

// Links internos ("/c/sillas") o externos con https.
export const hrefSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("#") || (v.startsWith("/") && !v.startsWith("//")) || v.startsWith("https://"), {
    message: "El link tiene que empezar con / o con https://",
  });

// Imagen: código de media de Tiendanube ("cb6a2f05-_c6a6260"), una subida al panel o una URL https.
export const imageSchema = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || /^[\w.-]+$/.test(v) || v.startsWith("https://") || /^\/media\/[\w.-]+$/.test(v), {
    message: "Imagen inválida",
  });

const handle = z.string().trim().max(200).regex(/^[a-z0-9-]*$/i, "Categoría inválida");
const youtubeId = z.string().trim().regex(/^[\w-]{0,20}$/, "Código de YouTube inválido");

export const SORTS = {
  "best-selling": "Más vendidos",
  "created-at-descending": "Más nuevos",
  "price-ascending": "Menor precio",
  "price-descending": "Mayor precio",
} as const;
const sort = z.enum(Object.keys(SORTS) as [keyof typeof SORTS, ...(keyof typeof SORTS)[]]);

const link = z.object({ label: text(80), href: hrefSchema });

export const bannerSchema = z.object({
  title: text(120),
  copy: text(300),
  href: hrefSchema,
  image: imageSchema,
  /** versión vertical para celular */
  imageMobile: imageSchema,
  /** la foto ya trae el texto: no se le pone título encima */
  textInImage: z.boolean(),
  /** si tiene video, el banner muestra la miniatura y lo reproduce al tocar */
  videoId: youtubeId,
  cta: text(40),
});

const base = { id: z.string().min(1).max(40), visible: z.boolean() };

export const sectionSchema = z.discriminatedUnion("type", [
  z.object({
    ...base,
    type: z.literal("hero"),
    banner: bannerSchema,
    primary: link,
    actions: z.array(link).max(5),
    productsCategory: handle,
    productsTitle: text(60),
  }),
  z.object({
    ...base,
    type: z.literal("tiles"),
    items: z.array(z.object({ label: text(60), href: hrefSchema, image: imageSchema })).max(8),
  }),
  z.object({
    ...base,
    type: z.literal("rail"),
    title: text(80),
    href: hrefSchema,
    /** vacío = toda la tienda */
    category: handle,
    sort,
    count: z.number().int().min(4).max(24),
    autoLight: z.boolean(),
  }),
  z.object({ ...base, type: z.literal("video"), videoId: youtubeId, title: text(80), anchor: handle }),
  z.object({
    ...base,
    type: z.literal("cards"),
    items: z.array(z.object({ image: imageSchema, title: text(80), copy: text(160), href: hrefSchema })).max(8),
  }),
  z.object({
    ...base,
    type: z.literal("room"),
    image: imageSchema,
    /** ancho / alto de la foto */
    ratio: z.number().min(0.2).max(5),
    alt: text(200),
    title: text(80),
    copy: text(300),
    reverse: z.boolean(),
    hotspots: z
      .array(z.object({ handle: handle, x: z.number().min(0).max(100), y: z.number().min(0).max(100) }))
      .max(8),
  }),
  z.object({ ...base, type: z.literal("banner"), banner: bannerSchema }),
  z.object({
    ...base,
    type: z.literal("categories"),
    title: text(80),
    items: z.array(z.object({ handle: handle, label: text(40), image: imageSchema, highlight: z.boolean() })).max(12),
  }),
  z.object({ ...base, type: z.literal("sales"), title: text(80), href: hrefSchema, handles: z.array(handle).max(8) }),
  z.object({ ...base, type: z.literal("recent") }),
  z.object({ ...base, type: z.literal("benefits") }),
]);

export const homeSchema = z.object({ sections: z.array(sectionSchema).max(40) });

export const BENEFIT_ICONS = { truck: "Camión", card: "Tarjeta", bank: "Banco" } as const;

export const promosSchema = z.object({
  marquee: z.array(text(120)).max(10),
  benefits: z
    .array(
      z.object({
        icon: z.enum(Object.keys(BENEFIT_ICONS) as [keyof typeof BENEFIT_ICONS, ...(keyof typeof BENEFIT_ICONS)[]]),
        title: text(60),
        copy: text(120),
      }),
    )
    .min(1)
    .max(4),
});

export const helpSchema = z.object({
  pages: z
    .array(
      z.object({
        slug: z.string().regex(/^[a-z0-9-]+$/),
        title: text(80),
        intro: text(400),
        original: hrefSchema,
        body: z.array(z.object({ heading: text(120), text: z.array(text(4000)) })).max(40),
      }),
    )
    .max(20),
});

export const contentSchema = z.object({ home: homeSchema, promos: promosSchema, ayuda: helpSchema });

export type SiteContent = z.infer<typeof contentSchema>;
export type ContentKey = keyof SiteContent;
export type HomeSection = z.infer<typeof sectionSchema>;
export type SectionType = HomeSection["type"];
export type BannerContent = z.infer<typeof bannerSchema>;
export type Promos = z.infer<typeof promosSchema>;
export type HelpContent = z.infer<typeof helpSchema>;

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Banner principal",
  tiles: "Accesos con foto",
  rail: "Carrusel de productos",
  video: "Video",
  cards: "Fotos con título",
  room: "Foto con productos marcados",
  banner: "Banner",
  categories: "Comprá por categoría",
  sales: "Sales",
  recent: "Vistos recientemente",
  benefits: "Beneficios",
};
