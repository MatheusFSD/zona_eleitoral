import test, { before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { createServer } from "vite";
import { createElement, act } from "react";
import { createRoot } from "react-dom/client";
import { SAVE_KEY } from "../src/save.js";
import { makeShift } from "../src/data/shift.js";
import { newCase } from "../src/flow.js";

let server, App, Closing, UrnReport, root, dom;
before(async () => {
  dom = new JSDOM('<div id="root"></div>', { url: "http://localhost/?turno=encerramento-teste", pretendToBeVisual: true });
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, Image: dom.window.Image, IS_REACT_ACT_ENVIRONMENT: true });
  window.matchMedia = () => ({ matches: true });
  // Os testes clicam nos textos em português: o idioma fica preso antes de os
  // módulos carregarem (veja src/i18n.js).
  window.localStorage.setItem("secao-127.idioma.v1", "pt");
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: "custom", optimizeDeps: { noDiscovery: true, include: [] } });
  App = (await server.ssrLoadModule("/src/App.jsx")).default;
  Closing = (await server.ssrLoadModule("/src/components/Closing.jsx")).default;
  UrnReport = (await server.ssrLoadModule("/src/components/UrnReport.jsx")).default;
});
afterEach(async () => { if (root) await act(() => root.unmount()); root = null; window.localStorage.clear(); });
after(async () => { await server?.close(); dom?.window.close(); });

const buttons = () => [...document.querySelectorAll("button")];
async function click(match) {
  const button = typeof match === "string" ? buttons().find((b) => !b.disabled && b.textContent.includes(match)) : match;
  assert.ok(button, `Botão disponível: ${match}`);
  assert.equal(button.disabled, false);
  await act(() => button.click());
}
async function tick(t, ms) { await act(() => t.mock.timers.tick(ms)); }
async function skipStudioIntro() {
  await act(() => document.querySelector(".studio-intro.logo").click());
  await act(() => document.querySelector(".studio-intro.disclaimer").click());
}
async function start(t) {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  root = createRoot(document.getElementById("root"));
  await act(() => root.render(createElement(App)));
  await skipStudioIntro(); await click("Novo jogo");
  await click("Pular introdução"); await click("Imprimir zerésima"); await tick(t, 500);
}
const expression = () => [...document.querySelectorAll(".neusa-watch path")].map((p) => p.getAttribute("d")).join(";");

test("a impressão e o empacotamento levam automaticamente ao final no formato do prólogo", async (t) => {
  await start(t);
  assert.equal(document.querySelector("meter"), null);
  assert.equal(document.querySelector(".neusa-watch").textContent, "");
  assert.doesNotMatch(document.querySelector(".top").textContent, /Atendidos|Horário/);
  assert.equal(document.querySelector(".digital-clock").getAttribute("datetime"), "08:00");
  const calm = expression();
  await click(document.querySelector('[aria-label="Pular ao encerramento"]'));
  assert.ok(document.querySelector(".packing-scene.printing"));
  assert.equal(document.querySelectorAll(".closing-film button").length, 0);
  assert.ok(document.querySelector("main[inert]"));
  await tick(t, 700); assert.ok(document.querySelector(".packing-scene.packing"));
  await tick(t, 700); assert.ok(document.querySelector(".packing-scene.sealed"));
  await tick(t, 700);
  const ending = document.querySelector(".cutscene");
  assert.ok(ending.querySelector('img[src$="saida.png"]'));
  assert.match(ending.textContent, /As horas estão completas/);
  assert.doesNotMatch(ending.textContent, /Final bom|balanço|Ocorrências|Turno/);
  assert.equal(ending.querySelectorAll("p").length, 1);
  await click("Menu principal");
  assert.equal(document.querySelector(".cutscene"), null);
  assert.ok(document.querySelector(".game-menu"));
  assert.equal(window.localStorage.getItem(SAVE_KEY), null);
  assert.ok(buttons().find((b) => b.textContent === "Carregar jogo").disabled);
  await click("Novo jogo"); await click("Pular introdução");
  assert.equal(expression(), calm);
});

