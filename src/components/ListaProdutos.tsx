"use client";

import { useMemo, useState } from "react";
import { NovoItem, RegistrarCompra } from "@/components/Formularios";
import { brl, pct } from "@/lib/format";
import type { Categoria, ProdutoStatus } from "@/lib/types";

type Filtro = "TUDO" | "FALTA" | "COMPRADO";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "TUDO", label: "Tudo" },
  { id: "FALTA", label: "Falta" },
  { id: "COMPRADO", label: "Comprado" },
];

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
}: {
  produtos: ProdutoStatus[];
  categoria: Categoria;
}) {
  const [filtro, setFiltro] = useState<Filtro>("TUDO");
  const [novo, setNovo] = useState(false);
  const [comprando, setComprando] = useState<ProdutoStatus | null>(null);

  const visiveis = useMemo(() => {
    if (filtro === "COMPRADO") return produtos.filter((p) => p.status === "COMPLETO");
    if (filtro === "FALTA") return produtos.filter((p) => p.status !== "COMPLETO");
    return produtos;
  }, [produtos, filtro]);

  return (
    <>
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

      {visiveis.length === 0 ? (
        <p className="card text-sm text-ink-soft">
          {filtro === "COMPRADO"
            ? "Nada finalizado ainda. Registre uma compra para o primeiro item aparecer aqui."
            : filtro === "FALTA"
              ? "Tudo comprado. Vocês fecharam a lista!"
              : "A lista está vazia. Adicione o primeiro item abaixo."}
        </p>
      ) : (
        visiveis.map((p) => <Item key={p.id} produto={p} aoClicar={() => setComprando(p)} />)
      )}

      <button onClick={() => setNovo(true)} className="btn-primario mt-3.5">
        Adicionar item
      </button>

      {novo && <NovoItem categoria={categoria} aoFechar={() => setNovo(false)} />}
      {comprando && (
        <RegistrarCompra produto={comprando} aoFechar={() => setComprando(null)} />
      )}
    </>
  );
}
