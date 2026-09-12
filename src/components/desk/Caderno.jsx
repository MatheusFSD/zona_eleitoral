import { useState } from "react";
import { TXT, t } from "../../i18n.js";

/* O que está impresso na folha do caderno. O nome da escola fica como está. */
const FOLHA = {
  cabeca: { pt: "ESCOLA MUNICIPAL HORIZONTE · ZONA 041", en: "ESCOLA MUNICIPAL HORIZONTE · ZONE 041" },
  secao: { pt: "Seção 127", en: "Section 127" },
  numero: { pt: "Nº", en: "No." },
  nome: { pt: "Nome", en: "Name" },
  nascimento: { pt: "Nascimento", en: "Date of birth" },
  assinatura: { pt: "Assinatura", en: "Signature" },
  marcarLinha: { pt: "Marcar esta linha", en: "Mark this line" },
  assinar: { pt: "assinar", en: "sign" },
  folhaDe: { pt: "Folha {n} de {total}", en: "Sheet {n} of {total}" },
  faixa: { pt: "Nº {de}–{ate}", en: "No. {de}–{ate}" },
  semRegistros: { pt: "Sem registros", en: "No entries" },
  folhaAnterior: { pt: "Folha anterior", en: "Previous sheet" },
  virarAnterior: { pt: "Virar para a folha anterior", en: "Turn back a sheet" },
  proximaFolha: { pt: "Próxima folha", en: "Next sheet" },
  virarProxima: { pt: "Virar para a próxima folha", en: "Turn to the next sheet" },
  dica: { pt: "Levante o canto para passar a folha", en: "Lift the corner to turn the sheet" },
};

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
      <div className="book-kicker">{t(FOLHA.cabeca)}</div>
      <header className="book-head">
        <strong>{t(TXT.cadernoVotacao)}</strong>
        <span>{t(FOLHA.secao)}</span>
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
              <th>{t(FOLHA.numero)}</th>
              <th>{t(FOLHA.nome)}</th>
              <th>{t(FOLHA.nascimento)}</th>
              <th>{t(FOLHA.assinatura)}</th>
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
                      title={marking ? t(FOLHA.marcarLinha) : undefined}
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
                        {t(FOLHA.assinar)}
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
        <button type="button" className="page-corner previous" onClick={() => flip(-1)} disabled={!!turn || current === 0} aria-label={t(FOLHA.folhaAnterior)} title={t(FOLHA.virarAnterior)} />
        <span aria-live="polite">
          <b>{t(FOLHA.folhaDe, { n: index + 1, total: pages })}</b>
          <small>{rows.length ? t(FOLHA.faixa, { de: rows[0].seq, ate: rows.at(-1).seq }) : t(FOLHA.semRegistros)}</small>
        </span>
        <button type="button" className="page-corner next" onClick={() => flip(1)} disabled={!!turn || current === pages - 1} aria-label={t(FOLHA.proximaFolha)} title={t(FOLHA.virarProxima)} />
      </footer>
      <span className="book-gesture-hint">{t(FOLHA.dica)}</span>
      </div>
    );
  };

  return (
    <section className="book" aria-label={t(TXT.cadernoVotacao)} aria-busy={!!turn}>
      {sheet(turn > 0 ? current + turn : current)}
      {!!turn && sheet(turn > 0 ? current : current + turn, true)}
    </section>
  );
}
