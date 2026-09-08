/* Eleitores procedurais.

   O turno é sorteado inteiro: doze pessoas com nome, documento, cadastro,
   biometria, folha de caderno e fala montados na hora. O que não é sorteado é
   a *forma* do dia — a mistura de casos que se resolvem no trilho e de casos
   que fogem dele, e a ordem em que a dificuldade sobe.

   Cada pessoa nasce de um arquétipo (`KINDS`): ele decide o que o terminal
   mostra, se o nome está na folha, o que a digital faz nas quatro tentativas e
   qual é a saída certa. O resto — quem é, o que apresenta, o que diz — é
   sorteado em volta dele.

   Tudo sai de uma semente de texto. `?turno=xyz` na URL repete um dia inteiro,
   pessoa por pessoa, na mesma ordem. */

import { dice, seed, stream } from "../random.js";

export const SECTION = "127";
export const CITY = "MONTE ALEGRE";
const YEAR = 2026; // ano da eleição deste protótipo

const pad = (n, len = 2) => String(n).padStart(len, "0");

/* ---------------------------------------------------------------- nomes --- */

const FIRST = {
  m: ["Antônio", "Augusto", "Carlos", "Cláudio", "Dirceu", "Edmilson", "Everaldo", "Fábio", "Gilberto", "Jorge", "Josué", "Luan", "Marcelo", "Nilson", "Otávio", "Paulo", "Rafael", "Reginaldo", "Ronaldo", "Sebastião", "Tiago", "Valdir", "Wesley", "Élcio"],
  f: ["Adriana", "Ana", "Bianca", "Célia", "Cleusa", "Denise", "Elaine", "Fátima", "Helena", "Ivone", "Jéssica", "Kátia", "Lourdes", "Marina", "Neide", "Patrícia", "Rosana", "Sandra", "Simone", "Tereza", "Vanda", "Zilda"],
};
const MIDDLE = {
  m: ["César", "Eduardo", "Henrique", "Luiz", "Antônio", "Roberto", "Vinícius"],
  f: ["Luiza", "Aparecida", "Cristina", "Regina", "Beatriz", "Cláudia"],
};
const SUR = ["Almeida", "Alves", "Barbosa", "Batista", "Campos", "Cardoso", "da Silva", "dos Santos", "Dias", "Esteves", "Ferreira", "Fonseca", "Gomes", "Leite", "Lima", "Machado", "Martins", "Melo", "Monteiro", "Moreira", "Nogueira", "Nunes", "Oliveira", "Peixoto", "Pereira", "Prado", "Queiroz", "Ramos", "Ribeiro", "Teixeira", "Vieira", "Xavier"];

const slug = (text) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* ------------------------------------------------------------ arquétipos --- */

/* `resolve` é a saída certa:

   - `fluxo`       terminal, caderno, biometria, pertences, voto e comprovante
   - `encaminhar`  não habilita; a pessoa procura o cartório
   - `justificar`  não vota aqui; registra a justificativa
   - `juiz`        a dúvida de identidade não se resolveu na mesa
   - `suspender`   foi habilitada, foi à cabina e não votou

   `needs` são as etapas que a mesa precisa ter feito antes de decidir: `ask`
   é perguntar os dados à pessoa, `list` é consultar a listagem de impedidos.

   `hard` só ordena o dia: os casos claros de manhã, as exceções à tarde. */
