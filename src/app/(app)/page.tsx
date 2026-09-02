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
              <p className="mt-1 text-[12.5px] leading-relaxed text-[#C6DDF5]">
                {g.trimestre}º trimestre · do tamanho de {g.tamanho}
                <br />
                Previsão: {dppFormatada(g.dpp)}
              </p>
            </div>
          </>
        ) : (
          <p className="text-[13px] leading-relaxed text-[#C6DDF5]">
            Cadastre a DUM na tabela <code>bebe</code> para a idade gestacional começar a contar
            sozinha, dia após dia.
          </p>
        )}
      </section>

      {/* Progresso */}
      <section className="card mb-3">
        <h2 className="text-sm font-semibold">Enxoval do {bebe?.nome ?? "bebê"}</h2>
        <p className="text-[11.5px] text-ink-soft">
          {geral.pecasCompradas} de {geral.pecasDesejadas} peças já compradas
        </p>

        <div className="mt-3 flex items-center gap-4">
          <DonutEnxoval
            completo={geral.completo}
            parcial={geral.parcial}
            pendente={geral.pendente}
          />
          <div className="flex flex-1 flex-col gap-2.5">
            <Legenda cor="#3FA88E" rotulo="Comprado" valor={geral.completo} />
            <Legenda cor="#E8A33D" rotulo="Parcial" valor={geral.parcial} />
            <Legenda cor="#DFE7F1" rotulo="Não comprado" valor={geral.pendente} />
          </div>
        </div>

        <div className="mt-3.5 flex flex-col gap-3">
          <Mini rotulo="Enxoval" percentual={enxoval.percentualPecas} cor="#3FA88E" href="/enxoval" />
          <Mini rotulo="Quarto" percentual={quarto.percentualPecas} cor="#7FB3E3" href="/quarto" />
        </div>
      </section>

      <section className="flex gap-2.5">
        <div className="card flex-1">
          <b className="block font-display text-xl font-semibold">{brl(geral.gasto)}</b>
          <small className="text-[11.5px] text-ink-soft">gasto até agora</small>
        </div>
        <div className="card flex-1">
          <b className="block font-display text-xl font-semibold">
            {brl(Math.max(0, geral.orcado - geral.gasto))}
          </b>
          <small className="text-[11.5px] text-ink-soft">ainda orçado</small>
        </div>
      </section>
    </>
  );
}

function BebeIcone() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden className="h-[34px] w-[34px] shrink-0">
      <circle cx="9.5" cy="23" r="2.4" fill="#9FD3F5" />
      <circle cx="30.5" cy="23" r="2.4" fill="#9FD3F5" />
      <circle cx="20" cy="22.5" r="10.5" fill="#DCEEFB" />
      <path
        d="M20 11.8c-.4-3.6 1.2-5.6 3.4-5.2 2 .4 2.6 2.6 1 4.2"
        stroke="#9FD3F5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 21.6q1.6 1.8 3.2 0M21.8 21.6q1.6 1.8 3.2 0"
        stroke="#2F6FB5"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M17.2 26q2.8 2.4 5.6 0" stroke="#2F6FB5" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="14.6" cy="25.2" r="1.5" fill="#F3B8C0" />
      <circle cx="25.4" cy="25.2" r="1.5" fill="#F3B8C0" />
    </svg>
  );
}

function Legenda({ cor, rotulo, valor }: { cor: string; rotulo: string; valor: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <i className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: cor }} />
      {rotulo}
      <span className="ml-auto tabular-nums text-ink-soft">{valor}</span>
    </div>
  );
}

function Mini({
  rotulo,
  percentual,
  cor,
  href,
}: {
  rotulo: string;
  percentual: number;
  cor: string;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <div className="mb-1.5 flex justify-between text-xs">
        <span>{rotulo}</span>
        <em className="not-italic tabular-nums text-ink-soft">{percentual}%</em>
      </div>
      <div className="track">
        <div className="h-full rounded-full" style={{ width: `${percentual}%`, background: cor }} />
      </div>
    </Link>
  );
}
