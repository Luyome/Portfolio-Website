"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="adm-form">
      <div className="adm-field">
        <label htmlFor="password">Admin Password</label>
        <input id="password" type="password" name="password" required autoFocus />
      </div>
      {state?.error && <div className="adm-error">{state.error}</div>}
      <button type="submit" className="adm-btn" disabled={pending}>
        {pending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
