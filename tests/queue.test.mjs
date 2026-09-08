import test from "node:test";
import assert from "node:assert/strict";
import { queueIssue, withQueueIssue } from "../src/queue.js";
import { judge, newCase } from "../src/flow.js";

const people = [
  { name: "Ana", priority: false },
  { name: "Bruno", priority: true, preference: "72 anos" },
  { name: "Clara", priority: true, preference: "gestante" },
  { name: "Daniel", priority: false },
];

test("a prioridade passa à frente da fila comum", () => {
  assert.equal(queueIssue(people, [0, 1, 2, 3], 1), "");
  assert.match(queueIssue(people, [0, 1, 2, 3], 0), /prioridade \(72 anos\)/);
});

test("a ordem de chegada vale dentro de cada fila", () => {
  assert.equal(queueIssue(people, [0, 3], 0), "");
  assert.match(queueIssue(people, [0, 3], 3), /fila comum/);
  assert.match(queueIssue(people, [0, 1, 2], 2), /fila prioritária/);
});

test("a pessoa prioritária já atendida não interfere na próxima chamada", () => {
  assert.equal(queueIssue(people, [0, 2, 3], 2), "");
  assert.equal(queueIssue(people, [0, 3], 0), "");
});

test("resolver o atendimento corretamente não apaga a ocorrência na chamada", () => {
  const person = { resolve: "fluxo", why: "Dados conferidos." };
  const issue = queueIssue(people, [0, 1], 0);
  const c = { ...newCase(), loaded: true, queueIssue: issue };
  const decision = judge(person, "fluxo", c);
  const result = withQueueIssue(decision, issue);
  assert.equal(decision.right, true);
  assert.equal(result.right, false);
  assert.match(result.text, /restante do atendimento foi realizado corretamente/);
  assert.equal(result.minutes, decision.minutes);
});

test("erros no atendimento e na fila aparecem juntos no retorno", () => {
  const decision = judge({ resolve: "fluxo", why: "A pessoa deveria votar." }, "justificar", { ...newCase(), loaded: true });
  const result = withQueueIssue(decision, "Prioridade ignorada.");
  assert.equal(result.right, false);
  assert.match(result.text, /Prioridade ignorada/);
  assert.match(result.text, /A pessoa deveria votar/);
  assert.equal(withQueueIssue(decision, ""), decision);
});
