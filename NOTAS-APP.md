# Notas do app LA 26 (sessão App)

## Checklist de progresso
- [x] T4. Camarillo trocado pelo Citadel Outlets (dia 2), ilustração `citadel`
- [x] T3. Fim das "piscadas" (redesenho só com mudança de dado)
- [ ] T7. Aba Contas (controle de gastos)
- [ ] T5. Reordenar brinquedos (u1 e u2)
- [ ] T2-UI. Curiosidades na aba Cenas
- [ ] T6-UI. Comparador de restaurantes
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
