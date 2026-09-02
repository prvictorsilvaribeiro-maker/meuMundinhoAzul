export type Categoria = "ENXOVAL" | "QUARTO";
export type StatusProduto = "PENDENTE" | "PARCIAL" | "COMPLETO";

export type ProdutoStatus = {
  id: string;
  nome: string;
  categoria: Categoria;
  subcategoria: string | null;
  qtd_desejada: number;
  valor_orcado: number;
  observacao: string | null;
  criado_em: string;
  qtd_comprada: number;
  valor_gasto: number;
  ultima_compra: string | null;
  status: StatusProduto;
};

export type Bebe = { id: string; nome: string; dum: string };
