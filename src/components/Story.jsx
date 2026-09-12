import { useEffect, useRef, useState } from "react";
import { TXT, t } from "../i18n.js";
import "./story.css";

/* O prólogo em três cenas. Cada cena traz o lugar, a descrição da imagem e as
   falas, sempre nos dois idiomas — nomes de pessoas e de lugares ficam como
   estão (veja [i18n.js](../i18n.js)). */
const scenes = [
  {
    place: { pt: "Faculdade · último período", en: "University · final term" },
    image: "faculdade",
    alt: {
      pt: "O estudante de óculos e camisa azul consulta o celular na faculdade.",
      en: "The student, in glasses and a blue shirt, checks their phone at the university.",
    },
    lines: {
      pt: [
        "O TCC está quase pronto. A turma já fala da formatura. Você abre o portal da faculdade e encontra uma última pendência.",
        "Faltam as horas complementares. Um colega comenta sobre o trabalho de mesário voluntário. Você confirma com a faculdade: essas horas contam. No dia seguinte, vai ao cartório.",
      ],
      en: [
        "The thesis is nearly done. Everyone is already talking about graduation. You open the university portal and find one last item pending.",
        "You are short on extracurricular hours. A classmate mentions volunteering as a poll worker. You check with the university: those hours count. The next day, you go to the electoral office.",
      ],
    },
  },
  {
    place: { pt: "Cartório eleitoral · alguns dias depois", en: "Electoral office · a few days later" },
    image: "cartorio",
    alt: {
      pt: "O estudante assina sua inscrição como mesário voluntário no cartório eleitoral.",
      en: "The student signs up as a volunteer poll worker at the electoral office.",
    },
    lines: {
      pt: [
        "No balcão do cartório, você entrega os documentos e preenche a inscrição. Mesário voluntário. Parece um bom jeito de conseguir as horas que faltam.",
        "A atendente confere o formulário. “Escola Municipal Horizonte. No domingo, chegue cedo.” Você guarda a informação junto das anotações do TCC.",
      ],
      en: [
        "At the counter you hand over your documents and fill in the form. Volunteer poll worker. It looks like a decent way to earn the hours you are missing.",
        "The clerk checks the form. “Escola Municipal Horizonte. Sunday, come early.” You file that away next to your thesis notes.",
      ],
    },
  },
  {
    place: { pt: "Escola Municipal Horizonte · domingo", en: "Escola Municipal Horizonte · Sunday" },
    image: "escola",
    alt: {
      pt: "O estudante chega à escola e se apresenta à coordenadora da seção.",
      en: "The student arrives at the school and introduces themselves to the section coordinator.",
    },
    lines: {
      pt: [
        "Você chega com sono e um café tomado às pressas. Confere a sala, se apresenta à coordenadora e deixa a mochila num canto.",
        "“É seu primeiro dia? Pode sentar. Eu te mostro.” O caderno está aberto. A urna espera. Do outro lado da porta, a fila começa a se formar.",
        "Você veio pelas horas. Agora, puxa a cadeira e respira fundo.",
      ],
      en: [
        "You arrive sleepy, on a coffee drunk in a hurry. You find the room, introduce yourself to the coordinator and drop your backpack in a corner.",
        "“First day? Have a seat. I'll show you.” The register is open. The machine is waiting. On the other side of the door, a queue is starting to form.",
        "You came for the hours. Now you pull up the chair and take a deep breath.",
      ],
    },
  },
];
const imageSrc = (name) => `${import.meta.env.BASE_URL}images/story/${name}.png`;

export default function Story({ onStart }) {
  return <Cutscene scenes={scenes} onFinish={onStart}
    endLabel={{ pt: "Sentar à mesa", en: "Sit at the table" }}
    skipLabel={{ pt: "Pular introdução", en: "Skip intro" }} />;
}

export function Cutscene({ scenes, onFinish, endLabel = TXT.recomecar, skipLabel }) {
  const [scene, setScene] = useState(0);
  const [line, setLine] = useState(0);
  const button = useRef(null);
  const story = scenes[scene];
  const lines = t(story.lines);
  const last = scene === scenes.length - 1 && line === lines.length - 1;
  useEffect(() => { button.current?.focus(); for (const s of scenes) { const img = new Image(); img.src = imageSrc(s.image); } }, []);
  const next = () => {
    if (line < lines.length - 1) setLine(line + 1);
    else if (scene < scenes.length - 1) { setScene(scene + 1); setLine(0); }
    else onFinish();
  };
  const back = () => {
    if (line > 0) setLine(line - 1);
    else if (scene > 0) { setScene(scene - 1); setLine(t(scenes[scene - 1].lines).length - 1); }
  };
  return <div className="cutscene-overlay">
    <section className="cutscene" role="dialog" aria-modal="true" aria-label={t(story.place) || t(TXT.cenaSemNome)} aria-describedby="scene-line">
      <div className="cutscene-picture">
        <img key={story.image} src={imageSrc(story.image)} alt={t(story.alt)} />
        {story.place && <h1 className="cutscene-location">{t(story.place)}</h1>}
        {skipLabel && <button className="cutscene-skip" onClick={onFinish}>{t(skipLabel)}</button>}
      </div>
      <div className="cutscene-dialogue">
        <p id="scene-line" key={`${scene}-${line}`} aria-live="polite">{lines[line]}</p>
        <div className="cutscene-controls"><span className="cutscene-chapters" aria-label={t(TXT.cena, { n: scene + 1, total: scenes.length })}>{scenes.length > 1 && scenes.map((_, i) => <i key={i} className={i === scene ? "active" : ""} />)}</span><div>{(scene > 0 || line > 0) && <button className="cutscene-back" onClick={back}>{t(TXT.voltar)}</button>}<button className="primary" ref={button} onClick={next}>{t(last ? endLabel : TXT.continuar)} <span aria-hidden="true">▶</span></button></div></div>
      </div>
    </section>
  </div>;
}
