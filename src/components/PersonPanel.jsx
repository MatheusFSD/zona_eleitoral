import Portrait from "./Portrait.jsx";
import Talk from "./Talk.jsx";
import Tutor from "./Tutor.jsx";
import { Fan, Window } from "./Classroom.jsx";
import { COORDENADORA, realce } from "../data/tutorial.js";

/* A coluna da esquerda é um pedaço da sala: parede creme, barra azul, janela
   basculante e ventilador. A pessoa entra andando por ali como um vulto preto,
   para na frente da mesa e ganha cor; o que ela diz vem numa ficha de papel
   apoiada embaixo. A animação está em `.arrival`, no styles.css. */
export default function PersonPanel({ person, running, calling, c, onAsk, cabina, areaRef, tutor, foco }) {
  return (
    <aside className="panel person" ref={areaRef}>
      {/* A sala nunca apaga: é dela que sai a explicação. Só acende quando o
          assunto é quem está na frente da mesa. */}
      <div className={`room${realce(foco, "pessoa")}`}>
        <Window />
        <Fan />
        <div className="tape-note">Sala 03 · mesa receptora</div>
        <div className="portrait">
          {/* a `key` remonta o bloco a cada pessoa, para a chegada tocar de novo */}
          {running && person ? (
            /* Ela sai de quadro para votar e volta depois do bipe da urna. */
            <div className={`arrival${cabina ? ` ${cabina}` : ""}`} key={person.id}>
              <Portrait person={person} />
            </div>
          ) : tutor ? (
            /* Antes da primeira pessoa, quem está na sala é a coordenadora. */
            <div className="arrival" key="coordenadora">
              <Portrait person={COORDENADORA} />
            </div>
          ) : calling ? (
            <div className="sala-vazia" aria-hidden="true" />
          ) : (
            <ClosedDoor />
          )}
        </div>
      </div>

      <div className="person-card" key={person ? person.id : tutor ? "coordenadora" : "fechada"}>
        {/* Sem nome nem descrição: o nome está no documento e no terminal, e é
            lá que a mesa tem de ler. */}
        {!(running && person) && !tutor && <h2>{calling ? "Ninguém na mesa" : "Portas fechadas"}</h2>}
        {/* Ela se apresenta pela etiqueta; o crachá faz o papel do nome. */}
        {tutor && (
          <p className="tutor-tag">
            {COORDENADORA.name} · {COORDENADORA.role}
          </p>
        )}
        {/* Quem tem preferência traz o motivo escrito na etiqueta. */}
        {running && person?.priority && <p className="preferencia-tag">Preferência · {person.preference}</p>}
        {running && person ? (
          <Talk person={person} c={c} onAsk={onAsk} />
        ) : tutor ? (
          <Tutor {...tutor} />
        ) : (
          <p className="speech">
            {calling ? "Chame a próxima pessoa do corredor." : "Organize a mesa e prepare-se para a primeira pessoa."}
          </p>
        )}
      </div>
    </aside>
  );
}

function ClosedDoor() {
  return (
    <svg viewBox="0 0 160 200" preserveAspectRatio="xMidYMax meet" role="img" aria-label="Porta da seção ainda fechada">
      <rect x="26" y="10" width="108" height="190" rx="3" fill="#4b7ba4" stroke="#2f5878" strokeWidth="4" />
      <g fill="none" stroke="#31597a" strokeWidth="3">
        <rect x="40" y="26" width="80" height="52" rx="2" />
        <rect x="40" y="92" width="80" height="52" rx="2" />
        <rect x="40" y="158" width="80" height="34" rx="2" />
      </g>
      <circle cx="118" cy="118" r="5" fill="#d8b45c" />
      <rect x="30" y="96" width="100" height="26" fill="#e9d38f" stroke="#b79a4d" strokeWidth="2" transform="rotate(-5 80 109)" />
      <text
        x="80"
        y="113"
        textAnchor="middle"
        transform="rotate(-5 80 109)"
        fill="#5c4a1c"
        fontFamily="Courier New, monospace"
        fontSize="13"
        fontWeight="700"
      >
        FECHADA
      </text>
    </svg>
  );
}
