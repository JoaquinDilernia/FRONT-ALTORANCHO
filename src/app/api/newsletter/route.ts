import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Mientras sea una prueba local, las suscripciones se guardan en data/newsletter.json
// (no se mandan a Tiendanube ni a ningún servicio externo).
const FILE = path.join(process.cwd(), "data", "newsletter.json");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 200);
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: "Revisá el email: falta la @ o el dominio." }, { status: 400 });
  }

  await mkdir(path.dirname(FILE), { recursive: true });
  const list: { email: string; at: string }[] = JSON.parse(await readFile(FILE, "utf8").catch(() => "[]"));
  const already = list.some((x) => x.email === email);
  if (!already) {
    list.push({ email, at: new Date().toISOString() });
    await writeFile(FILE, JSON.stringify(list, null, 2));
  }
  return NextResponse.json({ ok: true, already });
}
