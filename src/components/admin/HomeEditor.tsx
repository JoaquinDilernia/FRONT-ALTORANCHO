"use client";

import { useState } from "react";
import { media } from "@/content/site";
import { SECTION_LABELS, SORTS, type BannerContent, type HomeSection, type SectionType } from "@/content/schema";
import {
  CategorySelect,
  Field,
  ImageField,
  LinkInput,
  LinkSuggestions,
  ListEditor,
  RowActions,
  SaveBar,
  TextArea,
  TextInput,
  Toggle,
  inputCls,
  move,
  productHandle,
  useContentEditor,
  type CategoryOption,
} from "./ui";

type Of<T extends SectionType> = Extract<HomeSection, { type: T }>;

const newId = () => Math.random().toString(36).slice(2, 10);
const emptyBanner = (): BannerContent => ({ title: "", copy: "", href: "", image: "", imageMobile: "", textInImage: false, videoId: "", cta: "" });

// Bloque vacío de cada tipo, para "Agregar bloque".
function template(type: SectionType): HomeSection {
  const base = { id: newId(), visible: true };
  switch (type) {
    case "hero":
      return { ...base, type, banner: emptyBanner(), primary: { label: "", href: "" }, actions: [], productsCategory: "", productsTitle: "Las más elegidas" };
    case "tiles":
      return { ...base, type, items: [] };
    case "rail":
      return { ...base, type, title: "", href: "", category: "", sort: "best-selling", count: 12, autoLight: false };
    case "video":
      return { ...base, type, videoId: "", title: "", anchor: "" };
    case "cards":
      return { ...base, type, items: [] };
    case "room":
      return { ...base, type, image: "", ratio: 1, alt: "", title: "", copy: "", reverse: false, hotspots: [] };
    case "banner":
      return { ...base, type, banner: emptyBanner() };
    case "categories":
      return { ...base, type, title: "comprá por categoría.", items: [] };
    case "sales":
      return { ...base, type, title: "sale.", href: "/c/sale", handles: [] };
    case "recent":
    case "benefits":
      return { ...base, type };
  }
}

// Texto corto que se ve en la lista con el bloque cerrado.
function summary(s: HomeSection) {
  switch (s.type) {
    case "hero":
    case "banner":
      return s.banner.title;
    case "rail":
    case "video":
    case "room":
    case "categories":
    case "sales":
      return s.title;
    case "tiles":
      return s.items.map((i) => i.label).join(" · ");
    case "cards":
      return s.items.map((i) => i.title).join(" · ");
    default:
      return "";
  }
}

/** Saca el código del video de un link de YouTube (watch?v=, youtu.be/, shorts/). */
function youtubeId(v: string) {
  const m = v.trim().match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{6,})/);
  return m ? m[1] : v.trim();
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function BannerFields({ value, onChange }: { value: BannerContent; onChange: (v: BannerContent) => void }) {
  const set = (patch: Partial<BannerContent>) => onChange({ ...value, ...patch });
  return (
    <div className="space-y-4">
      <Grid>
        <ImageField label="Foto (computadora)" value={value.image} onChange={(image) => set({ image })} aspect="aspect-[3/1]" hint="Horizontal, idealmente 2000 × 670 px." />
        <ImageField label="Foto para celular (opcional)" value={value.imageMobile} onChange={(imageMobile) => set({ imageMobile })} aspect="aspect-[4/5]" hint="Vertical. Si no hay, se recorta la otra." />
      </Grid>
      <Toggle checked={value.textInImage} onChange={(textInImage) => set({ textInImage })} label="La foto ya tiene el texto escrito (no le pongo título encima)" />
      <Grid>
        <Field label="Título">
          <TextInput value={value.title} onChange={(title) => set({ title })} />
        </Field>
        <Field label="Link">
          <LinkInput value={value.href} onChange={(href) => set({ href })} />
        </Field>
      </Grid>
      {!value.textInImage && (
        <Grid>
          <Field label="Texto">
            <TextInput value={value.copy} onChange={(copy) => set({ copy })} />
          </Field>
          <Field label="Texto del botón" hint='Si queda vacío dice "Ver más".'>
            <TextInput value={value.cta} onChange={(cta) => set({ cta })} />
          </Field>
        </Grid>
      )}
      <Field label="Video de YouTube (opcional)" hint="Pegá el link del video. Con video, el banner lo reproduce al tocarlo en vez de llevar al link.">
        <TextInput value={value.videoId} onChange={(v) => set({ videoId: youtubeId(v) })} placeholder="https://www.youtube.com/watch?v=…" />
      </Field>
    </div>
  );
}

