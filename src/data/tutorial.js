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

   Texto é sempre um par `{ pt, en }` — nas falas, um par de listas (veja
   [i18n.js](../i18n.js)). Só `id`, `foco` e `vai` são nomes internos.

   Os nomes de `foco` são os das peças da mesa — `terminal`, `doc`, `caderno`,
   `leitor`, `listagem`, `manual`, `comprovante`, `item-celular`,
   `item-chaves` — mais três lugares da tela: `fila` (o corredor no alto),
   `pessoa` (quem está na frente da mesa) e `saidas` (a régua de ações).

   A ordem é a do próprio vetor. `vai` só existe para o desvio de quem dispensa
   o tutorial: `PASSOS` continua sendo lido de cima para baixo. */

/* Ela não é sorteada: é sempre a mesma pessoa, com o mesmo rosto. O retrato
   sai do `id` como o de qualquer eleitor (veja [face.js](../face.js)); o que
   está em `look` é o pouco que vale a pena fixar nela. O nome não se traduz. */
export const COORDENADORA = {
  id: "coordenadora-127",
  name: "Neusa Prado",
  role: { pt: "coordenadora do local", en: "polling place coordinator" },
  sex: "f",
  reg: { birth: "12/04/1962" },
  look: { mood: "smile", collar: "button", glasses: true, style: "bun" },
};

