# Zona Eleitoral

Protótipo de jogo sobre o trabalho de mesário: conferir documento, cadastro e
biometria de doze pessoas ao longo de um turno comprimido.

## Menu e salvamento

A logo `logo-itacoa.svg` aparece por três segundos, seguida do aviso de que o jogo
não é um treinamento eleitoral por mais três segundos. Cada tela tem uma barra
de duração e avança ao clicar em qualquer lugar, sem botão visível. Depois vem
o menu de Zona Eleitoral. Novo jogo abre o prólogo; Carregar jogo recupera a partida
salva automaticamente em `localStorage` (`secao-127.save.v1`). Idioma fica desabilitado.

O salvamento inclui o turno, atendimento em andamento, fila, relógio, votos,
erros, assinaturas, conversa, tutorial e posição dos objetos. Uma leitura
biométrica parcial recomeça; o voto na cabina retoma a animação sem duplicar
a contagem. `Esc` ou o botão Ⅱ no cabeçalho abrem o menu durante a partida.
Novo jogo substitui o salvamento. Ao concluir qualquer final, a partida salva é
removida e Menu principal volta à tela de título.

Não há faixa de passo nem texto de protótipo na barra de ações da mesa.

## Irritação e encerramento

O retrato da Neusa ocupa o antigo contador de ocorrências no cabeçalho.
A boca e as sobrancelhas mudam a cada erro, e o fundo passa do verde ao vermelho.
O retrato tem sombra, sem medidor ou legenda. O relógio usa dígitos de sete
segmentos e todos os elementos do cabeçalho acompanham a altura da fila.
No quinto erro (`src/day.js`), ela dispensa o jogador e as horas ficam pendentes.

Tentativas de biometria sem reconhecimento e ações recusadas antes da hora
continuam sem penalidade. Uma ocorrência de fila aparece no retorno daquele
atendimento, mas não é contada duas vezes. Consultar o manual também é livre.

Depois do último atendimento, `Closing.jsx` mostra uma sequência automática de
8,5 segundos: o papel sai da impressora, a urna entra na caixa e a fita fecha a
embalagem. Com movimento reduzido, são três quadros em 2,1 segundos. É uma
representação simbólica do fim do dia, reaproveitando a urna da abertura.
O boletim de urna usa a mesma identificação e o mesmo formato da zerésima,
com o total de votos concluídos. Encaminhamentos, justificativas e desistências
não somam votos. O jogo não registra escolhas de candidatos, brancos ou nulos.
Na abertura, a urna fica diretamente sobre uma mesa na sala, sem painel de modal.

Os dois desfechos usam `Cutscene`, o mesmo componente do prólogo: imagem, um
parágrafo curto e Menu principal. As artes estão em `public/images/story/saida.png`
e `dispensa.png`; os prompts estão em `finais-prompts.md` na mesma pasta.

`npm test` cobre fila, biometria, limite de erros, expressões do retrato, sequência
automática e reinício. O atalho ↠ abre a animação apenas no desenvolvimento.

## Rodar

```sh
npm install     # só na primeira vez
npm run dev     # desenvolvimento, com hot reload
npm run build   # gera dist/
npm run preview # serve o dist/
```

O build usa `base: "./"`, então `dist/index.html` também abre direto do disco.

## Publicar

O build sai com `base: "./"`, ou seja, todo caminho é relativo. É isso que
deixa o mesmo `dist/` funcionar nos três lugares: aberto do disco, num
subcaminho como `usuario.github.io/zona_eleitoral/` e dentro do iframe do
itch.io.

### GitHub Pages

Já existe o fluxo [.github/workflows/pages.yml](.github/workflows/pages.yml):
a cada push na `main` ele instala, constrói e publica o `dist/`. Falta um
passo manual, uma vez só, no repositório:

**Settings › Pages › Build and deployment › Source: GitHub Actions.**

Feito isso, o endereço é `https://<usuario>.github.io/zona_eleitoral/`, e cada
push republica. Para publicar à mão, a aba **Actions** tem o botão *Run
workflow*.

### itch.io

```sh
npm run itch    # constrói e gera secao-127-itch.zip
```

ou, no Windows, um clique duplo em
[empacotar-itch.bat](empacotar-itch.bat).

O zip é escrito por [empacotar.mjs](empacotar.mjs), e não pelo compactador do
Windows, por um motivo prático: o `Compress-Archive` grava os caminhos com
barra invertida e o `tar` do Windows prefixa tudo com `./` — nos dois casos o
itch serve o `index.html` mas erra os assets. O empacotador aqui escreve cada
nome como o navegador vai pedir.

