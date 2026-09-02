"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { criarProduto, registrarCompra } from "@/app/actions";
import { brl } from "@/lib/format";
import type { Categoria, ProdutoStatus } from "@/lib/types";

function Enviar({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primario" disabled={pending}>
      {pending ? "Salvando…" : label}
    </button>
  );
}

function Sheet({
  titulo,
  descricao,
  aoFechar,
  children,
}: {
  titulo: string;
  descricao?: string;
  aoFechar: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("input, select")?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [aoFechar]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        aria-label="Fechar"
        onClick={aoFechar}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="relative w-full max-w-md rounded-t-3xl bg-paper p-5 pb-[max(20px,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-linha" />
        <h2 className="font-display text-xl font-semibold">{titulo}</h2>
        {descricao && <p className="mb-4 mt-0.5 text-xs text-ink-soft">{descricao}</p>}
        <div className={descricao ? "" : "mt-4"}>{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function NovoItem({
  categoria,
  aoFechar,
}: {
  categoria: Categoria;
  aoFechar: () => void;
}) {
  const [erro, action] = useFormState(criarProduto, null);

  return (
    <Sheet
      titulo={categoria === "ENXOVAL" ? "Novo item do enxoval" : "Novo item do quarto"}
      descricao="O valor orçado é o total que você planeja gastar com todas as unidades."
      aoFechar={aoFechar}
    >
      <form action={async (fd) => { await action(fd); aoFechar(); }} className="space-y-3">
        <input type="hidden" name="categoria" value={categoria} />
        <div>
          <label htmlFor="nome">Item</label>
          <input id="nome" name="nome" placeholder="Body manga curta RN" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="qtd_desejada">Quantos quero</label>
            <input id="qtd_desejada" name="qtd_desejada" type="number" min="1" defaultValue="1" required />
          </div>
          <div>
            <label htmlFor="valor_orcado">Orçado (R$)</label>
            <input id="valor_orcado" name="valor_orcado" inputMode="decimal" placeholder="125,00" />
          </div>
        </div>
        <div>
          <label htmlFor="subcategoria">Grupo (opcional)</label>
          <input
            id="subcategoria"
            name="subcategoria"
            placeholder={categoria === "ENXOVAL" ? "Roupinhas, Banho, Passeio…" : "Móveis, Decoração…"}
          />
        </div>
        {erro && <p className="text-sm text-alerta">{erro}</p>}
        <Enviar label="Adicionar à lista" />
      </form>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */

export function RegistrarCompra({
  produto,
  lojas,
  aoFechar,
}: {
  produto: ProdutoStatus;
  lojas: string[];
  aoFechar: () => void;
}) {
  const [erro, action] = useFormState(registrarCompra, null);
  const [loja, setLoja] = useState("");
  const [outraLoja, setOutraLoja] = useState("");
  const faltam = Math.max(0, produto.qtd_desejada - produto.qtd_comprada);

  return (
    <Sheet
      titulo={produto.nome}
      descricao={
        faltam > 0
          ? `Faltam ${faltam} de ${produto.qtd_desejada}. Orçado: ${brl(produto.valor_orcado)}.`
          : `Já completo. Registrar mesmo assim soma ao total gasto.`
      }
      aoFechar={aoFechar}
    >
      <form action={async (fd) => { await action(fd); aoFechar(); }} className="space-y-3">
        <input type="hidden" name="produto_id" value={produto.id} />
        <input type="hidden" name="loja" value={loja === "__outra" ? outraLoja : loja} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="qtd">Quantas comprei</label>
            <input id="qtd" name="qtd" type="number" min="1" defaultValue={faltam || 1} required />
          </div>
          <div>
            <label htmlFor="valor_pago">Paguei (R$)</label>
            <input id="valor_pago" name="valor_pago" inputMode="decimal" placeholder="78,00" />
          </div>
        </div>

        <div>
          <label htmlFor="loja_select">Loja</label>
          <select id="loja_select" value={loja} onChange={(e) => setLoja(e.target.value)}>
            <option value="">Onde vocês compraram?</option>
            {lojas.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
            <option value="__outra">Outra…</option>
          </select>
        </div>

        {loja === "__outra" && (
          <div>
            <label htmlFor="outra_loja">Qual loja</label>
            <input
              id="outra_loja"
              value={outraLoja}
              onChange={(e) => setOutraLoja(e.target.value)}
              placeholder="Nome da loja"
              autoFocus
            />
          </div>
        )}

        <div>
          <label htmlFor="data">Data</label>
          <input
            id="data"
            name="data"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </div>

        {erro && <p className="text-sm text-alerta">{erro}</p>}
        <Enviar label="Registrar compra" />
      </form>
    </Sheet>
  );
}