function HotspotEditor({ s, set }: { s: Of<"room">; set: (p: Partial<Of<"room">>) => void }) {
  const [active, setActive] = useState<number | null>(null);
  if (!s.image) return <p className="text-[13px] text-ink-soft">Subí la foto para marcar los productos.</p>;

  function place(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 1000) / 10;
    const y = Math.round(((e.clientY - r.top) / r.height) * 1000) / 10;
    if (active !== null) {
      set({ hotspots: s.hotspots.map((h, i) => (i === active ? { ...h, x, y } : h)) });
      setActive(null);
    } else if (s.hotspots.length < 8) {
      set({ hotspots: [...s.hotspots, { handle: "", x, y }] });
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-ink-soft">
        {active !== null ? `Tocá la foto para mover el punto ${active + 1}.` : "Tocá la foto donde está cada producto para agregar un punto."}
      </p>
      <div className="relative max-w-md cursor-crosshair overflow-hidden rounded-lg" style={{ aspectRatio: s.ratio }} onClick={place}>
        <img src={media(s.image, 1024)} alt="" className="absolute inset-0 size-full object-cover" draggable={false} />
        {s.hotspots.map((h, i) => (
          <span
            key={i}
            className={`absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[12px] font-semibold shadow ${
              active === i ? "bg-walnut text-paper ring-4 ring-paper/60" : "bg-paper text-ink"
            }`}
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            {i + 1}
          </span>
        ))}
      </div>
      {s.hotspots.map((h, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sand text-[12px] font-semibold">{i + 1}</span>
          <input
            value={h.handle}
            onChange={(e) => set({ hotspots: s.hotspots.map((x, j) => (j === i ? { ...x, handle: productHandle(e.target.value) } : x)) })}
            placeholder="Pegá el link del producto"
            className={inputCls}
          />
          <button type="button" onClick={() => setActive(active === i ? null : i)} className="shrink-0 text-[12.5px] text-ink-soft underline underline-offset-4 hover:text-ink">
            {active === i ? "Cancelar" : "Mover"}
          </button>
          <RowActions
            index={i}
            length={s.hotspots.length}
            onMove={(to) => set({ hotspots: move(s.hotspots, i, to) })}
            onRemove={() => set({ hotspots: s.hotspots.filter((_, j) => j !== i) })}
          />
        </div>
      ))}
    </div>
  );
}

