/* Rosto procedural.

   Tudo que o caso não declara em `look` sai do próprio `id`: mesmo id, mesmo
   rosto, sempre — não há sorteio em tempo de execução, então o retrato não
   muda entre um render e outro nem entre uma partida e outra.

   O `look` do caso continua mandando em cima de qualquer campo. A ideia é
   declarar só o que tem significado na história e deixar o resto para o
   gerador; hoje quem vem de [data/shift.js](./data/shift.js) não declara nada,
   só o `sex`, que inclina corte de cabelo e barba.

   O que mais separa dois rostos não é a lista de opções — é o `build`, um
   punhado de multiplicadores contínuos sobre largura da cabeça, distância dos
   olhos, tamanho da orelha, comprimento do nariz. Sem ele, duas pessoas com o
   mesmo corte e o mesmo formato de rosto sairiam idênticas. */

import { seed, stream } from "./random.js";

const SKINS = ["#f7c69f", "#efb68b", "#e5a477", "#d79465", "#c38459", "#af704d", "#995f43", "#835039", "#6b4030", "#533329"];
const HAIRS = ["#102b3a", "#102b3a", "#182f3a", "#26343c", "#362d2b", "#54392f", "#794b32", "#b87b43"];
const GREYS = ["#8c9698", "#b9bfbb", "#d1cfc2", "#737f85", "#e0dbcb"];
const SHIRTS = [
  "#cc7c35", "#456879", "#8f5263", "#405a36", "#6b4f81", "#b64e44", "#806b39", "#4076a1",
  "#3f807a", "#7d563a", "#c98c34", "#5c657b", "#7a8b5a", "#a05a4a", "#4a6b8a", "#93553f",
];

const SHAPES = ["oval", "round", "long", "square"];
const COLLARS = ["tee", "tee", "polo", "button"];
const MOODS = ["calm", "calm", "calm", "smile", "tense", "tired"];
// Careca não cai em quem tem dezoito anos.
const CUTS = {
  m: ["crop", "side", "quiff", "flat", "wave", "curly", "fringe", "long"],
  f: ["long", "bob", "bun", "pony", "curly", "side", "fringe", "quiff"],
};
const CUTS_OLD = {
  m: [...CUTS.m, "bald", "bald", "bald"],
  f: [...CUTS.f, "bun", "bob"],
};
const BEARDS = {
  m: ["none", "none", "none", "stubble", "mustache", "handlebar", "goatee", "full"],
  f: ["none"],
};

/* `key` troca a semente sem trocar a pessoa: é assim que a foto do documento
   pode ser de outro rosto nos casos de foto duvidosa. */
export function faceOf(person, key = person.id) {
  const look = person.look ?? {};
  const rnd = stream(seed(key));
  const pick = (list) => list[Math.floor(rnd() * list.length)];
  const span = (a, b) => a + rnd() * (b - a);

  // A idade vem da data de nascimento do cadastro, não de um campo à parte.
  const year = Number(String(person.reg?.birth ?? "").slice(-4));
  const age = look.age ?? (!year ? "adult" : year <= 1966 ? "old" : year >= 2006 ? "young" : "adult");
  const old = age === "old";

  // Todo sorteio acontece sempre, mesmo quando o caso já declarou o campo:
  // assim fixar uma cor não embaralha o resto do rosto.
  const coin = rnd() < 0.5 ? "m" : "f";
  const sex = look.sex ?? person.sex ?? coin;
  const drawn = {
    skin: pick(SKINS),
    hair: pick(old ? GREYS : HAIRS),
    shirt: pick(SHIRTS),
    style: pick((old ? CUTS_OLD : CUTS)[sex] ?? CUTS.m),
    face: pick(SHAPES),
    collar: pick(COLLARS),
    mood: pick(MOODS),
    glasses: rnd() < (old ? 0.5 : 0.16),
    beard: pick(BEARDS[sex] ?? BEARDS.f),
  };

  return {
    age,
    skin: look.skin ?? drawn.skin,
    hair: look.hair ?? drawn.hair,
    shirt: look.shirt ?? drawn.shirt,
    style: look.style ?? drawn.style,
    face: look.face ?? drawn.face,
    collar: look.collar ?? drawn.collar,
    mood: look.mood ?? drawn.mood,
    glasses: look.glasses ?? drawn.glasses,
    beard: look.beard ?? drawn.beard,
    build: {
      w: span(0.93, 1.07),
      h: span(0.95, 1.06),
      gap: span(0.87, 1.13),
      eye: span(2.2, 3.1),
      eyeY: span(-2, 2),
      nose: span(0.75, 1.3),
      mouth: span(0.82, 1.22),
      ear: span(0.84, 1.18),
      earY: span(-2.5, 2.5),
      vol: span(0.75, 1.35),
      neck: span(0.9, 1.14),
    },
  };
}
