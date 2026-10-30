import Link from "next/link";
import { Fragment } from "react";
import { isLighting, money, searchProducts, type Facet } from "@/lib/tiendanube";
import { getVariantGroups } from "@/lib/variantGroups";
import ProductCard from "./ProductCard";
import { FiltersPanel, SortSelect } from "./ListingControls";
import BannerMedia from "./BannerMedia";
import BenefitsStrip from "./BenefitsStrip";
import HeroActions from "./HeroActions";
import { LightsToggle } from "./LightSwitch";
import type { Banner } from "@/content/site";

export type SubTile = { id: number; name: string; handle: string; image?: string };

// 36 por página para que los banners caigan después de filas completas (12 y 24 entran en 2, 3 y 4 columnas).
const PER_PAGE = 36;
const BANNER_AFTER = [12, 24];

export type Query = Record<string, string | string[] | undefined>;

const SORTS = [
  ["best-selling", "Más vendidos"],
  ["created-at-descending", "Más nuevos"],
  ["price-ascending", "Menor precio"],
  ["price-descending", "Mayor precio"],
  ["alpha-ascending", "A – Z"],
] as const;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function readFilters(q: Query) {
  const filters: Record<string, string> = {};
  for (const [k, v] of Object.entries(q)) {
    const m = k.match(/^filter\[(.+)\]$/);
    if (m && one(v)) filters[m[1]] = one(v)!;
  }
  return filters;
}

function withParams(basePath: string, q: Query, patch: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) if (one(v)) sp.set(k, one(v)!);
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) sp.delete(k);
    else sp.set(k, v);
  }
  if (!("page" in patch)) sp.delete("page");
  const s = sp.toString();
  return s ? `${basePath}?${s}` : basePath;
}