const KINDS = {
  comum: { group: "fluxo", hard: 0, resolve: "fluxo", bio: ["ok"], status: "REGULAR" },
  digital: { group: "fluxo", hard: 1, resolve: "fluxo", bio: ["ok"], status: "REGULAR", doc: "digital" },
  prioridade: { group: "fluxo", hard: 1, resolve: "fluxo", bio: ["ok"], status: "REGULAR · PRIORIDADE", age: "old" },
  retry: { group: "fluxo", hard: 2, resolve: "fluxo", bio: ["fail", "ok"], status: "REGULAR" },
  biografica: {
    group: "fluxo",
    hard: 3,
    resolve: "fluxo",
    bio: ["fail", "fail", "fail", "fail"],
    status: "REGULAR",
    year: "ok",
  },
  duvida_ok: {
    group: "fluxo",
    hard: 3,
    resolve: "fluxo",
    bio: ["ok"],
    status: "FOTO DUVIDOSA",
    needs: { ask: true },
    answer: "ok",
    typo: true,
  },

  ja_votou: { group: "encaminhar", hard: 1, resolve: "encaminhar", bio: ["ok"], status: "JÁ VOTOU" },
  outra_secao: { group: "encaminhar", hard: 1, resolve: "encaminhar", bio: ["ok"], status: "LOCAL DIVERGENTE" },
  impedido: { group: "encaminhar", hard: 2, resolve: "encaminhar", bio: ["ok"], status: "CADASTRO IMPEDIDO" },
  sem_foto: { group: "encaminhar", hard: 2, resolve: "encaminhar", bio: ["ok"], status: "REGULAR", doc: "certidao", age: "young" },
  embriagado: { group: "encaminhar", hard: 2, resolve: "encaminhar", bio: ["ok"], status: "REGULAR", drunk: true },
  ano_errado: {
    group: "encaminhar",
    hard: 3,
    resolve: "encaminhar",
    bio: ["fail", "fail", "fail", "fail"],
    status: "REGULAR",
    year: "erro",
  },
  fora_caderno: {
    group: "encaminhar",
    hard: 3,
    resolve: "encaminhar",
    bio: ["ok"],
    status: "SEM REGISTRO NA SEÇÃO",
    ledger: false,
    needs: { list: true },
  },

  justifica: {
    group: "excecao",
    hard: 2,
    resolve: "justificar",
    bio: ["ok"],
    status: "OUTRO MUNICÍPIO",
    ledger: false,
    other: true,
  },
  duvida_juiz: {
    group: "excecao",
    hard: 3,
    resolve: "juiz",
    bio: ["ok"],
    status: "FOTO DUVIDOSA",
    needs: { ask: true },
    answer: "erro",
    typo: true,
  },
  desistiu: { group: "excecao", hard: 3, resolve: "suspender", bio: ["ok"], status: "REGULAR", quits: true },
};

/* Falas e etiquetas servem para qualquer pessoa: o sexo do sorteio só decide
   nome, cabelo e barba, então nada aqui pode ter gênero preso. */
const TAGS = {
  comum: ["Chegou com o documento na mão", "Fila comum", "Cumprimenta e espera", "Não parece com pressa"],
  digital: ["Celular na mão", "Documento no aplicativo", "Mostra a tela antes de pedirem"],
  prioridade: ["Atendimento prioritário", "Veio com a vizinha até a porta", "Entrou devagar, com a bengala"],
  retry: ["Mão fria da rua", "Esfrega o dedo antes de encostar", "Diz que o leitor é implicante"],
  biografica: ["Trabalha com as mãos", "Já avisa que vai dar trabalho", "A digital some no fim do dia"],
  duvida_ok: ["A foto não parece com ela", "Insiste que é erro de digitação", "Aponta a própria foto"],
  ja_votou: ["Chegou olhando o relógio", "Fala rápido, de olho na porta", "Diz que só falta assinar"],
  outra_secao: ["Diz votar nesta sala há anos", "Entrou direto, sem olhar o cartaz", "Tem certeza do lugar"],
  impedido: ["Fala baixo e evita contato", "Responde antes da pergunta terminar", "Olha para o terminal, não para você"],
  sem_foto: ["Primeira votação", "Veio com a mãe até a porta", "Segura o papel dobrado ao meio"],
  embriagado: ["Apoia-se na mesa para não cair", "Fala alto e arrasta as palavras", "Cheiro forte, olhar perdido"],
  ano_errado: ["Não lembra bem as datas", "Titubeia quando perguntam", "Diz que nunca deu certo"],
  fora_caderno: ["Não achou o nome no cartaz da porta", "Diz que mudou de endereço", "Trouxe o comprovante de outra vez"],
  justifica: ["Está de passagem pela cidade", "Trabalha em outro município", "Chegou de viagem hoje"],
  duvida_juiz: ["A fila começa a reclamar", "Some com o documento na mão", "Responde devagar demais"],
  desistiu: ["Olha muito para o relógio", "Recebeu uma ligação na fila", "Parece querer ir embora"],
};

