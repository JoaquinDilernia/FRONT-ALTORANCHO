import Link from "next/link";
import type { Metadata } from "next";
import { getCombosPage } from "@/lib/combos";
import ComboCard from "@/components/ComboCard";

export const metadata: Metadata = { title: "Combos — altorancho." };

export default async function CombosPage() {
  const { pageTitle, pageIntro, combos } = await getCombosPage();
  return (
    <div className="px-4 pt-6 lg:px-8">
      <nav aria-label="Ubicación" className="text-[12.5px] text-ink-soft">
        <Link href="/" className="hover:text-ink">Inicio</Link>
        <span className="mx-2">/</span>
        <span>Combos</span>
      </nav>
      <h1 className="mt-4 text-[40px] font-semibold lowercase leading-none tracking-[-0.04em] md:text-[56px]">
        {(pageTitle || "combos").replace(/\.$/, "")}.
      </h1>
      <p className="mt-3 max-w-[56ch] text-[14.5px] text-ink-soft">
        {pageIntro || "Piezas que van juntas, con descuento por llevarlas en combo. Elegí el color de cada una."}
      </p>

      {combos.length === 0 ? (
        <div className="mt-10 bg-sand p-10 text-center">
          <p className="text-[15px] font-medium">No hay combos activos en este momento.</p>
          <p className="mt-1 text-[13.5px] text-ink-soft">Mientras tanto, mirá los productos que más se llevan juntos.</p>
          <Link href="/c/the-getaway-club" className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-[14px] text-paper">
            Ver The Getaway Club.
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-3">
          {combos.map((c) => (
            <li key={c.id}><ComboCard combo={c} /></li>
          ))}
        </ul>
      )}
    </div>
  );
}
