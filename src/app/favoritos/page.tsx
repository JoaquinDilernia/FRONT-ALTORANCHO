import type { Metadata } from "next";
import FavoritesList from "@/components/FavoritesList";

export const metadata: Metadata = { title: "Favoritos — altorancho." };

export default function FavoritosPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-10 lg:px-8">
      <h1 className="text-[40px] font-semibold lowercase leading-none tracking-[-0.04em] md:text-[56px]">favoritos.</h1>
      <p className="mt-3 text-[14px] text-ink-soft">Se guardan en este navegador.</p>
      <FavoritesList />
    </div>
  );
}
