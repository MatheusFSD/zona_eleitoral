import { useEffect, useRef, useState } from "react";

import { tone } from "../sound.js";
import { Fan, Window } from "./Classroom.jsx";
import UrnReport from "./UrnReport.jsx";
import { t } from "../i18n.js";

/* O que a máquina escreve em si mesma e na tela. */
const URNA = {
  abertura: { pt: "Abertura da seção", en: "Opening the section" },
  imprimir: { pt: "Imprimir zerésima", en: "Print the zero tape" },
  imprimindo: { pt: "Imprimindo…", en: "Printing…" },
  maquina: { pt: "Urna UV 127 com impressora integrada", en: "UV 127 voting machine with built-in printer" },
  impressora: { pt: "IMPRESSORA", en: "PRINTER" },
  secao: { pt: "SEÇÃO", en: "SECTION" },
  ligado: { pt: "● LIGADO", en: "● ON" },
  fim: { pt: "FIM", en: "END" },
  aberturaTela: { pt: "ABERTURA", en: "OPENING" },
  registro: { pt: "REGISTRO DE VOTOS", en: "VOTES RECORDED" },
  emitindo: { pt: "EMITINDO ZERÉSIMA", en: "PRINTING ZERO TAPE" },
  pronta: { pt: "PRONTA PARA ABRIR", en: "READY TO OPEN" },
  branco: { pt: "BRANCO", en: "BLANK" },
  corrige: { pt: "CORRIGE", en: "CORRECT" },
  confirma: { pt: "CONFIRMA", en: "CONFIRM" },
  unidade: { pt: "UNIDADE DE VOTAÇÃO · UV 127", en: "VOTING UNIT · UV 127" },
};

/* A abertura da seção: antes de a porta abrir, a urna imprime a zerésima — o
   papel que mostra a contagem começando do zero. Um clique, a fita sobe, e o
   dia começa sozinho quando ela termina de sair.

   A carcaça lembra a urna brasileira, mantendo o desenho do jogo.
   O relatório é fictício e continua marcado como sem valor oficial. */

const PRINT_MS = 3600;
const HOLD_MS = 1600; // o tempo de olhar a fita inteira antes de a porta abrir

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

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

  return (
    <div className="opening-film" role="dialog" aria-modal="true" aria-label={t(URNA.abertura)}>
      <section className={`opening-scene${printing ? " printing" : ""}`}>
        <Window />
        <Fan />
        <div className="opening-light" aria-hidden="true" />
        <div className="opening-desk" aria-hidden="true" />
        <div className="opening-urn">
          <div className="urna-cena">
            <Urn lit={printing}>
              {printing && <div className="fita"><UrnReport seedText={seedText} /></div>}
            </Urn>
          </div>
        </div>
        <div className="opening-actions">
          <button className="primary" ref={button} onClick={print} disabled={printing}>
            {t(printing ? URNA.imprimindo : URNA.imprimir)}
          </button>
        </div>
      </section>
    </div>
  );
}

/* Carcaça da mesma família do terminal, com a fita presa à fenda. */

export function Urn({ lit, children, closing = false }) {
  return (
    <div className={`urna urn-device${lit ? " is-printing" : ""}`} aria-label={t(URNA.maquina)}>
      <div className="urn-printer-top">
        <svg className="urn-top-plane" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M30 2H970L998 79H2Z" fill="#c8ccb9" stroke="#87958c" strokeWidth="2" />
          <path d="M30 2H970" fill="none" stroke="#e5e7d4" strokeWidth="3" />
          <path d="M970 2L998 79H982L958 2Z" fill="#a1ad9e" />
          <path d="M2 79H998" fill="none" stroke="#eef0dc" strokeWidth="3" />
        </svg>
        <div className="urn-slot">{children}</div>
        <div className="urn-printer-label">{t(URNA.impressora)} <span>●</span></div>
      </div>
      <div className="urn-body">
        <header className="urn-label"><b>{t(URNA.secao)} <em>127</em></b><span>{closing ? "●" : t(URNA.ligado)}</span></header>
        <div className="urn-panel">
          <div className="urn-screen">
            {closing ? <strong>{t(URNA.fim)}</strong> : <>
            <div className="urn-screen-top">{t(URNA.aberturaTela)} <span>07:59</span></div>
            <span>{t(URNA.registro)}</span><strong>000</strong>
            <span>{t(lit ? URNA.emitindo : URNA.pronta)}</span>
            <div className="urn-progress"><i /></div>
            </>}
          </div>
          <div className="urn-keypad" aria-hidden="true">
            {[1,2,3,4,5,6,7,8,9].map(n => <span key={n}>{n}</span>)}
            <span className="urn-zero">0</span>
            <div className="urn-function-keys"><span className="urn-white">{t(URNA.branco)}</span><span className="urn-correct">{t(URNA.corrige)}</span><span className="urn-confirm">{t(URNA.confirma)}</span></div>
          </div>
        </div>
        <footer className="urn-bottom"><span>⊖</span> {t(URNA.unidade)} <span>⊖</span></footer>
      </div>
      <div className="urn-feet"><i /><i /></div>
    </div>
  );
}
