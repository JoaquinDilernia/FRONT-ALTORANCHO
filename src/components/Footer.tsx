import Link from "next/link";
import { INFO_LINKS, PAYMENTS, SOCIAL, STORES, WHATSAPP } from "@/lib/store";
import { media } from "@/content/site";
import Newsletter from "./Newsletter";

const SHOP = [
  ["Muebles", "/c/muebles"],
  ["Sillas", "/c/sillas"],
  ["Iluminación", "/c/iluminacion41"],
  ["Bazar", "/c/bazar"],
  ["Textil", "/c/textil"],
  ["Decoración", "/c/decoracion"],
  ["Combos", "/combos"],
  ["Gift card", "/c/gifts-cards"],
  ["SALE", "/c/sale"],
];

const ext = { target: "_blank", rel: "noopener" } as const;

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      {/* Newsletter con la foto y el texto de la web actual */}
      <div className="grid md:grid-cols-2">
        <div className="aspect-[16/10] overflow-hidden bg-sand md:aspect-auto">
          <img src={media("a4031d72-newletter_summer", 1024)} alt="" loading="lazy" className="size-full object-cover" />
        </div>
        <div className="flex flex-col justify-center gap-6 border-line px-4 py-12 md:border-y md:px-12 lg:px-16">
          <div>
            <p className="text-[34px] font-semibold leading-[0.95] tracking-[-0.04em] md:text-[44px]">Suscribite al newsletter</p>
            <p className="mt-3 max-w-[40ch] text-[14.5px] text-ink-soft">Recibí ofertas exclusivas y novedades directamente en tu email.</p>
          </div>
          <Newsletter />
        </div>
      </div>

      <div className="bg-sand">
        <div className="grid gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)] lg:px-8">
          <div>
            <Link href="/" className="text-[28px] font-semibold tracking-[-0.04em]">altorancho.</Link>
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
              {SOCIAL.map((s) => (
                <li key={s.label}><a href={s.href} {...ext} className="underline-offset-4 hover:underline">{s.label}</a></li>
              ))}
            </ul>
            <a href={WHATSAPP} {...ext} className="mt-5 inline-block rounded-full border border-ink px-4 py-2 text-[13px] hover:bg-ink hover:text-paper">
              Escribinos por WhatsApp
            </a>
          </div>

          <nav aria-label="Comprar">
            <p className="text-[13px] font-semibold">Comprar</p>
            <ul className="mt-3 space-y-2 text-[13px] text-ink-soft">
              {SHOP.map(([l, h]) => (
                <li key={h}><Link href={h} className="hover:text-ink">{l}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Información">
            <p className="text-[13px] font-semibold">Información</p>
            <ul className="mt-3 space-y-2 text-[13px] text-ink-soft">
              {INFO_LINKS.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith("/") ? (
                    <Link href={l.href} className="hover:text-ink">{l.label}</Link>
                  ) : (
                    <a href={l.href} {...ext} className="hover:text-ink">{l.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-[13px] font-semibold">Locales</p>
            <ul className="mt-3 space-y-2 text-[13px] text-ink-soft">
              {STORES.map((s) => (
                <li key={s.name}>
                  <a href={s.map} {...ext} className="hover:text-ink">
                    {s.name}
                    {s.detail && <span className="block text-[12px]">{s.detail}</span>}
                  </a>
                </li>
              ))}
            </ul>
            <Link href="/locales" className="mt-3 inline-block text-[13px] underline underline-offset-4">Ver locales</Link>
          </div>

          <div>
            <p className="text-[13px] font-semibold">Mi compra</p>
            <ul className="mt-3 space-y-2 text-[13px] text-ink-soft">
              <li><Link href="/favoritos" className="hover:text-ink">Mis favoritos</Link></li>
              <li><a href="https://altorancho.com/account/login/" {...ext} className="hover:text-ink">Mi cuenta</a></li>
              <li><a href="https://altorancho.com/contacto/?order_cancellation_without_id=true" {...ext} className="hover:text-ink">Botón de arrepentimiento</a></li>
            </ul>
          </div>
        </div>

        <div className="px-4 lg:px-8">
          <div className="border-t border-ink/10 py-6">
            <p className="text-[12.5px] font-semibold">Medios de pago</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {PAYMENTS.map(([name, src]) => (
                <li key={name} className="grid h-7 w-11 place-items-center bg-paper">
                  <img src={src} alt={name} title={name} loading="lazy" className="max-h-5 max-w-9 object-contain" />
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2 border-t border-ink/10 py-6 text-[12px] text-ink-soft md:flex-row md:justify-between">
            <p>Copyright altorancho. 2026. Todos los derechos reservados.</p>
            <p>
              Defensa de las y los consumidores: para reclamos{" "}
              <a href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario" {...ext} className="underline underline-offset-2">
                ingresá acá
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
