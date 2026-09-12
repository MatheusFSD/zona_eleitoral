/* O terminal da mesa.

   Ele não sabe quem está na frente da mesa: só responde ao número que a mesa
   digitar. Enquanto ninguém digitar a identificação do documento, a tela fica
   esperando — e é isso que trava o resto do atendimento.

   Depois da quarta falha de digital, a mesma tela passa a pedir o ano de
   nascimento, que a mesa pergunta à pessoa e digita aqui. */

import { t } from "../../i18n.js";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/* O que a tela do terminal escreve. Tudo em caixa alta, como o aparelho. */
const TELA = {
  secao: { pt: "SEÇÃO", en: "SECTION" },
  ligado: { pt: "ligado", en: "on" },
  cadastro: { pt: "CADASTRO", en: "RECORD" },
  pedeDoc: { pt: "IDENTIFICAÇÃO DO DOCUMENTO", en: "DOCUMENT NUMBER" },
  digite: { pt: "Digite os quatro dígitos e confirme.", en: "Type the four digits and confirm." },
  pedeAno: { pt: "ANO DE NASCIMENTO", en: "YEAR OF BIRTH" },
  pergunte: { pt: "Pergunte à pessoa e digite o ano.", en: "Ask the voter and type the year." },
  eleitor: { pt: "ELEITOR", en: "VOTER" },
  nascimento: { pt: "NASC.", en: "BORN" },
  municipio: { pt: "MUNICÍPIO", en: "TOWN" },
  secaoLinha: { pt: "SEÇÃO", en: "SECTION" },
  situacao: { pt: "SITUAÇÃO", en: "STATUS" },
  biometria: { pt: "BIOMETRIA", en: "FINGERPRINT" },
  urna: { pt: "URNA", en: "MACHINE" },
  confirmada: { pt: "CONFIRMADA", en: "CONFIRMED" },
  semLeitura: { pt: "SEM LEITURA", en: "NO READ" },
  falha: { pt: "FALHA {n}/4", en: "FAIL {n}/4" },
  aguardando: { pt: "AGUARDANDO", en: "WAITING" },
  computado: { pt: "VOTO COMPUTADO", en: "VOTE CAST" },
  naCabina: { pt: "ELEITOR NA CABINA", en: "VOTER IN THE BOOTH" },
  demorou: { pt: "DEMOROU · NÃO VOTOU", en: "TOO LONG · NO VOTE" },
  aguardaMesa: { pt: "AGUARDANDO A MESA", en: "WAITING FOR THE TABLE" },
  semRegistro: { pt: "SEM REGISTRO NA TELA", en: "NO RECORD ON SCREEN" },
  legenda: { pt: "terminal da mesa · TM 127", en: "table terminal · TM 127" },
  patrimonio: { pt: "PATRIMÔNIO · 0127", en: "ASSET · 0127" },
  corrige: { pt: "CORRIGE", en: "CORRECT" },
  confirma: { pt: "CONFIRMA", en: "CONFIRM" },
  aparelho: { pt: "Terminal da seção", en: "Section terminal" },
};

function Row({ label, value, tone }) {
  return (
    <div className="row">
      <span>{t(label)}</span>
      <strong className={tone ? `rv ${tone}` : "rv"}>{t(value)}</strong>
    </div>
  );
}

function bioLine(c) {
  if (c.bio === "ok") return [t(TELA.confirmada), "ok"];
  if (c.bio === "esgotada") return [t(TELA.semLeitura), "warn"];
  if (c.tries > 0) return [t(TELA.falha, { n: c.tries }), "warn"];
  return [t(TELA.aguardando), ""];
}