No itch, ao criar o projeto:

| Campo | Valor |
| --- | --- |
| Kind of project | HTML |
| Upload | `secao-127-itch.zip`, marcado como *This file will be played in the browser* |
| Viewport | 1280 × 800 |
| Fullscreen button | ligado |
| Mobile friendly | desligado (o jogo pede mouse e uma tela larga) |

O jogo busca três fontes no Google Fonts para as assinaturas do caderno. Elas
carregam normalmente no itch; sem rede, o caderno cai numa letra do sistema e
o resto continua igual.

## Estrutura

| Caminho | O que é |
| --- | --- |
| [src/App.jsx](src/App.jsx) | Estado do turno, o atendimento e os atalhos |
| [src/flow.js](src/flow.js) | A ordem dos passos, o que cada peça responde e o veredito |
| [src/desk.jsx](src/desk.jsx) | Arrastar, empilhar e largar objetos na mesa |
| [src/data/shift.js](src/data/shift.js) | O gerador de eleitores: arquétipos, documentos, folha do caderno |
| [src/data/people.js](src/data/people.js) | O manual da mesa e as saídas de exceção |
| [src/data/talk.js](src/data/talk.js) | As perguntas da mesa e as respostas de cada arquétipo |
| [src/data/tutorial.js](src/data/tutorial.js) | O roteiro da coordenadora, passo a passo |
| [src/i18n.js](src/i18n.js) | Os dois idiomas: detecção, troca e o texto da interface |
| [src/random.js](src/random.js) | Semente de texto e sorteio determinístico |
| [src/components/Desk.jsx](src/components/Desk.jsx) | A superfície da mesa e onde cada objeto começa o dia |
| [src/components/desk/](src/components/desk/) | Documento, terminal, caderno, leitor, comprovante, livro e folha |
| [src/components/Opening.jsx](src/components/Opening.jsx) | A urna zerada e a zerésima saindo da impressora |
| [src/styles.css](src/styles.css) | Folha única de estilo |
| [legacy/index.html](legacy/index.html) | Versão anterior, em HTML puro |

## Dois idiomas

O jogo abre no idioma do navegador: qualquer coisa que comece com `pt` abre em
português, todo o resto abre em inglês. No menu principal, a terceira opção
troca — e a escolha fica guardada no navegador, valendo por cima da detecção na
próxima visita. Trocar redesenha a tela inteira na hora, no meio da partida
inclusive.

**Nomes de pessoas e de lugares não se traduzem.** Neusa Prado continua Neusa
Prado, a Escola Municipal Horizonte mantém o nome, Monte Alegre e as outras
cidades ficam como estão, e o jogo continua se chamando Zona Eleitoral. O que
muda é a língua: rótulo, fala, documento, manual e aviso.

### Como o texto é escrito

Não há catálogo de chaves para manter em sincronia. Um texto traduzível é um
par, escrito no lugar onde ele é usado:

```js
t({ pt: "Continuar", en: "Continue" })
```

O par também guarda listas — as falas de uma cena, os itens de uma página do
manual:

```js
fala: {
  pt: ["Olha lá o corredor.", "Quem tem preferência passa na frente."],
  en: ["Look at the hallway.", "Anyone with priority goes ahead."],
}
```

O motor é [src/i18n.js](src/i18n.js), com três coisas dentro: `t()`, que resolve
um par no idioma de agora (e preenche buracos escritos entre chaves); `TXT`, o
punhado de textos que se repete pela interface; e `useIdioma()`, chamado uma
única vez na raiz — trocar o idioma redesenha a árvore, e `t()` é uma função
comum em todo o resto do código.

O texto do jogo mora junto dos dados, com as duas línguas lado a lado:
[data/shift.js](src/data/shift.js) tem as falas de chegada e a explicação de
cada caso, [data/talk.js](src/data/talk.js) as perguntas e respostas,
[data/tutorial.js](src/data/tutorial.js) o roteiro da coordenadora e
[data/people.js](src/data/people.js) o manual e as quatro saídas.

### O que não é texto

Três coisas atravessam sem tradução, de propósito:

| O que | Por quê |
| --- | --- |
| `id`, `kind`, `art`, `photo`, `foco` | são nomes internos, não aparecem na tela |
| as etiquetas de `TAGS` em shift.js | não vão à tela hoje: o painel da pessoa não tem descrição |
| os nomes do caderno e da listagem | são nomes de gente |

