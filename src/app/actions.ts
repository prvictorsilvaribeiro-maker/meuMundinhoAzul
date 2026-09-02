"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

export async function criarProduto(_estado: string | null, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const nome = String(formData.get("nome") ?? "").trim();
  if (!nome) return "Dê um nome ao item.";

  const qtd = Math.trunc(numero(formData.get("qtd_desejada")));
  if (qtd < 1) return "A quantidade precisa ser pelo menos 1.";

  const { error } = await supabase.from("produto").insert({
    nome,
    categoria: formData.get("categoria"),
    subcategoria: String(formData.get("subcategoria") ?? "").trim() || null,
    qtd_desejada: qtd,
    valor_orcado: numero(formData.get("valor_orcado")),
    criado_por: user?.id,
  });

  if (error) return "Não deu pra salvar o item. Tente de novo.";

  revalidarTudo();
  return null;
}

export async function registrarCompra(_estado: string | null, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const produtoId = String(formData.get("produto_id") ?? "");
  const qtd = Math.trunc(numero(formData.get("qtd")));
  if (!produtoId || qtd < 1) return "Informe quantas unidades você comprou.";

  const { error } = await supabase.from("compra").insert({
    produto_id: produtoId,
    qtd,
    valor_pago: numero(formData.get("valor_pago")),
    loja: String(formData.get("loja") ?? "").trim() || null,
    data: String(formData.get("data") || new Date().toISOString().slice(0, 10)),
    criado_por: user?.id,
  });

  if (error) return "Não deu pra registrar a compra. Tente de novo.";

  revalidarTudo();
  return null;
}

export async function apagarProduto(id: string) {
  const supabase = createClient();
  await supabase.from("produto").delete().eq("id", id);
  revalidarTudo();
}
