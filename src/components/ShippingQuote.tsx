"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/tiendanube";
import { STORES } from "@/lib/store";
import { ChevronDown, PinIcon, TruckIcon } from "./Icons";

export type ShippingOption = {
  code: string;
  name: string;
  detail: string;
  date: string;
  price: number;
  days: [number, number];
  kind: "home" | "point";
};
const ZIP_KEY = "ar-zip";
const TOP = 3;

export default function ShippingQuote({ variantId, quantity }: { variantId?: number; quantity: number }) {
  const [zip, setZip] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "loading" | "done" | "error"; options?: ShippingOption[]; zip?: string; msg?: string }>({ kind: "idle" });

  const quote = async (z = zip) => {
    if (!variantId) return;
    setState({ kind: "loading" });
    const res = await fetch("/api/envio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zip: z, variantId, quantity }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok || !data) return setState({ kind: "error", msg: data?.error ?? "No pudimos cotizar. Probá de nuevo." });
    try { localStorage.setItem(ZIP_KEY, data.zip); } catch {}
    setState({ kind: "done", options: data.options, zip: data.zip });
  };

  // Recuerda el último CP y vuelve a cotizar cuando cambia la variante o la cantidad.
  useEffect(() => {
    let saved = "";
    try { saved = localStorage.getItem(ZIP_KEY) ?? ""; } catch {}
    if (saved) {
      setZip(saved);
      quote(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantId, quantity]);

  return (
    <div className="mt-6 border border-line p-4">
      <div className="flex items-center gap-2 text-[13.5px] font-medium">
        <TruckIcon className="size-5 text-walnut" /> Calculá el envío
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          quote();
        }}
      >
        <label htmlFor="cp" className="sr-only">Código postal</label>
        <input
          id="cp"
          inputMode="numeric"
          autoComplete="postal-code"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="Tu código postal"
          className="min-w-0 flex-1 border border-line px-3 py-2.5 text-[14px] outline-none focus:border-ink"
        />
        <button disabled={zip.length < 4 || state.kind === "loading"} className="border border-ink px-4 text-[13.5px] hover:bg-ink hover:text-paper disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink">
          {state.kind === "loading" ? "Calculando…" : "Calcular"}
        </button>
      </form>
      <a href="https://www.correoargentino.com.ar/formularios/cpa" target="_blank" rel="noopener" className="mt-2 inline-block text-[12px] text-ink-soft underline underline-offset-2">
        No sé mi código postal
      </a>

      <div aria-live="polite">
        {state.kind === "error" && <p className="mt-3 text-[13px] text-sale">{state.msg}</p>}
        {state.kind === "done" && <ShippingOptions options={state.options!} zip={state.zip!} />}
      </div>
    </div>
  );
}

// Badges de las opciones a domicilio: la más barata, la más rápida y la de mejor equilibrio entre las dos.
function rankHome(home: ShippingOption[]) {
  const badges = new Map<string, string[]>();
  const add = (o: ShippingOption | undefined, b: string) => o && badges.set(o.code, [...(badges.get(o.code) ?? []), b]);
  const cheapest = home[0];
  const fastest = [...home].sort((a, b) => a.days[0] - b.days[0] || a.days[1] - b.days[1] || a.price - b.price)[0];
  add(cheapest, cheapest?.price === 0 ? "Gratis" : "Más barato");
  add(fastest, "Más rápido");

  const maxPrice = Math.max(...home.map((o) => o.price), 1);
  const maxDays = Math.max(...home.map((o) => o.days[1]), 1);
  const score = (o: ShippingOption) => o.price / maxPrice + o.days[1] / maxDays;
  const balanced = home.filter((o) => !badges.has(o.code)).sort((a, b) => score(a) - score(b))[0];
  add(balanced, "Recomendado");

  const top = [cheapest, fastest, balanced].filter((o, i, all): o is ShippingOption => Boolean(o) && all.indexOf(o) === i);
  // Si la más barata también es la más rápida queda un lugar libre: se completa por precio.
  for (const o of home) if (top.length < TOP && !top.includes(o)) top.push(o);
  return { top, rest: home.filter((o) => !top.includes(o)), badges };
}

