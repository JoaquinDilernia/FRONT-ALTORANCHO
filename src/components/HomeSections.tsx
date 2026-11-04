import Link from "next/link";
import { getCategoryByHandle, searchProducts, sized } from "@/lib/tiendanube";
import { media, type Banner } from "@/content/site";
import type { BannerContent, HomeSection } from "@/content/schema";
import ProductRail, { SectionTitle } from "./Rail";
import ShopTheRoom from "./ShopTheRoom";
import VideoBlock from "./VideoBlock";
import RecentlyViewed from "./RecentlyViewed";
import BannerMedia from "./BannerMedia";
import BenefitsStrip from "./BenefitsStrip";
import HeroActions from "./HeroActions";

// Cada tipo de bloque de la home, armado con lo que se cargó en /admin.

async function category(handle: string, perPage = 10, sortBy = "best-selling") {
  if (!handle) return { cat: null, products: (await searchProducts({ sortBy, perPage })).data };
  const cat = await getCategoryByHandle(handle).catch(() => null);
  if (!cat) return { cat: null, products: [] };
  return { cat, products: (await searchProducts({ categoryId: cat.id, perPage, sortBy })).data };
}

export function toBanner(b: BannerContent): Banner {
  return {
    title: b.title,
    copy: b.copy || undefined,
    href: b.href || "/",
    image: b.image || undefined,
    imageMobile: b.imageMobile || undefined,
    textInImage: b.textInImage,
    video: b.videoId ? { id: b.videoId, title: b.title } : undefined,
    cta: b.cta || undefined,
  };
}

async function Hero({ s }: { s: Extract<HomeSection, { type: "hero" }> }) {
  const products = s.productsCategory ? (await category(s.productsCategory, 4)).products : [];
  return (
    <>
      <BannerMedia banner={toBanner(s.banner)} variant="hero" />
      <HeroActions primary={s.primary} actions={s.actions} products={products} productsTitle={s.productsTitle} />
    </>
  );
}

async function Rail({ s }: { s: Extract<HomeSection, { type: "rail" }> }) {
  const { products } = await category(s.category, s.count, s.sort);
  return <ProductRail title={s.title} href={s.href || undefined} products={products} autoLight={s.autoLight} />;
}

async function Categories({ s }: { s: Extract<HomeSection, { type: "categories" }> }) {
  const lists = await Promise.all(s.items.map((t) => (t.image ? Promise.resolve([]) : category(t.handle, 6).then((r) => r.products))));
  // Cada categoría muestra un producto distinto (los más vendidos se repiten entre Muebles y Sillas).
  const used = new Set<number>();
  const images = s.items.map((t, i) => {
    if (t.image) return media(t.image, 640);
    const list = lists[i];
    const p = list.find((x) => !used.has(x.id) && x.images[0]) ?? list[0];
    if (p) used.add(p.id);
    return p?.images[0] ? sized(p.images[0].src, 480) : undefined;
  });
  return (
    <section className="mt-20 px-4 lg:px-8">
      <SectionTitle title={s.title} />
      <div className="rail auto-cols-[40%] sm:auto-cols-[24%] lg:auto-cols-[calc((100%-96px)/7)]">
        {s.items.map((t, i) => (
          <Link key={t.handle + i} href={`/c/${t.handle}`} className="group block">
            <div className="aspect-[4/5] overflow-hidden bg-sand">
              {images[i] && (
                <img src={images[i]} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              )}
            </div>
            <p className={`mt-2.5 text-[14px] font-medium ${t.highlight ? "text-sale" : ""}`}>{t.label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

async function Sales({ s }: { s: Extract<HomeSection, { type: "sales" }> }) {
  const sales = await Promise.all(s.handles.map((h) => category(h, 4)));
  return (
    <section className="mt-20 px-4 lg:px-8">
      <SectionTitle title={s.title} href={s.href || undefined} linkLabel="Ver todo SALE" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {sales.map(({ cat, products }) => {
          if (!cat) return null;
          // Usa el nombre que les pone la tienda ("Hasta 30% OFF en sillas").
          const m = cat.name.match(/(hasta \d+% off) en (.+)/i);
          const img = products.find((p) => p.images[0])?.images[0];
          return (
            <Link key={cat.id} href={`/c/${cat.handle}`} className="group block">
              <div className="aspect-square overflow-hidden bg-sand">
                {img && <img src={sized(img.src, 640)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />}
              </div>
              <p className="mt-3 text-[22px] font-semibold lowercase leading-none tracking-[-0.03em] text-sale md:text-[26px]">{m ? m[1] : cat.name}</p>
              {m && <p className="mt-1 text-[13.5px]">en {m[2]}</p>}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Section({ s }: { s: HomeSection }) {
  switch (s.type) {
    case "hero":
      return <Hero s={s} />;
    case "tiles":
      return (
        <section className="mt-4 grid grid-cols-2 gap-3 px-4 md:grid-cols-4 md:gap-4 lg:px-8">
          {s.items.map((t, i) => (
            <Link key={t.href + i} href={t.href || "/"} className="group relative block aspect-[4/5] overflow-hidden bg-sand">
              {t.image && (
                <img src={media(t.image, 640)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-4 text-[20px] font-semibold tracking-[-0.03em] text-paper md:p-5 md:text-[26px]">{t.label}</span>
            </Link>
          ))}
        </section>
      );
    case "rail":
      return <Rail s={s} />;
    case "video":
      if (!s.videoId) return null;
      return (
        <div id={s.anchor || undefined} className="scroll-mt-4">
          <VideoBlock id={s.videoId} title={s.title} />
        </div>
      );
    case "cards":
      return (
        <section className="mt-6 px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {s.items.map((t, i) => (
              <Link key={t.href + i} href={t.href || "/"} className="group block">
                <div className="aspect-[4/5] overflow-hidden bg-sand">
                  {t.image && <img src={media(t.image, 640)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />}
                </div>
                <p className="mt-3 text-[16px] font-semibold tracking-[-0.02em] md:text-[18px]">{t.title}</p>
                <p className="text-[13px] text-ink-soft">{t.copy}</p>
              </Link>
            ))}
          </div>
        </section>
      );
    case "room":
      if (!s.image) return null;
      return (
        <ShopTheRoom
          image={media(s.image, 1400)}
          ratio={s.ratio}
          alt={s.alt}
          title={s.title}
          copy={s.copy}
          hotspots={s.hotspots}
          reverse={s.reverse}
        />
      );
    case "banner":
      return (
        <section className="mt-20 px-4 lg:px-8">
          <BannerMedia banner={toBanner(s.banner)} variant="inline" />
        </section>
      );
    case "categories":
      return <Categories s={s} />;
    case "sales":
      return <Sales s={s} />;
    case "recent":
      return <RecentlyViewed />;
    case "benefits":
      return (
        <section className="mt-20">
          <BenefitsStrip />
        </section>
      );
  }
}

export default function HomeSections({ sections }: { sections: HomeSection[] }) {
  return sections.filter((s) => s.visible).map((s) => <Section key={s.id} s={s} />);
}
