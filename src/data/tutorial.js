/* O tutorial da coordenadora.

   Antes de a porta abrir, quem entra na sala é a responsável pelo local de
   votação. Ela fala pelo mesmo painel de conversa do eleitor e vai apontando
   as peças da mesa uma a uma: a cada passo, o que não é o assunto apaga e o
   que é acende.

   Todo o roteiro está em `PASSOS`, e é só isto que precisa ser mexido para
   mudar, cortar ou acrescentar uma etapa:

   | campo      | o que é                                                        |
   | ---------- | -------------------------------------------------------------- |
   | `id`       | nome do passo, usado pelos desvios (`vai`)                      |
   | `fala`     | as falas dela, uma bolha por item, na ordem                     |
   | `foco`     | o que fica aceso; todo o resto apaga (veja os nomes abaixo)      |
   | `objetivo` | a linha que aparece na régua da mesa, no lugar do passo          |
   | `botao`    | o texto do botão que segue adiante                               |
   | `escolhas` | em vez de um botão, uma escolha: `{ label, diz, vai }`           |
   | `fecha`    | `true` no passo que termina o tutorial e abre a seção            |

   Os nomes de `foco` são os das peças da mesa — `terminal`, `doc`, `caderno`,
   `leitor`, `listagem`, `manual`, `comprovante`, `item-celular`,
   `item-chaves` — mais três lugares da tela: `fila` (o corredor no alto),
   `pessoa` (quem está na frente da mesa) e `saidas` (a régua de ações).

   A ordem é a do próprio vetor. `vai` só existe para o desvio de quem dispensa
   o tutorial: `PASSOS` continua sendo lido de cima para baixo. */

/* Ela não é sorteada: é sempre a mesma pessoa, com o mesmo rosto. O retrato
   sai do `id` como o de qualquer eleitor (veja [face.js](../face.js)); o que
   está em `look` é o pouco que vale a pena fixar nela. */
export const COORDENADORA = {
  id: "coordenadora-127",
  name: "Neusa Prado",
  role: "coordenadora do local",
  sex: "f",
  reg: { birth: "12/04/1962" },
  look: { mood: "smile", collar: "button", glasses: true, style: "bun" },
};

