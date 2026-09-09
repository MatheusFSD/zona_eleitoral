import { useCallback, useEffect, useRef, useState } from "react";

import { luz } from "./data/tutorial.js";

/* A mesa é uma superfície solta: cada objeto guarda onde está e a que altura
   da pilha. Encostar num objeto já o traz para cima — como na mesa de
   verdade, o último que você mexeu é o que fica por cima dos outros.

   Arrastar começa em qualquer parte do objeto que não seja um controle:
   botão, campo ou qualquer coisa marcada com `data-nodrag` continua clicável.
   O ponteiro é capturado, então o objeto não escapa se o cursor correr mais
   rápido que o render. */

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const place = (v) => (typeof v === "number" ? `${v}px` : v);

export function useDesk(initial, onDrop) {
  const [spots, setSpots] = useState(initial);
  const top = useRef(20);
  const targets = useRef({});
  const drop = useRef(onDrop);

  useEffect(() => {
    drop.current = onDrop;
  });

  // Registra uma área que recebe objetos (a bandeja, por exemplo).
  const target = useCallback(
    (id) => (el) => {
      targets.current[id] = el;
    },
    [],
  );

  const raise = useCallback((id) => {
    top.current += 1;
    const z = top.current;
    setSpots((s) => ({ ...s, [id]: { ...(s[id] ?? {}), z } }));
  }, []);

  const grab = useCallback(
    (id) => (e) => {
      // Portais seguem a árvore React ao propagar eventos, mas não pertencem
      // ao objeto no DOM. A mão nunca deve iniciar o arrasto do leitor.
      if (e.defaultPrevented || !e.currentTarget.contains(e.target)) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      raise(id);
      if (e.target.closest("button, input, select, textarea, a, [data-nodrag]")) return;

      /* Sem isto o navegador entende o gesto como arrastar o texto do objeto,
         cancela o ponteiro no meio e o arrasto morre pela metade. */
      e.preventDefault();

      const el = e.currentTarget;
      const surface = el.parentElement;
      const startX = e.clientX;
      const startY = e.clientY;
      const originX = el.offsetLeft;
      const originY = el.offsetTop;
      const maxX = surface.clientWidth - el.offsetWidth;
      const maxY = surface.clientHeight - el.offsetHeight;
      /* Para a esquerda a mesa deixa passar: é por ali que está a pessoa, e é
         assim que se devolve o documento e os pertences na mão dela. */
      const minX = -(el.offsetWidth + 140);
      let moved = false;
      /* A última posição do ponteiro fica guardada: a soltura nem sempre traz
         coordenadas — um `pointercancel` chega zerado — e é ela que decide em
         cima de que o objeto caiu. */
      let lastX = e.clientX;
      let lastY = e.clientY;

      el.setPointerCapture?.(e.pointerId);
      el.classList.add("dragging");

      const move = (ev) => {
        lastX = ev.clientX;
        lastY = ev.clientY;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        // Uma folga de 3px separa o clique do arrasto.
        if (!moved && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
        moved = true;
        setSpots((s) => ({
          ...s,
          [id]: { ...s[id], x: clamp(originX + dx, minX, Math.max(0, maxX)), y: clamp(originY + dy, 0, Math.max(0, maxY)) },
        }));
      };

      const up = (ev) => {
        el.classList.remove("dragging");
        el.releasePointerCapture?.(ev.pointerId);
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
        if (!moved) return;

        // Largou em cima de quê? Vale onde o dedo soltou, não o centro do
        // objeto: é mais perto do que a mão acha que está fazendo.
        const cx = lastX;
        const cy = lastY;
        let alvo = null;
        for (const [name, node] of Object.entries(targets.current)) {
          if (!node || node === el || node.contains(el)) continue;
          const t = node.getBoundingClientRect();
          if (cx >= t.left && cx <= t.right && cy >= t.top && cy <= t.bottom) {
            alvo = name;
            break;
          }
        }
        /* Quem recebe pode recusar — a pessoa não pega o documento antes da
           hora. Recusado, o objeto volta deslizando para onde estava; largado
           no vazio fora da mesa, volta para cima dela. */
        const aceitou = alvo ? drop.current?.(id, alvo) : null;
        if (alvo && aceitou === false) setSpots((s) => ({ ...s, [id]: { ...s[id], x: originX, y: originY } }));
        else if (!alvo && el.offsetLeft < 0) setSpots((s) => ({ ...s, [id]: { ...s[id], x: 6 } }));
      };

      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
    },
    [raise],
  );

  // Devolve objetos para o lugar de origem — os pertences, a cada pessoa.
  const reset = useCallback((patch) => setSpots((s) => ({ ...s, ...patch })), []);

  /* Devolve só a ordem da pilha, sem mexer em onde cada coisa está: é o que
     arruma a mesa depois do tutorial, que subiu peça por peça para mostrar. */
  const restack = useCallback((order) => {
    setSpots((s) => {
      const out = { ...s };
      for (const [id, spot] of Object.entries(order)) if (out[id]) out[id] = { ...out[id], z: spot.z };
      return out;
    });
  }, []);

  return { spots, grab, target, raise, reset, restack };
}

export function Piece({ id, desk, className = "", label, hint, delay = 0, foco, children }) {
  const spot = desk.spots[id] ?? {};

  return (
    <div
      /* Durante o tutorial a mesa fica no escuro: só a peça de que a
         coordenadora está falando continua acesa. */
      className={`piece ${className}${hint ? " vez" : ""}${luz(foco, id)}`}
      style={{ left: place(spot.x), top: place(spot.y), bottom: spot.y == null ? place(spot.bottom) : undefined, zIndex: spot.z ?? 1, animationDelay: delay ? `${delay}ms` : undefined }}
      onPointerDown={desk.grab(id)}
      role="group"
      aria-label={label}
    >
      {children}
    </div>
  );
}
