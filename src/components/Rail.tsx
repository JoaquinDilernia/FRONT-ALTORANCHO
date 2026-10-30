import Link from "next/link";
import type { Product } from "@/lib/tiendanube";
import { getVariantGroups } from "@/lib/variantGroups";
import ProductCard from "./ProductCard";
import AutoLight from "./AutoLight";

export function SectionTitle({ title, href, linkLabel = "Ver todo" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="text-[26px] font-semibold leading-none tracking-[-0.03em] md:text-[32px]">{title}</h2>
      {href && (
        <Link href={href} className="shrink-0 text-[13px] underline underline-offset-4">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

export default async function ProductRail({
  title,
  href,
  products,
  autoLight = false,
}: {
  title: string;
  href?: string;
  products: Product[];
  autoLight?: boolean;
}) {
  if (!products.length) return null;
  const groups = await getVariantGroups();
  const rail = (
    <div className="rail auto-cols-[46%] sm:auto-cols-[31%] lg:auto-cols-[calc((100%-64px)/5)]">
      {products.map((p) => (
        <ProductCard key={p.id} p={p} group={groups[String(p.id)]} sizes="(min-width:1024px) 20vw, 46vw" />
      ))}
    </div>
  );
  return (
    <section className="mx-auto mt-16 max-w-[1440px] px-4 lg:px-8">
      <SectionTitle title={title} href={href} />
      {autoLight ? <AutoLight>{rail}</AutoLight> : rail}
    </section>
  );
}
