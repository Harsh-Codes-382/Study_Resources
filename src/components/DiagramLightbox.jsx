// src/components/DiagramLightbox.jsx
//
// A zoom/pan popup for rendered Mermaid diagrams. NotePage hands us the
// already-rendered <svg> markup (as a string) of the clicked diagram; we drop
// it into a full-screen portal modal and let the user wheel-zoom (anchored at
// the cursor), drag to pan, and use the toolbar / keyboard to zoom & reset.
//
// Transform math uses transform-origin 0 0 on the content wrapper, so the svg
// is forced to its intrinsic viewBox pixel size on open (its inline
// max-width:100% would otherwise make scale() relative to the stage width).

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ZoomIn, ZoomOut, RefreshCw, X } from "lucide-react";

const MIN = 0.2;
const MAX = 8;
const clamp = (v) => Math.min(MAX, Math.max(MIN, v));

export default function DiagramLightbox({ svg, onClose }) {
  const stageRef = useRef(null);
  const contentRef = useRef(null);
  const tf = useRef({ x: 0, y: 0, k: 1 }); // live transform (kept off React state for smooth drags)
  const pointers = useRef(new Map()); // active pointerId -> {x, y} (supports pinch)
  const gesture = useRef(null); // { mode: "pan" | "pinch", ... }

  const apply = useCallback(() => {
    const { x, y, k } = tf.current;
    if (contentRef.current)
      contentRef.current.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
  }, []);

  // Center the diagram in the stage at a "fit" zoom (also the reset target).
  const fit = useCallback(() => {
    const stage = stageRef.current;
    const svgEl = contentRef.current?.querySelector("svg");
    if (!stage || !svgEl) return;
    const r = stage.getBoundingClientRect();
    const vb = svgEl.viewBox?.baseVal;
    const sw = vb && vb.width ? vb.width : svgEl.clientWidth || r.width;
    const sh = vb && vb.height ? vb.height : svgEl.clientHeight || r.height;
    // pin the svg to its intrinsic px size so scale() math is exact
    svgEl.style.maxWidth = "none";
    svgEl.style.width = `${sw}px`;
    svgEl.style.height = `${sh}px`;
    const k = clamp(Math.min(r.width / sw, r.height / sh) * 0.92);
    tf.current = { k, x: (r.width - sw * k) / 2, y: (r.height - sh * k) / 2 };
    apply();
  }, [apply]);

  // Zoom by `factor`, keeping the point (cx, cy) — relative to the stage's
  // top-left — fixed under the cursor.
  const zoomAt = useCallback(
    (cx, cy, factor) => {
      const { x, y, k } = tf.current;
      const nk = clamp(k * factor);
      if (nk === k) return;
      tf.current = {
        k: nk,
        x: cx - (cx - x) * (nk / k),
        y: cy - (cy - y) * (nk / k),
      };
      apply();
    },
    [apply]
  );

  const zoomCenter = useCallback(
    (factor) => {
      const r = stageRef.current?.getBoundingClientRect();
      if (r) zoomAt(r.width / 2, r.height / 2, factor);
    },
    [zoomAt]
  );

  // Initial fit + refit on resize.
  useLayoutEffect(() => {
    const id = requestAnimationFrame(fit);
    window.addEventListener("resize", fit);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", fit);
    };
  }, [fit]);

  // Wheel zoom needs a non-passive listener so we can preventDefault (stops the
  // page behind the modal from scrolling).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e) => {
      e.preventDefault();
      const r = stage.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  // Keyboard: Esc closes, +/- zoom, 0 resets. Also lock body scroll while open.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "+" || e.key === "=") zoomCenter(1.2);
      else if (e.key === "-" || e.key === "_") zoomCenter(1 / 1.2);
      else if (e.key === "0") fit();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, zoomCenter, fit]);

  // Two-finger pinch metrics from the currently-tracked pointers, relative to
  // the stage's top-left.
  const pinchInfo = () => {
    const [p1, p2] = [...pointers.current.values()];
    const r = stageRef.current.getBoundingClientRect();
    return {
      dist: Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1,
      mx: (p1.x + p2.x) / 2 - r.left,
      my: (p1.y + p2.y) / 2 - r.top,
    };
  };

  const startPan = (startTarget) => {
    const [p] = [...pointers.current.values()];
    gesture.current = {
      mode: "pan",
      sx: p.x,
      sy: p.y,
      ox: tf.current.x,
      oy: tf.current.y,
      moved: false,
      startTarget,
    };
  };

  const onPointerDown = (e) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer may already be gone; capture is best-effort */
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) startPan(e.target);
    else if (pointers.current.size === 2) gesture.current = { mode: "pinch", ...pinchInfo() };
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;

    if (g.mode === "pinch" && pointers.current.size >= 2) {
      const { dist, mx, my } = pinchInfo();
      zoomAt(mx, my, dist / g.dist); // zoom anchored at the fingers' midpoint
      tf.current.x += mx - g.mx; // + follow two-finger drag of the midpoint
      tf.current.y += my - g.my;
      apply();
      g.dist = dist;
      g.mx = mx;
      g.my = my;
    } else if (g.mode === "pan") {
      const dx = e.clientX - g.sx;
      const dy = e.clientY - g.sy;
      if (Math.abs(dx) + Math.abs(dy) > 4) g.moved = true;
      tf.current.x = g.ox + dx;
      tf.current.y = g.oy + dy;
      apply();
    }
  };

  const onPointerUp = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (pointers.current.size === 1) {
      startPan(null); // lifted from pinch to one finger — rebaseline pan (no jump)
    } else if (pointers.current.size === 0) {
      gesture.current = null;
      // a tap (no real drag) on the empty stage backdrop closes the modal
      if (g && g.mode === "pan" && !g.moved && g.startTarget === stageRef.current)
        onClose();
    }
  };

  return createPortal(
    <div
      className="nb-dlb-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Diagram viewer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="nb-dlb-toolbar">
        <button type="button" onClick={() => zoomCenter(1.2)} aria-label="Zoom in">
          <ZoomIn size={17} />
        </button>
        <button type="button" onClick={() => zoomCenter(1 / 1.2)} aria-label="Zoom out">
          <ZoomOut size={17} />
        </button>
        <button type="button" onClick={fit} aria-label="Reset view">
          <RefreshCw size={16} />
        </button>
        <button type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      <div
        ref={stageRef}
        className="nb-dlb-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={contentRef}
          className="nb-dlb-content"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>

      <p className="nb-dlb-hint">Scroll to zoom · drag to pan · Esc to close</p>
    </div>,
    document.body
  );
}
