import { useEffect, useRef, useState, useCallback } from "react";

interface DesmosGraphProps {
  equation: string;
  points: { x: number; y: number }[];
}

// ---- Math expression evaluator (safe, no eval) ----
function parseMath(expr: string): (x: number) => number {
  // Normalize
  let s = expr.trim();
  s = s.replace(/^[yf]\s*\(?\s*x?\s*\)?\s*=\s*/i, "");

  // We'll use Function with a whitelist approach
  s = s
    .replace(/\^/g, "**")
    .replace(/\b(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh)\b/gi, "Math.$1")
    .replace(/\bsqrt\b/gi, "Math.sqrt")
    .replace(/\babs\b/gi, "Math.abs")
    .replace(/\bln\b/gi, "Math.log")
    .replace(/\blog\b/gi, "Math.log10")
    .replace(/\bpi\b/gi, "Math.PI")
    .replace(/\be\b/g, "Math.E")
    .replace(/(\d)(x)/g, "$1*$2")
    .replace(/\)(x|\()/g, ")*$1");

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("x", `"use strict"; return (${s});`) as (x: number) => number;
    // Quick sanity check
    const test = fn(1);
    if (typeof test !== "number") throw new Error("not a number");
    return fn;
  } catch {
    return () => NaN;
  }
}

// ---- Color palette ----
const COLORS = [
  "#2d70b3",
  "#388c46",
  "#c74440",
  "#fa7e19",
  "#6042a6",
  "#0d7ea8",
];

