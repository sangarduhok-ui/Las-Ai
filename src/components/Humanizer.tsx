import { useState } from "react";
import { Sparkles, Copy, Check, Loader2 } from "lucide-react";

export function Humanizer() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const r = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
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

  return (
    <div className="rounded-2xl bg-card border border-border p-6 md:p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
      <div className="mb-4 text-right">
        <h3 className="text-xl font-extrabold mb-1">AI Text → Humanize Text</h3>
        <p className="text-sm text-muted-foreground">دەقی دروستکراو بە AI بنووسە، ئێمە دەیگۆڕین بۆ نوسینێکی مرۆیی سروشتی بە ئینگلیزی.</p>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        dir="ltr"
        placeholder="Paste your AI-generated English text here..."
        className="w-full min-h-[160px] rounded-xl border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
      />

      <div className="flex items-center justify-between mt-3 mb-4">
        <span className="text-xs text-muted-foreground">{input.length} / 8000</span>
        <button
          onClick={run}
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "گۆڕین..." : "گۆڕە بۆ مرۆیی"}
        </button>
      </div>

      {error && <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3 mb-3 text-right">{error}</div>}

      {output && (
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between mb-2">
            <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "کۆپی کرا" : "کۆپی"}
            </button>
            <span className="text-xs font-semibold text-muted-foreground">Humanized</span>
          </div>
          <p dir="ltr" className="whitespace-pre-wrap text-sm leading-relaxed">{output}</p>
        </div>
      )}
    </div>
  );
}
