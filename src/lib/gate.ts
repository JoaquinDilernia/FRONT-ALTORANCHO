// Clave de acceso mientras el front está en prueba. Si SITE_PASSWORD no está definida, no hay candado.
// La cookie guarda un hash de la clave (no la clave), así cambiarla invalida los accesos viejos.

export const GATE_COOKIE = "ar_acceso";

export async function gateToken(password: string) {
  const data = new TextEncoder().encode(`altorancho-headless:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Clave del panel /admin (ADMIN_PASSWORD). Sin la variable el panel queda cerrado.
export const ADMIN_COOKIE = "ar_admin";

export async function adminToken(password: string) {
  const data = new TextEncoder().encode(`altorancho-admin:${password}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}
