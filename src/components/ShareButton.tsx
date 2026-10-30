"use client";

import { useState } from "react";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin permiso de portapapeles: no hay nada más que hacer sin abrir un diálogo.
    }
  };
  return (
    <button onClick={share} className="text-[12.5px] text-ink-soft underline underline-offset-4 hover:text-ink" aria-live="polite">
      {copied ? "Link copiado" : "Compartir"}
    </button>
  );
}
