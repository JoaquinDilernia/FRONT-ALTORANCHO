// Combos del módulo de PromoNube (endpoints públicos de solo lectura).

const STORE_ID = process.env.TN_STORE_ID ?? "2547699";
const API = "https://glowlab-production.up.railway.app/api";

export type ComboOption = {
  productId: string;
  variantId: number;
  name: string;
  colorName: string;
  colors: string[];
  image: string;
  price: number | string;
  available: boolean;
  url: string;
  handle: string;
};
export type ComboItem = { label: string; quantity: number; options: ComboOption[] };
export type Combo = {
  id: string;
  slug: string;
  name: string;
  discountPercent: number;
  includesText?: string;
  shortDescription?: string;
  description?: string;
  images?: string[];
  from?: number;
  was?: number;
  items: ComboItem[];
};

const handleFromUrl = (url = "") => decodeURIComponent(url.match(/\/productos\/([^/?#]+)/)?.[1] ?? "");

function normalize(c: Combo): Combo {
  return {
    ...c,
    items: c.items.map((it) => ({ ...it, options: it.options.map((o) => ({ ...o, handle: handleFromUrl(o.url) })) })),
  };
}

async function get<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 120 } });
    return res.ok ? ((await res.json()) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function getCombosPage() {
  const data = await get<{ pageTitle?: string; pageIntro?: string; combos: Combo[] }>(`/combos-page.json?store=${STORE_ID}`, { combos: [] });
  return { ...data, combos: data.combos.map(normalize) };
}

export async function getCombosForProduct(productId: number) {
  const data = await get<{ combos: Combo[] }>(`/combos-data.json?store=${STORE_ID}&product=${productId}`, { combos: [] });
  return data.combos.map(normalize);
}

// Precio de un combo con una opción elegida por pieza.
export function comboTotal(items: ComboItem[], picks: number[], discountPercent: number) {
  const was = items.reduce((sum, it, i) => sum + Number(it.options[picks[i]]?.price ?? 0) * it.quantity, 0);
  return { was, now: Math.round(was * (1 - discountPercent / 100)) };
}
