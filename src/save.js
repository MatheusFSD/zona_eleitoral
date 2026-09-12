import { makeShift } from "./data/shift.js";
import { PASSOS } from "./data/tutorial.js";
import { newCase } from "./flow.js";

export const SAVE_KEY = "secao-127.save.v1";
export const SAVABLE_PHASES = ["start", "opening", "tutorial", "chamando", "working", "feedback", "closing"];
const object = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const integer = (v, max = 10000) => Number.isInteger(v) && v >= 0 && v <= max;

export function snapshot({ shift, state, c, signatures, tutor, spots }) {
  return {
    version: 1, seed: shift.seed,
    // A caminhada pelo corredor é visual. Ao carregar, a pessoa já está à mesa.
    state: { ...state, waiting: state.phase === "working" ? state.waiting.filter((i) => i !== state.index) : state.waiting },
    c, signatures, tutor, spots,
  };
}

export function readSave(storage) {
  try {
    const data = JSON.parse((storage ?? window.localStorage).getItem(SAVE_KEY));
    if (!object(data) || data.version !== 1 || typeof data.seed !== "string" || !data.seed || data.seed.length > 160) return null;
    const shift = makeShift(data.seed);
    const { state: s, c, signatures, tutor, spots } = data;
    const count = shift.people.length;
    if (!object(s) || !SAVABLE_PHASES.includes(s.phase) || !integer(s.index, count - 1)) return null;
    if (!["clock", "served", "votes", "correct", "errors"].every((key) => integer(s[key]))) return null;
    if (s.served > count || s.correct > s.served || s.votes > s.served || s.errors >= 5) return null;
    if (!Array.isArray(s.waiting) || !s.waiting.every((i) => integer(i, count - 1)) || new Set(s.waiting).size !== s.waiting.length) return null;
    if (!Array.isArray(s.marks) || s.marks.length > count || !s.marks.every((v) => v == null || v === "ok" || v === "err")) return null;
    if (s.phase === "feedback" && (!object(s.result) || typeof s.result.right !== "boolean" || !["title", "text", "stamp"].every((key) => typeof s.result[key] === "string"))) return null;
    if (!object(c) || !["terminal", "caderno", "biometria", "ano", "assinatura", "cabina", "entrega", "decisao"].includes(c.step)) return null;
    for (const [key, value] of Object.entries(newCase())) {
      if (Array.isArray(value)) { if (!Array.isArray(c[key])) return null; }
      else if (value !== null && typeof c[key] !== typeof value) return null;
    }
    if (!integer(c.tries, 4) || c.typed.length > 4 || !["idle", "fail", "ok", "esgotada"].includes(c.bio)) return null;
    if (![c.given, c.perguntadas, c.aberto].every((list) => list.every((v) => typeof v === "string"))) return null;
    if (!c.dialogo.every((line) => object(line) && typeof line.mesa === "string" && typeof line.pessoa === "string")) return null;
    if (!object(signatures) || !Object.values(signatures).every((v) => object(v) && typeof v.name === "string" && integer(v.hand, 2))) return null;
    if (s.phase === "tutorial" && (!object(tutor) || !integer(tutor.i, PASSOS.length - 1) || !Array.isArray(tutor.log) || !tutor.log.every((line) => object(line) && typeof line.texto === "string"))) return null;
    if (!object(spots) || !Object.values(spots).every((spot) => object(spot) && Object.values(spot).every((v) => (typeof v === "number" && Number.isFinite(v)) || (typeof v === "string" && /^-?[\d.]+%$/.test(v))))) return null;
    return { ...data, shift };
  } catch { return null; }
}

export function writeSave(data, storage) {
  try { (storage ?? window.localStorage).setItem(SAVE_KEY, JSON.stringify(data)); return true; }
  catch { return false; }
}

export function clearSave(storage) {
  try { (storage ?? window.localStorage).removeItem(SAVE_KEY); return true; }
  catch { return false; }
}
