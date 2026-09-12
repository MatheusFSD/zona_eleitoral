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

/* As duas bandeiras, desenhadas à mão.
   Emoji de bandeira não serve: no Windows o 🇧🇷 aparece como as letras "BR",
   porque a fonte do sistema não tem os glifos de país. */
const BANDEIRAS = {
  br: (
    <>
      <rect width="30" height="21" fill="#009739" />
      <path d="M15 2.2 27.6 10.5 15 18.8 2.4 10.5Z" fill="#fedd00" />
      <circle cx="15" cy="10.5" r="4.7" fill="#012169" />
      <clipPath id="bandeira-br-globo">
        <circle cx="15" cy="10.5" r="4.7" />
      </clipPath>
      <path d="M10 9.4Q15 12.6 20.2 9.2" fill="none" stroke="#fff" strokeWidth="1.5" clipPath="url(#bandeira-br-globo)" />
    </>
  ),
  us: (
    <>
      <rect width="30" height="21" fill="#f6f6f6" />
      <g fill="#b31942">
        {[0, 2, 4, 6, 8, 10, 12].map((faixa) => (
          <rect key={faixa} y={(faixa * 21) / 13} width="30" height={21 / 13} />
        ))}
      </g>
      <rect width="13" height={(21 * 7) / 13} fill="#0a3161" />
      <g fill="#f6f6f6">
        {[0, 1, 2, 3, 4].map((linha) =>
          [0, 1, 2, 3, 4, 5].map((coluna) =>
            (linha + coluna) % 2 === 0 ? (
              <circle key={`${linha}-${coluna}`} cx={1.2 + coluna * 2.1} cy={1.3 + linha * 2.3} r=".55" />
            ) : null,
          ),
        )}
      </g>
    </>
  ),
};

function Bandeira({ pais, ativa }) {
  return (
    <svg className={`bandeira bandeira-${pais}${ativa ? " ativa" : ""}`} viewBox="0 0 30 21" aria-hidden="true">
      {BANDEIRAS[pais]}
    </svg>
  );
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
        {/* Uma opção só, com as duas bandeiras: a acesa é a língua de agora. */}
        <button className="menu-idioma" onClick={trocarIdioma}
          aria-label={t(TXT.idiomaBotao, { atual: IDIOMAS[idioma()], outro: IDIOMAS[outroIdioma()] })}>
          {t(TXT.idioma)}
          <span className="menu-bandeiras">
            <Bandeira pais="br" ativa={idioma() === "pt"} />
            <Bandeira pais="us" ativa={idioma() === "en"} />
          </span>
        </button>
      </nav>
      {storageError && <p className="menu-error" role="status">{t(TXT.semArmazenamento)}</p>}
    </div>
  </main>;
}
