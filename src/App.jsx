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
import { EndModal, FeedbackModal, StartModal } from "./components/Modals.jsx";
import OpeningModal from "./components/Opening.jsx";

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
  phase: "start", // start | opening | tutorial | chamando | working | feedback | end
  index: 0,
  waiting: [], // quem ainda não foi chamado, em ordem de chegada
  clock: ABERTURA,
  served: 0,
  correct: 0,
  errors: 0,
  marks: [],
  result: null,
};

export default function App() {
  const [shift, setShift] = useState(() => makeShift(PINNED));
  const [state, setState] = useState(initialState);
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
  const crowd = Math.max(
    0,
    (proxima?.queue ?? 0) + errors * 2 - Math.floor(correct / 4) - corredor.length,
  );
  const hora = phase === "end" ? "17:00" : relogio(clock);

  useEffect(() => {
    if (running && person) setLive(`${person.name} chegou à mesa.`);
    else if (calling) setLive(`${corredor.length} pessoas no corredor. Chame a próxima.`);
  }, [running, calling, person, corredor.length]);

  /* Se ninguém chegou ainda, a seção espera: o relógio pula para a hora de
     quem vem primeiro. */
  useEffect(() => {
    if (!calling || corredor.length || !waiting.length) return;
    const proximo = Math.min(...waiting.map((i) => emMinutos(people[i].time)));
    setState((s) => ({ ...s, clock: Math.max(s.clock, proximo) }));
  }, [calling, corredor.length, waiting, people]);

  /* ------------------------------------------------------------ o turno -- */

  /* A fila do dia inteiro é montada aqui, antes da primeira pessoa entrar. */
  const open = useCallback(() => {
    tone("ok");
    const novo = PINNED ? null : makeShift();
    if (novo) setShift(novo);
    setState({
      ...initialState,
      phase: "opening",
      waiting: (novo ?? shift).people.map((_, i) => i),
    });
    setC(newCase());
    setSignatures({});
  }, [shift]);

  /* Impressa a zerésima, quem entra na sala é a coordenadora. */
  const start = useCallback(() => {
    setState((s) => ({ ...s, phase: "tutorial" }));
    setC(newCase());
    setTutor({ i: 0, log: PASSOS[0].fala.map((texto) => ({ texto })) });
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
    setTutor((t) => {
      if (!t) return t;
      const i = typeof alvo === "number" ? alvo : indiceDe(alvo);
      if (i < 0 || i >= PASSOS.length) return t;
      const log = [...t.log];
      if (minha) log.push({ own: true, texto: minha });
      for (const texto of PASSOS[i].fala) log.push({ texto });
      return { i, log };
    });
  }, []);

  const tutorEscolha = useCallback(
    (op) => {
      if (op.vai) tutorIr(op.vai, op.diz);
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
      if (issue) say(`Ocorrência na fila: ${issue}`);
      setLeaving(i);
      clearTimeout(leaveTimer.current);
      leaveTimer.current = setTimeout(() => {
        setLeaving(null);
        setState((s) => ({ ...s, waiting: s.waiting.filter((x) => x !== i) }));
      }, SAINDO_MS);
      setState((s) => ({
        ...s,
        phase: "working",
        index: i,
        errors: s.errors + Number(!!issue),
        clock: Math.max(s.clock, emMinutos(people[i].time)),
      }));
      setC({ ...newCase(), queueIssue: issue });
    },
    [phase, corredor, people, say],
  );

  /* Atalho de desenvolvimento: encerra o dia com tudo resolvido, para poder
     olhar o boletim sem jogar os doze atendimentos. */
  const skipToEnd = useCallback(() => {
    clearTimeout(cabinaTimer.current);
    setC(newCase());
    setTutor(null);
    setState((s) => ({
      ...s,
      phase: "end",
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
    setState((s) => ({ ...s, phase: s.waiting.length ? "chamando" : "end", result: null }));
  }, []);

  /* Fecha o atendimento: julga a saída escolhida e abre o retorno. */
  const resolve = useCallback(
    (action) => {
      if (!running || !person) return;
      clearTimeout(cabinaTimer.current);
      const decision = judge(person, action, c);
      const v = withQueueIssue(decision, c.queueIssue);
      tone(v.right ? "ok" : "error");

      setState((s) => {
        const list = s.marks.slice();
        list[s.index] = v.right ? "ok" : "err";
        // A ocorrência da chamada já entrou no contador. Só uma decisão
        // incorreta durante o atendimento acrescenta outra ocorrência.
        const nextErrors = s.errors + Number(!decision.right);
        return {
          ...s,
          phase: "feedback",
          clock: s.clock + v.minutes,
          served: s.served + 1,
          correct: v.right ? s.correct + 1 : s.correct,
          errors: nextErrors,
          marks: list,
          result: {
            right: v.right,
            title: v.title,
            stamp: v.stamp,
            text: v.text,
            meta: `Tempo de mesa: ${v.minutes} min · Ocorrências: ${pad(nextErrors, 2)}`,
          },
        };
      });
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
          say("Ano confere. A pessoa assina o caderno.");
          setC((x) => ({ ...x, typed: "", refused: "", biografica: true, step: "assinatura" }));
        } else if (c.typed.length < 4) {
          setC((x) => ({ ...x, refused: "ANO INCOMPLETO" }));
        } else {
          tone("error");
          say("O ano não confere com o cadastro.");
          setC((x) => ({ ...x, typed: "", refused: "ANO NÃO CONFERE", step: "decisao" }));
        }
        return;
      }

      if (c.typed === person.doc.code) {
        tone("ok");
        setC((x) => ({ ...x, typed: "", refused: "", loaded: true, step: "caderno" }));
        say("Registro na tela. Agora o caderno.");
      } else {
        tone("error");
        setC((x) => ({ ...x, typed: "", refused: "REGISTRO NÃO ENCONTRADO" }));
      }
    },
    [running, person, c.step, c.typed, say],
  );

  const onRow = useCallback(
    (row) => {
      if (!gate("caderno")) return;
      if (row.name !== person.reg.name) {
        say("Esse não é o nome que está no terminal.");
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
      say("Digital reconhecida.");
      setC((x) => ({ ...x, tries, bio: "ok", step: "cabina" }));
      return;
    }

    tone("error");
    if (tries >= 4) {
      say("Quatro tentativas e nada. Pergunte o ano de nascimento.");
      setC((x) => ({ ...x, tries, bio: "esgotada", step: "ano" }));
      return;
    }
    say(`Digital não reconhecida — tentativa ${tries} de 4.`);
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
        say("Esse não é o nome que está no terminal.");
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
        dialogo: [...x.dialogo, { id, mesa: q.fala ?? q.label, pessoa: dita }],
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
        say("A pessoa saiu da cabina sem votar.");
        setC((x) => ({ ...x, step: "decisao" }));
        return;
      }
      tone("vote");
      say("Voto computado.");
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

  /* ----------------------------------------------------------- teclado -- */

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

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
        onRead();
        return;
      }
      const action = ACTIONS.find((a) => a.hotkey === key);
      if (action) onAction(action.id);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, next, onKey, onRead, onAction]);

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
      <main className="app">
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
          onSkip={skipToEnd}
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
            calling={calling}
            c={c}
            ledger={shift.ledger}
            signatures={signatures}
            blocked={shift.blocked}
            time={clock}
            desk={desk}
            on={on}
            running={running}
            foco={foco}
            objetivo={passo?.objetivo}
          />
        </div>
      </main>

      <div className={toast ? "toast show" : "toast"} role="status">
        {toast || "—"}
      </div>
      <p className="sr" aria-live="polite">
        {live}
      </p>

      {phase === "start" && <StartModal total={total} onStart={open} />}
      {phase === "opening" && <OpeningModal seedText={shift.seed} onStart={start} />}
      {phase === "feedback" && result && (
        <FeedbackModal result={result} last={waiting.length === 0} onNext={next} />
      )}
      {phase === "end" && (
        <EndModal served={served} correct={correct} errors={errors} total={total} seed={shift.seed} onRestart={open} />
      )}
    </>
  );
}
