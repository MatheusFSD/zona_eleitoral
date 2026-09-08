/* O terminal da mesa.

   Ele não sabe quem está na frente da mesa: só responde ao número que a mesa
   digitar. Enquanto ninguém digitar a identificação do documento, a tela fica
   esperando — e é isso que trava o resto do atendimento.

   Depois da quarta falha de digital, a mesma tela passa a pedir o ano de
   nascimento, que a mesa pergunta à pessoa e digita aqui. */

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

function Row({ label, value, tone }) {
  return (
    <div className="row">
      <span>{label}</span>
      <strong className={tone ? `rv ${tone}` : "rv"}>{value}</strong>
    </div>
  );
}

function bioLine(c) {
  if (c.bio === "ok") return ["CONFIRMADA", "ok"];
  if (c.bio === "esgotada") return ["SEM LEITURA", "warn"];
  if (c.tries > 0) return [`FALHA ${c.tries}/4`, "warn"];
  return ["AGUARDANDO", ""];
}

export default function TerminalPiece({ person, c, time, onKey }) {
  const asking = c.step === "ano";
  const [bio, bioTone] = bioLine(c);
  const wide = asking ? 4 : 4; // identificação e ano têm quatro dígitos

  return (
    <section className="terminal" aria-label="Terminal da seção">
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
        <strong>SEÇÃO <b>127</b></strong>
        <span><i aria-hidden="true" /> ligado</span>
      </header>
      <div className="terminal-console">
      <div className="terminal-moldura">
      <div className="screen" aria-live="polite">
        <div className="term-head">
          <strong>CADASTRO</strong>
          <span>{time}</span>
        </div>

        {!c.loaded && !asking && (
          <div className="term-ask">
            <p>IDENTIFICAÇÃO DO DOCUMENTO</p>
            <div className="term-digits">
              {Array.from({ length: wide }, (_, i) => (
                <i key={i} className={c.typed[i] ? "cheio" : ""}>
                  {c.typed[i] ?? "_"}
                </i>
              ))}
            </div>
            <small>{c.refused || "Digite os quatro dígitos e confirme."}</small>
          </div>
        )}

        {asking && (
          <div className="term-ask">
            <p>ANO DE NASCIMENTO</p>
            <div className="term-digits">
              {Array.from({ length: wide }, (_, i) => (
                <i key={i} className={c.typed[i] ? "cheio" : ""}>
                  {c.typed[i] ?? "_"}
                </i>
              ))}
            </div>
            <small>{c.refused || "Pergunte à pessoa e digite o ano."}</small>
          </div>
        )}

        {c.loaded && !asking && (
          <div className="term-rows">
            <Row label="ELEITOR" value={person.reg.name} />
            <Row label="NASC." value={person.reg.birth} />
            <Row label="MUNICÍPIO" value={person.reg.city} />
            <Row label="SEÇÃO" value={person.reg.section} tone={person.reg.section === "127" ? "" : "warn"} />
            <Row
              label="SITUAÇÃO"
              value={person.reg.status}
              tone={person.reg.status.startsWith("REGULAR") ? "ok" : "warn"}
            />
            <Row label="BIOMETRIA" value={bio} tone={bioTone} />
            {c.voted && <Row label="URNA" value="VOTO COMPUTADO" tone="ok" />}
            {c.step === "cabina" && !c.voted && <Row label="URNA" value="ELEITOR NA CABINA" />}
            {c.step === "decisao" && person.quits && !c.voted && (
              <Row label="URNA" value="DEMOROU · NÃO VOTOU" tone="warn" />
            )}
          </div>
        )}

        <div className="term-foot">
          <span>{c.loaded ? "AGUARDANDO A MESA" : "SEM REGISTRO NA TELA"}</span>
          <i className="caret" aria-hidden="true" />
        </div>
      </div>
      <span className="terminal-legenda" aria-hidden="true">terminal da mesa · TM 127</span>
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
          CORRIGE
        </button>
        <button type="button" className="tecla confirma" onClick={() => onKey("confirm")}>
          CONFIRMA
        </button>
      </div>
      </div>
      <div className="terminal-frente" aria-hidden="true">
        <i className="aparelho-parafuso" />
        <span className="terminal-respiros" />
        <span className="terminal-patrimonio">PATRIMÔNIO · 0127</span>
        <i className="aparelho-parafuso" />
      </div>
    </section>
  );
}
