/* As regras da mesa: o manual que fica aberto em cima da mesa e as saídas
   possíveis quando o atendimento foge do trilho.

   Quem chega não mora mais aqui — cada turno é sorteado em
   [shift.js](./shift.js). O manual é o que não muda, porque é ele que define
   o que é acerto e o que é ocorrência.

   Texto é sempre um par `{ pt, en }`; as listas de itens são um par de listas
   (veja [i18n.js](../i18n.js)). `id` e `hotkey` são internos. */

export const MANUAL = [
  {
    id: "identificacao",
    title: { pt: "Identificação", en: "Identification" },
    items: {
      pt: [
        "Documento oficial com foto, físico ou digital.",
        "Certidão de nascimento não serve.",
        "Confira nome e nascimento com o terminal.",
      ],
      en: [
        "Official photo ID, on paper or in the app.",
        "A birth certificate does not count.",
        "Check name and date of birth against the terminal.",
      ],
    },
  },
  {
    id: "ordem",
    title: { pt: "A ordem da mesa", en: "The order of the table" },
    items: {
      pt: [
        "1. Terminal: digite a identificação do documento.",
        "2. Caderno: ache o nome e marque a linha.",
        "3. Biometria: só depois do caderno.",
        "Nenhuma etapa pode ser pulada.",
      ],
      en: [
        "1. Terminal: type the document number.",
        "2. Register: find the name and mark the line.",
        "3. Fingerprint: only after the register.",
        "No step may be skipped.",
      ],
    },
  },
  {
    id: "biometria",
    title: { pt: "Biometria", en: "Fingerprint" },
    items: {
      pt: [
        "Arraste a mão e segure o indicador no leitor por 3 segundos.",
        "Soltar ou sair do sensor reinicia a coleta sem gastar tentativa.",
        "Até quatro tentativas no leitor.",
        "Esgotadas, pergunte o ano de nascimento.",
        "Se o ano bater, a pessoa assina o caderno.",
        "Se não bater, ela não vota.",
      ],
      en: [
        "Drag the hand and hold the index finger on the reader for 3 seconds.",
        "Letting go or sliding off restarts the scan without spending an attempt.",
        "Up to four attempts on the reader.",
        "Once they are spent, ask for the year of birth.",
        "If the year matches, the voter signs the register.",
        "If it does not, there is no vote.",
      ],
    },
  },
  {
    id: "excecoes",
    title: { pt: "Quando foge do trilho", en: "When it goes off the rails" },
    items: {
      pt: [
        "Já votou, impedido ou outra seção: encaminhar.",
        "Outro município: justificar.",
        "Nome fora da folha: procurar na listagem de impedidos.",
        "Dúvida na identidade: perguntar os dados; se persistir, chamar o juiz.",
        "Habilitada e não votou: suspender.",
      ],
      en: [
        "Already voted, barred or another section: send on.",
        "Another town: file the absence.",
        "Name not on the sheet: check the barred voters list.",
        "Doubt about identity: ask for the details; if it holds, call the judge.",
        "Cleared but did not vote: suspend.",
      ],
    },
  },
  {
    id: "pertences",
    title: { pt: "Pertences", en: "Belongings" },
    items: {
      pt: [
        "Celular e chaves ficam na carteira enquanto a pessoa vota.",
        "Devolva tudo, com o comprovante, antes de ela sair.",
      ],
      en: [
        "Phone and keys stay on the desk while the voter votes.",
        "Hand everything back, with the receipt, before they leave.",
      ],
    },
  },
];

/* As ações que resolvem um atendimento fora do trilho. Habilitar não está
   aqui: habilitar é terminar o fluxo. */
export const ACTIONS = [
  {
    id: "encaminhar",
    hotkey: "E",
    label: { pt: "Encaminhar ao cartório", en: "Send to the electoral office" },
    hint: { pt: "não habilita", en: "no vote here" },
  },
  {
    id: "justificar",
    hotkey: "J",
    label: { pt: "Registrar justificativa", en: "File the absence" },
    hint: { pt: "quem vota em outro município", en: "for voters from another town" },
  },
  {
    id: "juiz",
    hotkey: "C",
    label: { pt: "Chamar o juiz", en: "Call the judge" },
    hint: { pt: "dúvida de identidade", en: "doubt about identity" },
  },
  {
    id: "suspender",
    hotkey: "S",
    label: { pt: "Suspender a votação", en: "Suspend the vote" },
    hint: { pt: "habilitada e não votou", en: "cleared but did not vote" },
  },
];
