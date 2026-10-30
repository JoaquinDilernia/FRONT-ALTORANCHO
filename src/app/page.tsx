import Link from "next/link";
import { getCategoryByHandle, searchProducts, sized } from "@/lib/tiendanube";
import ProductRail, { SectionTitle } from "@/components/Rail";
import ShopTheRoom from "@/components/ShopTheRoom";
import VideoBlock from "@/components/VideoBlock";
import RecentlyViewed from "@/components/RecentlyViewed";
import BannerMedia from "@/components/BannerMedia";
import BenefitsStrip from "@/components/BenefitsStrip";
import HeroActions from "@/components/HeroActions";
import { CATEGORY_HERO, VIDEOS, media } from "@/content/site";

// El orden sigue la home de altorancho.com; entre medio van las secciones propias de esta versión.

// Los cuatro accesos debajo del banner principal, con las mismas fotos de la web actual.
const SPOTLIGHT = [
  { label: "New in", href: "/c/new-in-1gtoi", image: "2d0b160b-lmparahongoarayasenjardn" },
  { label: "Mushrooms", href: "/c/mushroom", image: "264e50eb-altorancho-fresh-368" },
  { label: "Mini size", href: "/c/mini-size-15xo8", image: "93438e41-altorancho-fresh-477" },
  { label: "Outdoor", href: "/c/outdoor1", image: "606a49a8-altorancho-timeless-479" },
];

const GETAWAY = [
  { image: "cb6a2f05-_c6a6260", title: "The Getaway Club.", copy: "La colección de exterior completa.", href: "/c/the-getaway-club" },
  { image: "f1f2c4ac-_c6a5923", title: "Tendencia Timeless.", copy: "Negro, vidrio y flores blancas.", href: "/c/tendencia-timeless" },
  { image: "9361c8bc-_c6a6103", title: "Tendencia Iconic.", copy: "Piezas con carácter propio.", href: "/c/tendencia-iconic" },
  { image: "b7d4a3bf-img_0003_1_vertical", title: "Tendencia Fresh.", copy: "Tonos claros para comer afuera.", href: "/c/tendencia-fresh" },
];

const TILES = [
  { handle: "muebles", label: "Muebles" },
  { handle: "sillas", label: "Sillas" },
  { handle: "iluminacion41", label: "Iluminación" },
  { handle: "bazar", label: "Bazar" },
  { handle: "textil", label: "Textil" },
  { handle: "decoracion", label: "Decoración" },
  { handle: "sale", label: "SALE" },
];

// Subcategorías de SALE, con el nombre que les pone la tienda ("Hasta 30% OFF en sillas")
const SALES = ["hasta-30-off-en-sillas", "hasta-30-off-en-iluminacion", "hasta-40-off-en-muebles", "hasta-40-off-en-deco-bazar"];

async function category(handle: string, perPage = 10, sortBy = "best-selling") {
  const cat = await getCategoryByHandle(handle).catch(() => null);
  if (!cat) return { cat: null, products: [] };
  return { cat, products: (await searchProducts({ categoryId: cat.id, perPage, sortBy })).data };
}

