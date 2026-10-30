"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

// Lámparas: la primera foto es apagada y la segunda prendida.
export function LightSwitch({ on, onToggle, className = "", label }: { on: boolean; onToggle: () => void; className?: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={on}
      className={`inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-[12.5px] font-medium shadow-sm transition-colors ${
        on ? "bg-ink text-paper" : "bg-paper/95 text-ink ring-1 ring-line hover:bg-paper"
      } ${className}`}
    >
      <span className={`relative h-5 w-9 rounded-full transition-colors ${on ? "bg-[#f3c969]" : "bg-line"}`} aria-hidden>
        <span className={`absolute top-0.5 size-4 rounded-full bg-paper shadow transition-[left] ${on ? "left-[18px]" : "left-0.5"}`} />
      </span>
      {label ?? (on ? "Prendida" : "Apagada")}
    </button>
  );
}

// Un solo botón para el listado: prende o apaga todas las lámparas a la vez
// (marca <html data-lights="on"> y el CSS muestra la foto prendida de cada tarjeta).
export function LightsToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.lights = on ? "on" : "off";
  }, [on]);
  useEffect(() => () => void delete document.documentElement.dataset.lights, []);
  return <LightSwitch on={on} onToggle={() => setOn((v) => !v)} label={on ? "Apagar las lámparas" : "Prender las lámparas"} />;
}

// Foto de la tarjeta de producto. En las lámparas la 2ª foto no aparece en hover:
// la muestra el botón general del listado.
export function CardMedia({
  href,
  first,
  second,
  light,
  children,
}: {
  href: string;
  first: ReactNode;
  second: ReactNode;
  light: boolean;
  children?: ReactNode;
}) {
  return (
    <Link href={href} className="block">
      <div className="relative aspect-square overflow-hidden bg-sand">
        {first}
        {second && (
          <div className={`absolute inset-0 transition-opacity duration-300 ${light ? "lit-layer" : "opacity-0 group-hover:opacity-100"}`}>{second}</div>
        )}
        {children}
      </div>
    </Link>
  );
}
