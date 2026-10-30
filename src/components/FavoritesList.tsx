"use client";

import Link from "next/link";
import { useFavorites } from "./Favorites";
import { CloseIcon } from "./Icons";

export default function FavoritesList() {
  const { list, remove } = useFavorites();

  if (!list.length) {
    return (
      <div className="mt-10 bg-sand p-10 text-center">
        <p className="text-[15px] font-medium">Todavía no guardaste productos.</p>
        <p className="mt-1 text-[13.5px] text-ink-soft">Tocá el corazón en cualquier producto para tenerlo a mano acá.</p>
        <Link href="/buscar?orden=best-selling" className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-[14px] text-paper">
          Ver los más elegidos
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="mt-8 text-[13px]">{list.length} {list.length === 1 ? "producto" : "productos"}</p>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-5 min-[1900px]:grid-cols-6">
        {list.map((f) => (
          <li key={f.handle} className="group relative">
            <Link href={`/p/${f.handle}`} className="block">
              <div className="aspect-square overflow-hidden bg-sand">
                {f.image && <img src={f.image} alt="" className="size-full object-cover" />}
              </div>
              <p className="mt-3 line-clamp-2 text-[13.5px] leading-snug group-hover:underline underline-offset-4">{f.name}</p>
              <p className="mt-1 text-[14px] font-medium">{f.price}</p>
            </Link>
            <button
              onClick={() => remove(f.handle)}
              aria-label={`Quitar ${f.name} de favoritos`}
              className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-paper/90 hover:bg-paper"
            >
              <CloseIcon className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
