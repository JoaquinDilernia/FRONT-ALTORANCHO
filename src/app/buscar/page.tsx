import Listing, { type Query } from "@/components/Listing";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const q = Array.isArray(query.q) ? query.q[0] : query.q;
  return (
    <Listing
      basePath="/buscar"
      query={query}
      title={q ? `“${q}”` : "todo el catálogo."}
      breadcrumb={[{ label: "Inicio", href: "/" }, { label: "Buscar", href: "/buscar" }]}
    />
  );
}