export const PASSOS = [
  {
    id: "abertura",
    fala: [
      "Bom dia! Sou a Neusa, coordenadora aqui do prédio. A sala 03 é sua hoje.",
      "A urna já imprimiu a zerésima e o corredor está enchendo. Quer que eu mostre a mesa antes de abrir a porta?",
    ],
    escolhas: [
      { label: "Pode mostrar, sim", diz: "Pode mostrar, por favor.", vai: "fila" },
      { label: "Já sei como funciona", diz: "Obrigada, já sei como funciona.", vai: "dispensa" },
    ],
  },

  {
    id: "fila",
    foco: ["fila"],
    objetivo: "As pessoas esperam no corredor. Você chama uma de cada vez.",
    fala: [
      "Olha lá o corredor. São essas pessoas que você atende — uma de cada vez, na ordem em que chegaram.",
      "Quem tem preferência vem marcada de outra cor: idade, gestante, criança de colo. Essa passa na frente das outras.",
      "Passe o mouse para ver a condição de cada pessoa. Você pode chamar qualquer uma, mas furar a ordem ou ignorar a preferência gera uma ocorrência.",
    ],
    botao: "Entendi",
  },

  {
    id: "documento",
    foco: ["pessoa", "doc"],
    objetivo: "A pessoa chega e deixa o documento com foto na carteira.",
    fala: [
      "A pessoa senta na sua frente e deixa o documento aí na carteira. Tem que ter foto — é o que prova quem ela é.",
      "Não tem atalho: quem compara o documento com a tela e com o que ela fala é você. Se quiser puxar conversa, o botão de resposta fica aqui embaixo.",
    ],
    botao: "Entendi",
  },

  {
    id: "terminal",
    foco: ["terminal"],
    objetivo: "Digite no terminal os quatro dígitos da identificação.",
    fala: [
      "Primeiro é sempre o terminal. Você digita os quatro dígitos da identificação que está no documento e aperta CONFIRMA.",
      "Só depois disso o cadastro aparece na tela: nome, nascimento, seção e a situação da pessoa. Sem isso na tela, você não decide nada.",
    ],
    botao: "Entendi",
  },

  {
    id: "caderno",
    foco: ["caderno"],
    objetivo: "Ache no caderno o nome que está no terminal.",
    fala: [
      "Com o nome na tela, procure ele no caderno de votação. É folha por folha, no dedo mesmo — o caderno não procura por você.",
      "Achou, clica na linha. É essa linha que ela vai assinar daqui a pouco.",
    ],
    botao: "Entendi",
  },

  {
    id: "biometria",
    foco: ["leitor"],
    objetivo: "Peça a digital no leitor.",
    fala: [
      "Agora a digital. Ela encosta o dedo no leitor e espera o visor.",
      "Se não pegar, tem quatro tentativas. Passou das quatro, você pergunta o ano de nascimento e digita no terminal. Conferindo, ela assina o caderno e vai votar.",
    ],
    botao: "Entendi",
  },

  {
    id: "cabina",
    foco: ["pessoa"],
    objetivo: "Ela deixa os pertences na carteira e vai à cabina.",
    fala: [
      "Antes de entrar na cabina, ela larga celular e chaves em cima da carteira. Ninguém vota com o telefone na mão.",
      "Ela some por um instante, você escuta o bipe da urna e ela volta. O que acontece lá dentro não é da sua conta — e nem aparece aqui.",
    ],
    botao: "Entendi",
  },

  {
    id: "devolucao",
    foco: ["pessoa", "doc", "comprovante", "item-celular", "item-chaves"],
    objetivo: "Devolva pertences, documento e comprovante arrastando até a pessoa.",
    fala: [
      "Voltou, você devolve tudo: os pertences, o documento e o comprovante de votação.",
      "Devolver é arrastar cada coisa até a mão dela, aqui do lado esquerdo. Enquanto faltar alguma coisa, o atendimento não fecha.",
    ],
    botao: "Entendi",
  },

  {
    id: "saidas",
    foco: ["saidas"],
    objetivo: "Nem todo atendimento acaba em voto: as saídas fecham o caso.",
    fala: [
      "Nem todo mundo vota nesta sala. Tem quem seja de outra seção, quem só venha justificar, quem apareça com pendência no cadastro.",
      "Para esses, são estas saídas aqui embaixo: encaminhar, justificar, chamar o juiz ou suspender. Cada uma fecha o atendimento do seu jeito.",
    ],
    botao: "Entendi",
  },

  {
    id: "consulta",
    foco: ["manual", "listagem"],
    objetivo: "O manual e a folha de impedidos ficam na mesa o dia inteiro.",
    fala: [
      "Na dúvida, o manual da mesa e a folha de impedidos ficam aí o dia inteiro. O manual vira página; a folha é de consultar antes de decidir.",
      "Consultar não custa nada. Decidir sem olhar é o que abre ocorrência.",
    ],
    botao: "Entendi",
  },

  {
    id: "fim",
    objetivo: "Chame a primeira pessoa do corredor.",
    fala: [
      "É isso. O relógio corre até as cinco da tarde e a fila não espera por ninguém.",
      "Qualquer coisa, bate na porta da coordenação que eu venho. Bom trabalho!",
    ],
    botao: "Abrir a porta",
    fecha: true,
  },

  /* Fora da ordem: só se chega aqui pelo desvio de quem dispensou o tutorial. */
  {
    id: "dispensa",
    objetivo: "Chame a primeira pessoa do corredor.",
    fala: ["Então tá. Deixei o caderno, o manual e a folha de impedidos na mesa. Bom trabalho!"],
    botao: "Abrir a porta",
    fecha: true,
  },
];

export const indiceDe = (id) => PASSOS.findIndex((p) => p.id === id);

/* O que a peça faz quando existe um foco: apagar ou acender. Sem foco, ela
   fica como estava — é o estado normal do jogo. */
export function luz(foco, id) {
  if (!foco) return "";
  return foco.includes(id) ? " em-foco" : " apagado";
}

/* Alguns lugares nunca apagam, porque é neles que se lê o que está sendo
   explicado: a sala onde ela está falando e a régua com o objetivo. */
export function realce(foco, id) {
  return foco?.includes(id) ? " em-foco" : "";
}
