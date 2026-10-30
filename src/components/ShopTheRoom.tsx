import Link from "next/link";
import { getProduct, inStock, money, priceOf, sized } from "@/lib/tiendanube";

export type Hotspot = { handle: string; x: number; y: number };

// Foto de ambiente con puntos numerados que llevan a cada producto que aparece.
export default async function ShopTheRoom({
  image,
  ratio,
  alt,
  title,
  copy,
  hotspots,
  reverse,
}: {
  image: string;
  /** ancho / alto de la foto: los puntos se ubican en % de la foto completa */
  ratio: number;
  alt: string;
  title: string;
  copy: string;
  hotspots: Hotspot[];
  reverse?: boolean;
}) {
  const products = await Promise.all(hotspots.map((h) => getProduct(h.handle)));
  const items = hotspots
    .map((h, i) => ({ ...h, p: products[i], n: i + 1 }))
    .filter((x): x is typeof x & { p: NonNullable<typeof x.p> } => Boolean(x.p));
  if (!items.length) return null;

  return (
    <section className="mx-auto mt-20 max-w-[1440px] px-4 lg:px-8">
      <div
        className={`grid grid-cols-1 items-center gap-8 lg:gap-14 ${ratio < 1 ? "lg:grid-cols-2" : reverse ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]" : "lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"} ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
      >
        <div className="relative overflow-hidden bg-sand" style={{ aspectRatio: ratio }}>
          <img src={image} alt={alt} loading="lazy" className="absolute inset-0 size-full object-cover" />
          {items.map(({ p, x, y, n }) => {
            const { now } = priceOf(p.variants.find(inStock) ?? p.variants[0]);
            return (
              <Link
                key={p.id}
                href={`/p/${p.handle}`}
                className="group/dot absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
                aria-label={`${n}. ${p.name}`}
              >
                <span className="grid size-8 place-items-center rounded-full bg-paper text-[13px] font-semibold shadow-[0_2px_10px_rgba(0,0,0,.25)] transition-transform group-hover/dot:scale-110">
                  {n}
                </span>
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-52 -translate-x-1/2 bg-paper p-3 text-[12.5px] shadow-[0_8px_24px_rgba(0,0,0,.18)] group-hover/dot:block group-focus-visible/dot:block">
                  <span className="block leading-snug">{p.name}</span>
                  <span className="mt-1 block font-semibold">{money(now)}</span>
                </span>
              </Link>
            );
          })}
        </div>

        <div>
          <h2 className="text-[34px] font-semibold lowercase leading-[0.95] tracking-[-0.04em] md:text-[48px]">{title}</h2>
          <p className="mt-4 max-w-[40ch] text-[14.5px] leading-relaxed text-ink-soft">{copy}</p>
          <ol className="mt-8 divide-y divide-line border-y border-line">
            {items.map(({ p, n }) => {
              const { now, before } = priceOf(p.variants.find(inStock) ?? p.variants[0]);
              return (
                <li key={p.id}>
                  <Link href={`/p/${p.handle}`} className="group flex items-center gap-4 py-3.5">
                    <span className="w-4 text-[13px] font-semibold">{n}</span>
                    <span className="size-16 shrink-0 overflow-hidden bg-sand">
                      {p.images[0] && <img src={sized(p.images[0].src, 240)} alt="" className="size-full object-cover" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] group-hover:underline underline-offset-4">{p.name}</span>
                      <span className="mt-0.5 block text-[13.5px]">
                        <span className={before ? "font-semibold text-sale" : "font-medium"}>{money(now)}</span>
                        {before && <s className="ml-2 text-[12px] text-ink-soft">{money(before)}</s>}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
