// Contenido editorial tomado de altorancho.com (home, banners, videos del canal de YouTube).
// Es el lugar para cambiar banners y textos sin tocar los componentes.

const MEDIA = "https://acdn-us.mitiendanube.com/stores/002/547/699/media";
export const media = (id: string, w: 640 | 1024 | 1400 | 1920 = 1400) => `${MEDIA}/${id}/webp/${w}.webp`;
export const mediaSet = (id: string) => ([640, 1024, 1400, 1920] as const).map((w) => `${media(id, w)} ${w}w`).join(", ");

// Barra superior con el mismo texto que corre en la web actual.
export const MARQUEE = [
  "3 cuotas sin interés",
  "6 cuotas sin interés superando $300.000",
  "12 cuotas sin interés superando $600.000",
  "20% off por transferencia",
];

export const BENEFITS = [
  { icon: "truck", title: "Envío gratis al AMBA", copy: "En compras mayores a $600.000" },
  { icon: "card", title: "Cuotas sin interés", copy: "12 cuotas sin interés a partir de $600.000" },
  { icon: "bank", title: "Pago por transferencia", copy: "20% off por transferencia bancaria" },
] as const;

export const TRANSFER_DISCOUNT = 0.2;

// Videos del canal youtube.com/@altoranchocom
export const VIDEOS = {
  getaway: { id: "ZDxuV-Hv1Po", title: "The Getaway Club." },
  getawayAlt: { id: "OO613rogukw", title: "The Getaway Club." },
  muebles: { id: "Si66B0XWEzM", title: "Muebles" },
  iluminacion: { id: "Yu33ZhnAPgs", title: "Iluminación" },
  sillas: { id: "CllGhW9ogNQ", title: "Alto. en sillas" },
  cozy: { id: "OGfuf9dIzew", title: "Cozy Edit. Otoño invierno 2026" },
  urban: { id: "-0_TUUPdHY0", title: "Nueva línea de exterior Urban" },
  navidad: { id: "JEgw6_iK4jA", title: "Navidad" },
} as const;

export type Video = { id: string; title: string };

export type Banner = {
  title: string;
  copy?: string;
  href: string;
  image?: string; // media id de TN
  video?: Video;
  cta?: string;
};

// Banner principal de cada categoría raíz (las subcategorías heredan el de su raíz).
export const CATEGORY_HERO: Record<string, Banner> = {
  "the-getaway-club": { title: "The Getaway Club.", copy: "La colección de exterior: chapa, tejidos y luz inalámbrica.", href: "/c/the-getaway-club", video: VIDEOS.getaway },
  muebles: { title: "Muebles", copy: "Living, comedor, dormitorio y home office.", href: "/c/muebles", video: VIDEOS.muebles },
  sillas: { title: "Alto. en sillas", copy: "Todas en un solo lugar.", href: "/c/sillas", video: VIDEOS.sillas },
  iluminacion41: { title: "Iluminación", copy: "Veladores, colgantes, de pie y la línea inalámbrica.", href: "/c/iluminacion41", video: VIDEOS.iluminacion },
  bazar: { title: "Cozy Edit.", copy: "Color, textura y calma para la mesa.", href: "/c/bazar", video: VIDEOS.cozy },
  textil: { title: "Cozy Edit.", copy: "Mantas, almohadones y alfombras para el invierno.", href: "/c/textil", video: VIDEOS.cozy },
  decoracion: { title: "Cozy Edit.", copy: "Floreros, velas y objetos con textura.", href: "/c/decoracion", video: VIDEOS.cozy },
  "lamparas-inalambricas": { title: "New in. Lámparas inalámbricas", copy: "Sin cables, del living a la galería.", href: "/c/lamparas-inalambricas", image: "3f506fbd-bannerinalambricas_home-01" },
  "silla-rey": { title: "The beauty of simplicity.", href: "/c/silla-rey", image: "b0043677-bannerprincipal_sillarey-03" },
  navidad1: { title: "Navidad", copy: "Adornos y luces para armar el árbol.", href: "/c/navidad1", video: VIDEOS.navidad },
};

