import Link from "next/link";
import { sair } from "@/app/login/actions";
import { Anel, DonutEnxoval } from "@/components/Graficos";
import { brl } from "@/lib/format";
import { calcularGestacao, dppFormatada } from "@/lib/gestacao";
import { buscarBebe, buscarProdutos, resumir } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [bebe, todos] = await Promise.all([buscarBebe(), buscarProdutos()]);

  const enxoval = resumir(todos.filter((p) => p.categoria === "ENXOVAL"));
  const quarto = resumir(todos.filter((p) => p.categoria === "QUARTO"));
  const maternidade = resumir(todos.filter((p) => p.categoria === "MATERNIDADE"));
  const geral = resumir(todos);
  const g = bebe ? calcularGestacao(bebe.dum) : null;

  return (
    <>
      <header className="mb-4 flex items-start justify-between">
        <div>
          {g && <p className="text-xs text-ink-soft">Faltam {g.diasRestantes} dias</p>}
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Oi, mamãe e papai
          </h1>
        </div>
        <form action={sair}>
          <button className="mt-1 text-xs text-ink-soft underline underline-offset-2">
            Sair
          </button>
        </form>
      </header>

      {/* Daniel */}
      <section className="mb-3 flex items-center gap-4 rounded-3xl bg-gradient-to-br from-sky-deep to-[#1B4A85] p-5 text-white">
        {g ? (
          <>
            <Anel progresso={g.progresso}>
              <b className="font-display text-[26px] font-semibold">{g.semanas}</b>
              <span className="mt-[3px] text-[10px] text-[#BBD6F2]">
                semanas · {g.dias}d
              </span>
            </Anel>
            <div>
              <p className="flex items-center gap-2.5 font-display text-[28px] font-semibold leading-none">
                <BebeIcone />
                {bebe!.nome}
              </p>
              <p className="mt-1 text-[12.5px] leading-relaxed
