import { ListaProdutos } from "@/components/ListaProdutos";
import { brl } from "@/lib/format";
import { buscarProdutos, resumir } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function QuartoPage() {
  const produtos = await buscarProdutos("QUARTO");
  const r = resumir(produtos);

  return (
    <>
      <header className="mb-4">
        <p className="text-xs text-ink-soft">
          {brl(r.gasto)} de {brl(r.orcado)} orçados
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Quarto</h1>
      </header>
      <ListaProdutos produtos={produtos} categoria="QUARTO" />
    </>
  );
}