// Banners que se intercalan entre filas del listado, por categoría raíz.
export const CATEGORY_INLINE: Record<string, Banner[]> = {
  "the-getaway-club": [
    { title: "Tendencia Fresh.", copy: "Tonos claros para comer afuera.", href: "/c/tendencia-fresh", image: "b7d4a3bf-img_0003_1_vertical", cta: "Ver tendencia" },
    { title: "Nueva línea Urban.", copy: "Mesas y bancos de chapa para exterior.", href: "/buscar?q=urban", video: VIDEOS.urban },
    { title: "Tendencia Iconic.", copy: "Malbec, azul profundo y rayas.", href: "/c/tendencia-iconic", image: "9361c8bc-_c6a6103", cta: "Ver tendencia" },
  ],
  muebles: [
    { title: "Nueva línea Urban.", copy: "Mesas y bancos de chapa para exterior.", href: "/buscar?q=urban", video: VIDEOS.urban },
    { title: "Un living bajo los árboles.", copy: "Sillones Fold y mesa ratona Urban.", href: "/buscar?q=fold", image: "a4031d72-newletter_summer", cta: "Ver la línea Fold" },
    { title: "Tendencia Timeless.", copy: "Negro, vidrio y flores blancas.", href: "/c/tendencia-timeless", image: "f1f2c4ac-_c6a5923", cta: "Ver tendencia" },
  ],
  sillas: [
    { title: "The beauty of simplicity.", copy: "Silla Rey, de madera maciza, en seis colores.", href: "/c/silla-rey", image: "b0043677-bannerprincipal_sillarey-03", cta: "Ver Silla Rey" },
    { title: "Sillas Menorca.", copy: "Tejido y metal para el comedor de afuera.", href: "/buscar?q=menorca", image: "cb6a2f05-_c6a6260", cta: "Ver la línea" },
    { title: "Tendencia Iconic.", copy: "Sillas con carácter para la galería.", href: "/c/tendencia-iconic", image: "9361c8bc-_c6a6103", cta: "Ver tendencia" },
  ],
  iluminacion41: [
    { title: "New in. Lámparas inalámbricas", copy: "Sin cables, del living a la galería.", href: "/c/lamparas-inalambricas", image: "3f506fbd-bannerinalambricas_home-01", cta: "Ver todas" },
    { title: "Mushrooms.", copy: "La forma hongo en vidrio, metal y rayas.", href: "/c/mushroom", image: "264e50eb-altorancho-fresh-368", cta: "Ver más" },
    { title: "Mini size.", copy: "Chiquitas para la mesa de luz o el escritorio.", href: "/c/mini-size-15xo8", image: "93438e41-altorancho-fresh-477", cta: "Ver más" },
  ],
  bazar: [{ title: "Cozy Edit.", copy: "Otoño invierno 2026: color, textura, calma.", href: "/c/bazar", video: VIDEOS.cozy }],
  textil: [{ title: "Cozy Edit.", copy: "Otoño invierno 2026: color, textura, calma.", href: "/c/textil", video: VIDEOS.cozy }],
  decoracion: [
    { title: "Navidad.", copy: "Adornos y luces para el árbol.", href: "/c/navidad1", video: VIDEOS.navidad },
    { title: "Cozy Edit.", copy: "Otoño invierno 2026: color, textura, calma.", href: "/c/decoracion", video: VIDEOS.cozy },
  ],
};

// Fotos del megamenú: hasta dos por categoría. Las que no están acá se completan con
// la foto de ambiente del producto más vendido de cada subcategoría.
export const MENU_PHOTOS: Record<string, { label: string; href: string; image: string }[]> = {
  "the-getaway-club": [
    { label: "Tendencia Fresh.", href: "/c/tendencia-fresh", image: "b7d4a3bf-img_0003_1_vertical" },
    { label: "Tendencia Timeless.", href: "/c/tendencia-timeless", image: "f1f2c4ac-_c6a5923" },
  ],
  iluminacion41: [
    { label: "Lámparas inalámbricas", href: "/c/lamparas-inalambricas", image: "264e50eb-altorancho-fresh-368" },
    { label: "Mushrooms", href: "/c/mushroom", image: "93438e41-altorancho-fresh-477" },
  ],
  sillas: [
    { label: "Sillas Menorca", href: "/buscar?q=menorca", image: "cb6a2f05-_c6a6260" },
    { label: "Tendencia Iconic.", href: "/c/tendencia-iconic", image: "9361c8bc-_c6a6103" },
  ],
};
