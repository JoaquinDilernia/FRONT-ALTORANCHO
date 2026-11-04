"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { media } from "@/content/site";
import type { ContentKey } from "@/content/schema";
import { saveContent } from "@/app/admin/actions";

// Piezas comunes de los formularios del panel.

export type CategoryOption = { handle: string; name: string; depth: number };

export const inputCls =
  "w-full rounded-lg border border-ink/15 bg-paper px-3 py-2 text-[14px] outline-none transition-colors placeholder:text-ink/35 focus:border-walnut";

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] leading-snug text-ink-soft">{hint}</span>}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  list,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  list?: string;
  maxLength?: number;
}) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} list={list} maxLength={maxLength} className={inputCls} />;
}

export function TextArea({ value, onChange, rows = 4, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`${inputCls} resize-y leading-relaxed`} />;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-[13.5px]">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-walnut" : "bg-ink/20"}`}
      >
        <span className={`absolute left-0 top-0.5 size-4 rounded-full bg-paper shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`} />
      </button>
      {label}
    </label>
  );
}

/** Link interno o externo. Sugiere las categorías de la tienda mientras se escribe. */
export function LinkInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <TextInput value={value} onChange={onChange} placeholder="/c/sillas o https://…" list="admin-links" />;
}

export function CategorySelect({
  value,
  onChange,
  categories,
  allLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  categories: CategoryOption[];
  /** si se pasa, ofrece "toda la tienda" (valor vacío) */
  allLabel?: string;
}) {
  const known = !value || categories.some((c) => c.handle === value);
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
      {allLabel !== undefined ? <option value="">{allLabel}</option> : !value && <option value="">Elegí una categoría</option>}
      {!known && <option value={value}>{value} (ya no existe)</option>}
      {categories.map((c) => (
        <option key={c.handle} value={c.handle}>
          {"  ".repeat(c.depth)}
          {c.name}
        </option>
      ))}
    </select>
  );
}

/** Acepta el link de un producto (/p/… o /productos/…) y se queda con el nombre corto. */
export function productHandle(v: string) {
  const m = v.trim().match(/\/(?:p|productos)\/([^/?#]+)/);
  return (m ? m[1] : v.trim()).toLowerCase();
}

export function ImageField({
  label,
  value,
  onChange,
  hint,
  aspect = "aspect-[4/3]",
}: {
  label: string;
  value: string;
  /** al subir una foto nueva también llega su proporción (ancho / alto) */
  onChange: (v: string, ratio?: number) => void;
  hint?: string;
  aspect?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [advanced, setAdvanced] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "No se pudo subir.");
      onChange(json.url, json.width && json.height ? json.width / json.height : undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-[12.5px] font-medium">{label}</span>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`group relative w-32 shrink-0 overflow-hidden rounded-lg border border-dashed border-ink/25 bg-sand ${aspect}`}
          aria-label={value ? "Cambiar foto" : "Subir foto"}
        >
          {value ? (
            <img src={media(value, 640)} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[12px] text-ink-soft">Sin foto</span>
          )}
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center bg-paper/70">
              <span className="size-5 animate-spin rounded-full border-2 border-walnut border-t-transparent" />
            </span>
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="rounded-full bg-ink px-4 py-1.5 text-[13px] text-paper disabled:opacity-50">
            {busy ? "Subiendo…" : value ? "Cambiar foto" : "Subir foto"}
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="text-[12.5px] text-ink-soft underline underline-offset-4 hover:text-ink">
              Quitar
            </button>
          )}
          <button type="button" onClick={() => setAdvanced((a) => !a)} className="text-[12px] text-ink-soft hover:text-ink">
            {advanced ? "Ocultar código" : "Pegar código o URL"}
          </button>
          {advanced && <TextInput value={value} onChange={(v) => onChange(v)} placeholder="cb6a2f05-_c6a6260 o https://…" />}
          {hint && <p className="text-[12px] leading-snug text-ink-soft">{hint}</p>}
          {error && <p className="text-[12.5px] text-sale" role="alert">{error}</p>}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
    </div>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

export const Up = () => <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m6 15 6-6 6 6" /></svg>;
export const Down = () => <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m6 9 6 6 6-6" /></svg>;
export const Trash = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
);

export function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next;
}

export function RowActions({ index, length, onMove, onRemove, min = 0 }: { index: number; length: number; onMove: (to: number) => void; onRemove: () => void; min?: number }) {
  return (
    <div className="flex shrink-0 items-center">
      <IconBtn label="Subir" onClick={() => onMove(index - 1)} disabled={index === 0}><Up /></IconBtn>
      <IconBtn label="Bajar" onClick={() => onMove(index + 1)} disabled={index === length - 1}><Down /></IconBtn>
      <IconBtn label="Borrar" onClick={onRemove} disabled={length <= min}><Trash /></IconBtn>
    </div>
  );
}

/** Lista de elementos con agregar, borrar y mover. */
export function ListEditor<T>({
  items,
  onChange,
  render,
  create,
  addLabel,
  max = 20,
  min = 0,
  title,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
  create: () => T;
  addLabel: string;
  max?: number;
  min?: number;
  title?: (item: T, index: number) => string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-ink/10 bg-paper p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="truncate text-[12.5px] font-medium text-ink-soft">{title ? title(item, i) : `#${i + 1}`}</p>
            <RowActions
              index={i}
              length={items.length}
              min={min}
              onMove={(to) => onChange(move(items, i, to))}
              onRemove={() => onChange(items.filter((_, j) => j !== i))}
            />
          </div>
          {render(item, (patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}
        </div>
      ))}
      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, create()])}
          className="w-full rounded-xl border border-dashed border-ink/25 py-3 text-[13.5px] text-ink-soft transition-colors hover:border-walnut hover:text-ink"
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}

