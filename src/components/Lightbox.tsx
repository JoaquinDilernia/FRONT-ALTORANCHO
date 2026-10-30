"use client";

import { useEffect, useRef } from "react";
import { CloseIcon } from "./Icons";

// Visor a pantalla completa de la galería. Flechas del teclado, Esc y deslizar.
export default function Lightbox({
  images,
  index,
  onIndex,
  onClose,
  title,
}: {
  images: string[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  title: string;
}) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const go = (d: number) => onIndex((index + d + images.length) % images.length);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-paper"
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${title}`}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 lg:px-8">
        <p className="text-[13px] text-ink-soft">
          {index + 1} de {images.length}
        </p>
        <button ref={closeBtn} onClick={onClose} aria-label="Cerrar fotos" className="grid size-10 place-items-center hover:bg-sand">
          <CloseIcon />
        </button>
      </div>
      <div className="relative min-h-0 flex-1">
        <img src={images[index]} alt={`${title}, foto ${index + 1}`} className="absolute inset-0 m-auto max-h-full max-w-full object-contain" />
        {images.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Foto anterior" className="absolute left-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-[22px] shadow lg:left-8">
              ‹
            </button>
            <button onClick={() => go(1)} aria-label="Foto siguiente" className="absolute right-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-[22px] shadow lg:right-8">
              ›
            </button>
          </>
        )}
      </div>
      <ul className="flex justify-center gap-2 overflow-x-auto px-4 py-3">
        {images.map((src, i) => (
          <li key={src + i}>
            <button
              onClick={() => onIndex(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
              className={`block size-14 overflow-hidden bg-sand ${i === index ? "ring-1 ring-ink" : "opacity-60 hover:opacity-100"}`}
            >
              <img src={src.replace(/-1024-1024(\.\w+)$/, "-240-0$1")} alt="" className="size-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
