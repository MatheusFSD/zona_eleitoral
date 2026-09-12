import { faceOf } from "../face.js";
import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { luz } from "../data/tutorial.js";
import { TXT, t } from "../i18n.js";
import Neusa from "./Neusa.jsx";
import DigitalClock from "./DigitalClock.jsx";

/* O cabeçalho é a placa da sala: relógio, corredor, contagem do dia.

   No lugar de um número, a fila é o próprio corredor visto de lado: parede com
   a porta da sala, piso fugindo para o fundo e as pessoas de corpo inteiro
   esperando na linha. Quem é chamado sai pela porta e as outras andam para a
   frente; quem chega entra pelo fim, lá no fundo — por isso as do fim são
   menores. Quem tem preferência aparece em outra cor e pode ser chamada na
   frente das demais. */

/* Pequenos personagens com as mesmas cores e características dos retratos. */
function PessoaFila({ person }) {
  const look = faceOf(person);
  const longHair = ["long", "bob", "pony"].includes(look.style);
  return (
    <svg viewBox="0 0 36 76" aria-hidden="true">
      <ellipse cx="18" cy="72" rx="14" ry="3" fill="#4e5744" opacity=".18" />
      {longHair && <path d="M10 10Q10 1 19 2Q29 3 28 15L30 28H10Z" fill={look.hair} />}
      <path d="M11 43L10 69H16L19 49L22 69H28L25 42Z" fill="#52616a" />
      <path d="M11 44L12 65M22 45L25 65" stroke="#738086" strokeWidth="1.2" />
      <path d="M10 67H16V72H6Q5 69 10 67ZM22 67H28L31 70V72H22Z" fill="#3e423d" />
      <path d="M13 22L8 27L4 43Q3 48 7 49L10 45L14 31" fill={look.skin} />
      <path d="M13 21Q19 19 24 23L28 29L25 46Q17 49 9 44L10 28Z" fill={look.shirt} />
      <path d="M12 23L8 27L6 35L12 37L15 26M23 23L28 27L30 36L24 38L21 27" fill={look.shirt} />
      <path d="M25 35L27 46L23 49" fill="none" stroke={look.skin} strokeWidth="4" strokeLinecap="round" />
      <path d="M14 18V24Q18 28 22 23L21 17" fill={look.skin} />
      <path d="M14 23L18 27L22 23M18 28V42" fill="none" stroke="#f7e8cb" strokeOpacity=".35" strokeWidth="1" />
      <path d="M11 8Q13 3 20 5Q26 6 25 13L23 19Q20 23 15 20L11 17L9 13Z" fill={look.skin} />
      <path d="M10 10Q8 2 17 1Q26 0 27 9L25 15L22 13L22 7Q16 10 10 8Z" fill={look.hair} />
      {look.style === "bun" && <circle cx="27" cy="7" r="4" fill={look.hair} />}
      <circle cx="23.5" cy="13.5" r="2" fill={look.skin} />
      <path d="M12 12H14M13 17L16 18" stroke="#513b31" strokeWidth="1" strokeLinecap="round" />
      {look.glasses && <path d="M10 11H16V14H10ZM16 12H23" fill="none" stroke="#4b514d" strokeWidth="1" />}
      {person.priority && <path d="M21 30L24 33L21 36L18 33Z" fill="#f2ce6b" stroke="#957440" strokeWidth=".6" />}
    </svg>
  );
}

/* A porta da sala, na parede do corredor. */
function Porta() {
  return (
    <svg className="fila-porta" viewBox="0 0 42 80" role="presentation" aria-hidden="true">
      <rect x="6" y="1" width="30" height="11" rx="1" fill="#f7edd3" />
      <text x="21" y="9" fill="#63766b" fontFamily="Georgia, serif" fontSize="8" textAnchor="middle">127</text>
      <path d="M2 16H40V78H2Z" fill="#ddd5be" />
      <path d="M5 19H37V78H5Z" fill="#3c5558" />
      <path d="M7 20L31 23V77L7 78Z" fill="#719597" />
      <path d="M10 25L27 27V44L10 43Z" fill="#aec5bf" />
      <path d="M11 26L17 27L11 38ZM20 27L25 28L13 43H10Z" fill="#e0e7d7" opacity=".65" />
      <path d="M10 51L27 52V71L10 72Z" fill="#648689" />
      <path d="M25 48H29" stroke="#e6c57a" strokeWidth="2" strokeLinecap="round" />
      <path d="M1 78H41" stroke="#718782" strokeWidth="2" />
    </svg>
  );
}

