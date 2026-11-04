import { getCategoryTree, type CategoryNode } from "@/lib/tiendanube";
import { mergeContent } from "@/lib/content";
import { readStored } from "@/lib/contentStore";
import type { CategoryOption } from "@/components/admin/ui";

// El panel lee siempre lo último guardado, sin la caché que usa la tienda.
export const freshContent = async () => mergeContent(await readStored());

export async function categoryOptions(): Promise<CategoryOption[]> {
  const out: CategoryOption[] = [];
  const walk = (nodes: CategoryNode[], depth: number) => {
    for (const n of nodes) {
      out.push({ handle: n.handle, name: n.name, depth });
      walk(n.children, depth + 1);
    }
  };
  walk(await getCategoryTree().catch(() => []), 0);
  return out;
}