const LINES = {
  comum: [
    "Bom dia. É aqui mesmo, né? Prometo que não demoro.",
    "Documento aqui, ó. Pode conferir com calma.",
    "Boa tarde. Primeira vez que voto sem fila na rua.",
    "Cheguei cedo justamente para não pegar movimento.",
  ],
  digital: [
    "Meu documento está no aplicativo oficial. Depois eu já guardo o celular.",
    "Está aqui na tela — é o aplicativo do governo mesmo, pode olhar.",
    "Eu não trago mais o de papel. Vale esse aqui, né?",
  ],
  prioridade: [
    "Essa foto é do tempo em que meu cabelo ainda obedecia.",
    "Me disseram que eu passo na frente. Não quero atrapalhar ninguém.",
    "Voto nessa escola desde antes de você nascer.",
  ],
  retry: [
    "Minha mão está gelada da rua. Deixa eu esfregar aqui primeiro.",
    "Sempre pega na segunda. Não se assuste se der errado agora.",
    "Esse leitor implica comigo. Tenta de novo que vai.",
  ],
  biografica: [
    "Minha digital nunca pega. Pode tentar, mas vai dar trabalho.",
    "Trabalho com massa o dia inteiro. Não sobra digital nenhuma.",
    "No banco também não pega. Já é assim faz anos.",
  ],
  duvida_ok: [
    "Eu sei que a foto está velha, mas sou eu. Pode perguntar o que quiser.",
    "Erraram meu nome na hora de digitar. Isso não pode travar tudo.",
    "É só uma letra. Você está vendo que sou eu.",
  ],
  ja_votou: [
    "Tem como agilizar? Eu deixei o carro num lugar meio complicado.",
    "Eu só preciso assinar e ir embora, já está quase tudo feito.",
    "Rapidinho, por favor. Estou em cima da hora no trabalho.",
  ],
  outra_secao: [
    "Sempre votei nessa sala. Não tem como minha seção ser outra.",
    "Mudei de casa, mas continuo votando aqui. Sempre foi aqui.",
    "Olha, o cartaz lá fora não diz nada. Eu entrei na primeira porta.",
  ],
  impedido: [
    "Só preciso votar e ir embora. Está tudo aí no sistema.",
    "Deve estar tudo certo. Faz tempo que eu resolvi aquilo.",
    "Se aparecer alguma coisa na tela, é engano. Pode liberar.",
  ],
  sem_foto: [
    "Eu trouxe o documento, mas ele não tem foto. Serve mesmo assim?",
    "É a primeira vez que voto. Minha mãe disse que era só levar isso.",
    "Só tenho esse papel. Ninguém falou que precisava de foto.",
  ],
  embriagado: [
    "Eu tô ótimo, moço. Foi só uma cervejinha no almoço.",
    "Deixa eu votar rapidinho que eu já saio, tá?",
    "Não precisa disso tudo. Eu sei votar de olho fechado.",
  ],
  ano_errado: [
    "Nasci em... deixa eu ver. Sempre me atrapalho com isso.",
    "Essa data aí nunca bateu com a minha. Vive dando problema.",
    "Ano de nascimento? Ih, eu sempre erro na hora de falar.",
  ],
  fora_caderno: [
    "Procurei meu nome no cartaz lá fora e não achei.",
    "Mudei de endereço faz pouco tempo. Será que é por isso?",
    "Eu votei aqui na outra eleição, tenho certeza.",
  ],
  justifica: [
    "Eu não voto aqui, estou de passagem. Dá para justificar?",
    "Vim trabalhar nessa cidade e não deu para voltar.",
    "Meu título é de outro município. Vim resolver isso aqui.",
  ],
  duvida_juiz: [
    "Sou eu, claro que sou eu. Não precisa ficar olhando tanto.",
    "Essa foto está ruim, mas todo mundo me reconhece.",
    "Perguntar o quê? Eu não decorei esses dados de cabeça.",
  ],
  desistiu: [
    "Se demorar muito eu vou ter que voltar depois, viu?",
    "Estou com pouco tempo, mas vamos lá.",
    "Deixa eu ver se dá tempo. Estou esperando uma ligação.",
  ],
};

