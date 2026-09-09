export const SCAN_MS = 3000;

export function fingerInside(point, rect) {
  if (!rect || rect.width <= 0 || rect.height <= 0) return false;
  const dx = (point.x - (rect.left + rect.width / 2)) / (rect.width * .36);
  const dy = (point.y - (rect.top + rect.height / 2)) / (rect.height * .36);
  return dx * dx + dy * dy <= 1;
}

// A tentativa só é consumida após contato contínuo; o resultado sai uma vez.
export function createScan() {
  let start = null;
  let finished = false;
  return {
    reset() { start = null; },
    tick(now, contact) {
      if (finished) return { progress: 1, complete: false };
      if (!contact) { start = null; return { progress: 0, complete: false }; }
      if (start === null) start = now;
      const progress = Math.min(1, (now - start) / SCAN_MS);
      if (progress === 1) finished = true;
      return { progress, complete: finished };
    },
  };
}
