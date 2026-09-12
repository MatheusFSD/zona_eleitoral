export const IRRITATION_LIMIT = 5;

export function recordError(state) {
  if (state.phase === "bad" || state.phase === "end") return state;
  const errors = state.errors + 1;
  return {
    ...state,
    errors,
    phase: errors >= IRRITATION_LIMIT ? "bad" : state.phase,
  };
}

export function afterFeedback(state) {
  if (state.phase !== "feedback") return state;
  const phase = state.waiting.length ? "chamando" : "closing";
  return { ...state, phase, result: null, clock: phase === "closing" ? Math.max(state.clock, 17 * 60) : state.clock };
}

export function finishCase(state, decision, verdict, voted = false) {
  if (state.phase !== "working") return state;
  const marks = state.marks.slice();
  marks[state.index] = verdict.right ? "ok" : "err";
  let next = {
    ...state, phase: "feedback", marks,
    waiting: state.waiting.filter((i) => i !== state.index),
    served: state.served + 1,
    votes: state.votes + Number(voted),
    correct: state.correct + Number(verdict.right),
    clock: state.clock + verdict.minutes,
  };
  // A falha na fila já foi contada na chamada, mesmo se o veredito a repetir.
  if (!decision.right) next = recordError(next);
  return {
    ...next,
    result: verdict,
  };
}