const WHY = {
  comum: "Documento e cadastro coincidem e a biometria confirmou: o atendimento era só seguir a ordem.",
  digital: "A versão digital oficial é aceita pelas regras do protótipo, e a biometria confirmou a identidade.",
  prioridade: "Apesar da foto antiga, os dados e a biometria confirmaram a identidade.",
  retry: "A primeira leitura falhou, mas a segunda confirmou. O manual pede exatamente isso antes de habilitar.",
  biografica:
    "Esgotadas as quatro tentativas, o ano de nascimento conferiu com o cadastro. Nesse caminho a pessoa assina o caderno antes de votar.",
  duvida_ok: "As perguntas confirmaram a identidade. Com a dúvida desfeita, a habilitação era o caminho.",
  ja_votou: "O terminal já registrava comparecimento. O caso precisava ser encaminhado, não habilitado de novo.",
  outra_secao: (p) => `O cadastro indica a seção ${p.reg.section}. A mesa ${SECTION} não deve habilitar essa pessoa.`,
  impedido: "A situação no terminal impedia a habilitação. Era necessário encaminhar para orientação.",
  sem_foto: "Neste protótipo, a identificação exige documento oficial com foto. Certidão não serve.",
  embriagado:
    "Sem condições de votar, a saída era conduzir com educação para fora e pedir que voltasse mais tarde — não habilitar.",
  ano_errado:
    "Nem a digital nem o ano de nascimento habilitaram. A pessoa não vota: procura o cartório e pode voltar até as 17h.",
  fora_caderno:
    "Sem registro na seção e com o nome na listagem de impedidos, restava encaminhar — depois de consultar a listagem.",
  justifica: (p) => `O título é de ${p.reg.city}. Aqui a pessoa não vota: justifica a ausência.`,
  duvida_juiz:
    "As perguntas não desfizeram a dúvida. A mesa não decide identidade sozinha: chama o juiz e a fila continua andando.",
  desistiu:
    "A pessoa foi habilitada, entrou na cabina e saiu sem votar. Esse voto precisa ser suspenso para a urna liberar a próxima pessoa.",
};

/* ------------------------------------------------------------ documentos --- */

/* Quem passa na frente na fila. A idade vem do caso; o resto é sorteado, e é
   por isso que a preferência aparece em qualquer arquétipo — na porta da seção
   ela não tem nada a ver com o documento que a pessoa traz. */
const PREFERENCE = [
  "com criança de colo",
  "pessoa com deficiência",
  "mobilidade reduzida",
  "doou sangue há menos de 120 dias",
];

const OTHER_SECTIONS = ["088", "119", "126", "128", "131", "203"];
const OTHER_CITIES = ["SANTA RITA", "PORTO NOVO", "VILA CAMPINAS", "SÃO BENTO", "ARARA VERDE"];

