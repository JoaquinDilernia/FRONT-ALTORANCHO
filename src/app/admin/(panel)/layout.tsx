import Link from "next/link";
import { usesFirebase } from "@/lib/contentStore";
import { logout } from "../actions";
import AdminNav from "./AdminNav";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const ephemeral = !usesFirebase() && process.env.NODE_ENV === "production";
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-8">
          <Link href="/admin/home" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="altorancho." width={800} height={136} className="h-5 w-auto" />
            <span className="text-[12px] uppercase tracking-[0.18em] text-ink-soft">Panel</span>
          </Link>
          <AdminNav />
          <div className="ml-auto flex items-center gap-4 text-[13px]">
            <a href="/" target="_blank" rel="noopener" className="text-ink-soft hover:text-ink">Ver tienda ↗</a>
            <form action={logout}>
              <button className="text-ink-soft hover:text-ink">Salir</button>
            </form>
          </div>
        </div>
      </header>
      {ephemeral && (
        <p className="bg-sale px-4 py-2 text-center text-[13px] text-paper">
          Falta conectar Firebase: lo que guardes se pierde en el próximo deploy.
        </p>
      )}
      <main className="mx-auto max-w-5xl px-4 pt-8 sm:px-8">{children}</main>
    </div>
  );
}
