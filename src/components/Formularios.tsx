"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  apagarCompra,
  apagarProduto,
  atualizarProduto,
  criarProduto,
  registrarCompra,
} from "@/app/actions";
import { brl, dataCurta } from "@/lib/format";
import type { CompraItem } from "@/lib/queries";
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
        className="relative max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-paper p-5 pb-[max(20px,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-linha" />
        <h2 className="font-display text-xl font-semibold">{titulo}</h2>
        {descricao && <p className="mb-4 mt-0.5 text-xs text-ink-soft">{descricao}</p>}
        <div className={descricao ? "" : "mt-4"}>{children}</div>
      </div>
    </div>
  );
}

// Os mesmos campos servem pra criar e pra editar.
function CamposProduto({
  categoria,
  produto,
}: {
  categoria: Categoria;
  produto?: ProdutoStatus;
}) {
  return (
    <>
      <div>
        <label htmlFor="nome">Item</label>
        <input
          id="nome"
          name="nome"
          defaultValue={produto?.nome}
          placeholder="Body manga curta RN"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="qtd_desejada">Quantos quero</label>
          <input
            id="qtd_desejada"
            name="qtd_desejada"
            type="number"
            min="1"
            defaultValue={produto?.qtd_desejada ?? 1}
            required
          />
        </div>
        <div>
          <label htmlFor="valor_orcado">Orçado (R$)</label>
          <input
            id="valor_orcado"
            name="valor_orcado"
            inputMode="decimal"
            defaultValue={produto ? String(produto.valor_orcado).replace(".", ",") : ""}
            placeholder="125,00"
          />
        </div>
      </div>
      <div>
        <label htmlFor="subcategoria">Grupo (opcional)</label>
        <input
          id="subcategoria"
          name="subcategoria"
          defaultValue={produto?.subcategoria ?? ""}
          placeholder={categoria === "ENXOVAL" ? "Roupinhas, Banho, Passeio…" : "Móveis, Decoração…"}
        />
      </div>
    </>
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
  const [estado, action] = useFormState(criarProduto, null);

  useEffect(() => {
    if (estado?.ok) aoFechar();
  }, [estado, aoFechar]);

  return (
    <Sheet
      titulo={categoria === "ENXOVAL" ? "Novo item do enxoval" : "Novo item do quarto"}
      descricao="O valor orçado é o total que você planeja gastar com todas as unidades."
      aoFechar={aoFechar}
    >
      <form action={action} className="space-y-3">
        <input type="hidden" name="categoria" value={categoria} />
        <CamposProduto categoria={categoria} />
        {estado?.erro && <p className="text-sm text-alerta">{estado.erro}</p>}
        <Enviar label="Adicionar à lista" />
      </form>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */

export function DetalheProduto({
  produto,
  lojas,
  compras,
  aoFechar,
}: {
  produto: ProdutoStatus;
  lojas: string[];
  compras: CompraItem[];
  aoFechar: () => void;
}) {
  const [modo, setModo] = useState<"compra" | "editar" | "excluir">("compra");
  const faltam = Math.max(0, produto.qtd_desejada - produto.qtd_comprada);

  return (
    <Sheet
      titulo={produto.nome}
      descricao={
        modo === "editar"
          ? "Mudar o nome, a quantidade ou o valor orçado não mexe nas compras já registradas."
          : faltam > 0
            ? `Faltam ${faltam} de ${produto.qtd_desejada}. Orçado: ${brl(produto.valor_orcado)}.`
            : `Já completo. Registrar mesmo assim soma ao total gasto.`
      }
      aoFechar={aoFechar}
    >
      {modo === "compra" && (
        <>
          <FormCompra produto={produto} lojas={lojas} faltam={faltam} aoFechar={aoFechar} />
          <Historico compras={compras} />
          <div className="mt-4 flex gap-3 border-t border-linha pt-4 text-[13px]">
            <button onClick={() => setModo("editar")} className="font-medium text-sky-deep">
              Editar item
            </button>
            <button onClick={() => setModo("excluir")} className="ml-auto text-alerta">
              Excluir item
            </button>
          </div>
        </>
      )}

      {modo === "editar" && (
        <FormEdicao produto={produto} aoVoltar={() => setModo("compra")} />
      )}

      {modo === "excluir" && (
        <ConfirmarExclusao
          produto={produto}
          compras={compras}
          aoVoltar={() => setModo("compra")}
          aoFechar={aoFechar}
        />
      )}
    </Sheet>
  );
}

function FormCompra({
  produto,
  lojas,
  faltam,
  aoFechar,
}: {
  produto: ProdutoStatus;
  lojas: string[];
  faltam: number;
  aoFechar: () => void;
}) {
  const [estado, action] = useFormState(registrarCompra, null);
  const [loja, setLoja] = useState("");
  const [outraLoja, setOutraLoja] = useState("");

  useEffect(() => {
    if (estado?.ok) aoFechar();
  }, [estado, aoFechar]);

  return (
    <form action={action} className="space-y-3">
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

      {estado?.erro && <p className="text-sm text-alerta">{estado.erro}</p>}
      <Enviar label="Registrar compra" />
    </form>
  );
}

function Historico({ compras }: { compras: CompraItem[] }) {
  const [apagando, setApagando] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  if (compras.length === 0) return null;

  return (
    <div className="mt-5">
      <h3 className="mb-1 text-[13px] font-semibold">Compras registradas</h3>
      <ul className="divide-y divide-linha">
        {compras.map((c) => (
          <li key={c.id} className="flex items-center gap-3 py-2.5 text-[13px]">
            <span className="tabular-nums">{c.qtd}x</span>
            <span className="truncate text-ink-soft">{c.loja ?? "sem loja"}</span>
            <span className="ml-auto shrink-0 text-[11px] text-ink-soft">{dataCurta(c.data)}</span>
            <span className="w-16 shrink-0 text-right font-semibold tabular-nums">
              {brl(c.valor_pago)}
            </span>
            {apagando === c.id ? (
              <button
                onClick={() => iniciar(() => apagarCompra(c.id))}
                disabled={pendente}
                className="shrink-0 text-[11px] font-semibold text-alerta"
              >
                {pendente ? "…" : "confirmar"}
              </button>
            ) : (
              <button
                onClick={() => setApagando(c.id)}
                aria-label="Excluir esta compra"
                className="shrink-0 px-1 text-ink-soft"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-[11px] text-ink-soft">
        Devolveu alguma coisa? Exclua a compra e a contagem volta atrás.
      </p>
    </div>
  );
}

function FormEdicao({ produto, aoVoltar }: { produto: ProdutoStatus; aoVoltar: () => void }) {
  const [estado, action] = useFormState(atualizarProduto, null);

  useEffect(() => {
    if (estado?.ok) aoVoltar();
  }, [estado, aoVoltar]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="produto_id" value={produto.id} />
      <CamposProduto categoria={produto.categoria} produto={produto} />
      {estado?.erro && <p className="text-sm text-alerta">{estado.erro}</p>}
      <Enviar label="Salvar alterações" />
      <button type="button" onClick={aoVoltar} className="btn-secundario">
        Cancelar
      </button>
    </form>
  );
}

function ConfirmarExclusao({
  produto,
  compras,
  aoVoltar,
  aoFechar,
}: {
  produto: ProdutoStatus;
  compras: CompraItem[];
  aoVoltar: () => void;
  aoFechar: () => void;
}) {
  const [pendente, iniciar] = useTransition();

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-ink-soft">
        Excluir <b className="text-ink">{produto.nome}</b> da lista
        {compras.length > 0 &&
          ` junto com ${compras.length === 1 ? "a compra registrada" : `as ${compras.length} compras registradas`}`}
        . Isso não pode ser desfeito.
      </p>
      <button
        onClick={() => iniciar(async () => { await apagarProduto(produto.id); aoFechar(); })}
        disabled={pendente}
        className="w-full rounded-2xl bg-alerta px-4 py-3.5 text-[15px] font-semibold text-white disabled:opacity-50"
      >
        {pendente ? "Excluindo…" : "Excluir item"}
      </button>
      <button onClick={aoVoltar} className="btn-secundario">
        Cancelar
      </button>
    </div>
  );
}
