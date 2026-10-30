"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { inStock, isLighting, money, priceOf, sized, type Product } from "@/lib/tiendanube";
import { swatchBackground, type Sibling } from "@/lib/variantGroups";
import { FREE_SHIPPING_FROM } from "@/lib/store";
import { useCart } from "@/lib/cart";
import { BENEFITS, TRANSFER_DISCOUNT } from "@/content/site";
import { FavButton } from "./Favorites";
import { ChevronDown } from "./Icons";
import Lightbox from "./Lightbox";
import { LightSwitch } from "./LightSwitch";
import ShareButton from "./ShareButton";
import ShippingQuote from "./ShippingQuote";

const INSTALLMENTS_FROM = 600000;

type Props = {
  product: Product;
  descriptionHtml: string;
  care: string | null;
  techSheet: string | null;
  siblings: Sibling[];
  comboCount: number;
};

export default function ProductView({ product, descriptionHtml, care, techSheet, siblings, comboCount }: Props) {
  const current = siblings.find((s) => s.productId === String(product.id));
  const attrs = product.attributes ?? [];
  const first = product.variants.find(inStock) ?? product.variants[0];
  const [values, setValues] = useState<string[]>(first?.values ?? []);
  // Arranca en la foto de la variante elegida de entrada (si tiene una propia).
  // Las lámparas arrancan siempre en la 1ª foto: la apagada.
  const [imgIndex, setImgIndex] = useState(() => {
    if (isLighting(product)) return 0;
    const idx = product.images.filter((i) => i.src !== techSheet).findIndex((g) => g.id === first?.image_id);
    return Math.max(idx, 0);
  });
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState<number | null>(null);
  const { addProduct } = useCart();

  const variant = useMemo(
    () => product.variants.find((v) => v.values.every((x, i) => x === values[i])) ?? first,
    [product.variants, values, first],
  );
  const gallery = product.images.filter((i) => i.src !== techSheet);
  const { now, before, off } = priceOf(variant);
  const available = variant ? inStock(variant) : false;

  const options = attrs.map((_, i) => [...new Set(product.variants.map((v) => v.values[i]))]);
  const pick = (i: number, val: string) => {
    const next = values.slice();
    next[i] = val;
    // Si la combinación no existe, toma la primera variante con ese valor.
    const exact = product.variants.find((v) => v.values.every((x, j) => x === next[j]));
    const fallback = exact ?? product.variants.find((v) => v.values[i] === val);
    const chosen = fallback?.values ?? next;
    setValues(chosen);
    const target = (exact ?? fallback)?.image_id;
    const idx = target ? gallery.findIndex((g) => g.id === target) : -1;
    if (idx >= 0) setImgIndex(idx);
  };
  const exists = (i: number, val: string) =>
    product.variants.some((v) => v.values[i] === val && v.values.every((x, j) => j === i || x === values[j]) && inStock(v));

  const dims = variant && [
    ["Ancho", variant.width],
    ["Alto", variant.height],
    ["Profundidad", variant.depth],
  ].filter(([, v]) => v && Number(v) > 0);

  const main = gallery[imgIndex] ?? gallery[0];
  const big = gallery.map((g) => sized(g.src, 1024));
  const fav = { handle: product.handle, name: product.name, image: gallery[0] ? sized(gallery[0].src, 480) : "", price: money(now) };
  // Lámparas: el botón alterna entre la foto apagada (0) y la prendida (1).
  const light = isLighting(product) && gallery.length > 1;
  const lit = imgIndex === 1;
  const toggleLight = () => setImgIndex(lit ? 0 : 1);
  const step = (d: number) => setImgIndex((i) => (i + d + gallery.length) % gallery.length);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_460px]">
      {/* Galería: miniaturas verticales + imagen grande */}
      <div className="lg:grid lg:grid-cols-[76px_1fr] lg:gap-4">
        <ul className="hidden max-h-[calc(100vh-140px)] space-y-3 overflow-y-auto lg:block" aria-label="Fotos">
          {gallery.map((g, i) => (
            <li key={g.id}>
              <button
                onClick={() => setImgIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === imgIndex}
                className={`block aspect-square w-full overflow-hidden bg-sand outline-offset-0 ${i === imgIndex ? "ring-1 ring-ink" : "opacity-70 hover:opacity-100"}`}
              >
                <img src={sized(g.src, 240)} alt="" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
        <div>
          <div className="relative hidden aspect-square overflow-hidden bg-sand lg:block">
            {main && (
              <button onClick={() => setZoom(imgIndex)} className="block size-full cursor-zoom-in" aria-label="Ver foto en pantalla completa">
                <img key={main.id} src={sized(main.src, 1024)} alt={main.alt || product.name} className="size-full object-cover" />
              </button>
            )}
            {gallery.length > 1 && (
              <>
                <button onClick={() => step(-1)} aria-label="Foto anterior" className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-[22px] opacity-0 shadow transition-opacity focus-visible:opacity-100 [div:hover>&]:opacity-100">‹</button>
                <button onClick={() => step(1)} aria-label="Foto siguiente" className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-[22px] opacity-0 shadow transition-opacity focus-visible:opacity-100 [div:hover>&]:opacity-100">›</button>
                {light && <LightSwitch on={lit} onToggle={toggleLight} className="absolute bottom-4 left-4" />}
                <span className="pointer-events-none absolute bottom-4 right-4 bg-paper/90 px-2.5 py-1 text-[12px]">
                  {imgIndex + 1} / {gallery.length}
                </span>
              </>
            )}
          </div>
          {/* Mobile: carrusel deslizable */}
          <div className="rail -mx-4 auto-cols-[88%] px-4 lg:hidden">
            {gallery.map((g, i) => {
              // En mobile la primera foto de una lámpara se prende y apaga en el lugar.
              const shown = light && i === 0 && lit ? gallery[1] : g;
              return (
                <div key={g.id} className="relative aspect-square overflow-hidden bg-sand">
                  <button onClick={() => setZoom(light && i === 0 && lit ? 1 : i)} className="block size-full" aria-label={`Ver foto ${i + 1} en pantalla completa`}>
                    <img src={sized(shown.src, 640)} alt={shown.alt || product.name} className="size-full object-cover" />
                  </button>
                  {light && i === 0 && <LightSwitch on={lit} onToggle={toggleLight} className="absolute bottom-3 left-3" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Columna de compra */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        <h1 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] md:text-[34px]">{product.name}</h1>
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="text-[12px] text-ink-soft">{variant?.sku && `SKU ${variant.sku}`}</p>
          <ShareButton title={product.name} />
        </div>

        <div className="mt-5 flex flex-wrap items-baseline gap-x-3">
          <span className={`text-[26px] font-semibold ${before ? "text-sale" : ""}`}>{money(now)}</span>
          {before && <s className="text-[15px] text-ink-soft">{money(before)}</s>}
          {off > 0 && <span className="bg-sale px-2 py-0.5 text-[12px] font-semibold text-paper">-{off}%</span>}
        </div>
        {/* La API trae el neto del precio de lista; se aplica la misma proporción al precio que se muestra. */}
        {variant?.price_without_taxes && Number(variant.price) > 0 && (
          <p className="mt-1 text-[12.5px] text-ink-soft">
            Precio sin impuestos {money(Math.round((now * Number(variant.price_without_taxes)) / Number(variant.price)))}
          </p>
        )}
        <p className="mt-2 text-[13.5px]">
          <b className="font-semibold">{money(Math.round(now * (1 - TRANSFER_DISCOUNT)))}</b> con transferencia{" "}
          <span className="text-ink-soft">({Math.round(TRANSFER_DISCOUNT * 100)}% de descuento)</span>
        </p>
        {now >= INSTALLMENTS_FROM && (
          <p className="mt-1.5 text-[13.5px]">
            <b className="font-semibold">12 cuotas sin interés</b> de {money(Math.round(now / 12))}
          </p>
        )}

        {siblings.length > 1 && (
          <div className="mt-6">
            <p className="mb-2.5 text-[13.5px]">
              Color: <b className="font-semibold">{current?.colorName}</b>
            </p>
            <ul className="flex flex-wrap gap-2.5">
              {siblings.map((s) => {
                const bg = swatchBackground(s);
                const selected = s.productId === String(product.id);
                return (
                  <li key={s.productId}>
                    <Link
                      href={`/p/${s.handle}`}
                      title={s.colorName}
                      aria-label={s.colorName}
                      aria-current={selected ? "page" : undefined}
                      className={`block overflow-hidden rounded-full p-[3px] ring-1 ${selected ? "ring-ink" : "ring-transparent hover:ring-line"}`}
                    >
                      {bg ? (
                        <span className="block size-9 rounded-full border border-ink/10" style={{ background: bg }} />
                      ) : (
                        <img src={sized(s.image, 240)} alt="" className="block size-9 rounded-full object-cover" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {attrs.map((a, i) => (
          <fieldset key={a} className="mt-6">
            <legend className="mb-2.5 text-[13.5px]">
              {a}: <b className="font-semibold">{values[i]}</b>
            </legend>
            <div className="flex flex-wrap gap-2">
              {options[i].map((val) => {
                const selected = values[i] === val;
                const ok = exists(i, val);
                return (
                  <button
                    key={val}
                    onClick={() => pick(i, val)}
                    aria-pressed={selected}
                    className={`min-w-12 border px-3.5 py-2 text-[13px] ${
                      selected ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
                    } ${ok ? "" : "text-ink-soft line-through decoration-ink-soft/60"}`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        <p className={`mt-6 text-[13px] ${available ? "text-walnut" : "text-sale"}`}>
          {available
            ? variant?.stock_management && (variant.stock ?? 0) <= 5
              ? `Quedan ${variant.stock} unidades`
              : "En stock, listo para enviar"
            : "Sin stock en esta variante"}
        </p>

        <div className="mt-3 flex gap-3">
          <div className="flex items-center border border-line">
            <button className="px-3.5 py-3" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Restar uno">−</button>
            <span className="w-8 text-center text-[14px]" aria-live="polite">{qty}</span>
            <button
              className="px-3.5 py-3 disabled:opacity-30"
              disabled={Boolean(variant?.stock_management) && qty >= (variant?.stock ?? 0)}
              onClick={() => setQty((q) => q + 1)}
              aria-label="Sumar uno"
            >
              +
            </button>
          </div>
          <button
            disabled={!variant || !available}
            onClick={() => {
              if (!variant) return;
              const img = gallery.find((g) => g.id === variant.image_id) ?? gallery[0];
              addProduct(
                {
                  variantId: variant.id,
                  handle: product.handle,
                  name: product.name,
                  variant: attrs.length ? variant.values.join(" / ") : "",
                  image: img ? sized(img.src, 240) : "",
                  price: now,
                },
                qty,
                { max: variant.stock_management ? variant.stock : null, before },
              );
              setQty(1);
            }}
            className="flex-1 bg-ink py-3 text-[14px] font-medium text-paper transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {available ? "Agregar al carrito" : "Sin stock"}
          </button>
          <FavButton fav={fav} className="border border-line px-3.5 hover:border-ink" />
        </div>

        {comboCount > 0 && (
          <a href="#combos" className="mt-6 flex items-center justify-between bg-sand px-4 py-3 text-[13.5px] hover:bg-line">
            <span>
              <b className="font-semibold">Ahorrá llevándolo en combo.</b> Está en {comboCount} {comboCount === 1 ? "combo" : "combos"}.
            </span>
            <span className="underline underline-offset-4">Ver</span>
          </a>
        )}

        <ShippingQuote variantId={variant?.id} quantity={qty} />
        <p className="mt-2 text-[12.5px] text-ink-soft">
          {product.free_shipping || now * qty >= FREE_SHIPPING_FROM
            ? "Esta compra entra en el envío gratis al AMBA desde $600.000."
            : `Te faltan ${money(FREE_SHIPPING_FROM - now * qty)} para el envío gratis al AMBA.`}
        </p>

        <div className="mt-8 border-t border-line">
          <Accordion title="Descripción" defaultOpen>
            <div className="prose-tn" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          </Accordion>
          {(dims?.length || techSheet) && (
            <Accordion title="Dimensiones">
              {dims && dims.length > 0 && (
                <dl className="grid grid-cols-3 gap-px bg-line text-center text-[13px]">
                  {dims.map(([k, v]) => (
                    <div key={k} className="bg-paper py-3">
                      <dt className="text-ink-soft">{k}</dt>
                      <dd className="mt-0.5 font-semibold">{Number(v)} cm</dd>
                    </div>
                  ))}
                </dl>
              )}
              {techSheet && <img src={sized(techSheet, 1024)} alt={`Ficha técnica de ${product.name}`} className="mt-4 w-full bg-sand" loading="lazy" />}
            </Accordion>
          )}
          {care && (
            <Accordion title="Cuidados">
              <p className="text-[14px] leading-relaxed">{care}</p>
            </Accordion>
          )}
          <Accordion title="Envíos y cambios">
            <ul className="list-disc space-y-1.5 pl-4 text-[14px] leading-relaxed">
              {BENEFITS.map((b) => (
                <li key={b.title}>{b.title}: {b.copy.charAt(0).toLowerCase() + b.copy.slice(1)}.</li>
              ))}
              <li>
                Cambios y devoluciones: <Link href="/ayuda/cambios-y-devoluciones" className="underline underline-offset-4">ver la política</Link>.
              </li>
            </ul>
          </Accordion>
        </div>
      </div>
      {zoom !== null && <Lightbox images={big} index={zoom} onIndex={setZoom} onClose={() => setZoom(null)} title={product.name} />}
    </div>
  );
}

function Accordion({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} className="border-b border-line">
      <summary className="flex items-center justify-between py-4 text-[15px] font-medium">
        {title}
        <ChevronDown className="chev size-4 transition-transform" />
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}
