import { useState } from "react";
import { Sparkles, Copy, Check, Loader2, Volume2, Square } from "lucide-react";

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
}

export function AiTool({ tool, title, description, placeholder, buttonLabel, ltr, withTTS }: Props) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const r = await fetch("/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, input }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "هەڵە");
      setOutput(data.output || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "هەڵە");
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
      setError("براوزەرەکەت پشتگیری دەنگ ناکات.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(output);
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  };

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
        className="w-full min-h-[160px] rounded-xl border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
      />

      <div className="flex items-center justify-between mt-3 mb-4">
        <span className="text-xs text-muted-foreground">{input.length} / 10000</span>
        <button
          onClick={run}
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "پرۆسێسکردن..." : buttonLabel}
        </button>
      </div>

      {error && <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3 mb-3 text-right">{error}</div>}

      {output && (
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "کۆپی کرا" : "کۆپی"}
              </button>
              {withTTS && (
                <button onClick={speak} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80">
                  {speaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  {speaking ? "ڕاگرتن" : "گوێ لێ بگرە"}
                </button>
              )}
            </div>
            <span className="text-xs font-semibold text-muted-foreground">ئەنجام</span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-right">{output}</p>
        </div>
      )}
    </div>
  );
}
