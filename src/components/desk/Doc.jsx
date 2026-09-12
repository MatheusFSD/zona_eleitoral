import Portrait from "../Portrait.jsx";
import { t } from "../../i18n.js";

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

/* O órgão emissor. Monte Alegre é o nome da cidade e fica como está. */
const ISSUER = {
  identidade: { pt: "Instituto de Identificação · Monte Alegre", en: "Identification Institute · Monte Alegre" },
  habilitacao: { pt: "Departamento de Trânsito · Monte Alegre", en: "Traffic Department · Monte Alegre" },
  profissional: { pt: "Conselho Profissional · registro geral", en: "Professional Council · general registry" },
  digital: { pt: "Identidade digital · aplicativo oficial", en: "Digital ID · official app" },
  certidao: { pt: "Cartório do 2º Ofício · Monte Alegre", en: "2nd Registry Office · Monte Alegre" },
};

/* Os rótulos impressos no documento. */
const ROTULO = {
  nome: { pt: "Nome", en: "Name" },
  nascimento: { pt: "Nascimento", en: "Date of birth" },
  registro: { pt: "Registro", en: "Registry" },
  inscricao: { pt: "Inscrição", en: "Member no." },
  termo: { pt: "Termo", en: "Entry" },
  documento: { pt: "Documento", en: "Document" },
  identificacao: { pt: "Identificação", en: "Document no." },
  semFoto: { pt: "SEM FOTO", en: "NO PHOTO" },
  vazio: { pt: "Nenhum documento na mesa.", en: "No document on the desk." },
  identidade: { pt: "Carteira de identidade", en: "Identity card" },
  identidadeOrgao: { pt: "Monte Alegre · Identificação", en: "Monte Alegre · Identification" },
  primeiraVia: { pt: "1ª via", en: "1st issue" },
  segundaVia: { pt: "2ª via", en: "2nd issue" },
  habilitacao: { pt: "Carteira de motorista", en: "Driver licence" },
  habilitacaoOrgao: { pt: "Monte Alegre · Trânsito", en: "Monte Alegre · Traffic" },
  profissional: { pt: "Carteira profissional", en: "Professional card" },
  profissionalOrgao: { pt: "Conselho profissional", en: "Professional council" },
  registroValido: { pt: "Registro válido", en: "Valid registration" },
  certidao: { pt: "Certidão de nascimento", en: "Birth certificate" },
  digital: { pt: "Identidade digital", en: "Digital ID" },
  digitalTela: { pt: "Identidade digital no celular", en: "Digital ID on a phone" },
  verificado: { pt: "Verificado", en: "Verified" },
  telaOficial: { pt: "· tela oficial", en: "· official screen" },
};

function Photo({ person, className = "" }) {
  const { photo } = person.doc;

  if (photo === "SEM FOTO") {
    return <div className={`doc-photo vazia ${className}`}>{t(ROTULO.semFoto)}</div>;
  }

  // A foto parecida é o caso de dúvida: outro rosto, mesma pessoa no papel.
  const key = photo === "FOTO PARECIDA" ? `${person.id}-outra` : person.id;

  return (
    <div className={`doc-photo ${className}${photo === "FOTO ANTIGA" ? " antiga" : ""}`}>
      <Portrait person={person} faceKey={key} art="rg" />
    </div>
  );
}

function Field({ label, value, wide, name = false }) {
  return (
    <div className={`doc-field${wide ? " wide" : ""}${name ? " doc-name" : " doc-numeric"}`}>
      <small>{t(label)}</small>
      <strong>{t(value)}</strong>
    </div>
  );
}

/* A identificação é o número que a mesa digita no terminal. Ele muda de lugar
   conforme o documento: procurar faz parte. */
function Code({ value }) {
  return (
    <div className="doc-code">
      <small>{t(ROTULO.identificacao)}</small>
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
      <div className="doc-heading-text"><small>{t(office)}</small><span>{t(title)}</span></div>
      {category && <b>{category}</b>}
    </header>
  );
}

/* Nome e retrato têm sua própria faixa. Datas e registros usam a largura
   inteira do cartão, sem disputar duas colunas estreitas ao lado da foto. */
