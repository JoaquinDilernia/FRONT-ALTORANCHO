"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// Cambia el orden apenas se elige una opción (sin botón "Aplicar").
export function SortSelect({ value, options }: { value: string; options: readonly (readonly [string, string])[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <label htmlFor="orden" className="text-ink-soft">Ordenar por</label>
      <select
        id="orden"
        value={value}
        onChange={(e) => {
          const sp = new URLSearchParams(params.toString());
          sp.set("orden", e.target.value);
          sp.delete("page");
          router.push(`${pathname}?${sp}`);
        }}
        className="border border-line bg-paper px-3 py-2"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

// En mobile los filtros quedan plegados detrás de un botón; en desktop siempre visibles.
export function FiltersPanel({ count, children }: { count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <aside className="text-[13.5px]">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between border border-ink px-4 py-3 font-medium lg:hidden"
      >
        <span>Filtros{count > 0 && ` (${count})`}</span>
        <span>{open ? "Cerrar" : "Ver"}</span>
      </button>
      <div className={`${open ? "block" : "hidden"} pt-4 lg:block lg:pt-0`}>{children}</div>
    </aside>
  );
}
