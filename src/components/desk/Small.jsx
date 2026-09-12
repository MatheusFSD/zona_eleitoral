import { useEffect, useId, useRef, useState } from "react";
import BiometricHand from "../BiometricHand.jsx";
import { SCAN_MS } from "../../biometric.js";
import { TXT, numero, t } from "../../i18n.js";

export { default as Handbook } from "./Handbook.jsx";

/* As peças pequenas da carteira: o leitor de digital, os pertences da pessoa,
   o comprovante, a folha de impedidos e o manual.

   Não existe mais mesa de apoio: a pessoa larga o que é dela em cima da
   carteira antes de ir votar, e a mesa devolve arrastando cada coisa de volta
   para a mão dela. */

/* ------------------------------------------------------------- biometria -- */

const BIO_LABEL = {
  idle: { pt: "Encoste o dedo", en: "Place the finger" },
  fail: { pt: "Não reconheceu", en: "Not recognized" },
  ok: { pt: "Identidade confirmada", en: "Identity confirmed" },
  esgotada: { pt: "Tentativas esgotadas", en: "Attempts exhausted" },
  lendo: { pt: "Lendo digital", en: "Reading fingerprint" },
};

/* O resto do que está escrito nas peças pequenas. */
const PECA = {
  sensor: { pt: "Sensor para encaixar o indicador", en: "Sensor for the index finger" },
  encaixe: { pt: "encaixe o dedo", en: "place finger here" },
  coleta: { pt: "Coleta da digital", en: "Fingerprint capture" },
  optico: { pt: "LEITOR ÓPTICO", en: "OPTICAL READER" },
  comprovante: { pt: "Comprovante de votação", en: "Voting receipt" },
  secaoZona: { pt: "Seção 127 · Zona 041", en: "Section 127 · Zone 041" },
  comparecimento: { pt: "Comparecimento", en: "Checked in" },
  compareceu: { pt: "compareceu", en: "attended" },
  listagem: { pt: "Listagem de eleitores impedidos", en: "List of barred voters" },
  impedidos: { pt: "Impedidos de votar", en: "Barred from voting" },
  anexo: { pt: "anexo do caderno · seção 127", en: "register annex · section 127" },
};

