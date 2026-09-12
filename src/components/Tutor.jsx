import { useEffect, useRef, useState } from "react";

import { TXT, t } from "../i18n.js";

/* A conversa com a coordenadora.

   Mesmo painel do eleitor: o que já foi dito em cima, o que dá para responder
   embaixo. A diferença é que aqui quem conduz é ela — as falas chegam uma de
   cada vez, e o botão só aparece quando ela termina de falar.

   O roteiro está em [tutorial.js](../data/tutorial.js). */

const RITMO = 900; // quanto tempo cada fala dela fica no ar antes da próxima

function Bolha({ own = false, quem, children }) {
  return (
    <div className={`chat-bubble${own ? " own" : ""}`}>
      <span className="chat-speaker">{quem}</span>
      <p>{children}</p>
    </div>
  );
}

export default function Tutor({ passo, log, onEscolha, onSeguir, onPular }) {
  const [ditas, setDitas] = useState(0);
  const rolo = useRef(null);
  const falando = ditas < log.length;

  // As falas entram em fila, no ritmo de quem está explicando.
  useEffect(() => {
    if (!falando) return undefined;
    const espera = setTimeout(() => setDitas((n) => n + 1), ditas === 0 ? 200 : RITMO);
    return () => clearTimeout(espera);
  }, [ditas, falando]);

  useEffect(() => {
    if (rolo.current) rolo.current.scrollTop = rolo.current.scrollHeight;
  }, [ditas]);

  return (
    <div className="conversa tutorial-conversa">
      <div className="dito" data-nodrag ref={rolo} role="log" aria-label={t(TXT.conversaCoordenadora)} aria-live="polite" aria-relevant="additions">
        {log.slice(0, ditas).map((fala, i) => (
          <Bolha key={i} own={fala.own} quem={t(fala.own ? TXT.voceMesa : TXT.coordenadora)}>
            {fala.texto}
          </Bolha>
        ))}
        {falando && (
          <div className="chat-wait" aria-hidden="true">
            <i /><i /><i />
          </div>
        )}
      </div>

      {!falando && (
        <div className="perguntas tutorial-escolhas" data-nodrag>
          {passo.escolhas ? (
            passo.escolhas.map((op) => (
              <button key={op.vai} type="button" className="pergunta" onClick={() => onEscolha(op)}>
                <span>{t(op.label)}</span>
                <span className="chat-send" aria-hidden="true">↗</span>
              </button>
            ))
          ) : (
            <button type="button" className="pergunta" onClick={onSeguir}>
              <span>{t(passo.botao ?? TXT.continuar)}</span>
              <span className="chat-send" aria-hidden="true">↗</span>
            </button>
          )}
          {!passo.fecha && !passo.escolhas && (
            <button type="button" className="pular-tutorial" onClick={onPular}>
              {t(TXT.pularResto)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