O sorteio também não muda de idioma: as listas `pt` e `en` de um arquétipo têm o
mesmo tamanho, e o sorteio escolhe a **posição**, não a frase. Por isso
`?turno=xyz` devolve o mesmo dia nas duas línguas, pessoa por pessoa.

O que fica registrado — a conversa, o veredito do atendimento, a ocorrência de
fila — é guardado como texto já resolvido, e não como par: é registro do que foi
dito naquele momento. Trocar de idioma no meio do dia muda a interface e o que
vier depois, sem reescrever o que já passou.

## Uma tela só

No desktop a mesa ocupa exatamente a altura da janela e nada rola. Isso vem de
três decisões em [src/styles.css](src/styles.css):

1. O tamanho base acompanha a janela
   (`font-size: clamp(13px, 0.52vw + 0.95vh, 20px)`) e todo o resto é em `rem`,
   então a interface encolhe junto em telas baixas. Nada na carteira fica abaixo
   de uns 10px: o menor corpo é o das etiquetas em versalete, e o texto que se
   lê de verdade — linha do caderno, campo de documento, item do manual — está
   entre 12 e 15px numa tela de 1600.
2. Cada grade usa `minmax(0, 1fr)` e `min-height: 0`, o que impede um painel de
   empurrar os vizinhos para fora da tela.
3. Abaixo de 900px de largura — ou 460px de altura — o tabuleiro vira uma coluna,
   a mesa perde a posição solta (os objetos viram uma pilha em ordem) e a rolagem
   é liberada.

## A sala

A tela não é um painel abstrato: é a sala de aula onde a seção funciona.

- A **página** é a parede — creme, com a luz entrando de um lado.
- A **coluna da esquerda** é um recorte da sala: parede creme, barra azul,
  rodapé marrom, janela basculante fechada atrás da pessoa, ventilador de parede e a lâmpada
  fluorescente do teto. A pessoa fica de pé ali, e o que ela diz vem numa ficha
  de papel apoiada embaixo.
- O **centro** é a mesa receptora, em fórmica cor de madeira: o documento, o
  terminal na carcaça bege e o caderno de votação ficam apoiados nela.
- A **direita** é o quadro-negro — moldura de madeira, regras a giz e a canaleta
  com giz e apagador. As janelas de abertura e encerramento usam o mesmo quadro.

O desenho da janela e do ventilador está em
[src/components/Classroom.jsx](src/components/Classroom.jsx); as cores da sala
ficam no `:root`, no topo de [src/styles.css](src/styles.css).

## A mesa

A mesa não é um painel: é **uma carteira de escola**, com 62 centímetros de
tampo, e tudo o que está em cima dela tem o tamanho que teria de verdade. A
régua é uma variável, `--cm`, que vale um centímetro na tela:

| Objeto | Tamanho |
| --- | --- |
| Caderno de votação | 21 cm de largura — uma folha A4, com a altura da parte escrita |
| Terminal | 20 cm de frente |
| Carteira de identidade | 13,5 × 9,5 cm, cantos arredondados |
| Celular (documento digital ou pertence) | 7,2 × 14,5 cm |
| Molho de chaves | 9 cm de ponta a ponta |
| Manual | livro de 12 × 11 cm |
| Folha de impedidos | 13 × 11 cm |

O centímetro sai da mesma régua do texto, e não da largura da tela: assim os
objetos crescem junto com as letras e nada transborda de dentro deles. Mas ele
também tem teto pelo tampo — `min(1.32rem, 3.9cqh, 1.85cqw)` —, senão numa
janela baixa o caderno passaria por baixo da carteira. O tampo visível fica em
torno de 56 × 32 cm numa tela de 1600 e nunca deixa um objeto para fora. A carteira é apertada de propósito: não cabe tudo aberto ao mesmo tempo,
e é por isso que os objetos são soltos — documento, terminal, caderno, leitor,
livro e folha podem ser empurrados para onde a mesa quiser, e quem foi tocado
por último fica por cima, como acontece quando você puxa um papel de baixo da
pilha.

O arrasto está em [src/desk.jsx](src/desk.jsx). Três detalhes fazem ele parecer
sólido:

1. **Botão continua botão.** O arrasto começa em qualquer parte do objeto que
   não seja um controle; `button`, campo ou qualquer coisa marcada com
   `data-nodrag` continua clicável. Uma folga de 3px separa o clique do arrasto.
   Fora dos controles o `pointerdown` chama `preventDefault()` e as peças têm
   `user-select: none` — sem isso o navegador entende o segundo arrasto como
   arrastar o texto do objeto, dispara `pointercancel` e o gesto morre pela
   metade.
