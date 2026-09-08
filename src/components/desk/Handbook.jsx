import { useState } from "react";
import { MANUAL } from "../../data/people.js";
import "./handbook.css";

const PAGES = [{ title: "Manual da mesa", contents: true }, ...MANUAL];
const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function Page({ index }) {
  const section = PAGES[index];
  return (
    <article className="rulebook-page">
      <span className="rulebook-running">SEÇÃO 127 · ESCOLA MUNICIPAL HORIZONTE</span>
      {section?.contents && <strong className="rulebook-seal">127</strong>}
      <h3>{section?.title ?? "Anotações"}</h3>
      {section?.contents ? <ol>{MANUAL.map((item) => <li key={item.id}>{item.title}</li>)}</ol>
        : <ul>{section?.items.map((item) => <li key={item}>{item}</li>)}</ul>}
      <span className="rulebook-number">{index + 1}</span>
    </article>
  );
}

// Cada folha tem duas faces: a página ímpar sai da direita e seu verso
// pousa à esquerda. A capa segue a mesma articulação, sem outra peça abrindo.
export default function Handbook() {
  const [spread, setSpread] = useState(0);
  const [opened, setOpened] = useState(false);
  const [coverMoving, setCoverMoving] = useState(false);
  const [turn, setTurn] = useState(0);
  const last = Math.ceil(PAGES.length / 2) - 1;
  const toggleCover = () => {
    if (turn || coverMoving) return;
    setCoverMoving(!reduced());
    setOpened(!opened);
  };
  const flip = (direction) => {
    if (turn || coverMoving || spread + direction < 0 || spread + direction > last) return;
    if (reduced()) setSpread(spread + direction);
    else setTurn(direction);
  };
  const left = (turn < 0 ? spread - 1 : spread) * 2;
  const right = (turn > 0 ? spread + 1 : spread) * 2 + 1;

  return (
    <section className={`rulebook${opened ? " is-open" : ""}${coverMoving ? " cover-moving" : ""}`} aria-label="Manual da mesa" aria-busy={!!turn || coverMoving}>
      <span className="rulebook-grip" title="Arraste pela lombada para mover o manual" aria-label="Lombada para mover o manual"><i /><span>MANUAL</span><i /></span>
      <div className="rulebook-spread" inert={!opened || coverMoving || !!turn ? true : undefined} aria-hidden={!opened}>
        <div className="rulebook-left"><Page index={left} /></div>
        <div className="rulebook-right"><Page index={right} /></div>
        <button type="button" className="rulebook-close" data-nodrag onClick={toggleCover} aria-label="Fechar o manual pela capa" title="Fechar pela capa" />
        <button type="button" className="page-corner previous rulebook-previous" data-nodrag onClick={() => flip(-1)} disabled={spread === 0 || !!turn} aria-label="Páginas anteriores do manual" />
        <button type="button" className="page-corner next rulebook-next" data-nodrag onClick={() => flip(1)} disabled={spread === last || !!turn} aria-label="Próximas páginas do manual" />
      </div>
      {!!turn && <div className={`rulebook-leaf ${turn > 0 ? "forward" : "backward"}`} aria-hidden="true"
        onAnimationEnd={(event) => { if (event.target === event.currentTarget) { setSpread(spread + turn); setTurn(0); } }}>
        <div className="rulebook-face"><Page index={turn > 0 ? spread * 2 + 1 : (spread - 1) * 2 + 1} /></div>
        <div className="rulebook-face verso"><Page index={turn > 0 ? (spread + 1) * 2 : spread * 2} /></div>
      </div>}
      <div className="rulebook-cover" aria-hidden={opened && !coverMoving}
        onTransitionEnd={(event) => { if (event.target === event.currentTarget && event.propertyName === "transform") setCoverMoving(false); }}>
        <button type="button" className="rulebook-face rulebook-front" data-nodrag onClick={toggleCover} disabled={coverMoving || opened} aria-label="Abrir o manual da mesa">
          <span>ESCOLA MUNICIPAL HORIZONTE</span><b>127</b>
          <strong>Manual<br />da mesa</strong><small>ORIENTAÇÕES DA SEÇÃO</small><i>Abra pela capa</i>
        </button>
        <div className="rulebook-face verso" aria-hidden="true"><Page index={spread * 2} /></div>
      </div>
    </section>
  );
}
