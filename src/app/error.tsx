"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-24 text-center lg:px-8">
      <h1 className="text-[40px] font-semibold lowercase tracking-[-0.04em]">no pudimos cargar esta página.</h1>
      <p className="mt-3 text-[14px] text-ink-soft">El catálogo de Tiendanube no respondió. Probá de nuevo en unos segundos.</p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={reset} className="rounded-full bg-ink px-6 py-3 text-[14px] text-paper">Reintentar</button>
        <Link href="/" className="rounded-full border border-ink px-6 py-3 text-[14px]">Ir al inicio</Link>
      </div>
    </div>
  );
}
