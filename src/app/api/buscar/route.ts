import { NextResponse } from "next/server";
import { inStock, money, priceOf, searchProducts, sized } from "@/lib/tiendanube";

// Sugerencias del buscador del header.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 100) ?? "";
  if (q.length < 2) return NextResponse.json({ total: 0, items: [] });
  const res = await searchProducts({ q, perPage: 6 });
  return NextResponse.json({
    total: res.pagination.total,
    items: res.data.map((p) => {
      const { now, before } = priceOf(p.variants.find(inStock) ?? p.variants[0]);
      return {
        handle: p.handle,
        name: p.name,
        image: p.images[0] ? sized(p.images[0].src, 240) : "",
        price: money(now),
        before: before ? money(before) : null,
      };
    }),
  });
}
