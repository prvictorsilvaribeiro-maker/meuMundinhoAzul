import { ListaProdutos } from "@/components/ListaProdutos";
import { brl } from "@/lib/format";
import { buscarComprasPorProduto, buscarLojas, buscarProdutos, resumir } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function LauraPage() {
  const [produtos, lojas, compras] = await Promise.all([
    buscarProdutos("MATERNIDADE"),
    buscarLojas(),
    buscarComprasPorProduto(),
  ]);
  const r = resumir(produtos);

  return (
    <>
      <header className="mb-4">
        <p className="text-xs text-ink-soft">
          {brl(r.gasto)} de {brl(r.orcado)} orçados
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Laura</h1>
      </header>
      <ListaProdutos produtos={produtos} categoria="MATERNIDADE" lojas={lojas} compras={compras} />
    </>
  );
}