export default function TopBar({
  time,
  crowd,
  people,
  waiting,
  leaving,
  onCall,
  calling,
  served,
  errors,
  total,
  marks,
  onSkip,
  onMenu,
  foco,
}) {
  const anonimos = Math.min(5, Math.max(0, crowd));
  const [hover, setHover] = useState(null);
  const tipId = useId();
  const describe = (event, person) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = Math.min(272, window.innerWidth - 24);
    setHover({ person, style: { width, top: rect.bottom + 8, left: Math.max(12, Math.min(rect.left + rect.width / 2 - width / 2, window.innerWidth - width - 12)) } });
  };

  return (
    /* No tutorial o cabeçalho inteiro apaga, menos quando o assunto é a fila. */
    <header className={`top${luz(foco, "fila")}`}>
      <div className="section-plate">
        <div className="section-number"><span>{t(TXT.secao)}</span><h1>127</h1></div>
        {/* O nome da escola não se traduz. */}
        <div className="section-location"><strong>E. M. HORIZONTE</strong><span>{t(TXT.zonaSala)}</span><small>{t(TXT.mesaReceptora)}</small></div>
      </div>

      <DigitalClock time={time} />

      <div className="metric fila-metric">
        <div className="corredor-cena" role="group" aria-label={t(TXT.filaCorredor, { n: waiting.length })}>
          <div className="parede" aria-hidden="true" />
          <div className="piso" aria-hidden="true" />
          <div className="corredor-janelas" aria-hidden="true"><i /><i /><i /></div>
          <div className="corredor-aviso" aria-hidden="true">{t(TXT.silencio)}<br />{t(TXT.votacao)}</div>
          <Porta />

          <ul className="corredor" onScroll={() => setHover(null)}>
            {waiting.map((i, n) => {
              const person = people[i];
              return (
                <li
                  key={person.id}
                  style={{ "--i": n }}
                  className={`na-fila${person.priority ? " preferencia" : ""}${leaving === i ? " saindo" : ""}`}
                  onPointerEnter={(event) => describe(event, person)}
                  onPointerLeave={() => setHover(null)}
                  onFocus={(event) => describe(event, person)}
                  onBlur={() => setHover(null)}
                >
                  <button
                    type="button"
                    onClick={() => { setHover(null); onCall(i); }}
                    disabled={!calling}
                    aria-describedby={hover?.person.id === person.id ? tipId : undefined}
                    aria-label={t(TXT.chamarPessoa, { nome: person.name, motivo: person.priority ? t(person.preference) : t(TXT.semPrioridadeMin) })}
                  >
                    <PessoaFila person={person} />
                  </button>
                </li>
              );
            })}

            {/* mais atrás, sem rosto, o resto da fila */}
            {Array.from({ length: anonimos }, (_, i) => (
              <li key={`anon-${i}`} className="na-fila anonimo" style={{ "--i": waiting.length + i }}>
                <PessoaFila person={{ id: `corredor-${i}` }} />
              </li>
            ))}
          </ul>

          {crowd > anonimos && <span className="fila-mais">+{crowd - anonimos}</span>}
        </div>
      </div>

      <Neusa errors={errors} />

      <div className="progress">
        <span className="label">
          {t(TXT.casos, { n: Math.min(served + 1, total), total })}
          <button type="button" className="menu-pause" onClick={onMenu} aria-label={t(TXT.menuPrincipal)} title={t(TXT.pausar)}><span aria-hidden="true">Ⅱ</span></button>
          {/* atalho de desenvolvimento: fecha o dia com tudo resolvido */}
          {onSkip && <button type="button" className="pular" onClick={onSkip} title={t(TXT.pularAoFimDica)} aria-label={t(TXT.pularAoFim)}>
            ↠
          </button>}
        </span>
        <div className="dots" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <i key={i} className={marks[i] || ""} />
          ))}
        </div>
      </div>
      {hover && createPortal(<div className={`queue-tooltip${hover.person.priority ? " priority" : ""}`} id={tipId} role="tooltip" style={hover.style}>
        <strong>{hover.person.name}</strong>
        <span>{hover.person.priority ? t(hover.person.preference) : t(TXT.semPrioridade)}</span>
        <small>{t(hover.person.priority ? TXT.atendimentoPrioritario : TXT.filaComum)}</small>
      </div>, document.body)}
    </header>
  );
}
