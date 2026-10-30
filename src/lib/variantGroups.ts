// Grupos de variantes de PromoNube (endpoint público de solo lectura).
// En Alto Rancho cada color es un producto aparte; esto los vuelve a juntar.

const STORE_ID = process.env.TN_STORE_ID ?? "2547699";
const URL_DATA = `https://glowlab-production.up.railway.app/api/variant-groups-data.json?store=${STORE_ID}`;

export type Sibling = {
  productId: string;
  handle: string;
  image: string;
  colorName: string;
  colors: string[];
  swatchImage?: string;
  active?: boolean;
};
export type Group = { groupKey: string; siblings: Sibling[] };
export type GroupIndex = Record<string, Group>;

type RawSibling = Omit<Sibling, "handle"> & { url: string };

// El JSON pesa más de 2MB (límite del cache de Next), así que se guarda en memoria.
const TTL = 10 * 60 * 1000;
let cached: { at: number; data: Promise<GroupIndex> } | null = null;

export function getVariantGroups(): Promise<GroupIndex> {
  if (!cached || Date.now() - cached.at > TTL) cached = { at: Date.now(), data: load() };
  return cached.data;
}

async function load(): Promise<GroupIndex> {
  try {
    const res = await fetch(URL_DATA, { cache: "no-store" });
    if (!res.ok) return {};
    const raw = (await res.json()) as Record<string, { groupKey: string; siblings: RawSibling[] }>;
    const out: GroupIndex = {};
    for (const [id, g] of Object.entries(raw)) {
      out[id] = {
        groupKey: g.groupKey,
        siblings: g.siblings.map(({ url, ...s }) => ({
          ...s,
          handle: decodeURIComponent(url.match(/\/productos\/([^/]+)\/?/)?.[1] ?? ""),
        })),
      };
    }
    return out;
  } catch {
    return {};
  }
}

export function swatchBackground(s: Pick<Sibling, "colors" | "swatchImage">) {
  if (s.swatchImage) return `url(${s.swatchImage}) center / cover no-repeat`;
  const [a, b] = s.colors;
  if (!a) return undefined;
  return b ? `linear-gradient(135deg, ${a} 50%, ${b} 50%)` : a;
}
