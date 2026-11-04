import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ContentKey } from "@/content/schema";

// Dónde vive el contenido que se edita en /admin.
// - Con FIREBASE_SERVICE_ACCOUNT: Firestore (doc altorancho_front/content) y Firebase Storage para las fotos.
// - Sin esa variable: un archivo en data/ y las fotos en data/media/. Sirve para probar en local;
//   en Railway ese disco se borra en cada deploy, por eso el panel avisa.

const DOC = "altorancho_front/content";
const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_FILE = path.join(DATA_DIR, "content.json");
export const LOCAL_MEDIA_DIR = path.join(DATA_DIR, "media");

export const usesFirebase = () => Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);

async function firebase() {
  const { cert, getApps, initializeApp } = await import("firebase-admin/app");
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT!.trim();
    // Acepta el JSON de la cuenta de servicio tal cual o en base64.
    const json = JSON.parse(raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8"));
    initializeApp({
      credential: cert(json),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${json.project_id}.firebasestorage.app`,
    });
  }
  const [{ getFirestore }, { getStorage }] = await Promise.all([import("firebase-admin/firestore"), import("firebase-admin/storage")]);
  return { db: getFirestore(), bucket: getStorage().bucket() };
}

export async function readStored(): Promise<Record<string, unknown>> {
  if (usesFirebase()) {
    const { db } = await firebase();
    return (await db.doc(DOC).get()).data() ?? {};
  }
  try {
    return JSON.parse(await readFile(LOCAL_FILE, "utf8"));
  } catch {
    return {};
  }
}

export async function writeStored(key: ContentKey, value: unknown) {
  const at = new Date().toISOString();
  if (usesFirebase()) {
    const { db } = await firebase();
    // Se guarda también cada versión, para poder volver atrás si algo se rompe.
    await Promise.all([
      db.doc(DOC).set({ [key]: value, updatedAt: at }, { merge: true }),
      db.collection(`${DOC}/history`).add({ key, value, at }),
    ]);
    return;
  }
  const current = await readStored();
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(LOCAL_FILE, JSON.stringify({ ...current, [key]: value, updatedAt: at }, null, 2));
}

/** Guarda una foto ya procesada y devuelve la URL pública. */
export async function saveImage(data: Buffer, ext: "webp") {
  const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
  if (usesFirebase()) {
    const { bucket } = await firebase();
    const filePath = `altorancho-front/${name}`;
    const token = randomUUID();
    await bucket.file(filePath).save(data, {
      contentType: `image/${ext}`,
      metadata: { cacheControl: "public, max-age=31536000, immutable", metadata: { firebaseStorageDownloadTokens: token } },
    });
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
  }
  await mkdir(LOCAL_MEDIA_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_MEDIA_DIR, name), data);
  return `/media/${name}`;
}
