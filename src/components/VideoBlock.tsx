"use client";

import { useState } from "react";
import AmbientVideo from "./AmbientVideo";

// Muestra la portada y recién al hacer click carga el reproductor de YouTube.
export default function VideoBlock({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <section className="mt-20 bg-ink">
      <div className="relative mx-auto aspect-video max-h-[86vh] w-full max-w-[1920px]">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <button onClick={() => setPlaying(true)} className="group absolute inset-0 size-full" aria-label={`Reproducir video: ${title}`}>
            <img src={`https://i.ytimg.com/vi_webp/${id}/maxresdefault.webp`} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
            <AmbientVideo id={id} />
            <span className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            <span className="absolute bottom-8 left-4 flex items-center gap-4 text-left text-paper md:bottom-12 md:left-8">
              <span className="grid size-16 place-items-center rounded-full bg-paper text-ink transition-transform group-hover:scale-105 md:size-20">
                <svg viewBox="0 0 24 24" className="ml-1 size-6 md:size-7" fill="currentColor" aria-hidden><path d="M7 4.5v15l12-7.5-12-7.5Z" /></svg>
              </span>
              <span className="text-[15px] font-medium md:text-[17px]">Ver el video con sonido</span>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
