/* Detalhes fixos do móvel, atrás dos objetos e sem receber o ponteiro. */
export function DeskFrame() {
  return (
    <div className="carteira-estrutura" aria-hidden="true">
      <span className="carteira-travessa" />
      <span className="carteira-perna esquerda" />
      <span className="carteira-perna direita" />
    </div>
  );
}

export function DeskWear() {
  return (
    <svg className="carteira-marcas" viewBox="0 0 1000 640" preserveAspectRatio="none" aria-hidden="true">
      {/* Marcas concentradas na periferia; a área dos papéis fica limpa. */}
      <g fill="none" stroke="#a58e63" strokeWidth="1.2" strokeLinecap="round" opacity="0.5">
        <path d="M21 172l3 47m3-30 1 19M970 386l-4 34m9-16-3 26" />
        <path d="M147 612l29-2m-14 6 41-1M778 608l36-3m-18 10 19-2" />
        <path d="M881 35l24 2m-12 4 38 1M32 559l8 13" />
      </g>
      <g fill="none" stroke="#e4d2aa" strokeWidth="1" strokeLinecap="round" opacity="0.65">
        <path d="M24 174v35M151 613l24-2M971 389l-4 29M800 616l16-2" />
      </g>
      {/* Rabiscos de lápis quase apagados no canto da carteira. */}
      <g fill="none" stroke="#8e8d73" strokeWidth="1.1" strokeLinecap="round" opacity="0.3">
        <path d="M930 578l7-9 6 9m-10-3h7M949 569v10m-3-10h6M925 586l33-2" />
      </g>
    </svg>
  );
}
