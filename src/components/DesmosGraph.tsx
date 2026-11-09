import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (
        el: HTMLElement,
        opts?: Record<string, unknown>
      ) => DesmosCalculator;
    };
  }
}

interface DesmosCalculator {
  setExpression: (expr: {
    id: string;
    latex?: string;
    color?: string;
    lineWidth?: number;
    showLabel?: boolean;
    label?: string;
    pointStyle?: string;
    dragMode?: string;
  }) => void;
  setMathBounds: (bounds: {
    left: number;
    right: number;
    bottom: number;
    top: number;
  }) => void;
  destroy: () => void;
  resize: () => void;
}

interface DesmosGraphProps {
  equation: string;
  points: { x: number; y: number }[];
}

// Convert common math equation formats to Desmos-compatible LaTeX
function toDesmos(eq: string): string {
  let s = eq.trim();

  // Remove "y =" or "f(x) =" prefix
  s = s.replace(/^[yf]\s*\(?\s*x?\s*\)?\s*=\s*/i, "");

  // Replace common notations:
  // x^2 → x^{2}, etc. (Desmos already handles ^ but let's be safe)
  s = s.replace(/\^(\d+)/g, "^{$1}");

  // sqrt(x) → \\sqrt{x}
  s = s.replace(/sqrt\(([^)]+)\)/gi, "\\sqrt{$1}");

  // abs(x) → |x| (Desmos native)
  s = s.replace(/abs\(([^)]+)\)/gi, "\\left|$1\\right|");

  // sin, cos, tan, log, ln → \\sin, \\cos, etc.
  s = s.replace(/\b(sin|cos|tan|cot|sec|csc|log|ln)\b/gi, "\\$1");

  // pi → \\pi
  s = s.replace(/\bpi\b/gi, "\\pi");

  // e^x → e^{x}
  s = s.replace(/\be\^/g, "e^");

  // Replace * with \\cdot for clarity (Desmos handles implicit multiplication)
  s = s.replace(/\*/g, "\\cdot ");

  return `y = ${s}`;
}

let desmosLoadPromise: Promise<void> | null = null;

function loadDesmosAPI(): Promise<void> {
  if (window.Desmos) return Promise.resolve();
  if (desmosLoadPromise) return desmosLoadPromise;

  desmosLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Desmos API"));
    document.head.appendChild(script);
  });

  return desmosLoadPromise;
}

export function DesmosGraph({ equation, points }: DesmosGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<DesmosCalculator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let destroyed = false;

    loadDesmosAPI()
      .then(() => {
        if (destroyed || !containerRef.current || !window.Desmos) return;

        const calc = window.Desmos.GraphingCalculator(containerRef.current, {
          expressions: true,
          settingsMenu: false,
          zoomButtons: true,
          expressionsTopbar: false,
          border: false,
          lockViewport: false,
          expressionsCollapsed: true,
          administerSecretFolders: false,
          images: false,
          folders: false,
          notes: false,
          sliders: true,
          links: false,
          qwertyKeyboard: false,
          restrictedFunctions: false,
          pasteGraphLink: false,
          pasteTableData: false,
          clearIntoDegreeMode: false,
          autosize: true,
          plotSingleVariableImplicitEquations: true,
          plotImplicits: true,
          plotInequalities: true,
        });
        calcRef.current = calc;

        // Set the equation expression
        if (equation) {
          const latex = toDesmos(equation);
          calc.setExpression({
            id: "main-eq",
            latex,
            color: "#2d70b3",
            lineWidth: 3.5,
          });
        }

        // Add data points as a table (if available and equation didn't work)
        if (points.length > 0) {
          // Add individual labeled points for first/last/extremes
          points.forEach((p, i) => {
            calc.setExpression({
              id: `pt-${i}`,
              latex: `(${p.x}, ${p.y})`,
              color: "#388c46",
              showLabel: false,
              pointStyle: "POINT",
              dragMode: "NONE",
            });
          });
        }

        // Set viewport bounds based on data range
        if (points.length > 0) {
          const xs = points.map((p) => p.x);
          const ys = points.map((p) => p.y);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);
          const padX = Math.max((maxX - minX) * 0.15, 2);
          const padY = Math.max((maxY - minY) * 0.15, 2);

          calc.setMathBounds({
            left: minX - padX,
            right: maxX + padX,
            bottom: minY - padY,
            top: maxY + padY,
          });
        }

        setLoading(false);
      })
      .catch(() => {
        if (!destroyed) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      destroyed = true;
      if (calcRef.current) {
        calcRef.current.destroy();
        calcRef.current = null;
      }
    };
  }, [equation, points]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] text-sm text-muted-foreground">
        نەخشەکێش نەهاتە بارکرن. تکایە پەیوەندیا ئینتەرنێتێ بکۆلە.
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-card/80 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg
              className="w-5 h-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-25"
              />
              <path
                d="M4 12a8 8 0 018-8"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            نەخشەکێش د بارکرنێدا...
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden"
        style={{ height: "450px" }}
      />
    </div>
  );
}
