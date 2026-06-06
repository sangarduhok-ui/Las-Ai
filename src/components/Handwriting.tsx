import { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Copy, Check, Loader2, X } from "lucide-react";

export function Handwriting() {
  const [preview, setPreview] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("تنێ وێنە قبوول دبیت.");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      setError("قەبارا وێنێ پر یە (پترین ٨MB).");
      return;
    }
    setError(null);
    setOutput("");
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const run = async () => {
    if (!preview) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const r = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "چەوتی");
      setOutput(data.output || "");
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

  const reset = () => {
    setPreview(null);
    setOutput("");
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 md:p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
      <div className="mb-4 text-right">
        <h3 className="text-xl font-extrabold mb-1">گهۆڕینا دەستنڤیسی بو دەقی</h3>
        <p className="text-sm text-muted-foreground">وێنا دەستنڤیسی ئاپلود بکە، ئەم دەقی بو تە دەردێخینین.</p>
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />

      {!preview ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-border hover:border-primary/60 hover:bg-secondary/40 transition p-10 flex flex-col items-center gap-3"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            <Upload className="w-7 h-7" />
          </div>
          <span className="font-semibold">کلیک بکە بو هەلبژارتنا وێنێ</span>
          <span className="text-xs text-muted-foreground">PNG, JPG — تا ٨MB</span>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-border bg-background">
            <img src={preview} alt="preview" className="w-full max-h-80 object-contain" />
            <button onClick={reset} className="absolute top-2 left-2 w-8 h-8 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-background">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-end">
            <button
              onClick={run}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              {loading ? "د خواندنێدا..." : "دەرئێخستنا دەقی"}
            </button>
          </div>
        </div>
      )}

      {error && <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3 mt-4 text-right">{error}</div>}

      {output && (
        <div className="rounded-xl border border-border bg-background p-4 mt-4">
          <div className="flex items-center justify-between mb-2">
            <button onClick={copy} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "هاتە کۆپیکرن" : "کۆپی"}
            </button>
            <span className="text-xs font-semibold text-muted-foreground">دەقێ دەرئێخستی</span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-right">{output}</p>
        </div>
      )}
    </div>
  );
}
