import { Piece } from "../desk.jsx";
import { ACTIONS } from "../data/people.js";
import Caderno from "./desk/Caderno.jsx";
import Doc from "./desk/Doc.jsx";
import TerminalPiece from "./desk/TerminalPiece.jsx";
import { DeskFrame, DeskWear } from "./desk/SchoolDesk.jsx";
import { Belonging, Blocked, Handbook, Reader, Receipt } from "./desk/Small.jsx";
import { realce } from "../data/tutorial.js";
import { TXT, t } from "../i18n.js";

/* A mesa receptora: uma superfície de fórmica com os objetos soltos em cima.

   É uma carteira de escola: 62 cm de tampo, e tudo o que está em cima tem o
   tamanho que teria de verdade. Documento, terminal, caderno, leitor, livro do
   manual e folha de impedidos são objetos soltos que a mesa empurra para onde
   quiser, e quem foi tocado por último fica por cima. Embaixo, presa, fica só
   a régua com as quatro saídas. */

/* Onde cada objeto começa o dia. Percentagem enquanto ninguém mexeu; a partir
   do primeiro arrasto viram pixels. */
export const SPOTS = {
  terminal: { x: "0.5%", y: "1%", z: 5 },
  doc: { x: "38.5%", y: "1%", z: 6 },
  caderno: { x: "66%", y: "0%", z: 4 },
  manual: { x: "45%", bottom: "2%", z: 2 },
  listagem: { x: "27%", bottom: "2%", z: 2 },
  leitor: { x: "54%", y: "1%", z: 3 },
  /* O que a pessoa larga na carteira cai por cima do que estiver ali: numa
     carteira de escola não sobra tampo, e é a mesa que empurra para o lado. */
  "item-celular": { x: "61%", y: "47%", z: 7 },
  comprovante: { x: "75%", y: "47%", z: 8 },
  "item-chaves": { x: "75%", y: "72%", z: 7 },
};

export const ITEM_SPOTS = {
  "item-celular": SPOTS["item-celular"],
  "item-chaves": SPOTS["item-chaves"],
};

export default function Desk({ person, c, ledger, signatures, blocked, time, desk, on, running, foco }) {
  const step = c.step;
  const pending = person && running;
  const devolvendo = pending && step === "entrega";

  /* O que está na mesa neste instante: antes da cabina, o que a pessoa jogou
     e ainda não foi guardado; depois, o que está guardado e ainda não voltou
     para a mão dela. */
  const naMesa =
    !pending || (step !== "cabina" && step !== "entrega")
      ? []
      : person.belongings.filter((k) => !c.given.includes(k));

  return (
    <section className="mesa" aria-label={t(TXT.mesa)}>
      <div className="carteira">
        <DeskFrame />
        <div className="carteira-tampo">
          <DeskWear />
          <span className="carteira-sulco" aria-hidden="true" />
          <div className="mesa-superficie">
            {!(pending && c.docBack) && (
              <Piece
                id="doc"
                desk={desk}
                foco={foco}
                className={`p-doc${pending ? " chegando" : ""}`}
                label={t(TXT.documentoApresentado)}
                hint={devolvendo}
                key={person ? person.id : "vazio"}
              >
                <Doc person={pending ? person : null} />
              </Piece>
            )}

            <Piece id="terminal" desk={desk} foco={foco} className="p-terminal" label={t(TXT.terminal)} hint={pending && (step === "terminal" || step === "ano")}>
              <TerminalPiece person={person} c={c} time={time} onKey={on.key} />
            </Piece>

            <Piece id="caderno" desk={desk} foco={foco} className="p-caderno" label={t(TXT.cadernoVotacao)} hint={pending && (step === "caderno" || step === "assinatura")}>
              <Caderno key={ledger[0]?.seq ?? "vazio"} ledger={ledger} c={c} signatures={signatures} onRow={on.row} onSign={on.sign} />
            </Piece>

            <Piece id="leitor" desk={desk} foco={foco} className="p-leitor" label={t(TXT.leitorBiometrico)} hint={pending && step === "biometria"}>
              <Reader c={c} onRead={on.read} person={person} active={!!pending && step === "biometria"} />
            </Piece>

            <Piece id="listagem" desk={desk} foco={foco} className="p-listagem" label={t(TXT.folhaImpedidos)}>
              <Blocked list={blocked} found={c.consulted} onFind={on.list} />
            </Piece>

            <Piece id="manual" desk={desk} foco={foco} className="p-manual" label={t(TXT.manualDaMesa)}>
              <Handbook />
            </Piece>

            {/* Os pertences: a pessoa joga na mesa antes de votar e recebe de
                volta depois, arrastados até ela. */}
            {naMesa.map((kind, i) => (
              <Piece
                key={kind}
                id={`item-${kind}`}
                desk={desk}
                foco={foco}
                className={`p-item p-${kind}${devolvendo ? "" : " chegando"}`}
                label={t(TXT[kind])}
                hint={devolvendo}
                delay={i * 140}
              >
                <Belonging kind={kind} />
              </Piece>
            ))}

            {devolvendo && !c.receipt && (
              <Piece id="comprovante" desk={desk} foco={foco} className="p-comprovante" label={t(TXT.comprovante)} hint>
                <Receipt person={person} />
              </Piece>
            )}
          </div>

          <span className="carteira-patrimonio" aria-hidden="true">E. M. HORIZONTE <b>041 / 03</b></span>
        </div>
      </div>

      <div className={`mesa-acoes${realce(foco, "saidas")}`}>
        <div className="saidas">
          {ACTIONS.map((a) => (
            <button
              key={a.id}
              className={`saida ${a.id}`}
              onClick={() => on.action(a.id)}
              disabled={!pending}
              title={t(a.hint)}
            >
              <kbd>{a.hotkey}</kbd>
              <span>{t(a.label)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

