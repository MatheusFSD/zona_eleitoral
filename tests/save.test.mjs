import test from "node:test";
import assert from "node:assert/strict";
import { SAVE_KEY, snapshot, readSave, writeSave, clearSave } from "../src/save.js";
import { makeShift } from "../src/data/shift.js";
import { newCase } from "../src/flow.js";

function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}

const game = () => ({
  shift: makeShift("salvamento-teste"),
  state: { phase: "working", index: 1, waiting: [1, 2, 3], clock: 600, served: 1, votes: 1, correct: 1, errors: 0, marks: ["ok"], result: null },
  c: { ...newCase(), typed: "12", tries: 1, bio: "fail" },
  signatures: { 123: { name: "NOME NO CADERNO", hand: 1 } },
  tutor: null, spots: { doc: { x: 30, y: 60, z: 24 } },
});

test("o salvamento reconstrói o mesmo turno e preserva o atendimento e a mesa", () => {
  const data = game();
  const store = storage();
  assert.equal(writeSave(snapshot(data), store), true);
  const loaded = readSave(store);
  assert.deepEqual(loaded.shift, data.shift);
  assert.deepEqual(loaded.c, data.c);
  assert.deepEqual(loaded.signatures, data.signatures);
  assert.deepEqual(loaded.spots, data.spots);
  assert.deepEqual(loaded.state.waiting, [2, 3]);
  assert.equal(loaded.state.votes, 1);
  clearSave(store);
  assert.equal(readSave(store), null);
});

test("salvamentos incompletos, incompatíveis ou encerrados não podem ser carregados", () => {
  const valid = snapshot(game());
  const store = storage();
  for (const value of ["{", "null", "{}", JSON.stringify({ ...valid, version: 2 }), JSON.stringify({ ...valid, c: null }), JSON.stringify({ ...valid, state: { ...valid.state, phase: "bad" } }), JSON.stringify({ ...valid, state: { ...valid.state, index: 999 } })]) {
    store.setItem(SAVE_KEY, value);
    assert.equal(readSave(store), null);
  }
});

test("armazenamento bloqueado ou cheio não interrompe o jogo", () => {
  const blocked = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("quota"); }, removeItem() { throw new Error("blocked"); } };
  assert.equal(readSave(blocked), null);
  assert.equal(writeSave(snapshot(game()), blocked), false);
  assert.equal(clearSave(blocked), false);
});
