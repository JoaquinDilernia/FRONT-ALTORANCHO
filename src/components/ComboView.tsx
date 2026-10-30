"use client";

import Link from "next/link";
import { useState } from "react";
import { comboTotal, type Combo } from "@/lib/combos";
import { money, sized } from "@/lib/tiendanube";

const swatch = (colors: string[]) => {
  const [a, b] = colors;
  return b ? `linear-gradient(135deg, ${a} 50%, ${b} 50%)` : a;
};

export default function ComboView({ combo, initialPicks }: { combo: Combo; initialPicks: number[] }) {
  const [picks, setPicks] = useState(initialPicks);
  const [img, setImg] = useState(0);
  const chosen = combo.items.map((it, i) => it.options[picks[i]]);
  const gallery = combo.images?.length ? combo.images : chosen.filter(Boolean).map((o) => sized(o.image, 1024));
  const { was, now } = comboTotal(combo.items, picks, combo.discountPercent);
  const allAvailable = chosen.every((o) => o?.available);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-14">
      <div>
        <div className="aspect-square overflow-hidden bg-sand">
          {gallery[img] && <img src={gallery[img]} alt={combo.name} className="size-full object-cover" />}
        </div>
        {gallery.length > 1 && (
          <ul className="mt-3 grid grid-cols-5 gap-3 sm:grid-cols-6">
            {gallery.map((g, i) => (
              <li key={g + i}>
                <button
                  onClick={() => setImg(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={i === img}
                  className={`block aspect-square w-full overflow-hidden bg-sand ${i === img ? "ring-1 ring-ink" : "opacity-70 hover:opacity-100"}`}
                >
                  <img src={g} alt="" className="size-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <h1 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] md:text-[36px]">{combo.name}</h1>
        {combo.shortDescription && <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">{combo.shortDescription}</p>}

        <div className="mt-5 flex flex-wrap items-baseline gap-x-3">
          <span className="text-[26px] font-semibold">{money(now)}</span>
          {was > now && <s className="text-[15px] text-ink-soft">{money(was)}</s>}
          {combo.discountPercent > 0 && <span className="bg-ink px-2 py-0.5 text-[12px] font-semibold text-paper">-{combo.discountPercent}% en combo</span>}
        </div>

        <ol className="mt-8 divide-y divide-line border-y border-line">
          {combo.items.map((it, i) => {
            const o = chosen[i];
            return (
              <li key={i} className="py-5">
                <div className="flex gap-4">
                  <Link href={`/p/${o?.handle}`} className="size-20 shrink-0 overflow-hidden bg-sand">
                    {o && <img src={sized(o.image, 240)} alt="" className="size-full object-cover" />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium">
                      {it.quantity > 1 && <span>{it.quantity} × </span>}
                      {it.label}
                    </p>
                    {o && (
                      <p className="mt-0.5 text-[13px] text-ink-soft">
                        {o.colorName || o.name}, {money(o.price)} c/u
                      </p>
                    )}
                    {it.options.length > 1 && (
                      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={`Color de ${it.label}`}>
                        {it.options.map((opt, j) => (
                          <button
                            key={opt.productId}
                            role="radio"
                            aria-checked={picks[i] === j}
                            disabled={!opt.available}
                            title={opt.colorName || opt.name}
                            onClick={() => setPicks((p) => p.map((v, k) => (k === i ? j : v)))}
                            className={`rounded-full p-[3px] ring-1 disabled:cursor-not-allowed disabled:opacity-35 ${picks[i] === j ? "ring-ink" : "ring-transparent hover:ring-line"}`}
                          >
                            {opt.colors.length ? (
                              <span className="block size-7 rounded-full border border-ink/10" style={{ background: swatch(opt.colors) }} />
                            ) : (
                              <img src={sized(opt.image, 240)} alt={opt.colorName || opt.name} className="block size-7 rounded-full object-cover" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <button disabled className="mt-6 w-full bg-ink py-3.5 text-[14px] font-medium text-paper disabled:cursor-not-allowed disabled:opacity-90">
          Agregar combo al carrito
        </button>
        <p className="mt-2 text-[12px] text-ink-soft">
          {allAvailable ? "Carrito desactivado: esta prueba solo lee el catálogo." : "Alguna pieza no tiene stock en ese color."}
        </p>

        {combo.description && <p className="mt-8 whitespace-pre-line text-[14px] leading-relaxed">{combo.description}</p>}
      </div>
    </div>
  );
}