2. **O ponteiro é capturado**, então o objeto não escapa se o cursor correr mais
   rápido que o render, e a soltura é registrada mesmo fora da janela.
3. **A pilha é assunto interno da mesa.** A superfície é um contexto de
   empilhamento (`isolation: isolate`), senão o objeto tocado por último acabaria
   passando por cima das janelas do jogo depois de umas dezenas de toques.

Só uma área recebe objetos: **a própria pessoa**. Para onde volta tudo o que é
dela — pertences, documento e comprovante —, e é o único jeito de encerrar um
atendimento no trilho. Por isso a borda esquerda da carteira deixa passar: um
objeto arrastado até a pessoa atravessa para fora do tampo. O alvo é onde o
dedo soltou, não o centro do objeto — é mais perto do que a mão acha que está
fazendo, e sai da última posição conhecida do ponteiro, porque a soltura nem
sempre traz coordenadas. Quem preferir clicar tem o botão em cada peça.

A pessoa também **recusa**: oferecer o documento antes da hora não gruda nada
nela. O objeto volta deslizando exatamente para onde estava, e o aviso diz o
que falta fazer. Largar no vazio, fora do tampo, tem o mesmo efeito — nada fica
pendurado fora da carteira.

A pessoa **joga na carteira** o que é dela: o documento quando chega, o celular
e as chaves antes de ir votar — não existe mesa de apoio, o tampo é a mesa de
apoio. O que ela larga **pousa por cima** do que já estava lá, como um papel
que cai na pilha: o documento, os pertences e o comprovante sobem para o topo
da pilha no instante em que chegam. Os objetos entram girando pela esquerda, um depois do outro,
e o estado final da animação é o lugar normal deles — então
`prefers-reduced-motion` desliga o arremesso sem deixar nada fora do lugar.

## A fila

A fila do dia inteiro é montada na abertura, junto com as pessoas: cada uma tem
hora de chegada e pode ter **preferência para votar** — 60 anos ou mais sempre,
e um punhado de outros motivos sorteados (gestante, criança de colo, deficiência,
mobilidade reduzida, doação de sangue recente).

No cabeçalho, no lugar de um número, fica um pedaço de **corredor visto de
lado**: parede com a porta da sala, rodapé, piso de tábuas fugindo para o fundo
e a fila de corpo inteiro em cima dele. Quem está mais para o fim da fila está
mais para dentro do corredor — menor e mais perto do rodapé —, e é essa escala
que dá a profundidade. Quem tem preferência é de outra cor; atrás de quem já
tem rosto vêm os vultos apagados do resto da fila, que cresce a cada ocorrência.
A cena inteira cabe na mesma altura que o número ocupava.

Entre uma pessoa e outra a mesa fica vazia e é preciso **chamar** alguém do
corredor. A ordem é a da fila, com uma exceção: quem tem preferência passa na
frente, e é por isso que dá para clicar nela. Chamar outra pessoa enquanto
alguém com preferência espera é recusado com o motivo, do mesmo jeito que a
mesa recusa pular uma etapa do atendimento.

A fila anda sozinha porque o relógio anda: cada atendimento custa de três a oito
minutos de mesa, e quem tem hora de chegada dentro das próximas duas horas e
meia já está no corredor. Por isso ela encolhe quando você chama e engorda
enquanto você atende — num turno de teste, começa com quatro pessoas às 08:00 e
chega a sete às 13:21.

Sair da fila é uma mudança de largura, não um sumiço: o vulto encolhe até zero
enquanto atravessa a porta, e por isso as pessoas atrás andam para a frente em
vez de pular de lugar. Quem chega entra do mesmo jeito, pelo fim.

## Os aparelhos

Terminal e leitor de digital são aparelhos, não painéis: caixa de plástico com
topo claro e frente escura, marca gravada, luz de estado, pés de borracha e, no
leitor, o cabo saindo por trás em direção ao terminal. O que eles têm a dizer
aparece em visor — fundo escuro e letra verde —, não em texto solto sobre a
peça. É a mesma regra do teclado: o que é máquina parece máquina.

## O atendimento

Cada pessoa é uma pequena máquina de estados ([src/flow.js](src/flow.js)), e a
ordem não é sugestão: cada peça só responde na sua vez.

