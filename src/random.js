/* Sorteio determinístico.

   Um texto vira semente, a semente vira um fluxo de números. Mesmo texto,
   mesma sequência — em qualquer máquina, em qualquer partida. É o que permite
   repetir um turno inteiro (`?turno=xyz`) e o que faz o rosto de uma pessoa
   não mudar entre dois renders. */

// FNV-1a: o texto vira um inteiro estável.
export function seed(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// mulberry32: um gerador pequeno e determinístico a partir dessa semente.
export function stream(n) {
  let a = n;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Atalhos que todo gerador daqui usa.
export function dice(rnd) {
  const span = (a, b) => a + rnd() * (b - a);
  return {
    rnd,
    span,
    int: (a, b) => Math.floor(span(a, b + 1)),
    pick: (list) => list[Math.floor(rnd() * list.length)],
    chance: (p) => rnd() < p,
  };
}
