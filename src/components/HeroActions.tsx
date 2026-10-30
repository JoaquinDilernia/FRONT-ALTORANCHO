import Link from "next/link";
import { money, priceOf, sized, type Product } from "@/lib/tiendanube";

export type HeroAction = { label: string; href: string };

// Franja pegada debajo del banner principal: además de "ver todo" ofrece atajos
// para empezar a comprar y algunos productos para entrar directo a la ficha.
export default function HeroActions({
  primary,
  actions,
  products,
  productsTitle,
}: {
  primary: HeroAction;
  actions: HeroAction[];
  products: Product[];
  productsTitle: string;
}) {
  return (
    <div className="grid gap-6 bg-sand px-4 py-5 md:px-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-10 lg:px-8">
      <div className="flex flex-wrap gap-2">
        <Link href={primary.href} className="rounded-full bg-ink px-5 py-2.5 text-[13.5px] font-medium text-paper hover:bg-ink/85">
          {primary.label}
        </Link>
        {actions.map((a) => (
          <Link key={a.href} href={a.href} className="rounded-full border border-ink/25 bg-paper px-4 py-2.5 text-[13.5px] hover:border-ink">
            {a.label}
          </Link>
        ))}
      </div>

      {products.length > 0 && (
        <div>
          <p className="mb-2.5 text-[13px] font-semibold">{productsTitle}</p>
          <ul className="rail auto-cols-[78%] gap-3 sm:auto-cols-[44%] lg:grid lg:auto-cols-auto lg:grid-cols-4 lg:overflow-visible">
            {products.map((p) => {
              const { now, before } = priceOf(p.variants[0]);
              const img = p.images[0];
              return (
                <li key={p.id}>
                  <Link href={`/p/${p.handle}`} className="group flex items-center gap-3 bg-paper p-2 pr-3">
                    <span className="block size-16 shrink-0 overflow-hidden bg-sand">
                      {img && <img src={sized(img.src, 240)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-3 text-[12px] leading-snug group-hover:underline underline-offset-2">{p.name}</span>
                      <span className={`mt-1 block text-[13px] font-semibold ${before ? "text-sale" : ""}`}>{money(now)}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
