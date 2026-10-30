import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { HELP_PAGES, helpPage } from "@/content/ayuda";
import { STORES, WHATSAPP } from "@/lib/store";
import BenefitsStrip from "@/components/BenefitsStrip";

export function generateStaticParams() {
  return HELP_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = helpPage((await params).slug);
  return { title: page ? `${page.title} — altorancho.` : "Ayuda — altorancho." };
}

export default async function HelpPageView({ params }: { params: Promise<{ slug: string }> }) {
  const page = helpPage((await params).slug);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-8 lg:px-8">
      <nav aria-label="Migas" className="text-[12.5px] text-ink-soft">
        <Link href="/" className="hover:text-ink">Inicio</Link> / <span className="text-ink">{page.title}</span>
      </nav>

      <div className="mt-6 grid gap-12 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Ayuda" className="order-2 lg:order-1">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-0 lg:border-t lg:border-line">
            {HELP_PAGES.map((p) => (
              <li key={p.slug} className="lg:border-b lg:border-line">
                <Link
                  href={`/ayuda/${p.slug}`}
                  aria-current={p.slug === page.slug ? "page" : undefined}
                  className={`block rounded-full border px-4 py-2 text-[13.5px] lg:rounded-none lg:border-0 lg:px-0 lg:py-3.5 ${
                    p.slug === page.slug ? "border-ink font-semibold" : "border-line text-ink-soft hover:text-ink"
                  }`}
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <article className="order-1 max-w-[70ch] lg:order-2">
          <h1 className="text-[40px] font-semibold leading-none tracking-[-0.04em] md:text-[56px]">{page.title}.</h1>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">{page.intro}</p>

          {page.body?.length ? (
            <div className="prose-tn mt-10">
              {page.body.map((s) => (
                <section key={s.heading}>
                  <h2>{s.heading}</h2>
                  {s.text.map((t) => <p key={t}>{t}</p>)}
                </section>
              ))}
            </div>
          ) : (
            <p className="mt-10 border-l-2 border-walnut bg-sand px-5 py-4 text-[14px] leading-relaxed">
              El texto completo de esta página todavía no está importado en esta versión.{" "}
              <a href={page.original} target="_blank" rel="noopener" className="underline underline-offset-4">Leelo en altorancho.com</a>.
            </p>
          )}

          <div className="mt-12">
            <BenefitsStrip />
          </div>

          <section className="mt-12 grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-0.02em]">¿Te quedó una duda?</h2>
              <p className="mt-2 text-[14px] text-ink-soft">Escribinos y te ayudamos con tu compra.</p>
              <a href={WHATSAPP} target="_blank" rel="noopener" className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-[13.5px] text-paper">
                Escribinos por WhatsApp
              </a>
            </div>
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Locales</h2>
              <ul className="mt-2 space-y-1.5 text-[14px]">
                {STORES.map((s) => (
                  <li key={s.name}>
                    <a href={s.map} target="_blank" rel="noopener" className="underline-offset-4 hover:underline">
                      {s.name}{s.detail ? ` | ${s.detail}` : ""}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}
