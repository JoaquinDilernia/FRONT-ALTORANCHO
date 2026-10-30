"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Header pegajoso con top negativo: al bajar se va todo lo que está arriba de la
// barra de categorías y queda fija solo la barra. Sin JS de scroll: solo mide la
// altura de lo que tiene que esconder.
export default function StickyHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = ref.current;
    const bar = header?.querySelector<HTMLElement>("[data-sticky-bar]");
    if (!header || !bar) return;
    const measure = () => header.style.setProperty("top", `-${bar.offsetTop}px`);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  return (
    <header ref={ref} className={`sticky ${className}`}>
      {children}
    </header>
  );
}
