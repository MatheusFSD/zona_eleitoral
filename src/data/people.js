/* As regras da mesa: o manual que fica aberto em cima da mesa e as saídas
   possíveis quando o atendimento foge do trilho.

   Quem chega não mora mais aqui — cada turno é sorteado em
   [shift.js](./shift.js). O manual é o que não muda, porque é ele que define
   o que é acerto e o que é ocorrência. */

export const MANUAL = [
  {
    id: "identificacao",
    title: "Identificação",
    items: [
      "Documento oficial com foto, físico ou digital.",
      "Certidão de nascimento não serve.",
      "Confira nome e nascimento com o terminal.",
    ],
  },
  {
    id: "ordem",
    title: "A ordem da mesa",
    items: [
      "1. Terminal: digite a identificação do documento.",
      "2. Caderno: ache o nome e marque a linha.",
      "3. Biometria: só depois do caderno.",
      "Nenhuma etapa pode ser pulada.",
    ],
  },
  {
    id: "biometria",
    title: "Biometria",
    items: [
      "Até quatro tentativas no leitor.",
      "Esgotadas, pergunte o ano de nascimento.",
      "Se o ano bater, a pessoa assina o caderno.",
      "Se não bater, ela não vota.",
    ],
  },
  {
    id: "excecoes",
    title: "Quando foge do trilho",
    items: [
      "Já votou, impedido ou outra seção: encaminhar.",
      "Outro município: justificar.",
      "Nome fora da folha: procurar na listagem de impedidos.",
      "Dúvida na identidade: perguntar os dados; se persistir, chamar o juiz.",
      "Habilitada e não votou: suspender.",
    ],
  },
  {
    id: "pertences",
    title: "Pertences",
    items: [
      "Celular e chaves ficam na carteira enquanto a pessoa vota.",
      "Devolva tudo, com o comprovante, antes de ela sair.",
    ],
  },
];

/* As ações que resolvem um atendimento fora do trilho. Habilitar não está
   aqui: habilitar é terminar o fluxo. */
export const ACTIONS = [
  { id: "encaminhar", hotkey: "E", label: "Encaminhar ao cartório", hint: "não habilita" },
  { id: "justificar", hotkey: "J", label: "Registrar justificativa", hint: "quem vota em outro município" },
  { id: "juiz", hotkey: "C", label: "Chamar o juiz", hint: "dúvida de identidade" },
  { id: "suspender", hotkey: "S", label: "Suspender a votação", hint: "habilitada e não votou" },
];
