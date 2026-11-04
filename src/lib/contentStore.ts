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

const env = process.env;
const splitCreds = () => Boolean(env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY);
export const usesFirebase = () => Boolean(env.FIREBASE_SERVICE_ACCOUNT) || splitCreds();

// La cuenta de servicio puede venir entera en FIREBASE_SERVICE_ACCOUNT (JSON o base64)
// o separada en FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY,
// como la tienen cargada otros proyectos de Railway.
function serviceAccount(): { projectId: string; clientEmail: string; privateKey: string } {
  if (env.FIREBASE_SERVICE_ACCOUNT) {
    const raw = env.FIREBASE_SERVICE_ACCOUNT.trim();
    const json = JSON.parse(raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8"));
    return { projectId: json.project_id, clientEmail: json.client_email, privateKey: json.private_key };
  }
  return {
    projectId: env.FIREBASE_PROJECT_ID!,
    clientEmail: env.FIREBASE_CLIENT_EMAIL!,
    // Railway suele guardar los saltos de línea de la clave como "\n" literales.
    privateKey: env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  };
}

async function firebase() {
  const { cert, getApps, initializeApp } = await import("firebase-admin/app");
  if (!getApps().length) {
    const account = serviceAccount();
    initializeApp({
      credential: cert(account),
      storageBucket: env.FIREBASE_STORAGE_BUCKET || `${account.projectId}.firebasestorage.app`,
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
