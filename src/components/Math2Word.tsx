import React, { useState, useRef } from "react";
import {
  Sparkles,
  Loader2,
  Upload,
  X,
  Download,
  Copy,
  Check,
  FileCode,
  Layers,
  HelpCircle,
  BookOpen,
  Info,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sigma,
  Zap,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";



const CATEGORIES = [
  { id: "all", name: "هەمی" },
  { id: "basic", name: "کەرت و توانا" },
  { id: "calculus", name: "کالکولس و داتاشراو" },
  { id: "trig", name: "سێگۆشەزانی و لۆگ" },
  { id: "matrix", name: "ماتریس و سیستم" },
  { id: "greek", name: "پیتێن یۆنانی" },
  { id: "sets", name: "کۆمەڵە و هێما" },
];

const SYMBOL_BUTTONS = [
  // ── Basic & Fractions ──
  { label: "x/y", insert: "\\frac{a}{b}", category: "basic", title: "کەرت (Fraction)" },
  { label: "1/x", insert: "\\frac{1}{x}", category: "basic", title: "پێچەوانە (1/x)" },
  { label: "xⁿ", insert: "x^{n}", category: "basic", title: "توانا (Power)" },
  { label: "x²", insert: "x^{2}", category: "basic", title: "دووجا (Square)" },
  { label: "x³", insert: "x^{3}", category: "basic", title: "سێجا (Cube)" },
  { label: "xₙ", insert: "x_{i}", category: "basic", title: "ژێرنڤیس (Subscript)" },
  { label: "xᵢⁿ", insert: "x_{i}^{n}", category: "basic", title: "ژێرنڤیس و توانا" },
  { label: "√x", insert: "\\sqrt{x}", category: "basic", title: "ڕەگێ دووجا (Square Root)" },
  { label: "∛x", insert: "\\sqrt[3]{x}", category: "basic", title: "ڕەگێ سێجا (Cube Root)" },
  { label: "ⁿ√x", insert: "\\sqrt[n]{x}", category: "basic", title: "ڕەگێ n-ەم (N-th Root)" },
  { label: "|x|", insert: "|x|", category: "basic", title: "بهایێ ڕووت (Absolute Value)" },
  { label: "!", insert: "n!", category: "basic", title: "فاکتۆریال (Factorial)" },
  { label: "%", insert: "\\% ", category: "basic", title: "ژ سەدێ (Percentage)" },
  { label: "( )", insert: "\\left( x \\right)", category: "basic", title: "کەوانە (Parentheses)" },
  { label: "[ ]", insert: "\\left[ x \\right]", category: "basic", title: "کەوانەیا چوارگۆشە (Brackets)" },
  { label: "{ }", insert: "\\left\\{ x \\right\\}", category: "basic", title: "کەوانەیا کۆمەڵێ (Braces)" },
  { label: "⟨ ⟩", insert: "\\langle x \\rangle", category: "basic", title: "کەوانەیا تیژ (Angle Brackets)" },
  { label: "+", insert: "+", category: "basic", title: "کۆمکرن (Plus)" },
  { label: "-", insert: "-", category: "basic", title: "کەمکرن (Minus)" },
  { label: "±", insert: "\\pm ", category: "basic", title: "کۆم یان کەم (Plus-Minus)" },
  { label: "∓", insert: "\\mp ", category: "basic", title: "کەم یان کۆم (Minus-Plus)" },
  { label: "×", insert: "\\times ", category: "basic", title: "لێکدان (Times)" },
  { label: "·", insert: "\\cdot ", category: "basic", title: "خاڵا لێکدانێ (Dot Product)" },
  { label: "÷", insert: "\\div ", category: "basic", title: "پارڤەکرن (Division)" },
  { label: "=", insert: "=", category: "basic", title: "یەکسان (Equals)" },
  { label: "≠", insert: "\\neq ", category: "basic", title: "یەکسان نینە (Not Equal)" },
  { label: "<", insert: "<", category: "basic", title: "بچووکتر (Less Than)" },
  { label: ">", insert: ">", category: "basic", title: "مەزنتر (Greater Than)" },
  { label: "≤", insert: "\\leq ", category: "basic", title: "بچووکتر یان یەکسان (Less or Equal)" },
  { label: "≥", insert: "\\geq ", category: "basic", title: "مەزنتر یان یەکسان (Greater or Equal)" },
  { label: "≪", insert: "\\ll ", category: "basic", title: "گەلەک بچووکتر (Much Less)" },
  { label: "≫", insert: "\\gg ", category: "basic", title: "گەلەک مەزنتر (Much Greater)" },
  { label: "≈", insert: "\\approx ", category: "basic", title: "نێزیکەیی (Approximately)" },
  { label: "≃", insert: "\\simeq ", category: "basic", title: "نزیکەی یەکسان (Asymptotically Equal)" },
  { label: "≅", insert: "\\cong ", category: "basic", title: "هاوسەنگ (Congruent)" },
  { label: "∼", insert: "\\sim ", category: "basic", title: "هاوشێوە (Similar)" },
  { label: "≡", insert: "\\equiv ", category: "basic", title: "هاوتا (Identical / Equivalent)" },
  { label: "≔", insert: ":= ", category: "basic", title: "پێناسەکرییە وەکو (Defined As)" },
  { label: "∝", insert: "\\propto ", category: "basic", title: "ڕێژەیی (Proportional To)" },
  { label: "∞", insert: "\\infty ", category: "basic", title: "بێدووماهیک (Infinity)" },
  { label: "°", insert: "^{\\circ}", category: "basic", title: "پلە (Degree)" },
  { label: "∠", insert: "\\angle ", category: "basic", title: "گۆشە (Angle)" },
  { label: "△", insert: "\\triangle ", category: "basic", title: "سێگۆشە (Triangle)" },
  { label: "⊥", insert: "\\perp ", category: "basic", title: "ستوونی (Perpendicular)" },
  { label: "∥", insert: "\\parallel ", category: "basic", title: "تەریب (Parallel)" },
  { label: "∦", insert: "\\nparallel ", category: "basic", title: "نەتەریب (Not Parallel)" },
  { label: "∴", insert: "\\therefore ", category: "basic", title: "لەوڕا / کەواتە (Therefore)" },
  { label: "∵", insert: "\\because ", category: "basic", title: "ژبەرکو / چونکە (Because)" },
  { label: "→", insert: "\\to ", category: "basic", title: "تیر بۆ ڕاستێ (To / Arrow)" },
  { label: "←", insert: "\\leftarrow ", category: "basic", title: "تیر بۆ چەپێ (Left Arrow)" },
  { label: "↔", insert: "\\leftrightarrow ", category: "basic", title: "تیر بۆ هەردوو لا (Left-Right Arrow)" },
  { label: "⇒", insert: "\\Rightarrow ", category: "basic", title: "ئەنجام ددەت (Implies)" },
  { label: "⇐", insert: "\\Leftarrow ", category: "basic", title: "لێ دکەڤیت (Implied By)" },
  { label: "⇔", insert: "\\Leftrightarrow ", category: "basic", title: "دوولایەنە (If and only if)" },
  { label: "↦", insert: "\\mapsto ", category: "basic", title: "نەخشاندن (Maps To)" },
  { label: "↑", insert: "\\uparrow ", category: "basic", title: "تیر بەرەڤ سەر (Up Arrow)" },
  { label: "↓", insert: "\\downarrow ", category: "basic", title: "تیر بەرەڤ خوار (Down Arrow)" },

  // ── Calculus & Integrals ──
  { label: "∫", insert: "\\int f(x)\\,dx", category: "calculus", title: "تەواوکاری (Integral)" },
  { label: "∫ₐᵇ", insert: "\\int_{a}^{b} f(x)\\,dx", category: "calculus", title: "تەواوکاریا دیاریکری (Definite Integral)" },
  { label: "∬", insert: "\\iint", category: "calculus", title: "تەواوکاریا دووانی (Double Integral)" },
  { label: "∮", insert: "\\oint", category: "calculus", title: "تەواوکاریا دەورکراو (Contour Integral)" },
  { label: "d/dx", insert: "\\frac{d}{dx}(f(x))", category: "calculus", title: "داتاشراو (Derivative)" },
  { label: "dy/dx", insert: "\\frac{dy}{dx}", category: "calculus", title: "داتاشراوی (dy/dx)" },
  { label: "d²y/dx²", insert: "\\frac{d^2 y}{dx^2}", category: "calculus", title: "داتاشراوێ دووێ" },
  { label: "∂/∂x", insert: "\\frac{\\partial y}{\\partial x}", category: "calculus", title: "داتاشراوێ بەشی (Partial Derivative)" },
  { label: "∂²y/∂x²", insert: "\\frac{\\partial^2 y}{\\partial x^2}", category: "calculus", title: "داتاشراوێ بەشی یێ دووێ" },
  { label: "lim", insert: "\\lim_{x \\to 0}", category: "calculus", title: "سنوور (Limit)" },
  { label: "lim(x→∞)", insert: "\\lim_{x \\to \\infty}", category: "calculus", title: "سنوور بەرەڤ بێدووماهیک" },
  { label: "∑", insert: "\\sum_{i=1}^{n} x_i", category: "calculus", title: "کۆمکرن (Summation)" },
  { label: "∏", insert: "\\prod_{i=1}^{n} x_i", category: "calculus", title: "لێکدان (Product)" },
  { label: "∇", insert: "\\nabla ", category: "calculus", title: "گڕادیانت / ناپلا (Nabla / Gradient)" },
  { label: "f'(x)", insert: "f'(x)", category: "calculus", title: "داتاشراوێ ئێکێ" },
  { label: "f''(x)", insert: "f''(x)", category: "calculus", title: "داتاشراوێ دووێ" },

  // ── Trigonometry & Logarithms ──
  { label: "sin", insert: "\\sin(x)", category: "trig", title: "ساین (Sine)" },
  { label: "cos", insert: "\\cos(x)", category: "trig", title: "کۆساین (Cosine)" },
  { label: "tan", insert: "\\tan(x)", category: "trig", title: "تانجێنت (Tangent)" },
  { label: "cot", insert: "\\cot(x)", category: "trig", title: "کۆتانجێنت (Cotangent)" },
  { label: "sec", insert: "\\sec(x)", category: "trig", title: "سیکانت (Secant)" },
  { label: "csc", insert: "\\csc(x)", category: "trig", title: "کۆسیکانت (Cosecant)" },
  { label: "sin⁻¹", insert: "\\arcsin(x)", category: "trig", title: "پێچەوانەیا ساین (Arcsin)" },
  { label: "cos⁻¹", insert: "\\arccos(x)", category: "trig", title: "پێچەوانەیا کۆساین (Arccos)" },
  { label: "tan⁻¹", insert: "\\arctan(x)", category: "trig", title: "پێچەوانەیا تانجێنت (Arctan)" },
  { label: "sinh", insert: "\\sinh(x)", category: "trig", title: "هایپەربۆلیک ساین" },
  { label: "cosh", insert: "\\cosh(x)", category: "trig", title: "هایپەربۆلیک کۆساین" },
  { label: "tanh", insert: "\\tanh(x)", category: "trig", title: "هایپەربۆلیک تانجێنت" },
  { label: "log", insert: "\\log(x)", category: "trig", title: "لۆگاریتم" },
  { label: "log_b", insert: "\\log_{b}(x)", category: "trig", title: "لۆگاریتم ب بنچینەیێ b" },
  { label: "ln", insert: "\\ln(x)", category: "trig", title: "لۆگاریتما سروشتی (Natural Log)" },
  { label: "eˣ", insert: "e^{x}", category: "trig", title: "فانکشنا نمایی (Exponential)" },

  // ── Matrices & Systems ──
  { label: "[2×2]", insert: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", category: "matrix", title: "ماتریس 2x2" },
  { label: "[3×3]", insert: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}", category: "matrix", title: "ماتریس 3x3" },
  { label: "|A|", insert: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}", category: "matrix", title: "دیتێرمینانت (Determinant)" },
  { label: "⎧x,y", insert: "\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}", category: "matrix", title: "سیستەمێ هاوکێشەیان (System of Equations)" },
  { label: "v⃗", insert: "\\vec{v}", category: "matrix", title: "ڤێکتەر (Vector)" },
  { label: "x̄", insert: "\\bar{x}", category: "matrix", title: "تێکڕا (Mean / Average)" },
  { label: "x̂", insert: "\\hat{x}", category: "matrix", title: "یەکە ڤێکتەر (Unit Vector)" },
  { label: "ẋ", insert: "\\dot{x}", category: "matrix", title: "تاودان / خێرایی (Time Derivative)" },

  // ── Greek Letters ──
  { label: "π", insert: "\\pi ", category: "greek", title: "پای (Pi)" },
  { label: "θ", insert: "\\theta ", category: "greek", title: "تێتا (Theta)" },
  { label: "α", insert: "\\alpha ", category: "greek", title: "ئەلفا (Alpha)" },
  { label: "β", insert: "\\beta ", category: "greek", title: "بێتا (Beta)" },
  { label: "γ", insert: "\\gamma ", category: "greek", title: "گاما (Gamma)" },
  { label: "Δ", insert: "\\Delta ", category: "greek", title: "دێلتا مەزن (Capital Delta)" },
  { label: "δ", insert: "\\delta ", category: "greek", title: "دێلتا (Delta)" },
  { label: "ε", insert: "\\epsilon ", category: "greek", title: "ئێپسیلۆن (Epsilon)" },
  { label: "λ", insert: "\\lambda ", category: "greek", title: "لامدا (Lambda)" },
  { label: "μ", insert: "\\mu ", category: "greek", title: "میو (Mu)" },
  { label: "σ", insert: "\\sigma ", category: "greek", title: "سیگما (Sigma)" },
  { label: "Σ", insert: "\\Sigma ", category: "greek", title: "سیگما مەزن (Capital Sigma)" },
  { label: "ω", insert: "\\omega ", category: "greek", title: "ئۆمێگا (Omega)" },
  { label: "Ω", insert: "\\Omega ", category: "greek", title: "ئۆم / ئۆمێگا مەزن (Ohm / Omega)" },
  { label: "ρ", insert: "\\rho ", category: "greek", title: "ڕۆ / چڕی (Rho)" },
  { label: "φ", insert: "\\phi ", category: "greek", title: "فای (Phi)" },
  { label: "ψ", insert: "\\psi ", category: "greek", title: "پسای (Psi)" },
  { label: "τ", insert: "\\tau ", category: "greek", title: "تاو (Tau)" },
  { label: "η", insert: "\\eta ", category: "greek", title: "ئێتا (Eta)" },

  // ── Sets & Logic ──
  { label: "∈", insert: "\\in ", category: "sets", title: "ئەندامە (Element of)" },
  { label: "∉", insert: "\\notin ", category: "sets", title: "ئەندام نینە (Not element of)" },
  { label: "⊂", insert: "\\subset ", category: "sets", title: "کۆمەڵا بەشەکی (Subset)" },
  { label: "⊄", insert: "\\not\\subset ", category: "sets", title: "کۆمەڵا بەشەکی نینە (Not Subset)" },
  { label: "⊆", insert: "\\subseteq ", category: "sets", title: "کۆمەڵا بەشەکی یان یەکسان" },
  { label: "⊇", insert: "\\supseteq ", category: "sets", title: "لەخۆگری یەکسان (Superset)" },
  { label: "∪", insert: "\\cup ", category: "sets", title: "یەکگرتن (Union)" },
  { label: "∩", insert: "\\cap ", category: "sets", title: "یەکتربڕین (Intersection)" },
  { label: "∖", insert: "\\setminus ", category: "sets", title: "جیاوازی کۆمەڵان (Difference)" },
  { label: "∅", insert: "\\emptyset ", category: "sets", title: "کۆمەلا بەتاڵ (Empty Set)" },
  { label: "∀", insert: "\\forall ", category: "sets", title: "بۆ هەموو (For all)" },
  { label: "∃", insert: "\\exists ", category: "sets", title: "هەیە (Exists)" },
  { label: "∄", insert: "\\nexists ", category: "sets", title: "بوون نینە (Does not exist)" },
  { label: "¬", insert: "\\neg ", category: "sets", title: "نەرێ / نەفی (NOT)" },
  { label: "∧", insert: "\\land ", category: "sets", title: "و (Logical AND)" },
  { label: "∨", insert: "\\lor ", category: "sets", title: "یان (Logical OR)" },
  { label: "⊕", insert: "\\oplus ", category: "sets", title: "Direct Sum / XOR" },
  { label: "⊗", insert: "\\otimes ", category: "sets", title: "Tensor Product" },
  { label: "ℝ", insert: "\\mathbb{R}", category: "sets", title: "ژمارەیێن ڕاستەقینە (Real Numbers)" },
  { label: "ℕ", insert: "\\mathbb{N}", category: "sets", title: "ژمارەیێن سروشتی (Natural Numbers)" },
  { label: "ℤ", insert: "\\mathbb{Z}", category: "sets", title: "ژمارەیێن تەواو (Integers)" },
  { label: "ℚ", insert: "\\mathbb{Q}", category: "sets", title: "ژمارەیێن ڕێژەیی (Rational Numbers)" },
  { label: "ℂ", insert: "\\mathbb{C}", category: "sets", title: "ژمارەیێن ئاوێتە (Complex Numbers)" },
];

export function Math2Word() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [alignment, setAlignment] = useState<"left" | "center" | "right" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // If alignment is explicitly chosen, use it.
  // Otherwise:
  // - If empty: default to "right" so the Kurdish placeholder starts on the right side!
  // - If has content: if Kurdish text -> "right", otherwise (math/equations/symbols) -> "left"!
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

  const run = async () => {
    if (!input.trim() && !file) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const payload: Record<string, unknown> = {
        tool: "math2word",
        input: `Convert mathematical input into precise LaTeX and Unicode equations for Word:\n${input}`,
      };
      if (file) {
        payload.fileBase64 = await fileToBase64(file);
        payload.mimeType = file.type || "application/octet-stream";
      }
      const r = await fetch("/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "شاشیەک چێبوو د گوهۆڕینێ دا.");
      setOutput((data.output || "").trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "شاشیەک د وەرگرتنا هاوکێشەیێ دا چێبوو");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Convert LaTeX to standard MathML string for direct MS Word clipboard paste
  const generateMathML = (latex: string) => {
    try {
      return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
  <semantics>
    <mrow>${latex}</mrow>
    <annotation encoding="application/x-tex">${latex}</annotation>
  </semantics>
</math>`;
    } catch {
      return latex;
    }
  };

  const copyAsMathML = (latexStr: string) => {
    const mathml = generateMathML(latexStr);
    navigator.clipboard.writeText(mathml);
    setCopied("mathml");
    setTimeout(() => setCopied(null), 2000);
  };

  // Download styled DOCX with Cambria Math equations
  const downloadDocx = async () => {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import("docx");
    const content = output || input;
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "هاوکێشەیا بیرکاریێ بۆ مایکرۆسۆفت وۆرد (Math to Word)",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 200, before: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Generated by Las AI — ئامرازێ پێشکەفتیێ هاوکێشەیان",
                  italics: true,
                  size: 20,
                  color: "666666",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            ...lines.map(
              (line) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      font: "Cambria Math",
                      size: 28,
                      bold: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 300 },
                  border: {
                    top: { color: "DDDDDD", space: 1, style: BorderStyle.SINGLE, size: 6 },
                    bottom: { color: "DDDDDD", space: 1, style: BorderStyle.SINGLE, size: 6 },
                  },
                }),
            ),
            new Paragraph({
              children: [
                new TextRun({
                  text: "تێبینی: بۆ دەستکاریکرنا هاوکێشەیێ د وۆرد دا، کلیک ل سەر دەقی بکە و د پشکا Equation دا گوهۆڕینێ بکە، یان Alt+= دابگرە.",
                  size: 18,
                  color: "888888",
                }),
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { before: 400 },
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Equations_Word.docx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const activeContent = output || input;

  const renderLiveKaTeX = (latex: string) => {
    if (!latex.trim()) return null;
    try {
      const clean = latex.replace(/\\\[|\\\]/g, "").replace(/\$\$/g, "").replace(/\$/g, "");
      const html = katex.renderToString(clean, {
        throwOnError: false,
        displayMode: true,
      });
      return (
        <div
          dir="ltr"
          dangerouslySetInnerHTML={{ __html: html }}
          className="overflow-x-auto py-2 math-formula-box text-center font-sans select-all"
          style={{ direction: "ltr", unicodeBidi: "isolate" }}
        />
      );
    } catch {
      return (
        <span
          dir="ltr"
          className="font-mono text-sm inline-block math-formula-box select-all"
          style={{ direction: "ltr", unicodeBidi: "isolate" }}
        >
          {latex}
        </span>
      );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-foreground font-sans">
      {/* ── Header Banner ── */}
      <div
        className="rounded-2xl bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-purple-600/15 border border-blue-500/20 px-4 py-3 sm:px-5 sm:py-3.5 backdrop-blur-xl relative overflow-hidden"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Sigma className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  Math ➔ Word Studio
                </h2>
                <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20 whitespace-nowrap">
                  Word Studio
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                گوهۆڕینا هاوکێشەیان بۆ فۆرماتێ دەستکاریکریێ Microsoft Word.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-blue-500/50 text-xs font-semibold text-foreground transition shadow-xs shrink-0 self-end sm:self-auto"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
            <span>ڕێبەرێ بکارئینانێ</span>
          </button>
        </div>
      </div>

      {/* ── User Guide Modal/Card ── */}
      {showGuide && (
        <div className="rounded-3xl bg-blue-500/10 border border-blue-500/30 p-5 md:p-6 text-right space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-blue-500/20 pb-2">
            <button
              onClick={() => setShowGuide(false)}
              className="p-1 rounded-lg hover:bg-blue-500/20 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="text-sm font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <Info className="w-4 h-4" />
              چەوا هاوکێشەیێ د ناڤ Microsoft Word دا بکاربینم؟
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed text-foreground/90">
            <div className="p-3 rounded-2xl bg-card border border-border space-y-1">
              <span className="font-bold text-blue-500 block">شێوازێ 1: داگرتنا فایلا Word</span>
              <p>دوگمەیا داگرتنا DOCX دابگرە، فایلا Word ب فۆنتێ فەرمیێ Cambria Math و ڕێکخستی دهێتە خارێ.</p>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border space-y-1">
              <span className="font-bold text-indigo-500 block">شێوازێ 2: ڕاستەوخۆ ب Ctrl + V (MathML)</span>
              <p>دوگمەیا "کۆپیکرنا MathML" دابگرە و د Word دا لکێنە (Ctrl+V)، وۆرد ئێکسەر دکەتە هاوکێشەیا فەرمی.</p>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border space-y-1">
              <span className="font-bold text-purple-500 block">شێوازێ 3: رەوشا Alt + = (Unicode Math)</span>
              <p>د Word دا دوگمەیا Alt + = دابگرە هەتا مۆدێ Equation ڤەببیت، پاشان کۆدێ UnicodeMath لکێنە.</p>
            </div>
          </div>
        </div>
      )}



      {/* ── Input & Math Symbol Studio ── */}
      <div
        className="rounded-3xl bg-card border border-border p-5 md:p-7 space-y-4"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        {/* Symbol Buttons Bar + Alignment Controls */}
        <div className="space-y-2.5 border-b border-border pb-3">
          {/* Category Filter Tabs & Alignment Group */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-secondary/70 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* 3 Alignment Icons: Left, Center, Right */}
            <div className="flex items-center rounded-lg border border-border/80 bg-secondary/50 p-0.5 gap-0.5 shrink-0" dir="ltr">
              <button
                type="button"
                onClick={() => setAlignment("left")}
                className={`p-1 rounded-md transition ${
                  currentAlign === "left"
                    ? "bg-card text-blue-600 dark:text-blue-400 shadow-xs"
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
                    ? "bg-card text-blue-600 dark:text-blue-400 shadow-xs"
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
                    ? "bg-card text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="لایێ ڕاستێ (Right Align - RTL)"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filtered Symbol Buttons Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar" dir="ltr">
            {SYMBOL_BUTTONS.filter((s) => selectedCategory === "all" || s.category === selectedCategory).map((sym, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => insertSymbol(sym.insert)}
                className="min-w-[38px] h-9 px-2.5 rounded-xl bg-secondary/80 hover:bg-blue-600 hover:text-white text-xs font-mono font-bold transition flex items-center justify-center shrink-0 active:scale-95 shadow-2xs border border-border/50 select-none"
                title={sym.title || sym.label}
              >
                {sym.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Input */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="هاوکێشەیا بیرکاریێ یان کۆدێ LaTeX بنڤیسە..."
            className={`w-full min-h-[120px] rounded-2xl border border-border bg-background/50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-y leading-relaxed transition-all ${
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
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Live KaTeX Visual Preview */}
        {input && (
          <div className="rounded-2xl bg-secondary/40 border border-border/80 p-4 text-center">
            <span className="text-[11px] font-bold text-muted-foreground block mb-1">
              دیتنا ڕاستەوخۆ یا هاوکێشەیێ (Live Visual Render)
            </span>
            <div className="text-lg md:text-xl text-foreground font-sans">
              {renderLiveKaTeX(input)}
            </div>
          </div>
        )}

        {/* File OCR & Process Button */}
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border hover:border-blue-500/60 bg-secondary/30 hover:bg-secondary/60 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
              >
                <Upload className="w-4 h-4 text-blue-500" />
                <span>بارکرنا وێنەیێ هاوکێشەیێ (OCR to Word)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary text-xs">
                <span className="font-semibold text-blue-600 dark:text-blue-400">وێنە:</span>
                <span className="max-w-[150px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-muted-foreground hover:text-destructive p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={run}
            disabled={loading || (!input.trim() && !file)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 hover:opacity-95 active:scale-98 transition disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{loading ? "د پڕۆسێسکرنێدا..." : "گوهۆڕین بۆ مایکرۆسۆفت وۆرد"}</span>
          </button>
        </div>

        {error && (
          <div className="rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 text-right">
            {error}
          </div>
        )}
      </div>

      {/* ── Export & Results Panel ── */}
      {(output || input) && (
        <div
          className="rounded-3xl bg-card border border-border p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Download DOCX Button */}
              <button
                onClick={downloadDocx}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold shadow-md shadow-blue-600/20 hover:opacity-90 transition"
              >
                <Download className="w-4 h-4" />
                <span>داگرتنا فایلا Word (.docx)</span>
              </button>

              {/* Copy MathML */}
              <button
                onClick={() => copyAsMathML(activeContent)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-secondary hover:bg-secondary/80 text-xs font-bold text-foreground transition"
              >
                {copied === "mathml" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>کۆپیکرنا MathML (بۆ Ctrl+V د Word دا)</span>
              </button>

              {/* Copy LaTeX */}
              <button
                onClick={() => copyToClipboard(activeContent, "latex")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-secondary hover:bg-secondary/80 text-xs font-bold text-foreground transition"
              >
                {copied === "latex" ? <Check className="w-4 h-4 text-emerald-500" /> : <FileCode className="w-4 h-4" />}
                <span>کۆپیکرنا LaTeX</span>
              </button>
            </div>

            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              هاوکێشەیا ئامادەکری
            </h3>
          </div>

          {/* Rendered Math Box */}
          <div className="rounded-2xl bg-gradient-to-b from-background to-secondary/30 border border-border p-6 text-center">
            <div className="text-xl md:text-2xl text-foreground font-sans">
              {renderLiveKaTeX(activeContent)}
            </div>
          </div>

          {/* Raw Math/Unicode code preview */}
          <div className="rounded-2xl bg-background border border-border p-4 font-mono text-xs text-muted-foreground dir-ltr overflow-x-auto">
            {activeContent}
          </div>
        </div>
      )}
    </div>
  );
}
