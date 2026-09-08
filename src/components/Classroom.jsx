import { useId } from "react";

/* Mesma linguagem chapada dos retratos, com cores suaves para o fundo.
   Duas colunas de basculantes deixam o pátio aparecer através do vidro. */
export function Window() {
  const glassId = useId();
  return (
    <svg className="room-window" viewBox="0 0 240 272" role="presentation" aria-hidden="true">
      <defs>
        <clipPath id={glassId}><rect x="23" y="21" width="190" height="222" /></clipPath>
      </defs>
      {/* Sombra sólida, reboco do vão e rebaixo do caixilho. */}
      <path d="M14 14H232V260H238V269H14Z" fill="#b5b7ab" />
      <path d="M4 4H230V255H4Z" fill="#f1ead8" />
      <path d="M12 12H222V250H12Z" fill="#8a9c9b" />
      <path d="M12 12H222L213 21H23V243L12 250Z" fill="#758d91" />
      <g clipPath={`url(#${glassId})`}>
        <rect x="23" y="21" width="190" height="222" fill="#c9dfe0" />
        <path d="M23 59H73Q78 45 91 51Q96 35 111 45Q125 43 130 59H213V66H23Z" fill="#e3ebe3" />
        <path d="M23 146Q57 119 91 137Q136 111 177 132L213 121V195H23Z" fill="#b0c6b4" />
        {/* Bloco do outro lado do pátio, em formas grandes e discretas. */}
        <path d="M102 140L159 117L223 138V145H102Z" fill="#b5a28e" />
        <path d="M111 145H222V205H111Z" fill="#ddd5bd" />
        <path d="M111 145H222V152H111Z" fill="#c5c5b2" />
        <path d="M111 186H222V205H111Z" fill="#a9bebc" />
        <g fill="#94acac">
          {[124, 157, 190].map((x) => <rect key={x} x={x} y="159" width="22" height="21" />)}
        </g>
        <path d="M23 203H213V243H23Z" fill="#b9c9b3" />
        <path d="M112 203H173L201 243H84Z" fill="#dbdac8" />
        {/* Copa contínua, tronco e galhos assentados no chão. */}
        <path d="M53 161H60V215H53Z" fill="#a5ad94" />
        <path d="M56 183L37 169M57 172L76 157" fill="none" stroke="#a5ad94" strokeWidth="4" />
        <path d="M13 165Q3 145 23 136Q17 113 39 110Q43 91 62 102Q85 94 90 116Q110 122 99 144Q107 164 85 174H32Q18 174 13 165Z" fill="#9cb9a3" />
        <path d="M23 136Q17 113 39 110Q43 91 62 102Q85 94 90 116Q69 110 59 128Q42 125 37 145Z" fill="#afc6ad" />
        {/* Reflexos leves, recortados no mesmo vão da paisagem. */}
        <path d="M54 21H75L23 109V75ZM158 21H169L34 243H23ZM210 90H230L137 243H118Z" fill="#eef2e8" opacity="0.3" />
      </g>
      {/* Arestas iluminadas e uma pequena fresta sob cada folha aberta. */}
      {[21, 95, 169].map((y) => (
        <g key={y}>
          <path d={`M23 ${y + 66}H213V${y + 74}H23Z`} fill="#839d9f" />
          <path d={`M23 ${y + 63}H213L209 ${y + 68}H27Z`} fill="#e0e5d9" />
          <path d={`M23 ${y}H213V${y + 4}H23Z`} fill="#e4e8dc" />
          <path d={`M23 ${y + 4}V${y + 63}M213 ${y + 4}V${y + 63}`} stroke="#b5c8c3" strokeWidth="4" />
          <g fill="#789196">
            <rect x="26" y={y + 28} width="3" height="12" rx="1" />
            <rect x="207" y={y + 28} width="3" height="12" rx="1" />
          </g>
        </g>
      ))}
      {/* Montante e trincos dos basculantes. */}
      <path d="M113 18H125V246H113Z" fill="#789397" />
      <path d="M113 18H120V243H113Z" fill="#d5ded2" />
      {[76, 150, 224].map((y) => (
        <g key={y}>
          <rect x="108" y={y} width="22" height="4" rx="1" fill="#6d878b" />
          <rect x="115" y={y - 3} width="5" height="10" rx="1" fill="#e9e9da" />
        </g>
      ))}
      <path d="M16 16H220M218 16V247" fill="none" stroke="#c5d3ca" strokeWidth="4" />
      <path d="M4 251H230L238 260H0Z" fill="#eee8d7" />
      <path d="M0 260H238V266H0Z" fill="#aab6ad" />
      <path d="M4 251H230" stroke="#faf3e1" strokeWidth="3" />
    </svg>
  );
}

export function Fan() {
  return (
    <svg className="room-fan" viewBox="0 0 128 152" role="presentation" aria-hidden="true">
      {/* Suporte articulado e cordão de acionamento presos à parede. */}
      <path d="M77 112V132Q77 138 83 140" fill="none" stroke="#b5b5a1" strokeWidth="2" strokeLinecap="round" />
      <rect x="56" y="107" width="23" height="29" rx="5" fill="#9aa79f" />
      <rect x="56" y="107" width="18" height="26" rx="4" fill="#d0d4c4" />
      <circle cx="65" cy="127" r="2" fill="#899b98" />
      <path d="M64 116V99L57 89" fill="none" stroke="#728a8b" strokeWidth="10" strokeLinejoin="round" />
      <path d="M62 114V101" stroke="#b8c7bc" strokeWidth="4" strokeLinecap="round" />
      {/* Carcaça clara e pás curvas, sem uma massa escura atrás do rosto. */}
      <circle cx="66" cy="62" r="49" fill="#b2b9a9" />
      <circle cx="63" cy="58" r="49" fill="#78908f" />
      <circle cx="63" cy="58" r="45" fill="#d9decc" />
      <circle cx="63" cy="58" r="39" fill="#cbd4c2" />
      <g className="blades" fill="#8da39e">
        {[0, 120, 240].map((angle) => (
          <path key={angle} d="M60 58C49 49 42 28 53 20C68 11 86 23 83 33C80 43 66 45 67 57Z" transform={`rotate(${angle} 63 58)`} />
        ))}
      </g>
      {/* Grade de arame: anéis, raios e presilhas separados das pás. */}
      <g fill="none" stroke="#9aaea5" strokeWidth="1.2">
        {[15, 25, 35, 43].map((r) => <circle key={r} cx="63" cy="58" r={r} />)}
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M63 15V101" transform={`rotate(${i * 15} 63 58)`} />
        ))}
      </g>
      <circle cx="63" cy="58" r="46" fill="none" stroke="#e5e6d5" strokeWidth="3" />
      <path d="M24 35A45 45 0 0 1 91 23" fill="none" stroke="#f0eedc" strokeWidth="3" strokeLinecap="round" />
      {[0, 120, 240].map((angle) => (
        <rect key={angle} x="60" y="9" width="6" height="7" rx="2" fill="#718a89" transform={`rotate(${angle} 63 58)`} />
      ))}
      <circle cx="63" cy="58" r="11" fill="#728d8d" />
      <circle cx="62" cy="57" r="8" fill="#e1e3d1" />
      <path d="M58 57H66" stroke="#9eafa5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
