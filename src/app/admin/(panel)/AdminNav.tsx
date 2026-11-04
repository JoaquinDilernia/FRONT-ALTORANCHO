"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/home", label: "Home" },
  { href: "/admin/promos", label: "Promos" },
  { href: "/admin/ayuda", label: "Ayuda" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Secciones del panel" className="flex gap-1">
      {LINKS.map((l) => {
        const active = path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-[13.5px] transition-colors ${active ? "bg-ink text-paper" : "text-ink-soft hover:bg-ink/5 hover:text-ink"}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
