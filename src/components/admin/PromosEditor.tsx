"use client";

import { BENEFIT_ICONS, type Promos } from "@/content/schema";
import { Field, ListEditor, SaveBar, TextInput, inputCls, useContentEditor } from "./ui";

export default function PromosEditor({ initial }: { initial: Promos }) {
  const ed = useContentEditor("promos", initial, (v) => ({ ...v, marquee: v.marquee.filter((m) => m.trim()) }));
  const v = ed.value;

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-[17px] font-semibold tracking-[-0.02em]">Cinta de mensajes</h2>
        <p className="mb-4 mt-1 text-[13px] text-ink-soft">Los textos que pasan arriba de todo, en la computadora.</p>
        <ListEditor
          items={v.marquee}
          onChange={(marquee) => ed.setValue({ ...v, marquee })}
          max={10}
          addLabel="Agregar mensaje"
          title={(_, i) => `Mensaje ${i + 1}`}
          create={() => ""}
          render={(m, _update, i) => (
            <TextInput value={m} maxLength={120} onChange={(t) => ed.setValue({ ...v, marquee: v.marquee.map((x, j) => (j === i ? t : x)) })} />
          )}
        />
      </section>

      <section>
        <h2 className="text-[17px] font-semibold tracking-[-0.02em]">Beneficios</h2>
        <p className="mb-4 mt-1 text-[13px] text-ink-soft">
          Aparecen debajo del menú, al final de la home y del listado, y en la ficha de cada producto. Hasta 4.
        </p>
        <ListEditor
          items={v.benefits}
          onChange={(benefits) => ed.setValue({ ...v, benefits })}
          min={1}
          max={4}
          addLabel="Agregar beneficio"
          title={(b, i) => b.title || `Beneficio ${i + 1}`}
          create={() => ({ icon: "truck" as const, title: "", copy: "" })}
          render={(b, update) => (
            <div className="grid gap-4 sm:grid-cols-[140px_1fr_1fr]">
              <Field label="Ícono">
                <select value={b.icon} onChange={(e) => update({ icon: e.target.value as typeof b.icon })} className={inputCls}>
                  {Object.entries(BENEFIT_ICONS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                </select>
              </Field>
              <Field label="Título"><TextInput value={b.title} onChange={(title) => update({ title })} /></Field>
              <Field label="Detalle"><TextInput value={b.copy} onChange={(copy) => update({ copy })} /></Field>
            </div>
          )}
        />
      </section>

      <p className="text-[12.5px] text-ink-soft">
        El 20% de descuento por transferencia que se calcula en los precios no cambia desde acá: si cambia el porcentaje, avisale al desarrollador.
      </p>

      <SaveBar dirty={ed.dirty} status={ed.status} onSave={ed.save} onDiscard={ed.discard} previewHref="/" />
    </div>
  );
}