function SectionFields({ s, onChange, categories }: { s: HomeSection; onChange: (s: HomeSection) => void; categories: CategoryOption[] }) {
  const set = <T extends HomeSection>(patch: Partial<T>) => onChange({ ...s, ...patch } as HomeSection);

  switch (s.type) {
    case "hero":
      return (
        <div className="space-y-6">
          <BannerFields value={s.banner} onChange={(banner) => set({ banner })} />
          <div className="space-y-4 border-t border-ink/10 pt-5">
            <p className="text-[13px] font-semibold">Franja de botones debajo del banner</p>
            <Grid>
              <Field label="Botón principal">
                <TextInput value={s.primary.label} onChange={(label) => set<Of<"hero">>({ primary: { ...s.primary, label } })} />
              </Field>
              <Field label="Link del botón principal">
                <LinkInput value={s.primary.href} onChange={(href) => set<Of<"hero">>({ primary: { ...s.primary, href } })} />
              </Field>
            </Grid>
            <ListEditor
              items={s.actions}
              onChange={(actions) => set<Of<"hero">>({ actions })}
              max={5}
              addLabel="Agregar botón"
              title={(a, i) => a.label || `Botón ${i + 1}`}
              create={() => ({ label: "", href: "" })}
              render={(a, update) => (
                <Grid>
                  <Field label="Texto"><TextInput value={a.label} onChange={(label) => update({ label })} /></Field>
                  <Field label="Link"><LinkInput value={a.href} onChange={(href) => update({ href })} /></Field>
                </Grid>
              )}
            />
            <Grid>
              <Field label="Productos al costado" hint="Muestra 4 productos de esta categoría.">
                <CategorySelect value={s.productsCategory} onChange={(productsCategory) => set<Of<"hero">>({ productsCategory })} categories={categories} allLabel="Sin productos" />
              </Field>
              <Field label="Título de los productos">
                <TextInput value={s.productsTitle} onChange={(productsTitle) => set<Of<"hero">>({ productsTitle })} />
              </Field>
            </Grid>
          </div>
        </div>
      );
    case "banner":
      return <BannerFields value={s.banner} onChange={(banner) => set({ banner })} />;
    case "tiles":
      return (
        <ListEditor
          items={s.items}
          onChange={(items) => set({ items })}
          max={8}
          addLabel="Agregar foto"
          title={(it, i) => it.label || `Foto ${i + 1}`}
          create={() => ({ label: "", href: "", image: "" })}
          render={(it, update) => (
            <div className="space-y-4">
              <ImageField label="Foto" value={it.image} onChange={(image) => update({ image })} aspect="aspect-[4/5]" hint="Vertical (4:5)." />
              <Grid>
                <Field label="Título"><TextInput value={it.label} onChange={(label) => update({ label })} /></Field>
                <Field label="Link"><LinkInput value={it.href} onChange={(href) => update({ href })} /></Field>
              </Grid>
            </div>
          )}
        />
      );
    case "cards":
      return (
        <ListEditor
          items={s.items}
          onChange={(items) => set({ items })}
          max={8}
          addLabel="Agregar foto"
          title={(it, i) => it.title || `Foto ${i + 1}`}
          create={() => ({ image: "", title: "", copy: "", href: "" })}
          render={(it, update) => (
            <div className="space-y-4">
              <ImageField label="Foto" value={it.image} onChange={(image) => update({ image })} aspect="aspect-[4/5]" hint="Vertical (4:5)." />
              <Grid>
                <Field label="Título"><TextInput value={it.title} onChange={(title) => update({ title })} /></Field>
                <Field label="Link"><LinkInput value={it.href} onChange={(href) => update({ href })} /></Field>
              </Grid>
              <Field label="Texto"><TextInput value={it.copy} onChange={(copy) => update({ copy })} /></Field>
            </div>
          )}
        />
      );
    case "rail":
      return (
        <div className="space-y-4">
          <Grid>
            <Field label="Título"><TextInput value={s.title} onChange={(title) => set({ title })} /></Field>
            <Field label='Link de "Ver todo"'><LinkInput value={s.href} onChange={(href) => set({ href })} /></Field>
          </Grid>
          <Grid>
            <Field label="Productos de">
              <CategorySelect value={s.category} onChange={(category) => set({ category })} categories={categories} allLabel="Toda la tienda" />
            </Field>
            <Field label="Orden">
              <select value={s.sort} onChange={(e) => set({ sort: e.target.value as Of<"rail">["sort"] })} className={inputCls}>
                {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </Field>
          </Grid>
          <Grid>
            <Field label="Cantidad de productos">
              <input type="number" min={4} max={24} value={s.count} onChange={(e) => set({ count: Math.min(24, Math.max(4, Number(e.target.value) || 4)) })} className={inputCls} />
            </Field>
          </Grid>
          <Toggle checked={s.autoLight} onChange={(autoLight) => set({ autoLight })} label="Encender las lámparas al pasar (para iluminación)" />
        </div>
      );
    case "video":
      return (
        <Grid>
          <Field label="Video de YouTube" hint="Pegá el link del video.">
            <TextInput value={s.videoId} onChange={(v) => set({ videoId: youtubeId(v) })} placeholder="https://www.youtube.com/watch?v=…" />
          </Field>
          <Field label="Título"><TextInput value={s.title} onChange={(title) => set({ title })} /></Field>
        </Grid>
      );
    case "room":
      return (
        <div className="space-y-4">
          <ImageField label="Foto de ambiente" value={s.image} onChange={(image, ratio) => set<Of<"room">>(ratio ? { image, ratio } : { image })} />
          <Grid>
            <Field label="Título"><TextInput value={s.title} onChange={(title) => set({ title })} /></Field>
            <Field label="Descripción de la foto" hint="Para quien no ve la imagen."><TextInput value={s.alt} onChange={(alt) => set({ alt })} /></Field>
          </Grid>
          <Field label="Texto"><TextArea rows={2} value={s.copy} onChange={(copy) => set({ copy })} /></Field>
          <Toggle checked={s.reverse} onChange={(reverse) => set({ reverse })} label="Foto a la derecha" />
          <div className="border-t border-ink/10 pt-4">
            <p className="mb-2 text-[13px] font-semibold">Productos marcados</p>
            <HotspotEditor s={s} set={(p) => set(p)} />
          </div>
        </div>
      );
    case "categories":
      return (
        <div className="space-y-4">
          <Field label="Título"><TextInput value={s.title} onChange={(title) => set({ title })} /></Field>
          <ListEditor
            items={s.items}
            onChange={(items) => set({ items })}
            max={12}
            addLabel="Agregar categoría"
            title={(it, i) => it.label || `Categoría ${i + 1}`}
            create={() => ({ handle: "", label: "", image: "", highlight: false })}
            render={(it, update) => (
              <div className="space-y-4">
                <Grid>
                  <Field label="Categoría">
                    <CategorySelect
                      value={it.handle}
                      categories={categories}
                      onChange={(handle) => update({ handle, label: it.label || categories.find((c) => c.handle === handle)?.name || "" })}
                    />
                  </Field>
                  <Field label="Nombre que se muestra"><TextInput value={it.label} onChange={(label) => update({ label })} /></Field>
                </Grid>
                <ImageField label="Foto (opcional)" value={it.image} onChange={(image) => update({ image })} aspect="aspect-[4/5]" hint="Si no hay, usa la foto del producto más vendido." />
                <Toggle checked={it.highlight} onChange={(highlight) => update({ highlight })} label="Nombre en rojo (para SALE)" />
              </div>
            )}
          />
        </div>
      );
    case "sales":
      return (
        <div className="space-y-4">
          <Grid>
            <Field label="Título"><TextInput value={s.title} onChange={(title) => set({ title })} /></Field>
            <Field label='Link de "Ver todo"'><LinkInput value={s.href} onChange={(href) => set({ href })} /></Field>
          </Grid>
          <p className="text-[12.5px] text-ink-soft">El porcentaje sale del nombre de la categoría en Tiendanube (por ejemplo, &quot;Hasta 30% OFF en sillas&quot;).</p>
          <ListEditor
            items={s.handles.map((handle) => ({ handle }))}
            onChange={(items) => set({ handles: items.map((i) => i.handle) })}
            max={8}
            addLabel="Agregar sale"
            title={(it, i) => categories.find((c) => c.handle === it.handle)?.name || `Sale ${i + 1}`}
            create={() => ({ handle: "" })}
            render={(it, update) => <CategorySelect value={it.handle} onChange={(handle) => update({ handle })} categories={categories} />}
          />
        </div>
      );
    case "recent":
      return <p className="text-[13px] text-ink-soft">Muestra los últimos productos que miró cada persona. No tiene nada para configurar.</p>;
    case "benefits":
      return <p className="text-[13px] text-ink-soft">Los beneficios se editan en la pestaña Promos.</p>;
  }
}

export default function HomeEditor({ initial, categories }: { initial: HomeSection[]; categories: CategoryOption[] }) {
  const ed = useContentEditor("home", initial, (sections) => ({ sections }));
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState<SectionType | "">("");
  const sections = ed.value;

  const update = (i: number, s: HomeSection) => ed.setValue(sections.map((x, j) => (j === i ? s : x)));

  return (
    <div>
      <LinkSuggestions categories={categories} />
      <ol className="space-y-2.5">
        {sections.map((s, i) => {
          const isOpen = open === s.id;
          return (
            <li key={s.id} className={`overflow-hidden rounded-2xl border bg-paper transition-shadow ${isOpen ? "border-ink/20 shadow-sm" : "border-ink/10"}`}>
              <div className="flex items-center gap-2 py-2 pl-4 pr-2">
                <span className="w-5 shrink-0 text-[12px] tabular-nums text-ink-soft">{i + 1}</span>
                <button type="button" onClick={() => setOpen(isOpen ? null : s.id)} className="min-w-0 flex-1 py-1.5 text-left" aria-expanded={isOpen}>
                  <span className={`block text-[14px] font-medium ${s.visible ? "" : "text-ink-soft line-through"}`}>{SECTION_LABELS[s.type]}</span>
                  <span className="block truncate text-[12.5px] text-ink-soft">{summary(s) || (s.visible ? "" : "Oculto")}</span>
                </button>
                <span className="hidden sm:block">
                  <Toggle checked={s.visible} onChange={(visible) => update(i, { ...s, visible })} label="" />
                </span>
                <RowActions
                  index={i}
                  length={sections.length}
                  onMove={(to) => ed.setValue(move(sections, i, to))}
                  onRemove={() => {
                    if (confirm(`¿Borrar el bloque "${SECTION_LABELS[s.type]}"? Si solo querés que no se vea, apagalo.`)) ed.setValue(sections.filter((_, j) => j !== i));
                  }}
                />
              </div>
              {isOpen && (
                <div className="space-y-4 border-t border-ink/10 bg-[#fbfaf9] p-4 sm:p-6">
                  <div className="sm:hidden">
                    <Toggle checked={s.visible} onChange={(visible) => update(i, { ...s, visible })} label="Se ve en la tienda" />
                  </div>
                  <SectionFields s={s} onChange={(n) => update(i, n)} categories={categories} />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-ink/25 p-3">
        <select value={adding} onChange={(e) => setAdding(e.target.value as SectionType)} className={`${inputCls} w-auto flex-1`}>
          <option value="">Agregar un bloque…</option>
          {(Object.keys(SECTION_LABELS) as SectionType[]).map((t) => <option key={t} value={t}>{SECTION_LABELS[t]}</option>)}
        </select>
        <button
          type="button"
          disabled={!adding}
          onClick={() => {
            if (!adding) return;
            const s = template(adding);
            ed.setValue([...sections, s]);
            setOpen(s.id);
            setAdding("");
          }}
          className="rounded-full bg-ink px-5 py-2 text-[13.5px] text-paper disabled:opacity-35"
        >
          Agregar al final
        </button>
      </div>

      <SaveBar dirty={ed.dirty} status={ed.status} onSave={ed.save} onDiscard={ed.discard} previewHref="/" />
    </div>
  );
}
