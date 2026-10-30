"use client";

import { useCallback, useSyncExternalStore } from "react";

// Carrito guardado en el navegador del visitante (mismo patrón que favoritos).
// Los precios son los que se vieron al agregar: al pagar, Tiendanube usa los suyos.
const KEY = "ar-cart";
const EVENT = "ar-cart-change";
const OPEN_EVENT = "ar-cart-open";

export type CartPiece = {
  variantId: number;
  handle: string;
  name: string;
  variant: string; // "Verde / Grande"
  image: string;
  price: number;
  quantity: number; // unidades por cada combo (en productos sueltos es 1)
};

export type CartLine =
  | { key: string; kind: "product"; qty: number; max: number | null; before: number | null; piece: CartPiece }
  | { key: string; kind: "combo"; qty: number; slug: string; name: string; image: string; discountPercent: number; pieces: CartPiece[] };

let snapshot: CartLine[] | null = null;
const EMPTY: CartLine[] = [];

function read(): CartLine[] {
  if (snapshot) return snapshot;
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    snapshot = Array.isArray(v) ? v : [];
  } catch {
    snapshot = [];
  }
  return snapshot;
}

function write(list: CartLine[]) {
  snapshot = list;
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Sin almacenamiento: queda solo en memoria hasta recargar.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      snapshot = null;
      cb();
    }
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

const clampQty = (line: CartLine, qty: number) => {
  const max = line.kind === "product" && line.max != null ? line.max : 99;
  return Math.min(Math.max(qty, 1), max);
};

// Precio de una línea: en combos, la suma de las piezas con el descuento del combo.
export function lineTotals(line: CartLine) {
  if (line.kind === "product") {
    const now = line.piece.price * line.qty;
    return { now, was: line.before ? line.before * line.qty : null };
  }
  const was = line.pieces.reduce((s, p) => s + p.price * p.quantity, 0) * line.qty;
  return { now: Math.round(was * (1 - line.discountPercent / 100)), was };
}

export function cartTotals(list: CartLine[]) {
  let subtotal = 0;
  let units = 0;
  for (const l of list) {
    subtotal += lineTotals(l).now;
    units += l.qty;
  }
  return { subtotal, units };
}

export const openCart = () => window.dispatchEvent(new Event(OPEN_EVENT));
export function onCartOpen(cb: () => void) {
  window.addEventListener(OPEN_EVENT, cb);
  return () => window.removeEventListener(OPEN_EVENT, cb);
}

export function useCart() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);

  const addProduct = useCallback((piece: Omit<CartPiece, "quantity">, qty: number, opts: { max: number | null; before: number | null }) => {
    const cur = read();
    const key = `p:${piece.variantId}`;
    const found = cur.find((l) => l.key === key);
    if (found) {
      write(cur.map((l) => (l === found ? { ...l, qty: clampQty(l, l.qty + qty), max: opts.max } : l)));
    } else {
      const line: CartLine = { key, kind: "product", qty, max: opts.max, before: opts.before, piece: { ...piece, quantity: 1 } };
      write([{ ...line, qty: clampQty(line, qty) }, ...cur]);
    }
    openCart();
  }, []);

  const addCombo = useCallback((combo: { slug: string; name: string; image: string; discountPercent: number; pieces: CartPiece[] }) => {
    const cur = read();
    // Mismo combo con los mismos colores = misma línea.
    const key = `c:${combo.slug}:${combo.pieces.map((p) => p.variantId).join("-")}`;
    const found = cur.find((l) => l.key === key);
    write(found ? cur.map((l) => (l === found ? { ...l, qty: clampQty(l, l.qty + 1) } : l)) : [{ key, kind: "combo", qty: 1, ...combo }, ...cur]);
    openCart();
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    write(read().map((l) => (l.key === key ? { ...l, qty: clampQty(l, qty) } : l)));
  }, []);
  const remove = useCallback((key: string) => write(read().filter((l) => l.key !== key)), []);
  const clear = useCallback(() => write([]), []);

  return { list, ...cartTotals(list), addProduct, addCombo, setQty, remove, clear };
}
