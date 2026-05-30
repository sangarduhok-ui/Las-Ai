import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, FileText, X, Sparkles, Copy, Check, AlertCircle, Loader2 } from "lucide-react";

type Summary = {
  title?: string;
  language_detected?: string;
  main_points?: string[];
  definitions?: { term: string; definition: string }[];
  dates_formulas?: string[];
};

const MAX_BYTES = 25 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result);
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

export function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    setError(null);
    setSummary(null);
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setError("قەبارەی فایل زۆرە. زۆرترین قەبارە ٢٥ مێگابایتە.");
      return;
    }
    const ok = f.type === "application/pdf" || f.type.startsWith("image/");
    if (!ok) {
      setError("تەنیا PDF یان وێنە قبوڵە.");
      return;
    }
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  }, []);

  const summarize = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const b64 = await fileToBase64(file);
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: b64, mimeType: file.type, fileName: file.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "هەڵە لە سەرڤیس");
      setSummary(data.summary as Summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "هەڵەیەک ڕوویدا");
    } finally {
      setLoading(false);
    }
  };

  const summaryText = summary
    ? [
        summary.title ? `📘 ${summary.title}` : "",
        "",
        "🔹 خاڵە سەرەکیەکان:",
        ...(summary.main_points ?? []).map((p, i) => `${i + 1}. ${p}`),
        "",
        "📖 پێناسە گرنگەکان:",
        ...(summary.definitions ?? []).map((d) => `• ${d.term}: ${d.definition}`),
        "",
        "📅 ڕێکەوت و فۆرمولەکان:",
        ...(summary.dates_formulas ?? []).map((d) => `• ${d}`),
      ].join("\n")
    : "";

  const copy = async () => {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-10 md:p-14 text-center transition-all bg-card ${
          dragOver
            ? "border-primary bg-accent/30 scale-[1.01]"
            : "border-border hover:border-primary/60 hover:bg-accent/10"
        }`}
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-primary-foreground animate-float"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            <Upload className="w-9 h-9" />
          </div>
          {file ? (
            <div className="flex items-center gap-3 bg-secondary px-4 py-2 rounded-full">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setSummary(null);
                }}
                className="text-muted-foreground hover:text-destructive"
                aria-label="سڕینەوە"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-xl md:text-2xl font-bold">فایلەکەت ڕابکێشە یان کلیک بکە</h3>
              <p className="text-muted-foreground text-sm">
                پشتگیری PDF و وێنە دەکات • زۆرترین قەبارە ٢٥ مێگابایت
              </p>
            </>
          )}
        </div>
      </div>

      <button
        onClick={summarize}
        disabled={!file || loading}
        className="mt-6 w-full relative overflow-hidden rounded-2xl px-8 py-5 text-lg font-bold text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
        style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
      >
        <span className="flex items-center justify-center gap-3">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>AI خەریکی خوێندنەوەیە...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>پوختە بکە</span>
            </>
          )}
        </span>
        {loading && <span className="absolute inset-0 shimmer pointer-events-none" />}
      </button>

      {loading && (
        <div className="mt-8 flex flex-col items-center gap-4 py-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-ring">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <p className="text-muted-foreground">پەڕەکان دەخوێنرێنەوە و پوختە ئامادە دەکرێت...</p>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5">
          <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-destructive">هەڵە</p>
            <p className="text-sm text-foreground/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {summary && !loading && (
        <article
          className="mt-8 rounded-3xl p-6 md:p-8 border border-border"
          style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-elegant)" }}
        >
          <header className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-border">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
                {summary.title ?? "پوختەی بەڵگەنامە"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">پوختەیەکی ئامادەکراو بۆ خوێندن</p>
            </div>
            <button
              onClick={copy}
              className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "کۆپی کرا" : "کۆپی"}
            </button>
          </header>

          {!!summary.main_points?.length && (
            <section className="mb-6">
              <h3 className="text-lg font-bold mb-3 text-primary">🔹 خاڵە سەرەکیەکان</h3>
              <ul className="space-y-2">
                {summary.main_points.map((p, i) => (
                  <li key={i} className="flex gap-3 leading-relaxed">
                    <span className="font-bold text-primary shrink-0">{i + 1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!!summary.definitions?.length && (
            <section className="mb-6">
              <h3 className="text-lg font-bold mb-3 text-primary">📖 پێناسە گرنگەکان</h3>
              <div className="grid gap-3">
                {summary.definitions.map((d, i) => (
                  <div key={i} className="rounded-xl bg-secondary/60 p-4">
                    <div className="font-bold text-foreground">{d.term}</div>
                    <div className="text-muted-foreground text-sm mt-1 leading-relaxed">{d.definition}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!!summary.dates_formulas?.length && (
            <section>
              <h3 className="text-lg font-bold mb-3 text-primary">📅 ڕێکەوت و فۆرمولەکان</h3>
              <ul className="space-y-2">
                {summary.dates_formulas.map((d, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      )}
    </div>
  );
}
