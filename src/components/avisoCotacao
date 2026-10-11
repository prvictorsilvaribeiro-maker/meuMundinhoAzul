"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { atualizarCotacao } from "@/app/actions";
import { brl } from "@/lib/format";

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 text-[11px] font-semibold text-sky-deep disabled:opacity-50"
    >
      {pending ? "…" : "salvar"}
    </button>
  );
}

export function AvisoCotacao({ cotacao }: { cotacao: number }) {
  const [editando, setEditando] = useState(false);
  const [estado, action] = useFormState(atualizarCotacao, null);

  useEffect(() => {
    if (estado?.ok) setEditando(false);
  }, [estado]);

  if (!editando) {
    return (
      <button
        onClick={() => setEditando(true)}
        className="mb-3 flex w-full items-center gap-2 rounded-xl border border-linha bg-white px-3 py-2 text-left text-[11.5px] text-ink-soft"
      >
        <span aria-hidden>💵</span>
        Valores em dólar convertidos a <b className="font-semibold text-ink">{brl(cotacao)}</b>
        <span className="ml-auto shrink-0 text-sky-deep">alterar</span>
      </button>
    );
  }

  return (
    <form
      action={action}
      className="mb-3 flex items-center gap-2 rounded-xl border border-sky-deep bg-white px-3 py-2"
    >
      <label htmlFor="cotacao_dolar" className="mb-0 shrink-0 text-[11.5px]">
        US$ 1 =
      </label>
      <input
        id="cotacao_dolar"
        name="cotacao_dolar"
        inputMode="decimal"
        defaultValue={String(cotacao).replace(".", ",")}
        autoFocus
        className="!w-24 !border-0 !px-0 !py-0 !text-[13px] !ring-0"
      />
      <Salvar />
      <button
        type="button"
        onClick={() => setEditando(false)}
        className="shrink-0 text-[11px] text-ink-soft"
      >
        cancelar
      </button>
    </form>
  );
}
