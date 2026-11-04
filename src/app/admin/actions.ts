"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { contentSchema, type ContentKey } from "@/content/schema";
import { CONTENT_TAG } from "@/lib/content";
import { writeStored } from "@/lib/contentStore";
import { isAdmin } from "@/lib/admin";
import { ADMIN_COOKIE, adminToken } from "@/lib/gate";

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function login(_prev: { error: string }, form: FormData) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return { error: "El panel no tiene clave configurada (falta ADMIN_PASSWORD)." };
  if (!same(String(form.get("password") ?? ""), password)) return { error: "Clave incorrecta." };
  (await cookies()).set(ADMIN_COOKIE, await adminToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// Nombres que entiende alguien de marketing, para los mensajes de error.
const FIELD_NAMES: Record<string, string> = {
  sections: "Bloque",
  items: "Elemento",
  banner: "Banner",
  href: "Link",
  image: "Foto",
  imageMobile: "Foto para celular",
  title: "Título",
  copy: "Texto",
  label: "Texto",
  handle: "Categoría o producto",
  category: "Categoría",
  hotspots: "Punto",
  benefits: "Beneficio",
  marquee: "Mensaje",
  pages: "Página",
  body: "Sección",
  videoId: "Video",
  actions: "Botón",
};

function where(path: PropertyKey[]) {
  const parts: string[] = [];
  for (let i = 0; i < path.length; i++) {
    const p = String(path[i]);
    const next = path[i + 1];
    if (typeof next === "number") {
      parts.push(`${FIELD_NAMES[p] ?? p} ${next + 1}`);
      i++;
    } else parts.push(FIELD_NAMES[p] ?? p);
  }
  return parts.join(" › ");
}

export async function saveContent(key: ContentKey, value: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isAdmin())) return { ok: false, error: "Tu sesión del panel venció. Recargá la página y entrá de nuevo." };
  const schema = contentSchema.shape[key];
  if (!schema) return { ok: false, error: "Sección desconocida." };
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: `${where(issue.path)}: ${issue.message}` };
  }
  try {
    await writeStored(key, parsed.data);
  } catch (e) {
    console.error("[admin] no se pudo guardar", e);
    return { ok: false, error: "No se pudo guardar. Probá de nuevo en un rato." };
  }
  revalidateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
  return { ok: true };
}
