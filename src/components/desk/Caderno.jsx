import { useState } from "react";

const PAGE_SIZE = 6;

/* O caderno de votação.

   É um só, do turno inteiro: as pessoas da seção já estão na folha desde a
   abertura, junto com quem não vai aparecer hoje, em ordem alfabética e
   com numeração sequencial. A folha não se atualiza a cada pessoa — o que
   muda ao longo do dia são as assinaturas, que ficam.

   Cada pessoa escreve com uma de três letras de mão, sorteada junto com ela.
   A coluna de assinatura é a memória do dia: no fim, dá para ler quem passou
   por aqui.

   A lista ocupa folhas de seis nomes. Virar a página não muda a ordem,
   as marcações ou as assinaturas; a mesa precisa consultar todas as folhas
   antes de concluir que um nome não está no caderno. */

export default function Caderno({ ledger, c, signatures, onRow, onSign }) {
  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState(0);
  const pages = Math.max(1, Math.ceil(ledger.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const marking = c?.step === "caderno";
  const signing = c?.step === "assinatura";
  const flip = (direction) => {
    if (turn || current + direction < 0 || current + direction >= pages) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) setPage(current + direction);
    else setTurn(direction);
  };

  const sheet = (index, moving = false) => {
    const rows = ledger.slice(index * PAGE_SIZE, (index + 1) * PAGE_SIZE);
    return (
      <div className={`book-sheet${moving ? ` turning ${turn > 0 ? "forward" : "backward"}` : ""}`}
        inert={moving || !!turn ? true : undefined}
        aria-hidden={moving || undefined}
        onAnimationEnd={(event) => {
          if (moving && event.target === event.currentTarget) { setPage(current + turn); setTurn(0); }
        }}>
      <div className="book-kicker">ESCOLA MUNICIPAL HORIZONTE · ZONA 041</div>
      <header className="book-head">
        <strong>Caderno de votação</strong>
        <span>Seção 127</span>
      </header>

      <div className="book-rolo" data-nodrag>
        <table>
          <colgroup>
            <col className="c-num" />
            <col />
            <col className="c-birth" />
            <col className="c-sign" />
          </colgroup>
          <thead>
            <tr>
              <th>Nº</th>
              <th>Nome</th>
              <th>Nascimento</th>
              <th>Assinatura</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const marked = c?.marked === row.seq;
              const firma = signatures[row.seq];

              return (
                <tr key={row.seq} className={marked ? "marcada" : undefined}>
                  <td>{row.seq}</td>
                  <td>
                    <button
                      className="linha"
                      onClick={() => onRow(row)}
                      disabled={!marking && !marked}
                      title={marking ? "Marcar esta linha" : undefined}
                    >
                      {row.name}
                    </button>
                  </td>
                  <td>{row.birth}</td>
                  <td className="assinatura">
                    {firma ? (
                      <span className={`firma m${firma.hand}`}>{firma.name}</span>
                    ) : marked && signing ? (
                      <button className="assinar" onClick={onSign}>
                        assinar
                      </button>
                    ) : marked ? (
                      <span className="visto">✓</span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <footer className="book-pages" data-nodrag>
        <button type="button" className="page-corner previous" onClick={() => flip(-1)} disabled={!!turn || current === 0} aria-label="Folha anterior" title="Virar para a folha anterior" />
        <span aria-live="polite">
          <b>Folha {index + 1} de {pages}</b>
          <small>{rows.length ? `Nº ${rows[0].seq}–${rows.at(-1).seq}` : "Sem registros"}</small>
        </span>
        <button type="button" className="page-corner next" onClick={() => flip(1)} disabled={!!turn || current === pages - 1} aria-label="Próxima folha" title="Virar para a próxima folha" />
      </footer>
      <span className="book-gesture-hint">Levante o canto para passar a folha</span>
      </div>
    );
  };

  return (
    <section className="book" aria-label="Caderno de votação" aria-busy={!!turn}>
      {sheet(turn > 0 ? current + turn : current)}
      {!!turn && sheet(turn > 0 ? current : current + turn, true)}
    </section>
  );
}
