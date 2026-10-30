"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { MenuPhoto, NavItem } from "./Header";
import { ChevronDown, CloseIcon, MenuIcon } from "./Icons";

const href = (n: NavItem) => `/c/${n.handle}`;
const isSale = (n: NavItem) => n.handle === "sale";

export default function CategoryBar({ roots, photos = {} }: { roots: NavItem[]; photos?: Record<number, MenuPhoto[]> }) {
  const [open, setOpen] = useState<number | null>(null);
  const [drawer, setDrawer] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(null);
    setDrawer(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(null), setDrawer(false));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const enter = (id: number) => {
    clearTimeout(closeTimer.current);
    setOpen(id);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };
  const active = roots.find((r) => r.id === open);
  const activePhotos = active ? photos[active.id] ?? [] : [];

  return (
    <>
      <nav aria-label="Categorías" data-sticky-bar className="relative bg-ink text-paper" onMouseLeave={leave}>
        <div className="flex h-11 items-center px-4 lg:px-8">
          <button className="flex items-center gap-2 text-[13px] lg:hidden" onClick={() => setDrawer(true)} aria-expanded={drawer}>
            <MenuIcon className="size-5" /> Categorías
          </button>
          <ul className="hidden w-full items-stretch justify-between lg:flex">
            {roots.map((r) => (
              <li key={r.id} onMouseEnter={() => (r.children.length ? enter(r.id) : setOpen(null))} className="flex">
                <Link
                  href={href(r)}
                  aria-expanded={r.children.length ? open === r.id : undefined}
                  onFocus={() => r.children.length && enter(r.id)}
                  className={`relative flex h-11 items-center px-1 text-[13.5px] after:absolute after:inset-x-1 after:bottom-0 after:h-[3px] after:transition-colors ${
                    open === r.id ? "after:bg-paper" : "after:bg-transparent"
                  } ${isSale(r) ? "font-semibold text-[#ff8a80]" : ""}`}
                >
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {active && (
          <div
            className="absolute inset-x-0 top-full border-b border-line bg-paper text-ink shadow-[0_18px_30px_-20px_rgba(53,52,52,.35)]"
            onMouseEnter={() => enter(active.id)}
          >
            <div className={`grid gap-10 px-8 py-8 ${activePhotos.length ? "grid-cols-[200px_1fr_auto]" : "grid-cols-[220px_1fr]"}`}>
              <div className="border-r border-line pr-8">
                <p className="text-[26px] font-semibold lowercase leading-tight tracking-[-0.02em]">
                  {active.name.replace(/\.$/, "")}.
                </p>
                <Link href={href(active)} className="mt-4 inline-block text-[13px] underline underline-offset-4">
                  Ver todo
                </Link>
              </div>
              <div className={`gap-8 ${activePhotos.length ? "columns-3" : "columns-4"}`}>
                {active.children.map((c) => (
                  <div key={c.id} className="mb-6 break-inside-avoid">
                    <Link href={href(c)} className="text-[13.5px] font-semibold hover:underline underline-offset-4">
                      {c.name}
                    </Link>
                    {c.children.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {c.children.map((g) => (
                          <li key={g.id}>
                            <Link href={href(g)} className="text-[13px] text-ink-soft hover:text-ink">
                              {g.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              {activePhotos.length > 0 && (
                <div className="flex gap-4">
                  {activePhotos.map((p) => (
                    <Link key={p.href} href={p.href} className="group block w-[180px] xl:w-[220px]">
                      <span className="block aspect-[4/5] overflow-hidden bg-sand">
                        <img src={p.src} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      </span>
                      <span className="mt-2 block text-[13px] font-medium underline-offset-4 group-hover:underline">{p.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Categorías">
          <button className="absolute inset-0 bg-ink/40" aria-label="Cerrar menú" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-[380px] overflow-y-auto bg-paper p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xl font-semibold tracking-[-0.03em]">altorancho.</span>
              <button onClick={() => setDrawer(false)} aria-label="Cerrar"><CloseIcon /></button>
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {roots.map((r) => (
                <li key={r.id}>
                  {r.children.length ? (
                    <details>
                      <summary className={`flex items-center justify-between py-3.5 text-[15px] ${isSale(r) ? "font-semibold text-sale" : ""}`}>
                        {r.name} <ChevronDown className="chev size-4 transition-transform" />
                      </summary>
                      <ul className="space-y-2.5 pb-4 pl-3 text-[14px]">
                        <li><Link href={href(r)} className="underline underline-offset-4">Ver todo</Link></li>
                        {r.children.map((c) => (
                          <li key={c.id}><Link href={href(c)}>{c.name}</Link></li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <Link href={href(r)} className="block py-3.5 text-[15px]">{r.name}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
