import { AvisoCotacao } from "@/components/AvisoCotacao";
import { ListaProdutos } from "@/components/ListaProdutos";
import { brl, usd } from "@/lib/format";
import {
  buscarComprasPorProduto,
  buscarCotacao,
  buscarLojas,
  buscarProdutos,
  resumir,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function QuartoPage() {
  const [produtos, lojas, compras, cotacao] = await Promise.all([
    buscarProdutos("QUARTO"),
    buscarLojas(),
    buscarComprasPorProduto(),
    buscarCotacao(),
  ]);
  const r = resumir(produtos);

  return (
    <>
      <header className="mb-4">
        <p className="text-xs text-ink-soft">
          {brl(r.gasto)} de {brl(r.orcado)} orçados
          {r.orcadoUsd > 0 && ` · ${usd(r.orcadoUsd)} nos EUA`}
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Quarto</h1>
      </header>

      {r.orcadoUsd > 0 && <AvisoCotacao cotacao={cotacao} />}

      <ListaProdutos
        produtos={produtos}
        categoria="QUARTO"
        lojas={lojas}
        compras={compras}
        cotacao={cotacao}
      />
    </>
  );
}
