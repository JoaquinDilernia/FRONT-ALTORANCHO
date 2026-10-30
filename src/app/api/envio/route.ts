import { NextResponse } from "next/server";

const STORE_ID = process.env.TN_STORE_ID ?? "2547699";

// Cotización de envío real (Storefront API). Solo consulta: no crea nada en la tienda.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const zip = String(body.zip ?? "").replace(/\D/g, "").slice(0, 8);
  const variantId = Number(body.variantId);
  const quantity = Math.min(Math.max(Number(body.quantity) || 1, 1), 99);
  if (zip.length < 4 || !variantId) {
    return NextResponse.json({ error: "Ingresá un código postal de 4 números." }, { status: 400 });
  }

  const res = await fetch(`https://storefront-api.tiendanube.com/2026-11/stores/${STORE_ID}/shipping-options`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ zip_code: zip, variant_id: variantId, quantity }),
    cache: "no-store",
  }).catch(() => null);

  if (!res?.ok) {
    return NextResponse.json({ error: "No pudimos cotizar ese código postal. Revisalo e intentá de nuevo." }, { status: 502 });
  }
  const data = (await res.json()) as {
    shipping_options: {
      code: string;
      name: string;
      detail?: string;
      date?: string;
      price: string;
      days_until?: { working_start?: number; working_end?: number };
    }[];
  };
  const options = data.shipping_options
    .map((o) => ({
      code: o.code,
      name: o.name,
      // "Estandar a domicilio (1)" → "Estandar a domicilio"
      detail: (o.detail ?? "").replace(/\s*\(\d+\)$/, ""),
      date: o.date ?? "",
      price: Number(o.price),
      // Días hábiles: sirven para elegir la opción más rápida.
      days: [o.days_until?.working_start ?? 99, o.days_until?.working_end ?? 99] as [number, number],
      kind: /sucursal|pickup|punto de retiro/i.test(`${o.code} ${o.name}`) ? ("point" as const) : ("home" as const),
    }))
    .sort((a, b) => a.price - b.price);
  return NextResponse.json({ zip, options });
}
