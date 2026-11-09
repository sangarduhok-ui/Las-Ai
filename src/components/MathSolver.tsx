import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  Loader2,
  Upload,
  X,
  Copy,
  Check,
  Calculator,
  BookOpen,
  HelpCircle,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  LineChart,
  FileText,
  RotateCcw,
  Zap,
  Atom,
  FlaskConical,
  Compass,
  PieChart,
  Layers,
  ArrowRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathSolverProps {
  onOpenGrapher?: (equation?: string) => void;
  onOpenWord?: (mathText?: string) => void;
}

interface StepItem {
  title: string;
  explanation: string;
  mathFormula?: string;
  result?: string;
}

interface SolveResult {
  finalAnswer: string;
  steps: StepItem[];
  formulasUsed: string[];
  latexFormula?: string;
  graphableEq?: string;
  rawText: string;
}

const TOPICS = [
  { id: "all", name: "هەمی بابەت", icon: Calculator, color: "text-blue-500" },
  { id: "algebra", name: "جەبر و هاوکێشە", icon: PieChart, color: "text-emerald-500" },
  { id: "calculus", name: "کالکولس و تەواوکاری", icon: Zap, color: "text-purple-500" },
  { id: "trig", name: "سێگۆشەزانی", icon: Compass, color: "text-amber-500" },
  { id: "geometry", name: "ئەندازە و پێڤانە", icon: Layers, color: "text-cyan-500" },
  { id: "physics", name: "فیزیا و یاسا", icon: Atom, color: "text-rose-500" },
  { id: "chemistry", name: "کیمیا و مۆلار", icon: FlaskConical, color: "text-indigo-500" },
];