export const PASSOS = [
  {
    id: "abertura",
    fala: {
      pt: [
        "Bom dia! Sou a Neusa, coordenadora aqui do prédio. A sala 03 é sua hoje.",
        "A urna já imprimiu a zerésima e o corredor está enchendo. Quer que eu mostre a mesa antes de abrir a porta?",
      ],
      en: [
        "Morning! I'm Neusa, the coordinator for this building. Room 03 is yours today.",
        "The machine has printed the zero tape and the hallway is filling up. Want me to walk you through the table before we open the door?",
      ],
    },
    escolhas: [
      {
        label: { pt: "Pode mostrar, sim", en: "Yes, please show me" },
        diz: { pt: "Pode mostrar, por favor.", en: "Please show me." },
        vai: "fila",
      },
      {
        label: { pt: "Já sei como funciona", en: "I already know how it works" },
        diz: { pt: "Obrigada, já sei como funciona.", en: "Thanks, I already know how it works." },
        vai: "dispensa",
      },
    ],
  },

  {
    id: "fila",
    foco: ["fila"],
    objetivo: {
      pt: "As pessoas esperam no corredor. Você chama uma de cada vez.",
      en: "People wait in the hallway. You call them one at a time.",
    },
    fala: {
      pt: [
        "Olha lá o corredor. São essas pessoas que você atende — uma de cada vez, na ordem em que chegaram.",
        "Quem tem preferência vem marcada de outra cor: idade, gestante, criança de colo. Essa passa na frente das outras.",
        "Passe o mouse para ver a condição de cada pessoa. Você pode chamar qualquer uma, mas furar a ordem ou ignorar a preferência gera uma ocorrência.",
      ],
      en: [
        "Look at the hallway. Those are the people you serve — one at a time, in the order they arrived.",
        "Anyone with priority shows up in a different colour: age, pregnancy, a baby in arms. They go ahead of the rest.",
        "Hover over someone to see their condition. You can call whoever you like, but cutting the line or ignoring priority opens an incident.",
      ],
    },
    botao: { pt: "Entendi", en: "Got it" },
  },

  {
    id: "documento",
    foco: ["pessoa", "doc"],
    objetivo: {
      pt: "A pessoa chega e deixa o documento com foto na carteira.",
      en: "The voter arrives and leaves a photo ID on the desk.",
    },
    fala: {
      pt: [
        "A pessoa senta na sua frente e deixa o documento aí na carteira. Tem que ter foto — é o que prova quem ela é.",
        "Não tem atalho: quem compara o documento com a tela e com o que ela fala é você. Se quiser puxar conversa, o botão de resposta fica aqui embaixo.",
      ],
      en: [
        "The voter sits in front of you and leaves the document on the desk. It has to have a photo — that's what proves who they are.",
        "There's no shortcut: comparing the document with the screen and with what they say is your job. If you want to start a conversation, the reply button is down here.",
      ],
    },
    botao: { pt: "Entendi", en: "Got it" },
  },

  {
    id: "terminal",
    foco: ["terminal"],
    objetivo: {
      pt: "Digite no terminal os quatro dígitos da identificação.",
      en: "Type the four-digit document number into the terminal.",
    },
    fala: {
      pt: [
        "Primeiro é sempre o terminal. Você digita os quatro dígitos da identificação que está no documento e aperta CONFIRMA.",
        "Só depois disso o cadastro aparece na tela: nome, nascimento, seção e a situação da pessoa. Sem isso na tela, você não decide nada.",
      ],
      en: [
        "The terminal always comes first. You type the four digits printed on the document and press CONFIRM.",
        "Only then does the record appear on screen: name, date of birth, section and the voter's status. Without that on screen, you decide nothing.",
      ],
    },
    botao: { pt: "Entendi", en: "Got it" },
  },

  {
    id: "caderno",
    foco: ["caderno"],
    objetivo: {
      pt: "Ache no caderno o nome que está no terminal.",
      en: "Find the name from the terminal in the register.",
    },
    fala: {
      pt: [
        "Com o nome na tela, procure ele no caderno de votação. É folha por folha, no dedo mesmo — o caderno não procura por você.",
        "Achou, clica na linha. É essa linha que ela vai assinar daqui a pouco.",
      ],
      en: [
        "With the name on screen, look for it in the voter register. Sheet by sheet, by hand — the register won't search for you.",
        "Found it, click the line. That's the line they'll sign in a moment.",
      ],
    },
    botao: { pt: "Entendi", en: "Got it" },
  },

  {
    id: "biometria",
    foco: ["leitor"],
    objetivo: {
      pt: "Arraste a mão até o leitor e segure o dedo encaixado por 3 segundos.",
      en: "Drag the hand to the reader and hold the finger in place for 3 seconds.",
    },
    fala: {
      pt: [
        "Agora a digital. A mão da pessoa aparece na tela. Segure e arraste a mão para encaixar a ponta do indicador no leitor. Mantenha o botão pressionado por três segundos.",
        "Se soltar ou tirar o dedo, a coleta recomeça sem gastar tentativa. Pelo teclado, B seleciona a mão, as setas movem e espaço segura; Shift com as setas faz o ajuste fino.",
        "Se não pegar, tem quatro tentativas. Passou das quatro, você pergunta o ano de nascimento e digita no terminal. Conferindo, ela assina o caderno e vai votar.",
      ],
      en: [
        "Now the fingerprint. The voter's hand shows up on screen. Hold and drag it to set the tip of the index finger on the reader. Keep the button pressed for three seconds.",
        "Let go or slide off and the scan restarts without spending an attempt. On the keyboard: B selects the hand, the arrows move it and space holds; Shift with the arrows is the fine adjustment.",
        "If it won't read, you get four attempts. Past the fourth, you ask for the year of birth and type it into the terminal. If it matches, they sign the register and go vote.",
      ],
    },
    botao: { pt: "Entendi", en: "Got it" },
  },

  {
    id: "cabina",
    foco: ["pessoa"],
    objetivo: {
      pt: "Ela deixa os pertences na carteira e vai à cabina.",
      en: "They leave their belongings on the desk and step into the booth.",
    },
    fala: {
      pt: [
        "Antes de entrar na cabina, ela larga celular e chaves em cima da carteira. Ninguém vota com o telefone na mão.",
        "Ela some por um instante, você escuta o bipe da urna e ela volta. O que acontece lá dentro não é da sua conta — e nem aparece aqui.",
      ],
      en: [
        "Before stepping into the booth, they drop phone and keys on the desk. Nobody votes with a phone in hand.",
        "They disappear for a moment, you hear the machine beep, and they come back. What happens in there is none of your business — and it never shows up here.",
      ],
    },
    botao: { pt: "Entendi", en: "Got it" },
  },

  {
    id: "devolucao",
    foco: ["pessoa", "doc", "comprovante", "item-celular", "item-chaves"],
    objetivo: {
      pt: "Devolva pertences, documento e comprovante arrastando até a pessoa.",
      en: "Give back belongings, document and receipt by dragging them to the voter.",
    },
    fala: {
      pt: [
        "Voltou, você devolve tudo: os pertences, o documento e o comprovante de votação.",
        "Devolver é arrastar cada coisa até a mão dela, aqui do lado esquerdo. Enquanto faltar alguma coisa, o atendimento não fecha.",
      ],
      en: [
        "Once they're back, you hand everything over: the belongings, the document and the voting receipt.",
        "Handing over means dragging each thing into their hand, over on the left. While anything is missing, the case doesn't close.",
      ],
    },
    botao: { pt: "Entendi", en: "Got it" },
  },

  {
    id: "saidas",
    foco: ["saidas"],
    objetivo: {
      pt: "Nem todo atendimento acaba em voto: as saídas fecham o caso.",
      en: "Not every case ends in a vote: the four actions close it.",
    },
    fala: {
      pt: [
        "Nem todo mundo vota nesta sala. Tem quem seja de outra seção, quem só venha justificar, quem apareça com pendência no cadastro.",
        "Para esses, são estas saídas aqui embaixo: encaminhar, justificar, chamar o juiz ou suspender. Cada uma fecha o atendimento do seu jeito.",
      ],
      en: [
        "Not everyone votes in this room. Some belong to another section, some only come to file an absence, some show up with a problem on their record.",
        "For those, it's these actions down here: send on, file the absence, call the judge or suspend. Each one closes the case in its own way.",
      ],
    },
    botao: { pt: "Entendi", en: "Got it" },
  },

  {
    id: "consulta",
    foco: ["manual", "listagem"],
    objetivo: {
      pt: "O manual e a folha de impedidos ficam na mesa o dia inteiro.",
      en: "The handbook and the barred voters sheet stay on the desk all day.",
    },
    fala: {
      pt: [
        "Na dúvida, o manual da mesa e a folha de impedidos ficam aí o dia inteiro. O manual vira página; a folha é de consultar antes de decidir.",
        "Consultar não custa nada. Decidir sem olhar é o que abre ocorrência.",
      ],
      en: [
        "When in doubt, the table handbook and the barred voters sheet are right there all day. The handbook turns pages; the sheet is for checking before you decide.",
        "Checking costs nothing. Deciding without looking is what opens an incident.",
      ],
    },
    botao: { pt: "Entendi", en: "Got it" },
  },

  {
    id: "fim",
    objetivo: { pt: "Chame a primeira pessoa do corredor.", en: "Call the first person in from the hallway." },
    fala: {
      pt: [
        "É isso. O relógio corre até as cinco da tarde e a fila não espera por ninguém.",
        "Qualquer coisa, bate na porta da coordenação que eu venho. Bom trabalho!",
      ],
      en: [
        "That's it. The clock runs to five in the afternoon and the queue waits for nobody.",
        "Anything you need, knock on the coordination door and I'll come. Good luck!",
      ],
    },
    botao: { pt: "Abrir a porta", en: "Open the door" },
    fecha: true,
  },

  /* Fora da ordem: só se chega aqui pelo desvio de quem dispensou o tutorial. */
  {
    id: "dispensa",
    objetivo: { pt: "Chame a primeira pessoa do corredor.", en: "Call the first person in from the hallway." },
    fala: {
      pt: ["Então tá. Deixei o caderno, o manual e a folha de impedidos na mesa. Bom trabalho!"],
      en: ["All right then. I've left the register, the handbook and the barred voters sheet on the desk. Good luck!"],
    },
    botao: { pt: "Abrir a porta", en: "Open the door" },
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
