import { useEffect, useRef, useState } from "react";

import { seed, stream } from "../random.js";
import { tone } from "../sound.js";

/* A abertura da seção: antes de a porta abrir, a urna imprime a zerésima — o
   papel que mostra a contagem começando do zero. Um clique, a fita sobe, e o
   dia começa sozinho quando ela termina de sair.

   A carcaça lembra a urna brasileira, mantendo o desenho do jogo.
   O relatório é fictício e continua marcado como sem valor oficial. */

const PRINT_MS = 3600;
const HOLD_MS = 1600; // o tempo de olhar a fita inteira antes de a porta abrir

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/* Os números saem da semente do turno: a zerésima combina com o dia que vem
   depois dela e volta igual com `?turno=`. */
function report(key) {
  const rnd = stream(seed(`${key}-abertura`));
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const hex = () => "0123456789ABCDEF"[int(0, 15)];
  return {
    aptos: int(268, 349),
    code: `${hex()}${hex()}${int(10, 99)}-${hex()}${int(100, 999)}`,
  };
}

export default function OpeningModal({ seedText, onStart }) {
  const [printing, setPrinting] = useState(false);
  const button = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    button.current?.focus();
    return () => clearTimeout(timer.current);
  }, []);

  const print = () => {
    if (printing) return;
    tone("beep");
    setPrinting(true);
    // A votação abre sozinha quando a fita termina de sair.
    timer.current = setTimeout(
      () => {
        tone("ok");
        onStart();
      },
      reduced() ? 500 : PRINT_MS + HOLD_MS,
    );
  };

  const { aptos, code } = report(seedText);

  return (
    <div className="overlay">
      <section className="modal opening" role="dialog" aria-modal="true" aria-label="Abertura da seção">
        <div className="urna-cena">
          <Urn lit={printing}>

          {printing && (
            <div className="fita">
              <article className="zeresima" aria-label="Zerésima impressa">
                <p className="zr-head">
                  SEÇÃO 127
                  <br />
                  ZONA 041
                </p>
                <div className="zr-rule" />
                <h3>Zerésima</h3>
                <div className="zr-row">
                  <span>TURNO</span>
                  <b>{seedText}</b>
                </div>
                <div className="zr-row">
                  <span>APTOS</span>
                  <b>{aptos}</b>
                </div>
                <div className="zr-row">
                  <span>VOTOS</span>
                  <b>000</b>
                </div>
                <div className="zr-row">
                  <span>BRANCOS</span>
                  <b>000</b>
                </div>
                <div className="zr-row">
                  <span>NULOS</span>
                  <b>000</b>
                </div>
                <div className="zr-rule" />
                <div className="zr-row">
                  <span>LACRES</span>
                  <b>OK</b>
                </div>
                <div className="zr-rule" />
                <p className="zr-foot">
                  {code}
                  <br />
                  Sem valor oficial
                </p>
              </article>
            </div>
          )}
          </Urn>
        </div>

        <div className="opening-actions">
          <button className="primary" ref={button} onClick={print} disabled={printing}>
            {printing ? "Imprimindo…" : "Imprimir zerésima e começar o dia"}
          </button>
        </div>
      </section>
    </div>
  );
}

/* Carcaça da mesma família do terminal, com a fita presa à fenda. */

function Urn({ lit, children }) {
  return (
    <div className={`urna urn-device${lit ? " is-printing" : ""}`} aria-label="Urna UV 127 com impressora integrada">
      <div className="urn-printer-top">
        <svg className="urn-top-plane" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M30 2H970L998 79H2Z" fill="#c8ccb9" stroke="#87958c" strokeWidth="2" />
          <path d="M30 2H970" fill="none" stroke="#e5e7d4" strokeWidth="3" />
          <path d="M970 2L998 79H982L958 2Z" fill="#a1ad9e" />
          <path d="M2 79H998" fill="none" stroke="#eef0dc" strokeWidth="3" />
        </svg>
        <div className="urn-slot">{children}</div>
        <div className="urn-printer-label">IMPRESSORA <span>●</span></div>
      </div>
      <div className="urn-body">
        <header className="urn-label"><b>SEÇÃO <em>127</em></b><span>● LIGADO</span></header>
        <div className="urn-panel">
          <div className="urn-screen">
            <div className="urn-screen-top">ABERTURA <span>07:59</span></div>
            <span>REGISTRO DE VOTOS</span><strong>000</strong>
            <span>{lit ? "EMITINDO ZERÉSIMA" : "PRONTA PARA ABRIR"}</span>
            <div className="urn-progress"><i /></div>
            <small>{lit ? "IMPRESSORA EM OPERAÇÃO" : "MEMÓRIA CONFERIDA · LACRES OK"}</small>
          </div>
          <div className="urn-keypad" aria-hidden="true">
            {[1,2,3,4,5,6,7,8,9].map(n => <span key={n}>{n}</span>)}
            <span className="urn-zero">0</span>
            <div className="urn-function-keys"><span className="urn-white">BRANCO</span><span className="urn-correct">CORRIGE</span><span className="urn-confirm">CONFIRMA</span></div>
          </div>
        </div>
        <footer className="urn-bottom"><span>⊖</span> UNIDADE DE VOTAÇÃO · UV 127 <span>⊖</span></footer>
      </div>
      <div className="urn-feet"><i /><i /></div>
    </div>
  );
}
