"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { lineTotals, onCartOpen, openCart, useCart, type CartLine } from "@/lib/cart";
import { money } from "@/lib/tiendanube";
import { FREE_SHIPPING_FROM } from "@/lib/store";
import { TRANSFER_DISCOUNT } from "@/content/site";
import { BagIcon, CloseIcon, TruckIcon } from "./Icons";

export function CartButton() {
  const { units } = useCart();
  return (
    <button type="button" onClick={openCart} className="relative inline-flex" aria-label={`Carrito (${units})`} title="Carrito">
      <BagIcon />
      {units > 0 && (
        <span key={units} className="badge-bump absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-semibold leading-4 text-paper">
          {units}
        </span>
      )}
    </button>
  );
}

export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const pct = Math.min(subtotal / FREE_SHIPPING_FROM, 1);
  const done = pct >= 1;
  return (
    <div>
      <p className="flex items-center gap-2 text-[12.5px]">
        <TruckIcon className="size-4 shrink-0 text-walnut" />
        {done ? (
          <span><b className="font-semibold">Tenés envío gratis</b> al AMBA.</span>
        ) : (
          <span>Te faltan <b className="font-semibold">{money(FREE_SHIPPING_FROM - subtotal)}</b> para el envío gratis al AMBA.</span>
        )}
      </p>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
        <div className={`h-full rounded-full transition-[width] duration-700 ease-out ${done ? "bg-walnut" : "bg-ink"}`} style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}

function Stepper({ line }: { line: CartLine }) {
  const { setQty } = useCart();
  const atMax = line.kind === "product" && line.max != null && line.qty >= line.max;
  return (
    <div className="inline-flex items-center border border-line text-[13px]">
      <button type="button" className="px-2.5 py-1.5 disabled:opacity-30" disabled={line.qty <= 1} onClick={() => setQty(line.key, line.qty - 1)} aria-label="Restar uno">−</button>
      <span className="w-6 text-center" aria-live="polite">{line.qty}</span>
      <button type="button" className="px-2.5 py-1.5 disabled:opacity-30" disabled={atMax} onClick={() => setQty(line.key, line.qty + 1)} aria-label="Sumar uno">+</button>
    </div>
  );
}

export function CartLineRow({ line, big = false }: { line: CartLine; big?: boolean }) {
  const { remove } = useCart();
  const { now, was } = lineTotals(line);
  const img = line.kind === "product" ? line.piece.image : line.image;
  const name = line.kind === "product" ? line.piece.name : line.name;
  const href = line.kind === "product" ? `/p/${line.piece.handle}` : `/combos/${line.slug}`;
  return (
    <li className="cart-line flex gap-4 py-4">
      <Link href={href} className={`shrink-0 overflow-hidden bg-sand ${big ? "size-28" : "size-20"}`}>
        {img && <img src={img} alt="" className="size-full object-cover" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {line.kind === "combo" && (
              <span className="mb-1 inline-block bg-walnut px-1.5 py-0.5 text-[10.5px] font-semibold text-paper">Combo −{line.discountPercent}%</span>
            )}
            <Link href={href} className={`block leading-snug hover:underline ${big ? "text-[14.5px]" : "text-[13.5px]"}`}>{name}</Link>
            {line.kind === "product" ? (
              line.piece.variant && <p className="mt-0.5 text-[12px] text-ink-soft">{line.piece.variant}</p>
            ) : (
              <ul className="mt-1 space-y-0.5 text-[12px] text-ink-soft">
                {line.pieces.map((p) => (
                  <li key={p.variantId}>
                    {p.quantity > 1 && `${p.quantity} × `}
                    {p.name}
                    {p.variant && ` · ${p.variant}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" onClick={() => remove(line.key)} className="-mr-1 -mt-1 p-1 text-ink-soft hover:text-ink" aria-label={`Quitar ${name}`}>
            <CloseIcon className="size-4" />
          </button>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <Stepper line={line} />
          <div className="text-right">
            {was && was > now && <s className="block text-[11.5px] text-ink-soft">{money(was)}</s>}
            <b className="text-[14px] font-semibold">{money(now)}</b>
          </div>
        </div>
      </div>
    </li>
  );
}

export function CartDrawer() {
  const { list, subtotal, units } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => onCartOpen(() => setOpen(true)), []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <div className={`fixed inset-0 z-[65] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
        tabIndex={-1}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-paper shadow-2xl outline-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[16px] font-semibold">
            Tu carrito {units > 0 && <span className="font-normal text-ink-soft">({units})</span>}
          </h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar carrito" className="p-1">
            <CloseIcon className="size-5" />
          </button>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <BagIcon className="size-10 text-ink-soft" />
            <p className="mt-4 text-[15px] font-medium">Tu carrito está vacío</p>
            <p className="mt-1 text-[13px] text-ink-soft">Cuando agregues algo, lo vas a ver acá.</p>
            <button type="button" onClick={() => setOpen(false)} className="mt-6 border border-ink px-6 py-2.5 text-[13.5px] hover:bg-ink hover:text-paper">
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-5 py-3.5">
              <FreeShippingBar subtotal={subtotal} />
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-5">
              {list.map((l) => (
                <CartLineRow key={l.key} line={l} />
              ))}
            </ul>
            <div className="border-t border-line px-5 pb-5 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[14px]">Subtotal</span>
                <b className="text-[18px] font-semibold">{money(subtotal)}</b>
              </div>
              <p className="mt-0.5 text-right text-[12.5px] text-walnut">
                {money(Math.round(subtotal * (1 - TRANSFER_DISCOUNT)))} pagando por transferencia
              </p>
              <Link href="/carrito" className="mt-4 block bg-ink py-3.5 text-center text-[14px] font-medium text-paper hover:bg-ink/90">
                Ir a pagar
              </Link>
              <button type="button" onClick={() => setOpen(false)} className="mt-2 w-full py-2 text-[13px] underline underline-offset-4">
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
