import test from "node:test";
import assert from "node:assert/strict";
import { createScan, fingerInside, SCAN_MS } from "./biometric.js";

test("só conclui depois de três segundos contínuos, uma única vez", () => {
  const scan = createScan();
  assert.deepEqual(scan.tick(100, true), { progress: 0, complete: false });
  assert.equal(scan.tick(100 + SCAN_MS - 1, true).complete, false);
  assert.deepEqual(scan.tick(100 + SCAN_MS, true), { progress: 1, complete: true });
  assert.equal(scan.tick(100 + SCAN_MS * 2, true).complete, false);
});

test("sair do sensor ou soltar descarta todo o progresso parcial", () => {
  const scan = createScan();
  scan.tick(0, true);
  assert.equal(scan.tick(2500, true).complete, false);
  assert.deepEqual(scan.tick(2600, false), { progress: 0, complete: false });
  assert.equal(scan.tick(5000, true).progress, 0);
  assert.equal(scan.tick(7999, true).complete, false);
  assert.equal(scan.tick(8000, true).complete, true);
});

test("perder foco cancela a coleta; uma nova tentativa tem seu próprio relógio", () => {
  const scan = createScan();
  scan.tick(0, true);
  scan.tick(2000, true);
  scan.reset();
  assert.equal(scan.tick(10000, true).progress, 0);
  assert.equal(scan.tick(13000, true).complete, true);
  const retry = createScan();
  assert.equal(retry.tick(15000, true).complete, false);
  assert.equal(retry.tick(18000, true).complete, true);
});

test("encaixe usa a ponta do dedo na área central do sensor, inclusive após mover o leitor", () => {
  const rect = { left: 100, top: 200, width: 80, height: 100 };
  assert.equal(fingerInside({ x: 140, y: 250 }, rect), true);
  assert.equal(fingerInside({ x: 100, y: 200 }, rect), false);
  assert.equal(fingerInside({ x: 180, y: 250 }, rect), false);
  assert.equal(fingerInside({ x: 140, y: 250 }, { ...rect, left: 400 }), false);
  assert.equal(fingerInside({ x: 440, y: 250 }, { ...rect, left: 400 }), true);
  assert.equal(fingerInside({ x: 0, y: 0 }, null), false);
  assert.equal(fingerInside({ x: 100, y: 200 }, { ...rect, width: 0 }), false);
});
