/* As conversas da mesa.

   Cada pergunta é uma entrada deste objeto. Para criar uma pergunta nova basta
   acrescentar uma chave aqui — nenhum outro arquivo precisa ser mexido.

   | campo      | o que é                                                        |
   | ---------- | -------------------------------------------------------------- |
   | `label`    | o que aparece no botão da mesa                                  |
   | `fala`     | o que a mesa diz em voz alta (o padrão é o próprio `label`)     |
   | `resposta` | o que a pessoa responde (veja abaixo as três formas)            |
   | `marca`    | o que fica registrado no atendimento — hoje só `asked` importa  |
   | `abre`     | perguntas que passam a existir depois desta                     |
   | `quando`   | `(pessoa, caso) => bool`, para a pergunta só existir às vezes   |
   | `fica`     | `true` se a pergunta continuar na lista depois de feita         |

   Todo texto é um par `{ pt, en }` — as duas línguas lado a lado, como no
   resto do jogo (veja [i18n.js](../i18n.js)).

   A `resposta` aceita três formas, da mais simples para a mais completa:

   1. **par**: `resposta: { pt: "Sempre votei aqui.", en: "I've always voted here." }`
   2. **por arquétipo**: `resposta: { padrao: <par>, ja_votou: <par>, … }`
      — a chave é o `kind` da pessoa (veja `KINDS` em [shift.js](./shift.js)),
      e `padrao` vale para todos os outros casos.
   3. **função**: `resposta: (pessoa) => ({ pt: …, en: … })`

   `abre` é o que permite encadear: uma pergunta destrava outra, e é só isso que
   um fluxo de conversa precisa ser. */

import { t } from "../i18n.js";

