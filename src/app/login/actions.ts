"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Não há login por usuário puro no Supabase: o provider é sempre e-mail + senha.
// Então o usuário digitado vira um endereço interno. Nenhum e-mail é enviado.
const DOMINIO = "mundinho.app";

const paraEmail = (entrada: string) => {
  const limpo = entrada.trim().toLowerCase();
  return limpo.includes("@") ? limpo : `${limpo}@${DOMINIO}`;
};

export async function entrar(_estado: string | null, formData: FormData) {
  const supabase = createClient();

  const usuario = String(formData.get("usuario") ?? "").trim();
  if (!usuario) return "Digite seu usuário.";

  const { error } = await supabase.auth.signInWithPassword({
    email: paraEmail(usuario),
    password: String(formData.get("senha") ?? ""),
  });

  if (error) return "Usuário ou senha não conferem. Tente de novo.";

  revalidatePath("/", "layout");
  redirect("/");
}

export async function sair() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
