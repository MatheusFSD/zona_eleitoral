/* O atendimento, passo a passo.

   Um caso é uma pequena máquina de estados: terminal, caderno, biometria,
   cabina e entrega, nessa ordem. Cada peça da mesa só responde na
   sua vez — mexer fora de hora não abre ocorrência, só é recusado com um
   aviso, porque errar a ordem é diferente de errar a decisão.

   `decisao` é o estado sem próximo passo: o caso saiu do trilho e só uma das
   ações da mesa fecha o atendimento. */

export const STEP = {
  terminal: "Digite no terminal a identificação do documento.",
  caderno: "Ache na folha o nome que está no terminal.",
  biometria: "Encaixe o indicador no leitor e segure a mão por 3 segundos.",
  ano: "Pergunte o ano de nascimento e digite no terminal.",
  assinatura: "A pessoa assina o caderno.",
  cabina: "A pessoa deixou as coisas na carteira e foi votar.",
  entrega: "Devolva os pertences, o documento e o comprovante — arraste para a pessoa.",
  decisao: "Este caso não se resolve no trilho: escolha uma saída.",
};

export const newCase = () => ({
  step: "terminal",
  typed: "", // o que está digitado no teclado do terminal
  loaded: false, // o registro apareceu na tela
  refused: "", // último aviso do terminal
  tries: 0, // leituras de digital
  bio: "idle", // idle | fail | ok | esgotada
  asked: false, // a mesa já conferiu os dados na conversa
  perguntadas: [], // o que já foi perguntado
  aberto: [], // perguntas destravadas por outras
  dialogo: [], // a conversa até agora: { id, mesa, pessoa }
  queueIssue: "", // ocorrência registrada ao chamar fora da ordem
  marked: null, // número da linha marcada no caderno
  signed: false,
  consulted: null, // o nome achado na listagem de impedidos
  given: [], // pertences já devolvidos à pessoa
  docBack: false, // documento devolvido
  receipt: false, // comprovante entregue
  voted: false,
});

/* Que peça responde em cada passo. O manual e a listagem respondem sempre:
   consultar não é agir. */
const OWNER = {
  terminal: ["terminal"],
  caderno: ["caderno"],
  biometria: ["leitor"],
  ano: ["terminal"],
  assinatura: ["caderno"],
  cabina: [],
  entrega: ["comprovante", "pertence", "doc"],
  decisao: [],
};

const REFUSAL = {
  terminal: "O terminal vem primeiro: sem registro na tela, não dá para seguir.",
  caderno: "Antes, ache o nome na folha do caderno.",
  biometria: "Falta a digital no leitor.",
  ano: "O terminal está esperando o ano de nascimento.",
  assinatura: "Falta a assinatura da pessoa no caderno.",
  cabina: "A pessoa está na cabina. Espere.",
  entrega: "Falta devolver o que é da pessoa.",
  decisao: "Este caso já saiu do trilho: use uma das ações da mesa.",
};

export function allowed(step, piece) {
  return (OWNER[step] ?? []).includes(piece);
}

export function refusal(step) {
  return REFUSAL[step] ?? "Ainda não é a hora disso.";
}

/* ------------------------------------------------------------- o veredito -- */

const TITLE = {
  fluxo: "Pessoa habilitada e comprovante entregue",
  encaminhar: "Encaminhamento correto",
  justificar: "Justificativa registrada",
  juiz: "Juiz chamado à seção",
  suspender: "Votação suspensa",
};

const STAMP = {
  fluxo: "HABILITADO",
  encaminhar: "ENCAMINHADO",
  justificar: "JUSTIFICADO",
  juiz: "AGUARDA O JUIZ",
  suspender: "SUSPENSO",
};

const MISSED = {
  terminal: "Você decidiu sem carregar o registro no terminal.",
  ask: "Faltou perguntar os dados à pessoa antes de decidir.",
  list: "Faltou consultar a listagem de impedidos: o nome estava lá.",
};

/* O tempo que cada saída custa à mesa, em minutos de fila. */
const COST = { fluxo: 3, encaminhar: 4, justificar: 6, juiz: 8, suspender: 5 };

export function judge(person, action, c) {
  const needs = person.needs ?? {};

  // Decidir sem olhar é sempre errado, mesmo quando a saída acerta por sorte.
  if (!c.loaded) return verdict(false, action, person, MISSED.terminal);
  if (needs.ask && !c.asked) return verdict(false, action, person, MISSED.ask);
  if (needs.list && !c.consulted) return verdict(false, action, person, MISSED.list);

  return verdict(action === person.resolve, action, person, "");
}

function verdict(right, action, person, note) {
  return {
    right,
    action,
    title: right ? TITLE[action] : "Uma ocorrência foi aberta",
    stamp: right ? STAMP[action] : "OCORRÊNCIA",
    text: note || person.why,
    minutes: COST[action] ?? 4,
  };
}
