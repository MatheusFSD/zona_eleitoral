import { useEffect, useRef } from "react";

function useAutoFocus(active) {
  const ref = useRef(null);
  useEffect(() => {
    if (active && ref.current) ref.current.focus();
  }, [active]);
  return ref;
}

export { default as StartModal } from "./Story.jsx";

export function FeedbackModal({ result, last, onNext }) {
  const ref = useAutoFocus(true);

  return (
    <div className="overlay">
      <section className="feedback" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
        <div className={`stamp ${result.right ? "good" : "bad"}`}>{result.stamp}</div>
        <h2 id="feedback-title">{result.title}</h2>
        <p>{result.text}</p>
        <div className="feedback-meta">{result.meta}</div>
        <button className="primary" ref={ref} onClick={onNext}>
          {last ? "Encerrar votação" : "Próxima pessoa"}
        </button>
      </section>
    </div>
  );
}

export function EndModal({ served, correct, errors, total, seed, onRestart }) {
  const ref = useAutoFocus(true);

  const ending =
    errors === 0
      ? {
          line: "Você manteve o procedimento mesmo quando a fila virou um corredor inteiro.",
          summary:
            "A seção encerrou sem ocorrências. Você conferiu padrões com cuidado e soube quando uma exceção exigia tempo.",
        }
      : errors <= 3
        ? {
            line: "A porta fechou, mas algumas decisões continuam ecoando na sala.",
            summary:
              "A seção funcionou, com poucas ocorrências. A pressão fez você cortar caminho em alguns casos — exatamente a tensão central deste protótipo.",
          }
        : {
            line: "A fila andou. O procedimento, nem sempre.",
            summary: "Houve várias ocorrências. O conflito apareceu: velocidade e certeza raramente caminham juntas.",
          };

  return (
    <div className="overlay">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="end-title">
        <div className="modal-kicker">Boletim de encerramento</div>
        <h2 id="end-title">A porta finalmente fechou.</h2>
        <p className="intro">{ending.line}</p>
        <div className="stats">
          <div className="stat">
            <span>Atendidos</span>
            <strong>{served}</strong>
          </div>
          <div className="stat">
            <span>Corretos</span>
            <strong>
              {correct}/{total}
            </strong>
          </div>
          <div className="stat">
            <span>Ocorrências</span>
            <strong>{errors}</strong>
          </div>
        </div>
        <p>{ending.summary}</p>
        {/* As doze pessoas são sorteadas; a semente é o que permite repetir o dia. */}
        <p className="hint">
          Turno <b>{seed}</b> · para repetir este dia, abra a página com ?turno={seed}
        </p>
        <button className="primary" ref={ref} onClick={onRestart}>
          Jogar novamente
        </button>
      </section>
    </div>
  );
}
