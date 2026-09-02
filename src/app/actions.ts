"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type Estado = { ok: boolean; erro?: string } | null;

const numero = (v: FormDataEntryValue | null) => {
  const limpo = String(v ?? "0").replace(/\./g, "").replace(",", ".");
  const n = Number(limpo);
  return Number.isFinite(n) ? n : 0;
};

function revalidarTudo() {
  revalidatePath("/");
  revalidatePath("/enxoval");
  revalidatePath("/quarto");
  revalidatePath("/orcamento");
}

export async function criarProduto(_estado: Estado, formData: FormData): Promise<Estado> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return { ok: false, erro: "Dê um nome ao item." };

  const qtd = Math.trunc(numero(formData.get("qtd_desejada")));
  if (qtd < 1) return { ok: false, erro: "A quantidade precisa ser pelo menos 1." };

  const { error } = await supabase.from("produto").insert({
    nome,
    categoria: formData.get("categoria"),
    subcategoria: String(formData.get("subcategoria") ?? "").trim() || null,
    qtd_desejada: qtd,
    valor_orcado: numero(formData.get("valor_orcado")),
    criado_por: user?.id,
  });

  if (error) return { ok: false, erro: "Não deu pra salvar o item. Tente de novo." };

  revalidarTudo();
  return { ok: true };
}

export async function atualizarProduto(_estado: Estado, formData: FormData): Promise<Estado> {
  const supabase = createClient();

  const id = String(formData.get("produto_id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  if (!id || !nome) return { ok: false, erro: "Dê um nome ao item." };

  const qtd = Math.trunc(numero(formData.get("qtd_desejada")));
  if (qtd < 1) return { ok: false, erro: "A quantidade precisa ser pelo menos 1." };

  const { error } = await supabase
    .from("produto")
    .update({
      nome,
      subcategoria: String(formData.get("subcategoria") ?? "").trim() || null,
      qtd_desejada: qtd,
      valor_orcado: numero(formData.get("valor_orcado")),
    })
    .eq("id", id);

  if (error) return { ok: false, erro: "Não deu pra salvar as alterações." };

  revalidarTudo();
  return { ok: true };
}

export async function registrarCompra(_estado: Estado, formData: FormData): Promise<Estado> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const produtoId = String(formData.get("produto_id") ?? "");
  const qtd = Math.trunc(numero(formData.get("qtd")));
  if (!produtoId || qtd < 1) return { ok: false, erro: "Informe quantas unidades você comprou." };

  const { error } = await supabase.from("compra").insert({
    produto_id: produtoId,
    qtd,
    valor_pago: numero(formData.get("valor_pago")),
    loja: String(formData.get("loja") ?? "").trim() || null,
    data: String(formData.get("data") || new Date().toISOString().slice(0, 10)),
    criado_por: user?.id,
  });

  if (error) return { ok: false, erro: "Não deu pra registrar a compra. Tente de novo." };

  revalidarTudo();
  return { ok: true };
}

// Apaga o item e, junto, todas as compras dele (o on delete cascade cuida disso).
export async function apagarProduto(id: string) {
  const supabase = createClient();
  await supabase.from("produto").delete().eq("id", id);
  revalidarTudo();
}

// Uma devolução, ou um registro digitado errado.
export async function apagarCompra(id: string) {
  const supabase = createClient();
  await supabase.from("compra").delete().eq("id", id);
  revalidarTudo();
}
