import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCombosPage } from "@/lib/combos";
import ComboView from "@/components/ComboView";
import ComboCard, { defaultPicks } from "@/components/ComboCard";

async function find(slug: string) {
  const { combos } = await getCombosPage();
  return { combo: combos.find((c) => c.slug === slug), others: combos.filter((c) => c.slug !== slug) };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { combo } = await find((await params).slug);
  return { title: combo ? `${combo.name} — altorancho.` : "Combo no encontrado" };
}

export default async function ComboPage({ params }: { params: Promise<{ slug: string }> }) {
  const { combo, others } = await find((await params).slug);
  if (!combo) notFound();

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-4 pt-6 lg:px-8">
        <nav aria-label="Ubicación" className="mb-5 text-[12.5px] text-ink-soft">
          <Link href="/" className="hover:text-ink">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href="/combos" className="hover:text-ink">Combos</Link>
          <span className="mx-2">/</span>
          <span>{combo.name}</span>
        </nav>
        <ComboView combo={combo} initialPicks={defaultPicks(combo)} />
      </div>
      {others.length > 0 && (
        <section className="mx-auto mt-20 max-w-[1440px] px-4 lg:px-8">
          <h2 className="mb-6 text-[26px] font-semibold leading-none tracking-[-0.03em] md:text-[32px]">otros combos.</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {others.slice(0, 4).map((c) => <li key={c.id}><ComboCard combo={c} /></li>)}
          </ul>
        </section>
      )}
    </>
  );
}
