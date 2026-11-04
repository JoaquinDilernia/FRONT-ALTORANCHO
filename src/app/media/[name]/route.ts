import { readFile } from "node:fs/promises";
import path from "node:path";
import { LOCAL_MEDIA_DIR } from "@/lib/contentStore";

// Fotos subidas al panel cuando no hay Firebase (modo local). Con Firebase las fotos
// se sirven directo desde Storage y esta ruta no se usa.
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!/^[\w-]+\.webp$/.test(name)) return new Response("No encontrada", { status: 404 });
  try {
    const data = await readFile(path.join(LOCAL_MEDIA_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("No encontrada", { status: 404 });
  }
}
