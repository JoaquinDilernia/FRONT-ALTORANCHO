"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Prende las lámparas del bloque una por una la primera vez que entra en pantalla.
// El escalonado y el fundido están en globals.css ([data-autolit]).
export default function AutoLight({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-autolit={on ? "on" : "off"}>
      {children}
    </div>
  );
}