export function Reader({ c, onRead, person, active }) {
  const statusId = useId();
  const sensor = useRef(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => { setProgress(0); }, [active, person?.id, c.tries]);
  const state = c.bio;
  const done = state === "ok" || state === "esgotada";

  return (
    <section className={`leitor ${state}`} aria-label={t(TXT.leitorBiometrico)}>
      <svg className="leitor-cabo" viewBox="0 0 95 110" aria-hidden="true">
        <path d="M90 91H40Q12 91 12 65V31Q12 12 33 12H52" fill="none" stroke="#495657" strokeWidth="7" />
        <path d="M90 89H40Q15 89 15 65V31Q15 15 33 15H52" fill="none" stroke="#84908a" strokeWidth="2" />
        <rect x="76" y="83" width="19" height="16" rx="3" fill="#64736f" />
        <path d="M81 85V97M86 85V97" stroke="#3e504f" strokeWidth="2" />
      </svg>
      <div className="leitor-topo">
        <span className="leitor-marca" aria-hidden="true">BIO · 127</span>
        <i className={`leitor-led ${state}`} aria-hidden="true" />
      </div>
      <div className="leitor-berco">
      <div ref={sensor} className={`vidro ${state}`} role="img" aria-label={t(PECA.sensor)} aria-describedby={statusId}>
        <svg viewBox="0 0 60 60" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M30 46c0-9 0-14 0-18" />
            <path d="M22 44c-1-8-1-13 1-17" />
            <path d="M38 44c1-8 1-13-1-17" />
            <path d="M15 38c-1-10 1-18 8-22" />
            <path d="M45 38c1-10-1-18-8-22" />
            <path d="M23 16c5-3 11-3 15 0" />
          </g>
        </svg>
      </div>
      <span className="leitor-guia" aria-hidden="true">{t(PECA.encaixe)}</span>
      </div>
      <div className="leitor-visor" id={statusId} role="status">
        <b>{t(active && progress > 0 ? BIO_LABEL.lendo : BIO_LABEL[state])}</b>
        <small className="leitor-tempo" aria-live="off">{active && !done ? `${numero((1 - progress / 100) * SCAN_MS / 1000)} s` : `${c.tries}/4`}</small>
        <div className="leitor-coleta" style={{ visibility: active && !done ? "visible" : "hidden" }} role="progressbar" aria-label={t(PECA.coleta)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-live="off"><i style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="leitor-base" aria-hidden="true">
        <i className="aparelho-parafuso" /><span>{t(PECA.optico)}</span><i className="aparelho-parafuso" />
      </div>
      {active && person && !done && <BiometricHand key={`${person.id}-${c.tries}`} person={person} sensor={sensor} onProgress={setProgress} onComplete={onRead} />}
    </section>
  );
}

/* ------------------------------------------------------------- pertences -- */

/* Os desenhos guardam a proporção do objeto real: o celular tem 7,2 por 14,5
   centímetros e o molho de chaves tem uns nove de ponta a ponta. O tamanho na
   carteira sai daí. */
const ITEM = {
  celular: {
    label: TXT.celular,
    art: (
      <svg viewBox="0 0 36 72" aria-hidden="true">
        <rect x="0.5" y="0.5" width="35" height="71" rx="5" fill="#2f3538" />
        <rect x="3" y="6" width="30" height="57" fill="#4c6b74" />
        <rect x="13" y="3" width="10" height="1.6" rx="0.8" fill="#59636a" />
        <circle cx="18" cy="67" r="2.6" fill="#8d979b" />
      </svg>
    ),
  },
  chaves: {
    label: TXT.chaves,
    art: (
      <svg viewBox="0 0 90 40" aria-hidden="true">
        <circle cx="17" cy="20" r="12" fill="none" stroke="#8d939a" strokeWidth="3.5" />
        <rect x="28" y="17" width="56" height="5" rx="1" fill="#8d939a" />
        <rect x="70" y="22" width="5" height="8" fill="#8d939a" />
        <rect x="58" y="22" width="5" height="8" fill="#8d939a" />
        <circle cx="17" cy="20" r="4" fill="#6f767c" />
      </svg>
    ),
  },
};

/* Devolver é arrastar até a pessoa: o objeto não tem botão. */
export function Belonging({ kind }) {
  const item = ITEM[kind] ?? ITEM.celular;
  return (
    <div className="pertence" aria-label={t(item.label)}>
      {item.art}
    </div>
  );
}

/* ------------------------------------------------------------ comprovante -- */

export function Receipt({ person }) {
  return (
    <section className="comprovante" aria-label={t(PECA.comprovante)}>
      <header>
        <strong>{t(PECA.comprovante)}</strong>
        <span>{t(PECA.secaoZona)}</span>
      </header>
      <p className="cp-nome">{person.reg.name}</p>
      <div className="cp-linha">
        <span>{t(PECA.comparecimento)}</span>
        <b>{person.time}</b>
      </div>
      <div className="cp-carimbo" aria-hidden="true">
        {t(PECA.compareceu)}
      </div>
    </section>
  );
}

/* ------------------------------------------------------- folha e livro ---- */

/* A listagem de impedidos é uma folha solta, anexa ao caderno. Procurar nela é
   o mesmo gesto do caderno: os nomes estão à vista e a mesa marca o que
   encontrou — é isso que conta como ter consultado a listagem. */
export function Blocked({ list, found, onFind }) {
  return (
    <section className="folha listagem" aria-label={t(PECA.listagem)}>
      <header>
        <strong>{t(PECA.impedidos)}</strong>
        <span>{t(PECA.anexo)}</span>
      </header>
      <ol data-nodrag>
        {list.map((name) => (
          <li key={name} className={found === name ? "achado" : undefined}>
            <button className="linha" onClick={() => onFind(name)}>
              {name}
            </button>
            {found === name && <span className="visto">✓</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
