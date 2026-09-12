/* A fila do jogo aceita qualquer pessoa presente. A escolha é avaliada,
   sem corrigir a decisão do jogador antes de ela acontecer. */

import { t } from "./i18n.js";

const AVISO = {
  prioridade: {
    pt: "Você chamou {chamado} antes de {proximo}, que aguardava com prioridade ({motivo}).",
    en: "You called {chamado} before {proximo}, who was waiting with priority ({motivo}).",
  },
  ordem: {
    pt: "Você chamou fora da ordem de chegada. {proximo} aguardava antes na {fila}.",
    en: "You called out of arrival order. {proximo} was waiting ahead in the {fila}.",
  },
  filaPrioritaria: { pt: "fila prioritária", en: "priority queue" },
  filaComum: { pt: "fila comum", en: "regular queue" },
  titulo: { pt: "Ordem da fila não respeitada", en: "Queue order not respected" },
  carimbo: { pt: "OCORRÊNCIA", en: "INCIDENT" },
  restoCerto: {
    pt: "O restante do atendimento foi realizado corretamente.",
    en: "The rest of the case was handled correctly.",
  },
};

export function queueIssue(people, waiting, chosen) {
  const first = waiting.find((i) => people[i].priority) ?? waiting[0];
  if (first == null || first === chosen) return "";
  const next = people[first];
  if (next.priority && !people[chosen].priority) {
    return t(AVISO.prioridade, {
      chamado: people[chosen].name,
      proximo: next.name,
      motivo: t(next.preference),
    });
  }
  return t(AVISO.ordem, {
    proximo: next.name,
    fila: t(next.priority ? AVISO.filaPrioritaria : AVISO.filaComum),
  });
}

export function withQueueIssue(decision, issue) {
  if (!issue) return decision;
  return {
    ...decision,
    right: false,
    title: t(AVISO.titulo),
    stamp: t(AVISO.carimbo),
    text: `${issue} ${decision.right ? t(AVISO.restoCerto) : decision.text}`,
  };
}
