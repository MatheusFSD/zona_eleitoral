/* Dois idiomas: português e inglês.

   Na primeira visita o idioma vem do navegador — qualquer coisa que comece com
   `pt` abre em português, todo o resto abre em inglês. A escolha feita no menu
   fica guardada e passa a valer por cima da detecção.

   COMO O TEXTO É ESCRITO

   Não há catálogo de chaves para manter em sincronia. Um texto traduzível é um
   par, escrito no lugar onde ele é usado:

       t({ pt: "Continuar", en: "Continue" })

   O par também pode guardar listas — as falas de uma cena, por exemplo:

       t({ pt: ["Bom dia."], en: ["Morning."] })

   O que se repete pela interface mora em `TXT`, no fim deste arquivo. O texto
   do jogo — falas, manual, tutorial, documentos — mora junto dos dados, em
   [data/](./data/), com as duas línguas lado a lado.

   Nomes de pessoas e de lugares não se traduzem: Neusa Prado continua Neusa
   Prado, e a Escola Municipal Horizonte mantém o nome dela em inglês.

   QUEM REDESENHA NA TROCA

   `useIdioma()` é chamado uma vez, na raiz, em [App.jsx](./App.jsx): trocar o
   idioma redesenha a árvore inteira, e `t()` é uma função comum em todo o
   resto do código. */

import { useSyncExternalStore } from "react";

export const IDIOMAS = { pt: "Português", en: "English" };
const CHAVE = "secao-127.idioma.v1";
const ETIQUETA = { pt: "pt-BR", en: "en" };

/* O idioma pedido pelo navegador. `navigator.languages` vem em ordem de
   preferência; basta uma delas ser português. */
export function detectar(nav = typeof navigator === "undefined" ? null : navigator) {
  const pedidos = nav?.languages?.length ? nav.languages : [nav?.language];
  return pedidos.some((l) => String(l ?? "").toLowerCase().startsWith("pt")) ? "pt" : "en";
}

const guardado = () => {
  try {
    const valor = window.localStorage.getItem(CHAVE);
    return valor in IDIOMAS ? valor : null;
  } catch {
    return null;
  }
};

let atual = guardado() ?? detectar();
const ouvintes = new Set();

export const idioma = () => atual;

/* O idioma também é do documento: a etiqueta `lang` muda a pronúncia do leitor
   de tela e a quebra de linha, e a descrição é o que aparece quando alguém
   compartilha o endereço. */
const DESCRICAO = {
  pt: "Zona Eleitoral: um turno na mesa receptora da Seção 127.",
  en: "Zona Eleitoral: a shift at the polling table of Section 127.",
};

const marcarNoDocumento = () => {
  try {
    document.documentElement.lang = ETIQUETA[atual];
    document.querySelector('meta[name="description"]')?.setAttribute("content", DESCRICAO[atual]);
  } catch {
    /* sem documento por perto, não há o que marcar */
  }
};
marcarNoDocumento();

export function trocarIdioma(novo) {
  if (!(novo in IDIOMAS) || novo === atual) return;
  atual = novo;
  try {
    window.localStorage.setItem(CHAVE, novo);
  } catch {
    /* navegador sem armazenamento: a escolha vale só nesta sessão */
  }
  marcarNoDocumento();
  ouvintes.forEach((avisar) => avisar());
}

export const outroIdioma = () => (atual === "pt" ? "en" : "pt");
export const alternarIdioma = () => trocarIdioma(outroIdioma());

const assinar = (avisar) => {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
};

/* Resolve um par no idioma de agora. Aceita também texto solto — nome de
   pessoa, número, sigla —, que atravessa sem tradução. `vars` preenche os
   buracos escritos entre chaves. */
export function t(texto, vars) {
  const valor = texto && typeof texto === "object" && !Array.isArray(texto) ? (texto[atual] ?? texto.pt) : texto;
  if (!vars || typeof valor !== "string") return valor;
  return valor.replace(/\{(\w+)\}/g, (todo, chave) => (chave in vars ? String(vars[chave]) : todo));
}

// Redesenha quem chamar isto quando o idioma mudar.
export function useIdioma() {
  return useSyncExternalStore(assinar, idioma, idioma);
}

/* O decimal muda de vírgula para ponto: o leitor de digital mostra segundos. */
export const numero = (valor, casas = 1) =>
  atual === "pt" ? valor.toFixed(casas).replace(".", ",") : valor.toFixed(casas);

/* ------------------------------------------------------------ a interface -- */

/* O que aparece em botão, etiqueta e aviso — o que se repete de uma tela para
   outra. O texto do jogo não mora aqui. */
