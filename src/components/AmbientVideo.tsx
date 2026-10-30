"use client";

import { useEffect, useState } from "react";

// Video de YouTube mudo y en loop detrás de la portada. Solo en pantallas grandes,
// sin "reducir movimiento" ni ahorro de datos, y recién cuando la página terminó de cargar.
// Aparece con un fundido cuando ya está reproduciendo; hasta entonces se ve la portada.
export default function AmbientVideo({ id }: { id: string }) {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const ok =
      window.matchMedia("(min-width: 1024px)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !conn?.saveData;
    if (!ok) return;
    const start = () => setEnabled(true);
    if (document.readyState === "complete") {
      const t = setTimeout(start, 600);
      return () => clearTimeout(t);
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  if (!enabled) return null;
  const params = `autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1&rel=0&disablekb=1&iv_load_policy=3`;
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`} aria-hidden>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?${params}`}
        title=""
        tabIndex={-1}
        allow="autoplay; encrypted-media"
        // El reproductor muestra su barra de título unos segundos al arrancar: se espera antes del fundido.
        onLoad={() => setTimeout(() => setVisible(true), 1800)}
        className="absolute left-1/2 top-1/2 aspect-video w-full min-h-full -translate-x-1/2 -translate-y-1/2 scale-[1.15]"
      />
    </div>
  );
}
