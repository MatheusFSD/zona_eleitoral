import { useState } from "react";
import { MANUAL } from "../../data/people.js";
import { TXT, t } from "../../i18n.js";

/* O que está impresso no livro, fora o conteúdo do manual. */
const LIVRO = {
  anotacoes: { pt: "Anotações", en: "Notes" },
  running: { pt: "SEÇÃO 127 · ESCOLA MUNICIPAL HORIZONTE", en: "SECTION 127 · ESCOLA MUNICIPAL HORIZONTE" },
  lombada: { pt: "Arraste pela lombada para mover o manual", en: "Drag the spine to move the handbook" },
  lombadaLabel: { pt: "Lombada para mover o manual", en: "Spine for moving the handbook" },
  manual: { pt: "MANUAL", en: "HANDBOOK" },
  fecharCapa: { pt: "Fechar o manual pela capa", en: "Close the handbook by the cover" },
  fechar: { pt: "Fechar pela capa", en: "Close by the cover" },
  anteriores: { pt: "Páginas anteriores do manual", en: "Previous handbook pages" },
  proximas: { pt: "Próximas páginas do manual", en: "Next handbook pages" },
  abrir: { pt: "Abrir o manual da mesa", en: "Open the table handbook" },
  capaTitulo: { pt: ["Manual", "da mesa"], en: ["Table", "handbook"] },
  orientacoes: { pt: "ORIENTAÇÕES DA SEÇÃO", en: "SECTION GUIDELINES" },
  abraCapa: { pt: "Abra pela capa", en: "Open the cover" },
};
import "./handbook.css";

const PAGES = [{ title: TXT.manualDaMesa, contents: true }, ...MANUAL];
const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function Page({ index }) {
  const section = PAGES[index];
  return (
    <article className="rulebook-page">
      <span className="rulebook-running">{t(LIVRO.running)}</span>
      {section?.contents && <strong className="rulebook-seal">127</strong>}
      <h3>{t(section?.title ?? LIVRO.anotacoes)}</h3>
      {section?.contents ? <ol>{MANUAL.map((item) => <li key={item.id}>{t(item.title)}</li>)}</ol>
        : <ul>{t(section?.items)?.map((item) => <li key={item}>{item}</li>)}</ul>}
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
    <section className={`rulebook${opened ? " is-open" : ""}${coverMoving ? " cover-moving" : ""}`} aria-label={t(TXT.manualDaMesa)} aria-busy={!!turn || coverMoving}>
      <span className="rulebook-grip" title={t(LIVRO.lombada)} aria-label={t(LIVRO.lombadaLabel)}><i /><span>{t(LIVRO.manual)}</span><i /></span>
      <div className="rulebook-spread" inert={!opened || coverMoving || !!turn ? true : undefined} aria-hidden={!opened}>
        <div className="rulebook-left"><Page index={left} /></div>
        <div className="rulebook-right"><Page index={right} /></div>
        <button type="button" className="rulebook-close" data-nodrag onClick={toggleCover} aria-label={t(LIVRO.fecharCapa)} title={t(LIVRO.fechar)} />
        <button type="button" className="page-corner previous rulebook-previous" data-nodrag onClick={() => flip(-1)} disabled={spread === 0 || !!turn} aria-label={t(LIVRO.anteriores)} />
        <button type="button" className="page-corner next rulebook-next" data-nodrag onClick={() => flip(1)} disabled={spread === last || !!turn} aria-label={t(LIVRO.proximas)} />
      </div>
      {!!turn && <div className={`rulebook-leaf ${turn > 0 ? "forward" : "backward"}`} aria-hidden="true"
        onAnimationEnd={(event) => { if (event.target === event.currentTarget) { setSpread(spread + turn); setTurn(0); } }}>
        <div className="rulebook-face"><Page index={turn > 0 ? spread * 2 + 1 : (spread - 1) * 2 + 1} /></div>
        <div className="rulebook-face verso"><Page index={turn > 0 ? (spread + 1) * 2 : spread * 2} /></div>
      </div>}
      <div className="rulebook-cover" aria-hidden={opened && !coverMoving}
        onTransitionEnd={(event) => { if (event.target === event.currentTarget && event.propertyName === "transform") setCoverMoving(false); }}>
        <button type="button" className="rulebook-face rulebook-front" data-nodrag onClick={toggleCover} disabled={coverMoving || opened} aria-label={t(LIVRO.abrir)}>
          <span>ESCOLA MUNICIPAL HORIZONTE</span><b>127</b>
          <strong>{t(LIVRO.capaTitulo)[0]}<br />{t(LIVRO.capaTitulo)[1]}</strong><small>{t(LIVRO.orientacoes)}</small><i>{t(LIVRO.abraCapa)}</i>
        </button>
        <div className="rulebook-face verso" aria-hidden="true"><Page index={spread * 2} /></div>
      </div>
    </section>
  );
}
