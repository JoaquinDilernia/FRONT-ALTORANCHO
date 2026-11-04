"use client";

import { useState } from "react";
import type { HelpContent } from "@/content/schema";
import { Field, ListEditor, SaveBar, TextArea, TextInput, useContentEditor } from "./ui";

type Pages = HelpContent["pages"];

// Los párrafos se escriben en un solo cuadro, separados por una línea en blanco.
const toText = (paragraphs: string[]) => paragraphs.join("\n\n");
const toParagraphs = (text: string) => text.split(/\n[ \t]*\n/);

export default function HelpEditor({ initial }: { initial: Pages }) {
  const ed = useContentEditor("ayuda", initial, (pages) => ({
    pages: pages.map((p) => ({
      ...p,
      body: p.body
        .map((s) => ({ heading: s.heading, text: s.text.map((t) => t.trim()).filter(Boolean) }))
        .filter((s) => s.heading.trim() || s.text.length),
    })),
  }));
  const [current, setCurrent] = useState(0);
  const pages = ed.value;
  const page = pages[current];
  const setPage = (patch: Partial<Pages[number]>) => ed.setValue(pages.map((p, i) => (i === current ? { ...p, ...patch } : p)));

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist">
        {pages.map((p, i) => (
          <button
            key={p.slug}
            type="button"
            role="tab"
            aria-selected={i === current}
            onClick={() => setCurrent(i)}
            className={`rounded-full border px-4 py-2 text-[13.5px] transition-colors ${i === current ? "border-ink bg-ink text-paper" : "border-ink/15 bg-paper hover:border-ink/40"}`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {page && (
        <div className="space-y-5">
          <Field label="Título"><TextInput value={page.title} onChange={(title) => setPage({ title })} /></Field>
          <Field label="Bajada" hint="El texto corto debajo del título."><TextArea rows={2} value={page.intro} onChange={(intro) => setPage({ intro })} /></Field>

          <div>
            <p className="mb-1 text-[13px] font-semibold">Contenido</p>
            <p className="mb-3 text-[12.5px] text-ink-soft">
              Dividilo en partes con un subtítulo cada una. Dentro de cada parte, dejá una línea en blanco entre párrafos.
              {!page.body.length && " Mientras no tenga contenido, la página manda a leerla en altorancho.com."}
            </p>
            <ListEditor
              items={page.body}
              onChange={(body) => setPage({ body })}
              max={40}
              addLabel="Agregar parte"
              title={(s, i) => s.heading || `Parte ${i + 1}`}
              create={() => ({ heading: "", text: [""] })}
              render={(s, update) => (
                <div className="space-y-3">
                  <Field label="Subtítulo"><TextInput value={s.heading} onChange={(heading) => update({ heading })} /></Field>
                  <Field label="Texto"><TextArea rows={6} value={toText(s.text)} onChange={(t) => update({ text: toParagraphs(t) })} /></Field>
                </div>
              )}
            />
          </div>

          <Field label="Link a la página en altorancho.com" hint="Se usa mientras la página no tenga contenido.">
            <TextInput value={page.original} onChange={(original) => setPage({ original })} />
          </Field>
        </div>
      )}

      <SaveBar dirty={ed.dirty} status={ed.status} onSave={ed.save} onDiscard={ed.discard} previewHref={page ? `/ayuda/${page.slug}` : "/"} />
    </div>
  );
}
