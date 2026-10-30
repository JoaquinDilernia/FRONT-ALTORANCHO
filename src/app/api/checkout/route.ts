import { NextResponse } from "next/server";
import { getCombosPage } from "@/lib/combos";
import type { CartLine } from "@/lib/cart";

const STORE_ID = process.env.TN_STORE_ID ?? "2547699";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Arma un pedido borrador en Tiendanube con el carrito y devuelve el link a su checkout.
// Los precios los pone Tiendanube; lo único que se calcula acá es el descuento de los combos,
// con los datos de Glow (nunca con los que manda el navegador).
export async function POST(req: Request) {
  const token = process.env.TN_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "El pago todavía no está conectado en esta prueba." }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const contact = body.contact ?? {};
  const name = String(contact.name ?? "").trim().slice(0, 60);
  const lastname = String(contact.lastname ?? "").trim().slice(0, 60);
  const email = String(contact.email ?? "").trim().slice(0, 120);
  const lines: CartLine[] = Array.isArray(body.lines) ? body.lines.slice(0, 50) : [];
  if (!name || !lastname || !EMAIL.test(email)) {
    return NextResponse.json({ error: "Completá nombre, apellido y un email válido." }, { status: 400 });
  }

  const qtyOf = (n: unknown) => Math.min(Math.max(Math.floor(Number(n)) || 1, 1), 99);
  const units = new Map<number, number>();
  const addUnits = (variantId: number, q: number) => units.set(variantId, (units.get(variantId) ?? 0) + q);

  let discount = 0;
  const combos = lines.some((l) => l.kind === "combo") ? (await getCombosPage()).combos : [];
  for (const l of lines) {
    const q = qtyOf(l.qty);
    if (l.kind === "product") {
      const id = Number(l.piece?.variantId);
      if (id) addUnits(id, q);
      continue;
    }
    const combo = combos.find((c) => c.slug === l.slug);
    const pieces = Array.isArray(l.pieces) ? l.pieces : [];
    // Cada pieza tiene que ser una opción válida del ítem que le corresponde en el combo.
    const options = combo?.items.map((it, i) => ({ it, opt: it.options.find((o) => o.variantId === Number(pieces[i]?.variantId)) }));
    if (!combo || !options || pieces.length !== combo.items.length || options.some((x) => !x.opt)) {
      return NextResponse.json({ error: "Un combo del carrito ya no está disponible. Quitalo y volvé a agregarlo." }, { status: 409 });
    }
    let comboPrice = 0;
    for (const { it, opt } of options) {
      addUnits(opt!.variantId, it.quantity * q);
      comboPrice += Number(opt!.price) * it.quantity * q;
    }
    discount += comboPrice * (combo.discountPercent / 100);
  }
  if (units.size === 0) return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });

  const res = await fetch(`https://api.tiendanube.com/v1/${STORE_ID}/draft_orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authentication: `bearer ${token}`,
      "User-Agent": "altorancho-headless (jdilernia99@gmail.com)",
    },
    body: JSON.stringify({
      contact_name: name,
      contact_lastname: lastname,
      contact_email: email,
      payment_status: "unpaid",
      products: [...units].map(([variant_id, quantity]) => ({ variant_id, quantity })),
      ...(discount > 0 && { discount: discount.toFixed(2), discount_type: "absolute" }),
      note: "Pedido desde el front headless.",
    }),
    cache: "no-store",
  }).catch(() => null);

  const data = await res?.json().catch(() => null);
  if (!res?.ok || !data?.checkout_url) {
    console.error("draft_orders", res?.status, JSON.stringify(data).slice(0, 500));
    return NextResponse.json({ error: "No pudimos iniciar el pago. Probá de nuevo en un rato." }, { status: 502 });
  }
  return NextResponse.json({ url: data.checkout_url });
}
