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
import { CATEGORIAS, FAIXAS } from "@/lib/categorias";
import { brl, dataCurta, usd } from "@/lib/format";
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

const paraNumero = (s: string) => {
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

// Os mesmos campos servem para criar e para editar.
function CamposProduto({
  categoria,
  produto,
  subcategorias,
  cotacao,
}: {
  categoria: Categoria;
  produto?: ProdutoStatus;
  subcategorias: string[];
  cotacao: number;
}) {
  const atual = produto?.subcategoria ?? "";
  const jaNaLista = atual !== "" && subcategorias.includes(atual);

  const [grupo, setGrupo] = useState(jaNaLista ? atual : atual ? "__outra" : "");
  const [outroGrupo, setOutroGrupo] = useState(jaNaLista ? "" : atual);

  const [precoUsd, setPrecoUsd] = useState(
    produto?.preco_usd ? String(produto.preco_usd).replace(".", ",") : "",
  );
  const [qtd, setQtd] = useState(String(produto?.qtd_desejada ?? 1));

  const temUsd = paraNumero(precoUsd) > 0;
  const previsto = paraNumero(precoUsd) * (paraNumero(qtd) || 1) * cotacao;

  return (
    <>
      <input type="hidden" name="subcategoria" value={grupo === "__outra" ? outroGrupo : grupo} />

      <div>
        <label htmlFor="nome">Item</label>
        <input
          id="nome"
          name="nome"
          defaultValue={produto?.nome}
          placeholder="Body manga curta"
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
            value={qtd}
            onChange={(e) => setQtd(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="preco_usd">Preço unit. (US$)</label>
          <input
            id="preco_usd"
            name="preco_usd"
            inputMode="decimal"
            value={precoUsd}
            onChange={(e) => setPrecoUsd(e.target.value)}
            placeholder="4,00"
          />
        </div>
      </div>

      {temUsd ? (
        <p className="text-[11.5px] text-ink-soft">
          {usd(paraNumero(precoUsd))} x {paraNumero(qtd) || 1} ={" "}
          <b className="font-semibold text-ink">{brl(previsto)}</b> com o dólar a {brl(cotacao)}. O
          valor em real se ajusta sozinho se a cotação mudar.
        </p>
      ) : (
        <div>
          <label htmlFor="valor_orcado">Orçado total (R$)</label>
          <input
            id="valor_orcado"
            name="valor_orcado"
            inputMode="decimal"
            defaultValue={
              produto && !produto.preco_usd ? String(produto.valor_orcado).replace(".", ",") : ""
            }
            placeholder="125,00"
          />
          <p className="mt-1 text-[11.5px] text-ink-soft">
            Para o que for comprado no Brasil. Se preencher o preço em dólar, este campo some.
          </p>
        </div>
      )}

      {categoria === "ENXOVAL" && (
        <div>
          <label htmlFor="faixa">Faixa etária</label>
          <select id="faixa" name="faixa_etaria" defaultValue={produto?.faixa_etaria ?? ""}>
            <option value="">Sem faixa</option>
            {FAIXAS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="grupo">Categoria</label>
        <select id="grupo" value={grupo} onChange={(e) => setGrupo(e.target.value)}>
          <option value="">Sem categoria</option>
          {subcategorias.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          <option value="__outra">Outra…</option>
        </select>
      </div>

      {grupo === "__outra" && (
        <div>
          <label htmlFor="outro_grupo">Qual categoria</label>
          <input
            id="outro_grupo"
            value={outroGrupo}
            onChange={(e) => setOutroGrupo(e.target.value)}
            placeholder="Nome da categoria"
            autoFocus
          />
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Adicionar item novo à lista                                         */
/* ------------------------------------------------------------------ */

export function NovoItem({
  categoria,
  subcategorias,
  cotacao,
  aoFechar,
}: {
  categoria: Categoria;
  subcategorias: string[];
  cotacao: number;
  aoFechar: () => void;
}) {
  const [estado, action] = useFormState(criarProduto, null);

  useEffect(() => {
    if (estado?.ok) aoFechar();
  }, [estado, aoFechar]);

  return (
    <Sheet
      titulo={`Novo item · ${CATEGORIAS[categoria].titulo}`}
      descricao="Comprando nos EUA, preencha o preço em dólar. O real vem da cotação."
      aoFechar={aoFechar}
    >
      <form action={action} className="space-y-3">
        <input type="hidden" name="categoria" value={categoria} />
        <CamposProduto
          categoria={categoria}
          subcategorias={subcategorias}
          cotacao={cotacao}
        />
        {estado?.erro && <p className="text-sm text-alerta">{estado.erro}</p>}
        <Enviar label="Adicionar à lista" />
      </form>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/* Detalhe: registrar compra, histórico, editar e excluir              */
/* ------------------------------------------------------------------ */

export function DetalheProduto({
  produto,
  lojas,
  compras,
  subcategorias,
  cotacao,
  aoFechar,
}: {
  produto: ProdutoStatus;
  lojas: string[];
  compras: CompraItem[];
  subcategorias: string[];
  cotacao: number;
  aoFechar: () => void;
}) {
  const [modo, setModo] = useState<"compra" | "editar" | "excluir">("compra");
  const faltam = Math.max(0, produto.qtd_desejada - produto.qtd_comprada);

  const orcado = produto.valor_orcado_usd
    ? `${usd(produto.valor_orcado_usd)} (${brl(produto.valor_orcado)})`
    : brl(produto.valor_orcado);

  return (
    <Sheet
      titulo={produto.nome}
      descricao={
        modo === "editar"
          ? "Mudar o nome, a quantidade ou o preço não mexe nas compras já registradas."
          : faltam > 0
            ? `Faltam ${faltam} de ${produto.qtd_desejada}. Orçado: ${orcado}.`
            : "Já completo. Registrar mesmo assim soma ao total gasto."
      }
      aoFechar={aoFechar}
    >
      {modo === "compra" && (
        <>
          <FormCompra
            produto={produto}
            lojas={lojas}
            faltam={faltam}
            cotacao={cotacao}
            aoFechar={aoFechar}
          />
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
        <FormEdicao
          produto={produto}
          subcategorias={subcategorias}
          cotacao={cotacao}
          aoVoltar={() => setModo("compra")}
        />
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
  cotacao,
  aoFechar,
}: {
  produto: ProdutoStatus;
  lojas: string[];
  faltam: number;
  cotacao: number;
  aoFechar: () => void;
}) {
  const [estado, action] = useFormState(registrarCompra, null);
  const [loja, setLoja] = useState("");
  const [outraLoja, setOutraLoja] = useState("");
  const [dolar, setDolar] = useState("");

  useEffect(() => {
    if (estado?.ok) aoFechar();
  }, [estado, aoFechar]);

  const convertido = paraNumero(dolar) * cotacao;

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
          <input
            id="valor_pago"
            name="valor_pago"
            inputMode="decimal"
            placeholder="78,00"
            defaultValue={convertido > 0 ? convertido.toFixed(2).replace(".", ",") : ""}
            key={convertido}
          />
        </div>
      </div>

      <div>
        <label htmlFor="conversor">Pagou em dólar? Converta aqui</label>
        <input
          id="conversor"
          inputMode="decimal"
          value={dolar}
          onChange={(e) => setDolar(e.target.value)}
          placeholder="US$ 15,00"
        />
        {paraNumero(dolar) > 0 && (
          <p className="mt-1 text-[11.5px] text-ink-soft">
            {usd(paraNumero(dolar))} = <b className="font-semibold text-ink">{brl(convertido)}</b>{" "}
            a {brl(cotacao)}. O valor já foi preenchido acima — ajuste se quiser.
          </p>
        )}
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

function FormEdicao({
  produto,
  subcategorias,
  cotacao,
  aoVoltar,
}: {
  produto: ProdutoStatus;
  subcategorias: string[];
  cotacao: number;
  aoVoltar: () => void;
}) {
  const [estado, action] = useFormState(atualizarProduto, null);

  useEffect(() => {
    if (estado?.ok) aoVoltar();
  }, [estado, aoVoltar]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="produto_id" value={produto.id} />
      <CamposProduto
        categoria={produto.categoria}
        produto={produto}
        subcategorias={subcategorias}
        cotacao={cotacao}
      />
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
          ` junto com ${
            compras.length === 1
              ? "a compra registrada"
              : `as ${compras.length} compras registradas`
          }`}
        . Isso não pode ser desfeito.
      </p>
      <button
        onClick={() =>
          iniciar(async () => {
            await apagarProduto(produto.id);
            aoFechar();
          })
        }
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