| Passo | O que a mesa faz |
| --- | --- |
| Terminal | Digita a identificação impressa no documento. Sem registro na tela, nada anda. |
| Caderno | Acha na folha o nome que o terminal mostrou e marca a linha. |
| Biometria | Até quatro leituras no leitor. |
| Ano | Esgotadas as quatro, pergunta o ano de nascimento e digita. Se bater, a pessoa assina o caderno. |
| Cabina | A pessoa larga o que é dela na carteira e vai votar. O som de confirmação é a urna. |
| Entrega | Devolve os pertences, o documento e o comprovante — arrastando cada um até a pessoa. |

Mexer numa peça fora da vez não abre ocorrência: é recusado com um aviso, porque
errar a ordem é diferente de errar a decisão. O jogo nunca compara o documento
com o terminal por você — nada é destacado, conferido ou marcado. A comparação é
toda da mesa.

## O caderno

A folha é **uma só, do turno inteiro**, e é uma folha mesmo: A4 inteira, sem
rolagem, com as vinte e quatro linhas à vista. As doze pessoas da seção já estão
nela desde a abertura, misturadas com nomes de quem não vai aparecer hoje, em
ordem de número e com os nomes fora de ordem — é isso que obriga a procurar em
vez de bater o olho na primeira linha. A folha não se atualiza a cada pessoa: o
que muda ao longo do dia são as assinaturas, que ficam.

Nenhuma das duas listas tem botão: procurar é o jogo. Na folha do caderno a
mesa acha o nome e marca a linha; se ele não estiver ali, não achar já é a
informação, e a saída vem da régua de ações. Na **folha de impedidos** —
anexa ao caderno — vale o mesmo gesto: os nomes estão à vista, e achar o nome
certo é o que conta como ter consultado a listagem antes de encaminhar alguém
por esse motivo. Clicar no nome errado, nas duas, só rende um aviso.

O **manual** é um livro de bolso com uma seção por página, virando pela
lombada. As páginas ficam empilhadas na mesma célula do grid e só a aberta é
visível, então o livro tem sempre a altura da página mais longa e não muda de
tamanho quando a mesa vira a folha.