function documents(d) {
  const rg = () => `${pad(d.int(3, 49))}.${d.int(100, 999)}.${d.int(100, 999)}-${d.int(0, 9)}`;
  const cnh = () => `${d.int(10000000, 99999999)}${d.int(0, 9)}-${d.int(0, 9)}`;
  const cpf = () => `${d.int(100, 999)}.${d.int(100, 999)}.${d.int(100, 999)}-${d.int(0, 9)}`;

  return {
    identidade: { art: "identidade", type: "Carteira de identidade", note: "Documento com foto", photo: "FOTO COMPATÍVEL", number: rg },
    antiga: { art: "identidade", type: "Carteira de identidade", note: "Documento antigo com foto", photo: "FOTO ANTIGA", number: rg },
    habilitacao: { art: "habilitacao", type: "Carteira de motorista", note: "Documento com foto", photo: "FOTO COMPATÍVEL", number: cnh },
    profissional: { art: "profissional", type: "Carteira profissional", note: "Documento com foto", photo: "FOTO COMPATÍVEL", number: cpf },
    digital: { art: "digital", type: "Identidade digital oficial", note: "Aplicativo oficial", photo: "TELA OFICIAL", number: rg },
    certidao: {
      art: "certidao",
      type: "Certidão de nascimento",
      note: "Documento sem foto",
      photo: "SEM FOTO",
      number: () => `${d.int(100000, 999999)} · Livro ${d.pick(["A", "B", "C"])}`,
    },
  };
}

/* --------------------------------------------------------------- caderno --- */

const LEDGER_FIRST = ["ANTONIO", "CLEUSA", "DENISE", "EDMILSON", "FÁTIMA", "GILBERTO", "HELENA", "JOSUÉ", "KÁTIA", "LOURDES", "NILSON", "ROSANA", "SEBASTIÃO", "VALDIR", "WANDA", "ODETE", "JAIME", "SILAS"];
const LEDGER_LAST = ["ALMEIDA", "BATISTA", "CARDOSO", "DA SILVA", "ESTEVES", "FONSECA", "GOMES", "LEITE", "MACHADO", "NUNES", "PEIXOTO", "QUEIROZ", "RAMOS", "TEIXEIRA", "XAVIER", "BORGES", "AMARAL"];

/* A folha do caderno é uma só, do turno inteiro: as doze pessoas da seção
   entram nela junto com os nomes de quem não vai aparecer hoje, tudo em ordem
   alfabética, com numeração sequencial. É a mesma folha da primeira à última
   pessoa — o que muda ao longo do dia são as assinaturas que ficam. */
function buildLedger(d, people) {
  const base = d.int(40, 200);
  const dentro = people.filter((x) => x.inLedger);
  const total = dentro.length + d.int(9, 13);

  const livres = Array.from({ length: total }, (_, i) => i);
  for (let i = livres.length - 1; i > 0; i -= 1) {
    const j = Math.floor(d.rnd() * (i + 1));
    [livres[i], livres[j]] = [livres[j], livres[i]];
  }
  const meus = new Map();
  dentro.forEach((person, i) => meus.set(livres[i], person));

  const rows = [];
  for (let i = 0; i < total; i += 1) {
    const seq = pad(base + i, 3);
    const person = meus.get(i);
    if (person) {
      person.seq = seq;
      rows.push({ seq, name: person.reg.name, birth: person.reg.birth });
      continue;
    }
    const day = d.int(1, 28);
    const month = d.int(1, 12);
    rows.push({
      seq,
      name: `${d.pick(LEDGER_FIRST)} ${d.pick(LEDGER_LAST)}`,
      birth: `${pad(day)}/${pad(month)}/${YEAR - d.int(18, 78)}`,
    });
  }
  const owners = new Map(dentro.map(person => [person.seq, person]));
  rows.sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
  rows.forEach((row, index) => {
    const person = owners.get(row.seq);
    row.seq = pad(base + index, 3);
    if (person) person.seq = row.seq;
  });
  return rows;
}

/* ------------------------------------------------------------- o sorteio --- */

/* Cinco casos que se resolvem no trilho, quatro que terminam em encaminhar e
   três exceções, com um caso de folga pendendo para algum lado. Dentro do
   grupo, sortear um arquétipo derruba o peso dele: repetição existe, mas é
   rara. */
