import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryTree, getProduct, inStock, money, priceOf, searchProducts, sized, type CategoryNode, type Product } from "@/lib/tiendanube";
import { getVariantGroups, type Group } from "@/lib/variantGroups";
import { getCombosForProduct } from "@/lib/combos";
import ComboCard from "@/components/ComboCard";
import ProductView from "@/components/ProductView";
import ProductRail from "@/components/Rail";
import RecentlyViewed, { TrackView } from "@/components/RecentlyViewed";

// Igual que el módulo Ficha técnica: la última foto es la ficha en SKUs M e I.
const TECH_SHEET_PREFIXES = ["M", "I"];

// Palabras del nombre que describen el tipo de producto y no la línea.
const GENERIC = new Set(
  "silla sillas sillon sillón mesa mesas comedor ratona rectangular cuadrada redonda arrime individual doble banco banqueta set lampara lámpara inalambrica inalámbrica velador de del la el con para x2 x4 x6 x12 mediana mediano grande chica baja alta pack vela escritorio perchero almohadon almohadón manta alfombra".split(" "),
);

function cleanDescription(html = "") {
  return html
    .replace(/<(script|style|iframe)[\s\S]*?<\/\1>/gi, "")
    .replace(/<link[^>]*>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\sstyle="[^"]*"/gi, "");
}

function careFrom(html = "") {
  const m = html.match(/Cuidados:\s*([^<]+)/i);
  return m ? m[1].trim() : null;
}

function techSheetOf(p: Product) {
  const sku = (p.variants[0]?.sku ?? "").toUpperCase();
  if (p.images.length < 2 || !TECH_SHEET_PREFIXES.some((x) => sku.startsWith(x))) return null;
  return p.images[p.images.length - 1].src;
}

// "Escritorio Sharp Petiribi" → "Sharp"; ignora el tipo de producto y el color.
function lineWord(p: Product, color?: string) {
  const colorWords = new Set((color ?? "").toLowerCase().split(/\s+/));
  return p.name
    .split(/\s+/)
    .slice(1)
    .find((w) => w.length >= 3 && /^[A-ZÁÉÍÓÚÑ]/.test(w) && !GENERIC.has(w.toLowerCase()) && !colorWords.has(w.toLowerCase()));
}

function findNode(nodes: CategoryNode[], id: number, parent: CategoryNode | null = null): { node: CategoryNode; parent: CategoryNode | null } | null {
  for (const n of nodes) {
    if (n.id === id) return { node: n, parent };
    const hit = findNode(n.children, id, n);
    if (hit) return hit;
  }
  return null;
}

// Una tarjeta por grupo de color, para que un carrusel no muestre la misma silla 5 veces.
function onePerGroup(list: Product[], groups: Record<string, Group>, skip: Set<string>) {
  const seen = new Set<string>();
  return list.filter((p) => {
    const key = groups[String(p.id)]?.groupKey ?? String(p.id);
    if (skip.has(String(p.id)) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const p = await getProduct((await params).handle);
  return { title: p ? `${p.name} — altorancho.` : "Producto no encontrado" };
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const handle = (await params).handle;
  const [product, groups, tree] = await Promise.all([getProduct(handle), getVariantGroups(), getCategoryTree().catch(() => [])]);
  if (!product) notFound();

  const group = groups[String(product.id)];
  const siblings = group?.siblings ?? [];
  const current = siblings.find((s) => s.productId === String(product.id));
  const skip = new Set([String(product.id), ...siblings.map((s) => s.productId)]);

  // Categoría más específica y sus "hermanas" (ej. Sillas de comedor → Mesas de comedor).
  const deepest = product.categories
    ?.map((c) => findNode(tree, c.id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort((a, b) => a.node.children.length - b.node.children.length)[0];
  const neighbours = (deepest?.parent?.children ?? []).filter((c) => c.id !== deepest?.node.id).slice(0, 3);
  const line = lineWord(product, current?.colorName);

  const [similar, lineProducts, complete, best, combos] = await Promise.all([
    deepest ? searchProducts({ categoryId: deepest.node.id, perPage: 30, sortBy: "best-selling" }).then((r) => r.data) : Promise.resolve([]),
    line ? searchProducts({ q: line, perPage: 30 }).then((r) => r.data.filter((p) => p.name.includes(line))) : Promise.resolve([]),
    Promise.all(neighbours.map((c) => searchProducts({ categoryId: c.id, perPage: 8, sortBy: "best-selling" }).then((r) => r.data))).then((l) => l.flat()),
    searchProducts({ sortBy: "best-selling", perPage: 30 }).then((r) => r.data),
    getCombosForProduct(product.id),
  ]);

  const lineList = onePerGroup(lineProducts, groups, skip).slice(0, 12);
  const { now } = priceOf(product.variants.find(inStock) ?? product.variants[0]);
  const parentCat = product.categories?.[0];

  return (
    <>
      <TrackView
        item={{ handle: product.handle, name: product.name, image: product.images[0] ? sized(product.images[0].src, 240) : "", price: money(now) }}
      />
      <div className="mx-auto max-w-[1440px] px-4 pt-6 lg:px-8">
        <nav aria-label="Ubicación" className="mb-5 text-[12.5px] text-ink-soft">
          <Link href="/" className="hover:text-ink">Inicio</Link>
          {parentCat && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/c/${parentCat.handle}`} className="hover:text-ink">{parentCat.name}</Link>
            </>
          )}
          {deepest && deepest.node.id !== parentCat?.id && (
            <>
              <span className="mx-2">/</span>
              <Link href={`/c/${deepest.node.handle}`} className="hover:text-ink">{deepest.node.name}</Link>
            </>
          )}
        </nav>
        <ProductView
          product={product}
          descriptionHtml={cleanDescription(product.description)}
          care={careFrom(product.description)}
          techSheet={techSheetOf(product)}
          siblings={siblings}
          comboCount={combos.length}
        />
      </div>

      {combos.length > 0 && (
        <section id="combos" className="mx-auto mt-16 max-w-[1440px] scroll-mt-6 px-4 lg:px-8">
          <h2 className="mb-6 text-[26px] font-semibold leading-none tracking-[-0.03em] md:text-[32px]">llevalo en combo.</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {combos.map((c) => <li key={c.id}><ComboCard combo={c} /></li>)}
          </ul>
        </section>
      )}

      {lineList.length >= 2 && <ProductRail title={`línea ${line}.`} href={`/buscar?q=${encodeURIComponent(line!)}`} products={lineList} />}
      <ProductRail
        title="completá el ambiente."
        href={deepest?.parent ? `/c/${deepest.parent.handle}` : undefined}
        products={onePerGroup(complete, groups, skip).slice(0, 12)}
      />
      <ProductRail
        title="similares."
        href={deepest ? `/c/${deepest.node.handle}` : undefined}
        products={onePerGroup(similar, groups, new Set([...skip, ...lineList.map((p) => String(p.id))])).slice(0, 12)}
      />
      <ProductRail title="los más elegidos." products={onePerGroup(best, groups, skip).slice(0, 12)} />
      <RecentlyViewed exclude={product.handle} />
    </>
  );
}
