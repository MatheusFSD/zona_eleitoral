import { t } from "./i18n.js";

/* O atendimento, passo a passo.

   Um caso é uma pequena máquina de estados: terminal, caderno, biometria,
   cabina e entrega, nessa ordem. Cada peça da mesa só responde na
   sua vez — mexer fora de hora não abre ocorrência, só é recusado com um
   aviso, porque errar a ordem é diferente de errar a decisão.

   `decisao` é o estado sem próximo passo: o caso saiu do trilho e só uma das
   ações da mesa fecha o atendimento. */

export const STEP = {
  terminal: {
    pt: "Digite no terminal a identificação do documento.",
    en: "Type the document number into the terminal.",
  },
  caderno: {
    pt: "Ache na folha o nome que está no terminal.",
    en: "Find the name from the terminal on the sheet.",
  },
  biometria: {
    pt: "Encaixe o indicador no leitor e segure a mão por 3 segundos.",
    en: "Set the index finger on the reader and hold the hand for 3 seconds.",
  },
  ano: {
    pt: "Pergunte o ano de nascimento e digite no terminal.",
    en: "Ask for the year of birth and type it into the terminal.",
  },
  assinatura: { pt: "A pessoa assina o caderno.", en: "The voter signs the register." },
  cabina: {
    pt: "A pessoa deixou as coisas na carteira e foi votar.",
    en: "The voter left their things on the desk and went to vote.",
  },
  entrega: {
    pt: "Devolva os pertences, o documento e o comprovante — arraste para a pessoa.",
    en: "Hand back belongings, document and receipt — drag them to the voter.",
  },
  decisao: {
    pt: "Este caso não se resolve no trilho: escolha uma saída.",
    en: "This case will not resolve on the rails: pick an action.",
  },
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
  terminal: {
    pt: "O terminal vem primeiro: sem registro na tela, não dá para seguir.",
    en: "The terminal comes first: with no record on screen, there is no going on.",
  },
  caderno: { pt: "Antes, ache o nome na folha do caderno.", en: "First, find the name on the register sheet." },
  biometria: { pt: "Falta a digital no leitor.", en: "The fingerprint on the reader is still missing." },
  ano: { pt: "O terminal está esperando o ano de nascimento.", en: "The terminal is waiting for the year of birth." },
  assinatura: {
    pt: "Falta a assinatura da pessoa no caderno.",
    en: "The voter's signature is still missing from the register.",
  },
  cabina: { pt: "A pessoa está na cabina. Espere.", en: "The voter is in the booth. Wait." },
  entrega: { pt: "Falta devolver o que é da pessoa.", en: "There is still something of theirs to hand back." },
  decisao: {
    pt: "Este caso já saiu do trilho: use uma das ações da mesa.",
    en: "This case is already off the rails: use one of the table actions.",
  },
  fallback: { pt: "Ainda não é a hora disso.", en: "Not the moment for that yet." },
};

export function allowed(step, piece) {
  return (OWNER[step] ?? []).includes(piece);
}

export function refusal(step) {
  return t(REFUSAL[step] ?? REFUSAL.fallback);
}

/* ------------------------------------------------------------- o veredito -- */

const TITLE = {
  fluxo: { pt: "Pessoa habilitada e comprovante entregue", en: "Voter cleared and receipt handed over" },
  encaminhar: { pt: "Encaminhamento correto", en: "Sent on, correctly" },
  justificar: { pt: "Justificativa registrada", en: "Absence filed" },
  juiz: { pt: "Juiz chamado à seção", en: "Judge called to the section" },
  suspender: { pt: "Votação suspensa", en: "Vote suspended" },
  erro: { pt: "Uma ocorrência foi aberta", en: "An incident was opened" },
};

const STAMP = {
  fluxo: { pt: "HABILITADO", en: "CLEARED" },
  encaminhar: { pt: "ENCAMINHADO", en: "SENT ON" },
  justificar: { pt: "JUSTIFICADO", en: "ABSENCE FILED" },
  juiz: { pt: "AGUARDA O JUIZ", en: "AWAITING THE JUDGE" },
  suspender: { pt: "SUSPENSO", en: "SUSPENDED" },
  erro: { pt: "OCORRÊNCIA", en: "INCIDENT" },
};

const MISSED = {
  terminal: {
    pt: "Você decidiu sem carregar o registro no terminal.",
    en: "You decided without loading the record on the terminal.",
  },
  ask: {
    pt: "Faltou perguntar os dados à pessoa antes de decidir.",
    en: "You skipped asking the voter for their details before deciding.",
  },
  list: {
    pt: "Faltou consultar a listagem de impedidos: o nome estava lá.",
    en: "You skipped the barred voters sheet: the name was on it.",
  },
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

/* O veredito sai em texto, no idioma de agora: ele é registro do atendimento —
   vai para a tela de retorno e para o jogo salvo. */
function verdict(right, action, person, note) {
  return {
    right,
    action,
    title: t(right ? TITLE[action] : TITLE.erro),
    stamp: t(right ? STAMP[action] : STAMP.erro),
    text: t(note || person.why),
    minutes: COST[action] ?? 4,
  };
}
