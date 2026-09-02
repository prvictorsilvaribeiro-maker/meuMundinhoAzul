import { BarraOrcadoGasto, ColunasPorMes } from "@/components/Graficos";
import { brl, dataCurta } from "@/lib/format";
import { buscarCompras, buscarProdutos, resumir } from "@/lib/queries";

export const dynamic = "force-dynamic";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default async function OrcamentoPage() {
  const [produtos, compras] = await Promise.all([buscarProdutos(), buscarCompras()]);

  const geral = resumir(produtos);
  const enxoval = resumir(produtos.filter((p) => p.categoria === "ENXOVAL"));
  const quarto = resumir(produtos.filter((p) => p.categoria === "QUARTO"));

  // Gasto por mês, últimos 6 meses com movimento
  const porMes = new Map<string, number>();
  for (const c of compras) {
    const [ano, mes] = c.data.split("-");
    const chave = `${ano}-${mes}`;
    porMes.set(chave, (porMes.get(chave) ?? 0) + Number(c.valor_pago));
  }
  const meses = [...porMes.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([chave, valor]) => ({ rotulo: MESES[Number(chave.split("-")[1]) - 1], valor }));

  const diferenca = geral.orcado === 0 ? 0 : geral.gasto - somaOrcadoDoComprado(produtos);

  return (
    <>
      <header className="mb-4">
        <p className="text-xs text-ink-soft">
          {brl(geral.gasto)} gastos de {brl(geral.orcado)} orçados
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Orçamento</h1>
      </header>

      <section className="mb-3 flex gap-2.5">
        <div className="card flex-1">
          <b className="block font-display text-xl font-semibold">
            {brl(Math.max(0, geral.orcado - geral.gasto))}
          </b>
          <small className="text-[11.5px] text-ink-soft">saldo do orçamento</small>
        </div>
        <div className="card flex-1">
          <b
            className={`block font-display text-xl font-semibold ${
              diferenca <= 0 ? "text-mint" : "text-alerta"
            }`}
          >
            {diferenca <= 0 ? "−" : "+"}
            {brl(Math.abs(diferenca))}
          </b>
          <small className="text-[11.5px] text-ink-soft">
            {diferenca <= 0 ? "economia vs. orçado" : "acima do orçado"}
          </small>
        </div>
      </section>

      <section className="card mb-3">
        <h2 className="text-sm font-semibold">Orçado x gasto</h2>
        <p className="mb-3.5 text-[11.5px] text-ink-soft">
          A barra clara é o que planejamos, a escura é o que saiu do bolso.
        </p>
        <div className="flex flex-col gap-4">
          <BarraOrcadoGasto rotulo="Enxoval" orcado={enxoval.orcado} gasto={enxoval.gasto} />
          <BarraOrcadoGasto rotulo="Quarto" orcado={quarto.orcado} gasto={quarto.gasto} />
          <BarraOrcadoGasto rotulo="Total" orcado={geral.orcado} gasto={geral.gasto} />
        </div>
      </section>

      <section className="card mb-3">
        <h2 className="text-sm font-semibold">Gasto por mês</h2>
        <p className="text-[11.5px] text-ink-soft">Todas as compras registradas.</p>
        <ColunasPorMes meses={meses} />
      </section>

      <section className="card">
        <h2 className="text-sm font-semibold">Últimas compras</h2>
        {compras.length === 0 ? (
          <p className="mt-1 text-[11.5px] text-ink-soft">
            Nenhuma compra ainda. Registre a primeira na aba Enxoval.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-linha">
            {compras.slice(0, 8).map((c, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5 text-[13px]">
                <span className="truncate">{c.produto?.nome ?? "Item removido"}</span>
                <span className="ml-auto shrink-0 text-[11px] text-ink-soft">
                  {dataCurta(c.data)}
                </span>
                <span className="w-20 shrink-0 text-right font-semibold tabular-nums">
                  {brl(Number(c.valor_pago))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

// Compara o gasto com o orçado apenas dos itens já tocados, proporcional ao
// que foi comprado — senão o "economizou" ficaria inflado por itens pendentes.
function somaOrcadoDoComprado(produtos: Awaited<ReturnType<typeof buscarProdutos>>) {
  return produtos.reduce((soma, p) => {
    if (p.qtd_comprada === 0 || p.qtd_desejada === 0) return soma;
    const proporcao = Math.min(1, p.qtd_comprada / p.qtd_desejada);
    return soma + p.valor_orcado * proporcao;
  }, 0);
}
