# Notas do app LA 26 (sessão App)

## Checklist de progresso
- [x] T4. Camarillo trocado pelo Citadel Outlets (dia 2), ilustração `citadel`
- [x] T3. Fim das "piscadas" (redesenho só com mudança de dado)
- [x] T7. Aba Contas (controle de gastos)
- [x] T5. Reordenar brinquedos (u1 e u2)
- [x] T2-UI. Curiosidades na aba Cenas
- [x] T6-UI. Comparador de restaurantes
- [ ] Ciclo de atualização de conteúdo (pull, build e deploy a cada ~60 min)

## Decisões
- T4: Citadel Outlets, 100 Citadel Dr, Commerce, CA 90040. Horário confirmado por busca na web (13/11/2026, 01h de LA): todos os dias das 10h às 21h. Sexta 13/11 não tem horário especial publicado.
- T4: Joe's Pizza ficou das 19:45 às 21:00. Almoço no Citadel aponta para o próprio outlet no Maps.
- T4: a ilustração `sign` continua em `art.js`, sem uso no momento.
- T3: em vez de comparar um hash do estado, o app compara o HTML gerado (mesmo efeito, mais seguro: qualquer mudança que não altera a tela não redesenha). Quando muda, uma reconciliação de DOM (`morph` em `main.js`) só altera texto e atributos dos nós existentes. Nós com `id` ou `data-key` são casados por chave, então a linha "agora" muda de lugar sem recriar itens.
- T3: o tique de 30 s passa pelo mesmo caminho e, na prática, só altera o banner Agora, a linha vermelha, o playhead e a classe do item atual. A contagem regressiva continua no tique de 1 s, em nós próprios (`data-own`).
- T3: animações de entrada só com `#main.enter`, aplicada na navegação (aba, dia ou lista) e retirada após 2,6 s. O anel verde de "feito" só toca no toque do usuário (classe transitória `just`).
- T3: `controllerchange` só recarrega quando o usuário tocou em "Atualizar" nesta aba. A primeira instalação do service worker (clients.claim) recarregava a página sozinha. Atualização aceita em outra aba mostra aviso com "Recarregar".
- T3: `window.scrollTo` saiu dos redesenhos (no iOS, interrompia a rolagem por inércia).
- Teste T3 (13/11, 01h de LA): 3 min com 12 gravações de outro contexto no Firestore (flags, listitems, checks e um check de item visível). Zero nós criados ou removidos em `#main`. Relógio simulado de 06:44 a 06:50: o Café vira "Agora" no mesmo nó, item aberto e rolagem preservados. Documentos de teste apagados e conferidos.
- T7: aba Contas em `#contas`. Gastos em `listitems/exp-<id>` com `{type, desc, total, payer, shares: {pedro, lorena}, date, cat, at}`. As Listas já filtravam por `v.list` e agora também descartam ids `exp-`.
- T7: acerto é gravado como `type: "settle"`, com `payer` = quem transferiu e `shares` = {quem transferiu: 0, quem recebeu: valor}. Assim o mesmo cálculo (pago menos parte) zera o saldo.
- T7: na divisão 50/50 com centavo ímpar, o centavo extra fica com quem pagou.
- T7: valores aceitam "12,50", "12.50" e "1.234,50". Cálculo interno em centavos inteiros.
- T7: excluir pede um segundo toque no próprio botão ("Toque de novo para excluir").
- T7: categorias gravadas em minúsculas sem acento (comida, compras, transporte, ingressos, hospedagem, outros). Categoria vazia é permitida.
- Teste T7: feito com o Firebase bloqueado no navegador de teste. Nenhum gasto chegou ao Firestore.
- T5: `LISTS` u1 e u2 ganharam `reorder: true` e `areas` (paralelo a `items`). Dia 5 filtra por `area` ("Lower Lot" e "Upper Lot"). Dia 6 mostra a u2 inteira na ordem escolhida.
- T5: Hollywood Drift no Upper Lot (anúncio oficial da Universal, maio de 2024). "Starway e almoço às 11h30" ficou como Upper Lot (o Krusty Burger fica no Upper Lot) e por isso passou a aparecer na listinha do Upper Lot do Dia 5. Antes ficava de fora das duas.
- T5: "Mario Kart (fila < 45 min)" da u2 é Lower Lot. Os demais itens da u2 são Upper Lot.
- T5: a ordem salva só guarda `ids` quando difere da original. "Voltar à ordem original" apaga `flags/order-<lista>`. Ids desconhecidos são ignorados e itens faltantes vão para o fim.
- T5: durante o arraste, redesenhos vindos do Firestore ficam suspensos e rodam ao soltar.
- T2-UI: `SCENES` e os campos `scene` dos itens saíram de `data.js`. A aba Cenas e os chips dos itens leem `CURIOSITIES`. Lugares ordenados pela posição do primeiro item do roteiro a que se referem. Atalhos no topo levam a cada dia e mostram gravadas/total.
- T2-UI: alternativas de restaurante deixam de ter cena própria. Uma curiosidade aparece no item quando `itemIds` inclui o id do item (vale para qualquer opção escolhida).
- T6-UI: escolha gravada como `swaps/{itemId} = {choice: idDaOpção}`, no mesmo formato que já existia. Escolher a opção recomendada apaga o documento (volta ao padrão). Uma troca antiga para uma alternativa de `alts` que não está em `MEALS` continua valendo até ser desfeita.
- T6-UI: com entrada em `MEALS`, o item passa a usar nome, porquê (`why`), Maps e rota da opção. Os links extras do item original (ex.: Bradbury no Grand Central Market) só aparecem quando a opção em cartaz é a recomendada. O alerta de alergia e o horário da opção aparecem no item aberto.
- T6-UI: a recomendação da sessão Restaurantes muda alguns lugares do roteiro (ex.: jantar de 14/11 passa do Bob's Big Boy para o Musso & Frank). O Bob's continua no comparador.
- T6-UI: ordenações empatadas mantêm a ordem do arquivo. Opções sem nota ficam por último em "Melhor avaliado". O critério escolhido fica destacado em cada card.
