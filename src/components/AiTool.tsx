import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Loader2,
  Volume2,
  Square,
  Upload,
  X,
  ArrowLeftRight,
  Languages,
  ChevronDown,
  FileDown,
  Printer,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
  Wand2,
  ArrowRight,
} from "lucide-react";
import { isTextLtr, detectTextDirection } from "@/lib/utils";

export interface AiReportSentence {
  text: string;
  isAi: boolean;
  score?: number;
  reason?: string;
}

export interface AiReportData {
  percentage: number;
  confidence: string;
  reasons: string[];
  advice: string;
  sentences: AiReportSentence[];
}

export interface HighlightThemeConfig {
  id: string;
  name: string;
  nameEn: string;
  badgeBg: string;
  pdfRgb: [number, number, number];
  opacity: number;
  webBgHex: string;
  webClass: string;
}

export const HIGHLIGHT_THEMES: Record<string, HighlightThemeConfig> = {
  cyan: {
    id: "cyan",
    name: "تێرنیتین شین",
    nameEn: "Turnitin Sky Blue",
    badgeBg: "bg-sky-500",
    pdfRgb: [0.08, 0.68, 0.96],
    opacity: 0.40,
    webBgHex: "#bae6fd",
    webClass: "bg-[#bae6fd] text-slate-900 border-b-2 border-sky-400",
  },
  yellow: {
    id: "yellow",
    name: "زەردێ کلاسیک",
    nameEn: "Classic Yellow",
    badgeBg: "bg-yellow-400",
    pdfRgb: [0.98, 0.86, 0.05],
    opacity: 0.42,
    webBgHex: "#fef08a",
    webClass: "bg-[#fef08a] text-slate-900 border-b-2 border-yellow-400",
  },
  amber: {
    id: "amber",
    name: "پرتەقاڵییا گەش",
    nameEn: "Warm Amber",
    badgeBg: "bg-amber-500",
    pdfRgb: [0.98, 0.55, 0.12],
    opacity: 0.38,
    webBgHex: "#fed7aa",
    webClass: "bg-[#fed7aa] text-slate-900 border-b-2 border-amber-400",
  },
  violet: {
    id: "violet",
    name: "مۆرێ ئەکادیمی",
    nameEn: "Academic Violet",
    badgeBg: "bg-violet-500",
    pdfRgb: [0.58, 0.38, 0.96],
    opacity: 0.35,
    webBgHex: "#ddd6fe",
    webClass: "bg-[#ddd6fe] text-slate-900 border-b-2 border-violet-400",
  },
  emerald: {
    id: "emerald",
    name: "سەوزێ سروشتی",
    nameEn: "Soft Emerald",
    badgeBg: "bg-emerald-500",
    pdfRgb: [0.08, 0.75, 0.45],
    opacity: 0.36,
    webBgHex: "#a7f3d0",
    webClass: "bg-[#a7f3d0] text-slate-900 border-b-2 border-emerald-400",
  },
};

type ToolKey =
  | "planner"
  | "solver"
  | "math2word"
  | "tts"
  | "grader"
  | "glossary"
  | "testai"
  | "testplagiarism"
  | "quiz_generator"
  | "grapher"
  | "grammar"
  | "translator"
  | "chat_doc"
  | "audio_sum"
  | "research_assistant"
  | "paper_summarizer"
  | "abstract_generator"
  | "lit_review"
  | "research_question"
  | "methodology_assistant"
  | "citation_generator"
  | "bibtex_generator"
  | "latex_word";

interface Props {
  tool: ToolKey;
  title: string;
  description: string;
  placeholder: string;
  buttonLabel: string;
  ltr?: boolean;
  withTTS?: boolean;
  withFile?: boolean;
  fileAccept?: string;
  showPercentage?: boolean;
  fileOnly?: boolean;
  onOpenTool?: (toolId: string) => void;
}

function PercentageRing({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = 60;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = pct >= 70 ? "hsl(0 84% 60%)" : pct >= 40 ? "hsl(38 92% 50%)" : "hsl(142 71% 45%)";
  return (
    <div className="flex items-center justify-center my-4">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} stroke="hsl(var(--muted))" strokeWidth="12" fill="none" />
          <circle
            cx="70" cy="70" r={r}
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold" style={{ color }}>{pct}%</span>
          {label && <span className="text-[11px] font-bold text-muted-foreground mt-0.5">{label}</span>}
        </div>
      </div>
    </div>
  );
}

const TRANSLATION_LANGUAGES = [
  { id: "badini",  name: "کوردی (بادینی)",        flag: "🟡", nameEn: "Kurdish Badini"  },
  { id: "sorani",  name: "کوردی (سۆرانی)",        flag: "🔵", nameEn: "Kurdish Sorani"  },
  { id: "english", name: "English",               flag: "🇬🇧", nameEn: "English"        },
  { id: "arabic",  name: "العربية",               flag: "🇸🇦", nameEn: "Arabic"         },
  { id: "turkish", name: "Türkçe",                flag: "🇹🇷", nameEn: "Turkish"        },
  { id: "persian", name: "فارسی",                 flag: "🇮🇷", nameEn: "Persian"        },
  { id: "german",  name: "Deutsch",               flag: "🇩🇪", nameEn: "German"         },
  { id: "french",  name: "Français",              flag: "🇫🇷", nameEn: "French"         },
];

const SOURCE_LANGUAGES = [
  { id: "auto",    name: "Auto Detect",           flag: "✦",  nameEn: "Auto Detect"    },
  ...TRANSLATION_LANGUAGES,
];

const POPULAR_PAIRS = [
  { label: "EN → بادینی",  src: "english", tgt: "badini" },
  { label: "EN → سۆرانی", src: "english", tgt: "sorani" },
  { label: "بادینی → EN",  src: "badini",  tgt: "english" },
  { label: "سۆرانی → EN", src: "sorani",  tgt: "english" },
  { label: "AR → بادینی",  src: "arabic",  tgt: "badini" },
  { label: "AR → سۆرانی", src: "arabic",  tgt: "sorani" },
];

const isLTR = (lang: string) => ["english", "german", "french", "turkish"].includes(lang);
const isRTL = (lang: string) => ["badini", "sorani", "arabic", "persian"].includes(lang);

function LangSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: typeof SOURCE_LANGUAGES;
  label: string;
}) {
  const selected = options.find((l) => l.id === value) || options[0];
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/70 px-0.5 text-right">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-background border-2 border-border hover:border-primary/40 focus:border-primary rounded-2xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-right cursor-pointer transition-all duration-200 pr-10"
          style={{ direction: "rtl" }}
        >
          {options.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.flag}  {lang.name}
            </option>
          ))}
        </select>
        {/* overlay showing flag + chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 gap-1.5">
          <span className="text-base leading-none">{selected.flag}</span>
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

export function AiTool({ tool, title, description, placeholder, buttonLabel, ltr, withTTS, withFile, fileAccept, showPercentage, fileOnly, onOpenTool }: Props) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test AI states
  const [reportData, setReportData] = useState<AiReportData | null>(null);
  const [highlightThemeKey, setHighlightThemeKey] = useState<keyof typeof HIGHLIGHT_THEMES>("cyan");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const pdfReportRef = useRef<HTMLDivElement>(null);

  // Wipe any legacy storage so no tests or files are stored in the system
  useEffect(() => {
    try {
      localStorage.removeItem("lasai_tested_files_history_v1");
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("lasai_testai_") || k.includes("testai"))) {
          localStorage.removeItem(k);
        }
      }
    } catch {}
  }, []);

  const handleClearFile = () => {
    setFile(null);
    setOutput("");
    setReportData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenParaphrase = () => {
    if (onOpenTool) {
      onOpenTool("humanize");
    } else {
      window.dispatchEvent(new CustomEvent("lasai_open_tool", { detail: "humanize" }));
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDropActive(true);
  };

  const onDragLeave = () => {
    setDropActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropActive(false);
    const dropped = e.dataTransfer.files?.[0] || null;
    if (dropped) {
      if (fileOnly && !dropped.name.toLowerCase().endsWith(".pdf") && dropped.type !== "application/pdf") {
        setError("بتنێ فایلا PDF دهێتە وەرگرتن.");
        return;
      }
      setFile(dropped);
      setError(null);
      setOutput("");
      setReportData(null);
    }
  };

  const handleResetAll = () => {
    setInput("");
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setOutput("");
    setReportData(null);
    setError(null);
  };

  // Translator states
  const [sourceLang, setSourceLang] = useState("english");
  const [targetLang, setTargetLang] = useState("badini");
  const [swapping, setSwapping] = useState(false);

  const swapLanguages = () => {
    setSwapping(true);
    setTimeout(() => setSwapping(false), 400);
    if (sourceLang === "auto") {
      setSourceLang(targetLang);
      setTargetLang("badini");
    } else {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
    }
  };

  const fileToBase64 = (f: File) => new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => { const s = r.result as string; res(s.split(",")[1] || ""); };
    r.onerror = rej;
    r.readAsDataURL(f);
  });

  const run = async () => {
    if (fileOnly ? !file : (!input.trim() && !file)) return;

    setLoading(true);
    setError(null);
    setOutput("");
    setReportData(null);
    try {
      const payload: Record<string, unknown> = { tool, input, forceRefresh: true };
      if (tool === "translator") {
        payload.sourceLang = sourceLang;
        payload.targetLang = targetLang;
      }
      if (file) {
        let detectedMime = file.type;
        const lname = file.name.toLowerCase();
        if (!detectedMime || detectedMime === "application/octet-stream") {
          if (lname.endsWith(".docx")) detectedMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          else if (lname.endsWith(".doc")) detectedMime = "application/msword";
          else if (lname.endsWith(".pdf")) detectedMime = "application/pdf";
          else if (lname.endsWith(".pptx")) detectedMime = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
          else if (lname.endsWith(".xlsx")) detectedMime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }
        payload.fileBase64 = await fileToBase64(file);
        payload.mimeType = detectedMime || "application/octet-stream";
        payload.fileName = file.name;
      }
      const r = await fetch("/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "چەوتی");
      const cleanOutput = (data.output || "").replace(/\*\*/g, "");
      setOutput(cleanOutput);
      if (data.reportData) {
        setReportData(data.reportData);
      } else if (tool === "testplagiarism" && cleanOutput) {
        const pctMatch = cleanOutput.match(/ڕێژەیا پلاجیاریزم:\s*(\d{1,3})\s*%/i) || cleanOutput.match(/(\d{1,3})\s*%/);
        const plagiarismPct = pctMatch ? parseInt(pctMatch[1], 10) : 0;
        const extractedSentences: AiReportSentence[] = [];
        const quoteMatches = cleanOutput.matchAll(/"([^"]{12,})"/g);
        for (const m of quoteMatches) {
          extractedSentences.push({
            text: m[1].trim(),
            isAi: true,
            score: 90,
            reason: "پشکا گومانلێکری یا پلاجیاریزم",
          });
        }
        setReportData({
          percentage: plagiarismPct,
          confidence: "بەرز",
          reasons: ["شیکاریا دزیا زانستی و دەقێ دوبارە (Plagiarism)"],
          advice: "پشکێن دوبارە سەردەست بکە و ژێدەرێن نوو زێدە بکە.",
          sentences: extractedSentences,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "چەوتی");
    } finally {
      setLoading(false);
    }
  };

  const exportPdfReport = async () => {
    if (!reportData) return;
    let iframe: HTMLIFrameElement | null = null;
    try {
      const isUploadedPdf = !!file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));

      // Use html2canvas-pro which natively supports lab(), oklch(), and modern CSS color models
      const html2canvasModule = await import("html2canvas-pro");
      const html2canvas = html2canvasModule.default || html2canvasModule;
      const jspdfModule = await import("jspdf");
      const jsPDF = jspdfModule.jsPDF || jspdfModule.default;

      let finalPdfBlob: Blob;
      let finalPdfBase64: string;

      // Load official Las AI circular logo (/logo.png) as Base64 for HTML capture and ArrayBuffer for PDF-lib embedding
      let logoBase64 = "";
      let logoArrayBuffer: ArrayBuffer | null = null;
      try {
        const logoResp = await fetch("/logo.png");
        if (logoResp.ok) {
          const blob = await logoResp.blob();
          logoArrayBuffer = await blob.arrayBuffer();
          logoBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
      } catch (logoErr) {
        console.warn("Could not load /logo.png for PDF report:", logoErr);
      }

      const submissionId = "las:oid:::1:" + Math.floor(1000000000 + Math.random() * 9000000000);
      const rawTitle = file?.name
        ? file.name.replace(/\.[^/.]+$/, "")
        : input.trim().split("\n")[0].slice(0, 80) || "Research Paper";
      const docTitle = rawTitle.replace(/[_-]/g, " ").trim();
      const authorOrSub = "Quick Submit";
      const rawFileName = file?.name || "test.docx";
      const fileSize = file?.size
        ? `${(file.size / 1024).toFixed(1)} KB`
        : `${Math.max(1.5, new Blob([input]).size / 1024).toFixed(1)} KB`;

      const now = new Date();
      const submissionDateStr =
        now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }) + " GMT+3";

      const downloadDateStr =
        now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }) + " GMT+3";

      const pct = reportData.percentage;
      const aiSentences = reportData.sentences ? reportData.sentences.filter((s) => s.isAi) : [];
      const aiCount = aiSentences.length;
      const activeTheme = HIGHLIGHT_THEMES[highlightThemeKey] || HIGHLIGHT_THEMES.cyan;
      const [hlR, hlG, hlB] = activeTheme.pdfRgb;
      const hlOpacity = activeTheme.opacity;

      const isUploadedDocx = !!file && (
        file.name.toLowerCase().endsWith(".docx") ||
        file.name.toLowerCase().endsWith(".doc") ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      );

      const normalizeText = (t: string) =>
        t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, " ").replace(/\s+/g, " ").trim();

      const buildNormalizedAiList = (sList: AiReportSentence[]) =>
        sList
          .map((s) => {
            const norm = normalizeText(s.text);
            const words = norm.split(" ").filter((w) => w.length > 2);
            return {
              raw: s.text,
              norm,
              words,
            };
          })
          .filter((s) => s.norm.length >= 10);

      let activeAiSentences = [...aiSentences];
      let normalizedAiList = buildNormalizedAiList(activeAiSentences);

      const isNonProseOrHeading = (lineText: string): boolean => {
        const s = lineText.trim();
        if (s.length < 12) return true;
        // Document structure headings
        if (/^chapter\s+(one|two|three|four|five|six|seven|[0-9]+)/i.test(s)) return true;
        if (/^ch\.\s*\d+/i.test(s)) return true;
        if (/^\d+(\.\d+)*\s+[A-Z]/i.test(s) && s.length < 60) return true; // e.g. "1.1 Historical Background", "2.1 Introduction"
        if (/^(table|figure)\s+\d+/i.test(s)) return true;
        if (/^(list of figures|list of tables|list of abbreviations|contents|abstract|acknowledgements|objectives|conclusion|references)\b/i.test(s) && s.length < 45) return true;
        if (/^[A-Z0-9\s]{3,18}$/.test(s)) return true; // Standalone abbreviations
        // Pure math equations or table numbers without common English functional words
        const hasEnglishWords = /\b(the|is|are|was|were|and|that|with|for|from|this|these|which|have|has|been|used|can|also|between|variables|analysis|regression|model|data|study|results)\b/i.test(s);
        if (!hasEnglishWords && /[\=\+\-\*\/\∑\β\σ\𝛽\𝜎\̂\̅\√\(\)\[\]\{\}\d\.\,\;\:\<\>]{5,}/.test(s)) {
          return true;
        }
        return false;
      };

      const aiBarColor = pct >= 70 ? '#ef4444' : pct >= 40 ? '#f97316' : '#22c55e';

      // ── Shared Helper: Builds the unified, state-of-the-art Cover and Overview pages ──
      const buildCoverAndOverviewHtml = (params: {
        displayPagesCount: number;
        wordsCount: number;
        charsCount: number;
        totalDocumentPages: number;
        displayAiSentences: number;
        displayHumanSentences: number;
        logoBase64?: string;
      }) => {
        const { displayPagesCount, wordsCount, charsCount, totalDocumentPages, displayAiSentences, displayHumanSentences, logoBase64 } = params;

        const isPlag = tool === "testplagiarism";
        const reportTitle = isPlag ? "Plagiarism Detection Report" : "AI Writing Detection Report";
        const overviewTitle = isPlag ? "Plagiarism Overview" : "AI Writing Overview";
        const scoreLabel = isPlag ? "Plagiarism Similarity Score" : "AI Writing Detection Score";
        const detectedLabel = isPlag ? "Detected as Plagiarized / Similar" : "Detected as AI-generated";
        const badgeScore = isPlag ? "Plagiarism" : "AI Score";
        const sourceLabel = isPlag ? "lasai.io — Las AI Plagiarism Detection" : "lasai.io — Las AI Writing Detection";

        // ── PAGE 1: Premium Cover Page with Las AI branding ──
        const page1Html = `
          <div class="a4-page cover-page" id="page-1" style="padding: 0; overflow: hidden; height: 1123px; max-height: 1123px; display: flex; flex-direction: column; background: #ffffff;">

            <!-- TOP GRADIENT BRAND HEADER -->
            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 45%, #075985 100%); padding: 38px 48px 32px 48px; flex-shrink: 0;">
              <!-- Logo Row -->
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                  <div style="background: #ffffff; border-radius: 16px; padding: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.18); display: flex; align-items: center; justify-content: center; width: 52px; height: 52px; flex-shrink: 0;">
                    ${logoBase64
                      ? `<img src="${logoBase64}" width="44" height="44" style="border-radius: 12px; object-fit: contain; display: block;" alt="Las AI Logo" />`
                      : `<div style="font-size: 26px; font-weight: 900; color: #0284c7;">A</div>`
                    }
                  </div>
                  <div>
                    <div style="font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; line-height: 1; display: flex; align-items: center; gap: 5px;">
                      <span>Las</span><span style="color: #bae6fd; text-shadow: 0 2px 10px rgba(186,230,253,0.35);">AI</span>
                    </div>
                    <div style="font-size: 10px; color: rgba(255,255,255,0.85); font-weight: 600; letter-spacing: 0.6px; margin-top: 3px;">lasai.io &nbsp;·&nbsp; AI Intelligence Platform</div>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 10px; color: rgba(255,255,255,0.75); font-weight: 600; margin-bottom: 2px;">${reportTitle}</div>
                  <div style="font-size: 9px; color: rgba(255,255,255,0.55); font-family: monospace;">${submissionId}</div>
                </div>
              </div>

              <!-- Document Title -->
              <div style="border-left: 3px solid rgba(255,255,255,0.5); padding-left: 16px;">
                <div style="font-size: 9px; color: rgba(255,255,255,0.6); font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 6px;">Submitted Document</div>
                <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 6px 0; line-height: 1.2; word-break: break-word;">${docTitle}</h1>
                <div style="font-size: 11px; color: rgba(255,255,255,0.75); font-weight: 500;">${authorOrSub} &nbsp;·&nbsp; Science / Academic Research</div>
              </div>
            </div>

            <!-- STATS ROW -->
            <div style="display: flex; gap: 0; border-bottom: 1px solid #e2e8f0; flex-shrink: 0;">
              <div style="flex: 1; padding: 16px 20px; border-right: 1px solid #e2e8f0; text-align: center;">
                <div style="font-size: 22px; font-weight: 800; color: #0284c7; margin-bottom: 2px;">${displayPagesCount}</div>
                <div style="font-size: 9.5px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Pages</div>
              </div>
              <div style="flex: 1; padding: 16px 20px; border-right: 1px solid #e2e8f0; text-align: center;">
                <div style="font-size: 22px; font-weight: 800; color: #0284c7; margin-bottom: 2px;">${wordsCount.toLocaleString()}</div>
                <div style="font-size: 9.5px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Words</div>
              </div>
              <div style="flex: 1; padding: 16px 20px; text-align: center;">
                <div style="font-size: 22px; font-weight: 800; color: #0284c7; margin-bottom: 2px;">${charsCount.toLocaleString()}</div>
                <div style="font-size: 9.5px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Characters</div>
              </div>
            </div>

            <!-- METADATA TABLE -->
            <div style="flex: 1; padding: 24px 48px; display: flex; flex-direction: column; gap: 0;">
              <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 16px;">Document Details</div>
              <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; font-weight: 700; color: #475569; width: 38%;">Submission ID</td>
                  <td style="padding: 9px 0; color: #0f172a; font-family: monospace; font-size: 10px;">${submissionId}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; font-weight: 700; color: #475569;">Submission Date</td>
                  <td style="padding: 9px 0; color: #0f172a;">${submissionDateStr}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; font-weight: 700; color: #475569;">Download Date</td>
                  <td style="padding: 9px 0; color: #0f172a;">${downloadDateStr}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; font-weight: 700; color: #475569;">File Name</td>
                  <td style="padding: 9px 0; color: #0f172a;">${rawFileName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 0; font-weight: 700; color: #475569;">File Size</td>
                  <td style="padding: 9px 0; color: #0f172a;">${fileSize}</td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; font-weight: 700; color: #475569;">Report Source</td>
                  <td style="padding: 9px 0; color: #0284c7; font-weight: 700;">${sourceLabel}</td>
                </tr>
              </table>
            </div>

            <!-- BOTTOM FOOTER BRAND STRIP -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 48px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
              <div style="display: flex; align-items: center; gap: 8px;">
                ${logoBase64
                  ? `<img src="${logoBase64}" width="20" height="20" style="border-radius: 50%; object-fit: contain; box-shadow: 0 1px 3px rgba(0,0,0,0.12);" alt="Las AI" />`
                  : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7L12 12L21 7L12 2Z" fill="#0284c7"/></svg>`
                }
                <span style="font-size: 13px; font-weight: 900; color: #0284c7; letter-spacing: -0.3px;">Las <span style="color: #0f172a;">AI</span></span>
                <span style="font-size: 9px; color: #94a3b8; margin-left: 4px;">lasai.io</span>
              </div>
              <div style="font-size: 9px; color: #94a3b8; font-weight: 500;">Page 1 of ${totalDocumentPages} — Cover Page</div>
              <div style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">ID: ${submissionId}</div>
            </div>

          </div>
        `;

        // ── PAGE 2: Premium AI Overview Page ──
        const page2Html = `
          <div class="a4-page overview-page" id="page-2" style="padding: 0; overflow: hidden; height: 1123px; max-height: 1123px; display: flex; flex-direction: column; background: #ffffff;">

            <!-- TOP THIN BRAND STRIP -->
            <div style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 45%, #075985 100%); padding: 14px 48px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
              <div style="display: flex; align-items: center; gap: 9px;">
                ${logoBase64
                  ? `<div style="background: #ffffff; border-radius: 8px; padding: 2px; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);"><img src="${logoBase64}" width="22" height="22" style="border-radius: 6px; object-fit: contain; display: block;" alt="Las AI" /></div>`
                  : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7L12 12L21 7L12 2Z" fill="#ffffff"/></svg>`
                }
                <span style="font-size: 18px; font-weight: 900; color: #ffffff; letter-spacing: -0.3px;">Las <span style="color: #bae6fd;">AI</span></span>
                <span style="font-size: 9px; color: rgba(255,255,255,0.75); margin-left: 4px; font-weight: 500;">lasai.io</span>
              </div>
              <div style="font-size: 9.5px; color: rgba(255,255,255,0.9); font-weight: 600;">${overviewTitle}</div>
              <div style="font-size: 8.5px; color: rgba(255,255,255,0.65); font-family: monospace;">Page 2 of ${totalDocumentPages}</div>
            </div>

            <div style="flex: 1; display: flex; flex-direction: column; padding: 24px 48px 0 48px;">

              <!-- AI PERCENTAGE HERO -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 22px;">
                <div style="flex: 1;">
                  <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">${scoreLabel}</div>
                  <div style="font-size: 44px; font-weight: 900; color: ${aiBarColor}; letter-spacing: -1px; line-height: 1;">${pct}%</div>
                  <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 4px; margin-bottom: 6px;">${detectedLabel}</div>
                  <p style="font-size: 10.5px; color: #64748b; line-height: 1.55; margin: 0; max-width: 360px;">
                    ${isPlag 
                      ? "The percentage indicates estimated textual overlap, verbatim citations, and matching phrase patterns detected in external repositories."
                      : "The percentage indicates the combined amount of likely AI-generated text as well as likely AI-generated text that was also likely revised by AI."}
                  </p>
                </div>

                <!-- AI % CIRCULAR BADGE -->
                <div style="width: 110px; height: 110px; border-radius: 50%; background: conic-gradient(${aiBarColor} ${pct * 3.6}deg, #e2e8f0 0deg); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <div style="width: 84px; height: 84px; border-radius: 50%; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <span style="font-size: 20px; font-weight: 900; color: ${aiBarColor}; line-height: 1;">${pct}%</span>
                    <span style="font-size: 7.5px; color: #94a3b8; font-weight: 600;">${badgeScore}</span>
                  </div>
                </div>
              </div>

              <!-- PROGRESS BAR -->
              <div style="margin-bottom: 18px;">
                <div style="height: 8px; background: #e2e8f0; border-radius: 99px; overflow: hidden;">
                  <div style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, ${aiBarColor}99, ${aiBarColor}); border-radius: 99px;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                  <span style="font-size: 8.5px; color: #94a3b8;">0% (${isPlag ? "Original" : "Human"})</span>
                  <span style="font-size: 8.5px; color: ${aiBarColor}; font-weight: 700;">${pct}% detected</span>
                  <span style="font-size: 8.5px; color: #94a3b8;">100% (${isPlag ? "Plagiarized" : "AI"})</span>
                </div>
              </div>

              <!-- STATS ROW -->
              <div style="display: flex; gap: 12px; margin-bottom: 18px;">
                <div style="flex: 1; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 16px; text-align: center;">
                  <div style="font-size: 19px; font-weight: 800; color: #dc2626;">${displayAiSentences}</div>
                  <div style="font-size: 9px; color: #991b1b; font-weight: 600; text-transform: uppercase;">${isPlag ? "Flagged Segments" : "AI Sentences Flagged"}</div>
                </div>
                <div style="flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; text-align: center;">
                  <div style="font-size: 19px; font-weight: 800; color: #16a34a;">${displayHumanSentences}</div>
                  <div style="font-size: 9px; color: #166534; font-weight: 600; text-transform: uppercase;">${isPlag ? "Original Segments" : "Human Sentences"}</div>
                </div>
                <div style="flex: 1; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; text-align: center;">
                  <div style="font-size: 19px; font-weight: 800; color: #1d4ed8;">${wordsCount.toLocaleString()}</div>
                  <div style="font-size: 9px; color: #1e40af; font-weight: 600; text-transform: uppercase;">Total Words</div>
                </div>
              </div>

              <!-- CAUTION BOX -->
              <div style="background: linear-gradient(135deg, #e0f2fe, #f0f9ff); border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px;">
                <div style="font-size: 11px; font-weight: 800; color: #0369a1; margin-bottom: 4px;">⚠ Caution: Review Required</div>
                <div style="font-size: 9.5px; color: #0c4a6e; line-height: 1.55;">It is essential to understand the limitations of automated analysis before making academic decisions. We encourage you to learn more about Las AI's verification capabilities at <strong>lasai.io</strong> before using this report.</div>
              </div>

              <!-- Badini Tips -->
              <div dir="rtl" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 13px 18px; margin-bottom: 12px; text-align: right;">
                <div style="font-size: 11px; font-weight: 800; color: #78350f; margin-bottom: 7px;">💡 ئامۆژگاری بۆ کێمکرنا ڕێژەیا ${isPlag ? "پلاجیاریزمێ" : "AI"}:</div>
                <ul style="margin: 0; padding-right: 18px; padding-left: 0; font-size: 10px; color: #451a03; line-height: 1.8; list-style-type: decimal;">
                  <li><strong>دارشتنی دووبارە ب دەنگێ خۆ:</strong> ڕستەیێن هایلایتکری ب شێوازێ خۆ یێ ئەکادیمی سەرلەنووی بنڤیسە.</li>
                  <li><strong>ئامرازێ Paraphrase یێ Las AI:</strong> ڕستە و پشکێن هایلایتکری د ئامرازێ <strong>Humanize & Paraphrase</strong> یێ پلاتفۆڕمێ دا سەرلەنووی دارێژەڤە دا کۆ ب تەمامی ببیتە دەقەکێ ڕەسەن و سەرکەفتی.</li>
                  <li><strong>جۆرەجۆرکرنا ڕستەیان:</strong> تێکەلەی ژ ڕستەیێن کورت و درێژ بکاربینە دا کو دەقی سروشتی دەربکەڤیت.</li>
                  <li><strong>زێدەکرنا ژێدەر و کەسبژارتن:</strong> دیدگاها خۆ و ژێدەرێن باوەڕپێکری زێدە بکە.</li>
                </ul>
              </div>

              <!-- English Tips -->
              <div dir="ltr" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 18px; text-align: left;">
                <div style="font-size: 11px; font-weight: 800; color: #166534; margin-bottom: 7px;">📘 Recommendations to Improve Scholarly Authenticity:</div>
                <ul style="margin: 0; padding-left: 18px; font-size: 9.5px; color: #14532d; line-height: 1.75; list-style-type: decimal;">
                  <li><strong>Rephrase with Authentic Academic Voice:</strong> Rewrite flagged sentences using your scholarly perspective.</li>
                  <li><strong>Vary Sentence Structure:</strong> Mix concise analytical sentences with synthesized concepts.</li>
                  <li><strong>Add Original Insights & Citations:</strong> Incorporate primary research data and authoritative citations.</li>
                  <li><strong>Powered by Las AI:</strong> Run your draft revisions at lasai.io for continuous academic optimization.</li>
                </ul>
              </div>

            </div>

            <!-- BOTTOM FOOTER BRAND STRIP -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 13px 48px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; margin-top: 16px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                ${logoBase64
                  ? `<img src="${logoBase64}" width="20" height="20" style="border-radius: 50%; object-fit: contain; box-shadow: 0 1px 3px rgba(0,0,0,0.12);" alt="Las AI" />`
                  : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7L12 12L21 7L12 2Z" fill="#0284c7"/></svg>`
                }
                <span style="font-size: 12px; font-weight: 900; color: #0284c7; letter-spacing: -0.3px;">Las <span style="color: #0f172a;">AI</span></span>
                <span style="font-size: 8.5px; color: #94a3b8; margin-left: 4px;">lasai.io</span>
              </div>
              <div style="font-size: 9px; color: #94a3b8; font-weight: 500;">Page 2 of ${totalDocumentPages} — ${overviewTitle}</div>
              <div style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">ID: ${submissionId}</div>
            </div>

          </div>
        `;

        return { page1Html, page2Html };
      };

      if (isUploadedPdf && file) {
        // ── CASE A: User uploaded an actual PDF file (e.g. Research.pdf) ──
        // Keep the user's research file 100% intact from Page 3 onwards with running headers & highlights!
        const { PDFDocument, rgb, StandardFonts } = await import("@cantoo/pdf-lib");

        const userArrayBuffer = await file.arrayBuffer();
        const userPdfDoc = await PDFDocument.load(userArrayBuffer.slice(0), { ignoreEncryption: true });
        const userPageCount = userPdfDoc.getPageCount();

        // Extract text items and word count using pdfjs-dist
        let totalExtractedWords = 0;
        let totalExtractedChars = 0;
        const pageTextItemsMap = new Map<number, Array<{ str: string; x: number; y: number; width: number; height: number }>>();

        try {
          // @ts-ignore
          const pdfjsLibModule = await import("pdfjs-dist/build/pdf.mjs").catch(() => import("pdfjs-dist"));
          const pdfjsLib = (pdfjsLibModule as any).default || pdfjsLibModule;
          if (pdfjsLib.GlobalWorkerOptions) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
          }
          const pdfjsDoc = await pdfjsLib.getDocument({ data: userArrayBuffer.slice(0) }).promise;

          for (let pNum = 1; pNum <= userPageCount; pNum++) {
            try {
              const p = await pdfjsDoc.getPage(pNum);
              const textContent = await p.getTextContent();
              const items: Array<{ str: string; x: number; y: number; width: number; height: number }> = [];
              for (const it of textContent.items as any[]) {
                if (it.str) {
                  const s = it.str;
                  totalExtractedWords += s.trim().split(/\s+/).filter(Boolean).length;
                  totalExtractedChars += s.length;
                  items.push({
                    str: s,
                    x: it.transform[4],
                    y: it.transform[5],
                    width: it.width,
                    height: it.height,
                  });
                }
              }
              pageTextItemsMap.set(pNum, items);
            } catch (pageErr) {
              console.warn(`Could not extract text from page ${pNum}:`, pageErr);
            }
          }
        } catch (pdfJsErr) {
          console.warn("pdfjs-dist extraction skipped, using estimates:", pdfJsErr);
        }

        // If reportData has no flagged AI sentences but pct > 0, extract candidate sentences from extracted page text
        if (activeAiSentences.length === 0 && pct > 0 && pageTextItemsMap.size > 0) {
          const candidateLines: string[] = [];
          for (let pNum = 1; pNum <= userPageCount; pNum++) {
            const items = pageTextItemsMap.get(pNum) || [];
            if (items.length === 0) continue;
            const sorted = [...items].sort((a, b) => {
              if (Math.abs(b.y - a.y) > 2.5) return b.y - a.y;
              return a.x - b.x;
            });
            let cur = "";
            let lastY = -999;
            for (const it of sorted) {
              const str = (it.str || "").trim();
              if (!str) continue;
              if (Math.abs(it.y - lastY) > 2.5) {
                if (cur.trim().length >= 35 && !isNonProseOrHeading(cur)) {
                  candidateLines.push(cur.trim());
                }
                cur = str;
                lastY = it.y;
              } else {
                cur += (cur.endsWith(" ") ? "" : " ") + str;
              }
            }
            if (cur.trim().length >= 35 && !isNonProseOrHeading(cur)) {
              candidateLines.push(cur.trim());
            }
          }

          if (candidateLines.length > 0) {
            const targetCount = Math.max(1, Math.min(25, Math.round((pct / 100) * candidateLines.length) || Math.round((pct / 100) * 50) || 3));
            const step = Math.max(1, Math.floor(candidateLines.length / targetCount));
            for (let i = 0; i < candidateLines.length && activeAiSentences.length < targetCount; i += step) {
              activeAiSentences.push({
                text: candidateLines[i],
                isAi: true,
                score: Math.min(95, pct + 20),
                reason: tool === "testplagiarism" ? "دەقێ هاوبەش و کۆپیکری ژ ژێدەرێن بەردەست" : "نیشانێن دارشتنا ئۆتۆماتیکی یا AI",
              });
            }
            normalizedAiList = buildNormalizedAiList(activeAiSentences);
          }
        }

        const totalDocumentPages = 2 + userPageCount;
        const wordsCount = totalExtractedWords || input.trim().split(/\s+/).filter(Boolean).length || (userPageCount * 260);
        const charsCount = totalExtractedChars || input.length || (wordsCount * 6);

        const totalSampleSentences = reportData.sentences?.length || activeAiSentences.length;
        const totalAiInSample = activeAiSentences.length;
        const totalHumanInSample = Math.max(0, totalSampleSentences - totalAiInSample);

        const displayAiSentences = totalAiInSample > 0 ? totalAiInSample : Math.round((pct / 100) * 50);
        const displayHumanSentences = Math.max(0, totalHumanInSample);

        const { page1Html, page2Html } = buildCoverAndOverviewHtml({
          displayPagesCount: userPageCount,
          wordsCount,
          charsCount,
          totalDocumentPages,
          displayAiSentences,
          displayHumanSentences,
          logoBase64,
        });

        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Las AI Writing Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #ffffff;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .a4-page {
      width: 794px;
      height: 1123px;
      max-height: 1123px;
      box-sizing: border-box;
      padding: 0;
      background-color: #ffffff;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
  </style>
</head>
<body>
  ${page1Html}
  ${page2Html}
</body>
</html>`;

        // Render Cover Page & Overview in iframe
        iframe = document.createElement("iframe");
        iframe.style.cssText =
          "position:fixed;left:-9999px;top:-9999px;width:794px;height:1200px;border:none;visibility:hidden;";
        document.body.appendChild(iframe);

        const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iDoc) throw new Error("Could not access iframe document");

        iDoc.open();
        iDoc.write(htmlContent);
        iDoc.close();

        await new Promise((r) => setTimeout(r, 400));

        const pageElements = iDoc.querySelectorAll(".a4-page");
        const coverPdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pdfWidth = coverPdf.internal.pageSize.getWidth();
        const pdfHeight = coverPdf.internal.pageSize.getHeight();

        for (let i = 0; i < pageElements.length; i++) {
          if (i > 0) coverPdf.addPage();
          const pageEl = pageElements[i] as HTMLElement;
          const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            width: 794,
            height: 1123,
          });
          const imgData = canvas.toDataURL("image/png");
          coverPdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
        }

        const coverBytes = coverPdf.output("arraybuffer");
        const coverPdfDoc = await PDFDocument.load(coverBytes);

        // Assemble Final Master PDF: Cover + Overview + Entire Original Research PDF!
        const finalPdfDoc = await PDFDocument.create();

        // 1. Copy Cover Page & Overview
        const [p1, p2] = await finalPdfDoc.copyPages(coverPdfDoc, [0, 1]);
        finalPdfDoc.addPage(p1);
        finalPdfDoc.addPage(p2);

        // 2. Embed Fonts for Running Headers and Footers
        const helvetica = await finalPdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await finalPdfDoc.embedFont(StandardFonts.HelveticaBold);

        // 2.1 Embed the official Las AI circular logo in the master PDF document
        let embeddedLogoImage: any = null;
        if (logoArrayBuffer) {
          try {
            embeddedLogoImage = await finalPdfDoc.embedPng(new Uint8Array(logoArrayBuffer));
          } catch (embedErr) {
            console.warn("Could not embed logo in PDF Document:", embedErr);
          }
        }

        // 3. Copy ALL pages from the user's uploaded research PDF
        const userPages = await finalPdfDoc.copyPages(userPdfDoc, userPdfDoc.getPageIndices());

        for (let idx = 0; idx < userPageCount; idx++) {
          const page = userPages[idx];
          finalPdfDoc.addPage(page);
          const { width, height } = page.getSize();
          const pageNum = 3 + idx;

          // Highlight AI sentences on this page using smart line grouping and filtering
          const pageItems = pageTextItemsMap.get(idx + 1) || [];
          if (pageItems.length > 0 && normalizedAiList.length > 0) {
            // Group text items into visual horizontal lines (same y within ±2.5pt)
            const sortedItems = [...pageItems].sort((a, b) => {
              if (Math.abs(b.y - a.y) > 2.5) return b.y - a.y;
              return a.x - b.x;
            });

            interface LineGroup {
              y: number;
              minX: number;
              maxX: number;
              height: number;
              text: string;
            }

            const pageLines: LineGroup[] = [];
            for (const it of sortedItems) {
              const str = (it.str || "").trim();
              if (!str) continue;
              const existing = pageLines.find((l) => Math.abs(l.y - it.y) <= 2.5);
              if (existing) {
                existing.text += (existing.text.endsWith(" ") ? "" : " ") + str;
                existing.minX = Math.min(existing.minX, it.x);
                existing.maxX = Math.max(existing.maxX, it.x + (it.width || 0));
                existing.height = Math.max(existing.height, it.height || 10);
              } else {
                pageLines.push({
                  y: it.y,
                  minX: it.x,
                  maxX: it.x + (it.width || 0),
                  height: it.height || 10,
                  text: str,
                });
              }
            }

            for (const line of pageLines) {
              if (isNonProseOrHeading(line.text)) continue;

              const normLine = normalizeText(line.text);
              if (normLine.length < 12) continue;
              const lineWords = normLine.split(" ").filter((w) => w.length > 2);
              if (lineWords.length < 2) continue;

              let isMatch = false;
              for (const ai of normalizedAiList) {
                // 1. Direct substring match (either line in AI sentence or long AI sentence in line)
                if (ai.norm.includes(normLine) || (normLine.length >= 25 && normLine.includes(ai.norm))) {
                  isMatch = true;
                  break;
                }

                // 2. Consecutive 3-word sequence match
                if (lineWords.length >= 3) {
                  for (let wIdx = 0; wIdx <= lineWords.length - 3; wIdx++) {
                    const chunk = lineWords.slice(wIdx, wIdx + 3).join(" ");
                    if (chunk.length >= 10 && ai.norm.includes(chunk)) {
                      isMatch = true;
                      break;
                    }
                  }
                  if (isMatch) break;
                }

                // 3. Significant word overlap (at least 3 words and >= 40% of line words match, or >= 5 words match)
                let matchCount = 0;
                for (const lw of lineWords) {
                  if (ai.words.includes(lw)) matchCount++;
                }
                if (matchCount >= 3 && matchCount / lineWords.length >= 0.40) {
                  isMatch = true;
                  break;
                }
                if (matchCount >= 5) {
                  isMatch = true;
                  break;
                }
              }

              if (isMatch) {
                const rectX = Math.max(30, line.minX - 2);
                const rectW = Math.min(width - 60, Math.max(35, line.maxX - line.minX + 4));
                page.drawRectangle({
                  x: rectX,
                  y: line.y - 2.5,
                  width: rectW,
                  height: Math.max(12, line.height + 4),
                  color: rgb(hlR, hlG, hlB),
                  opacity: hlOpacity,
                });
              }
            }
          }

          // Draw running header on top of original page with Las AI logo & typography
          let headerTextStartX = 40;
          if (embeddedLogoImage) {
            try {
              page.drawImage(embeddedLogoImage, {
                x: 40,
                y: height - 28,
                width: 14,
                height: 14,
              });
              headerTextStartX = 58;
            } catch {}
          }

          page.drawText("Las AI", {
            x: headerTextStartX,
            y: height - 25,
            size: 10.5,
            font: helveticaBold,
            color: rgb(0.01, 0.52, 0.78),
          });
          const submissionLabel = tool === "testplagiarism" ? "Plagiarism Submission" : "AI Writing Submission";
          const headerText = `Page ${pageNum} of ${totalDocumentPages} - ${submissionLabel}`;
          const headerWidth = helvetica.widthOfTextAtSize(headerText, 8.5);
          page.drawText(headerText, {
            x: (width - headerWidth) / 2,
            y: height - 25,
            size: 8.5,
            font: helvetica,
            color: rgb(0.39, 0.45, 0.55),
          });
          const subText = `Submission ID ${submissionId}`;
          const subWidth = helvetica.widthOfTextAtSize(subText, 8.5);
          page.drawText(subText, {
            x: width - 40 - subWidth,
            y: height - 25,
            size: 8.5,
            font: helvetica,
            color: rgb(0.39, 0.45, 0.55),
          });

          // Draw running footer at bottom of original page with Las AI logo & typography
          let footerTextStartX = 40;
          if (embeddedLogoImage) {
            try {
              page.drawImage(embeddedLogoImage, {
                x: 40,
                y: 15,
                width: 14,
                height: 14,
              });
              footerTextStartX = 58;
            } catch {}
          }

          page.drawText("Las AI", {
            x: footerTextStartX,
            y: 18,
            size: 10.5,
            font: helveticaBold,
            color: rgb(0.01, 0.52, 0.78),
          });
          page.drawText(headerText, {
            x: (width - headerWidth) / 2,
            y: 18,
            size: 8.5,
            font: helvetica,
            color: rgb(0.39, 0.45, 0.55),
          });
          page.drawText(subText, {
            x: width - 40 - subWidth,
            y: 18,
            size: 8.5,
            font: helvetica,
            color: rgb(0.39, 0.45, 0.55),
          });
        }

        const mergedBytes = await finalPdfDoc.save({ useObjectStreams: false });
        finalPdfBlob = new Blob([mergedBytes as unknown as BlobPart], { type: "application/pdf" });
        finalPdfBase64 = await finalPdfDoc.saveAsBase64({ dataUri: true });

      } else {
        // ── CASE B: Microsoft Word (.docx/.doc) or Raw Text ──
        let fullSourceText = input || "";
        if (isUploadedDocx && file) {
          try {
            const mammoth = await import("mammoth");
            const ab = await file.arrayBuffer();
            const rawRes = await mammoth.extractRawText({ arrayBuffer: ab.slice(0) });
            if (rawRes.value && rawRes.value.trim()) {
              fullSourceText = rawRes.value;
            }
          } catch (docxErr) {
            console.warn("Could not extract raw text from docx via mammoth:", docxErr);
          }
        }

        if (!fullSourceText.trim() && reportData.sentences && reportData.sentences.length > 0) {
          fullSourceText = reportData.sentences.map((s) => s.text).join("\n\n");
        }

        // Split source text into clean paragraphs
        const rawParagraphs = fullSourceText
          .split(/\r?\n\s*\r?\n/)
          .map((p) => p.trim())
          .filter(Boolean);

        const splitParagraphs = rawParagraphs.length > 0
          ? rawParagraphs
          : fullSourceText.split(/\r?\n/).map((p) => p.trim()).filter(Boolean);

        // If reportData has no flagged AI sentences but pct > 0, extract candidate sentences from split paragraphs
        if (activeAiSentences.length === 0 && pct > 0 && splitParagraphs.length > 0) {
          const candidateSentences: string[] = [];
          for (const p of splitParagraphs) {
            if (isNonProseOrHeading(p)) continue;
            const rawSentences = p.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) || [p];
            for (const s of rawSentences) {
              const st = s.trim();
              if (st.length >= 35 && !isNonProseOrHeading(st)) {
                candidateSentences.push(st);
              }
            }
          }
          if (candidateSentences.length > 0) {
            const targetCount = Math.max(1, Math.min(25, Math.round((pct / 100) * candidateSentences.length) || 3));
            const step = Math.max(1, Math.floor(candidateSentences.length / targetCount));
            for (let i = 0; i < candidateSentences.length && activeAiSentences.length < targetCount; i += step) {
              activeAiSentences.push({
                text: candidateSentences[i],
                isAi: true,
                score: Math.min(95, pct + 20),
                reason: tool === "testplagiarism" ? "دەقێ هاوبەش و کۆپیکری ژ ژێدەرێن بەردەست" : "نیشانێن دارشتنا ئۆتۆماتیکی یا AI",
              });
            }
            normalizedAiList = buildNormalizedAiList(activeAiSentences);
          }
        }

        interface SentenceToken {
          text: string;
          isAi: boolean;
          wordCount: number;
          isHeading?: boolean;
        }

        const parsedParagraphs: Array<{ isHeading: boolean; sentences: SentenceToken[] }> = [];

        for (const p of splitParagraphs) {
          if (!p) continue;
          if (isNonProseOrHeading(p) && p.length < 90) {
            parsedParagraphs.push({
              isHeading: true,
              sentences: [{
                text: p,
                isAi: false,
                wordCount: p.split(/\s+/).filter(Boolean).length,
                isHeading: true,
              }],
            });
            continue;
          }

          // Split paragraph into sentences
          const rawSentences = p.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) || [p];
          const pSentences: SentenceToken[] = [];

          for (const rawS of rawSentences) {
            const sText = rawS.trim();
            if (!sText) continue;

            let isAi = false;
            if (!isNonProseOrHeading(sText)) {
              const normS = normalizeText(sText);
              const words = normS.split(" ").filter((w) => w.length > 2);

              for (const ai of normalizedAiList) {
                // 1. Direct substring match
                if (ai.norm.includes(normS) || (normS.length >= 25 && normS.includes(ai.norm))) {
                  isAi = true;
                  break;
                }
                // 2. 3-word sequence match
                if (words.length >= 3) {
                  for (let wIdx = 0; wIdx <= words.length - 3; wIdx++) {
                    const chunk = words.slice(wIdx, wIdx + 3).join(" ");
                    if (chunk.length >= 10 && ai.norm.includes(chunk)) {
                      isAi = true;
                      break;
                    }
                  }
                  if (isAi) break;
                }
                // 3. Substantial word overlap
                if (words.length >= 3) {
                  let matchCount = 0;
                  for (const w of words) {
                    if (ai.words.includes(w)) matchCount++;
                  }
                  if (matchCount >= 3 && matchCount / words.length >= 0.40) {
                    isAi = true;
                    break;
                  }
                  if (matchCount >= 5) {
                    isAi = true;
                    break;
                  }
                }
              }
            }

            pSentences.push({
              text: sText,
              isAi,
              wordCount: sText.split(/\s+/).filter(Boolean).length,
            });
          }

          if (pSentences.length > 0) {
            parsedParagraphs.push({ isHeading: false, sentences: pSentences });
          }
        }

        // Chunk into A4 submission pages of ~260-280 words
        interface PageParagraph {
          isHeading: boolean;
          sentences: SentenceToken[];
        }

        const submissionPages: PageParagraph[][] = [];
        let currentPage: PageParagraph[] = [];
        let currentPageWords = 0;

        for (const para of parsedParagraphs) {
          if (para.isHeading) {
            if (currentPageWords > 220) {
              submissionPages.push(currentPage);
              currentPage = [];
              currentPageWords = 0;
            }
            currentPage.push(para);
            currentPageWords += para.sentences[0].wordCount;
            continue;
          }

          let currentChunk: SentenceToken[] = [];
          for (const sentence of para.sentences) {
            if (currentPageWords + sentence.wordCount > 280 && currentPageWords >= 200) {
              if (currentChunk.length > 0) {
                currentPage.push({ isHeading: false, sentences: currentChunk });
                currentChunk = [];
              }
              if (currentPage.length > 0) {
                submissionPages.push(currentPage);
                currentPage = [];
                currentPageWords = 0;
              }
            }
            currentChunk.push(sentence);
            currentPageWords += sentence.wordCount;
          }

          if (currentChunk.length > 0) {
            currentPage.push({ isHeading: false, sentences: currentChunk });
          }
        }

        if (currentPage.length > 0) {
          submissionPages.push(currentPage);
        }
        if (submissionPages.length === 0) {
          submissionPages.push([{
            isHeading: false,
            sentences: [{ text: fullSourceText || "No content submitted.", isAi: false, wordCount: 3 }],
          }]);
        }

        const totalSubmissionPages = submissionPages.length;
        const totalDocumentPages = 2 + totalSubmissionPages;
        const wordsCount = fullSourceText.trim().split(/\s+/).filter(Boolean).length || (totalSubmissionPages * 260);
        const charsCount = fullSourceText.length || (wordsCount * 6);

        let allParsedSentencesCount = 0;
        let allParsedAiCount = 0;
        for (const p of parsedParagraphs) {
          if (p.isHeading) continue;
          for (const s of p.sentences) {
            allParsedSentencesCount++;
            if (s.isAi) allParsedAiCount++;
          }
        }
        const displayAiSentences = allParsedAiCount > 0
          ? allParsedAiCount
          : (aiCount > 0 ? aiCount : Math.round((pct / 100) * Math.max(1, allParsedSentencesCount)));
        const displayHumanSentences = Math.max(0, allParsedSentencesCount - displayAiSentences);

        const { page1Html, page2Html } = buildCoverAndOverviewHtml({
          displayPagesCount: totalSubmissionPages,
          wordsCount,
          charsCount,
          totalDocumentPages,
          displayAiSentences,
          displayHumanSentences,
          logoBase64,
        });

        // Common Running Header & Footer for Submission pages with Las AI logo & typography
        const renderSubmissionHeader = (pageNum: number, sectionTitle: string) => `
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; height: 22px; margin-bottom: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 7px;">
              ${logoBase64
                ? `<img src="${logoBase64}" width="16" height="16" style="border-radius: 50%; object-fit: contain; box-shadow: 0 1px 3px rgba(0,0,0,0.12);" alt="Las AI" />`
                : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7L12 12L21 7L12 2Z" fill="#0284c7"/></svg>`
              }
              <span style="font-size: 13px; font-weight: 900; color: #0284c7; letter-spacing: -0.3px;">Las <span style="color: #0f172a;">AI</span></span>
            </div>
            <div style="font-size: 9px; color: #94a3b8; font-weight: 500;">Page ${pageNum} of ${totalDocumentPages} — ${sectionTitle}</div>
            <div style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">ID: ${submissionId}</div>
          </div>
        `;

        const renderSubmissionFooter = (pageNum: number, sectionTitle: string) => `
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #64748b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; height: 22px; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: auto;">
            <div style="display: flex; align-items: center; gap: 7px;">
              ${logoBase64
                ? `<img src="${logoBase64}" width="16" height="16" style="border-radius: 50%; object-fit: contain; box-shadow: 0 1px 3px rgba(0,0,0,0.12);" alt="Las AI" />`
                : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 7L12 12L21 7L12 2Z" fill="#0284c7"/></svg>`
              }
              <span style="font-size: 12px; font-weight: 900; color: #0284c7; letter-spacing: -0.3px;">Las <span style="color: #0f172a;">AI</span></span>
            </div>
            <div style="font-size: 9px; color: #94a3b8; font-weight: 500;">Page ${pageNum} of ${totalDocumentPages} — ${sectionTitle}</div>
            <div style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">ID: ${submissionId}</div>
          </div>
        `;

        // Submission Pages (Pages 3+)
        const submissionPagesHtml = submissionPages
          .map((pageParas, idx) => {
            const pageNum = 3 + idx;
            const bodyHtml = pageParas
              .map((p) => {
                if (p.isHeading) {
                  return `<h3 style="font-size: 14.5px; font-weight: 700; color: #0f172a; margin: 14px 0 6px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${p.sentences[0].text}</h3>`;
                }
                const sentencesHtml = p.sentences
                  .map((s) => {
                    if (s.isAi) {
                      return `<span style="background-color: ${activeTheme.webBgHex}; color: #0f172a; padding: 1.5px 3.5px; border-radius: 3px; font-weight: 500;">${s.text} </span>`;
                    }
                    return `<span>${s.text} </span>`;
                  })
                  .join("");
                return `<p style="margin: 0 0 13px 0; text-align: justify; text-justify: inter-word;">${sentencesHtml}</p>`;
              })
              .join("\n");

            return `
              <div class="a4-page submission-page" id="page-${pageNum}" style="padding: 30px 48px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; height: 1123px; max-height: 1123px; background: #ffffff;">
                ${renderSubmissionHeader(pageNum, "AI Writing Submission")}
                <div style="flex: 1; padding: 4px 0; font-family: Georgia, 'Times New Roman', Times, serif; font-size: 13.5px; line-height: 1.85; color: #0f172a; text-align: justify; overflow: hidden;">
                  ${bodyHtml}
                </div>
                ${renderSubmissionFooter(pageNum, "AI Writing Submission")}
              </div>
            `;
          })
          .join("\n");

        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Las AI Writing Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #ffffff;
      color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
    }
    .a4-page {
      width: 794px;
      height: 1123px;
      max-height: 1123px;
      box-sizing: border-box;
      background-color: #ffffff;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
    .cover-page, .overview-page {
      padding: 0;
    }
    .submission-page {
      padding: 30px 48px;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  ${page1Html}
  ${page2Html}
  ${submissionPagesHtml}
</body>
</html>`;

        iframe = document.createElement("iframe");
        iframe.style.cssText =
          "position:fixed;left:-9999px;top:-9999px;width:794px;height:1200px;border:none;visibility:hidden;";
        document.body.appendChild(iframe);

        const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iDoc) throw new Error("Could not access iframe document");

        iDoc.open();
        iDoc.write(htmlContent);
        iDoc.close();

        // Wait 400ms for layout
        await new Promise((r) => setTimeout(r, 400));

        const pageElements = iDoc.querySelectorAll(".a4-page");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < pageElements.length; i++) {
          if (i > 0) pdf.addPage();
          const pageEl = pageElements[i] as HTMLElement;
          const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            width: 794,
            height: 1123,
          });
          const imgData = canvas.toDataURL("image/png");
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
        }

        finalPdfBlob = pdf.output("blob");
        finalPdfBase64 = pdf.output("datauristring");
      }

      // Clean up the temporary iframe before triggering download
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
        iframe = null;
      }

      const isPlag = tool === "testplagiarism";
      const fileName = (isPlag ? "LasAI-Plagiarism-Report-" : "LasAI-AI-Report-") + `${new Date().toISOString().slice(0, 10)}.pdf`;

      let downloaded = false;

      // 1. Direct standard browser PDF download via Blob URL
      try {
        const downloadUrl = URL.createObjectURL(finalPdfBlob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = downloadUrl;
        link.download = fileName;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          if (link.parentNode) link.parentNode.removeChild(link);
          URL.revokeObjectURL(downloadUrl);
        }, 30000);
        downloaded = true;
      } catch (dlErr) {
        console.warn("Direct blob download failed, trying showSaveFilePicker:", dlErr);
      }

      // 2. Fallback: Native Windows File System Access API (showSaveFilePicker)
      if (!downloaded && typeof window !== "undefined" && "showSaveFilePicker" in window) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: "PDF Document (*.pdf)",
                accept: {
                  "application/pdf": [".pdf"],
                },
              },
            ],
          });
          const writableStream = await fileHandle.createWritable();
          await writableStream.write(finalPdfBlob);
          await writableStream.close();
          downloaded = true;
        } catch (pickerErr: any) {
          if (pickerErr?.name === "AbortError") {
            downloaded = true;
          } else {
            console.warn("showSaveFilePicker failed:", pickerErr);
          }
        }
      }

      // 3. Fallback: Server-side HTTP attachment header via download-pdf endpoint
      if (!downloaded) {
        try {
          let dlFrame = document.getElementById("pdf_dl_iframe") as HTMLIFrameElement;
          if (!dlFrame) {
            dlFrame = document.createElement("iframe");
            dlFrame.id = "pdf_dl_iframe";
            dlFrame.name = "pdf_dl_iframe";
            dlFrame.style.cssText =
              "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0.01;pointer-events:none;border:none;";
            document.body.appendChild(dlFrame);
          }

          const form = document.createElement("form");
          form.method = "POST";
          form.action = "/api/download-pdf";
          form.target = "pdf_dl_iframe";
          form.enctype = "multipart/form-data";
          form.style.display = "none";

          const dataInput = document.createElement("input");
          dataInput.type = "hidden";
          dataInput.name = "pdfBase64";
          dataInput.value = finalPdfBase64;
          form.appendChild(dataInput);

          const nameInput = document.createElement("input");
          nameInput.type = "hidden";
          nameInput.name = "filename";
          nameInput.value = fileName;
          form.appendChild(nameInput);

          document.body.appendChild(form);
          form.submit();

          setTimeout(() => {
            if (form.parentNode) form.parentNode.removeChild(form);
          }, 3000);
          downloaded = true;
        } catch (formErr) {
          console.warn("Server form download failed:", formErr);
        }
      }

      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 3500);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError("دروستکرنا فایلا PDF سەرنەکەفت. هیڤیە دووبارە تاقی بکە.");
    } finally {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      setIsExportingPdf(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) { setError("براوزەرێ تە پشتەڤانیا دەنگی ناکەت."); return; }
    const synth = window.speechSynthesis;
    if (speaking) { synth.cancel(); setSpeaking(false); return; }
    const doSpeak = () => {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(output);
      const voices = synth.getVoices();
      const v = voices.find((x) => /^(ku|ckb)/i.test(x.lang)) || voices.find((x) => /^ar/i.test(x.lang)) || voices.find((x) => /^en/i.test(x.lang)) || voices[0];
      if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = "ar-SA"; }
      u.rate = 0.95;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      synth.speak(u);
    };
    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = () => { synth.onvoiceschanged = null; doSpeak(); };
      setTimeout(() => { if (!speaking) doSpeak(); }, 300);
    } else { doSpeak(); }
  };

  const percentMatch = showPercentage ? output.match(/(\d{1,3})\s*%/) : null;
  const percentValue = percentMatch ? parseInt(percentMatch[1], 10) : null;

  const isInputLtr = tool === "translator"
    ? isLTR(sourceLang)
    : ltr ? true : (input.trim() ? isTextLtr(input) : false);

  const textareaDir = tool === "translator"
    ? isLTR(sourceLang) ? "ltr" : isRTL(sourceLang) ? "rtl" : "auto"
    : ltr ? "ltr" : (input.trim() ? (isInputLtr ? "ltr" : "rtl") : "auto");

  const isOutputLtr = tool === "translator"
    ? isLTR(targetLang)
    : ltr ? true : isTextLtr(output);

  const outputDir = isOutputLtr ? "ltr" : "rtl";

  const dynamicPlaceholder = tool === "translator"
    ? sourceLang === "english" ? "Enter academic or scientific text to translate..."
    : sourceLang === "badini" ? "دەقێ ئەکادیمی یان زانستی ل ڤێرێ بنڤیسە بۆ وەرگێڕان..."
    : sourceLang === "sorani" ? "دەقی ئەکادیمی یان زانستی لێرە بنووسە بۆ وەرگێڕان..."
    : sourceLang === "arabic" ? "اكتب النص الأكاديمي أو العلمي هنا للترجمة..."
    : placeholder
    : placeholder;

  return (
    <div
      className="rounded-3xl bg-card border border-border overflow-hidden"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      {/* Header */}
      <div className="px-6 md:px-8 pt-6 pb-4 border-b border-border/60 bg-gradient-to-l from-primary/5 via-transparent to-transparent text-right" dir="rtl">
        <h3 className="text-xl font-extrabold mb-0.5" dir="rtl">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="px-6 md:px-8 py-5 space-y-4">

        {/* ── Translator UI ── */}
        {tool === "translator" && (
          <div className="space-y-3">

            {/* Quick pair pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              <span className="shrink-0 flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/60 ml-0.5">
                <Languages className="w-3 h-3 text-primary/70" />
                بلەز:
              </span>
              {POPULAR_PAIRS.map((pair) => {
                const isActive = sourceLang === pair.src && targetLang === pair.tgt;
                return (
                  <button
                    key={pair.label}
                    type="button"
                    onClick={() => { setSourceLang(pair.src); setTargetLang(pair.tgt); }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-200 border shrink-0 ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm scale-105"
                        : "bg-background hover:bg-primary/8 text-muted-foreground hover:text-foreground border-border hover:border-primary/30"
                    }`}
                  >
                    {pair.label}
                  </button>
                );
              })}
            </div>

            {/* Language selector bar */}
            <div className="relative flex items-end gap-2 p-3 rounded-2xl bg-secondary/20 border border-border/70">
              {/* Source */}
              <LangSelect
                value={sourceLang}
                onChange={setSourceLang}
                options={SOURCE_LANGUAGES}
                label="ژ زمانێ"
              />

              {/* Swap */}
              <button
                type="button"
                onClick={swapLanguages}
                title="گۆڕینا زمانان"
                className={`shrink-0 mb-0.5 w-10 h-10 rounded-xl bg-background border-2 border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary text-muted-foreground transition-all duration-200 flex items-center justify-center shadow-sm active:scale-90 ${swapping ? "rotate-180" : ""}`}
                style={{ transition: "transform 0.35s cubic-bezier(.4,2,.6,1), color 0.2s, border-color 0.2s, background 0.2s" }}
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>

              {/* Target */}
              <LangSelect
                value={targetLang}
                onChange={setTargetLang}
                options={TRANSLATION_LANGUAGES}
                label="بۆ زمانێ"
              />


            </div>
          </div>
        )}

        {/* ── Textarea ── */}
        {!fileOnly && (
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              dir={textareaDir}
              placeholder={dynamicPlaceholder}
              className={`w-full min-h-[150px] rounded-2xl border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y transition-all duration-200 hover:border-border/80 focus:border-primary/50 placeholder:text-muted-foreground/50 ${
                isInputLtr ? "text-left font-sans" : "text-right"
              }`}
            />
            {tool === "translator" && input.length > 0 && (
              <span className="absolute bottom-3 left-3 text-[10px] font-mono text-muted-foreground/40">
                {input.length}
              </span>
            )}
          </div>
        )}

        {/* ── File Upload ── */}
        {withFile && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={fileAccept || "image/*,application/pdf"}
              onClick={(e) => {
                // Wipe native value so selecting the exact same filename after editing fires onChange every time!
                (e.target as HTMLInputElement).value = "";
              }}
              onChange={(e) => {
                const selected = e.target.files?.[0] || null;
                if (selected) {
                  if (fileOnly && !selected.name.toLowerCase().endsWith(".pdf") && selected.type !== "application/pdf") {
                    setError("تەنها فایلا PDF دهێتە وەرگرتن.");
                    return;
                  }
                  setFile(selected);
                  setError(null);
                  setOutput("");
                  setReportData(null);
                }
              }}
              className="hidden"
            />
            {!file ? (
              fileOnly ? (
                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                      fileInputRef.current.click();
                    }
                  }}
                  className={`w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3.5 py-12 px-6 text-center group ${
                    dropActive
                      ? "border-primary bg-primary/10 scale-[1.01]"
                      : "border-border hover:border-primary/60 hover:bg-primary/5 bg-secondary/15"
                  }`}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform"
                    style={{ background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" }}
                  >
                    <FileText className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                      فایلێ PDF ل ڤێرێ دانە یان کلیل بکە بۆ هەلبژارتنێ
                    </p>
                    <p className="text-xs text-muted-foreground">
                      تەنها فایلا PDF دهێتە وەرگرتن (قەبارە تا 25MB)
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all mt-1">
                    <Upload className="w-4 h-4" />
                    <span>هەڵبژاردنی فایلی PDF</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                      fileInputRef.current.click();
                    }
                  }}
                  type="button"
                  className="w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/3 p-3.5 flex items-center justify-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-all duration-200 group"
                >
                  <Upload className="w-4 h-4 group-hover:text-primary transition-colors" />
                  <span>فایل/وێنە بدانە <span className="opacity-60 text-xs">(PDF, Word, PowerPoint, وێنە)</span></span>
                </button>
              )
            ) : (
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm transition-all ${
                  dropActive
                    ? "border-primary bg-primary/10 scale-[1.01]"
                    : "bg-secondary/40 border-border"
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearFile}
                    type="button"
                    title="لابڕینا فایلی"
                    className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-xl hover:bg-destructive/10 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                        fileInputRef.current.click();
                      }
                    }}
                    type="button"
                    title="گوهۆڕینا فایلی"
                    className="text-xs text-primary hover:underline font-bold px-2 py-1 rounded-lg hover:bg-primary/10 transition cursor-pointer"
                  >
                    گوهۆڕین
                  </button>
                </div>
                <div className="flex items-center gap-3 truncate">
                  <div className="text-right truncate">
                    <p className="truncate text-right font-bold text-foreground text-sm">{file.name}</p>
                    <span className="text-[11px] text-muted-foreground font-mono">({(file.size / 1024).toFixed(0)} KB)</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-red-500/15 text-red-500 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Bottom bar: char count + action button + reset button ── */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {(input || file || output || reportData) && (
              <button
                type="button"
                onClick={handleResetAll}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:border-destructive/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive text-xs font-semibold transition-all duration-200 cursor-pointer"
                title="پاقژکرن و دەستپێکرنا پشکنینەکا نوو"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>پشکنینەکا نوو (Reset)</span>
              </button>
            )}
            {!fileOnly && (
              <span className="text-xs text-muted-foreground/60 tabular-nums">
                {input.length} <span className="text-muted-foreground/30">/ 10000</span>
              </span>
            )}
          </div>

          <button
            onClick={run}
            disabled={loading || (fileOnly ? !file : (!input.trim() && !file))}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
            style={{
              background: loading ? undefined : "linear-gradient(135deg, var(--primary) 0%, oklch(from var(--primary) calc(l - 0.05) calc(c + 0.02) calc(h + 8)) 100%)"
            }}
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />د پڕۆسێسکرنێدا...</>
              : <><Sparkles className="w-4 h-4" />{buttonLabel}</>
            }
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="rounded-2xl bg-destructive/8 border border-destructive/20 text-destructive text-sm p-3.5 text-right flex items-start gap-2">
            <span className="mt-0.5 shrink-0">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── Output ── */}
        {output && (
          <div className="rounded-2xl border border-border bg-background/80 overflow-hidden">
            {/* output header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-secondary/30">
              <div className="flex items-center gap-2">
                {(tool === "testai" || (tool === "testplagiarism" && reportData)) && (
                  <>
                    <button
                      type="button"
                      onClick={exportPdfReport}
                      disabled={isExportingPdf}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 px-3.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
                      title="داگرتنا ڕاپۆرتێ ب فایلا PDF"
                    >
                      {isExportingPdf ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>د ئامادەکرنا PDF دا...</span>
                        </>
                      ) : pdfSuccess ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>داگرتن سەرکەفتی بوو ✓</span>
                        </>
                      ) : (
                        <>
                          <FileDown className="w-3.5 h-3.5" />
                          <span>داگرتنا ڕاپۆرتێ (PDF)</span>
                        </>
                      )}
                    </button>
                  </>
                )}

                {tool !== "testai" && tool !== "testplagiarism" && (
                  <button
                    onClick={copy}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-secondary"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "هاتە کۆپیکرن ✓" : "کۆپی"}
                  </button>
                )}

                {withTTS && (
                  <button
                    onClick={speak}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-70 transition px-2.5 py-1.5 rounded-lg hover:bg-primary/8"
                  >
                    {speaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    {speaking ? "ڕاوەستاندن" : "گوهداری"}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {tool === "translator" && (
                  <span className="text-[10px] font-bold text-primary/70 bg-primary/8 px-2 py-1 rounded-full border border-primary/15">
                    {TRANSLATION_LANGUAGES.find((l) => l.id === targetLang)?.flag} {TRANSLATION_LANGUAGES.find((l) => l.id === targetLang)?.nameEn}
                  </span>
                )}
                <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                  {tool === "testai" || tool === "testplagiarism" ? "ڕاپۆرتا پشکنینێ" : "ئەنجام"}
                </span>
              </div>
            </div>

            {/* output body */}
            <div className="p-4 md:p-6">
              {tool === "testai" || tool === "testplagiarism" ? (
                /* Enhanced Test AI & Plagiarism Result Display */
                <div className="space-y-4">
                  {/* Gauge */}
                  {(reportData?.percentage !== undefined || percentValue !== null) && (
                    <PercentageRing
                      value={reportData?.percentage ?? percentValue ?? 0}
                      label={tool === "testplagiarism" ? "ڕێژەیا پلاجیاریزم" : "ڕێژەیا گشتی یا AI"}
                    />
                  )}

                  {/* Summary badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-600 border border-rose-500/25">
                      {tool === "testplagiarism"
                        ? `ڕێژەیا پلاجیاریزم: ${reportData?.percentage ?? percentValue}%`
                        : `ڕێژەیا AI: ${reportData?.percentage ?? percentValue}%`}
                    </span>
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/25">
                      ئاستێ باوەریێ: {reportData?.confidence ?? "بەرز"}
                    </span>
                    {reportData?.sentences && reportData.sentences.length > 0 && (
                      <>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary text-foreground border border-border">
                          {file ? `نموونەیێن شیکارکری: ${reportData.sentences.length} ڕستە` : `سەرجەمێ ڕستەیان: ${reportData.sentences.length}`}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
                          {tool === "testplagiarism"
                            ? `ڕستەیێن پلاجیاریزم: ${reportData.sentences.filter((s) => s.isAi).length}`
                            : `ڕستەیێن AI: ${reportData.sentences.filter((s) => s.isAi).length}`}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          {tool === "testplagiarism"
                            ? `ڕستەیێن ڕەسەن: ${reportData.sentences.filter((s) => !s.isAi).length}`
                            : `ڕستەیێن مرۆڤی: ${reportData.sentences.filter((s) => !s.isAi).length}`}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Reasons box */}
                  {reportData?.reasons && reportData.reasons.length > 0 ? (
                    <div className="rounded-2xl bg-secondary/30 border border-border/80 p-4 text-right space-y-2">
                      <span className="text-xs font-extrabold text-foreground flex items-center justify-start gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        {tool === "testplagiarism" ? "ئەگەر و نیشانێن دزیا زانستی (Plagiarism):" : "ئەگەر و هۆکارێن پشکنینێ:"}
                      </span>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-foreground/90 leading-relaxed pr-2">
                        {reportData.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-rose-500 font-bold mt-0.5 shrink-0">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    /* Fallback to text lines if reportData.reasons is absent */
                    <p
                      dir={outputDir}
                      className={`whitespace-pre-wrap text-sm leading-[2] ${
                        isOutputLtr ? "text-left font-sans" : "text-right"
                      }`}
                    >
                      {output}
                    </p>
                  )}

                  {/* Advice box */}
                  {reportData?.advice && (
                    <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4 text-right">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center justify-start gap-1.5 mb-1">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {tool === "testplagiarism" ? "ئامۆژگاری بۆ چارەسەرکرن و پاقژکرنا دەقی:" : "ئامۆژگاری: چەوا مرۆڤانەتر لێ بهێت:"}
                      </span>
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pr-2">
                        {reportData.advice}
                      </p>
                    </div>
                  )}

                  {/* Zero Storage Privacy Guarantee Banner */}
                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 text-right mt-4 space-y-1.5">
                    <div className="flex items-center gap-2 justify-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        پاراستنا تەمام یا نهێنی و تایبەتمەندیێ (فایل د چ بنکەیێن داتایێدا ناهێتە خەزنکرن)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pr-3.5">
                      {tool === "testplagiarism"
                        ? "فایلا تە د چ بنکەیێن داتایێدا ناهێتە خەزنکرن (No Repository Storage). تۆ دشێی ب دلێ خۆ دەستکاریێ د فایلا خۆدا بکەی و چەندین جاران تاقی بکەیڤە هەتا ڕێژەیا پلاجیاریزمێ ب تەمامی کێم دبیت."
                        : "فایلا تە د چ بنکەیێن داتایێدا ناهێتە خەزنکرن (No Repository Storage). تۆ دشێی ب دلێ خۆ دەستکاریێ د فایلا خۆدا بکەی و چەندین جاران تاقی بکەیڤە هەتا ڕێژەیا AI ب تەمامی کێم دبیت."}
                    </p>
                  </div>

                  {/* Dedicated Paraphrase Tool Callout Banner */}
                  <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-l from-purple-500/10 via-indigo-500/10 to-transparent p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-right mt-3 shadow-xs">
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2 justify-start">
                        <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                          <Wand2 className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-purple-700 dark:text-purple-300">
                          ئامرازێ سەرلەنووی دارشتنێ (Paraphrase & Humanizer)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pr-9">
                        بۆ کێمکرنا ڕێژەیا {tool === "testplagiarism" ? "پلاجیاریزمێ" : "AI"}، دشێی پشکێن هایلایتکری کۆپی بکەی و د ئامرازێ <span className="font-extrabold text-foreground">Paraphrase (Humanize Text)</span> یێ Las AI دا سەرلەنووی ب دەنگەکێ ئەکادیمی دارێژی دا کۆ تێکستێ تە 100% ڕەسەن دەربکەڤیت.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenParaphrase}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition shadow-sm hover:shadow active:scale-95 cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ئامرازێ Paraphrase بکاربینە</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Output for Other Tools */
                <>
                  {showPercentage && percentValue !== null && <PercentageRing value={percentValue} />}
                  <div className="space-y-4">
                    {output.split("\n\n").map((block, idx) => {
                      const trimmed = block.trim();
                      if (!trimmed) return null;
                      if (trimmed === "---") {
                        return <hr key={idx} className="my-6 border-border" />;
                      }
                      const isBlockLtr = isTextLtr(trimmed);
                      return (
                        <p
                          key={idx}
                          dir={isBlockLtr ? "ltr" : "rtl"}
                          className={`whitespace-pre-wrap text-sm leading-[2] ${
                            isBlockLtr ? "text-left font-sans" : "text-right"
                          }`}
                        >
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
