import { useEffect, useRef, useState } from "react";
import { Urn } from "./Opening.jsx";
import UrnReport from "./UrnReport.jsx";
import { tone } from "../sound.js";
import { t } from "../i18n.js";
import "./closing.css";

export default function Closing({ seedText, votes = 0, onFinish }) {
  const [stage, setStage] = useState("printing");
  const scene = useRef(null);
  const finish = useRef(onFinish);
  finish.current = onFinish;

  useEffect(() => {
    scene.current?.focus();
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    tone("beep");
    const timers = [
      setTimeout(() => setStage("packing"), reduced ? 700 : 4000),
      setTimeout(() => { setStage("sealed"); tone("ok"); }, reduced ? 1400 : 6600),
      setTimeout(() => finish.current(), reduced ? 2100 : 8500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return <div className="closing-film" ref={scene} tabIndex={-1} role="dialog" aria-modal="true" aria-label={t({ pt: "A urna imprime o papel e é guardada na caixa", en: "The machine prints the tape and is packed into its box" })}>
    <div className={`packing-scene ${stage}`}>
      <div className="packing-window"><i /><i /></div>
      <div className="packing-desk" />
      <div className="packing-box-back" />
      <div className="packing-urn"><div className="urna-cena"><Urn lit={stage === "printing"} closing>
        <div className="fita"><UrnReport seedText={seedText} votes={votes} closing /></div>
      </Urn></div></div>
      <div className="packing-box" aria-hidden="true"><div className="packing-lid" /><div className="packing-tape" /><span>↑ ↑</span></div>
    </div>
  </div>;
}
