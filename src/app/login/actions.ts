"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function entrar(_estado: string | null, formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("senha") ?? ""),
  });

  if (error) return "E-mail ou senha não conferem. Tente de novo.";

  revalidatePath("/", "layout");
  redirect("/");
}

export async function sair() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