const label = (o: ShippingOption) => {
  const name = o.name.replace(/\s+/g, " ").trim();
  return o.detail && !name.toLowerCase().includes(o.detail.toLowerCase()) ? `${name} · ${o.detail}` : name;
};
const priceLabel = (v: number) => (v === 0 ? "Gratis" : money(v));

export function ShippingOptions({ options, zip }: { options: ShippingOption[]; zip: string }) {
  const home = options.filter((o) => o.kind === "home");
  const points = options.filter((o) => o.kind === "point");
  const ranked = rankHome(home);

  return (
    <div className="mt-4 divide-y divide-line border-y border-line">
      {home.length > 0 ? (
        <Group title="Envío a domicilio" from={home[0].price} count={home.length} defaultOpen>
          <OptionList top={ranked.top} rest={ranked.rest} badges={ranked.badges} />
        </Group>
      ) : (
        <p className="py-3 text-[13px]">No hay envíos a domicilio para el CP {zip}.</p>
      )}
      {points.length > 0 && (
        <Group title="Retiro en punto de retiro" from={points[0].price} count={points.length}>
          <OptionList top={points.slice(0, TOP)} rest={points.slice(TOP)} />
        </Group>
      )}
      <Group title="Retiro en locales" count={STORES.length}>
        <ul className="space-y-2 pb-1">
          {STORES.map((s) => (
            <li key={s.name} className="flex items-start justify-between gap-3 text-[13px]">
              <span className="flex items-start gap-2">
                <PinIcon className="mt-0.5 size-4 shrink-0 text-walnut" />
                <span>
                  {s.name}
                  {s.detail && <span className="block text-[12px] text-ink-soft">{s.detail}</span>}
                </span>
              </span>
              <a href={s.map} target="_blank" rel="noopener" className="shrink-0 text-[12px] underline underline-offset-2">Cómo llegar</a>
            </li>
          ))}
        </ul>
      </Group>
    </div>
  );
}

function Group({ title, from, count, defaultOpen, children }: { title: string; from?: number; count: number; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="group/ship">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-[13.5px] [&::-webkit-details-marker]:hidden">
        <span className="font-medium">
          {title} <span className="font-normal text-ink-soft">({count})</span>
        </span>
        <span className="flex items-center gap-2">
          {from !== undefined && <span className="text-[12.5px] text-ink-soft">desde <b className="font-semibold text-ink">{priceLabel(from)}</b></span>}
          <ChevronDown className="size-4 transition-transform group-open/ship:rotate-180" />
        </span>
      </summary>
      <div className="pb-3">{children}</div>
    </details>
  );
}

function OptionList({ top, rest, badges }: { top: ShippingOption[]; rest: ShippingOption[]; badges?: Map<string, string[]> }) {
  const [more, setMore] = useState(false);
  const list = more ? [...top, ...rest] : top;
  return (
    <>
      <ul className="space-y-2">
        {list.map((o) => {
          const b = badges?.get(o.code) ?? [];
          return (
            <li key={o.code} className={`flex items-start justify-between gap-3 border p-3 text-[13px] ${b.length ? "border-ink/30" : "border-line"}`}>
              <span className="min-w-0">
                {b.length > 0 && (
                  <span className="mb-1.5 flex flex-wrap gap-1">
                    {b.map((x) => (
                      <span key={x} className={`px-1.5 py-0.5 text-[11px] font-semibold ${x === "Más rápido" ? "bg-ink text-paper" : x === "Recomendado" ? "bg-sand text-ink" : "bg-walnut text-paper"}`}>
                        {x}
                      </span>
                    ))}
                  </span>
                )}
                <span className="block">{label(o)}</span>
                {o.date && <span className="block text-[12px] text-ink-soft">{o.date}</span>}
              </span>
              <span className={`shrink-0 font-semibold ${o.price === 0 ? "text-walnut" : ""}`}>{priceLabel(o.price)}</span>
            </li>
          );
        })}
      </ul>
      {rest.length > 0 && (
        <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more} className="mt-2.5 text-[12.5px] underline underline-offset-4">
          {more ? "Ver menos" : `Ver ${rest.length} opciones más`}
        </button>
      )}
    </>
  );
}
