import { useEffect, useRef, useState } from "react";
import "./story.css";

const scenes = [
  { place: "Faculdade · último período", image: "faculdade", alt: "O estudante de óculos e camisa azul consulta o celular na faculdade.", lines: ["O TCC está quase pronto. A turma já fala da formatura. Você abre o portal da faculdade e encontra uma última pendência.", "Faltam as horas complementares. Um colega comenta sobre o trabalho de mesário voluntário. Você confirma com a faculdade: essas horas contam. No dia seguinte, vai ao cartório."] },
  { place: "Cartório eleitoral · alguns dias depois", image: "cartorio", alt: "O estudante assina sua inscrição como mesário voluntário no cartório eleitoral.", lines: ["No balcão do cartório, você entrega os documentos e preenche a inscrição. Mesário voluntário. Parece um bom jeito de conseguir as horas que faltam.", "A atendente confere o formulário. “Escola Municipal Horizonte. No domingo, chegue cedo.” Você guarda a informação junto das anotações do TCC."] },
  { place: "Escola Municipal Horizonte · domingo", image: "escola", alt: "O estudante chega à escola e se apresenta à coordenadora da seção.", lines: ["Você chega com sono e um café tomado às pressas. Confere a sala, se apresenta à coordenadora e deixa a mochila num canto.", "“É seu primeiro dia? Pode sentar. Eu te mostro.” O caderno está aberto. A urna espera. Do outro lado da porta, a fila começa a se formar.", "Você veio pelas horas. Agora, puxa a cadeira e respira fundo."] },
];
const imageSrc = (name) => `${import.meta.env.BASE_URL}images/story/${name}.png`;

export default function Story({ onStart }) {
  const [scene, setScene] = useState(0);
  const [line, setLine] = useState(0);
  const button = useRef(null);
  const story = scenes[scene];
  const last = scene === scenes.length - 1 && line === story.lines.length - 1;
  useEffect(() => { button.current?.focus(); for (const s of scenes) { const img = new Image(); img.src = imageSrc(s.image); } }, []);
  const next = () => {
    if (line < story.lines.length - 1) setLine(line + 1);
    else if (scene < scenes.length - 1) { setScene(scene + 1); setLine(0); }
    else onStart();
  };
  const back = () => {
    if (line > 0) setLine(line - 1);
    else if (scene > 0) { setScene(scene - 1); setLine(scenes[scene - 1].lines.length - 1); }
  };
  return <div className="cutscene-overlay">
    <section className="cutscene" role="dialog" aria-modal="true" aria-labelledby="scene-location" aria-describedby="scene-line">
      <div className="cutscene-picture">
        <img key={story.image} src={imageSrc(story.image)} alt={story.alt} />
        <h1 id="scene-location" className="cutscene-location">{story.place}</h1>
        <button className="cutscene-skip" onClick={onStart}>Pular introdução</button>
      </div>
      <div className="cutscene-dialogue">
        <span className="cutscene-speaker">SEÇÃO 127 <span>· PRÓLOGO</span></span>
        <p id="scene-line" key={`${scene}-${line}`} aria-live="polite">{story.lines[line]}</p>
        <div className="cutscene-controls"><span className="cutscene-chapters" aria-label={`Cena ${scene + 1} de 3`}>{scenes.map((_, i) => <i key={i} className={i === scene ? "active" : ""} />)}</span><div>{(scene > 0 || line > 0) && <button className="cutscene-back" onClick={back}>Voltar</button>}<button className="primary" ref={button} onClick={next}>{last ? "Sentar à mesa" : "Continuar"} <span aria-hidden="true">▶</span></button></div></div>
      </div>
    </section>
  </div>;
}
