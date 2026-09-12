import { useCallback, useEffect, useRef, useState } from "react";
import logo from "../../logo-itacoa.svg";
import { tone } from "../sound.js";
import { IDIOMAS, TXT, alternarIdioma, idioma, outroIdioma, t } from "../i18n.js";
import "./menu.css";

export function StudioIntro({ onFinish }) {
  const [stage, setStage] = useState("logo");
  const screen = useRef(null);
  const timer = useRef(null);
  const advancing = useRef(false);
  const finish = useRef(onFinish);
  finish.current = onFinish;
  const advance = useCallback(() => {
    if (advancing.current) return;
    advancing.current = true;
    clearTimeout(timer.current);
    if (stage === "logo") setStage("disclaimer");
    else finish.current();
  }, [stage]);
  useEffect(() => {
    advancing.current = false;
    screen.current?.focus();
    timer.current = setTimeout(advance, 3000);
    return () => clearTimeout(timer.current);
  }, [advance]);
  return <section className={`studio-intro ${stage}`} key={stage} ref={screen} role="button" tabIndex={0}
    aria-label={t(stage === "logo" ? TXT.estudioLogo : TXT.estudioAviso)}
    onClick={advance} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (!event.repeat) advance(); } }}>
    {stage === "logo" ? <img src={logo} alt="Itacoa" /> : <p>{t(TXT.avisoEstudio)}</p>}
    <div className="studio-progress" aria-hidden="true"><i /></div>
  </section>;
}

export default function GameMenu({ canLoad, onNew, onLoad, storageError }) {
  const list = useRef(null);
  useEffect(() => { list.current?.querySelector("button")?.focus(); }, []);
  const navigate = (event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const options = [...list.current.querySelectorAll("button:not(:disabled)")];
    const current = options.indexOf(document.activeElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
    tone("beep");
    options[next]?.focus();
  };
  /* Só há dois idiomas, então a opção é um interruptor: mostra em que língua o
     jogo está e troca para a outra. A escolha fica guardada no navegador. */
  const trocarIdioma = () => {
    tone("beep");
    alternarIdioma();
  };
  return <main className="game-menu" aria-label={t(TXT.menuPrincipal)}>
    <img className="menu-scenery" src={`${import.meta.env.BASE_URL}images/story/escola.png`} alt="" />
    <div className="menu-shade" aria-hidden="true" />
    <div className="menu-content">
      <h1 className="menu-title"><span>ZONA</span><strong>ELEITORAL</strong></h1>
      <nav className="menu-options" aria-label={t(TXT.menuDoJogo)} ref={list} onKeyDown={navigate}>
        <button onClick={onNew}>{t(TXT.novoJogo)}</button>
        <button onClick={onLoad} disabled={!canLoad}>{t(TXT.carregarJogo)}</button>
        <button onClick={trocarIdioma} aria-label={t(TXT.idiomaBotao, { atual: IDIOMAS[idioma()], outro: IDIOMAS[outroIdioma()] })}>
          {t(TXT.idioma)} <span aria-hidden="true">◇ {IDIOMAS[idioma()]}</span>
        </button>
      </nav>
      {storageError && <p className="menu-error" role="status">{t(TXT.semArmazenamento)}</p>}
    </div>
  </main>;
}
