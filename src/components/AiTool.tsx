import { useState, useRef } from "react";
import { Sparkles, Copy, Check, Loader2, Volume2, Square, Upload, X } from "lucide-react";

type ToolKey =
  | "planner"
  | "solver"
  | "math2word"
  | "tts"
  | "grader"
  | "glossary"
  | "testai"
  | "testplagiarism";

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
}

function PercentageRing({ value }: { value: number }) {
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
        </div>
      </div>
    </div>
  );
}

export function AiTool({ tool, title, description, placeholder, buttonLabel, ltr, withTTS, withFile, fileAccept, showPercentage }: Props) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (f: File) => new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      res(s.split(",")[1] || "");
    };
    r.onerror = rej;
    r.readAsDataURL(f);
  });

  const run = async () => {
    if (!input.trim() && !file) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const payload: Record<string, unknown> = { tool, input };
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
      if (!r.ok) throw new Error(data.error || "چەوتی");
      setOutput((data.output || "").replace(/\*\*/g, ""));
    } catch (e) {
      setError(e instanceof Error ? e.message : "چەوتی");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("براوزەرێ تە پشتەڤانیا دەنگی ناکەت.");
      return;
    }
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }

    const doSpeak = () => {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(output);
      const voices = synth.getVoices();
      const v =
        voices.find((x) => /^(ku|ckb)/i.test(x.lang)) ||
        voices.find((x) => /^ar/i.test(x.lang)) ||
        voices.find((x) => /^fa/i.test(x.lang)) ||
        voices.find((x) => /^en/i.test(x.lang)) ||
        voices[0];
      if (v) {
        u.voice = v;
        u.lang = v.lang;
      } else {
        u.lang = "ar-SA";
      }
      u.rate = 0.95;
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      synth.speak(u);
    };

    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = () => {
        synth.onvoiceschanged = null;
        doSpeak();
      };
      // fallback
      setTimeout(() => {
        if (!speaking) doSpeak();
      }, 300);
    } else {
      doSpeak();
    }
  };

  const percentMatch = showPercentage ? output.match(/(\d{1,3})\s*%/) : null;
  const percentValue = percentMatch ? parseInt(percentMatch[1], 10) : null;

  return (
    <div className="rounded-2xl bg-card border border-border p-6 md:p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
      <div className="mb-4 text-right">
        <h3 className="text-xl font-extrabold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        dir={ltr ? "ltr" : "auto"}
        placeholder={placeholder}
        className="w-full min-h-[140px] rounded-xl border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
      />

      {withFile && (
        <div className="mt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={fileAccept || "image/*,application/pdf"}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          {!file ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/60 p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
            >
              <Upload className="w-4 h-4" />
              فایل/وێنە دایننە (PDF, Word, PowerPoint, وێنە)
            </button>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
              <button onClick={() => setFile(null)} type="button" className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
              <span className="truncate text-right">{file.name}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 mb-4">
        <span className="text-xs text-muted-foreground">{input.length} / 10000</span>
        <button
          onClick={run}
          disabled={loading || (!input.trim() && !file)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "د پڕۆسێسکرنێدا..." : buttonLabel}
        </button>
      </div>

      {error && <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3 mb-3 text-right">{error}</div>}

      {output && (
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "هاتە کۆپیکرن" : "کۆپی"}
              </button>
              {withTTS && (
                <button onClick={speak} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80">
                  {speaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  {speaking ? "ڕاوەستاندن" : "گوهداری بکە"}
                </button>
              )}
            </div>
            <span className="text-xs font-semibold text-muted-foreground">ئەنجام</span>
          </div>
          {showPercentage && percentValue !== null && <PercentageRing value={percentValue} />}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-right">{output}</p>
        </div>
      )}
    </div>
  );
}
