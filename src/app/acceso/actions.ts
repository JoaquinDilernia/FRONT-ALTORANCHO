"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GATE_COOKIE, gateToken } from "@/lib/gate";

export async function enter(_prev: { error: boolean; tries: number }, form: FormData) {
  const password = process.env.SITE_PASSWORD;
  const typed = String(form.get("password") ?? "");
  // Solo rutas internas, para que ?next= no sirva de redirección a otro sitio.
  const raw = String(form.get("next") ?? "/");
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";

  if (password && typed !== password) return { error: true, tries: _prev.tries + 1 };
  if (password) {
    (await cookies()).set(GATE_COOKIE, await gateToken(password), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  redirect(next);
}
