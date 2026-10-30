import Link from "next/link";
import { inStock, isLighting, money, priceOf, sized, type Product } from "@/lib/tiendanube";
import { swatchBackground, type Group } from "@/lib/variantGroups";
import { FavButton } from "./Favorites";
import { CardMedia } from "./LightSwitch";

const MAX_DOTS = 5;

export default function ProductCard({
  p,
  group,
  sizes = "(min-width:1024px) 25vw, 50vw",
}: {
  p: Product;
  group?: Group;
  sizes?: string;
}) {
  const v = p.variants.find(inStock) ?? p.variants[0];
  const { now, before, off } = priceOf(v);
  const [a, b] = p.images;
  const soldOut = !p.variants.some(inStock);
  const dots = (group?.siblings ?? []).filter((s) => swatchBackground(s));

  return (
    <div className="group relative">
      <CardMedia
        href={`/p/${p.handle}`}
        light={isLighting(p)}
        first={
          a && (
            <img
              src={sized(a.src, 640)}
              srcSet={`${sized(a.src, 480)} 480w, ${sized(a.src, 640)} 640w, ${sized(a.src, 1024)} 1024w`}
              sizes={sizes}
              alt={a.alt || p.name}
              loading="lazy"
              className="absolute inset-0 size-full object-cover"
            />
          )
        }
        second={b && <img src={sized(b.src, 640)} alt="" loading="lazy" className="size-full object-cover" />}
      >
          {off > 0 && (
            <span className="absolute left-3 top-3 bg-paper px-2 py-1 text-[11.5px] font-semibold text-sale">-{off}%</span>
          )}
          {soldOut && <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-[11.5px] text-paper">Sin stock</span>}
      </CardMedia>
      <FavButton
        fav={{ handle: p.handle, name: p.name, image: a ? sized(a.src, 480) : "", price: money(now) }}
        size="size-[18px]"
        className="absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-paper/85 opacity-100 transition-opacity hover:bg-paper lg:opacity-0 lg:focus-visible:opacity-100 lg:group-hover:opacity-100 [&[aria-pressed=true]]:opacity-100"
      />
      {dots.length > 1 && (
        <ul className="mt-3 flex items-center gap-1.5" aria-label="Colores">
          {dots.slice(0, MAX_DOTS).map((s) => (
            <li key={s.productId}>
              <Link
                href={`/p/${s.handle}`}
                title={s.colorName}
                aria-label={s.colorName}
                className={`block size-4 rounded-full border ${String(p.id) === s.productId ? "border-ink ring-1 ring-ink ring-offset-1" : "border-ink/15"}`}
                style={{ background: swatchBackground(s) }}
              />
            </li>
          ))}
          {dots.length > MAX_DOTS && <li className="text-[11.5px] text-ink-soft">+{dots.length - MAX_DOTS}</li>}
        </ul>
      )}
      <Link href={`/p/${p.handle}`} className={`block ${dots.length > 1 ? "pt-2" : "pt-3"}`}>
        <h3 className="line-clamp-2 text-[13.5px] leading-snug group-hover:underline underline-offset-4">{p.name}</h3>
        <p className="mt-1 text-[14px]">
          <span className={before ? "font-semibold text-sale" : "font-medium"}>{money(now)}</span>
          {before && <s className="ml-2 text-[12.5px] text-ink-soft">{money(before)}</s>}
        </p>
        {p.variants.length > 1 && <p className="mt-0.5 text-[12px] text-ink-soft">{p.variants.length} opciones</p>}
      </Link>
    </div>
  );
}
