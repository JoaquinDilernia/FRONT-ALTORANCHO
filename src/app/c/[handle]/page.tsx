import { notFound } from "next/navigation";
import { getCategoryByHandle, getCategoryTree, searchProducts, sized, type CategoryNode } from "@/lib/tiendanube";
import Listing, { type Query, type SubTile } from "@/components/Listing";
import GetawayLanding from "@/components/GetawayLanding";
import { CATEGORY_HERO, CATEGORY_INLINE } from "@/content/site";

const MAX_TILES = 10;

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Query>;
}) {
  const { handle } = await params;
  const cat = await getCategoryByHandle(handle).catch(() => null);
  if (!cat) notFound();
  const tree = await getCategoryTree();
  const path = pathTo(tree, cat.id) ?? [];
  const node = path[path.length - 1] ?? null;
  const root = path[0];
  const query = await searchParams;

  // The Getaway Club tiene página de colección; "?todo=1" o cualquier filtro muestra el listado común.
  const isFiltered = Object.keys(query).some((k) => k === "todo" || k === "sub" || k === "q" || k.startsWith("filter[") || k === "desde" || k === "hasta");
  if (handle === "the-getaway-club" && !isFiltered) {
    return <GetawayLanding category={node} />;
  }

  // Banner propio de la categoría o, si no tiene, el del ancestro más cercano que tenga uno.
  const heroKey = [...path].reverse().find((c) => CATEGORY_HERO[c.handle])?.handle;
  const hero = heroKey ? CATEGORY_HERO[heroKey] : undefined;
  const inline = (root ? CATEGORY_INLINE[root.handle] ?? [] : []).filter((b) => b.href !== `/c/${handle}`);
  const subTiles = node?.children.length ? await tilesFor(node.children) : [];

  return (
    <Listing
      basePath={`/c/${handle}`}
      query={query}
      categoryId={cat.id}
      title={`${cat.name.trim().replace(/\.$/, "")}.`}
      hero={isFiltered ? undefined : hero}
      inline={inline}
      subTiles={subTiles}
      breadcrumb={[
        { label: "Inicio", href: "/" },
        ...(path.length ? path : [cat]).map((c) => ({ label: c.name, href: `/c/${c.handle}` })),
      ]}
    />
  );
}

// Camino desde la raíz hasta la categoría: sirve para el breadcrumb y para heredar banners.
function pathTo(nodes: CategoryNode[], id: number, trail: CategoryNode[] = []): CategoryNode[] | null {
  for (const n of nodes) {
    const next = [...trail, n];
    if (n.id === id) return next;
    const hit = pathTo(n.children, id, next);
    if (hit) return hit;
  }
  return null;
}

// Una foto por subcategoría: la del producto más vendido.
async function tilesFor(children: CategoryNode[]): Promise<SubTile[]> {
  return Promise.all(
    children.slice(0, MAX_TILES).map(async (c) => {
      const first = await searchProducts({ categoryId: c.id, perPage: 1, sortBy: "best-selling" })
        .then((r) => r.data[0])
        .catch(() => undefined);
      const img = first?.images[0];
      return { id: c.id, name: c.name, handle: c.handle, image: img ? sized(img.src, 240) : undefined };
    }),
  );
}
