const DIA = 86_400_000;

// Tamanhinho por semana — aparece no card do Daniel na Home.
const TAMANHOS: Record<number, string> = {
  8: "uma framboesa", 9: "uma azeitona", 10: "uma ameixa", 11: "um figo",
  12: "um limão", 13: "uma vagem", 14: "um pêssego", 15: "uma maçã",
  16: "um abacate", 17: "uma pera", 18: "um pimentão", 19: "um tomate",
  20: "uma banana", 21: "uma cenoura", 22: "um mamão papaia", 23: "uma manga",
  24: "uma espiga de milho", 25: "uma couve-flor", 26: "uma alface",
  27: "uma berinjela", 28: "uma beringela grande", 29: "um abacaxi",
  30: "um repolho", 31: "um coco", 32: "um maço de couve", 33: "um abacaxi grande",
  34: "um melão cantalupo", 35: "um melão", 36: "uma alface romana",
  37: "uma acelga", 38: "um alho-poró", 39: "uma melancia pequena",
  40: "uma abóbora",
};

export type Gestacao = {
  semanas: number;
  dias: number;
  totalDias: number;
  trimestre: 1 | 2 | 3;
  dpp: Date;
  diasRestantes: number;
  progresso: number; // 0–1 sobre 40 semanas
  tamanho: string;
};

export function calcularGestacao(dum: string, hoje = new Date()): Gestacao {
  const inicio = new Date(`${dum}T00:00:00`);
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const totalDias = Math.max(0, Math.floor((base.getTime() - inicio.getTime()) / DIA));

  const semanas = Math.floor(totalDias / 7);
  const dias = totalDias % 7;

  const dpp = new Date(inicio.getTime() + 280 * DIA);
  const diasRestantes = Math.max(0, Math.ceil((dpp.getTime() - base.getTime()) / DIA));

  const trimestre = semanas < 14 ? 1 : semanas < 28 ? 2 : 3;

  return {
    semanas,
    dias,
    totalDias,
    trimestre,
    dpp,
    diasRestantes,
    progresso: Math.min(1, totalDias / 280),
    tamanho: TAMANHOS[semanas] ?? "um docinho",
  };
}

export const dppFormatada = (dpp: Date) =>
  dpp.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
