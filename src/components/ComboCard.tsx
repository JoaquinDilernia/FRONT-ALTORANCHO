import Link from "next/link";
import { comboTotal, type Combo } from "@/lib/combos";
import { money, sized } from "@/lib/tiendanube";

// Primera opción con stock de cada pieza: es el precio "desde".
export const defaultPicks = (c: Combo) => c.items.map((it) => Math.max(0, it.options.findIndex((o) => o.available)));

export default function ComboCard({ combo }: { combo: Combo }) {
  const picks = defaultPicks(combo);
  const { was, now } = combo.from != null && combo.was != null ? { was: combo.was, now: combo.from } : comboTotal(combo.items, picks, combo.discountPercent);
  const pieces = combo.items.map((it, i) => it.options[picks[i]]).filter(Boolean);
  const cover = combo.images?.[0];
  const href = combo.slug ? `/combos/${combo.slug}` : `/p/${pieces[0]?.handle}`;

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-square overflow-hidden bg-sand">
        {cover ? (
          <img src={cover} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <div className={`grid size-full gap-px bg-line ${pieces.length > 1 ? "grid-cols-2" : ""}`}>
            {pieces.slice(0, 4).map((o) => (
              <img key={o.productId} src={sized(o.image, 480)} alt="" loading="lazy" className="size-full bg-sand object-cover" />
            ))}
          </div>
        )}
        {combo.discountPercent > 0 && (
          <span className="absolute left-3 top-3 bg-ink px-2 py-1 text-[11.5px] font-semibold text-paper">-{combo.discountPercent}% en combo</span>
        )}
      </div>
      <h3 className="mt-3 text-[15px] font-medium group-hover:underline underline-offset-4">{combo.name}</h3>
      {combo.includesText && <p className="mt-0.5 text-[12.5px] text-ink-soft">{combo.includesText}</p>}
      <p className="mt-1 text-[14px]">
        <span className="text-[12.5px] text-ink-soft">Desde </span>
        <span className="font-semibold">{money(now)}</span>
        {was > now && <s className="ml-2 text-[12.5px] text-ink-soft">{money(was)}</s>}
      </p>
    </Link>
  );
}
