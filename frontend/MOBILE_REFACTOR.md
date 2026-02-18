# Refatoração Mobile-First — Entregáveis

Refatoração para viewport ≤ 768px, priorizando usabilidade, legibilidade e áreas de toque ≥ 44px.

---

## 1. Componente Table (todas as telas que usam tabela)

**Problema:** Tabelas com várias colunas geravam overflow horizontal, texto comprimido e ações pequenas no mobile.

**Solução:** Layout em **cards** no mobile (Opção A — Card Layout). Em viewport ≤ 768px o componente `Table` passa a renderizar cada linha como um card empilhado: campos em pares label/valor e ações em área destacada com botões de altura mínima 44px.

**Ganho de UX:** Leitura por item, sem scroll horizontal; ações grandes e fáceis de tocar; mesma API (`columns`, `rows`, `actions`) para todas as páginas.

**Código:** `src/components/Table.jsx` — uso de `useMediaQuery(MOBILE_BREAKPOINT)` e subcomponentes `TableDesktop` e `TableCards`. Estilos em `src/styles.css` (`.table-cards`, `.table-card`, `.table-card-fields`, `.table-card-actions`).

---

## 2. Ebis

**Problema:** Cabeçalho (título + busca + botão) ficava apertado; tabela inutilizável no mobile.

**Solução:** Classe `page-header` + `page-header-actions`; no mobile o header empilha (flex-direction: column) e busca/ações ocupam largura total. Tabela substituída por cards via `Table` responsivo. Paginação com classe `pagination-actions`: botões com flex: 1 no mobile.

**Ganho de UX:** Busca e “Criar EBI” acessíveis com uma mão; lista de EBIs em cards; Anterior/Próxima com área de toque adequada.

---

## 3. Usuários

**Problema:** Mesmo padrão — header comprimido e tabela com overflow.

**Solução:** `page-header` / `page-header-actions`, `Table` em cards no mobile, `pagination-actions` para Anterior/Próxima.

**Ganho de UX:** Cadastrar e buscar em destaque; lista de usuários em cards; edição por card com botão “Editar” grande.

---

## 4. Crianças

**Problema:** Idem — tabela e header pouco utilizáveis no mobile.

**Solução:** Mesmo padrão (page-header, Table em cards, pagination-actions).

**Ganho de UX:** Lista de crianças em cards (Nome, Responsável, Contato); ação “Editar” com alvo de toque ≥ 44px.

---

## 5. Detalhe do EBI (EbiDetail)

**Problema:** Vários botões (Registrar presença, Encerrar, Reabrir) em linha; tabela de presenças com muitas colunas.

**Solução:** `page-header` + `page-header-actions flex-wrap` para os botões; `Table` responsivo mostra presenças em cards (Criança, Responsável, Entrada, Saída + “Registrar saída”).

**Ganho de UX:** Botões quebram linha e mantêm altura de toque; lista de presenças legível em cards; “Registrar saída” acessível.

---

## 6. Relatório do EBI (EbiReport)

**Problema:** Tabela HTML fixa (Criança, Responsável, Contato, Entrada, Saída) com overflow e leitura difícil no mobile.

**Solução:** Uso de `useMediaQuery(MOBILE_BREAKPOINT)`; em mobile é renderizada uma lista de cards (mesma estrutura `.table-cards` / `.table-card`); em desktop mantida a tabela. Header com `page-header` e `page-header-actions` para “Imprimir relatório”.

**Ganho de UX:** Relatório utilizável no celular sem scroll horizontal; impressão acessível por botão grande.

---

## 7. Relatório Geral (GeneralReport)

**Problema:** Grid de cards e gráficos poderia ficar apertado ou em colunas estreitas no mobile.

**Solução:** Em `@media (max-width: 768px)`: `.report-charts.grid-2` em uma coluna; `.report-cards` em 2 colunas com gap menor; tipografia dos valores/labels reduzida para caber melhor.

**Ganho de UX:** KPIs e gráficos empilhados, sem espremer números; leitura clara em telas pequenas.

---

## 8. Estilos globais e padrões

**Breakpoint:** `--mobile-breakpoint: 768px`, `--touch-target: 44px` em `:root`.

**Header de página:** `.page-header` (empilha no mobile) e `.page-header-actions` (largura total e botões com min-height 44px).

**Botões:** Em mobile, `.button` e `a.button` com `min-height: var(--touch-target)`, `display: inline-flex`, `padding: 12px 18px`.

**Conteúdo:** `.app-content` com `padding: 16px` no mobile (28px no desktop).

**Paginação:** `.pagination-actions` com botões `flex: 1` no mobile para Anterior/Próxima.

**Cards de tabela:** `.table-card-actions .button` com `min-height`/`min-width` 44px e `flex: 1` para ações em linha.

---

## Resumo técnico

| Item | Estratégia |
|------|------------|
| Tabelas | Card layout no mobile (Table.jsx + useMediaQuery) |
| Headers | page-header + page-header-actions (empilha no mobile) |
| Botões | min-height 44px no mobile |
| Paginação | pagination-actions com botões flex: 1 |
| EbiReport tabela | Render condicional: cards no mobile, table no desktop |
| Relatório Geral | Grid 1 col (charts) e 2 col (cards) no mobile |

Nenhuma tela mantém tabela inutilizável no mobile; todas usam cards ou layout adaptado com áreas de toque adequadas.
