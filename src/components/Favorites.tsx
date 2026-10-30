"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore, useState } from "react";
import { HeartIcon } from "./Icons";

// Favoritos guardados en el navegador del visitante.
const KEY = "ar-favs";
const EVENT = "ar-favs-change";

export type Fav = { handle: string; name: string; image: string; price: string };

let snapshot: Fav[] | null = null;
const EMPTY: Fav[] = [];

function read(): Fav[] {
  if (snapshot) return snapshot;
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    snapshot = Array.isArray(v) ? v : [];
  } catch {
    snapshot = [];
  }
  return snapshot;
}

function write(list: Fav[]) {
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

export function useFavorites() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = useCallback((f: Fav) => {
    const cur = read();
    write(cur.some((x) => x.handle === f.handle) ? cur.filter((x) => x.handle !== f.handle) : [f, ...cur]);
  }, []);
  const remove = useCallback((handle: string) => write(read().filter((x) => x.handle !== handle)), []);
  return { list, toggle, remove, has: (h: string) => list.some((x) => x.handle === h) };
}

export function FavButton({ fav, className = "", size = "size-5" }: { fav: Fav; className?: string; size?: string }) {
  const { has, toggle } = useFavorites();
  const on = has(fav.handle);
  // Cambia en cada "guardar" para volver a disparar la animación del corazón.
  const [pops, setPops] = useState(0);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!on) setPops((n) => n + 1);
        toggle(fav);
      }}
      aria-pressed={on}
      aria-label={on ? `Quitar ${fav.name} de favoritos` : `Guardar ${fav.name} en favoritos`}
      title={on ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={className}
    >
      <HeartIcon key={pops} className={`${size} ${on ? "fill-sale text-sale" : ""} ${on && pops ? "heart-pop" : ""}`} />
    </button>
  );
}

export function FavCount() {
  const { list } = useFavorites();
  return (
    <Link href="/favoritos" className="relative inline-flex" aria-label={`Favoritos (${list.length})`} title="Favoritos">
      <HeartIcon />
      {list.length > 0 && (
        <span key={list.length} className="badge-bump absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-semibold leading-4 text-paper">
          {list.length}
        </span>
      )}
    </Link>
  );
}
