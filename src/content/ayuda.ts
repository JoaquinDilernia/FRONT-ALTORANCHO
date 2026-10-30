// Páginas de ayuda de altorancho.com. Solo lleva datos confirmados de la tienda;
// el texto de cada política se copia de la web actual (`body`) cuando esté abierta.
// Mientras `body` esté vacío la página muestra lo confirmado y el link a la original.

export type HelpPage = {
  slug: string;
  title: string;
  intro: string;
  original: string;
  body?: { heading: string; text: string[] }[];
};

export const HELP_PAGES: HelpPage[] = [
  {
    slug: "como-comprar",
    title: "Cómo comprar",
    intro: "Elegí tus productos, sumalos al carrito y pagá con tarjeta, débito o transferencia.",
    original: "https://altorancho.com/como-comprar/",
  },
  {
    slug: "preguntas-frecuentes",
    title: "Preguntas frecuentes",
    intro: "Envíos, medios de pago, stock y retiro en los locales.",
    original: "https://altorancho.com/preguntas-frecuentes/",
  },
  {
    slug: "cambios-y-devoluciones",
    title: "Cambios y devoluciones",
    intro: "Cómo pedir un cambio o una devolución de tu compra.",
    original: "https://altorancho.com/politica-de-cambio-y-devolucion/",
  },
  {
    slug: "cuidados-y-recomendaciones",
    title: "Cuidados y recomendaciones",
    intro: "Cómo limpiar y conservar muebles, textiles e iluminación.",
    original: "https://altorancho.com/cuidados-y-recomendaciones/",
  },
];

export const helpPage = (slug: string) => HELP_PAGES.find((p) => p.slug === slug);