function CardBody({ person, registration = ROTULO.registro, fingerprint = false }) {
  return (
    <>
      <div className="doc-card-body">
        <Photo person={person} />
        <div className="doc-name-block">
          <Field label={ROTULO.nome} value={person.doc.name} wide name />
          {fingerprint && <div className="rg-digital" aria-hidden="true"><i /><i /><i /><i /></div>}
        </div>
      </div>
      <div className="doc-details">
        <Field label={ROTULO.nascimento} value={person.doc.birth} />
        <Field label={registration} value={person.doc.number} />
      </div>
    </>
  );
}

export default function Doc({ person }) {
  if (!person) {
    return (
      <article className="doc doc-vazio">
        <p>{t(ROTULO.vazio)}</p>
      </article>
    );
  }

  const doc = person.doc;
  const art = doc.art ?? "identidade";

  if (art === "digital") {
    return (
      <article className="doc doc-digital" aria-label={t(ROTULO.digitalTela)}>
        <div className="fone-topo">
          <i className="fone-alto" />
        </div>
        <div className="fone-tela">
          <div className="app-barra">{t(ROTULO.digital)}</div>
          <Photo person={person} className="redonda" />
          <div className="app-nome">{doc.name}</div>
          <div className="app-linhas">
            <Field label={ROTULO.nascimento} value={doc.birth} />
            <Field label={ROTULO.documento} value={doc.number} />
          </div>
          <Code value={doc.code} />
          <div className="app-selo">{t(ROTULO.verificado)} {doc.photo === "TELA OFICIAL" ? t(ROTULO.telaOficial) : ""}</div>
        </div>
        <div className="fone-baixo" />
      </article>
    );
  }

  if (art === "certidao") {
    return (
      <article className="doc doc-certidao" aria-label={t(ROTULO.certidao)}>
        <div className="cert-borda">
          <p className="cert-orgao">{t(ISSUER.certidao)}</p>
          <h3>{t(ROTULO.certidao)}</h3>
          <p className="cert-nome">{doc.name}</p>
          <div className="cert-linhas">
            <Field label={ROTULO.nascimento} value={doc.birth} />
            <Field label={ROTULO.termo} value={doc.number} wide />
          </div>
          <Code value={doc.code} />
          <p className="cert-nota">{t(doc.note)}</p>
          <div className="cert-selo" aria-hidden="true">
            <span />
          </div>
        </div>
      </article>
    );
  }

  if (art === "habilitacao") {
    return (
      <article className="doc doc-habilitacao" aria-label={t(ROTULO.habilitacao)}>
        <CardHeading title={ROTULO.habilitacao} office={ROTULO.habilitacaoOrgao} category="CAT. B" />
        <CardBody person={person} />
        <Code value={doc.code} />
        <footer>{t(ISSUER.habilitacao)}</footer>
      </article>
    );
  }

  if (art === "profissional") {
    return (
      <article className="doc doc-profissional" aria-label={t(ROTULO.profissional)}>
        <CardHeading title={ROTULO.profissional} office={ROTULO.profissionalOrgao} category="CP" />
        <CardBody person={person} registration={ROTULO.inscricao} />
        <div className="doc-validation" aria-hidden="true">{t(ROTULO.registroValido)}</div>
        <Code value={doc.code} />
        <footer>{t(ISSUER.profissional)}</footer>
      </article>
    );
  }

  // identidade (inclui a versão antiga, que só muda o tom do papel)
  const velha = doc.photo === "FOTO ANTIGA";
  return (
    <article className={`doc doc-identidade${velha ? " velha" : ""}`} aria-label={t(ROTULO.identidade)}>
      <CardHeading title={ROTULO.identidade} office={ROTULO.identidadeOrgao} category={t(velha ? ROTULO.segundaVia : ROTULO.primeiraVia)} />
      <CardBody person={person} fingerprint />
      <Code value={doc.code} />
      <footer>
        <span>{t(ISSUER.identidade)}</span>
        <span>{t(doc.note)}</span>
      </footer>
    </article>
  );
}
