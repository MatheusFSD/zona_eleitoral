import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { faceOf } from "../face.js";
import { createScan, fingerInside } from "../biometric.js";
import { t } from "../i18n.js";

const MAO = {
  ajuda: {
    pt: "Arraste a mão e segure o indicador no leitor por três segundos. Pelo teclado, use as setas para mover e espaço para segurar.",
    en: "Drag the hand and hold the index finger on the reader for three seconds. On the keyboard, use the arrows to move and space to hold.",
  },
  mover: { pt: "Mover a mão de {nome}", en: "Move {nome}'s hand" },
};
import "./biometric-hand.css";

export default function BiometricHand({ person, sensor, onComplete, onProgress }) {
  const hand = useRef(null);
  const tip = useRef(null);
  const drag = useRef(null);
  const held = useRef(false);
  const scan = useRef(createScan());
  const complete = useRef(onComplete);
  complete.current = onComplete;
  const reportProgress = useRef(onProgress);
  reportProgress.current = onProgress;
  const [aligned, setAligned] = useState(false);
  const [holding, setHolding] = useState(false);
  const helpId = useId();
  const { skin, shirt } = faceOf(person);
  const position = useRef({ x: window.innerWidth * .27, y: -40 });

  const move = (x, y) => {
    const width = hand.current?.offsetWidth ?? 200;
    const height = hand.current?.offsetHeight ?? width * 300 / 220;
    // O braço vem de cima. O pulso pode sair da tela, mantendo o indicador
    // acessível até quando o leitor está perto de uma borda.
    position.current = {
      x: Math.max(16 - width * .62, Math.min(window.innerWidth - 16 - width * .62, x)),
      y: Math.max(16 - height * .9, Math.min(window.innerHeight - 16 - height * .9, y)),
    };
    if (hand.current) hand.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
  };
  const release = () => { held.current = false; drag.current = null; scan.current.reset(); setHolding(false); reportProgress.current(0); };

  useEffect(() => {
    let frame;
    const previousFocus = document.activeElement;
    hand.current?.focus({ preventScroll: true });
    const tick = (now) => {
      const fingertip = tip.current?.getBoundingClientRect();
      const glass = sensor.current?.getBoundingClientRect();
      const inside = !!fingertip && fingerInside({ x: fingertip.left + fingertip.width / 2, y: fingertip.top + fingertip.height / 2 }, glass);
      setAligned(inside);
      const result = scan.current.tick(now, inside && held.current && !document.hidden);
      reportProgress.current(Math.floor(result.progress * 100));
      if (result.complete) { held.current = false; complete.current(); return; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const cancel = () => release();
    const resize = () => { release(); move(position.current.x, position.current.y); };
    window.addEventListener("blur", cancel);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", cancel);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", cancel);
      if (document.activeElement === hand.current && previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [sensor]);

  const down = (event) => {
    event.stopPropagation();
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX - position.current.x, y: event.clientY - position.current.y };
    held.current = true;
    setHolding(true);
  };
  const pointerMove = (event) => {
    if (drag.current?.id !== event.pointerId) return;
    move(event.clientX - drag.current.x, event.clientY - drag.current.y);
  };
  const keyDown = (event) => {
    if (event.key === " ") { event.preventDefault(); held.current = true; setHolding(true); return; }
    const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (delta) { event.preventDefault(); const step = event.shiftKey ? 2 : 10; move(position.current.x + delta[0] * step, position.current.y + delta[1] * step); }
    if (event.key === "Escape") release();
  };

  return createPortal(<div className="biometric-layer" onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
    <span className="sr" id={helpId}>{t(MAO.ajuda)}</span>
    <div ref={hand} className={`biometric-hand${holding ? " is-held" : ""}${aligned ? " is-aligned" : ""}`} role="button" tabIndex={0} aria-label={t(MAO.mover, { nome: person.name })} aria-describedby={helpId}
      style={{ transform: `translate3d(${position.current.x}px, ${position.current.y}px, 0)` }}
      onPointerDown={down} onPointerMove={pointerMove} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}
      onKeyDown={keyDown} onKeyUp={e => { if (e.key === " ") { e.preventDefault(); release(); } }} onBlur={release} onContextMenu={e => e.preventDefault()}>
      <svg viewBox="0 0 220 300" aria-hidden="true">
        {/* Dorso: dedos separados, unhas e nós dos dedos. Sem linhas da palma.
            O SVG gira no CSS, mantendo o braço acima e o indicador abaixo. */}
        <path d="M73 300V237Q48 219 43 187L20 155Q11 142 23 133Q34 125 44 138L64 158V30Q64 10 83 10Q102 10 102 30V122L105 69Q106 52 121 53Q138 54 137 73L136 132L142 92Q144 77 158 80Q173 83 170 100L162 150L172 120Q176 107 188 113Q201 119 195 135L180 197Q176 226 157 240V300Z" fill={skin} />
        <path d="M157 240Q176 226 180 197L195 135Q201 119 188 113L176 166L165 207Q158 224 144 229V278H157Z" fill="#733e36" opacity=".20" />
        <g fill="#fff0de" fillOpacity=".65" stroke="#733e36" strokeOpacity=".2" strokeWidth="1.5">
          <rect x="71" y="17" width="24" height="30" rx="9" />
          <rect x="111" y="60" width="19" height="24" rx="7" transform="rotate(3 120 72)" />
          <rect x="147" y="87" width="17" height="22" rx="6" transform="rotate(10 155 98)" />
          <rect x="177" y="118" width="14" height="19" rx="5" transform="rotate(18 184 127)" />
          <path d="M22 139Q28 133 34 138L43 150L32 158L22 146Q19 142 22 139Z" />
        </g>
        <g fill="none" stroke="#733e36" strokeOpacity=".25" strokeWidth="3" strokeLinecap="round">
          <path d="M73 75Q83 71 94 75M75 81H91M111 109L128 110M144 130L158 132M170 154L181 158" />
          <path d="M75 147Q84 141 96 147M108 153Q118 149 128 154M140 161L154 165" />
          <path d="M87 161L94 208M119 168L121 210M148 176L139 212" strokeOpacity=".14" />
        </g>
        <path d="M65 266H166V300H65Z" fill={shirt} /><path d="M65 266H166V277H65Z" fill="#102b3a" opacity=".22" />
      </svg>
      <span ref={tip} className="biometric-fingertip" aria-hidden="true" />
    </div>
  </div>, document.body);
}
