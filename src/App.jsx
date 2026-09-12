import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ACTIONS } from "./data/people.js";
import { PERGUNTAS, responder } from "./data/talk.js";
import { makeShift } from "./data/shift.js";
import { PASSOS, indiceDe } from "./data/tutorial.js";
import { allowed, judge, newCase, refusal } from "./flow.js";
import { queueIssue, withQueueIssue } from "./queue.js";
import { useDesk } from "./desk.jsx";
import { tone } from "./sound.js";
import Desk, { ITEM_SPOTS, SPOTS } from "./components/Desk.jsx";
import PersonPanel from "./components/PersonPanel.jsx";
import TopBar from "./components/TopBar.jsx";
import { FeedbackModal, StartModal } from "./components/Modals.jsx";
import OpeningModal from "./components/Opening.jsx";
import Closing from "./components/Closing.jsx";
import Ending from "./components/Ending.jsx";
import { afterFeedback, finishCase, recordError } from "./day.js";
import GameMenu, { StudioIntro } from "./components/GameMenu.jsx";
import { SAVABLE_PHASES, snapshot, readSave, writeSave, clearSave } from "./save.js";
import { t, useIdioma } from "./i18n.js";

/* O que a mesa avisa em voz alta — o aviso que sobe na tela e o que o leitor
   de tela anuncia. O terminal escreve em caixa alta, como o aparelho. */
const AVISO = {
  dispensada: {
    pt: "Neusa interrompeu seu trabalho. Você não completou as horas.",
    en: "Neusa has taken over. You did not complete the hours.",
  },
  chegou: { pt: "{nome} chegou à mesa.", en: "{nome} is at the table." },
  corredor: {
    pt: "{n} pessoas no corredor. Chame a próxima.",
    en: "{n} people in the hallway. Call the next one.",
  },
  filaOcorrencia: { pt: "Ocorrência na fila: {aviso}", en: "Queue incident: {aviso}" },
  anoConfere: {
    pt: "Ano confere. A pessoa assina o caderno.",
    en: "The year matches. The voter signs the register.",
  },
  anoIncompleto: { pt: "ANO INCOMPLETO", en: "YEAR INCOMPLETE" },
  anoErrado: { pt: "O ano não confere com o cadastro.", en: "The year does not match the record." },
  anoNaoConfere: { pt: "ANO NÃO CONFERE", en: "YEAR DOES NOT MATCH" },
  registroNaTela: { pt: "Registro na tela. Agora o caderno.", en: "Record on screen. Now the register." },
  registroNaoEncontrado: { pt: "REGISTRO NÃO ENCONTRADO", en: "RECORD NOT FOUND" },
  outroNome: {
    pt: "Esse não é o nome que está no terminal.",
    en: "That is not the name on the terminal.",
  },
  digitalOk: { pt: "Digital reconhecida.", en: "Fingerprint recognized." },
  digitalEsgotada: {
    pt: "Quatro tentativas e nada. Pergunte o ano de nascimento.",
    en: "Four attempts, nothing. Ask for the year of birth.",
  },
  digitalFalhou: {
    pt: "Digital não reconhecida — tentativa {n} de 4.",
    en: "Fingerprint not recognized — attempt {n} of 4.",
  },
  saiuSemVotar: { pt: "A pessoa saiu da cabina sem votar.", en: "The voter left the booth without voting." },
  votoComputado: { pt: "Voto computado.", en: "Vote cast." },
};

const pad = (n, len) => String(n).padStart(len, "0");
const CABINA_MS = 2900;
const SAINDO_MS = 420; // o tempo do ícone atravessar a porta
const ABERTURA = 8 * 60; // 08:00
const ADIANTADO = 150; // quanto tempo à frente a fila já está no corredor

const relogio = (min) => `${pad(Math.floor(min / 60), 2)}:${pad(min % 60, 2)}`;
const emMinutos = (hora) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3));

