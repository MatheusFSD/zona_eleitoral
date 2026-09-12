import { useCallback, useEffect, useId, useRef, useState } from "react";

import { PERGUNTAS, disponiveis } from "../data/talk.js";
import { TXT, t } from "../i18n.js";

function Bubble({ own = false, children }) {
  return (
    <div className={`chat-bubble${own ? " own" : ""}`}>
      <span className="chat-speaker">{t(own ? TXT.voceMesa : TXT.eleitor)}</span>
      <p>{children}</p>
    </div>
  );
}

function Exchange({ troca, animate, onReveal, onDone }) {
  const [stage, setStage] = useState(animate ? 0 : 2);
  useEffect(() => {
    if (!animate) return;
    const own = setTimeout(() => setStage(1), 350);
    const reply = setTimeout(() => { setStage(2); onDone(); }, 1200);
    return () => { clearTimeout(own); clearTimeout(reply); };
  }, [animate, onDone]);
  useEffect(() => { onReveal(); }, [stage, onReveal]);
  return (
    <div className="troca">
      {stage >= 1 && <Bubble own>{troca.mesa}</Bubble>}
      {stage === 2 ? <Bubble>{troca.pessoa}</Bubble> : <div className={`chat-wait${stage === 0 ? " own" : ""}`} aria-hidden="true"><i /><i /><i /></div>}
    </div>
  );
}

/* A conversa com quem está na mesa.

   Em cima, o que já foi dito — a fala de chegada e cada pergunta com a sua
   resposta. Embaixo, o que a mesa ainda pode perguntar. As perguntas em si
   moram em [talk.js](../data/talk.js): para criar uma nova, é lá. */

export default function Talk({ person, c, onAsk }) {
  const abertas = disponiveis(person, c);
  const fim = useRef(null);
  const initialCount = useRef(c.dialogo?.length ?? 0);
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const done = useCallback(() => { lock.current = false; setBusy(false); }, []);
  const scroll = useCallback(() => {
    if (fim.current) fim.current.scrollTop = fim.current.scrollHeight;
  }, []);
  const ask = (id) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setOpen(false);
    onAsk(id);
  };

  // A conversa acompanha a última fala, como quem olha para quem acabou de falar.
  useEffect(() => {
    scroll();
  }, [c.dialogo?.length, scroll]);

  return (
    <div className="conversa">
      <div className="dito" data-nodrag ref={fim} role="log" aria-label={t(TXT.conversaNaMesa)} aria-live="polite" aria-relevant="additions">
        <Bubble>{t(person.line)}</Bubble>

        {(c.dialogo ?? []).map((troca, i) => (
          <Exchange key={`${troca.id}-${i}`} troca={troca} animate={i >= initialCount.current} onReveal={scroll} onDone={done} />
        ))}
      </div>

      {abertas.length > 0 && (
        <div className={`chat-reply${open && !busy ? " is-open" : ""}`} data-nodrag
          onPointerEnter={(event) => { if (event.pointerType !== "touch" && !busy) setOpen(true); }}
          onPointerLeave={() => setOpen(false)}
          onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
          onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); event.stopPropagation(); } }}>
          <button type="button" className="chat-reply-icon" aria-label={t(TXT.responderEleitor)} aria-expanded={open && !busy} aria-controls={menuId} disabled={busy}
            onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) setOpen(true); }}
            onClick={() => setOpen(true)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-6 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><path d="M8 9h8M8 13h5" /></svg>
          </button>
          <div className="chat-reply-menu" id={menuId} hidden={!open || busy}>
          <div className="perguntas">
          {abertas.map((id) => (
            <button key={id} type="button" className="pergunta" onClick={() => ask(id)}>
              <span>{t(PERGUNTAS[id].label)}</span><span className="chat-send" aria-hidden="true">↗</span>
            </button>
          ))}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
