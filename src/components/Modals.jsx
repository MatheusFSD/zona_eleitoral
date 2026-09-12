import { useEffect, useRef } from "react";
import { TXT, t } from "../i18n.js";

export { default as StartModal } from "./Story.jsx";

export function FeedbackModal({ result, last, onNext }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return <div className="overlay">
    <section className="feedback" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
      <div className={`stamp ${result.right ? "good" : "bad"}`}>{result.stamp}</div>
      <h2 id="feedback-title">{result.title}</h2>
      <p>{result.text}</p>
      <button className="primary" ref={ref} onClick={onNext}>{t(last ? TXT.encerrar : TXT.continuar)}</button>
    </section>
  </div>;
}