Cada pessoa escreve com uma de três letras de mão, sorteada junto com ela
([Caveat](https://fonts.google.com/specimen/Caveat),
[Nothing You Could Do](https://fonts.google.com/specimen/Nothing+You+Could+Do)
e [Zeyada](https://fonts.google.com/specimen/Zeyada), carregadas no
[index.html](index.html)), cada uma com seu tamanho e sua inclinação. No fim do
dia dá para ler a folha e saber quem passou por ali.

## A cabina

Confirmada a identidade, a pessoa deixa o celular e as chaves na carteira e sai
de quadro para votar: a sala fica com a
parede vazia, o terminal passa a dizer que há eleitor na cabina, e alguns
segundos depois vem o bipe da urna — um som próprio, mais longo que os bipes da
mesa ([src/sound.js](src/sound.js)) — e ela volta andando para pegar o que é
dela. Quem desiste na cabina volta do mesmo jeito, sem o bipe, e o terminal
passa a pedir a suspensão.

## A conversa

Perguntar deixou de ser um botão da régua e virou conversa: embaixo do retrato
ficam a fala de chegada, o que já foi perguntado com a resposta de cada
pergunta, e os botões do que a mesa ainda pode perguntar.

As perguntas moram todas em [src/data/talk.js](src/data/talk.js), uma por chave.
Para criar uma nova, é lá — nenhum outro arquivo precisa ser mexido:

| campo | o que é |
| --- | --- |
| `label` | o que aparece no botão da mesa |
| `fala` | o que a mesa diz em voz alta (o padrão é o próprio `label`) |
| `resposta` | o que a pessoa responde |
| `marca` | o que fica registrado no atendimento — hoje só `asked` importa |
| `abre` | perguntas que passam a existir depois desta |
| `quando` | `(pessoa, caso) => bool`, para a pergunta só existir às vezes |
| `fica` | `true` se a pergunta continuar na lista depois de feita |

A `resposta` aceita três formas, da mais simples para a mais completa: um texto
solto, um objeto com uma variante por arquétipo (`{ padrao, ja_votou, … }`), ou
uma função que recebe a pessoa — é assim que a resposta traz a data que ela diz
ter nascido. **`abre` é o que encadeia**: uma pergunta destrava outra, e é só
isso que um fluxo precisa ser. Confirmar os dados destrava insistir no nome da
mãe; perguntar da pendência destrava explicar o cartório.

Duas perguntas valem etapa do atendimento: **confirmar os dados** é o que conta
como ter perguntado antes de decidir uma dúvida de identidade, e **perguntar o
ano de nascimento** é o que faz a pessoa dizer o ano que a mesa vai digitar
quando a digital não pega — ela só aparece nesse passo, pelo `quando`.

## Quando foge do trilho

Cinco saídas fecham um atendimento fora do trilho, e o veredito confere também o
que a mesa deixou de fazer antes de decidir: decidir sem carregar o registro no
terminal é sempre erro, mesmo quando a saída acerta por sorte.

| Caso na mesa | Saída certa |
| --- | --- |
| Já votou, cadastro impedido ou outra seção | Encaminhar ao cartório |
| Certidão de nascimento, ou qualquer documento sem foto | Encaminhar |
| Sem condições de votar (embriaguez) | Encaminhar, pedindo que volte depois |
| Quatro falhas de digital e o ano não bate | Encaminhar |
| Título de outro município | Registrar justificativa |
| Nome fora da folha, e na listagem de impedidos | Consultar a listagem e encaminhar |
| Foto duvidosa e as respostas não batem | Chamar o juiz |
| Foto duvidosa e as respostas batem | Habilitar normalmente |
| Habilitada, entrou na cabina e não votou | Suspender a votação |

Dois casos exigem uma etapa antes da decisão: a dúvida de identidade só se
resolve depois de **perguntar os dados**, e o nome fora da folha só depois de
**consultar a listagem**. Pular isso é ocorrência mesmo com a saída certa.

## Os eleitores

Ninguém é escrito à mão. A cada abertura da seção, [src/data/shift.js](src/data/shift.js)
sorteia doze pessoas inteiras — nome, documento, cadastro, biometria, o que
dizem e a resposta certa.

O que é sorteado é *quem chega*. A forma do dia continua fixa, porque é dela
que o jogo depende:

- **Arquétipos.** Cada pessoa nasce de um dos dezesseis casos-base (`KINDS`), e
  é ele que decide o que o terminal mostra, se o nome está na folha, o que a
  digital faz nas quatro tentativas e qual é a saída certa. Um turno junta cinco
  casos que se resolvem no trilho, quatro que terminam em encaminhar e três
  exceções, com um caso de folga pendendo para algum lado.
- **Curva.** O campo `hard` ordena o dia: de manhã os casos são claros, à
  tarde as exceções se acumulam — junto com a fila, que cresce de quatro para
  quase quarenta. A primeira pessoa é sempre a mais simples da leva, e dois
  casos iguais nunca ficam colados.
- **A divergência é o caso.** Só o arquétipo mexe na diferença entre o
  documento e o cadastro: a seção trocada, o município de outro título, a letra
  comida na digitação do nome, o ano que a pessoa diz e não bate. O resto — quem
  é, o que apresenta — é sorteado em volta disso.
- **A folha do caderno** vem junto com a pessoa: treze linhas em ordem de
  número, com os nomes fora de ordem, e a linha dela escondida no meio — ou
  ausente, quando o caso é esse.

Tudo sai de uma semente de texto, mostrada no boletim de encerramento. Abrir a
página com `?turno=xyz` repete aquele dia inteiro, pessoa por pessoa, na mesma
ordem: é assim que se testa um caso duas vezes.

Falas e etiquetas vêm de listas por arquétipo e servem para qualquer pessoa —
o sexo sorteado só decide nome, cabelo e barba, então nada nesses textos pode
ter gênero preso.

## Os rostos

O retrato é montado em SVG por [src/face.js](src/face.js), semeado pelo `id` da
pessoa: mesmo id, mesmo rosto, sempre. Um caso pode declarar qualquer campo em
`look` e ele manda em cima do gerador — os eleitores sorteados não declaram
nada, só o sexo, que inclina o corte de cabelo e a barba.

O desenho usa formas geométricas chapadas: olhos brancos com pupilas escuras,
sobrancelhas grossas, nariz arredondado em coral e cabelos com silhuetas grandes.
São dez tons de pele, do claro ao escuro; sombras, orelhas e boca acompanham
a cor da pele. Cabelo, barba, expressão, óculos e roupa se combinam por pessoa.

| Campo | Valores | Padrão |
| --- | --- | --- |
| `skin`, `shirt`, `hair` | qualquer `#rrggbb` | sorteado |
| `style` | `crop` `side` `quiff` `flat` `wave` `fringe` `long` `bun` `curly` `bald` `bob` `pony` | sorteado pelo sexo |
| `face` | `oval` `round` `long` `square` | sorteado |
| `age` | `young` `adult` `old` | vem do ano de nascimento |
| `beard` | `none` `stubble` `mustache` `handlebar` `goatee` `full` | sorteado pelo sexo |
| `mood` | `calm` `smile` `tense` `tired` | sorteado |
| `collar` | `tee` `polo` `button` | sorteado |
| `glasses` | `true` / `false` | sorteado |

Além desses, o gerador solta um punhado de multiplicadores contínuos —
largura da cabeça, distância dos olhos, comprimento do nariz, tamanho da
orelha. É o que impede duas pessoas com o mesmo corte e o mesmo formato de
rosto de saírem idênticas.

O queixo fica fixo em `y=126` e a cabeça cresce para cima. As peças do rosto
compartilham um espaço de 68 × 80, com cabelos em camadas à frente e atrás;
topetes e franjas ultrapassam o crânio. `style` também aceita os números `0`,
`1` e `2` da arte antiga. Cada retrato tem seu próprio recorte SVG, inclusive
quando a pessoa e a foto divergente do documento aparecem juntas.

`age` acrescenta cabelos grisalhos e vincos sob os olhos. `mood` varia a boca,
a inclinação das sobrancelhas e as pálpebras de quem está cansado.

## A abertura

Antes de a porta abrir, a urna imprime a zerésima — o papel que mostra a
contagem começando do zero. A tela tem a máquina e um botão, e nada mais: um
clique imprime, e a votação abre sozinha quando a fita termina de sair.

A urna e o relatório são inventados. Nem a máquina nem o papel copiam
equipamento ou documento de eleição real: é a urna da Seção 127, e a fita sai
com `sem valor oficial` impresso nela. Os números da zerésima saem da mesma
semente do turno, então a abertura combina com o dia que vem depois dela e
volta igual com `?turno=`.

A máquina é isométrica, e cada face é um retângulo comum dentro de um grupo com
a matriz da sua face:

| Face | Matriz | Para onde vai o `x` local |
| --- | --- | --- |
| de cima | `matrix(0.866,-0.5,-0.866,-0.5,0,0)` | fundo-direita, e o `y` para o fundo-esquerda |
| direita (tela e teclado) | `matrix(0.866,-0.5,0,1,0,0)` | fundo-direita, e o `y` para baixo |
| esquerda (a lateral) | `matrix(-0.866,-0.5,0,1,0,0)` | fundo-esquerda, e o `y` para baixo |

Assim desenhar a tela, as dez teclas e a fenda continua sendo desenhar
retângulos em coordenadas normais — a projeção fica num lugar só. A fita usa a
mesma matriz da face esquerda (em CSS, `matrix(0.866,0.5,0,1)` a partir da
ponta de trás da fenda, para o texto não sair espelhado), então o papel
pertence ao mesmo desenho da caixa.

Ela não desliza para fora: é **revelada** de cima para baixo com
`clip-path: inset()` em `steps(13)`, que é como o papel sai de uma impressora
térmica — linha a linha, e a última linha pode ficar cortada no meio. O estado
final é o papel inteiro à mostra, então `prefers-reduced-motion` desliga a
impressão sem esconder nada (a virada para o atendimento também não espera o
fim da animação: ela espera um relógio, que encurta junto).

A cena inteira é proporcional à própria largura — o SVG pelo `viewBox`, a fita
por `cqw` e o texto dela por `em`. Por isso a zerésima quebra as linhas do
mesmo jeito no desktop e no celular, e continua colada na fenda nos dois.

## O tutorial

Impressa a zerésima, quem entra na sala não é eleitor: é a coordenadora do
local. Ela ocupa o lugar de quem vem votar — mesmo retrato, mesma conversa
embaixo — e a primeira coisa que faz é perguntar se você quer que ela mostre a
mesa. Quem já sabe responde que já sabe, ela se despede em uma linha e a porta
abre.

A cada passo, **o que não é o assunto apaga**: o corredor, as peças da mesa e
tudo o mais caem para 16% e param de receber ponteiro, e só o objeto de que ela
está falando continua aceso, com o mesmo brilho da peça da vez. A régua embaixo
da mesa troca o "passo" pelo objetivo daquela etapa. Dois lugares nunca apagam,
porque é neles que se lê a explicação: a sala onde ela está e a própria régua.

O roteiro inteiro está em [src/data/tutorial.js](src/data/tutorial.js), num
vetor lido de cima para baixo. Um passo é isto:

| campo | o que é |
| --- | --- |
| `id` | nome do passo, usado pelos desvios |
| `fala` | as falas dela, uma bolha por item, na ordem |
| `foco` | o que fica aceso; todo o resto apaga |
| `objetivo` | a linha que aparece na régua da mesa |
| `botao` | o texto do botão que segue adiante |
| `escolhas` | em vez de um botão, uma escolha: `{ label, diz, vai }` |
| `fecha` | `true` no passo que termina o tutorial e abre a seção |

Os nomes de `foco` são os das peças da mesa (`terminal`, `doc`, `caderno`,
`leitor`, `listagem`, `manual`, `comprovante`, `item-celular`, `item-chaves`)
mais três lugares da tela: `fila`, `pessoa` e `saidas`. Acrescentar uma etapa é
acrescentar um objeto ao vetor; nenhum outro arquivo precisa ser mexido — quem
quiser um fluxo com desvios usa `escolhas`, em que cada opção diz para onde vai.

A coordenadora também não é sorteada: o `id` dela é fixo, então o rosto sai
sempre igual do mesmo gerador dos eleitores, e o pouco que vale a pena fixar
— óculos, coque, sorriso — está no `look` dela.

## A chegada

Cada pessoa entra andando pela esquerda como um vulto preto, para na frente da
mesa e só então ganha cor. São dois arquivos:

- [src/styles.css](src/styles.css) — a animação `chegar`. `brightness(0)` zera a
  cor de tudo e preserva o recorte, então a silhueta é o próprio desenho, sem
  nenhum ativo a mais. A translação tem duas batidas verticais, que leem como
  passos; o vulto para aos 58% e segura preto até os 76%, e o resto é a cor
  entrando.
- [src/components/PersonPanel.jsx](src/components/PersonPanel.jsx) — a `key` por
  `person.id` remonta o bloco a cada pessoa, que é o que faz a animação tocar de
  novo. A ficha de papel embaixo espera 700 ms para aparecer, junto com o rosto.

O estado final da animação é o estado normal do elemento, então a regra de
`prefers-reduced-motion` já existente desliga a chegada sem quebrar nada.

## Arte opcional

Os retratos e as fotos de documento são desenhados em SVG, mas cada um aceita uma
imagem no lugar:

- `public/images/personagens/<id>.png` — retrato da pessoa
- `public/images/rg/<id>.png` — foto no documento

O `<id>` é gerado junto com a pessoa, no formato `nome-sobrenome-posição`
(`marina-souza-1`, `carlos-lima-4`, …). Como o turno é sorteado, esse nome só
se repete com a semente presa: `?turno=xyz`. Se o arquivo não existir, o SVG
continua valendo — que é o caso normal.

## Os botões

A identidade visual dos botões vem das teclas de urna: **chapadas, elevadas e
com texto grande**. Cada tecla é uma face de cor sólida sobre uma aresta sólida
(`box-shadow: 0 0.2rem 0`, sem borrão) e afunda quando é apertada — a face
desce e a aresta some. Nada de degradê, nada de borda fina.

O texto saiu do monoespaçado e foi para a fonte sem serifa, em negrito e num
corpo que dá para ler de longe: 1,35rem nos números do teclado, 1,05rem nos
botões das janelas, 0,82rem nas saídas da mesa. As cores separam a função —
claro para as teclas neutras, verde para confirmar, vermelho para corrigir,
azul, ameixa e barro para as saídas —, e o atalho de teclado aparece como uma
tecla amarela pequena dentro do próprio botão.

Os tons ficam em `:root`, em pares de face e aresta (`--key` / `--key-edge`,
`--key-green` / `--key-green-edge`, e assim por diante), então mudar a paleta
das teclas é mexer num lugar só.

## Atalho de desenvolvimento

No cabeçalho, ao lado da contagem de casos, há um **pular ao fim** tracejado:
encerra o dia na hora para revisar a animação sem jogar o turno inteiro.
O boletim preserva somente os votos já concluídos; o atalho não inventa votos.
Ele só aparece no servidor de desenvolvimento.

## Atalhos

Números digitam no terminal · `Enter` confirma · `Backspace` corrige ·
`B` lê a digital · `P` pergunta os dados · `E` encaminha · `J` justifica ·
`C` chama o juiz · `S` suspende · `Enter` avança o retorno.
