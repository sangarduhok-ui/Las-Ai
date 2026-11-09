import { useState, useRef, DragEvent } from "react";
import { Upload, X, Loader2, FileOutput, Download } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function WordToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | null) => {
    if (!f) return;
    const ok = f.name.endsWith(".docx") || f.name.endsWith(".doc") || f.type.includes("word");
    if (!ok) { setError("تنێ فایلێن .docx یان .doc قبول دکرن."); return; }
    if (f.size === 0) {
      setError("ئەڤ فایلە یا بەتاڵە و قەبارێ وێ (0 KB) یە! دەمێ فایل ل سەر کۆمپیوتەری دهێتە دروستکرن، هەتا تێدا نەهێتە نڤیسین و خەزنکرن (Save)، بەتاڵە. تکایە فایلێ بکەوە و دەق تێدا بنڤیسە و Save بکە.");
      setFile(null);
      setResult(null);
      return;
    }
    setFile(f); setError(null); setResult(null);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(true); };
  const onDragLeave = () => setDropActive(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(false); pickFile(e.dataTransfer.files?.[0] || null); };

  const convert = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null); setProgress("د گۆڕینا فایلێدا ب دیزاین و شێوەیێن دروست...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/convert-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errMsg = "کێشەیەک لە کاتی گۆڕینی فایل هاتە دی.";
        try {
          const errJson = await res.json();
          if (errJson?.error) errMsg = errJson.error;
        } catch {}
        throw new Error(errMsg);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const outName = file.name.replace(/\.[^.]+$/, "") + ".pdf";
      setResult({ url, name: outName });
    } catch (e: any) {
      console.error(e);
      let rawMsg = e?.message || String(e);
      let friendly = rawMsg;
      if (rawMsg.includes("End of data reached") || rawMsg.includes("Corrupted zip") || rawMsg.includes("can't find end of central directory")) {
        friendly = "ئەڤ فایلە یا بەتاڵە یان تێکچوویە (قەبارێ وێ سفرە). تکایە فایلێ د Word دا بکەوە و دەق تێدا بنڤیسە و خەزن (Save) بکەی، پاشان بار بکەی.";
      }
      setError("کێشەیەک هاتە دی د گۆڕینا Wordدا: " + friendly);
    } finally { setLoading(false); setProgress(""); }
  };

  const reset = () => { if (result?.url) URL.revokeObjectURL(result.url); setFile(null); setResult(null); setError(null); };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 md:p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
      <div className="mb-6 text-right">
        <div className="flex items-center justify-end gap-3 mb-1">
          <h3 className="text-xl font-extrabold">گۆڕینا Word بو PDF</h3>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground shrink-0" style={{ background: "var(--gradient-primary)" }}>
            <FileOutput className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">فایلا .docx بدانە — دەق و ساختار دبێت فایلا PDF.</p>
      </div>

      {!file ? (
        <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}
          className={`relative w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-10 px-4 mb-6 ${dropActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/60 hover:bg-secondary/40"}`}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><Upload className="w-6 h-6" /></div>
          <div className="text-center">
            <p className="font-bold text-sm mb-0.5">فایلا Word خۆ بار بکە (.docx)</p>
            <p className="text-xs text-muted-foreground">کلیک بکە یان drag &amp; drop بکە</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => pickFile(e.target.files?.[0] || null)} className="hidden" />
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
          <FileOutput className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0 text-right">
            <p className="text-sm font-semibold truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          <button type="button" onClick={reset} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0"><X className="w-4 h-4" /></button>
        </div>
      )}

      {error && <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3 mb-4 text-right">{error}</div>}
      {loading && (
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-4 text-right">
          <div className="flex items-center justify-end gap-2"><span className="text-sm font-semibold text-primary">{progress}</span><Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" /></div>
          <p className="text-xs text-muted-foreground mt-1">تکایە چاوەڕێ بکە.</p>
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-border bg-background p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">ئەنجام</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-success/15 text-success">ئامادەیە ✓</span>
          </div>
          <a href={result.url} download={result.name} className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold hover:opacity-90 transition" style={{ boxShadow: "var(--shadow-glow)" }}>
            <Download className="w-4 h-4" /> دانلودکرنا فایلا PDF
          </a>
          <p className="text-center text-[10px] text-muted-foreground mt-2">{result.name}</p>
        </div>
      )}

      {!result && !loading && (
        <div className="flex justify-end">
          <button type="button" onClick={convert} disabled={!file} className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition" style={{ boxShadow: file ? "var(--shadow-glow)" : undefined }}>
            <FileOutput className="w-4 h-4" /> بگۆڕە — PDF دانلود بکە
          </button>
        </div>
      )}
      {result && <div className="flex justify-end mt-2"><button type="button" onClick={reset} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition">فایلەکادی ئەپلۆد بکە</button></div>}
    </div>
  );
}
