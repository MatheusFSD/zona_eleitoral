/* A fila do jogo aceita qualquer pessoa presente. A escolha é avaliada,
   sem corrigir a decisão do jogador antes de ela acontecer. */
export function queueIssue(people, waiting, chosen) {
  const first = waiting.find((i) => people[i].priority) ?? waiting[0];
  if (first == null || first === chosen) return "";
  const next = people[first];
  if (next.priority && !people[chosen].priority) {
    return `Você chamou ${people[chosen].name} antes de ${next.name}, que aguardava com prioridade (${next.preference}).`;
  }
  return `Você chamou fora da ordem de chegada. ${next.name} aguardava antes na ${next.priority ? "fila prioritária" : "fila comum"}.`;
}

export function withQueueIssue(decision, issue) {
  if (!issue) return decision;
  return {
    ...decision,
    right: false,
    title: "Ordem da fila não respeitada",
    stamp: "OCORRÊNCIA",
    text: `${issue} ${decision.right ? "O restante do atendimento foi realizado corretamente." : decision.text}`,
  };
}
