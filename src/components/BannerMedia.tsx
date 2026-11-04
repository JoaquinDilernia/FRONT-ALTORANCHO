"use client";

import Link from "next/link";
import { useState } from "react";
import { media, mediaSet, type Banner } from "@/content/site";
import AmbientVideo from "./AmbientVideo";

// Banners con foto o video de YouTube. Los que ya traen el texto en la imagen
// (Silla Rey, inalámbricas) no se pisan con otro título.
// Valor: la versión vertical que usa la web actual en mobile.
const TEXT_IN_IMAGE: Record<string, string> = {
  "b0043677-bannerprincipal_sillarey-03": "d203f2d3-bannerprincipal_sillarey-04",
  "3f506fbd-bannerinalambricas_home-01": "d90c04fe-bannerinalambricas_home-02",
};

export default function BannerMedia({ banner, variant }: { banner: Banner; variant: "hero" | "inline" }) {
  const [playing, setPlaying] = useState(false);
  const mobileImage = banner.imageMobile || (banner.image ? TEXT_IN_IMAGE[banner.image] : undefined);
  const textInImage = banner.textInImage ?? Boolean(banner.image && TEXT_IN_IMAGE[banner.image]);
  const box =
    variant === "hero"
      ? "aspect-[4/5] sm:aspect-[16/9] lg:aspect-[3/1]"
      : "aspect-[4/5] sm:aspect-[16/7] lg:aspect-[3/1]";
  const known = Boolean(banner.image && TEXT_IN_IMAGE[banner.image]);
  // Una foto subida con el texto ya escrito se muestra entera, con su propia proporción.
  const natural = textInImage && !known;
  const boxFinal = known ? "aspect-[480/719] sm:aspect-[480/182]" : natural ? "" : box;
  const imgCls = natural ? "block h-auto w-full" : "absolute inset-0 size-full object-cover";

  if (banner.video && playing) {
    return (
      <div className={`relative overflow-hidden bg-ink ${variant === "hero" ? "aspect-video lg:aspect-[21/9]" : "aspect-video"}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${banner.video.id}?autoplay=1&rel=0&modestbranding=1`}
          title={banner.video.title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      </div>
    );
  }

  const img = banner.video
    ? { src: `https://i.ytimg.com/vi_webp/${banner.video.id}/maxresdefault.webp`, srcSet: undefined }
    : banner.image
      ? { src: media(banner.image, 1400), srcSet: mediaSet(banner.image) }
      : null;

  const inner = (
    <>
      {img && mobileImage ? (
        <picture>
          <source media="(min-width: 640px)" srcSet={img.srcSet} sizes="100vw" />
          <img src={media(mobileImage, 1024)} alt="" loading={variant === "hero" ? "eager" : "lazy"} className={imgCls} />
        </picture>
      ) : (
        img && <img src={img.src} srcSet={img.srcSet} sizes="100vw" alt="" loading={variant === "hero" ? "eager" : "lazy"} className={imgCls} />
      )}
      {banner.video && variant === "hero" && <AmbientVideo id={banner.video.id} />}
      {!textInImage && <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />}
      {!textInImage && (
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-paper md:p-10 lg:justify-center lg:p-14">
          <h2 className={`max-w-[14ch] font-semibold leading-[0.95] tracking-[-0.04em] ${variant === "hero" ? "text-[44px] md:text-[72px]" : "text-[32px] md:text-[48px]"}`}>
            {banner.title}
          </h2>
          {banner.copy && <p className="mt-3 max-w-[36ch] text-[14.5px] md:text-[16px]">{banner.copy}</p>}
          <span className="mt-6 inline-flex w-fit items-center gap-3 rounded-full bg-paper px-5 py-2.5 text-[13.5px] font-medium text-ink">
            {banner.video ? (
              <>
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden><path d="M7 4.5v15l12-7.5-12-7.5Z" /></svg>
                Ver el video
              </>
            ) : (
              banner.cta ?? "Ver más"
            )}
          </span>
        </div>
      )}
    </>
  );

  const cls = `group relative block overflow-hidden bg-sand ${boxFinal}`;
  if (banner.video) {
    return (
      <button onClick={() => setPlaying(true)} className={`${cls} w-full text-left`} aria-label={`Reproducir video: ${banner.video.title}`}>
        {inner}
      </button>
    );
  }
  return (
    <Link href={banner.href} className={cls} aria-label={textInImage ? banner.title : undefined}>
      {inner}
    </Link>
  );
}