export const PERGUNTAS = {
  /* --------------------------------------------------------- identidade -- */
  dados: {
    label: { pt: "Confirmar os dados", en: "Confirm the details" },
    fala: {
      pt: "Me confirma seu nome completo e a data de nascimento?",
      en: "Could you confirm your full name and date of birth?",
    },
    resposta: (p) => ({
      pt: `${p.doc.name}. Nasci em ${p.says.birth}.`,
      en: `${p.doc.name}. Born on ${p.says.birth}.`,
    }),
    marca: "asked",
    abre: ["insistir"],
  },

  insistir: {
    label: { pt: "Insistir: e o nome da mãe?", en: "Press further: your mother's name?" },
    fala: { pt: "E o nome da sua mãe, a senhora lembra?", en: "And your mother's name, do you remember it?" },
    resposta: {
      padrao: {
        pt: "Claro. É o mesmo que está no meu documento, pode conferir.",
        en: "Of course. It's the same one on my document, go ahead and check.",
      },
      duvida_juiz: {
        pt: "Ih... agora me embananei. Isso é pergunta que se faça?",
        en: "Oh... now I'm all tangled up. Is that a fair thing to ask?",
      },
      duvida_ok: {
        pt: "Lembro sim, e o do meu pai também, se quiser.",
        en: "I do, and my father's too, if you like.",
      },
    },
  },

  ano: {
    label: { pt: "Perguntar o ano de nascimento", en: "Ask for the year of birth" },
    fala: { pt: "Em que ano a senhora nasceu?", en: "What year were you born?" },
    resposta: (p) => ({ pt: `Nasci em ${p.says.year}.`, en: `I was born in ${p.says.year}.` }),
    quando: (_p, c) => c.step === "ano",
    fica: true,
  },

  /* ------------------------------------------------------------- seção --- */
  secao: {
    label: { pt: "Sempre votou nesta seção?", en: "Have you always voted in this section?" },
    resposta: {
      padrao: { pt: "Sempre. Faz anos que é nesta sala.", en: "Always. It's been this room for years." },
      outra_secao: {
        pt: "Sempre votei nessa sala. Não tem como minha seção ser outra.",
        en: "I've always voted in this room. There's no way my section is another one.",
      },
      justifica: {
        pt: "Não, eu voto em outro município. Só estou de passagem.",
        en: "No, I vote in another town. I'm only passing through.",
      },
      fora_caderno: {
        pt: "Votei, sim. Mas mudei de endereço faz pouco tempo.",
        en: "I have, yes. But I changed address not long ago.",
      },
      sem_foto: { pt: "É a primeira vez que voto.", en: "This is my first time voting." },
    },
  },

  documento: {
    label: { pt: "Trouxe outro documento?", en: "Did you bring another document?" },
    resposta: {
      padrao: { pt: "Só esse mesmo. Nunca precisei de outro.", en: "Just this one. I've never needed another." },
      sem_foto: {
        pt: "Não... esse é o único que eu tenho. Não serve?",
        en: "No... this is the only one I have. Doesn't it work?",
      },
      digital: {
        pt: "Está tudo no aplicativo. O de papel eu nem trago mais.",
        en: "It's all in the app. I don't even carry the paper one anymore.",
      },
      ilegivel: {
        pt: "Tenho, mas está em casa. Esse aqui dá para ler ainda, dá?",
        en: "I do, but it's at home. This one is still readable, isn't it?",
      },
    },
  },

  /* --------------------------------------------------------- a situação -- */
  situacao: {
    label: { pt: "Sabe por que consta essa situação?", en: "Do you know why this status is showing?" },
    fala: {
      pt: "O terminal mostra uma pendência no seu cadastro. A senhora sabe de quê?",
      en: "The terminal shows a problem on your record. Do you know what it's about?",
    },
    quando: (p) => ["impedido", "ja_votou", "fora_caderno"].includes(p.kind),
    resposta: {
      padrao: { pt: "Não faço ideia. Nunca tive problema nenhum.", en: "No idea. I've never had any trouble." },
      impedido: {
        pt: "Deve ser engano. Faz tempo que eu resolvi aquilo, juro.",
        en: "It must be a mistake. I sorted that out ages ago, I swear.",
      },
      ja_votou: {
        pt: "Votei? Eu não votei ainda hoje. Deve ter dado erro aí.",
        en: "I voted? I haven't voted today. Something must have glitched there.",
      },
      fora_caderno: {
        pt: "Não achei meu nome no cartaz lá fora também. Estranho, né?",
        en: "I couldn't find my name on the notice outside either. Odd, isn't it?",
      },
    },
    abre: ["cartorio"],
  },

  cartorio: {
    label: { pt: "Explicar que precisa ir ao cartório", en: "Explain the trip to the electoral office" },
    fala: {
      pt: "A senhora vai precisar resolver isso no cartório eleitoral.",
      en: "You'll have to sort this out at the electoral office.",
    },
    resposta: {
      padrao: { pt: "Tá bom. E dá tempo de voltar hoje?", en: "All right. Is there time to come back today?" },
      impedido: { pt: "Poxa. Eu vim de longe só para isso.", en: "Ah, come on. I came a long way just for this." },
    },
  },

  /* ------------------------------------------------------- preferência -- */
  preferencia: {
    label: { pt: "Confirmar a preferência", en: "Confirm the priority" },
    fala: {
      pt: "A senhora tem preferência para votar. Qual é o caso?",
      en: "You have priority to vote. What's the reason?",
    },
    quando: (p) => p.priority,
    resposta: (p) => ({
      pt: `${t(p.preference)}. Foi por isso que me chamaram na frente.`,
      en: `${t(p.preference)}. That's why they called me ahead of the others.`,
    }),
  },

  /* ----------------------------------------------------------- a espera -- */
  espera: {
    label: { pt: "Esperou muito?", en: "Did you wait long?" },
    resposta: {
      padrao: { pt: "Um pouquinho, mas está tranquilo.", en: "A little, but it's fine." },
      ja_votou: {
        pt: "Bastante, e ainda tenho que passar no trabalho.",
        en: "Quite a while, and I still have to stop by work.",
      },
      desistiu: {
        pt: "Esperei. E olha que eu ainda tenho compromisso.",
        en: "I did. And I've still got somewhere to be.",
      },
      embriagado: { pt: "Nem vi o tempo passar, moço.", en: "Didn't even notice the time, pal." },
    },
  },
};

/* As perguntas que já estão à mão quando a pessoa senta. O resto aparece pelo
   `abre` de outra pergunta ou pelo `quando`. */
export const ABERTAS = ["dados", "ano", "secao", "documento", "situacao", "preferencia", "espera"];

// Um par de idiomas, e não um mapa de arquétipos.
const par = (valor) => valor && typeof valor === "object" && ("pt" in valor || "en" in valor);

/* Resolve a resposta nas três formas aceitas, já no idioma de agora: o que vai
   para a conversa é texto, porque a conversa é registro do que foi dito. */
export function responder(pergunta, person) {
  const r = pergunta.resposta;
  const escolhida = typeof r === "function" ? r(person) : par(r) ? r : (r?.[person.kind] ?? r?.padrao);
  return t(escolhida) ?? "…";
}

/* As perguntas disponíveis agora: as abertas mais as destravadas, menos as que
   já foram feitas e não ficam. */
export function disponiveis(person, c) {
  const abertas = new Set([...ABERTAS, ...(c.aberto ?? [])]);
  return [...abertas].filter((id) => {
    const q = PERGUNTAS[id];
    if (!q) return false;
    if (q.quando && !q.quando(person, c)) return false;
    return q.fica || !(c.perguntadas ?? []).includes(id);
  });
}
