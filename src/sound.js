let ctx = null;

/* Bipes curtos do terminal. Silencia sozinho se o navegador bloquear áudio. */
export function tone(kind) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    ctx = ctx || new Ctx();
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = kind === "error" ? "sawtooth" : "square";
    osc.frequency.value = kind === "ok" ? 720 : kind === "error" ? 165 : kind === "vote" ? 520 : 430;
    if (kind === "ok") osc.frequency.setValueAtTime(910, now + 0.07);

    // O voto tem um bipe próprio, mais longo: é o som que a sala inteira ouve.
    const dur = kind === "vote" ? 0.55 : 0.15;
    if (kind === "vote") {
      osc.frequency.setValueAtTime(660, now + 0.16);
      osc.frequency.setValueAtTime(880, now + 0.3);
    }

    gain.gain.setValueAtTime(kind === "vote" ? 0.05 : 0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur - 0.01);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  } catch {
    /* som é enfeite: nunca deve quebrar a partida */
  }
}
