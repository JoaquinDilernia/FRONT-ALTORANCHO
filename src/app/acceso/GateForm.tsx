"use client";

import { useActionState } from "react";
import { enter } from "./actions";

export default function GateForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(enter, { error: false, tries: 0 });
  return (
    <form action={action}>
      <input type="hidden" name="next" value={next} />
      <label htmlFor="gate-password" className="sr-only">Clave de acceso</label>
      {/* key = intentos: cada error vuelve a montar el campo y repite el sacudón */}
      <div
        key={state.tries}
        className={`flex items-center border-b border-paper/50 transition-colors focus-within:border-paper ${state.error ? "gate-shake" : ""}`}
      >
        <input
          id="gate-password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          placeholder="Clave"
          className="min-w-0 flex-1 bg-transparent py-3 text-[18px] tracking-wide text-paper outline-none placeholder:text-paper/45"
        />
        <button
          disabled={pending}
          aria-label="Entrar"
          className="group flex h-11 w-11 items-center justify-center rounded-full bg-paper text-ink transition-transform hover:scale-105 disabled:opacity-60"
        >
          {pending ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="transition-transform group-hover:translate-x-0.5" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          )}
        </button>
      </div>
      <p className="mt-3 h-5 text-[13px] text-paper/80" role="alert">
        {state.error ? "Esa no es. Probá de nuevo." : ""}
      </p>
    </form>
  );
}
