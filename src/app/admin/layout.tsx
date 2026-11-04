import type { Metadata } from "next";

export const metadata: Metadata = { title: "Panel — altorancho.", robots: { index: false, follow: false } };

// El panel tapa el header y el footer de la tienda, igual que /acceso.
export default function AdminShell({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#f6f4f1] text-ink">{children}</div>;
}
