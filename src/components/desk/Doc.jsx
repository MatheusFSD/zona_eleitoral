import Portrait from "../Portrait.jsx";

/* O documento apresentado.

   Cada tipo tem forma, cor e disposição próprias — a identidade é um cartão
   claro com tarja azul, a habilitação é larga e verde-oliva, a profissional
   traz carimbo, a digital é uma tela de celular e a certidão é uma folha alta
   sem foto. A ideia é que dê para saber qual documento está na mesa pelo canto
   do olho, sem ler.

   Nada é destacado, conferido ou comparado pelo jogo: o número que o terminal
   pede, o nome e a data ficam impressos como estão, e é a mesa que compara.

   A foto é o próprio rosto da pessoa, desenhado com a mesma semente do
   retrato. Nos casos de foto duvidosa a semente muda: o documento mostra
   *outra* cara, parecida o bastante para dar trabalho. */

const ISSUER = {
  identidade: "Instituto de Identificação · Monte Alegre",
  habilitacao: "Departamento de Trânsito · Monte Alegre",
  profissional: "Conselho Profissional · registro geral",
  digital: "Identidade digital · aplicativo oficial",
  certidao: "Cartório do 2º Ofício · Monte Alegre",
};

function Photo({ person, className = "" }) {
  const { photo } = person.doc;

  if (photo === "SEM FOTO") {
    return <div className={`doc-photo vazia ${className}`}>SEM FOTO</div>;
  }

  // A foto parecida é o caso de dúvida: outro rosto, mesma pessoa no papel.
  const key = photo === "FOTO PARECIDA" ? `${person.id}-outra` : person.id;

  return (
    <div className={`doc-photo ${className}${photo === "FOTO ANTIGA" ? " antiga" : ""}`}>
      <Portrait person={person} faceKey={key} art="rg" />
    </div>
  );
}

function Field({ label, value, wide }) {
  return (
    <div className={`doc-field${wide ? " wide" : ""}${label === "Nome" ? " doc-name" : " doc-numeric"}`}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

/* A identificação é o número que a mesa digita no terminal. Ele muda de lugar
   conforme o documento: procurar faz parte. */
function Code({ value }) {
  return (
    <div className="doc-code">
      <small>Identificação</small>
      <b>{value}</b>
    </div>
  );
}

function CardHeading({ title, category, office }) {
  return (
    <header className="doc-heading">
      <svg className="doc-emblem" viewBox="0 0 32 38" aria-hidden="true">
        <path d="M3 3h26v19c0 7-13 13-13 13S3 29 3 22Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="16" cy="12" r="3" fill="currentColor" />
        <path d="m7 24 6-7 4 5 4-3 5 5M8 27h16" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      <div className="doc-heading-text"><small>{office}</small><span>{title}</span></div>
      {category && <b>{category}</b>}
    </header>
  );
}

/* Nome e retrato têm sua própria faixa. Datas e registros usam a largura
   inteira do cartão, sem disputar duas colunas estreitas ao lado da foto. */
function CardBody({ person, registration = "Registro", fingerprint = false }) {
  return (
    <>
      <div className="doc-card-body">
        <Photo person={person} />
        <div className="doc-name-block">
          <Field label="Nome" value={person.doc.name} wide />
          {fingerprint && <div className="rg-digital" aria-hidden="true"><i /><i /><i /><i /></div>}
        </div>
      </div>
      <div className="doc-details">
        <Field label="Nascimento" value={person.doc.birth} />
        <Field label={registration} value={person.doc.number} />
      </div>
    </>
  );
}

export default function Doc({ person }) {
  if (!person) {
    return (
      <article className="doc doc-vazio">
        <p>Nenhum documento na mesa.</p>
      </article>
    );
  }

  const doc = person.doc;
  const art = doc.art ?? "identidade";

  if (art === "digital") {
    return (
      <article className="doc doc-digital" aria-label="Identidade digital no celular">
        <div className="fone-topo">
          <i className="fone-alto" />
        </div>
        <div className="fone-tela">
          <div className="app-barra">Identidade digital</div>
          <Photo person={person} className="redonda" />
          <div className="app-nome">{doc.name}</div>
          <div className="app-linhas">
            <Field label="Nascimento" value={doc.birth} />
            <Field label="Documento" value={doc.number} />
          </div>
          <Code value={doc.code} />
          <div className="app-selo">Verificado {doc.photo === "TELA OFICIAL" ? "· tela oficial" : ""}</div>
        </div>
        <div className="fone-baixo" />
      </article>
    );
  }

  if (art === "certidao") {
    return (
      <article className="doc doc-certidao" aria-label="Certidão de nascimento">
        <div className="cert-borda">
          <p className="cert-orgao">{ISSUER.certidao}</p>
          <h3>Certidão de nascimento</h3>
          <p className="cert-nome">{doc.name}</p>
          <div className="cert-linhas">
            <Field label="Nascimento" value={doc.birth} />
            <Field label="Termo" value={doc.number} wide />
          </div>
          <Code value={doc.code} />
          <p className="cert-nota">{doc.note}</p>
          <div className="cert-selo" aria-hidden="true">
            <span />
          </div>
        </div>
      </article>
    );
  }

  if (art === "habilitacao") {
    return (
      <article className="doc doc-habilitacao" aria-label="Carteira de motorista">
        <CardHeading title="Carteira de motorista" office="Monte Alegre · Trânsito" category="CAT. B" />
        <CardBody person={person} />
        <Code value={doc.code} />
        <footer>{ISSUER.habilitacao}</footer>
      </article>
    );
  }

  if (art === "profissional") {
    return (
      <article className="doc doc-profissional" aria-label="Carteira profissional">
        <CardHeading title="Carteira profissional" office="Conselho profissional" category="CP" />
        <CardBody person={person} registration="Inscrição" />
        <div className="doc-validation" aria-hidden="true">Registro válido</div>
        <Code value={doc.code} />
        <footer>{ISSUER.profissional}</footer>
      </article>
    );
  }

  // identidade (inclui a versão antiga, que só muda o tom do papel)
  const velha = doc.photo === "FOTO ANTIGA";
  return (
    <article className={`doc doc-identidade${velha ? " velha" : ""}`} aria-label="Carteira de identidade">
      <CardHeading title="Carteira de identidade" office="Monte Alegre · Identificação" category={velha ? "2ª via" : "1ª via"} />
      <CardBody person={person} fingerprint />
      <Code value={doc.code} />
      <footer>
        <span>{ISSUER.identidade}</span>
        <span>{doc.note}</span>
      </footer>
    </article>
  );
}
