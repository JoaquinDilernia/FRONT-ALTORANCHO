// Datos fijos de la tienda, tomados del footer de altorancho.com.

export const STORES = [
  { name: "Las Lomas de San Isidro", map: "https://maps.app.goo.gl/McuRM1RAmS7A9MRq9" },
  { name: "Belgrano", map: "https://maps.app.goo.gl/3LK16Zu5ZRRpKnjp6" },
  { name: "Alcorta Shopping", detail: "Lighting studio", map: "https://maps.app.goo.gl/CfLqKqwZhybgDZQF8" },
];

export const WHATSAPP = "https://wa.me/541131440631";

export const INFO_LINKS = [
  { label: "Cómo comprar", href: "/ayuda/como-comprar" },
  { label: "Preguntas frecuentes", href: "/ayuda/preguntas-frecuentes" },
  { label: "Cambios y devoluciones", href: "/ayuda/cambios-y-devoluciones" },
  { label: "Cuidados y recomendaciones", href: "/ayuda/cuidados-y-recomendaciones" },
  { label: "Profesionales y decoradores", href: "https://deco.altorancho.com/" },
  { label: "Mayorista", href: "https://loginmayorista.altorancho.com/" },
];

export const SOCIAL = [
  { label: "Instagram", href: "https://www.instagram.com/altoranchocom" },
  { label: "Facebook", href: "https://www.facebook.com/altoranchocom/" },
  { label: "Pinterest", href: "https://www.pinterest.com/altoranchocom/" },
  { label: "TikTok", href: "https://www.tiktok.com/@altoranchocom" },
];

const PAY = "https://d26lpennugtm8s.cloudfront.net/assets/common/img/logos/payment/new_logos_payment";
export const PAYMENTS = [
  ["Visa", `${PAY}/visa@2x.png`],
  ["Mastercard", `${PAY}/mastercard@2x.png`],
  ["American Express", `${PAY}/amex@2x.png`],
  ["Diners", `${PAY}/diners@2x.png`],
  ["Naranja", `${PAY}/ar/tarjeta-naranja@2x.png`],
  ["Cabal", `${PAY}/ar/cabal@2x.png`],
  ["Argencard", `${PAY}/ar/argencard@2x.png`],
  ["Visa débito", `${PAY}/visadebit@2x.png`],
  ["Maestro", `${PAY}/maestro@2x.png`],
  ["Cabal débito", `${PAY}/ar/cabaldebit@2x.png`],
  ["Link", `${PAY}/ar/link@2x.png`],
  ["Banelco", `${PAY}/ar/banelco@2x.png`],
  ["Provincia NET", `${PAY}/ar/provincianet@2x.png`],
] as const;

export const FREE_SHIPPING_FROM = 600000;
