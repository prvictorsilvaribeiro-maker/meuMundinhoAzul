import type { Categoria } from "@/lib/types";

export const CATEGORIAS: Record<Categoria, { titulo: string; dono: string }> = {
  ENXOVAL: { titulo: "Enxoval", dono: "do Daniel" },
  QUARTO: { titulo: "Quarto", dono: "do Daniel" },
  MATERNIDADE: { titulo: "Laura", dono: "da Laura" },
};

export const SUBCATEGORIAS: Record<Categoria, string[]> = {
  ENXOVAL: [
    "Roupinhas",
    "Sono e pijamas",
    "Banho",
    "Higiene e cuidados",
    "Alimentação",
    "Fraldas",
    "Passeio e transporte",
    "Acessórios",
  ],
  QUARTO: [
    "Móveis",
    "Enxoval de cama",
    "Decoração",
    "Iluminação",
    "Organização",
    "Eletrônicos",
    "Segurança",
  ],
  MATERNIDADE: [
    "Amamentação",
    "Pós-parto",
    "Cuidados com a pele",
    "Roupas e lingerie",
    "Bolsa da maternidade",
    "Bem-estar",
  ],
};

// Junta as fixas com as que já existem na lista, para nada sumir do select.
export function opcoesSubcategoria(categoria: Categoria, usadas: (string | null)[]) {
  const fixas = SUBCATEGORIAS[categoria];
  const extras = [...new Set(usadas.filter((s): s is string => !!s))]
    .filter((s) => !fixas.some((f) => f.toLowerCase() === s.toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "pt-BR"));
  return [...fixas, ...extras];
}

export const FAIXAS = ["RN", "0-3M", "3-6M", "6-9M", "9-12M"] as const;

// Posição para ordenar a lista. Sem faixa vai para o fim.
export const ordemFaixa = (f: string | null) => {
  const i = FAIXAS.indexOf(f as (typeof FAIXAS)[number]);
  return i === -1 ? FAIXAS.length : i;
};
