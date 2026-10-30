import Link from "next/link";
import { getCategoryTree, searchProducts, sized, type CategoryNode } from "@/lib/tiendanube";
import { BENEFITS, MARQUEE, MENU_PHOTOS, media } from "@/content/site";
import CategoryBar from "./CategoryBar";
import { FavCount } from "./Favorites";
import { CartButton } from "./Cart";
import { PinIcon, UserIcon } from "./Icons";
import SearchBox from "./SearchBox";
import StickyHeader from "./StickyHeader";

// Mismo orden que el menú de altorancho.com
const ROOT_ORDER = ["the-getaway-club", "muebles", "sillas", "iluminacion41", "bazar", "textil", "decoracion", "gifts-cards", "sale"];

const SITES = [
  { label: "altorancho.", href: "/", current: true },
  { label: "altomayorista.", href: "https://loginmayorista.altorancho.com/" },
  { label: "decoradoras.", href: "https://deco.altorancho.com/" },
  { label: "prensa.", href: "https://prensa.altorancho.com/" },
];

const FEATURED = [
  { label: "The Rey Collection.", href: "/buscar?q=rey" },
  { label: "New in", href: "/buscar?orden=created-at-descending" },
  { label: "Inalámbricas", href: "/c/lamparas-inalambricas" },
  { label: "Reposera Riviera.", href: "/buscar?q=riviera" },
  { label: "Combos", href: "/combos" },
  { label: "Gift card", href: "/c/gifts-cards" },
];

export type NavItem = Pick<CategoryNode, "id" | "name" | "handle"> & { children: NavItem[] };
export type MenuPhoto = { label: string; href: string; src: string };

function slim(n: CategoryNode): NavItem {
  return { id: n.id, name: n.name, handle: n.handle, children: n.children.map(slim) };
}

// Dos fotos por categoría: las curadas en site.ts o, si no hay, la foto de ambiente
// del más vendido de las dos primeras subcategorías.
async function photosFor(root: NavItem): Promise<MenuPhoto[]> {
  const curated = MENU_PHOTOS[root.handle];
  if (curated) return curated.map((p) => ({ label: p.label, href: p.href, src: media(p.image, 640) }));
  const picks = await Promise.all(
    root.children.slice(0, 2).map(async (c) => {
      const top = (await searchProducts({ categoryId: c.id, perPage: 1, sortBy: "best-selling" })).data[0];
      const img = top?.images[1] ?? top?.images[0];
      return img ? { label: c.name, href: `/c/${c.handle}`, src: sized(img.src, 640) } : null;
    }),
  );
  return picks.filter((p): p is MenuPhoto => p !== null);
}

export default async function Header() {
  let roots: NavItem[] = [];
  let photos: Record<number, MenuPhoto[]> = {};
  try {
    const tree = await getCategoryTree();
    roots = ROOT_ORDER.map((h) => tree.find((c) => c.handle === h)).filter(Boolean).map((c) => slim(c!));
    const lists = await Promise.all(roots.map((r) => (r.children.length ? photosFor(r) : Promise.resolve([]))));
    photos = Object.fromEntries(roots.map((r, i) => [r.id, lists[i]]));
  } catch {
    // Sin API el header sigue funcionando con los links fijos.
  }

  return (
    <StickyHeader className="z-40 bg-paper">
      {/* Nivel 1: sitios del grupo + mensaje comercial */}
      <div className="bg-sand text-[12px]">
        <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between gap-4 px-4 lg:px-8">
          <nav aria-label="Sitios" className="flex gap-5 overflow-x-auto whitespace-nowrap">
            {SITES.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-current={s.current ? "page" : undefined}
                {...(s.current ? {} : { target: "_blank", rel: "noopener" })}
                className={s.current ? "font-semibold" : "text-ink-soft hover:text-ink"}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="marquee hidden max-w-[52%] md:block" role="note" aria-label={MARQUEE.join(". ")}>
            <div className="marquee-track" aria-hidden>
              {[0, 1].map((k) => (
                <span key={k} className="flex shrink-0 gap-8 pr-8">
                  {MARQUEE.map((m) => <span key={m}>{m}</span>)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Nivel 2: buscador, logo, cuenta + links destacados */}
      <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
        <div className="grid h-[76px] grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div>
            <SearchBox />
          </div>
          <Link href="/" className="text-[30px] font-semibold tracking-[-0.04em] lg:text-[34px]" aria-label="altorancho. inicio">
            altorancho.
          </Link>
          <div className="flex items-center justify-end gap-4 lg:gap-5">
            <Link href="/locales" className="hidden lg:inline-flex" title="Locales" aria-label="Locales"><PinIcon /></Link>
            {/* El login de clientes vive en Tiendanube: la Storefront API no lo expone. */}
            <a href="https://altorancho.com/account/login/" target="_blank" rel="noopener" className="hidden sm:inline-flex" title="Mi cuenta (abre altorancho.com)" aria-label="Mi cuenta"><UserIcon /></a>
            <FavCount />
            <CartButton />
          </div>
        </div>
        <nav aria-label="Destacados" className="hidden h-10 items-center justify-center gap-7 text-[13px] md:flex">
          {FEATURED.map((f) => (
            <Link key={f.label} href={f.href} className="hover:underline underline-offset-4">
              {f.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="bg-sand">
        <ul className="mx-auto grid max-w-[1440px] grid-cols-1 divide-ink/10 text-center text-[12.5px] sm:grid-cols-3 sm:divide-x">
          {BENEFITS.map((b, i) => (
            <li key={b.title} className={`py-2.5 ${i ? "hidden sm:block" : ""}`}>
              <b className="font-semibold">{b.title}</b> <span className="text-ink-soft">{b.copy.charAt(0).toLowerCase() + b.copy.slice(1)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Nivel 3: barra oscura de categorías con megamenú. Es lo único que queda fijo al bajar. */}
      <CategoryBar roots={roots} photos={photos} />
    </StickyHeader>
  );
}
