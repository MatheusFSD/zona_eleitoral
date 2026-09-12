import { Cutscene } from "./Story.jsx";
import { TXT } from "../i18n.js";

const endings = {
  good: [{
    image: "saida",
    alt: {
      pt: "O estudante sai da sala com a mochila. Neusa se despede ao lado da urna empacotada.",
      en: "The student leaves the room with their backpack. Neusa says goodbye beside the packed-up machine.",
    },
    lines: {
      pt: ["Você guarda o comprovante na mochila. As horas estão completas. Amanhã, de volta ao TCC."],
      en: ["You tuck the receipt into your backpack. The hours are complete. Tomorrow, back to the thesis."],
    },
  }],
  bad: [{
    image: "dispensa",
    alt: {
      pt: "Neusa indica a porta. O estudante deixa a mesa e pega a mochila, cabisbaixo.",
      en: "Neusa points to the door. The student leaves the table and picks up their backpack, head down.",
    },
    lines: {
      pt: ["“Pode deixar. Eu assumo daqui.” Neusa aponta a porta. Você vai embora sem completar as horas."],
      en: ["“Leave it. I'll take over from here.” Neusa points to the door. You walk out without completing the hours."],
    },
  }],
};

export default function Ending({ bad, onMenu }) {
  return <Cutscene scenes={bad ? endings.bad : endings.good} onFinish={onMenu} endLabel={TXT.menuPrincipal} />;
}
