import React, { useState, useEffect, useRef } from "react";
import {
  LineChart as LineChartIcon,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Maximize2,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Play,
  Pause,
  BookOpen,
  Table as TableIcon,
  Info,
  ChevronDown,
  ChevronUp,
  Layers,
  Zap,
} from "lucide-react";
import { DesmosGraph } from "./DesmosGraph";
import katex from "katex";
import "katex/dist/katex.min.css";

interface FunctionItem {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

const PRESET_FUNCTIONS = [
  { name: "هاوکێشەیا هێلی (Linear)", eq: "y = 2x + 1", category: "هێلی" },
  { name: "پەرەبۆلا (Parabola / Quadratic)", eq: "y = x^2 - 4", category: "دووجا" },
  { name: "سێجا (Cubic Polynomial)", eq: "y = x^3 - 3x", category: "فرەهاوکێشە" },
  { name: "شەپۆلا ساین (Sine Wave)", eq: "y = \\sin(x)", category: "سێگۆشەزانی" },
  { name: "شەپۆلا کۆساین (Cosine Wave)", eq: "y = 2\\cos(2x)", category: "سێگۆشەزانی" },
  { name: "تواندار (Exponential e^x)", eq: "y = e^x", category: "تواندار" },
  { name: "لۆگاریتمێ سروشتی (ln x)", eq: "y = \\ln(x)", category: "لۆگاریتم" },
  { name: "کەرتی (Rational 1/x)", eq: "y = \\frac{1}{x}", category: "کەرتی" },
  { name: "گۆسیێ ڕێژەیی (Gaussian Bell Curve)", eq: "y = e^{-x^2}", category: "ئامار" },
  { name: "بازنە (Circle r=5)", eq: "x^2 + y^2 = 25", category: "ئەندازە" },
];

const COLORS = ["#2563eb", "#9333ea", "#059669", "#dc2626", "#d97706"];

export function FunctionGrapher() {
  const [functions, setFunctions] = useState<FunctionItem[]>([
    { id: "1", expression: "y = x^2 - 4", color: "#2563eb", visible: true },
  ]);
  const [sliderA, setSliderA] = useState(1);
  const [sliderB, setSliderB] = useState(0);
  const [sliderC, setSliderC] = useState(0);
  const [useSliders, setUseSliders] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [tablePoints, setTablePoints] = useState<{ x: number; y: number }[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  // When sliders change and slider mode is on, update active function
  useEffect(() => {
    if (useSliders) {
      const eq = `y = ${sliderA}x^2 + ${sliderB}x + ${sliderC}`;
      setFunctions([
        { id: "slider-func", expression: eq, color: "#2563eb", visible: true },
      ]);
    }
  }, [sliderA, sliderB, sliderC, useSliders]);

  const addFunction = () => {
    if (functions.length >= 4) return;
    const nextColor = COLORS[functions.length % COLORS.length];
    setFunctions((prev) => [
      ...prev,
      { id: Date.now().toString(), expression: "y = x", color: nextColor, visible: true },
    ]);
  };

  const removeFunction = (id: string) => {
    if (functions.length <= 1) return;
    setFunctions((prev) => prev.filter((f) => f.id !== id));
  };

  const updateExpression = (id: string, val: string) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, expression: val } : f)),
    );
  };

  const toggleVisibility = (id: string) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)),
    );
  };

  // Generate Table of Values (-5 to +5)
  const generateTable = () => {
    const activeFunc = functions.find((f) => f.visible)?.expression || "y = x";
    const pts: { x: number; y: number }[] = [];
    
    // Simple math evaluator for basic equations
    for (let x = -5; x <= 5; x++) {
      let y = 0;
      try {
        let clean = activeFunc
          .replace(/^[yf]\s*\([^)]*\)\s*=\s*/i, "")
          .replace(/^y\s*=\s*/i, "")
          .replace(/\^/g, "**")
          .replace(/sin/g, "Math.sin")
          .replace(/cos/g, "Math.cos")
          .replace(/tan/g, "Math.tan")
          .replace(/sqrt/g, "Math.sqrt")
          .replace(/e\*\*/g, "Math.exp")
          .replace(/\be\b/g, "Math.E")
          .replace(/\bpi\b/g, "Math.PI")
          .replace(/([0-9])x/g, "$1*x")
          .replace(/x/g, `(${x})`);
        
        // Safe mathematical evaluation
        const fn = new Function("x", `with(Math){ return (${clean}); }`);
        y = fn(x);
        if (typeof y === "number" && !isNaN(y) && isFinite(y)) {
          pts.push({ x, y: Number(y.toFixed(3)) });
        }
      } catch {
        // ignore calculation errors
      }
    }
    setTablePoints(pts);
    setShowTable(true);
  };

  // AI Academic Analysis
  const runAnalysis = async () => {
    const active = functions.filter((f) => f.visible).map((f) => f.expression).join(", ");
    if (!active) return;
    setAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "grapher",
          input: `Analyze function and return JSON:\n${active}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "شیکاریا نەخشەی سەرکەفتی نەبوو.");

      let jsonStr = (data.output || "").trim();
      if (jsonStr.includes("```")) {
        const matches = jsonStr.match(/```(?:json)?([\s\S]*?)```/);
        if (matches && matches[1]) {
          jsonStr = matches[1].trim();
        }
      }
      const parsed = JSON.parse(jsonStr);
      setAnalysisResult(parsed);
    } catch (e) {
      setAnalysisError("شیکاریا نەخشەی ب سەرکەفتیانە نەهاتە بارکرن.");
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const primaryEquation = functions.find((f) => f.visible)?.expression || "y = x^2";

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-foreground font-sans">
      {/* ── Header ── */}
      <div
        className="rounded-2xl bg-gradient-to-r from-teal-600/15 via-emerald-600/10 to-blue-600/15 border border-teal-500/20 px-4 py-3 sm:px-5 sm:py-3.5 backdrop-blur-xl relative overflow-hidden"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
              <LineChartIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  وێنەکێشێ نەخشەیان
                </h2>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 font-semibold border border-teal-500/20 whitespace-nowrap">
                  Graphing Lab
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                کێشان و شیکاریا داینامیکی یا نەخشەیێن بیرکاریێ.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setUseSliders(!useSliders)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                useSliders
                  ? "bg-teal-500 text-white border-teal-500 shadow-sm"
                  : "bg-card border-border hover:border-teal-500/50 text-foreground"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>سلاکەر (a, b, c)</span>
            </button>
            <button
              onClick={generateTable}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-teal-500/50 text-xs font-semibold text-foreground transition"
            >
              <TableIcon className="w-3.5 h-3.5 text-teal-500" />
              <span>خشتەیێ خاڵان</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Preset Functions Ribbon ── */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-muted-foreground px-1">بژاردەیێن بەرهەڤکری (Preset Functions):</span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {PRESET_FUNCTIONS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUseSliders(false);
                setFunctions([{ id: "1", expression: preset.eq, color: "#2563eb", visible: true }]);
              }}
              className="px-3 py-1.5 rounded-xl bg-card border border-border hover:border-teal-500/50 text-xs font-semibold text-foreground whitespace-nowrap transition-all hover:scale-105 shrink-0 shadow-xs"
            >
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Workspace: Function List + Graph Canvas ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Sidebar: Function Inputs */}
        <div className="lg:col-span-1 space-y-4">
          <div
            className="rounded-3xl bg-card border border-border p-5 space-y-4"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <button
                onClick={addFunction}
                disabled={useSliders || functions.length >= 4}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-secondary hover:bg-teal-500 hover:text-white text-xs font-bold transition disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>نەخشەیێ نوی</span>
              </button>
              <h3 className="text-xs font-extrabold text-muted-foreground">لیستا نەخشان</h3>
            </div>

            {/* If Slider Mode */}
            {useSliders ? (
              <div className="space-y-4 p-3 rounded-2xl bg-secondary/40 border border-border/80 text-right">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 block font-mono dir-ltr text-center">
                  y = {sliderA}x² + {sliderB}x + {sliderC}
                </span>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span>a = {sliderA}</span>
                    <span className="text-muted-foreground">فاکتەرێ چەماندنێ</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.5"
                    value={sliderA}
                    onChange={(e) => setSliderA(Number(e.target.value))}
                    className="w-full accent-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span>b = {sliderB}</span>
                    <span className="text-muted-foreground">لێژیا هێلی (Slope)</span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="1"
                    value={sliderB}
                    onChange={(e) => setSliderB(Number(e.target.value))}
                    className="w-full accent-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span>c = {sliderC}</span>
                    <span className="text-muted-foreground">بڕین دگەل Y</span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="1"
                    value={sliderC}
                    onChange={(e) => setSliderC(Number(e.target.value))}
                    className="w-full accent-teal-500"
                  />
                </div>
              </div>
            ) : (
              /* Regular Functions List */
              <div className="space-y-2.5">
                {functions.map((fn, idx) => (
                  <div
                    key={fn.id}
                    className="p-3 rounded-2xl bg-secondary/30 border border-border/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleVisibility(fn.id)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition"
                        >
                          {fn.visible ? <Eye className="w-3.5 h-3.5 text-teal-500" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        {functions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFunction(fn.id)}
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground font-mono">
                          f{idx + 1}(x)
                        </span>
                        <div
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: fn.color }}
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      value={fn.expression}
                      onChange={(e) => updateExpression(fn.id, e.target.value)}
                      placeholder="e.g. y = sin(x) or y = 2x + 1"
                      dir="ltr"
                      className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/40 text-left"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* AI Analysis Trigger Button */}
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-xs shadow-md shadow-teal-600/20 hover:opacity-90 transition disabled:opacity-50"
            >
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{analyzing ? "د شیکارکرنێدا..." : "شیکاریا ئەکادیمی ب AI"}</span>
            </button>
          </div>
        </div>

        {/* Right/Center: Interactive Graph Canvas */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className="rounded-3xl bg-card border border-border p-4 md:p-5 overflow-hidden relative"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="flex items-center justify-between mb-3 border-b border-border pb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-muted-foreground dir-ltr">
                  {primaryEquation}
                </span>
              </div>
              <span className="text-xs font-extrabold text-foreground flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                تەختەیا نەخشەکێش (Desmos Graph)
              </span>
            </div>

            <div className="w-full bg-background rounded-2xl overflow-hidden border border-border">
              <DesmosGraph equation={primaryEquation} points={[]} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Table of Values Modal/Card ── */}
      {showTable && tablePoints.length > 0 && (
        <div
          className="rounded-3xl bg-card border border-border p-6 text-right space-y-4 animate-in fade-in duration-200"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <button
              onClick={() => setShowTable(false)}
              className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-teal-500" />
              خشتەیێ خالێن نەخشەی (Table of Coordinates)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2 dir-ltr">
            {tablePoints.map((pt, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-secondary/50 border border-border/80 text-center font-mono">
                <span className="text-[11px] text-muted-foreground block">x = {pt.x}</span>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 block mt-0.5">
                  y = {pt.y}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Academic Analysis Results Card ── */}
      {analysisResult && (
        <div
          className="rounded-3xl bg-gradient-to-br from-card via-card to-teal-500/5 border-2 border-teal-500/30 p-6 md:p-8 space-y-5 text-right animate-in fade-in slide-in-from-bottom-3 duration-300"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="flex items-center justify-between border-b border-teal-500/20 pb-4">
            <button
              onClick={() => copyToClipboard(JSON.stringify(analysisResult, null, 2), "analysis")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-secondary text-xs font-bold text-foreground hover:bg-secondary/80 transition"
            >
              {copied === "analysis" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>کۆپیکرنا ڕاپۆرتێ</span>
            </button>

            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              شیکاریا زانستی و تایبەتمەندیێن نەخشەی (Academic Analysis)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {analysisResult.domain && (
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground block">دۆمەین (Domain)</span>
                <span className="text-sm font-extrabold text-foreground font-mono dir-ltr block">
                  {analysisResult.domain}
                </span>
              </div>
            )}

            {analysisResult.range && (
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground block">مەودا (Range)</span>
                <span className="text-sm font-extrabold text-foreground font-mono dir-ltr block">
                  {analysisResult.range}
                </span>
              </div>
            )}

            {analysisResult.y_intercept && (
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground block">بڕین دگەل تەوەڕێ Y</span>
                <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400 font-mono dir-ltr block">
                  {analysisResult.y_intercept}
                </span>
              </div>
            )}

            {analysisResult.x_intercepts && (
              <div className="p-4 rounded-2xl bg-secondary/40 border border-border/80 space-y-1">
                <span className="text-[11px] font-bold text-muted-foreground block">ڕەگ / بڕین دگەل تەوەڕێ X</span>
                <span className="text-sm font-extrabold text-teal-600 dark:text-teal-400 font-mono dir-ltr block">
                  {analysisResult.x_intercepts}
                </span>
              </div>
            )}
          </div>

          {Array.isArray(analysisResult.features) && analysisResult.features.length > 0 && (
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-2">
              <span className="text-xs font-extrabold text-foreground block">خالێن سەرەکی و تایبەتمەندی:</span>
              <ul className="list-disc list-inside space-y-1 text-xs text-foreground/90 leading-relaxed">
                {analysisResult.features.map((feat: string, i: number) => (
                  <li key={i}>{feat}</li>
                ))}
              </ul>
            </div>
          )}

          {analysisResult.explanation && (
            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-foreground leading-relaxed">
              <span className="font-bold text-teal-600 dark:text-teal-400 block mb-1">ڕوونکرنەڤەیا فێرکاریێ:</span>
              <p>{analysisResult.explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