export const TXT = {
  // menu e apresentação
  menuPrincipal: { pt: "Menu principal", en: "Main menu" },
  menuDoJogo: { pt: "Opções do jogo", en: "Game options" },
  novoJogo: { pt: "Novo jogo", en: "New game" },
  carregarJogo: { pt: "Carregar jogo", en: "Load game" },
  idioma: { pt: "Idioma", en: "Language" },
  idiomaBotao: {
    pt: "Idioma: {atual}. Trocar para {outro}.",
    en: "Language: {atual}. Switch to {outro}.",
  },
  semArmazenamento: { pt: "Não foi possível salvar neste navegador.", en: "Could not save in this browser." },
  avisoEstudio: {
    pt: "Este jogo não é um treinamento eleitoral.",
    en: "This game is not official poll worker training.",
  },
  estudioLogo: { pt: "Itacoa. Clique para avançar.", en: "Itacoa. Click to continue." },
  estudioAviso: {
    pt: "Este jogo não é um treinamento eleitoral. Clique para avançar.",
    en: "This game is not official poll worker training. Click to continue.",
  },

  // botões que aparecem em muitos lugares
  continuar: { pt: "Continuar", en: "Continue" },
  voltar: { pt: "Voltar", en: "Back" },
  encerrar: { pt: "Encerrar", en: "Finish" },
  recomecar: { pt: "Recomeçar", en: "Play again" },
  cena: { pt: "Cena {n} de {total}", en: "Scene {n} of {total}" },
  cenaSemNome: { pt: "Cena", en: "Scene" },

  // o cabeçalho da sala
  secao: { pt: "SEÇÃO", en: "SECTION" },
  zonaSala: { pt: "ZONA 041 · SALA 03", en: "ZONE 041 · ROOM 03" },
  mesaReceptora: { pt: "MESA RECEPTORA", en: "POLLING TABLE" },
  silencio: { pt: "SILÊNCIO", en: "QUIET" },
  votacao: { pt: "VOTAÇÃO", en: "VOTING" },
  filaCorredor: { pt: "Fila: {n} pessoas no corredor", en: "Queue: {n} people in the hallway" },
  chamarPessoa: { pt: "Chamar {nome} · {motivo}", en: "Call {nome} · {motivo}" },
  semPrioridadeMin: { pt: "sem prioridade", en: "no priority" },
  semPrioridade: { pt: "Sem prioridade", en: "No priority" },
  atendimentoPrioritario: { pt: "Atendimento prioritário", en: "Priority service" },
  filaComum: { pt: "Fila comum · ordem de chegada", en: "Regular queue · order of arrival" },
  casos: { pt: "Casos {n}/{total}", en: "Cases {n}/{total}" },
  pausar: { pt: "Menu principal · Esc", en: "Main menu · Esc" },
  pularAoFim: { pt: "Pular ao encerramento", en: "Skip to closing" },
  pularAoFimDica: {
    pt: "Pular ao encerramento — atalho de desenvolvimento",
    en: "Skip to closing — development shortcut",
  },
  neusaHumor: {
    pt: ["tranquila", "atenta", "incomodada", "irritada", "furiosa", "sem paciência"],
    en: ["calm", "watchful", "bothered", "annoyed", "furious", "out of patience"],
  },
  neusaRetrato: { pt: "Neusa, {humor}", en: "Neusa, {humor}" },

  // a sala e a pessoa na mesa
  salaEtiqueta: { pt: "Sala 03 · mesa receptora", en: "Room 03 · polling table" },
  ninguemNaMesa: { pt: "Ninguém na mesa", en: "Nobody at the table" },
  portasFechadas: { pt: "Portas fechadas", en: "Doors closed" },
  portaFechada: { pt: "Porta da seção ainda fechada", en: "The section door is still closed" },
  fechada: { pt: "FECHADA", en: "CLOSED" },
  chameProxima: { pt: "Chame a próxima pessoa do corredor.", en: "Call the next person in from the hallway." },
  naoAbriu: { pt: "A seção ainda não abriu.", en: "The section has not opened yet." },
  preferenciaTag: { pt: "Preferência · {motivo}", en: "Priority · {motivo}" },
  eleitor: { pt: "Eleitor", en: "Voter" },
  voceMesa: { pt: "Você · mesa", en: "You · table" },
  coordenadora: { pt: "Coordenadora", en: "Coordinator" },
  conversaNaMesa: { pt: "Conversa na mesa", en: "Conversation at the table" },
  conversaCoordenadora: { pt: "Conversa com a coordenadora", en: "Conversation with the coordinator" },
  responderEleitor: { pt: "Responder ao eleitor", en: "Reply to the voter" },
  pularResto: { pt: "pular o resto", en: "skip the rest" },

  // a mesa e as peças
  mesa: { pt: "Mesa receptora", en: "Polling table" },
  documentoApresentado: { pt: "Documento apresentado", en: "Document handed over" },
  terminal: { pt: "Terminal", en: "Terminal" },
  cadernoVotacao: { pt: "Caderno de votação", en: "Voter register" },
  leitorBiometrico: { pt: "Leitor biométrico", en: "Fingerprint reader" },
  folhaImpedidos: { pt: "Folha de impedidos", en: "Barred voters sheet" },
  manualDaMesa: { pt: "Manual da mesa", en: "Table handbook" },
  comprovante: { pt: "Comprovante", en: "Receipt" },
  celular: { pt: "Celular", en: "Phone" },
  chaves: { pt: "Chaves", en: "Keys" },
};
