"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Guarda en el navegador los últimos productos vistos (solo para este visitante).
const KEY = "ar-recent";
const MAX = 12;

export type Recent = { handle: string; name: string; image: string; price: string };

function read(): Recent[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function TrackView({ item }: { item: Recent }) {
  useEffect(() => {
    try {
      const next = [item, ...read().filter((r) => r.handle !== item.handle)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Sin almacenamiento (modo privado): simplemente no se recuerda.
    }
  }, [item]);
  return null;
}

export default function RecentlyViewed({ exclude }: { exclude?: string }) {
  const [items, setItems] = useState<Recent[]>([]);
  useEffect(() => setItems(read().filter((r) => r.handle !== exclude)), [exclude]);
  if (items.length < 2) return null;

  return (
    <section className="mx-auto mt-16 max-w-[1440px] px-4 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-[26px] font-semibold lowercase leading-none tracking-[-0.03em] md:text-[32px]">vistos recientemente.</h2>
        <button
          className="text-[13px] text-ink-soft underline underline-offset-4 hover:text-ink"
          onClick={() => {
            try { localStorage.removeItem(KEY); } catch {}
            setItems([]);
          }}
        >
          Borrar historial
        </button>
      </div>
      <div className="rail auto-cols-[34%] sm:auto-cols-[22%] lg:auto-cols-[calc((100%-112px)/8)]">
        {items.map((r) => (
          <Link key={r.handle} href={`/p/${r.handle}`} className="group block">
            <div className="aspect-square overflow-hidden bg-sand">
              <img src={r.image} alt="" loading="lazy" className="size-full object-cover" />
            </div>
            <p className="mt-2 line-clamp-2 text-[12.5px] leading-snug group-hover:underline underline-offset-4">{r.name}</p>
            <p className="mt-0.5 text-[12.5px] font-medium">{r.price}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
