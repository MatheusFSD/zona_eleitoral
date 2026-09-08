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

   A `resposta` aceita três formas, da mais simples para a mais completa:

   1. **texto**: `resposta: "Sempre votei aqui."`
   2. **por arquétipo**: `resposta: { padrao: "...", ja_votou: "...", … }`
      — a chave é o `kind` da pessoa (veja `KINDS` em [shift.js](./shift.js)),
      e `padrao` vale para todos os outros casos.
   3. **função**: `resposta: (pessoa) => \`Nasci em \${pessoa.says.birth}.\``

   `abre` é o que permite encadear: uma pergunta destrava outra, e é só isso que
   um fluxo de conversa precisa ser. */

export const PERGUNTAS = {
  /* --------------------------------------------------------- identidade -- */
  dados: {
    label: "Confirmar os dados",
    fala: "Me confirma seu nome completo e a data de nascimento?",
    resposta: (p) => `${p.doc.name}. Nasci em ${p.says.birth}.`,
    marca: "asked",
    abre: ["insistir"],
  },

  insistir: {
    label: "Insistir: e o nome da mãe?",
    fala: "E o nome da sua mãe, a senhora lembra?",
    resposta: {
      padrao: "Claro. É o mesmo que está no meu documento, pode conferir.",
      duvida_juiz: "Ih... agora me embananei. Isso é pergunta que se faça?",
      duvida_ok: "Lembro sim, e o do meu pai também, se quiser.",
    },
  },

  ano: {
    label: "Perguntar o ano de nascimento",
    fala: "Em que ano a senhora nasceu?",
    resposta: (p) => `Nasci em ${p.says.year}.`,
    quando: (_p, c) => c.step === "ano",
    fica: true,
  },

  /* ------------------------------------------------------------- seção --- */
  secao: {
    label: "Sempre votou nesta seção?",
    resposta: {
      padrao: "Sempre. Faz anos que é nesta sala.",
      outra_secao: "Sempre votei nessa sala. Não tem como minha seção ser outra.",
      justifica: "Não, eu voto em outro município. Só estou de passagem.",
      fora_caderno: "Votei, sim. Mas mudei de endereço faz pouco tempo.",
      sem_foto: "É a primeira vez que voto.",
    },
  },

  documento: {
    label: "Trouxe outro documento?",
    resposta: {
      padrao: "Só esse mesmo. Nunca precisei de outro.",
      sem_foto: "Não... esse é o único que eu tenho. Não serve?",
      digital: "Está tudo no aplicativo. O de papel eu nem trago mais.",
      ilegivel: "Tenho, mas está em casa. Esse aqui dá para ler ainda, dá?",
    },
  },

  /* --------------------------------------------------------- a situação -- */
  situacao: {
    label: "Sabe por que consta essa situação?",
    fala: "O terminal mostra uma pendência no seu cadastro. A senhora sabe de quê?",
    quando: (p) => ["impedido", "ja_votou", "fora_caderno"].includes(p.kind),
    resposta: {
      padrao: "Não faço ideia. Nunca tive problema nenhum.",
      impedido: "Deve ser engano. Faz tempo que eu resolvi aquilo, juro.",
      ja_votou: "Votei? Eu não votei ainda hoje. Deve ter dado erro aí.",
      fora_caderno: "Não achei meu nome no cartaz lá fora também. Estranho, né?",
    },
    abre: ["cartorio"],
  },

  cartorio: {
    label: "Explicar que precisa ir ao cartório",
    fala: "A senhora vai precisar resolver isso no cartório eleitoral.",
    resposta: {
      padrao: "Tá bom. E dá tempo de voltar hoje?",
      impedido: "Poxa. Eu vim de longe só para isso.",
    },
  },

  /* ------------------------------------------------------- preferência -- */
  preferencia: {
    label: "Confirmar a preferência",
    fala: "A senhora tem preferência para votar. Qual é o caso?",
    quando: (p) => p.priority,
    resposta: (p) => `${p.preference}. Foi por isso que me chamaram na frente.`,
  },

  /* ----------------------------------------------------------- a espera -- */
  espera: {
    label: "Esperou muito?",
    resposta: {
      padrao: "Um pouquinho, mas está tranquilo.",
      ja_votou: "Bastante, e ainda tenho que passar no trabalho.",
      desistiu: "Esperei. E olha que eu ainda tenho compromisso.",
      embriagado: "Nem vi o tempo passar, moço.",
    },
  },
};

/* As perguntas que já estão à mão quando a pessoa senta. O resto aparece pelo
   `abre` de outra pergunta ou pelo `quando`. */
export const ABERTAS = ["dados", "ano", "secao", "documento", "situacao", "preferencia", "espera"];

/* Resolve a resposta nas três formas aceitas. */
export function responder(pergunta, person) {
  const r = pergunta.resposta;
  if (typeof r === "function") return r(person);
  if (typeof r === "string") return r;
  return r?.[person.kind] ?? r?.padrao ?? "…";
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