/** Lista de links de categorías para el autocompletado de los campos de link. */
export function LinkSuggestions({ categories }: { categories: CategoryOption[] }) {
  return (
    <datalist id="admin-links">
      {categories.map((c) => (
        <option key={c.handle} value={`/c/${c.handle}`}>
          {c.name}
        </option>
      ))}
    </datalist>
  );
}

/** Estado de un formulario del panel: cambios sin guardar, guardar y avisar. */
export function useContentEditor<T>(key: ContentKey, initial: T, prepare: (v: T) => unknown = (v) => v) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "ok" | "error"; message?: string }>({ kind: "idle" });
  const dirty = value !== saved;

  // Avisa antes de cerrar la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  async function save() {
    setStatus({ kind: "saving" });
    const res = await saveContent(key, prepare(value)).catch(() => ({ ok: false as const, error: "Se cortó la conexión. Probá de nuevo." }));
    if (res.ok) {
      setSaved(value);
      setStatus({ kind: "ok", message: "Guardado. Ya se ve en la tienda." });
    } else setStatus({ kind: "error", message: res.error });
  }

  return {
    value,
    setValue: (v: T) => {
      setValue(v);
      if (status.kind !== "saving") setStatus({ kind: "idle" });
    },
    dirty,
    status,
    save,
    discard: () => setValue(saved),
  };
}

export function SaveBar({
  dirty,
  status,
  onSave,
  onDiscard,
  previewHref,
}: {
  dirty: boolean;
  status: { kind: string; message?: string };
  onSave: () => void;
  onDiscard: () => void;
  previewHref: string;
}) {
  const id = useId();
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-10 border-t border-ink/10 bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3">
        <p id={id} className={`min-w-0 flex-1 text-[13px] ${status.kind === "error" ? "text-sale" : "text-ink-soft"}`} role="status">
          {status.kind === "saving"
            ? "Guardando…"
            : status.message
              ? status.message
              : dirty
                ? "Tenés cambios sin guardar."
                : "Todo guardado."}
        </p>
        <a href={previewHref} target="_blank" rel="noopener" className="text-[13px] text-ink-soft underline underline-offset-4 hover:text-ink">
          Ver en la tienda
        </a>
        {dirty && (
          <button type="button" onClick={onDiscard} className="rounded-full px-4 py-2 text-[13.5px] text-ink-soft hover:text-ink">
            Descartar
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || status.kind === "saving"}
          aria-describedby={id}
          className="rounded-full bg-ink px-6 py-2 text-[13.5px] font-medium text-paper transition-opacity disabled:opacity-35"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
