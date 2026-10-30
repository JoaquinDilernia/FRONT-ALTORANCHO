import Link from "next/link";
import { getCategoryByHandle, searchProducts, type CategoryNode } from "@/lib/tiendanube";
import ProductRail from "./Rail";
import ShopTheRoom from "./ShopTheRoom";
import VideoBlock from "./VideoBlock";

const MEDIA = "https://acdn-us.mitiendanube.com/stores/002/547/699/media";
const media = (id: string, w: 1024 | 1400) => `${MEDIA}/${id}/webp/${w}.webp`;

const TRENDS = [
  { handle: "tendencia-timeless", title: "Tendencia Timeless.", copy: "Negro, greige y vidrio. Piezas sobrias que combinan con lo que ya tenés.", image: "f1f2c4ac-_c6a5923" },
  { handle: "tendencia-fresh", title: "Tendencia Fresh.", copy: "Verdes, celestes y tonos claros para la galería y el jardín.", image: "b7d4a3bf-img_0003_1_vertical" },
  { handle: "tendencia-iconic", title: "Tendencia Iconic.", copy: "Malbec, azul profundo y rayas. Color para animarse.", image: "9361c8bc-_c6a6103" },
];

// Página de colección para The Getaway Club (reemplaza el listado común de esa categoría).
export default async function GetawayLanding({ category }: { category: CategoryNode | null }) {
  const trends = await Promise.all(
    TRENDS.map(async (t) => {
      const cat = await getCategoryByHandle(t.handle).catch(() => null);
      const products = cat ? (await searchProducts({ categoryId: cat.id, perPage: 12, sortBy: "user" })).data : [];
      return { ...t, products };
    }),
  );
  const rooms = (category?.children ?? []).filter((c) => !c.handle.startsWith("tendencia"));

  return (
    <>
      <section className="px-4 pb-10 pt-8 lg:px-8 lg:pt-12">
        <nav aria-label="Ubicación" className="text-[12.5px] text-ink-soft">
          <Link href="/" className="hover:text-ink">Inicio</Link>
          <span className="mx-2">/</span>
          <span>The Getaway Club.</span>
        </nav>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <h1 className="text-[52px] font-semibold leading-[0.9] tracking-[-0.05em] md:text-[96px]">The Getaway Club.</h1>
          <div>
            <p className="max-w-[44ch] text-[15px] leading-relaxed text-ink-soft">
              La colección de exterior de altorancho.: muebles de chapa, sillas tejidas y luz inalámbrica para armar un lugar donde quedarse afuera. Tres tendencias, un mismo club.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {rooms.map((c) => (
                <li key={c.id}>
                  <Link href={`/c/the-getaway-club?sub=${c.id}&todo=1`} className="inline-block rounded-full border border-ink px-4 py-2 text-[13px] hover:bg-ink hover:text-paper">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/c/the-getaway-club?todo=1" className="inline-block rounded-full bg-ink px-4 py-2 text-[13px] text-paper">Ver todo</Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <VideoBlock id="ZDxuV-Hv1Po" title="The Getaway Club." />

      {trends.map((t, i) => (
        <section key={t.handle} className="mt-20">
          <div className="grid gap-8 px-4 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8">
            <Link href={`/c/${t.handle}`} className={`block aspect-[9/10] overflow-hidden bg-sand ${i % 2 ? "lg:order-2" : ""}`}>
              <img src={media(t.image, 1400)} alt="" loading="lazy" className="size-full object-cover" />
            </Link>
            <div>
              <h2 className="text-[40px] font-semibold leading-[0.95] tracking-[-0.04em] md:text-[64px]">{t.title}</h2>
              <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-ink-soft">{t.copy}</p>
              <Link href={`/c/${t.handle}`} className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-[14px] text-paper">
                Comprar {t.title.replace(/\.$/, "")}
              </Link>
            </div>
          </div>
          <ProductRail title={`piezas ${t.title.split(" ")[1].replace(".", "").toLowerCase()}.`} href={`/c/${t.handle}`} products={t.products} />
        </section>
      ))}

      <ShopTheRoom
        image={media("cb6a2f05-_c6a6260", 1400)}
        ratio={480 / 533}
        alt="Comedor exterior con sillas Menorca y mesa Urban en tono malbec"
        title="armá tu comedor afuera."
        copy="Sillas Menorca y mesa Urban de chapa, pensadas para quedarse en la galería todo el año."
        hotspots={[
          { handle: "silla-con-estructura-metalica-y-tejido-en-asiento-y-respaldo-vino-yuxok", x: 22, y: 64 },
          { handle: "mesa-rectangular-de-chapa-color-malbec-1pu7l", x: 64, y: 44 },
        ]}
      />
      <ShopTheRoom
        reverse
        image={media("8d2a1445-_c6a6112", 1400)}
        ratio={480 / 320}
        alt="Sillones Fold y mesa ratona Urban sobre el pasto"
        title="un living bajo los árboles."
        copy="Sillones Fold de chapa plegada y mesa ratona Urban. Livianos para moverlos a la sombra."
        hotspots={[
          { handle: "sillon-individual-de-chapa-plegada-greige-1k04n", x: 20, y: 56 },
          { handle: "mesa-ratona-rectangular-de-chapa-greige-978zw", x: 46, y: 62 },
          { handle: "sillon-doble-de-chapa-plegada-greige-opw7q", x: 62, y: 46 },
        ]}
      />

      <section className="mt-20 px-4 text-center lg:px-8">
        <Link href="/c/the-getaway-club?todo=1" className="inline-block rounded-full border border-ink px-8 py-3.5 text-[14px] hover:bg-ink hover:text-paper">
          Ver todos los productos de The Getaway Club.
        </Link>
      </section>
    </>
  );
}
