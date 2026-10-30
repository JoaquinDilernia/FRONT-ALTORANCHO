"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "./Icons";

type Hit = { handle: string; name: string; image: string; price: string; before: string | null };

function useSuggestions(q: string) {
  const [state, setState] = useState<{ q: string; total: number; items: Hit[]; loading: boolean }>({ q: "", total: 0, items: [], loading: false });
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setState({ q: term, total: 0, items: [], loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/buscar?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => setState({ q: term, total: d.total, items: d.items, loading: false }))
        .catch(() => {});
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);
  return state;
}

function Results({ q, onPick }: { q: string; onPick: () => void }) {
  const s = useSuggestions(q);
  if (q.trim().length < 2) return null;
  return (
    <div className="bg-paper text-ink">
      {s.loading && s.items.length === 0 ? (
        <p className="px-4 py-5 text-[13px] text-ink-soft">Buscando…</p>
      ) : s.items.length === 0 ? (
        <p className="px-4 py-5 text-[13px]">No encontramos productos para “{s.q}”. Probá con otra palabra o un SKU.</p>
      ) : (
        <>
          <ul>
            {s.items.map((h) => (
              <li key={h.handle}>
                <Link href={`/p/${h.handle}`} onClick={onPick} className="flex items-center gap-3 px-4 py-2.5 hover:bg-sand">
                  <span className="size-12 shrink-0 overflow-hidden bg-sand">{h.image && <img src={h.image} alt="" className="size-full object-cover" />}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px]">{h.name}</span>
                    <span className="text-[13px] font-medium">{h.price}</span>
                    {h.before && <s className="ml-2 text-[12px] text-ink-soft">{h.before}</s>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={`/buscar?q=${encodeURIComponent(s.q)}`} onClick={onPick} className="block border-t border-line px-4 py-3 text-[13px] underline underline-offset-4">
            Ver los {s.total} resultados
          </Link>
        </>
      )}
    </div>
  );
}

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const box = useRef<HTMLFormElement>(null);
  const id = useId();

  useEffect(() => {
    setOpen(false);
    setMobile(false);
  }, [pathname]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    setMobile(false);
    router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      <form ref={box} onSubmit={submit} role="search" className="relative hidden max-w-[340px] md:block">
        <div className="flex items-center gap-2 border-b border-ink/30 pb-1 focus-within:border-ink">
          <SearchIcon className="size-[18px] shrink-0" />
          <label htmlFor={id} className="sr-only">Buscar productos</label>
          <input
            id={id}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
            placeholder="¿Qué estás buscando?"
            autoComplete="off"
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft"
          />
        </div>
        {open && (
          <div className="absolute left-0 top-full z-50 mt-2 w-[420px] border border-line shadow-[0_12px_30px_-12px_rgba(53,52,52,.35)] empty:hidden">
            <Results q={q} onPick={() => setOpen(false)} />
          </div>
        )}
      </form>

      <button className="md:hidden" aria-label="Buscar" onClick={() => setMobile(true)}>
        <SearchIcon />
      </button>
      {mobile && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-paper md:hidden" role="dialog" aria-modal="true" aria-label="Buscar">
          <form onSubmit={submit} role="search" className="sticky top-0 flex items-center gap-3 border-b border-line bg-paper px-4 py-3">
            <SearchIcon className="size-5 shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="¿Qué estás buscando?"
              aria-label="Buscar productos"
              enterKeyHint="search"
              className="w-full bg-transparent py-1 text-[16px] outline-none"
            />
            <button type="button" onClick={() => setMobile(false)} aria-label="Cerrar búsqueda"><CloseIcon /></button>
          </form>
          <Results q={q} onPick={() => setMobile(false)} />
        </div>
      )}
    </>
  );
}