function plan(d, count) {
  const groups = ["fluxo", "encaminhar", "excecao"];
  const quota = { fluxo: Math.round(count * 0.42), encaminhar: Math.round(count * 0.33), excecao: 0 };
  quota.excecao = count - quota.fluxo - quota.encaminhar;

  const gain = d.pick(groups);
  const lose = d.pick(groups.filter((g) => g !== gain));
  if (quota[lose] > 2) {
    quota[gain] += 1;
    quota[lose] -= 1;
  }

  const drawn = [];
  for (const group of groups) {
    const bag = Object.keys(KINDS).filter((k) => KINDS[k].group === group);
    const weight = new Map(bag.map((k) => [k, 1]));
    for (let i = 0; i < quota[group]; i += 1) {
      const total = [...weight.values()].reduce((a, b) => a + b, 0);
      let r = d.rnd() * total;
      let chosen = bag[bag.length - 1];
      for (const [k, v] of weight) {
        r -= v;
        if (r <= 0) {
          chosen = k;
          break;
        }
      }
      drawn.push(chosen);
      weight.set(chosen, weight.get(chosen) * 0.16);
    }
  }

  const order = drawn
    .map((kind) => ({ kind, rank: KINDS[kind].hard + d.rnd() * 1.4 }))
    .sort((a, b) => a.rank - b.rank)
    .map((x) => x.kind);

  /* Dois casos iguais colados leem como bug, não como acaso: o segundo troca
     de lugar com o vizinho seguinte que for diferente. */
  for (let i = 1; i < order.length; i += 1) {
    if (order[i] !== order[i - 1]) continue;
    const swap = order.findIndex(
      (kind, j) => j > i && kind !== order[i - 1] && order[j - 1] !== order[i] && order[j + 1] !== order[i],
    );
    if (swap > i) [order[i], order[swap]] = [order[swap], order[i]];
  }

  // A primeira pessoa do dia é sempre a mais simples da leva.
  let soft = 0;
  order.forEach((kind, i) => {
    if (KINDS[kind].hard < KINDS[order[soft]].hard) soft = i;
  });
  [order[0], order[soft]] = [order[soft], order[0]];

  return order;
}

