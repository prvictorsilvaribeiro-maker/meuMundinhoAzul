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

export default async function LauraPage() {
  const [produtos, lojas, compras, cotacao] = await Promise.all([
    buscarProdutos("MATERNIDADE"),
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
        <h1 className="font-display text-2xl font-semibold tracking-tight">Laura</h1>
      </header>

      {r.orcadoUsd > 0 && <AvisoCotacao cotacao={cotacao} />}

      <ListaProdutos
        produtos={produtos}
        categoria="MATERNIDADE"
        lojas={lojas}
        compras={compras}
        cotacao={cotacao}
      />
    </>
  );
}
