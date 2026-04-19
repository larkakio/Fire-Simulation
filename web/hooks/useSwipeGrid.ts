"use client";

import { useCallback, useRef } from "react";
import { rasterizeLine } from "@/lib/game/engine";

export function useSwipeGrid(
  cols: number,
  rows: number,
  onStroke: (cells: [number, number][]) => void,
) {
  const last = useRef<[number, number] | null>(null);
  const dragging = useRef(false);

  const toCell = useCallback(
    (clientX: number, clientY: number, el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const x = (clientX - r.left) / r.width;
      const y = (clientY - r.top) / r.height;
      const gx = Math.min(cols - 1, Math.max(0, Math.floor(x * cols)));
      const gy = Math.min(rows - 1, Math.max(0, Math.floor(y * rows)));
      return [gx, gy] as [number, number];
    },
    [cols, rows],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = true;
      const c = toCell(e.clientX, e.clientY, e.currentTarget);
      last.current = c;
      onStroke([c]);
    },
    [onStroke, toCell],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!dragging.current || !last.current) return;
      const c = toCell(e.clientX, e.clientY, e.currentTarget);
      const [x0, y0] = last.current;
      const [x1, y1] = c;
      if (x0 === x1 && y0 === y1) return;
      const line = rasterizeLine(x0, y0, x1, y1, cols, rows);
      last.current = c;
      onStroke(line);
    },
    [cols, rows, onStroke, toCell],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      dragging.current = false;
      last.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    },
    [],
  );

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}