export default async function Home() {
  const [wirelessBest, newIn, outdoorFurniture, outdoorChairs, rey, best, tiles, sales] = await Promise.all([
    category("lamparas-inalambricas", 4).then((r) => r.products),
    category("new-in-1gtoi", 12, "created-at-descending").then((r) => r.products),
    category("muebles1", 12).then((r) => r.products),
    category("sillas2", 12).then((r) => r.products),
    category("silla-rey", 12).then((r) => r.products),
    searchProducts({ sortBy: "best-selling", perPage: 12 }).then((r) => r.data),
    Promise.all(TILES.map((t) => category(t.handle, 6).then((r) => r.products))),
    Promise.all(SALES.map((h) => category(h, 4))),
  ]);

  // Cada categoría muestra un producto distinto (los más vendidos se repiten entre Muebles y Sillas).
  const used = new Set<number>();
  const tileImages = tiles.map((list) => {
    const p = list.find((x) => !used.has(x.id) && x.images[0]) ?? list[0];
    if (p) used.add(p.id);
    return p?.images[0];
  });

  return (
    <>
      <h1 className="sr-only">altorancho. Muebles, iluminación y deco</h1>

      {/* Banner principal de la web actual (horizontal en desktop, vertical en mobile) */}
      <BannerMedia banner={CATEGORY_HERO["lamparas-inalambricas"]} variant="hero" />
      <HeroActions
        primary={{ label: "Comprar lámparas inalámbricas", href: "/c/lamparas-inalambricas" }}
        actions={[
          { label: "Las más vendidas", href: "/c/lamparas-inalambricas?orden=best-selling#productos" },
          { label: "Menor precio", href: "/c/lamparas-inalambricas?orden=price-ascending#productos" },
          { label: "Ver el video", href: "#video-getaway" },
        ]}
        products={wirelessBest}
        productsTitle="Las más elegidas"
      />

      <section className="mx-auto mt-4 grid max-w-[1440px] grid-cols-2 gap-3 px-4 md:grid-cols-4 md:gap-4 lg:px-8">
        {SPOTLIGHT.map((s) => (
          <Link key={s.href} href={s.href} className="group relative block aspect-[4/5] overflow-hidden bg-sand">
            <img src={media(s.image, 640)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-4 text-[20px] font-semibold tracking-[-0.03em] text-paper md:p-5 md:text-[26px]">{s.label}</span>
          </Link>
        ))}
      </section>

      <ProductRail title="New in | Lámparas inalámbricas" href="/c/new-in-1gtoi" products={newIn} autoLight />

      <div id="video-getaway" className="scroll-mt-4">
        <VideoBlock id={VIDEOS.getaway.id} title={VIDEOS.getaway.title} />
      </div>

      <section className="mx-auto mt-6 max-w-[1440px] px-4 lg:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {GETAWAY.map((t) => (
            <Link key={t.image} href={t.href} className="group block">
              <div className="aspect-[4/5] overflow-hidden bg-sand">
                <img src={media(t.image, 640)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
              </div>
              <p className="mt-3 text-[16px] font-semibold tracking-[-0.02em] md:text-[18px]">{t.title}</p>
              <p className="text-[13px] text-ink-soft">{t.copy}</p>
            </Link>
          ))}
        </div>
      </section>

      <ProductRail title="Muebles" href="/c/muebles1" products={outdoorFurniture} />

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

      <ProductRail title="Sillas" href="/c/sillas2" products={outdoorChairs} />

      <section className="mx-auto mt-20 max-w-[1440px] px-4 lg:px-8">
        <BannerMedia banner={CATEGORY_HERO["silla-rey"]} variant="inline" />
      </section>
      <ProductRail title="Silla Rey" href="/c/silla-rey" products={rey} />

      {/* Secciones propias de esta versión */}
      <section className="mx-auto mt-20 max-w-[1440px] px-4 lg:px-8">
        <SectionTitle title="comprá por categoría." />
        <div className="rail auto-cols-[40%] sm:auto-cols-[24%] lg:auto-cols-[calc((100%-96px)/7)]">
          {TILES.map((t, i) => {
            const img = tileImages[i];
            return (
              <Link key={t.handle} href={`/c/${t.handle}`} className="group block">
                <div className="aspect-[4/5] overflow-hidden bg-sand">
                  {img && (
                    <img src={sized(img.src, 480)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  )}
                </div>
                <p className={`mt-2.5 text-[14px] font-medium ${t.handle === "sale" ? "text-sale" : ""}`}>{t.label}</p>
              </Link>
            );
          })}
        </div>
      </section>

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

      <section className="mx-auto mt-20 max-w-[1440px] px-4 lg:px-8">
        <SectionTitle title="sale." href="/c/sale" linkLabel="Ver todo SALE" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {sales.map(({ cat, products }) => {
            if (!cat) return null;
            const m = cat.name.match(/(hasta \d+% off) en (.+)/i);
            const img = products.find((p) => p.images[0])?.images[0];
            return (
              <Link key={cat.id} href={`/c/${cat.handle}`} className="group block">
                <div className="aspect-square overflow-hidden bg-sand">
                  {img && <img src={sized(img.src, 640)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />}
                </div>
                <p className="mt-3 text-[22px] font-semibold lowercase leading-none tracking-[-0.03em] text-sale md:text-[26px]">
                  {m ? m[1] : cat.name}
                </p>
                {m && <p className="mt-1 text-[13.5px]">en {m[2]}</p>}
              </Link>
            );
          })}
        </div>
      </section>

      <ProductRail title="los más elegidos." href="/buscar?orden=best-selling" products={best} />

      <RecentlyViewed />

      <section className="mt-20">
        <BenefitsStrip />
      </section>
    </>
  );
}