test("cada erro muda o retrato e o quinto abre a cena de dispensa, sem modal de pontuação", async (t) => {
  await start(t);
  await tick(t, 200); await tick(t, 900);
  await click("Já sei como funciona"); await tick(t, 900); await tick(t, 900); await click("Abrir a porta");
  const expressions = new Set([expression()]);
  const portrait = document.querySelector(".neusa-watch");
  const colors = new Set([portrait.style.backgroundColor]);
  for (let i = 1; i <= 5; i++) {
    const next = document.querySelector(".na-fila.preferencia button:not(:disabled)") ?? document.querySelector(".na-fila button:not(:disabled)");
    await click(next); await tick(t, 420); await click("Suspender a votação");
    expressions.add(expression());
    assert.equal(document.querySelector(".neusa-watch"), portrait);
    colors.add(portrait.style.backgroundColor);
    assert.equal(document.querySelector(".neusa-watch").textContent, "");
    if (i < 5) await click("Continuar");
  }
  assert.equal(expressions.size, 6);
  assert.equal(colors.size, 6);
  const ending = document.querySelector(".cutscene");
  assert.ok(ending.querySelector('img[src$="dispensa.png"]'));
  assert.match(ending.textContent, /sem completar as horas/);
  assert.doesNotMatch(ending.textContent, /Final ruim|Ocorrências|Atendidos|Turno/);
  assert.equal(document.querySelector(".closing-film, .modal, .stats, meter"), null);
  await tick(t, 10000);
  assert.ok(ending.isConnected);
  await click("Menu principal");
  assert.ok(document.querySelector(".game-menu"));
  assert.equal(window.localStorage.getItem(SAVE_KEY), null);
  await click("Novo jogo"); await click("Pular introdução");
  assert.equal(document.querySelector(".neusa-watch").getAttribute("aria-label"), "Neusa, tranquila");
});

test("logo e aviso duram três segundos cada antes do menu Zona Eleitoral", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  root = createRoot(document.getElementById("root"));
  await act(() => root.render(createElement(App)));
  assert.ok(document.querySelector('.studio-intro img[alt="Itacoa"]'));
  assert.equal(document.querySelector(".studio-intro p, .studio-intro button"), null);
  assert.ok(document.querySelector(".studio-progress"));
  await tick(t, 2999);
  assert.ok(document.querySelector(".studio-intro.logo"));
  await tick(t, 1);
  assert.ok(document.querySelector(".studio-intro.disclaimer"));
  assert.match(document.querySelector(".studio-intro").textContent, /não é um treinamento eleitoral/);
  assert.equal(document.querySelector(".studio-intro img, .studio-intro button"), null);
  assert.equal(document.querySelector(".game-menu, .app"), null);
  await tick(t, 2999);
  assert.ok(document.querySelector(".studio-intro.disclaimer"));
  await tick(t, 1);
  assert.equal(document.querySelector(".studio-intro"), null);
  assert.equal(document.querySelector(".menu-title").textContent, "ZONAELEITORAL");
  assert.ok(buttons().find((b) => b.textContent === "Carregar jogo").disabled);
  const idioma = buttons().find((b) => b.textContent.startsWith("Idioma"));
  assert.equal(idioma.disabled, false);
  assert.match(idioma.textContent, /Português/);
  assert.equal(document.activeElement.textContent, "Novo jogo");
  // A opção desativada fica fora da navegação: do primeiro item vai-se ao idioma.
  await act(() => document.activeElement.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
  assert.ok(document.activeElement.textContent.startsWith("Idioma"));
});

test("a opção de idioma troca o menu inteiro e marca a língua no documento", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  root = createRoot(document.getElementById("root"));
  await act(() => root.render(createElement(App)));
  await skipStudioIntro();
  assert.equal(document.documentElement.lang, "pt-BR");
  await click("Idioma");
  assert.equal(buttons()[0].textContent, "New game");
  assert.equal(buttons()[1].textContent, "Load game");
  assert.match(buttons()[2].textContent, /^Language .*English/);
  assert.equal(document.documentElement.lang, "en");
  // E volta, para os outros testes continuarem lendo em português.
  await click("Language");
  assert.equal(buttons()[0].textContent, "Novo jogo");
  assert.equal(document.documentElement.lang, "pt-BR");
});

test("clicar pula cada tela e cancela seu timer sem adiantar a seguinte", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  root = createRoot(document.getElementById("root"));
  await act(() => root.render(createElement(App)));
  await tick(t, 1000);
  await act(() => document.querySelector(".studio-intro.logo").click());
  const notice = document.querySelector(".studio-intro.disclaimer");
  assert.ok(notice);
  await tick(t, 2000);
  assert.ok(notice.isConnected);
  await act(() => notice.click());
  assert.ok(document.querySelector(".game-menu"));
  await tick(t, 10000);
  assert.ok(document.querySelector(".game-menu"));
  assert.equal(document.querySelector(".studio-intro"), null);
});

