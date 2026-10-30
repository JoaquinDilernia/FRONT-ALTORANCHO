"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "sending" | "ok" | "error"; msg?: string }>({ kind: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ kind: "sending" });
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({}));
    if (!res?.ok) return setState({ kind: "error", msg: data?.error ?? "No pudimos guardar tu email. Probá de nuevo." });
    setState({ kind: "ok", msg: data.already ? "Ese email ya estaba suscripto." : "Listo, ya estás suscripto." });
    setEmail("");
  };

  return (
    <form onSubmit={submit} className="w-full max-w-[460px]" noValidate>
      <label htmlFor="nl-email" className="text-[13.5px] font-semibold">
        Tu email
      </label>
      <div className="mt-3 flex border-b border-ink focus-within:border-b-2">
        <input
          id="nl-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state.kind !== "idle") setState({ kind: "idle" });
          }}
          placeholder="nombre@email.com"
          aria-invalid={state.kind === "error"}
          aria-describedby="nl-msg"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[14px] outline-none placeholder:text-ink-soft"
        />
        <button disabled={state.kind === "sending"} className="shrink-0 px-2 text-[13.5px] font-medium disabled:opacity-60">
          {state.kind === "sending" ? "Suscribiendo…" : "Suscribirme"}
        </button>
      </div>
      <p id="nl-msg" aria-live="polite" className={`mt-2 min-h-5 text-[12.5px] ${state.kind === "error" ? "text-sale" : "text-walnut"}`}>
        {state.msg}
      </p>
    </form>
  );
}