function makePerson(kind, i, count, d, used) {
  const K = KINDS[kind];

  const sex = d.pick(["m", "f"]);
  let first = d.pick(FIRST[sex]);
  for (let tries = 0; used.has(first) && tries < 12; tries += 1) first = d.pick(FIRST[sex]);
  used.add(first);

  const middle = d.chance(0.5) ? d.pick(MIDDLE[sex]) : "";
  const sur1 = d.pick(SUR);
  const sur2 = d.chance(0.55) ? d.pick(SUR.filter((s) => s !== sur1)) : "";
  const last = sur2 || sur1;
  const full = [first, middle, sur1, sur2].filter(Boolean).join(" ");
  const short = `${first} ${last}`;

  // Idade: a faixa vem do arquétipo, a data sai do sorteio.
  const [lo, hi] = K.age === "old" ? [62, 84] : K.age === "young" ? [16, 18] : [21, 68];
  const year = YEAR - d.int(lo, hi);
  const day = d.int(1, 28);
  const month = d.int(1, 12);
  const birth = `${pad(day)}/${pad(month)}/${year}`;

  const DOCS = documents(d);
  const old = YEAR - year >= 62;
  const kindOfDoc = K.doc ?? (old ? d.pick(["antiga", "antiga", "habilitacao"]) : d.pick(["identidade", "identidade", "habilitacao", "profissional", "digital"]));
  const model = DOCS[kindOfDoc];

  const doc = {
    art: model.art,
    type: model.type,
    name: full,
    birth,
    number: model.number(),
    note: model.note,
    code: String(d.int(1000, 9999)), // a identificação que a mesa digita no terminal
    photo: K.typo ? "FOTO PARECIDA" : model.photo,
  };

  const reg = {
    name: full.toUpperCase(),
    birth,
    section: SECTION,
    city: CITY,
    status: K.status,
  };

  /* A divergência é o coração do caso: é só aqui que o documento e o terminal
     deixam de contar a mesma história. */
  if (kind === "outra_secao") reg.section = d.pick(OTHER_SECTIONS);

  if (kind === "justifica") {
    reg.city = d.pick(OTHER_CITIES);
    reg.section = d.pick(OTHER_SECTIONS);
  }

  if (K.typo) {
    // Uma letra comida na digitação do cadastro, e a foto que quase bate.
    const cut = 2 + Math.floor(d.rnd() * Math.max(1, first.length - 3));
    const typo = first.slice(0, cut) + first.slice(cut + 1);
    reg.name = [typo, middle, sur1, sur2].filter(Boolean).join(" ").toUpperCase();
  }

  // O relógio corre de 08:03 às 16:20; a fila cresce junto.
  const step = count > 1 ? ((16 * 60 + 20 - (8 * 60 + 3)) * i) / (count - 1) : 0;
  const minute = 8 * 60 + 3 + Math.round(step + (i === 0 ? 0 : d.span(-7, 7)));
  const queue = 4 + Math.round((i * 34) / Math.max(1, count - 1)) + d.int(0, 3);

  // Preferência para votar: sempre para quem tem 60 ou mais, e um punhado de
  // outros motivos sorteados.
  const old60 = YEAR - year >= 60;
  const priority = old60 || d.chance(0.22);

  const person = {
    id: `${slug(short)}-${i + 1}`,
    kind,
    sex,
    priority,
    // Gestante só entra na lista de quem pode ser gestante.
    preference: priority ? (old60 ? `${YEAR - year} anos` : d.pick(sex === "f" ? [...PREFERENCE, "gestante"] : PREFERENCE)) : null,
    time: `${pad(Math.floor(minute / 60))}:${pad(minute % 60)}`,
    queue,
    name: short,
    tag: d.pick(TAGS[kind]),
    line: d.pick(LINES[kind]),
    doc,
    reg,
    bio: K.bio,
    resolve: K.resolve,
    needs: K.needs ?? {},
    quits: Boolean(K.quits),
    drunk: Boolean(K.drunk),
    // O que a pessoa responde quando a mesa pergunta.
    says: {
      year: K.year === "erro" ? String(year - d.int(2, 9)) : String(year),
      birth: K.answer === "erro" ? `${pad(d.int(1, 28))}/${pad(d.int(1, 12))}/${year}` : birth,
    },
    belongings: kindOfDoc === "digital" ? ["chaves"] : d.chance(0.45) ? ["celular", "chaves"] : ["celular"],
    hand: d.int(0, 2), // com que letra essa pessoa assina
    why: "",
  };

  person.inLedger = K.ledger !== false;
  person.why = typeof WHY[kind] === "function" ? WHY[kind](person) : WHY[kind];
  return person;
}

/* A listagem de impedidos fica no fim do caderno e vale o dia inteiro: quatro
   nomes inventados mais quem ficou de fora da folha. */
function blockedList(d, people) {
  const list = people.filter((p) => !p.inLedger && p.kind === "fora_caderno").map((p) => p.reg.name);
  while (list.length < 5) {
    const name = `${d.pick(LEDGER_FIRST)} ${d.pick(LEDGER_LAST)}`;
    if (!list.includes(name)) list.push(name);
  }
  return list;
}

/* Um turno completo. A semente volta junto: é ela que a tela de encerramento
   mostra para quem quiser repetir exatamente o mesmo dia. */
export function makeShift(seedText, count = 12) {
  const key = seedText || Math.random().toString(36).slice(2, 8);
  const d = dice(stream(seed(key)));
  const used = new Set();
  const people = plan(d, count).map((kind, i) => makePerson(kind, i, count, d, used));
  const ledger = buildLedger(d, people);
  return { seed: key, people, ledger, blocked: blockedList(d, people) };
}
