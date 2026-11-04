import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminToken } from "./gate";

// Toda acción del panel vuelve a chequear la cookie, aunque el middleware ya lo haya hecho.
export async function isAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return (await cookies()).get(ADMIN_COOKIE)?.value === (await adminToken(password));
}