export default function TerminalPiece({ person, c, time, onKey }) {
  const asking = c.step === "ano";
  const [bio, bioTone] = bioLine(c);
  const wide = asking ? 4 : 4; // identificação e ano têm quatro dígitos

  return (
    <section className="terminal" aria-label={t(TELA.aparelho)}>
      <svg className="terminal-cabo" viewBox="0 0 90 140" aria-hidden="true">
        <path d="M4 115H54Q78 115 78 88V37Q78 12 50 12H27" fill="none" stroke="#4b5759" strokeWidth="7" />
        <path d="M4 113H54Q75 113 75 88V37Q75 15 50 15H27" fill="none" stroke="#82908a" strokeWidth="2" />
      </svg>
      <svg className="terminal-carcaca" viewBox="0 0 440 310" preserveAspectRatio="none" aria-hidden="true">
        <rect x="22" y="288" width="54" height="22" rx="6" fill="#465453" />
        <rect x="364" y="288" width="54" height="22" rx="6" fill="#465453" />
        <path d="M24 5H413Q427 5 429 22L440 263V284Q440 298 425 298H15Q0 298 0 284V263L11 22Q12 5 24 5Z" fill="#7e8c88" />
        <path d="M24 0H413Q427 0 429 17L440 263Q440 278 425 278H15Q0 278 0 263L11 17Q12 0 24 0Z" fill="#b8baaa" />
        <path d="M24 0H413Q424 0 426 13H21L10 261L0 266L11 17Q12 0 24 0Z" fill="#f4efdc" />
        <path d="M27 13H411Q418 13 419 24L429 250Q429 259 418 259H23Q12 259 13 249L23 24Q23 13 27 13Z" fill="#dedbc7" />
        <path d="M15 278H425" stroke="#a1ac9e" strokeWidth="3" />
      </svg>
      <header className="terminal-marca">
        <strong>{t(TELA.secao)} <b>127</b></strong>
        <span><i aria-hidden="true" /> {t(TELA.ligado)}</span>
      </header>
      <div className="terminal-console">
      <div className="terminal-moldura">
      <div className="screen" aria-live="polite">
        <div className="term-head">
          <strong>{t(TELA.cadastro)}</strong>
          <span>{time}</span>
        </div>

        {!c.loaded && !asking && (
          <div className="term-ask">
            <p>{t(TELA.pedeDoc)}</p>
            <div className="term-digits">
              {Array.from({ length: wide }, (_, i) => (
                <i key={i} className={c.typed[i] ? "cheio" : ""}>
                  {c.typed[i] ?? "_"}
                </i>
              ))}
            </div>
            <small>{t(c.refused) || t(TELA.digite)}</small>
          </div>
        )}

        {asking && (
          <div className="term-ask">
            <p>{t(TELA.pedeAno)}</p>
            <div className="term-digits">
              {Array.from({ length: wide }, (_, i) => (
                <i key={i} className={c.typed[i] ? "cheio" : ""}>
                  {c.typed[i] ?? "_"}
                </i>
              ))}
            </div>
            <small>{t(c.refused) || t(TELA.pergunte)}</small>
          </div>
        )}

        {c.loaded && !asking && (
          <div className="term-rows">
            <Row label={TELA.eleitor} value={person.reg.name} />
            <Row label={TELA.nascimento} value={person.reg.birth} />
            <Row label={TELA.municipio} value={person.reg.city} />
            <Row label={TELA.secaoLinha} value={person.reg.section} tone={person.reg.section === "127" ? "" : "warn"} />
            {/* A marca ok na situação é o que o terminal considera em ordem. */}
            <Row label={TELA.situacao} value={person.reg.status} tone={person.reg.status.ok ? "ok" : "warn"} />
            <Row label={TELA.biometria} value={bio} tone={bioTone} />
            {c.voted && <Row label={TELA.urna} value={TELA.computado} tone="ok" />}
            {c.step === "cabina" && !c.voted && <Row label={TELA.urna} value={TELA.naCabina} />}
            {c.step === "decisao" && person.quits && !c.voted && (
              <Row label={TELA.urna} value={TELA.demorou} tone="warn" />
            )}
          </div>
        )}

        <div className="term-foot">
          <span>{t(c.loaded ? TELA.aguardaMesa : TELA.semRegistro)}</span>
          <i className="caret" aria-hidden="true" />
        </div>
      </div>
      <span className="terminal-legenda" aria-hidden="true">{t(TELA.legenda)}</span>
      </div>

      <div className="teclado" data-nodrag>
        {KEYS.map((k) => (
          <button key={k} type="button" className="tecla" onClick={() => onKey("digit", k)}>
            {k}
          </button>
        ))}
        <span className="teclado-guia" aria-hidden="true">●</span>
        <button type="button" className="tecla tecla-zero" onClick={() => onKey("digit", "0")}>0</button>
        <span className="teclado-guia" aria-hidden="true">●</span>
        <button type="button" className="tecla corrige" onClick={() => onKey("clear")}>
          {t(TELA.corrige)}
        </button>
        <button type="button" className="tecla confirma" onClick={() => onKey("confirm")}>
          {t(TELA.confirma)}
        </button>
      </div>
      </div>
      <div className="terminal-frente" aria-hidden="true">
        <i className="aparelho-parafuso" />
        <span className="terminal-respiros" />
        <span className="terminal-patrimonio">{t(TELA.patrimonio)}</span>
        <i className="aparelho-parafuso" />
      </div>
    </section>
  );
}
