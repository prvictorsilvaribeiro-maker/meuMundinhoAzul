"use client";

import { useMemo, useState } from "react";
import { DetalheProduto, NovoItem } from "@/components/Formularios";
import { FAIXAS, opcoesSubcategoria, ordemFaixa } from "@/lib/categorias";
import { brl, pct } from "@/lib/format";
import type { CompraItem } from "@/lib/queries";
import type { Categoria, ProdutoStatus } from "@/lib/types";

type Filtro = "TUDO" | "FALTA" | "COMPRADO";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "TUDO", label: "Tudo" },
  { id: "FALTA", label: "Falta" },
  { id: "COMPRADO", label: "Comprado" },
];

const SEM_FAIXA = "__sem";

function Item({ produto, aoClicar }: { produto: ProdutoStatus; aoClicar: () => void }) {
  const completo = produto.status === "COMPLETO";
  const pendente = produto.status === "PENDENTE";
  const progresso = pct(produto.qtd_comprada, produto.qtd_desejada);
  const estourou = produto.valor_gasto > produto.valor_orcado && produto.valor_orcado > 0;

  return (
    <button
      onClick={aoClicar}
      className={`relative mb-2.5 w-full overflow-hidden rounded-card border p-3.5 text-left ${
        completo ? "border-[#CDE7DF] bg-[#F4FAF8]" : "border-linha bg-white"
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-[3px] ${
          completo ? "bg-mint" : pendente ? "bg-[#C9D6E6]" : "bg-amber"
        }`}
      />
      <div className="flex items-baseline gap-2">
        <p className="text-sm font-semibold">{produto.nome}</p>
        {produto.faixa_etaria && (
          <span className="shrink-0 rounded-md bg-sky-wash px-1.5 py-0.5 text-[10px] font-semibold text-sky-deep">
            {produto.faixa_etaria}
          </span>
        )}
        <span
          className={`ml-auto text-xs font-semibold tabular-nums ${
            completo ? "text-mint" : "text-sky-deep"
          }`}
        >
          {produto.qtd_comprada} / {produto.qtd_desejada}
        </span>
      </div>

      <div className="mt-1.5 flex gap-3.5 text-[11.5px] text-ink-soft">
        <span>
          Orçado <b className="font-semibold text-ink">{brl(produto.valor_orcado)}</b>
        </span>
        {produto.qtd_comprada > 0 && (
          <span>
            Pago{" "}
            <b className={`font-semibold ${estourou ? "text-alerta" : "text-ink"}`}>
              {brl(produto.valor_gasto)}
            </b>
          </span>
        )}
      </div>

      <div className="track mt-2 h-[5px]">
        <div
          className={`h-full rounded-full ${completo ? "bg-mint" : "bg-amber"}`}
          style={{ width: `${progresso}%` }}
        />
      </div>
    </button>
  );
}

export function ListaProdutos({
  produtos,
  categoria,
  lojas,
  compras,
}: {
  produtos: ProdutoStatus[];
  categoria: Categoria;
  lojas: string[];
  compras: Record<string, CompraItem[]>;
}) {
  const [filtro, setFiltro] = useState<Filtro>("TUDO");
  const [faixa, setFaixa] = useState<string>("TODAS");
  const [novo, setNovo] = useState(false);
  const [aberto, setAberto] = useState<ProdutoStatus | null>(null);

  const subcategorias = useMemo(
    () => opcoesSubcategoria(categoria, produtos.map((p) => p.subcategoria)),
    [categoria, produtos],
  );

  // Só mostra os chips das faixas que realmente existem nesta aba.
  const chips = useMemo(() => {
    const presentes = FAIXAS.filter((f) => produtos.some((p) => p.faixa_etaria === f));
    const temSemFaixa = produtos.some((p) => !p.faixa_etaria);
    if (presentes.length === 0) return [];
    return [
      { id: "TODAS", label: "Todas" },
      ...presentes.map((f) => ({ id: f as string, label: f as string })),
      ...(temSemFaixa ? [{ id: SEM_FAIXA, label: "Sem faixa" }] : []),
    ];
  }, [produtos]);

  const visiveis = useMemo(() => {
    let lista = produtos;

    if (filtro === "COMPRADO") lista = lista.filter((p) => p.status === "COMPLETO");
    if (filtro === "FALTA") lista = lista.filter((p) => p.status !== "COMPLETO");

    if (faixa === SEM_FAIXA) lista = lista.filter((p) => !p.faixa_etaria);
    else if (faixa !== "TODAS") lista = lista.filter((p) => p.faixa_etaria === faixa);

    // Por faixa primeiro, depois alfabético dentro dela.
    return [...lista].sort((a, b) => {
      const d = ordemFaixa(a.faixa_etaria) - ordemFaixa(b.faixa_etaria);
      return d !== 0 ? d : a.nome.localeCompare(b.nome, "pt-BR");
    });
  }, [produtos, filtro, faixa]);

  const pecasVisiveis = visiveis.reduce((s, p) => s + p.qtd_desejada, 0);

  return (
    <>
      {chips.length > 0 && (
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {chips.map((c) => (
            <button
              key={c.id}
              onClick={() => setFaixa(c.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${
                faixa === c.id
                  ? "border-sky-deep bg-sky-deep font-semibold text-white"
                  : "border-linha bg-white font-medium text-ink-soft"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="mb-3.5 flex gap-1.5 rounded-2xl bg-[#E3EBF5] p-1">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`flex-1 rounded-xl px-1 py-2 text-xs ${
              filtro === f.id
                ? "bg-white font-semibold text-ink shadow-sm"
                : "font-medium text-ink-soft"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="mb-3 text-[11.5px] text-ink-soft">
        {visiveis.length === 0
          ? "Toque em um item para registrar a compra, editar ou excluir."
          : `${visiveis.length} ${visiveis.length === 1 ? "item" : "itens"} · ${pecasVisiveis} ${
              pecasVisiveis === 1 ? "peça" : "peças"
            }`}
      </p>

      {visiveis.length === 0 ? (
        <p className="card text-sm text-ink-soft">
          {faixa !== "TODAS"
            ? "Nada nessa faixa com esse filtro."
            : filtro === "COMPRADO"
              ? "Nada finalizado ainda. Registre uma compra para o primeiro item aparecer aqui."
              : filtro === "FALTA"
                ? "Tudo comprado. Vocês fecharam a lista!"
                : "A lista está vazia. Adicione o primeiro item abaixo."}
        </p>
      ) : (
        visiveis.map((p) => <Item key={p.id} produto={p} aoClicar={() => setAberto(p)} />)
      )}

      <button onClick={() => setNovo(true)} className="btn-primario mt-3.5">
        Adicionar item
      </button>

      {novo && (
        <NovoItem
          categoria={categoria}
          subcategorias={subcategorias}
          aoFechar={() => setNovo(false)}
        />
      )}
      {aberto && (
        <DetalheProduto
          produto={aberto}
          lojas={lojas}
          compras={compras[aberto.id] ?? []}
          subcategorias={subcategorias}
          aoFechar={() => setAberto(null)}
        />
      )}
    </>
  );
}