export default async function Listing({
  basePath,
  query,
  categoryId,
  title,
  breadcrumb,
  hero,
  inline = [],
  subTiles = [],
}: {
  basePath: string;
  query: Query;
  categoryId?: number;
  title: string;
  breadcrumb?: { label: string; href: string }[];
  hero?: Banner;
  inline?: Banner[];
  subTiles?: SubTile[];
}) {
  const page = Math.max(1, Number(one(query.page)) || 1);
  const sortBy = one(query.orden) ?? (one(query.q) ? undefined : "best-selling");
  const sub = Number(one(query.sub)) || undefined;
  const filters = readFilters(query);
  const minPrice = Number(one(query.desde)) || undefined;
  const maxPrice = Number(one(query.hasta)) || undefined;
  const groupsP = getVariantGroups();
  // Productos para la franja del banner: los más nuevos, así no repiten el arranque del listado.
  const heroProductsP = hero && page === 1 && categoryId
    ? searchProducts({ categoryId, sortBy: "created-at-descending", perPage: 4 }).then((r) => r.data)
    : Promise.resolve([]);
  const res = await searchProducts({
    q: one(query.q),
    categoryId: sub ?? categoryId,
    sortBy,
    page,
    perPage: PER_PAGE,
    filters,
    facets: true,
    minPrice,
    maxPrice: maxPrice && minPrice && maxPrice < minPrice ? undefined : maxPrice,
  });
  const [groups, heroProducts] = await Promise.all([groupsP, heroProductsP]);
  const facets = (res.facets ?? []).filter((f: Facet) => f.values?.length);
  const subLabel = sub
    ? res.facets?.find((f) => f.source === "category")?.values?.find((v) => v.input.endsWith(`=${sub}`))?.label ?? "Subcategoría"
    : null;
  const chips = [
    ...Object.entries(filters).map(([k, v]) => ({ label: v, href: withParams(basePath, query, { [`filter[${k}]`]: undefined }) })),
    ...(subLabel ? [{ label: subLabel, href: withParams(basePath, query, { sub: undefined }) }] : []),
    ...(minPrice || maxPrice
      ? [{ label: `${minPrice ? money(minPrice) : "$0"} a ${maxPrice ? money(maxPrice) : "más"}`, href: withParams(basePath, query, { desde: undefined, hasta: undefined }) }]
      : []),
  ];
  const priceFacet = res.facets?.find((f) => f.type === "price_range");
  const q = one(query.q);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-6 lg:px-8">
      {breadcrumb && (
        <nav aria-label="Ubicación" className="text-[12.5px] text-ink-soft">
          {breadcrumb.map((b, i) => (
            <span key={b.href}>
              {i > 0 && <span className="mx-2">/</span>}
              <Link href={b.href} className="hover:text-ink">{b.label}</Link>
            </span>
          ))}
        </nav>
      )}
      {hero && page === 1 && (
        <div className="mt-4">
          <BannerMedia banner={hero} variant="hero" />
          <HeroActions
            primary={{ label: `Ver los ${res.pagination.total} productos`, href: "#productos" }}
            actions={[
              { label: "Más vendidos", href: withParams(basePath, query, { orden: "best-selling" }) + "#productos" },
              { label: "Novedades", href: withParams(basePath, query, { orden: "created-at-descending" }) + "#productos" },
              { label: "Menor precio", href: withParams(basePath, query, { orden: "price-ascending" }) + "#productos" },
            ]}
            products={heroProducts}
            productsTitle="Recién llegados"
          />
        </div>
      )}
      {subTiles.length > 0 && (
        <nav aria-label="Subcategorías" className="mt-6">
          <ul className="rail auto-cols-[30%] sm:auto-cols-[18%] lg:auto-cols-[calc((100%-112px)/8)]">
            {subTiles.map((t) => (
              <li key={t.id}>
                <Link href={`/c/${t.handle}`} className="group block text-center">
                  <span className="block aspect-square overflow-hidden rounded-full bg-sand">
                    {t.image && <img src={t.image} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                  </span>
                  <span className="mt-2 block text-[13px] group-hover:underline underline-offset-4">{t.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div id="productos" className="mt-6 flex scroll-mt-4 flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <h1 className="text-[36px] font-semibold lowercase leading-none tracking-[-0.04em] md:text-[52px]">{title}</h1>
          <p className="mt-2 text-[13px] text-ink-soft">{res.pagination.total} productos</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {res.data.some(isLighting) && <LightsToggle />}
          <SortSelect value={sortBy ?? ""} options={q ? [["", "Relevancia"], ...SORTS] : SORTS} />
        </div>
      </div>
      {basePath === "/buscar" && (
        <form action="/buscar" role="search" className="mt-5 flex max-w-[560px] gap-2">
          <label htmlFor="q-page" className="sr-only">Buscar productos</label>
          <input id="q-page" name="q" defaultValue={q} placeholder="Buscá por nombre, color o SKU" className="min-w-0 flex-1 border border-line px-4 py-3 text-[14px] outline-none focus:border-ink" />
          <button className="bg-ink px-5 text-[14px] text-paper">Buscar</button>
        </form>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[230px_1fr]">
        <FiltersPanel count={chips.length}>
          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {chips.map((c) => (
                <Link key={c.href} href={c.href} className="rounded-full bg-sand px-3 py-1 text-[12.5px] hover:bg-line" aria-label={`Quitar filtro ${c.label}`}>
                  {c.label} ✕
                </Link>
              ))}
              <Link href={q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath} className="px-1 py-1 text-[12.5px] underline underline-offset-4">Limpiar</Link>
            </div>
          )}
          {facets.map((f, i) => (
            <details key={f.id} open={i < 2} className="border-b border-line">
              <summary className="flex items-center justify-between py-3 font-medium">
                {f.label ?? (f.source === "category" ? "Categoría" : f.id)}
                <span className="chev text-ink-soft transition-transform">⌄</span>
              </summary>
              <ul className="space-y-2 pb-4">
                {f.values!.slice(0, 14).map((v) => {
                  const [k, val] = decodeURIComponent(v.input).split("=");
                  const patch = k === "category_id" ? { sub: val } : { [k]: val };
                  const selected = v.selected || (k === "category_id" && String(sub) === val);
                  return (
                    <li key={v.input}>
                      <Link href={withParams(basePath, query, patch)} className={`flex items-center gap-2 ${selected ? "font-semibold" : "text-ink-soft hover:text-ink"}`}>
                        {v.swatch?.color && <span className="size-3.5 rounded-full border border-line" style={{ background: v.swatch.color }} />}
                        <span>{v.label}</span>
                        <span className="text-[12px] opacity-60">({v.count})</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          ))}
          {priceFacet && (
            <details open className="border-b border-line">
              <summary className="flex items-center justify-between py-3 font-medium">
                Precio <span className="chev text-ink-soft transition-transform">⌄</span>
              </summary>
              <form action={basePath} className="pb-4">
                {Object.entries(query).map(([k, v]) =>
                  !["desde", "hasta", "page"].includes(k) && one(v) ? <input key={k} type="hidden" name={k} value={one(v)} /> : null,
                )}
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor="desde">Precio mínimo</label>
                  <input id="desde" name="desde" type="number" min={0} inputMode="numeric" defaultValue={minPrice} placeholder={String(Math.floor(priceFacet.min ?? 0))} className="w-full min-w-0 border border-line px-2.5 py-2 outline-none focus:border-ink" />
                  <span className="text-ink-soft">a</span>
                  <label className="sr-only" htmlFor="hasta">Precio máximo</label>
                  <input id="hasta" name="hasta" type="number" min={0} inputMode="numeric" defaultValue={maxPrice} placeholder={String(Math.ceil(priceFacet.max ?? 0))} className="w-full min-w-0 border border-line px-2.5 py-2 outline-none focus:border-ink" />
                </div>
                <button className="mt-2 w-full border border-ink py-2 hover:bg-ink hover:text-paper">Aplicar precio</button>
              </form>
            </details>
          )}
        </FiltersPanel>

        <section>
          {res.data.length === 0 ? (
            <div className="bg-sand p-10 text-center">
              <p className="text-[15px] font-medium">No encontramos productos con estos filtros.</p>
              <Link href={basePath} className="mt-3 inline-block text-[13px] underline underline-offset-4">Quitar filtros</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
              {res.data.map((p, i) => {
                const slot = BANNER_AFTER.indexOf(i);
                // Rota los banners entre páginas para que no se repitan siempre los mismos.
                const banner = slot >= 0 && inline.length ? inline[(slot + (page - 1) * BANNER_AFTER.length) % inline.length] : null;
                return (
                  <Fragment key={p.id}>
                    {slot >= 0 && (
                      <div className="col-span-full my-2">
                        {banner ? <BannerMedia banner={banner} variant="inline" /> : <BenefitsStrip />}
                      </div>
                    )}
                    <ProductCard p={p} group={groups[String(p.id)]} />
                  </Fragment>
                );
              })}
            </div>
          )}
          {res.pagination.total_pages > 1 && (
            <nav aria-label="Páginas" className="mt-14 flex items-center justify-center gap-6 text-[13.5px]">
              {page > 1 && <Link href={withParams(basePath, query, { page: String(page - 1) })} className="underline underline-offset-4">Anterior</Link>}
              <span className="text-ink-soft">Página {page} de {res.pagination.total_pages}</span>
              {page < res.pagination.total_pages && <Link href={withParams(basePath, query, { page: String(page + 1) })} className="underline underline-offset-4">Siguiente</Link>}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
