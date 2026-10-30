// Cliente de solo lectura para la Storefront API de Tiendanube.
// Nunca escribe nada en la tienda: solo GET de catálogo.

const STORE_ID = process.env.TN_STORE_ID ?? "2547699";
const BASE = `https://storefront-api.tiendanube.com/2026-11/stores/${STORE_ID}`;
const REVALIDATE = 300;

export type Image = { id: number; src: string; alt: string; width: number; height: number };
export type Variant = {
  id: number;
  image_id: number | null;
  price: string;
  price_without_taxes?: string | null;
  promotional_price: string | null;
  compare_at_price: string | null;
  stock: number | null;
  stock_management: boolean;
  sku: string | null;
  values: string[];
  width: string | null;
  height: string | null;
  depth: string | null;
  weight: string | null;
};
export type Product = {
  id: number;
  name: string;
  handle: string;
  description?: string;
  images: Image[];
  variants: Variant[];
  attributes?: string[];
  categories?: { id: number; name: string; handle: string }[];
  free_shipping?: boolean;
  tags?: string;
};
export type Category = {
  id: number;
  name: string;
  handle: string;
  parent: number | null;
  subcategories: number[];
  visibility: string;
};
export type CategoryNode = Category & { children: CategoryNode[] };
export type Facet = {
  id: string;
  label: string | null;
  source: string;
  type: string;
  presentation: string | null;
  values?: { label: string; count: number; selected: boolean; input: string; swatch?: { color?: string } }[];
  min?: number;
  max?: number;
};
type Page<T> = { data: T[]; pagination: { page: number; per_page: number; total: number; total_pages: number } };

const CARD_FIELDS = "id,name,handle,images,variants,categories";
const PDP_FIELDS = "id,name,handle,description,images,variants,attributes,categories,free_shipping,tags";

async function get<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  const res = await fetch(url, { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`Storefront API ${res.status} en ${path}`);
  return res.json() as Promise<T>;
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
  const all: Category[] = [];
  for (let page = 1; page <= 5; page++) {
    const res = await get<Page<Category>>("/categories", {
      fields: "id,name,handle,parent,subcategories,visibility",
      per_page: 200,
      page,
    });
    all.push(...res.data);
    if (page >= res.pagination.total_pages) break;
  }
  const visible = all.filter((c) => c.visibility === "visible");
  const byId = new Map<number, CategoryNode>(visible.map((c) => [c.id, { ...c, children: [] }]));
  const roots: CategoryNode[] = [];
  for (const c of visible) {
    const node = byId.get(c.id)!;
    const parent = c.parent ? byId.get(c.parent) : undefined;
    if (!c.parent) roots.push(node);
    else if (parent) parent.children.push(node);
  }
  // Respeta el orden en que la tienda lista las subcategorías.
  for (const node of byId.values()) {
    const order = new Map(node.subcategories.map((id, i) => [id, i]));
    node.children.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }
  return roots;
}

export async function getCategoryByHandle(handle: string): Promise<Category | null> {
  const res = await get<Page<Category>>("/categories", {
    handle,
    fields: "id,name,handle,parent,subcategories,visibility",
  });
  return res.data[0] ?? null;
}

export type SearchParams = {
  q?: string;
  categoryId?: number;
  sortBy?: string;
  page?: number;
  perPage?: number;
  filters?: Record<string, string>;
  facets?: boolean;
  minPrice?: number;
  maxPrice?: number;
};

export async function searchProducts(p: SearchParams) {
  const params: Record<string, string | number | undefined> = {
    fields: CARD_FIELDS,
    q: p.q,
    category_id: p.categoryId,
    sort_by: p.sortBy,
    page: p.page,
    per_page: p.perPage ?? 24,
    facets: p.facets ? "true" : undefined,
    min_price: p.minPrice,
    max_price: p.maxPrice,
  };
  for (const [k, v] of Object.entries(p.filters ?? {})) params[`filter[${k}]`] = v;
  try {
    return await get<Page<Product> & { facets?: Facet[]; sort_by?: string }>("/search/products", params);
  } catch {
    return { data: [], pagination: { page: 1, per_page: 24, total: 0, total_pages: 0 }, facets: [] };
  }
}

export async function getProduct(handle: string): Promise<Product | null> {
  try {
    return await get<Product>(`/products/${encodeURIComponent(handle)}`, { fields: PDP_FIELDS });
  } catch {
    return null;
  }
}

// ---- helpers de presentación ----

const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
export const money = (v: string | number | null | undefined) => (v == null ? "" : ars.format(Number(v)));

export function priceOf(v: Variant | undefined) {
  if (!v) return { now: 0, before: null as number | null, off: 0 };
  const price = Number(v.price);
  const promo = v.promotional_price ? Number(v.promotional_price) : null;
  const compare = v.compare_at_price ? Number(v.compare_at_price) : null;
  const now = promo && promo < price ? promo : price;
  const ref = promo && promo < price ? price : compare && compare > price ? compare : null;
  return { now, before: ref, off: ref ? Math.round((1 - now / ref) * 100) : 0 };
}

// Todo lo que cuelga de Iluminación tiene foto apagada (1ª) y prendida (2ª).
export const isLighting = (p: Pick<Product, "categories">) => Boolean(p.categories?.some((c) => c.handle === "iluminacion41"));

export const inStock = (v: Variant) => !v.stock_management || (v.stock ?? 0) > 0;

// El CDN de TN solo sirve estos tamaños: -240-0, -480-0, -640-0 y -1024-1024.
export function sized(src: string, w: 240 | 480 | 640 | 1024) {
  return src.replace(/-\d+-\d+(\.\w+)$/, w === 1024 ? "-1024-1024$1" : `-${w}-0$1`);
}

export const srcSet = (src: string) =>
  ([240, 480, 640, 1024] as const).map((w) => `${sized(src, w)} ${w}w`).join(", ");
