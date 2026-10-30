import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-4 py-24 text-center lg:px-8">
      <h1 className="text-[44px] font-semibold lowercase tracking-[-0.04em]">no encontramos esta página.</h1>
      <p className="mt-3 text-[14px] text-ink-soft">Puede que el producto ya no esté publicado.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-[14px] text-paper">Volver al inicio</Link>
    </div>
  );
}