const PRESETS: Record<string, { title: string; prompt: string; preview: string }[]> = {
  algebra: [
    { title: "هاوکێشەیا دووجا (Quadratic)", prompt: "شیکاریا هاوکێشەیا دووجا بکە: 2x^2 - 5x + 2 = 0", preview: "2x^2 - 5x + 2 = 0" },
    { title: "سیستەمێ دوو هاوکێشەیان", prompt: "شیکاریا سیستەمێ هاوکێشەیان بکە:\n2x + 3y = 12\nx - y = 1", preview: "2x + 3y = 12, x - y = 1" },
    { title: "شیکارکرنا فرەجیاوازیێ (Factoring)", prompt: "تەجزیئە و فاکتۆرایزی بکە: x^3 - 8", preview: "x^3 - 8" },
    { title: "هاوکێشەیا توانی (Exponential)", prompt: "هاوکێشەیا توانی شیکار بکە: 3^(2x-1) = 27", preview: "3^{2x-1} = 27" },
  ],
  calculus: [
    { title: "داتاشراوێ نەخشەی (Derivative)", prompt: "داتاشراوێ ئێکێ ببینە: f(x) = 3x^4 - 5sin(x) + e^(2x)", preview: "f(x) = 3x^4 - 5\\sin(x) + e^{2x}" },
    { title: "تەواوکارییا دیاریکری (Definite Integral)", prompt: "تەواوکاریێ بژمێرە: ∫ (3x^2 + 4x - 5) dx ژ 0 هەتا 2", preview: "\\int_0^2 (3x^2 + 4x - 5)\\,dx" },
    { title: "تەواوکارییا نەدیاریکری (Indefinite)", prompt: "تەواوکاریێ بکە: ∫ x * e^(x^2) dx", preview: "\\int x e^{x^2}\\,dx" },
    { title: "سنوورێن نەخشەیان (Limits)", prompt: "سنوورێ نەخشەیی بژمێرە: lim (x -> 0) [ sin(3x) / x ]", preview: "\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}" },
  ],
  trig: [
    { title: "هاوکێشەیا سێگۆشەزانیێ", prompt: "هاوکێشەیا سێگۆشەزانیێ شیکار بکە: 2sin(x) - 1 = 0 بۆ مەودایێ [0, 2π]", preview: "2\\sin(x) - 1 = 0" },
    { title: "سەلماندنا ناسنامەیێ (Identity)", prompt: "بسەلمینە کو: sin^2(x) + cos^2(x) = 1 دگەل ڕوونکرنەڤەیێ", preview: "\\sin^2(x) + \\cos^2(x) = 1" },
    { title: "گۆشەیا دووجارکی (Double Angle)", prompt: "هاوکێشەیا cos(2x) بنڤیسە ل دویڤ sin و cos و شیکار بکە", preview: "\\cos(2x) = \\cos^2(x) - \\sin^2(x)" },
  ],
  geometry: [
    { title: "ڕووبەر و قەبارێ لوولەکێ (Cylinder)", prompt: "ڕووبەر و قەبارێ لوولەکەکێ بژمێرە کو نیڤەتیرەیا وێ r=4cm و بلندی h=10cm بیت", preview: "r = 4\\text{ cm}, h = 10\\text{ cm}" },
    { title: "یاسایا پایساگۆرس (Pythagorean)", prompt: "د سێگۆشەیەکا گۆشە وەستاو دا a=6 و b=8 ژێیێ c بژمێرە", preview: "c^2 = a^2 + b^2" },
    { title: "ڕووبەرێ تۆپ و گۆیێ (Sphere)", prompt: "قەبارە و ڕووبەرێ گۆیەکێ ببینە کو تیرەیا وێ d=12cm بیت", preview: "V = \\frac{4}{3}\\pi r^3" },
  ],
  physics: [
    { title: "یاسایا دووێ یا نیوتنی (F = ma)", prompt: "هێزا F بژمێرە ئەگەر بارستە m=15kg و تاودان a=4.5m/s^2 بیت", preview: "F = m \\cdot a" },
    { title: "لڤین و لەزاتی (Kinematics)", prompt: "مەودایێ بڕیی s بژمێرە: s = v0*t + 0.5*a*t^2 دەمێ v0=10m/s, a=2m/s^2, t=5s", preview: "s = v_0 t + \\frac{1}{2}at^2" },
    { title: "یاسایا ئۆمی (Ohm's Law)", prompt: "بڕێ بەرگریێ R بژمێرە دەمێ ڤۆڵتیە V=220V و تەزوو I=5A بیت", preview: "V = I \\cdot R" },
    { title: "توانا و وزەیا کینێتیک (KE)", prompt: "وزەیا کینێتیک (KE) بژمێرە بۆ تەنەکێ ب بارستەیا 800kg و لەزاتیا 20m/s", preview: "KE = \\frac{1}{2}mv^2" },
  ],
  chemistry: [
    { title: "هاوسەنگکرنا هاوکێشەیا کیمیایی", prompt: "ئەڤێ هاوکێشەیا کیمیایی هاوسەنگ بکە: Fe + O2 -> Fe2O3", preview: "\\text{Fe} + \\text{O}_2 \\to \\text{Fe}_2\\text{O}_3" },
    { title: "بارستەیا مۆلاری (Molar Mass)", prompt: "بارستەیا مۆلاری بۆ ئاوێتەیا H2SO4 (ترشێ گۆگردی) بژمێرە", preview: "\\text{H}_2\\text{SO}_4" },
    { title: "هژمارتنا ئاستێ ترشاتیێ (pH)", prompt: "ڕێژەیا pH بژمێرە بۆ گیراوەیەکێ کو خەستییا هایدرۆجینی [H+] = 1.0 * 10^-4 M بیت", preview: "\\text{pH} = -\\log[\\text{H}^+]" },
  ],
};

const MATH_SYMBOLS = [
  { label: "x²", insert: "^2" },
  { label: "x³", insert: "^3" },
  { label: "xⁿ", insert: "^" },
  { label: "√x", insert: "sqrt(" },
  { label: "∛x", insert: "cbrt(" },
  { label: "π", insert: "pi" },
  { label: "∞", insert: "infinity" },
  { label: "±", insert: "±" },
  { label: "∓", insert: "∓" },
  { label: "×", insert: " * " },
  { label: "÷", insert: " / " },
  { label: "·", insert: " * " },
  { label: "≠", insert: "≠" },
  { label: "≤", insert: "≤" },
  { label: "≥", insert: "≥" },
  { label: "≈", insert: "≈" },
  { label: "≡", insert: "≡" },
  { label: "∝", insert: "∝" },
  { label: "°", insert: "°" },
  { label: "!", insert: "!" },
  { label: "→", insert: " -> " },
  { label: "⇒", insert: " => " },
  { label: "⇔", insert: " <=> " },
  { label: "∠", insert: "angle " },
  { label: "⊥", insert: "perpendicular to " },
  { label: "∥", insert: "parallel to " },
  { label: "∫", insert: "integral of " },
  { label: "∫_a^b", insert: "integral of ... from a to b" },
  { label: "∑", insert: "sum of " },
  { label: "lim", insert: "lim (x -> 0) " },
  { label: "d/dx", insert: "d/dx (" },
  { label: "log", insert: "log(" },
  { label: "ln", insert: "ln(" },
  { label: "sin", insert: "sin(" },
  { label: "cos", insert: "cos(" },
  { label: "tan", insert: "tan(" },
  { label: "θ", insert: "theta" },
  { label: "α", insert: "alpha" },
  { label: "β", insert: "beta" },
  { label: "½", insert: "(1/2)" },
  { label: "|x|", insert: "abs(" },
];

