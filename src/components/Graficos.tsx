import { brl, pct } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Anel simples — usado na idade gestacional                           */
/* ------------------------------------------------------------------ */
export function Anel({
  progresso,
  children,
  tamanho = 96,
  espessura = 7,
  trilho = "rgba(255,255,255,.22)",
  cor = "#9FD3F5",
}: {
  progresso: number;
  children: React.ReactNode;
  tamanho?: number;
  espessura?: number;
  trilho?: string;
  cor?: string;
}) {
  const r = tamanho / 2 - espessura;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative shrink-0" style={{ width: tamanho, height: tamanho }}>
      <svg width={tamanho} height={tamanho} className="-rotate-90">
        <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" stroke={trilho} strokeWidth={espessura} />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={r}
          fill="none"
          stroke={cor}
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(1, progresso)))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Donut de três fatias — completo / parcial / pendente                */
/* ------------------------------------------------------------------ */
export function DonutEnxoval({
  completo,
  parcial,
  pendente,
}: {
  completo: number;
  parcial: number;
  pendente: number;
}) {
  const total = completo + parcial + pendente || 1;
  const r = 48;
  const c = 2 * Math.PI * r;

  const fatias = [
    { valor: completo, cor: "#3FA88E" },
    { valor: parcial, cor: "#E8A33D" },
    { valor: pendente, cor: "#DFE7F1" },
  ];

  let acumulado = 0;
  const percentual = Math.round(((completo + parcial * 0.5) / total) * 100);

  return (
    <div className="relative h-[118px] w-[118px] shrink-0">
      <svg width="118" height="118" className="-rotate-90">
        {fatias.map((fatia, i) => {
          const inicio = acumulado;
          acumulado += fatia.valor / total;
          if (fatia.valor === 0) return null;
          return (
            <circle
              key={i}
              cx="59"
              cy="59"
              r={r}
              fill="none"
              stroke={fatia.cor}
              strokeWidth="14"
              strokeDasharray={`${(fatia.valor / total) * c} ${c}`}
              strokeDashoffset={-inicio * c}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <b className="font-display text-[27px] font-semibold leading-none">{percentual}%</b>
        <span className="mt-1 text-[10.5px] text-ink-soft">completo</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Barra orçado x gasto                                                */
/* ------------------------------------------------------------------ */
export function BarraOrcadoGasto({
  rotulo,
  orcado,
  gasto,
}: {
  rotulo: string;
  orcado: number;
  gasto: number;
}) {
  const estourou = gasto > orcado && orcado > 0;
  const maior = Math.max(orcado, gasto, 1);

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span>{rotulo}</span>
        <em className={`not-italic tabular-nums ${estourou ? "text-alerta" : "text-ink-soft"}`}>
          {brl(gasto)} / {brl(orcado)}
        </em>
      </div>
      <div className="space-y-1">
        <div className="track h-[11px] bg-[#EDF2F8]">
          <div className="h-full rounded-full bg-sky-wash" style={{ width: `${pct(orcado, maior)}%` }} />
        </div>
        <div className="track h-[11px] bg-[#EDF2F8]">
          <div
            className={`h-full rounded-full ${estourou ? "bg-alerta" : "bg-sky-deep"}`}
            style={{ width: `${pct(gasto, maior)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Colunas de gasto por mês                                            */
/* ------------------------------------------------------------------ */
export function ColunasPorMes({ meses }: { meses: { rotulo: string; valor: number }[] }) {
  if (meses.length === 0) {
    return <p className="mt-3 text-sm text-ink-soft">Assim que a primeira compra entrar, o histórico aparece aqui.</p>;
  }
  const maior = Math.max(...meses.map((m) => m.valor), 1);

  return (
    <div className="mt-4 flex h-[130px] items-end gap-3">
      {meses.map((m, i) => (
        <div key={m.rotulo} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-[10px] tabular-nums text-ink-soft">{brl(m.valor)}</span>
          <div
            className={`w-full rounded-t-md ${i === meses.length - 1 ? "bg-sky-deep" : "bg-[#BFD9EF]"}`}
            style={{ height: `${Math.max(4, (m.valor / maior) * 100)}%` }}
          />
          <small className="text-[10.5px] text-ink-soft">{m.rotulo}</small>
        </div>
      ))}
    </div>
  );
}
