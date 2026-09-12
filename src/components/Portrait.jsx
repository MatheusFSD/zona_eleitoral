import { useEffect, useId, useState } from "react";
import { faceOf } from "../face.js";
import { t } from "../i18n.js";

const RETRATO = { pt: "Retrato de {nome}", en: "Portrait of {nome}" };

const BASE = import.meta.env.BASE_URL;
const INK = "#102b3a";
const LEGACY = ["crop", "side", "long"];

function blend(a, b, amount) {
  const channels = (color) => [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  const target = channels(b);
  return `#${channels(a).map((v, i) => Math.round(v + (target[i] - v) * amount).toString(16).padStart(2, "0")).join("")}`;
}

// Peças no mesmo espaço de 68 × 80. As silhuetas do cabelo ultrapassam
// o crânio, para cada combinação continuar reconhecível em tamanho pequeno.
function Hair({ style, color, back = false }) {
  if (back) {
    const shapes = {
      long: <path d="M-5 27Q-7-10 33-10Q75-10 75 30V106H-7Z" />,
      bob: <path d="M-7 28Q-7-10 34-10Q77-10 77 32V66Q76 84 57 84H8Q-8 81-7 65Z" />,
      pony: <path d="M59 7Q89-2 89 25Q90 49 77 83L68 91V29H58Z" />,
      bun: <><circle cx="29" cy="-12" r="19" /><path d="M0 20Q-12 59 8 72H62Q80 55 68 20Z" /></>,
      curly: <><circle cx="1" cy="18" r="14" /><circle cx="68" cy="20" r="16" /><circle cx="65" cy="39" r="14" /></>,
      bald: <path d="M-4 28Q-10 23-8 40L0 61H6V30ZM62 30H70Q80 28 78 44L68 62H62Z" />,
    };
    return <g fill={color}>{shapes[style] ?? null}</g>;
  }
  const shapes = {
    crop: <path d="M-4 24V5Q-4-8 11-8H52Q72-8 72 13V36H63V12H15Q15 25-4 24Z" />,
    side: <path d="M-10 8Q-10-20 18-20H56Q73-20 73-3V42H61V15Q61 8 51 8H44Q28 39 4 28Q-10 25-10 8Z" />,
    quiff: <><path d="M-8 14V-34H34Q66-34 66-4V14ZM59 10H70V38H61Z" /><path d="M1-27V7" fill="none" stroke={blend(color, "#ffffff", 0.16)} strokeWidth="4" strokeLinecap="round" /></>,
    flat: <path d="M-12-18H42Q61-18 61 2H77V40H60V17H8Q-12 17-12-3Z" />,
    wave: <><path d="M0 18Q-5-7 21-10Q35-7 40-13Q65-17 72 17Q53 1 48 0Q37 19 20 11Q10 24 0 18Z" /><circle cx="18" cy="-9" r="14" /></>,
    fringe: <path d="M-7 38V17Q-7-20 34-20Q75-20 75 18V44Q62 37 47 21L34 10V38Z" />,
    long: <path d="M-5 43V18Q-5-12 34-12Q73-12 73 18V50H63V25Q42 19 34 5Q26 23 5 28V58H-5Z" />,
    bob: <path d="M-7 34V16Q-7-13 34-13Q77-13 77 20V43H64L42 14L30 29H2V39Z" />,
    bun: <><path d="M-3 36V12Q-3-9 20-9H48Q72-9 72 18V40H62V17H8V36Z" /><circle cx="7" cy="4" r="13" /><circle cx="56" cy="5" r="15" /></>,
    pony: <path d="M-3 31V16Q-3-10 31-10Q66-10 71 17V37H62V20Q43 19 26 5Q18 25-3 31Z" />,
    curly: <><path d="M-5 28V8H73V32H62V18H8V30Z" /><circle cx="2" cy="7" r="14" /><circle cx="15" cy="-6" r="17" /><circle cx="36" cy="-10" r="19" /><circle cx="56" cy="-3" r="17" /><circle cx="69" cy="12" r="16" /></>,
    bald: <path d="M0 29H5V48H0ZM63 29H68V48H63Z" />,
  };
  return <g fill={color}>{shapes[style] ?? shapes.crop}</g>;
}

const HEADS = {
  oval: "M0 32C0 11 13 0 34 0S68 11 68 32V53Q68 80 39 80H16Q0 80 0 64Z",
  round: "M0 32C0 10 15 0 34 0S68 10 68 32V52Q68 80 34 80Q0 80 0 58Z",
  long: "M3 30Q3 0 34 0Q65 0 65 30V56Q65 80 40 80H17Q3 80 3 65Z",
  square: "M0 29Q0 0 29 0H38Q68 0 68 29V60Q68 80 48 80H15Q0 80 0 65Z",
};

function Beard({ style, color, skin }) {
  const shapes = {
    stubble: <path d="M3 49Q10 61 21 57L34 54L48 57Q60 59 66 49V61Q65 80 41 80H19Q3 80 3 65ZM23 60V70H45V60Z" fillRule="evenodd" fill={blend(skin, color, 0.28)} />,
    mustache: <path d="M9 51Q21 58 34 48Q47 58 59 51V58Q58 65 47 65H21Q9 65 9 58Z" />,
    handlebar: <path d="M34 48C25 46 9 54 8 64C6 77 24 77 34 62C44 77 62 77 60 64C59 54 43 46 34 48Z" />,
    goatee: <><path d="M17 82V57Q17 47 28 48H40Q51 47 51 57V82" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" /><rect x="28" y="73" width="12" height="9" rx="4" /></>,
    full: <path d="M8 45Q16 44 18 51V60Q18 68 24 67L28 64H40L44 67Q50 68 50 60V51Q52 44 60 45V70Q60 91 34 92Q8 91 8 70ZM18 52Q24 46 34 48Q44 46 50 52V57H18Z" />,
  };
  return <g fill={color}>{shapes[style] ?? null}</g>;
}

export default function Portrait({ person, faceKey, art: folder = "personagens", procedural = false }) {
  const [art, setArt] = useState(null);
  const clipId = useId();
  const { id, name } = person;
  const src = `${BASE}images/${folder}/${id}.png`;

  useEffect(() => {
    if (procedural) return;
    const probe = new Image();
    let live = true;
    probe.onload = () => live && setArt(src);
    probe.onerror = () => live && setArt(null);
    probe.src = src;
    return () => { live = false; };
  }, [src, procedural]);

  if (!procedural && art === src) return <img src={art} alt={t(RETRATO, { nome: name })} />;

  const { skin, shirt, hair, style, face, age, beard, glasses, mood, collar, build } = faceOf(person, faceKey);
  const cut = LEGACY[style] ?? style;
  const shade = blend(skin, "#733e36", 0.22);
  const cheek = blend(skin, "#c0524e", 0.38);
  const noseColor = blend(skin, "#de525e", 0.72);
  const eyebrow = blend(hair, INK, 0.35);
  const seam = blend(shirt, INK, 0.25);
  const collarColor = blend(shirt, "#d31969", 0.62);
  const young = age === "young" ? 0.96 : 1;
  const sx = build.w * young;
  const sy = build.h * young;
  const headTransform = `translate(${80 - 34 * sx} ${126 - 80 * sy}) scale(${sx} ${sy})`;
  const eyeY = 32 + build.eyeY * 0.5;
  const gap = 16 * build.gap;
  const eyes = [30 - gap, 30 + gap];
  const lipY = 65;
  const irritation = person.look?.irritation;
  const mouth = {
    calm: `M28 ${lipY}h6q4 0 4-4`,
    smile: `M26 ${lipY - 2}q7 8 15-1`,
    tense: `M27 ${lipY}h12`,
    tired: `M27 ${lipY + 1}q6-4 12 0`,
  };

  return (
    <svg viewBox="0 0 160 200" preserveAspectRatio="xMidYMax meet" role="img" aria-label={t(RETRATO, { nome: name })}>
      <g transform={headTransform}><Hair style={cut} color={hair} back /></g>
      {/* O busto mantém o enquadramento da sala e da foto do documento. */}
      <path d="M48 143Q22 147 8 181L3 200H157L152 181Q138 147 112 143Z" fill={shirt} />
      <path d="M54 113H105V147H54Z" fill={skin} />
      <path d="M83 113H105V147H70Z" fill={shade} />
      <path d="M42 147H116" stroke={collarColor} strokeWidth="8" strokeLinecap="round" />
      {collar !== "tee" && (
        <g fill={blend(shirt, "#ffffff", 0.16)}>
          <path d="M47 150L77 155L65 168Z" /><path d="M111 150L81 155L93 168Z" />
        </g>
      )}
      {collar === "button" && <path d="M79 164V200" stroke={seam} strokeWidth="2" />}
      {(collar === "button" || collar === "polo") && <g fill={seam}><circle cx="85" cy="176" r="2" /><circle cx="85" cy="189" r="2" /></g>}

      <g transform={headTransform}>
        <defs><clipPath id={clipId}><path d={HEADS[face] ?? HEADS.oval} /></clipPath></defs>
        <g fill={skin}>
          <circle cx="0" cy={eyeY + 8 + build.earY} r={8 * build.ear} />
          <circle cx="68" cy={eyeY + 8 + build.earY} r={8 * build.ear} />
          <path d={HEADS[face] ?? HEADS.oval} />
        </g>
        <path d="M56 0H74V86H17Q56 73 56 44Z" fill={shade} clipPath={`url(#${clipId})`} />
        <g fill={cheek}>
          <circle cx="-1" cy={eyeY + 8 + build.earY} r={3.2 * build.ear} />
          <circle cx="69" cy={eyeY + 8 + build.earY} r={3.2 * build.ear} />
        </g>
        {eyes.map((x, i) => (
          <g key={i}>
            <rect x={x - 6.5} y={eyeY - 6} width="13" height="15" rx="6.5" fill="#fffaf0" />
            <circle cx={x + 0.7} cy={eyeY + 1} r={build.eye + 0.3} fill={INK} />
            {mood === "tired" && <path d={`M${x - 6.5} ${eyeY - 2}h13`} stroke={skin} strokeWidth="5" />}
            <path d={`M${x - 6} ${eyeY - 12 + (i === 0 ? -2 : 0)}l12 ${irritation != null ? (i === 0 ? 1 : -1) * irritation * 1.8 : mood === "tense" ? (i === 0 ? 3 : -3) : 0}`} stroke={eyebrow} strokeWidth="7" strokeLinecap="round" />
            {age === "old" && <path d={`M${x - 4} ${eyeY + 13}h8`} stroke={shade} strokeWidth="2" strokeLinecap="round" />}
          </g>
        ))}
        <path d={irritation != null ? `M26 ${lipY}q7 ${7 - irritation * 3} 15 0` : mouth[mood] ?? mouth.calm} transform={`translate(33 ${lipY}) scale(${build.mouth} 1) translate(-33 -${lipY})`} fill="none" stroke={cheek} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 74v6" stroke={shade} strokeWidth="4" strokeLinecap="round" />
        <Beard style={beard} color={hair} skin={skin} />
        <rect x={30 - 7 * build.nose} y={eyeY - 7} width={14 * build.nose} height={24 * build.nose} rx={7 * build.nose} fill={noseColor} />
        <Hair style={cut} color={hair} />
        {glasses && (
          <g fill="none" stroke={INK} strokeWidth="2.8">
            {eyes.map((x, i) => <rect key={i} x={x - 9} y={eyeY - 8} width="18" height="19" rx="6" />)}
            <path d={`M${eyes[0] + 9} ${eyeY - 2}Q30 ${eyeY - 6} ${eyes[1] - 9} ${eyeY - 2}M${eyes[0] - 9} ${eyeY - 3}H1M${eyes[1] + 9} ${eyeY - 3}H66`} />
          </g>
        )}
      </g>
    </svg>
  );
}
