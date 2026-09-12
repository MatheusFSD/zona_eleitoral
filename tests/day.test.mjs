import test from "node:test";
import assert from "node:assert/strict";
import { IRRITATION_LIMIT, recordError, afterFeedback, finishCase } from "../src/day.js";
import { withQueueIssue } from "../src/queue.js";

const day = (patch = {}) => ({ phase: "working", clock: 600, errors: 0, marks: [], waiting: [0, 1, 2], served: 0, votes: 0, correct: 0, index: 0, ...patch });
const decision = { right: true, title: "Correto", text: "Procedimento correto", minutes: 5 };

test("a quinta ocorrência interrompe a partida", () => {
  let state = day();
  for (let i = 1; i <= IRRITATION_LIMIT; i++) {
    state = recordError(state);
    assert.equal(state.errors, i);
    assert.equal(state.phase, i === IRRITATION_LIMIT ? "bad" : "working");
  }
  assert.equal(recordError(state), state);
});

test("a ocorrência de fila não é contada novamente no feedback", () => {
  const state = recordError(day());
  const result = finishCase(state, decision, withQueueIssue(decision, "Furou a fila"));
  assert.equal(result.errors, 1);
  assert.equal(result.correct, 0);
  assert.equal(result.served, 1);
  assert.deepEqual(result.waiting, [1, 2]);
});

test("erros diferentes na fila e no atendimento contam separadamente", () => {
  const state = recordError(day());
  const wrong = { ...decision, right: false };
  assert.equal(finishCase(state, wrong, withQueueIssue(wrong, "Furou a fila")).errors, 2);
});

test("a remoção não pode avançar para a animação de encerramento", () => {
  const wrong = { ...decision, right: false };
  const result = finishCase(day({ errors: 4 }), wrong, wrong);
  assert.equal(result.phase, "bad");
  assert.equal(afterFeedback(result), result);
  assert.equal(finishCase(result, decision, decision), result);
});

test("callbacks duplicados não concluem um atendimento duas vezes", () => {
  const first = finishCase(day(), decision, decision, true);
  assert.equal(first.votes, 1);
  assert.equal(finishCase(first, decision, decision, true), first);
});

test("o boletim conta apenas quem votou, inclusive quando houve erro de atendimento", () => {
  const wrong = { ...decision, right: false };
  for (const verdict of [decision, wrong]) {
    assert.equal(finishCase(day({ votes: 3 }), verdict, verdict, false).votes, 3);
    assert.equal(finishCase(day({ votes: 3 }), verdict, verdict, true).votes, 4);
  }
});

test("a última fila continua sem etapas adicionais", () => {
  const result = afterFeedback(day({ phase: "feedback", waiting: [1, 2] }));
  assert.equal(result.phase, "chamando");
  assert.equal(result.clock, 600);
});

test("o último atendimento abre a animação, sem adiantar o relógio para trás", () => {
  for (const clock of [600, 1050]) {
    const result = afterFeedback(day({ phase: "feedback", waiting: [], clock }));
    assert.equal(result.phase, "closing");
    assert.equal(result.clock, Math.max(1020, clock));
  }
});
