import sharp from "sharp";
import { isAdmin } from "@/lib/admin";
import { saveImage } from "@/lib/contentStore";

// Sube una foto desde el panel: la achica a 2000 px de ancho como máximo y la pasa a webp.
// Devuelve la URL y la proporción (sirve para las fotos con productos marcados).
const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Entrá al panel de nuevo." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No llegó ninguna foto." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "La foto pesa más de 15 MB." }, { status: 400 });

  try {
    const { data, info } = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({ width: 2000, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    const url = await saveImage(data, "webp");
    return Response.json({ url, width: info.width, height: info.height });
  } catch (e) {
    console.error("[admin] no se pudo subir la foto", e);
    return Response.json({ error: "No se pudo leer la foto. Probá con un JPG o PNG." }, { status: 400 });
  }
}
