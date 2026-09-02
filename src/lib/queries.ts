import { createClient } from "@/lib/supabase/server";
import type { Bebe, Categoria, ProdutoStatus } from "@/lib/types";

export async function buscarProdutos(categoria?: Categoria): Promise<ProdutoStatus[]> {
  const supabase = createClient();
  let query = supabase.from("produto_status").select("*").order("nome");
  if (categoria) query = query.eq("categoria", categoria);

  const { data } = await query;
  return (data ?? []).map((p) => ({
    ...p,
    valor_orcado: Number(p.valor_orcado),
    valor_gasto: Number(p.valor_gasto),
  })) as ProdutoStatus[];
}

export async function buscarBebe(): Promise<Bebe | null> {
  const supabase = createClient();
  const { data } = await supabase.from("bebe").select("*").limit(1).maybeSingle();
  return data as Bebe | null;
}

export async function buscarCompras() {
  const supabase = createClient();
  const { data } = await supabase
    .from("compra")
    .select("valor_pago, data, produto:produto_id (nome, categoria)")
    .order("data", { ascending: false });
  return (data ?? []) as unknown as {
    valor_pago: number;
    data: string;
    produto: { nome: string; categoria: Categoria } | null;
  }[];
}

export function resumir(produtos: ProdutoStatus[]) {
  const completo = produtos.filter((p) => p.status === "COMPLETO").length;
  const parcial = produtos.filter((p) => p.status === "PARCIAL").length;
  const pendente = produtos.filter((p) => p.status === "PENDENTE").length;

  const pecasDesejadas = produtos.reduce((s, p) => s + p.qtd_desejada, 0);
  const pecasCompradas = produtos.reduce(
    (s, p) => s + Math.min(p.qtd_comprada, p.qtd_desejada),
    0,
  );

  return {
    completo,
    parcial,
    pendente,
    total: produtos.length,
    pecasDesejadas,
    pecasCompradas,
    percentualPecas: pecasDesejadas === 0 ? 0 : Math.round((pecasCompradas / pecasDesejadas) * 100),
    orcado: produtos.reduce((s, p) => s + p.valor_orcado, 0),
    gasto: produtos.reduce((s, p) => s + p.valor_gasto, 0),
  };
}

export const LOJAS_PADRAO = [
  "MacroBaby",
  "Carter's",
  "Amazon",
  "Target",
  "Walmart",
  "Ross",
  "Marshalls",
  "TJ Maxx",
  "Burlington",
  "Old Navy",
  "The Children's Place",
  "Premium Outlets",
];

// Junta as lojas fixas com as que vocês já digitaram na mão.
export async function buscarLojas(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase.from("compra").select("loja").not("loja", "is", null);

  const usadas = [...new Set((data ?? []).map((c) => (c.loja as string).trim()))];
  const extras = usadas
    .filter((l) => l && !LOJAS_PADRAO.some((padrao) => padrao.toLowerCase() === l.toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));

  return [...LOJAS_PADRAO, ...extras];
}
export type CompraItem = {
  id: string;
  qtd: number;
  valor_pago: number;
  loja: string | null;
  data: string;
};

// Histórico agrupado por produto, pra tela de detalhe.
export async function buscarComprasPorProduto(): Promise<Record<string, CompraItem[]>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("compra")
    .select("id, produto_id, qtd, valor_pago, loja, data")
    .order("data", { ascending: false });

  const mapa: Record<string, CompraItem[]> = {};
  for (const c of data ?? []) {
    const item: CompraItem = {
      id: c.id as string,
      qtd: c.qtd as number,
      valor_pago: Number(c.valor_pago),
      loja: c.loja as string | null,
      data: c.data as string,
    };
    (mapa[c.produto_id as string] ??= []).push(item);
  }
  return mapa;
}
