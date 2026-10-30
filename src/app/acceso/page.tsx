import type { Metadata } from "next";
import { media, VIDEOS } from "@/content/site";
import AmbientVideo from "@/components/AmbientVideo";
import GateForm from "./GateForm";

export const metadata: Metadata = { title: "altorancho. — acceso" };

export default async function AccesoPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/" } = await searchParams;
  return (
    // Tapa el header y el footer del layout: esta pantalla va sola.
    <div className="fixed inset-0 z-[70] overflow-hidden bg-ink text-paper">
      <img
        src={media("a4031d72-newletter_summer", 1920)}
        alt=""
        className="gate-zoom absolute inset-0 h-full w-full object-cover"
      />
      <AmbientVideo id={VIDEOS.getaway.id} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

      <div className="relative flex h-full flex-col px-6 py-8 sm:px-12 sm:py-10">
        <p className="gate-in text-[12px] uppercase tracking-[0.28em] text-paper/70" style={{ animationDelay: "100ms" }}>
          Preview privada
        </p>

        <div className="mt-auto max-w-xl pb-6 sm:pb-12">
          <h1
            className="gate-in text-[64px] font-semibold leading-[0.9] tracking-[-0.05em] sm:text-[112px]"
            style={{ animationDelay: "250ms" }}
          >
            altorancho.
          </h1>
          <p className="gate-in mt-5 max-w-sm text-[15px] leading-relaxed text-paper/80" style={{ animationDelay: "450ms" }}>
            Estamos armando una casa nueva. Si tenés la clave, pasá y mirá.
          </p>
          <div className="gate-in mt-8" style={{ animationDelay: "650ms" }}>
            <GateForm next={next} />
          </div>
        </div>
      </div>
    </div>
  );
}
