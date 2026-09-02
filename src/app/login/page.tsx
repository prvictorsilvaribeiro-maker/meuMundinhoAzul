"use client";

import { useFormState, useFormStatus } from "react-dom";
import { entrar } from "./actions";

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primario" disabled={pending}>
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export default function LoginPage() {
  const [erro, action] = useFormState(entrar, null);

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <p className="text-sm text-ink-soft">Bem-vindos ao</p>
      <h1 className="mb-1 font-display text-4xl font-semibold leading-none tracking-tight">
        Meu Mundinho Azul
      </h1>
      <p className="mb-8 text-sm text-ink-soft">O enxoval e o quartinho do Daniel.</p>

      <form action={action} className="card space-y-4">
        <div>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" autoComplete="current-password" required />
        </div>
        {erro && <p className="text-sm text-alerta">{erro}</p>}
        <Botao />
      </form>
    </main>
  );
}