export function MathSolver({ onOpenGrapher, onOpenWord }: MathSolverProps) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [input, setInput] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<SolveResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showSymbols, setShowSymbols] = useState(true);
  const [alignment, setAlignment] = useState<"left" | "center" | "right" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Active alignment: if user clicked an icon use that, otherwise:
  // - If empty: default to right so the Kurdish placeholder starts on the right!
  // - If has content: if starts with Kurdish/Arabic -> right, otherwise (math/functions) -> left!
  const currentAlign: "left" | "center" | "right" = alignment
    ? alignment
    : !input.trim()
    ? "right"
    : /^[\u0600-\u06FF]/.test(input.trim())
    ? "right"
    : "left";

  const fileToBase64 = (f: File) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res((r.result as string).split(",")[1] || "");
      r.onerror = rej;
      r.readAsDataURL(f);
    });

  const insertSymbol = (sym: string) => {
    if (alignment === "right") {
      setAlignment("left");
    }
    if (!textareaRef.current) {
      setInput((prev) => prev + sym);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const next = input.substring(0, start) + sym + input.substring(end);
    setInput(next);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + sym.length, start + sym.length);
    }, 10);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const renderMathKaTeX = (mathStr: string) => {
    try {
      let clean = mathStr
        .replace(/\\\[|\\\]/g, "")
        .replace(/\$\$/g, "")
        .replace(/\$/g, "")
        .trim();

      // Normalize plain-text arrows to LaTeX \to so KaTeX formats correctly
      clean = clean.replace(/->/g, "\\to ");

      const html = katex.renderToString(clean, {
        throwOnError: false,
        displayMode: true,
      });
      return (
        <div
          dir="ltr"
          dangerouslySetInnerHTML={{ __html: html }}
          className="overflow-x-auto py-1 math-formula-box text-center font-sans select-all"
          style={{ direction: "ltr", unicodeBidi: "isolate" }}
        />
      );
    } catch {
      return (
        <span
          dir="ltr"
          className="font-mono text-sm inline-block select-all math-formula-box"
          style={{ direction: "ltr", unicodeBidi: "isolate" }}
        >
          {mathStr}
        </span>
      );
    }
  };

  const parseSolution = (raw: string): SolveResult => {
    const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let finalAnswer = "";
    const steps: StepItem[] = [];
    const formulasUsed: string[] = [];
    let currentStep: Partial<StepItem> | null = null;

    // Search for final answer
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        line.includes("بەرسڤا دووماهیێ") ||
        line.includes("بەرسڤا دوماهیکێ") ||
        line.includes("بەرسڤ:") ||
        line.includes("وەڵامی کۆتایی") ||
        line.includes("ئەنجام:") ||
        line.includes("Final Answer:") ||
        line.includes("وەڵام:") ||
        line.includes("دەرئەنجام:")
      ) {
        finalAnswer = line.replace(/^[#*\-•\s]*(بەرسڤا دووماهیێ|بەرسڤا دوماهیکێ|بەرسڤ|وەڵامی کۆتایی|ئەنجام|Final Answer|وەڵام|دەرئەنجام)[:：]?\s*/i, "");
        if (!finalAnswer && i + 1 < lines.length) {
          finalAnswer = lines[i + 1];
        }
      }
    }

    const cleanStepTitle = (rawLine: string): string => {
      let cleaned = rawLine.trim();
      // Strip leading markdown formatting (e.g. ###, **, -, *, •)
      cleaned = cleaned.replace(/^[#*\-•\s]+/, "").replace(/[*_~`]+$/, "").trim();
      
      // Strip any variation of step prefix (پێنگاڤا, پێنگاڤێ, پێنگاڤ, هەنگاو, هەنگاوی, Step) with numbers
      cleaned = cleaned.replace(/^(?:پێنگاڤ[اەیێ]*|هەنگاو[اەیێ]*|Step)\s*[\d٠-٩]*\s*[:\.\-\)]*\s*/i, "");
      
      // Strip stray single letters or duplicate numbers like "ا 1:" or "1 1:" or "2 2:"
      cleaned = cleaned.replace(/^[اەیێ]?\s*[\d٠-٩]+[\s\.:\-\)]+/g, "");
      cleaned = cleaned.replace(/^(?:پێنگاڤ[اەیێ]*|هەنگاو[اەیێ]*|Step)\s*[\d٠-٩]*\s*[:\.\-\)]*\s*/i, "");
      cleaned = cleaned.replace(/^[\d٠-٩]+[\s\.:\-\)]+/, "");
      cleaned = cleaned.replace(/^[:\.\-\)]+\s*/, "");
      
      return cleaned.trim() || "شیکاری";
    };

    const isStepHeader = (line: string): boolean => {
      const trimmed = line.replace(/^[#*\-•\s]+/, "");
      return /^(?:پێنگاڤ[اەیێ]*|هەنگاو[اەیێ]*|Step|[\d٠-٩]+[\.\-\)])/i.test(trimmed);
    };

    // Parse step by step numbers
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isHeader = isStepHeader(line);
      
      if (
        isHeader &&
        !line.includes("وەڵامی کۆتایی") &&
        !line.includes("بەرسڤا دووماهیێ") &&
        !line.includes("بەرسڤا دوماهیکێ") &&
        !line.includes("بەرسڤ:")
      ) {
        if (currentStep && currentStep.explanation) {
          steps.push({
            title: currentStep.title || `پێنگاڤا ${steps.length + 1}`,
            explanation: currentStep.explanation,
            mathFormula: currentStep.mathFormula,
          });
        }
        const titleDesc = cleanStepTitle(line);
        currentStep = {
          title: `پێنگاڤا ${steps.length + 1}: ${titleDesc}`,
          explanation: "",
        };
      } else if (currentStep) {
        if (line.includes("=") || line.includes("∫") || line.includes("->") || line.includes("^") || line.includes("\\")) {
          currentStep.mathFormula = (currentStep.mathFormula ? currentStep.mathFormula + "\n" : "") + line;
        } else {
          currentStep.explanation = (currentStep.explanation ? currentStep.explanation + "\n" : "") + line;
        }
      }
    }

    if (currentStep && currentStep.explanation) {
      steps.push({
        title: currentStep.title || `پێنگاڤا ${steps.length + 1}`,
        explanation: currentStep.explanation,
        mathFormula: currentStep.mathFormula,
      });
    }

    // If structured parsing didn't find steps, make chunks
    if (steps.length === 0) {
      const paragraphs = raw.split(/\n\n+/).filter((p) => p.trim().length > 0);
      paragraphs.forEach((para, idx) => {
        if (!para.includes("وەڵامی کۆتایی") && !para.includes("بەرسڤا دووماهیێ")) {
          steps.push({
            title: `پێنگاڤا ${idx + 1}`,
            explanation: para,
          });
        }
      });
    }

    if (!finalAnswer && steps.length > 0) {
      const last = steps[steps.length - 1];
      finalAnswer = last.explanation.slice(-120);
    }

    // Extract potential graphable equation
    let graphableEq = "";
    const eqMatch = input.match(/[yf]\s*\([^)]*\)\s*=\s*([^,\n]+)|y\s*=\s*([^,\n]+)/i);
    if (eqMatch) {
      graphableEq = eqMatch[0];
    }

    return {
      finalAnswer: finalAnswer || "سەحکە پێنگاڤان بۆ هویرکاریێن تمام.",
      steps,
      formulasUsed,
      rawText: raw,
      graphableEq,
    };
  };

  const runSolve = async () => {
    if (!input.trim() && !file) return;
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: Record<string, unknown> = {
        tool: "solver",
        input: `تکایە ڤێ پرسیارێ ب هووری، پێنگاڤ ب پێنگاڤ و ب ڕوونی شیکار بکە ب زمانێ کوردی (بادینی).
گرنگ: هەمی هاوکێشە و ڕێسایێن بیرکاری (Equations & Formulas) ب فۆرماتێ ستانداردێ LaTeX یان نڤیسینا چەپ-بۆ-ڕاست (LTR) بنڤیسە دا کو بەروڤاژی نەبن.
هەر پێنگاڤەکێ ب ناڤونیشان و یاسایا بکاراهاتی بنڤیسە. ل دووماهیێ بنڤیسە "بەرسڤا دووماهیێ:" دگەل بەرسڤێ:\n\n${input}`,
      };

      if (file) {
        payload.fileBase64 = await fileToBase64(file);
        payload.mimeType = file.type || "application/octet-stream";
      }

      const res = await fetch("/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "شیکارکرن سەرکەفتی نەبوو.");

      const parsed = parseSolution(data.output || "");
      setResult(parsed);
      setExpandedStep(0); // open first step by default
    } catch (e) {
      setError(e instanceof Error ? e.message : "شاشیەک چێبوو");
    } finally {
      setLoading(false);
    }
  };

  const activePresets = selectedTopic === "all"
    ? Object.values(PRESETS).flat().slice(0, 8)
    : PRESETS[selectedTopic] || [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-foreground font-sans">
      {/* ── Top Header Banner ── */}
      <div
        className="rounded-2xl bg-gradient-to-r from-emerald-600/15 via-teal-600/10 to-cyan-600/15 border border-emerald-500/20 px-4 py-3 sm:px-5 sm:py-3.5 backdrop-blur-xl relative overflow-hidden"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                چارەسەری پێنگاڤ ب پێنگاڤ
              </h2>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 whitespace-nowrap">
                AI Math Engine
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              شیکارکرنا هاوکێشەیێن بیرکاری و زانستی ب پێنگاڤان.
            </p>
          </div>
        </div>
      </div>

      {/* ── Topic Filter Pills ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {TOPICS.map((topic) => {
          const Icon = topic.icon;
          const isActive = selectedTopic === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs shadow-primary/20 scale-[1.01]"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/70"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary-foreground" : topic.color}`} />
              <span>{topic.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Quick Example Presets ── */}
      {activePresets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {activePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(preset.prompt);
                setTimeout(() => textareaRef.current?.focus(), 50);
              }}
              className="text-right p-2 sm:p-2.5 rounded-xl bg-card/60 hover:bg-card border border-border/80 hover:border-emerald-500/40 transition-all group flex flex-col justify-between gap-1 shadow-2xs hover:shadow-xs min-w-0"
              title={preset.title}
            >
              <span className="text-[11px] font-bold text-foreground group-hover:text-emerald-500 truncate transition block w-full">
                {preset.title}
              </span>
              <span
                className="text-[10px] font-mono text-muted-foreground bg-secondary/70 px-1.5 py-0.5 rounded self-start truncate max-w-full select-all"
                dir="ltr"
                style={{ direction: "ltr", unicodeBidi: "isolate" }}
              >
                {preset.preview}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Main Input & Keyboard Box ── */}
      <div
        className="rounded-3xl bg-card border border-border p-5 md:p-7 space-y-4"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        {/* Math Keyboard Toolbar */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar max-w-[80%]">
            {MATH_SYMBOLS.slice(0, showSymbols ? MATH_SYMBOLS.length : 12).map((sym, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => insertSymbol(sym.insert)}
                className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground text-xs font-mono font-bold transition shrink-0 active:scale-95"
                title={sym.label}
              >
                {sym.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 3 Alignment Icons: Left, Center, Right */}
            <div className="flex items-center rounded-lg border border-border/80 bg-secondary/50 p-0.5 gap-0.5" dir="ltr">
              <button
                type="button"
                onClick={() => setAlignment("left")}
                className={`p-1 rounded-md transition ${
                  currentAlign === "left"
                    ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="لایێ چەپێ (Left Align - LTR)"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAlignment("center")}
                className={`p-1 rounded-md transition ${
                  currentAlign === "center"
                    ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="سەنتەر (Center Align)"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAlignment("right")}
                className={`p-1 rounded-md transition ${
                  currentAlign === "right"
                    ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="لایێ ڕاستێ (Right Align - RTL)"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSymbols(!showSymbols)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0"
            >
              {showSymbols ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {showSymbols ? "کێمتر" : "هەمی هێما"}
            </button>
          </div>
        </div>

        {/* Textarea Input */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="هاوکێشە یان پسیارا خو بنڤیسە..."
            className={`w-full min-h-[120px] rounded-2xl border border-border bg-background/50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y leading-relaxed transition-all ${
              currentAlign === "center"
                ? "text-center font-mono px-11"
                : currentAlign === "right"
                ? "text-right font-sans pl-11 pr-4"
                : "text-left font-mono pl-4 pr-11"
            }`}
            dir={currentAlign === "right" ? "rtl" : "ltr"}
            style={{ direction: currentAlign === "right" ? "rtl" : "ltr", textAlign: currentAlign }}
          />

          {input && (
            <button
              onClick={() => {
                setInput("");
                textareaRef.current?.focus();
              }}
              className={`absolute ${currentAlign === "right" ? "left-3" : "right-3"} top-3 p-1.5 rounded-lg bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground transition z-10`}
              title="پاقژکرن"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* File / Image Upload & Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="w-full sm:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            {!file ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border hover:border-emerald-500/60 bg-secondary/30 hover:bg-secondary/60 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
              >
                <Upload className="w-4 h-4 text-emerald-500" />
                <span>بارکرنا وێنەیێ پرسیارێ (OCR Photo)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary text-xs">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">وێنە هاتە بارکرن:</span>
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-muted-foreground hover:text-destructive p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={runSolve}
            disabled={loading || (!input.trim() && !file)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:opacity-95 active:scale-98 transition disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? "د شیکارکرنێدا..." : "شیکار بکە (Solve)"}</span>
          </button>
        </div>

        {error && (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 text-right">
            {error}
          </div>
        )}
      </div>

      {/* ── Results Experience ── */}
      {result && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Final Answer Callout Card */}
          <div
            className="rounded-3xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-card border-2 border-emerald-500/40 p-6 md:p-7 relative overflow-hidden"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="flex items-center justify-between mb-3 border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(result.finalAnswer, "final")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-emerald-500/30 hover:bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition"
                >
                  {copied === "final" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === "final" ? "کۆپی بوو" : "کۆپیکرنا بەرسڤێ"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500 text-white shadow-xs">
                  بەرسڤا دووماهییێ (Final Answer)
                </span>
              </div>
            </div>

            <div className="text-right text-lg md:text-xl font-extrabold text-foreground leading-relaxed">
              {result.finalAnswer.includes("\\") || result.finalAnswer.includes("=") ? (
                <div 
                  dir="ltr" 
                  className="math-formula-box text-center py-1 overflow-x-auto"
                  style={{ direction: "ltr", unicodeBidi: "isolate" }}
                >
                  {renderMathKaTeX(result.finalAnswer)}
                </div>
              ) : (
                <span dir="auto">{result.finalAnswer}</span>
              )}
            </div>
          </div>

          {/* Step-by-Step Breakdown Accordion */}
          <div
            className="rounded-3xl bg-card border border-border p-6 md:p-7 space-y-4"
            style={{ boxShadow: "var(--shadow-elegant)" }}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(result.rawText, "full")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-semibold transition"
                >
                  {copied === "full" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>کۆپیکرنا هەمی شیکاریێ</span>
                </button>
              </div>

              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                پێنگاڤێن شیکارکرنێ (Step-by-Step Solution)
              </h3>
            </div>

            <div className="space-y-3">
              {result.steps.map((step, idx) => {
                const isExpanded = expandedStep === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-border/80 bg-background/50 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedStep(isExpanded ? null : idx)}
                      className="w-full flex items-center justify-between p-4 text-right hover:bg-secondary/40 transition"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-foreground">{step.title}</span>
                        <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center justify-center border border-emerald-500/20">
                          {idx + 1}
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-1 border-t border-border/60 text-right space-y-3 bg-card/40">
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                          {step.explanation}
                        </p>

                        {step.mathFormula && (
                          <div
                            dir="ltr"
                            className="p-3 rounded-xl bg-secondary/60 border border-border/80 font-mono text-sm text-center math-formula-box overflow-x-auto"
                            style={{ direction: "ltr", unicodeBidi: "isolate" }}
                          >
                            {renderMathKaTeX(step.mathFormula)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
