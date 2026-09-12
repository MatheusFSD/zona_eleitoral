import Portrait from "./Portrait.jsx";
import { COORDENADORA } from "../data/tutorial.js";
import { IRRITATION_LIMIT } from "../day.js";
import { TXT, t } from "../i18n.js";
import "./neusa.css";

export default function Neusa({ errors }) {
  const level = Math.max(0, Math.min(errors, IRRITATION_LIMIT));
  const background = ["#769e79", "#a0a56c", "#c2a363", "#c98958", "#bd6250", "#a94440"][level];
  const person = { ...COORDENADORA, look: { ...COORDENADORA.look, irritation: level } };
  return <div className="neusa-watch" style={{ backgroundColor: background }} role="img" aria-label={t(TXT.neusaRetrato, { humor: t(TXT.neusaHumor)[level] })}>
    <div aria-hidden="true"><Portrait person={person} procedural /></div>
  </div>;
}
