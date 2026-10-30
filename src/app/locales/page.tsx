import type { Metadata } from "next";
import { STORES, WHATSAPP } from "@/lib/store";

export const metadata: Metadata = { title: "Locales — altorancho." };

export default function LocalesPage() {
  return (
    <div className="px-4 pt-10 lg:px-8">
      <h1 className="text-[40px] font-semibold lowercase leading-none tracking-[-0.04em] md:text-[56px]">locales.</h1>
      <p className="mt-3 max-w-[52ch] text-[14.5px] text-ink-soft">
        Vení a ver los muebles y las lámparas en persona. Si querés confirmar el stock de algo antes de ir, escribinos por WhatsApp.
      </p>
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {STORES.map((s) => (
          <li key={s.name} className="border border-line">
            <iframe
              title={`Mapa de ${s.name}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(`Alto Rancho ${s.name}`)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[4/3] w-full border-0 bg-sand"
            />
            <div className="p-5">
              <h2 className="text-[18px] font-semibold tracking-[-0.02em]">{s.name}</h2>
              {s.detail && <p className="text-[13.5px] text-ink-soft">{s.detail}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={s.map} target="_blank" rel="noopener" className="rounded-full bg-ink px-4 py-2 text-[13px] text-paper">Cómo llegar</a>
                <a href={WHATSAPP} target="_blank" rel="noopener" className="rounded-full border border-ink px-4 py-2 text-[13px]">Consultar stock</a>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