test("carregar após recarregar a página mantém o atendimento, o relógio e os erros", async (t) => {
  await start(t);
  await tick(t, 200); await tick(t, 900);
  await click("Já sei como funciona"); await tick(t, 900); await tick(t, 900); await click("Abrir a porta");
  const callNext = () => document.querySelector(".na-fila.preferencia button:not(:disabled)") ?? document.querySelector(".na-fila button:not(:disabled)");
  await click(callNext()); await tick(t, 420); await click("Suspender a votação"); await click("Continuar");
  await click(callNext()); // Recarrega ainda durante a caminhada.
  await act(() => window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "1", bubbles: true })));
  assert.equal(document.querySelector(".passo, .mesa-nota"), null);
  const before = JSON.parse(window.localStorage.getItem(SAVE_KEY));
  assert.equal(before.state.errors, 1);
  assert.equal(before.c.typed, "1");
  assert.ok(!before.state.waiting.includes(before.state.index));
  await act(() => root.unmount());
  root = createRoot(document.getElementById("root"));
  await act(() => root.render(createElement(App)));
  await skipStudioIntro();
  await act(() => document.activeElement.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })));
  assert.equal(document.activeElement.textContent, "Carregar jogo");
  await click("Carregar jogo");
  const loaded = JSON.parse(window.localStorage.getItem(SAVE_KEY));
  assert.deepEqual(loaded.state, before.state);
  assert.deepEqual(loaded.c, before.c);
  assert.equal(loaded.seed, before.seed);
  assert.deepEqual(loaded.signatures, before.signatures);
  assert.equal(document.querySelector(".neusa-watch").getAttribute("aria-label"), "Neusa, atenta");
  await act(() => window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  assert.ok(document.querySelector(".game-menu"));
  const paused = window.localStorage.getItem(SAVE_KEY);
  await tick(t, 10000);
  assert.equal(window.localStorage.getItem(SAVE_KEY), paused);
  await click("Carregar jogo");
  assert.deepEqual(JSON.parse(window.localStorage.getItem(SAVE_KEY)).c, before.c);
});

test("o boletim preserva a identificação da zerésima e imprime os votos do turno", async () => {
  root = createRoot(document.getElementById("root"));
  const seedText = "mesma-maquina";
  const row = (label) => [...document.querySelectorAll(".zr-row")].find((r) => r.querySelector("span").textContent === label)?.querySelector("b").textContent;
  await act(() => root.render(createElement(UrnReport, { seedText })));
  const identification = [document.querySelector(".zr-head").textContent, row("TURNO"), row("APTOS"), document.querySelector(".zr-foot").textContent];
  assert.equal(row("VOTOS"), "000");
  await act(() => root.render(createElement(UrnReport, { seedText, votes: 7, closing: true })));
  assert.deepEqual([document.querySelector(".zr-head").textContent, row("TURNO"), row("APTOS"), document.querySelector(".zr-foot").textContent], identification);
  assert.equal(row("VOTOS"), "007");
  assert.equal(document.querySelector("h3").textContent, "Boletim de urna");
  assert.equal(row("BRANCOS"), undefined);
  assert.equal(row("NULOS"), undefined);
});

test("sair durante a cabina pausa o voto e carregar não o duplica", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const shift = makeShift("cabina-salva");
  const index = shift.people.findIndex((p) => p.resolve === "fluxo" && !p.quits);
  const person = shift.people[index];
  window.localStorage.setItem(SAVE_KEY, JSON.stringify({
    version: 1, seed: shift.seed,
    state: { phase: "working", index, waiting: shift.people.map((_, i) => i).filter((i) => i !== index), clock: 600, served: 0, votes: 0, correct: 0, errors: 0, marks: [], result: null },
    c: { ...newCase(), step: "cabina", loaded: true, marked: person.seq, tries: 1, bio: "ok" }, signatures: {}, tutor: null, spots: {},
  }));
  root = createRoot(document.getElementById("root"));
  await act(() => root.render(createElement(App)));
  await skipStudioIntro(); await click("Carregar jogo"); await tick(t, 1000);
  await click(document.querySelector(".menu-pause"));
  const paused = window.localStorage.getItem(SAVE_KEY);
  await tick(t, 10000);
  assert.equal(window.localStorage.getItem(SAVE_KEY), paused);
  await click("Carregar jogo"); await tick(t, 2900);
  const voted = JSON.parse(window.localStorage.getItem(SAVE_KEY));
  assert.equal(voted.seed, shift.seed);
  assert.equal(voted.c.step, "entrega");
  assert.equal(voted.c.voted, true);
  assert.equal(voted.signatures[person.seq].name, person.name);
  await click(document.querySelector(".menu-pause"));
  // Os itens entregues antes de fechar a aba devem concluir só uma vez.
  voted.c = { ...voted.c, given: person.belongings, docBack: true, receipt: true };
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(voted));
  await click("Carregar jogo");
  assert.equal(JSON.parse(window.localStorage.getItem(SAVE_KEY)).state.votes, 1);
  await act(() => window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
  await click("Carregar jogo"); await tick(t, 10000);
  assert.equal(JSON.parse(window.localStorage.getItem(SAVE_KEY)).state.votes, 1);
});

test("sair da animação cancela os timers e não dispara um final tardio", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let finished = 0;
  root = createRoot(document.getElementById("root"));
  await act(() => root.render(createElement(Closing, { onFinish: () => finished++ })));
  await tick(t, 700);
  await act(() => root.unmount()); root = null;
  await tick(t, 10000);
  assert.equal(finished, 0);
});