/* O turno é sorteado a cada abertura da seção. `?turno=xyz` na URL prende a
   semente: o mesmo dia volta inteiro, na mesma ordem. */
const PINNED = new URLSearchParams(window.location.search).get("turno");

const initialState = {
  phase: "splash", // splash | menu | start | opening | tutorial | chamando | working | feedback | closing | end | bad
  index: 0,
  waiting: [], // quem ainda não foi chamado, em ordem de chegada
  clock: ABERTURA,
  served: 0,
  votes: 0,
  correct: 0,
  errors: 0,
  marks: [],
  result: null,
};

export default function App() {
  useIdioma();
  const [shift, setShift] = useState(() => makeShift(PINNED));
  const [state, setState] = useState(initialState);
  const [saved, setSaved] = useState(() => readSave());
  const [storageError, setStorageError] = useState(false);
  const [c, setC] = useState(newCase);
  // As assinaturas ficam no caderno o turno inteiro, não no caso da vez.
  const [signatures, setSignatures] = useState({});
  const [leaving, setLeaving] = useState(null);
  /* A visita da coordenadora antes de abrir a porta: em que passo do roteiro
     ela está e o que já foi dito. O roteiro em si mora em data/tutorial.js. */
  const [tutor, setTutor] = useState(null);
  const [toast, setToast] = useState("");
  const [live, setLive] = useState("");
  const toastTimer = useRef(null);
  const cabinaTimer = useRef(null);
  const leaveTimer = useRef(null);
  const deskRef = useRef(null);
  const restoreSpots = useRef(null);

  const { phase, index, waiting, clock, served, correct, errors, marks, result } = state;
  const running = phase === "working";
  const people = shift.people;
  const total = people.length;
  const atMesa = phase === "working" || phase === "feedback";
  const passo = phase === "tutorial" && tutor ? PASSOS[tutor.i] : null;
  /* O que fica aceso agora. Sem tutorial não há foco nenhum, e a sala inteira
     volta a ser o que era. */
  const foco = passo?.foco ?? null;
  const person = atMesa ? people[index] : null;
  const calling = phase === "chamando";

  /* Quem já está no corredor: chegou (o horário dela alcançou o relógio) e
     ainda não foi chamada. Quem tem preferência passa na frente. */
  const corredor = waiting.filter((i) => emMinutos(people[i].time) <= clock + ADIANTADO);

  const say = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(toastTimer.current);
      clearTimeout(cabinaTimer.current);
      clearTimeout(leaveTimer.current);
    },
    [],
  );

  // O resto da fila, que não tem rosto: cresce a cada ocorrência.
  const proxima = people[corredor[0] ?? waiting[0]];
  const crowd = ["closing", "end", "bad"].includes(phase) ? 0 : Math.max(
    0,
    (proxima?.queue ?? 0) + errors * 2 - Math.floor(correct / 4) - corredor.length,
  );
  const hora = relogio(clock);

  // A remoção interrompe também qualquer cabina ou animação ainda em andamento.
  useEffect(() => {
    if (phase !== "bad") return;
    clearTimeout(cabinaTimer.current);
    clearTimeout(leaveTimer.current);
    clearTimeout(toastTimer.current);
    setLeaving(null);
    setToast("");
    setLive(t(AVISO.dispensada));
  }, [phase]);

  useEffect(() => {
    if (running && person) setLive(t(AVISO.chegou, { nome: person.name }));
    else if (calling) setLive(t(AVISO.corredor, { n: corredor.length }));
  }, [running, calling, person, corredor.length]);

  /* Se ninguém chegou ainda, a seção espera: o relógio pula para a hora de
     quem vem primeiro. */
  useEffect(() => {
    if (!calling || corredor.length || !waiting.length) return;
    const proximo = Math.min(...waiting.map((i) => emMinutos(people[i].time)));
    setState((s) => ({ ...s, clock: Math.max(s.clock, proximo) }));
  }, [calling, corredor.length, waiting, people]);

  /* ------------------------------------------------------------ o turno -- */

  const clearActivity = useCallback(() => {
    clearTimeout(cabinaTimer.current);
    clearTimeout(leaveTimer.current);
    clearTimeout(toastTimer.current);
    setLeaving(null);
    setToast("");
    setLive("");
  }, []);

  const newGame = useCallback(() => {
    clearActivity();
    const novo = makeShift(PINNED);
    setShift(novo);
    setState({ ...initialState, phase: "start", waiting: novo.people.map((_, i) => i) });
    setC(newCase());
    setTutor(null);
    setSignatures({});
    setSaved(null);
    deskRef.current?.restore(SPOTS);
    tone("ok");
  }, [clearActivity]);

  const returnToMenu = useCallback(() => {
    clearActivity();
    if (SAVABLE_PHASES.includes(phase)) {
      setStorageError(!writeSave(snapshot({ shift, state, c, signatures, tutor, spots: deskRef.current?.spots ?? SPOTS })));
      setSaved(readSave());
    } else if (["end", "bad"].includes(phase)) setSaved(null);
    else setSaved(readSave());
    setTutor(null);
    setState((s) => ({ ...s, phase: "menu" }));
  }, [clearActivity, phase, shift, state, c, signatures, tutor]);

  const loadGame = useCallback(() => {
    const loaded = readSave();
    setSaved(loaded);
    if (!loaded) return;
    clearActivity();
    setShift(loaded.shift);
    setState(loaded.state);
    setC(loaded.c);
    setSignatures(loaded.signatures);
    setTutor(loaded.state.phase === "tutorial" ? loaded.tutor : null);
    restoreSpots.current = { ...SPOTS, ...loaded.spots };
    tone("ok");
  }, [clearActivity]);

  const open = useCallback(() => {
    tone("ok");
    setState((s) => ({ ...s, phase: "opening" }));
  }, []);

  /* Impressa a zerésima, quem entra na sala é a coordenadora. */
  const start = useCallback(() => {
    setState((s) => ({ ...s, phase: "tutorial" }));
    setC(newCase());
    setTutor({ i: 0, log: t(PASSOS[0].fala).map((texto) => ({ texto })) });
  }, []);

  const abrirPorta = useCallback(() => {
    setTutor(null);
    setState((s) => ({ ...s, phase: "chamando" }));
  }, []);

  /* Ela mostrou a mesa peça por peça, e cada uma subiu na pilha para aparecer.
     Fechada a explicação, a mesa volta à arrumação da abertura. */
  const fecharTutorial = useCallback(() => {
    deskRef.current?.restack(SPOTS);
    abrirPorta();
  }, [abrirPorta]);

  /* Andar no roteiro: o que a mesa respondeu entra na conversa antes das falas
     do passo seguinte. `alvo` é um índice ou o `id` de um passo. */
  const tutorIr = useCallback((alvo, minha) => {
    setTutor((atual) => {
      if (!atual) return atual;
      const i = typeof alvo === "number" ? alvo : indiceDe(alvo);
      if (i < 0 || i >= PASSOS.length) return atual;
      const log = [...atual.log];
      if (minha) log.push({ own: true, texto: minha });
      for (const texto of t(PASSOS[i].fala)) log.push({ texto });
      return { i, log };
    });
  }, []);

  const tutorEscolha = useCallback(
    (op) => {
      if (op.vai) tutorIr(op.vai, t(op.diz));
      else fecharTutorial();
    },
    [tutorIr, fecharTutorial],
  );

  const tutorSeguir = useCallback(() => {
    if (!tutor) return;
    if (PASSOS[tutor.i].fecha) fecharTutorial();
    else tutorIr(tutor.i + 1);
  }, [tutor, tutorIr, fecharTutorial]);

  const tutorProps = useMemo(
    () =>
      passo && tutor
        ? { passo, log: tutor.log, onEscolha: tutorEscolha, onSeguir: tutorSeguir, onPular: fecharTutorial }
        : null,
    [passo, tutor, tutorEscolha, tutorSeguir, fecharTutorial],
  );

  /* A chamada aceita qualquer pessoa presente. Desrespeitar a preferência
     ou a chegada abre ocorrência, mas o atendimento escolhido continua. */
  const call = useCallback(
    (i) => {
      if (phase !== "chamando" || !corredor.includes(i)) return;
      const issue = queueIssue(people, corredor, i);
      tone(issue ? "error" : "beep");
      if (issue) say(t(AVISO.filaOcorrencia, { aviso: issue }));
      setLeaving(i);
      clearTimeout(leaveTimer.current);
      leaveTimer.current = setTimeout(() => {
        setLeaving(null);
        setState((s) => ({ ...s, waiting: s.waiting.filter((x) => x !== i) }));
      }, SAINDO_MS);
      setState((s) => {
        if (s.phase !== "chamando") return s;
        const next = { ...s, phase: "working", index: i, clock: Math.max(s.clock, emMinutos(people[i].time)) };
        return issue ? recordError(next) : next;
      });
      setC({ ...newCase(), queueIssue: issue });
    },
    [phase, corredor, people, say],
  );

  /* Atalho disponível só no desenvolvimento: permite revisar o fechamento. */
  const skipToEnd = useCallback(() => {
    clearTimeout(cabinaTimer.current);
    clearTimeout(leaveTimer.current);
    setLeaving(null);
    setC(newCase());
    setTutor(null);
    setState((s) => ({
      ...s,
      phase: "closing",
      waiting: [],
      served: total,
      correct: total,
      errors: 0,
      marks: Array.from({ length: total }, () => "ok"),
      clock: 17 * 60,
      result: null,
    }));
  }, [total]);

  const next = useCallback(() => {
    clearTimeout(cabinaTimer.current);
    setC(newCase());
    setState(afterFeedback);
  }, []);

  const finishDay = useCallback(() => {
    tone("ok");
    setState((s) => s.phase === "closing" ? { ...s, phase: "end" } : s);
  }, []);

  /* Fecha o atendimento: julga a saída escolhida e abre o retorno. */
  const resolve = useCallback(
    (action) => {
      if (!running || !person) return;
      clearTimeout(cabinaTimer.current);
      const decision = judge(person, action, c);
      const v = withQueueIssue(decision, c.queueIssue);
      tone(v.right ? "ok" : "error");

      setState((s) => finishCase(s, decision, v, c.voted));
    },
    [running, person, c],
  );

  /* ------------------------------------------------- as peças da mesa --- */

  // Toda peça passa por aqui: fora da vez, o pedido é recusado com um aviso.
  const gate = useCallback(
    (piece) => {
      if (!running || !person) return false;
      if (allowed(c.step, piece)) return true;
      say(refusal(c.step));
      return false;
    },
    [running, person, c.step, say],
  );

  const onKey = useCallback(
    (kind, value) => {
      if (!running || !person) return;
      if (!allowed(c.step, "terminal")) {
        say(refusal(c.step));
        return;
      }

      if (kind === "digit") {
        if (c.typed.length >= 4) return;
        setC((x) => ({ ...x, typed: x.typed + value, refused: "" }));
        return;
      }

      if (kind === "clear") {
        setC((x) => ({ ...x, typed: "", refused: "" }));
        return;
      }

      // CONFIRMA
      if (c.step === "ano") {
        const year = person.reg.birth.slice(-4);
        if (c.typed === year) {
          tone("ok");
          say(t(AVISO.anoConfere));
          setC((x) => ({ ...x, typed: "", refused: "", biografica: true, step: "assinatura" }));
        } else if (c.typed.length < 4) {
          setC((x) => ({ ...x, refused: t(AVISO.anoIncompleto) }));
        } else {
          tone("error");
          say(t(AVISO.anoErrado));
          setC((x) => ({ ...x, typed: "", refused: t(AVISO.anoNaoConfere), step: "decisao" }));
        }
        return;
      }

      if (c.typed === person.doc.code) {
        tone("ok");
        setC((x) => ({ ...x, typed: "", refused: "", loaded: true, step: "caderno" }));
        say(t(AVISO.registroNaTela));
      } else {
        tone("error");
        setC((x) => ({ ...x, typed: "", refused: t(AVISO.registroNaoEncontrado) }));
      }
    },
    [running, person, c.step, c.typed, say],
  );

  const onRow = useCallback(
    (row) => {
      if (!gate("caderno")) return;
      if (row.name !== person.reg.name) {
        say(t(AVISO.outroNome));
        return;
      }
      tone("ok");
      setC((x) => ({ ...x, marked: row.seq, step: "biometria" }));
    },
    [gate, person, say],
  );

  const firmar = useCallback((who) => {
    if (!who?.seq) return;
    setSignatures((s) => (s[who.seq] ? s : { ...s, [who.seq]: { hand: who.hand, name: who.name } }));
  }, []);

  const onSign = useCallback(() => {
    if (!gate("caderno")) return;
    firmar(person);
    setC((x) => ({ ...x, signed: true, step: "cabina" }));
  }, [gate, firmar, person]);

  const onRead = useCallback(() => {
    if (!gate("leitor")) return;
    const reading = person.bio[Math.min(c.tries, person.bio.length - 1)];
    const tries = c.tries + 1;

    if (reading === "ok") {
      tone("ok");
      say(t(AVISO.digitalOk));
      setC((x) => ({ ...x, tries, bio: "ok", step: "cabina" }));
      return;
    }

    tone("error");
    if (tries >= 4) {
      say(t(AVISO.digitalEsgotada));
      setC((x) => ({ ...x, tries, bio: "esgotada", step: "ano" }));
      return;
    }
    say(t(AVISO.digitalFalhou, { n: tries }));
    setC((x) => ({ ...x, tries, bio: "fail" }));
  }, [gate, person, c.tries, say]);

  const onGiveBack = useCallback(
    (kind) => {
      if (!gate("pertence")) return false;
      setC((x) => (x.given.includes(kind) ? x : { ...x, given: [...x.given, kind] }));
      return true;
    },
    [gate],
  );

  const onGiveDoc = useCallback(() => {
    if (!gate("doc")) return false;
    setC((x) => ({ ...x, docBack: true }));
    return true;
  }, [gate]);

  const onGive = useCallback(() => {
    if (!gate("comprovante")) return false;
    setC((x) => ({ ...x, receipt: true }));
    return true;
  }, [gate]);

  /* Tudo o que é da pessoa volta para a mão dela pelo mesmo gesto: arrastar
     até ela. Não há mais mesa de apoio no caminho. */
  const onDrop = useCallback(
    (id, target) => {
      if (target !== "pessoa") return false;
      if (id.startsWith("item-")) return onGiveBack(id.slice(5));
      if (id === "doc") return onGiveDoc();
      if (id === "comprovante") return onGive();
      return false;
    },
    [onGiveBack, onGiveDoc, onGive],
  );

  const desk = useDesk(SPOTS, onDrop);

  useEffect(() => {
    deskRef.current = desk;
  });

  /* Achar o nome na listagem de impedidos é o mesmo gesto do caderno: só vale
     quando é o nome que está no terminal. */
  const onList = useCallback(
    (name) => {
      if (!person) return;
      if (name !== person.reg.name) {
        say(t(AVISO.outroNome));
        return;
      }
      tone("ok");
      setC((x) => ({ ...x, consulted: name }));
    },
    [person, say],
  );

  const onAction = useCallback(
    (id) => {
      if (!running || !person) return;
      resolve(id);
    },
    [running, person, resolve],
  );

  /* Perguntar não decide nada: só acrescenta uma troca à conversa, marca o que
     a pergunta marcar e destrava o que ela destravar. */
  const onAsk = useCallback(
    (id) => {
      if (!running || !person) return;
      const q = PERGUNTAS[id];
      if (!q) return;
      const dita = responder(q, person);
      setC((x) => ({
        ...x,
        asked: q.marca === "asked" ? true : x.asked,
        perguntadas: x.perguntadas.includes(id) ? x.perguntadas : [...x.perguntadas, id],
        aberto: [...new Set([...x.aberto, ...(q.abre ?? [])])],
        // A conversa guarda texto, não par: é registro do que foi dito.
        dialogo: [...x.dialogo, { id, mesa: t(q.fala ?? q.label), pessoa: dita }],
      }));
    },
    [running, person],
  );

  /* A cabina: a pessoa some por um instante e volta — ou não vota. */
  useEffect(() => {
    if (!running || !person || c.step !== "cabina") return undefined;
    cabinaTimer.current = setTimeout(() => {
      if (person.quits) {
        tone("error");
        say(t(AVISO.saiuSemVotar));
        setC((x) => ({ ...x, step: "decisao" }));
        return;
      }
      tone("vote");
      say(t(AVISO.votoComputado));
      firmar(person);
      setC((x) => ({ ...x, voted: true, step: "entrega" }));
    }, CABINA_MS);
    return () => clearTimeout(cabinaTimer.current);
  }, [running, person, c.step, say, firmar]);

  /* Devolvidos os pertences e entregue o comprovante, o atendimento acabou. */
  useEffect(() => {
    if (!running || !person || c.step !== "entrega") return;
    const pertences = person.belongings.every((b) => c.given.includes(b));
    if (pertences && c.docBack && c.receipt) resolve("fluxo");
  }, [running, person, c.step, c.given, c.docBack, c.receipt, resolve]);

  // Os pertences voltam para o lugar quando chega a próxima pessoa.
  useEffect(() => {
    desk.reset(ITEM_SPOTS);
  }, [index, desk.reset]);

  /* O que a pessoa larga na carteira pousa por cima do que já estava lá: o
     documento quando ela chega, os pertences antes de ela ir votar, e o
     comprovante quando a urna termina. */
  useEffect(() => {
    if (person) desk.raise("doc");
  }, [person, desk.raise]);

  useEffect(() => {
    if (!person) return;
    if (c.step === "cabina") person.belongings.forEach((kind) => desk.raise(`item-${kind}`));
    if (c.step === "entrega") desk.raise("comprovante");
  }, [person, c.step, desk.raise]);

  /* A peça da vez sobe na pilha. Sem isto, uma folha consultada há dois
     atendimentos podia estar por cima do leitor na hora de pedir a digital. */
  useEffect(() => {
    const dono = { terminal: "terminal", ano: "terminal", caderno: "caderno", assinatura: "caderno", biometria: "leitor" }[
      c.step
    ];
    if (running && dono) desk.raise(dono);
  }, [running, c.step, desk.raise]);

  /* No tutorial, a peça acesa sobe na pilha: não adianta acender o caderno se
     ele está debaixo do terminal. */
  useEffect(() => {
    if (foco) foco.forEach((id) => desk.raise(id));
  }, [foco, desk.raise]);

  /* O que volta para a mão da pessoa sai da mesa e retoma o lugar de origem —
     senão o documento da próxima pessoa nasceria lá onde este foi largado, meio
     fora da mesa. */
  useEffect(() => {
    const patch = {};
    if (c.docBack) patch.doc = SPOTS.doc;
    if (c.receipt) patch.comprovante = SPOTS.comprovante;
    for (const kind of c.given) patch[`item-${kind}`] = SPOTS[`item-${kind}`];
    if (Object.keys(patch).length) desk.reset(patch);
  }, [c.docBack, c.receipt, c.given, desk.reset]);

  // Restaura depois dos efeitos de chegada, que normalmente arrumam a mesa.
  useEffect(() => {
    if (!restoreSpots.current) return;
    desk.restore(restoreSpots.current);
    restoreSpots.current = null;
  });

  useEffect(() => {
    if (["end", "bad"].includes(phase)) {
      clearSave();
      setSaved(null);
      return;
    }
    if (!SAVABLE_PHASES.includes(phase)) return;
    setStorageError(!writeSave(snapshot({ shift, state, c, signatures, tutor, spots: desk.spots })));
  }, [phase, shift, state, c, signatures, tutor, desk.spots]);

  /* ----------------------------------------------------------- teclado -- */

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.defaultPrevented || e.target.closest?.(".biometric-hand")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Escape" && ["tutorial", "chamando", "working", "feedback"].includes(phase)) {
        e.preventDefault();
        returnToMenu();
        return;
      }

      if (phase === "feedback" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        next();
        return;
      }
      if (phase !== "working") return;

      if (/^[0-9]$/.test(e.key)) {
        onKey("digit", e.key);
        return;
      }
      if (e.key === "Enter") {
        onKey("confirm");
        return;
      }
      if (e.key === "Backspace") {
        e.preventDefault();
        onKey("clear");
        return;
      }

      const key = e.key.toUpperCase();
      if (key === "B") {
        e.preventDefault();
        document.querySelector(".biometric-hand")?.focus({ preventScroll: true });
        return;
      }
      const action = ACTIONS.find((a) => a.hotkey === key);
      if (action) onAction(action.id);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, next, onKey, onRead, onAction, returnToMenu]);

  const on = useMemo(
    () => ({
      key: onKey,
      row: onRow,
      sign: onSign,
      read: onRead,
      giveBack: onGiveBack,
      giveDoc: onGiveDoc,
      give: onGive,
      list: onList,
      action: onAction,
    }),
    [onKey, onRow, onSign, onRead, onGiveBack, onGiveDoc, onGive, onList, onAction],
  );

  return (
    <>
      {!["splash", "menu", "start"].includes(phase) && <main className="app" inert={["opening", "feedback", "closing", "end", "bad"].includes(phase)}>
        <TopBar
          time={hora}
          crowd={crowd}
          people={people}
          waiting={corredor}
          leaving={leaving}
          onCall={call}
          calling={calling}
          served={served}
          errors={errors}
          total={total}
          marks={marks}
          onSkip={import.meta.env.DEV ? skipToEnd : undefined}
          onMenu={returnToMenu}
          foco={foco}
        />

        <div className="board">
          <PersonPanel
            person={person}
            running={atMesa}
            calling={calling}
            c={c}
            onAsk={onAsk}
            cabina={c.step === "cabina" ? "fora" : c.voted && c.step === "entrega" ? "voltando" : null}
            areaRef={desk.target("pessoa")}
            tutor={tutorProps}
            foco={foco}
          />
          <Desk
            person={person}
            c={c}
            ledger={shift.ledger}
            signatures={signatures}
            blocked={shift.blocked}
            time={clock}
            desk={desk}
            on={on}
            running={running}
            foco={foco}
          />
        </div>
      </main>}

      <div className={toast ? "toast show" : "toast"} role="status">
        {toast || "—"}
      </div>
      <p className="sr" aria-live="polite">
        {live}
      </p>

      {phase === "splash" && <StudioIntro onFinish={returnToMenu} />}
      {phase === "menu" && <GameMenu canLoad={!!saved} onNew={newGame} onLoad={loadGame} storageError={storageError} />}
      {phase === "start" && <StartModal onStart={open} />}
      {phase === "opening" && <OpeningModal seedText={shift.seed} onStart={start} />}
      {phase === "feedback" && result && (
        <FeedbackModal result={result} last={waiting.length === 0} onNext={next} />
      )}
      {phase === "closing" && <Closing seedText={shift.seed} votes={state.votes} onFinish={finishDay} />}
      {["end", "bad"].includes(phase) && (
        <Ending bad={phase === "bad"} onMenu={returnToMenu} />
      )}
    </>
  );
}
