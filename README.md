# Meu Mundinho Azul

App do enxoval e do quartinho do Daniel. Next.js 14 (App Router) + Supabase + Vercel,
mesmo stack do CACHARATS e do bolão.

## Subir em 10 minutos

1. **Supabase** → crie o projeto e rode `supabase/schema.sql` inteiro no SQL Editor.
2. **Authentication → Users** → crie os dois logins (você e sua esposa).
   Desligue "Enable signup" nas configurações: só vocês entram.
3. Volte ao SQL Editor e cadastre os dois na tabela `membro` (o insert comentado
   no fim do schema). Quem não estiver em `membro` não enxerga nada — é o que a RLS faz.
4. Insira a DUM do Daniel na tabela `bebe`. A idade gestacional passa a andar sozinha.
5. `cp .env.local.example .env.local` e preencha URL + anon key (Settings → API).
6. `npm install && npm run dev`.
7. **Vercel** → importe o repo, cole as duas variáveis de ambiente, deploy.

## Como o app pensa

- `produto` guarda **quanto você quer** e **quanto orçou**. Nunca é alterado numa compra.
- `compra` guarda **quanto você levou** e **quanto pagou de verdade**, uma linha por ida à loja.
- A view `produto_status` deriva `qtd_comprada`, `valor_gasto` e o status
  (`PENDENTE` / `PARCIAL` / `COMPLETO`). Lista, filtros e gráficos leem só dela.
  Comprar 3 de 5 bodys é só um insert em `compra` — o resto se ajusta.
- `categoria` é enum (`ENXOVAL` | `QUARTO`): as duas abas são a mesma tela com filtro
  diferente, e o orçamento soma as duas.
- Valores sempre em BRL. Comprou em dólar, converte na hora de registrar.

## Ideias pra depois

- Foto do item (Supabase Storage) e link do produto.
- Marcar quem registrou a compra — o campo `criado_por` já está gravado.
- Realtime do Supabase pra lista atualizar no celular dos dois ao mesmo tempo na loja.