type Viewport = { left: number; right: number; bottom: number; top: number };

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function DesmosGraph({ equation, points }: DesmosGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewport, setViewport] = useState<Viewport>(() => {
    if (points.length > 1) {
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const padX = Math.max((maxX - minX) * 0.2, 3);
      const padY = Math.max((maxY - minY) * 0.2, 3);
      return { left: minX - padX, right: maxX + padX, bottom: minY - padY, top: maxY + padY };
    }
    return { left: -10, right: 10, bottom: -7, top: 7 };
  });

  const dragRef = useRef<{ startX: number; startY: number; vp: Viewport } | null>(null);
  const [size, setSize] = useState({ w: 600, h: 400 });
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; sx: number; sy: number } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ mx: number; my: number } | null>(null);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) });
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ---- Coordinate transforms ----
  const toScreen = useCallback((mx: number, my: number, w: number, h: number, vp: Viewport) => ({
    sx: ((mx - vp.left) / (vp.right - vp.left)) * w,
    sy: h - ((my - vp.bottom) / (vp.top - vp.bottom)) * h,
  }), []);

  const toMath = useCallback((sx: number, sy: number, w: number, h: number, vp: Viewport) => ({
    mx: vp.left + (sx / w) * (vp.right - vp.left),
    my: vp.bottom + ((h - sy) / h) * (vp.top - vp.bottom),
  }), []);

  // ---- Draw ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = size;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const vp = viewport;

    // Background
    const isDark = document.documentElement.classList.contains("dark");
    const bg = isDark ? "#1a1a2e" : "#ffffff";
    const gridMinor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)";
    const gridMajor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.13)";
    const axisColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
    const labelColor = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
    const textColor = isDark ? "#e2e8f0" : "#1a202c";

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Grid step calculation
    const rangeX = vp.right - vp.left;
    const rawStep = rangeX / 10;
    const exp = Math.floor(Math.log10(rawStep));
    const base = Math.pow(10, exp);
    let step = base;
    if (rawStep / base > 5) step = base * 5;
    else if (rawStep / base > 2) step = base * 2;
    const minorStep = step / 5;

    const drawVerticals = (s: number, style: string) => {
      ctx.strokeStyle = style;
      ctx.lineWidth = 0.5;
      const startX = Math.floor(vp.left / s) * s;
      for (let gx = startX; gx <= vp.right; gx += s) {
        const { sx } = toScreen(gx, 0, w, h, vp);
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, h);
        ctx.stroke();
      }
    };
    const drawHorizontals = (s: number, style: string) => {
      ctx.strokeStyle = style;
      ctx.lineWidth = 0.5;
      const startY = Math.floor(vp.bottom / s) * s;
      for (let gy = startY; gy <= vp.top; gy += s) {
        const { sy } = toScreen(0, gy, w, h, vp);
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(w, sy);
        ctx.stroke();
      }
    };

    drawVerticals(minorStep, gridMinor);
    drawHorizontals(minorStep, gridMinor);
    drawVerticals(step, gridMajor);
    drawHorizontals(step, gridMajor);

    // Axes
    const origin = toScreen(0, 0, w, h, vp);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    // X axis
    ctx.beginPath();
    ctx.moveTo(0, origin.sy);
    ctx.lineTo(w, origin.sy);
    ctx.stroke();
    // Y axis
    ctx.beginPath();
    ctx.moveTo(origin.sx, 0);
    ctx.lineTo(origin.sx, h);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = labelColor;
    ctx.font = `11px ui-monospace, monospace`;
    ctx.textAlign = "center";
    const startXL = Math.floor(vp.left / step) * step;
    for (let gx = startXL; gx <= vp.right; gx += step) {
      if (Math.abs(gx) < step * 0.01) continue;
      const { sx, sy } = toScreen(gx, 0, w, h, vp);
      const labelY = clamp(sy + 15, 14, h - 4);
      ctx.fillText(
        gx % 1 === 0 ? String(Math.round(gx)) : gx.toPrecision(3),
        sx,
        labelY
      );
    }
    ctx.textAlign = "right";
    const startYL = Math.floor(vp.bottom / step) * step;
    for (let gy = startYL; gy <= vp.top; gy += step) {
      if (Math.abs(gy) < step * 0.01) continue;
      const { sx, sy } = toScreen(0, gy, w, h, vp);
      const labelX = clamp(sx - 5, 4, w - 4);
      ctx.fillText(
        gy % 1 === 0 ? String(Math.round(gy)) : gy.toPrecision(3),
        labelX,
        sy + 4
      );
    }

    // --- Plot equation curve ---
    if (equation) {
      const fn = parseMath(equation);
      const STEPS = w * 2;
      ctx.strokeStyle = COLORS[0];
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.beginPath();
      let penDown = false;
      for (let i = 0; i <= STEPS; i++) {
        const mx = vp.left + (i / STEPS) * (vp.right - vp.left);
        const my = fn(mx);
        if (!isFinite(my) || Math.abs(my) > 1e9) { penDown = false; continue; }
        const { sx, sy } = toScreen(mx, my, w, h, vp);
        if (!penDown) { ctx.moveTo(sx, sy); penDown = true; }
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // --- Plot data points ---
    if (points.length > 0) {
      // Connect with line if many points
      if (points.length > 1) {
        ctx.strokeStyle = COLORS[1];
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        points.forEach((p, i) => {
          const { sx, sy } = toScreen(p.x, p.y, w, h, vp);
          if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        });
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Dots
      points.forEach((p) => {
        const { sx, sy } = toScreen(p.x, p.y, w, h, vp);
        ctx.beginPath();
        ctx.arc(sx, sy, 5, 0, Math.PI * 2);
        ctx.fillStyle = COLORS[1];
        ctx.fill();
        ctx.strokeStyle = bg;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // Hover tooltip dot
    if (hoveredPoint) {
      const { sx, sy, x, y } = hoveredPoint;
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fillStyle = COLORS[0];
      ctx.fill();
      ctx.strokeStyle = bg;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tooltip box
      const label = `(${x.toPrecision(4)}, ${y.toPrecision(4)})`;
      ctx.font = "bold 12px ui-monospace, monospace";
      const tw = ctx.measureText(label).width;
      const pad = 6, th = 20;
      let tx = sx + 10, ty = sy - th - pad;
      if (tx + tw + pad * 2 > w) tx = sx - tw - pad * 2 - 10;
      if (ty < 0) ty = sy + pad;
      ctx.fillStyle = isDark ? "rgba(30,30,50,0.9)" : "rgba(255,255,255,0.95)";
      ctx.strokeStyle = COLORS[0];
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(tx - pad, ty - 2, tw + pad * 2, th, 5);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.fillText(label, tx, ty + th - 6);
    }

    // Cursor crosshair coords
    if (cursorPos && !hoveredPoint) {
      const { mx, my } = cursorPos;
      const label = `x=${mx.toPrecision(4)}, y=${my.toPrecision(4)}`;
      ctx.font = "11px ui-monospace, monospace";
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = isDark ? "rgba(30,30,50,0.85)" : "rgba(240,240,255,0.9)";
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(w - tw - 16, h - 24, tw + 12, 20, 4);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = labelColor;
      ctx.textAlign = "left";
      ctx.fillText(label, w - tw - 10, h - 9);
    }
  }, [equation, points, viewport, size, hoveredPoint, cursorPos, toScreen]);

  // ---- Zoom (wheel) ----
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.12 : 0.88;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const { mx, my } = toMath(sx, sy, size.w, size.h, viewport);
    setViewport((vp) => ({
      left:   mx + (vp.left   - mx) * factor,
      right:  mx + (vp.right  - mx) * factor,
      bottom: my + (vp.bottom - my) * factor,
      top:    my + (vp.top    - my) * factor,
    }));
  }, [viewport, size, toMath]);

  // ---- Pan (drag) ----
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    dragRef.current = { startX: e.clientX, startY: e.clientY, vp: viewport };
  }, [viewport]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const { mx, my } = toMath(sx, sy, size.w, size.h, viewport);
    setCursorPos({ mx, my });

    // Hover on data points
    let found: { x: number; y: number; sx: number; sy: number } | null = null;
    if (points.length > 0) {
      for (const p of points) {
        const { sx: psx, sy: psy } = toScreen(p.x, p.y, size.w, size.h, viewport);
        if (Math.hypot(sx - psx, sy - psy) < 10) {
          found = { x: p.x, y: p.y, sx: psx, sy: psy };
          break;
        }
      }
    }
    // Hover on curve
    if (!found && equation) {
      const fn = parseMath(equation);
      const cy = fn(mx);
      if (isFinite(cy)) {
        const { sy: curveScreenY } = toScreen(mx, cy, size.w, size.h, viewport);
        if (Math.abs(sy - curveScreenY) < 12) {
          const { sx: hsx } = toScreen(mx, cy, size.w, size.h, viewport);
          found = { x: parseFloat(mx.toPrecision(5)), y: parseFloat(cy.toPrecision(5)), sx: hsx, sy: curveScreenY };
        }
      }
    }
    setHoveredPoint(found);

    // Pan
    if (dragRef.current && e.buttons === 1) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const vp = dragRef.current.vp;
      const rangeX = vp.right - vp.left;
      const rangeY = vp.top - vp.bottom;
      const dmx = -(dx / size.w) * rangeX;
      const dmy = (dy / size.h) * rangeY;
      setViewport({
        left:   vp.left   + dmx,
        right:  vp.right  + dmx,
        bottom: vp.bottom + dmy,
        top:    vp.top    + dmy,
      });
      dragRef.current = { ...dragRef.current, startX: e.clientX, startY: e.clientY, vp: { left: vp.left+dmx, right: vp.right+dmx, bottom: vp.bottom+dmy, top: vp.top+dmy } };
    }
  }, [viewport, size, points, equation, toMath, toScreen]);

  const handleMouseUp = useCallback(() => { dragRef.current = null; }, []);
  const handleMouseLeave = useCallback(() => {
    dragRef.current = null;
    setHoveredPoint(null);
    setCursorPos(null);
  }, []);

  // ---- Touch support ----
  const touchRef = useRef<{ x: number; y: number; dist: number } | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, dist: 0 };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchRef.current = { x: 0, y: 0, dist: Math.hypot(dx, dy) };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!touchRef.current) return;
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchRef.current.x;
      const dy = e.touches[0].clientY - touchRef.current.y;
      const rangeX = viewport.right - viewport.left;
      const rangeY = viewport.top - viewport.bottom;
      const dmx = -(dx / size.w) * rangeX;
      const dmy = (dy / size.h) * rangeY;
      setViewport((vp) => ({ left: vp.left+dmx, right: vp.right+dmx, bottom: vp.bottom+dmy, top: vp.top+dmy }));
      touchRef.current = { ...touchRef.current, x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const factor = touchRef.current.dist / newDist;
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy2 = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const { mx, my } = toMath(cx, cy2, size.w, size.h, viewport);
      setViewport((vp) => ({
        left:   mx + (vp.left   - mx) * factor,
        right:  mx + (vp.right  - mx) * factor,
        bottom: my + (vp.bottom - my) * factor,
        top:    my + (vp.top    - my) * factor,
      }));
      touchRef.current = { ...touchRef.current, dist: newDist };
    }
  }, [viewport, size, toMath]);

  // ---- Zoom buttons ----
  const zoom = (factor: number) => {
    setViewport((vp) => {
      const cx = (vp.left + vp.right) / 2;
      const cy = (vp.bottom + vp.top) / 2;
      const hw = ((vp.right - vp.left) / 2) * factor;
      const hh = ((vp.top - vp.bottom) / 2) * factor;
      return { left: cx-hw, right: cx+hw, bottom: cy-hh, top: cy+hh };
    });
  };
  const resetView = () => setViewport({ left: -10, right: 10, bottom: -7, top: 7 });

  return (
    <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden border border-border" style={{ height: "450px" }}>
      <canvas
        ref={canvasRef}
        style={{ cursor: dragRef.current ? "grabbing" : (hoveredPoint ? "crosshair" : "grab"), display: "block" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => { touchRef.current = null; }}
      />
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
        <button
          onClick={() => zoom(0.75)}
          className="w-8 h-8 rounded-lg bg-card/90 border border-border shadow text-foreground hover:bg-primary hover:text-primary-foreground transition font-bold text-lg flex items-center justify-center cursor-pointer"
          title="زووم کرن ناو"
        >+</button>
        <button
          onClick={() => zoom(1.33)}
          className="w-8 h-8 rounded-lg bg-card/90 border border-border shadow text-foreground hover:bg-primary hover:text-primary-foreground transition font-bold text-lg flex items-center justify-center cursor-pointer"
          title="زووم کرن دەر"
        >−</button>
        <button
          onClick={resetView}
          className="w-8 h-8 rounded-lg bg-card/90 border border-border shadow text-foreground hover:bg-primary hover:text-primary-foreground transition text-xs flex items-center justify-center cursor-pointer"
          title="ڕستکردنەوە"
        >⌂</button>
      </div>
    </div>
  );
}
