import { unstable_cache } from "next/cache";
import { contentSchema, type SiteContent } from "@/content/schema";
import { DEFAULT_CONTENT } from "@/content/defaults";
import { readStored } from "./contentStore";

export const CONTENT_TAG = "site-content";

// Cada parte (home, promos, ayuda) se valida por separado: si una guardada no sirve,
// se usa la de arranque para esa parte y el resto sigue con lo editado.
export function mergeContent(stored: Record<string, unknown>): SiteContent {
  const out = { ...DEFAULT_CONTENT };
  for (const key of Object.keys(contentSchema.shape) as (keyof SiteContent)[]) {
    if (stored[key] === undefined) continue;
    const parsed = contentSchema.shape[key].safeParse(stored[key]);
    if (parsed.success) (out as Record<string, unknown>)[key] = parsed.data;
    else console.error(`[contenido] "${key}" guardado no es válido; uso el de arranque`, parsed.error.issues.slice(0, 3));
  }
  return out;
}

// Se lee una vez y queda en caché hasta que alguien guarda en el panel.
const cached = unstable_cache(
  async () => {
    try {
      return mergeContent(await readStored());
    } catch (e) {
      console.error("[contenido] no se pudo leer; uso el de arranque", e);
      return DEFAULT_CONTENT;
    }
  },
  ["site-content-v1"],
  { tags: [CONTENT_TAG], revalidate: 3600 },
);

export const getContent = () => cached();
