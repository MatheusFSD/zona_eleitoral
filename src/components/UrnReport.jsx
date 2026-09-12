import { seed, stream } from "../random.js";
import { t } from "../i18n.js";

// As duas impressões pertencem à mesma máquina e ao mesmo turno.
function identification(key) {
  const rnd = stream(seed(`${key}-abertura`));
  const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));
  const hex = () => "0123456789ABCDEF"[int(0, 15)];
  return { aptos: int(268, 349), code: `${hex()}${hex()}${int(10, 99)}-${hex()}${int(100, 999)}` };
}

const TITULO = {
  abertura: { pt: "Zerésima", en: "Zero tape" },
  encerramento: { pt: "Boletim de urna", en: "Results tape" },
};
const IMPRESSA = {
  abertura: { pt: "Zerésima impressa", en: "Printed zero tape" },
  encerramento: { pt: "Boletim de urna impresso", en: "Printed results tape" },
};
const LINHA = {
  cabeca: { pt: "SEÇÃO 127 · ZONA 041", en: "SECTION 127 · ZONE 041" },
  turno: { pt: "TURNO", en: "SHIFT" },
  aptos: { pt: "APTOS", en: "ELIGIBLE" },
  votos: { pt: "VOTOS", en: "VOTES" },
  brancos: { pt: "BRANCOS", en: "BLANK" },
  nulos: { pt: "NULOS", en: "NULL" },
  semValor: { pt: "Sem valor oficial", en: "No official value" },
};

export default function UrnReport({ seedText, votes = 0, closing = false }) {
  const { aptos, code } = identification(seedText);
  const qual = closing ? "encerramento" : "abertura";
  return <article className="zeresima" aria-label={t(IMPRESSA[qual])}>
    <p className="zr-head">{t(LINHA.cabeca)}</p>
    <div className="zr-rule" />
    <h3>{t(TITULO[qual])}</h3>
    <div className="zr-row"><span>{t(LINHA.turno)}</span><b>{seedText}</b></div>
    <div className="zr-row"><span>{t(LINHA.aptos)}</span><b>{aptos}</b></div>
    <div className="zr-row zr-votes"><span>{t(LINHA.votos)}</span><b>{String(closing ? votes : 0).padStart(3, "0")}</b></div>
    {!closing && <>
      <div className="zr-row"><span>{t(LINHA.brancos)}</span><b>000</b></div>
      <div className="zr-row"><span>{t(LINHA.nulos)}</span><b>000</b></div>
    </>}
    <div className="zr-rule" />
    <p className="zr-foot">{code}<br />{t(LINHA.semValor)}</p>
  </article>;
}
