"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useCart, type CartLine } from "@/lib/cart";
import { money } from "@/lib/tiendanube";
import { TRANSFER_DISCOUNT } from "@/content/site";
import { CartLineRow, FreeShippingBar } from "./Cart";
import { BagIcon } from "./Icons";
import ShippingQuote from "./ShippingQuote";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CONTACT_KEY = "ar-contact";

// El cotizador de Tiendanube calcula de a un producto: con varios, se cotiza la pieza más cara
// (en general la más grande) con sus unidades, y se avisa que es una estimación.
function quoteTarget(list: CartLine[]) {
  const pieces = list.flatMap((l) =>
    l.kind === "product" ? [{ variantId: l.piece.variantId, price: l.piece.price, qty: l.qty }] : l.pieces.map((p) => ({ variantId: p.variantId, price: p.price, qty: p.quantity * l.qty })),
  );
  const top = pieces.sort((a, b) => b.price - a.price)[0];
  return { variantId: top?.variantId, quantity: top?.qty ?? 1, exact: pieces.length === 1 };
}

// Evita el parpadeo de "carrito vacío" antes de leer el navegador.
const useHydrated = () => useSyncExternalStore(() => () => {}, () => true, () => false);

export default function CartPage() {
  const { list, subtotal, units } = useCart();
  const hydrated = useHydrated();

  if (!hydrated) return <div className="min-h-[60vh]" />;

  if (list.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-20 text-center">
        <BagIcon className="size-12 text-ink-soft" />
        <h1 className="mt-5 text-[26px] font-semibold tracking-[-0.03em]">Tu carrito está vacío</h1>
        <p className="mt-2 text-[14px] text-ink-soft">Date una vuelta por la tienda y agregá lo que te guste.</p>
        <Link href="/" className="mt-7 bg-ink px-8 py-3.5 text-[14px] font-medium text-paper">Ir a la tienda</Link>
      </div>
    );
  }

  const target = quoteTarget(list);
  const transfer = Math.round(subtotal * (1 - TRANSFER_DISCOUNT));

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:py-12">
      <h1 className="text-[30px] font-semibold tracking-[-0.03em] md:text-[36px]">
        Tu carrito <span className="text-[18px] font-normal text-ink-soft">({units} {units === 1 ? "producto" : "productos"})</span>
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
        <div>
          <FreeShippingBar subtotal={subtotal} />
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {list.map((l) => (
              <CartLineRow key={l.key} line={l} big />
            ))}
          </ul>
          <Link href="/" className="mt-5 inline-block text-[13.5px] underline underline-offset-4">← Seguir comprando</Link>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="bg-sand p-5 sm:p-6">
            <h2 className="text-[16px] font-semibold">Resumen</h2>
            <dl className="mt-4 space-y-2 text-[14px]">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
              <div className="flex justify-between text-ink-soft"><dt>Envío</dt><dd>Se elige al pagar</dd></div>
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-ink/10 pt-4">
              <span className="text-[15px] font-medium">Total</span>
              <b className="text-[22px] font-semibold">{money(subtotal)}</b>
            </div>
            <p className="mt-1 text-right text-[13px] text-walnut">
              o <b className="font-semibold">{money(transfer)}</b> por transferencia (−{TRANSFER_DISCOUNT * 100}%)
            </p>

            <Checkout lines={list} />
          </div>

          <ShippingQuote variantId={target.variantId} quantity={target.quantity} />
          {!target.exact && (
            <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
              Estimación con el producto más grande del carrito. El costo final del envío se confirma al pagar.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

function Checkout({ lines }: { lines: CartLine[] }) {
  const [contact, setContact] = useState(() => {
    try {
      return { name: "", lastname: "", email: "", ...JSON.parse(localStorage.getItem(CONTACT_KEY) ?? "{}") };
    } catch {
      return { name: "", lastname: "", email: "" };
    }
  });
  const [state, setState] = useState<{ kind: "idle" | "sending" | "leaving" | "error"; msg?: string }>({ kind: "idle" });
  const valid = contact.name.trim() && contact.lastname.trim() && EMAIL.test(contact.email.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    try { localStorage.setItem(CONTACT_KEY, JSON.stringify(contact)); } catch {}
    setState({ kind: "sending" });
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, lines }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    if (!res?.ok || !data?.url) return setState({ kind: "error", msg: data?.error ?? "No pudimos iniciar el pago. Probá de nuevo." });
    setState({ kind: "leaving" });
    // Un instante para que se lea la pantalla de transición antes de cambiar de sitio.
    setTimeout(() => window.location.assign(data.url), 900);
  };

  const field = "w-full border border-ink/15 bg-paper px-3 py-2.5 text-[14px] outline-none focus:border-ink";
  return (
    <>
      <form onSubmit={submit} className="mt-6 border-t border-ink/10 pt-5">
        <h3 className="text-[14px] font-medium">Tus datos</h3>
        <p className="mt-0.5 text-[12px] text-ink-soft">Para el comprobante y el seguimiento del pedido.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <label className="sr-only" htmlFor="ck-name">Nombre</label>
          <input id="ck-name" autoComplete="given-name" placeholder="Nombre" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className={field} />
          <label className="sr-only" htmlFor="ck-last">Apellido</label>
          <input id="ck-last" autoComplete="family-name" placeholder="Apellido" value={contact.lastname} onChange={(e) => setContact({ ...contact, lastname: e.target.value })} className={field} />
          <label className="sr-only" htmlFor="ck-email">Email</label>
          <input id="ck-email" type="email" autoComplete="email" placeholder="Email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className={`${field} col-span-2`} />
        </div>
        <button disabled={!valid || state.kind === "sending"} className="mt-4 w-full bg-ink py-3.5 text-[14px] font-medium text-paper transition-colors hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-40">
          {state.kind === "sending" ? "Preparando tu pedido…" : "Finalizar compra"}
        </button>
        {state.kind === "error" && <p className="mt-3 text-[13px] text-sale" role="alert">{state.msg}</p>}
        <p className="mt-3 text-center text-[12px] text-ink-soft">Pago seguro con Tiendanube · cuotas y transferencia</p>
      </form>

      {state.kind === "leaving" && (
        <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-paper text-center">
          <p className="gate-in text-[34px] font-semibold tracking-[-0.04em]">altorancho.</p>
          <p className="gate-in mt-3 text-[14px] text-ink-soft" style={{ animationDelay: "150ms" }}>Te llevamos al pago seguro…</p>
          <span className="mt-6 h-5 w-5 animate-spin rounded-full border-2 border-ink border-t-transparent" />
        </div>
      )}
    </>
  );
}
