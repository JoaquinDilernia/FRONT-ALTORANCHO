"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { inputCls } from "@/components/admin/ui";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="space-y-3">
      <label htmlFor="admin-password" className="block text-[12.5px] font-medium">Clave del panel</label>
      <input id="admin-password" name="password" type="password" autoFocus autoComplete="current-password" className={inputCls} />
      <p className="h-5 text-[13px] text-sale" role="alert">{state.error}</p>
      <button disabled={pending} className="w-full rounded-full bg-ink py-2.5 text-[14px] font-medium text-paper disabled:opacity-50">
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
