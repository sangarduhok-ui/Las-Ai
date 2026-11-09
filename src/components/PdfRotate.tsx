import { useState, useRef, DragEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { Upload, X, Loader2, FileText, Download, RotateCw } from "lucide-react";
import { PDFDocument, degrees } from "@cantoo/pdf-lib";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ROTATIONS = [
  { label: "90°", sub: "ژ ڕاست", value: 90 },
  { label: "180°", sub: "وارەکرن", value: 180 },
  { label: "270°", sub: "ژ چەپ", value: 270 },
];

export function PdfRotate() {
  const { isAuthenticated, openAuthModal, consumeToolQuota } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [rotationIdx, setRotationIdx] = useState(0);
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) {
      setError("تنێ فایلێن PDF قبول دکرن.");
      return;
    }
    setFile(f); setError(null); setResult(null);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(true); };
  const onDragLeave = () => setDropActive(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(false); pickFile(e.dataTransfer.files?.[0] || null); };

  const rotate = async () => {
    if (!file) return;
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    setLoading(true); setError(null); setResult(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const angle = ROTATIONS[rotationIdx].value;
      pdfDoc.getPages().forEach((page) => {
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + angle) % 360));
      });
      const bytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResult({ url, name: file.name.replace(/\.pdf$/i, "") + "_rotated.pdf", size: bytes.byteLength });
    } catch (e) {
      setError(e instanceof Error ? e.message : "کێشەیەک هاتە دی د زڤرنا PDFێدا.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { if (result?.url) URL.revokeObjectURL(result.url); setFile(null); setResult(null); setError(null); };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 md:p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
      {/* Header */}
      <div className="mb-6 text-right">
        <div className="flex items-center justify-end gap-3 mb-1">
          <h3 className="text-xl font-extrabold">زڤرنا رووپەلێن PDFێ</h3>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground shrink-0" style={{ background: "var(--gradient-primary)" }}>
            <RotateCw className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">فایلێ PDF بدانە، ئاراستەیا زڤرنێ هەلبژێرە و دانلود بکە.</p>
      </div>

      {/* Upload */}
      {!file ? (
        <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}
          className={`relative w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-10 px-4 mb-6 ${dropActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/60 hover:bg-secondary/40"}`}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm mb-0.5">فایلا PDFێ خۆ بار بکە</p>
            <p className="text-xs text-muted-foreground">کلیک بکە یان drag &amp; drop بکە</p>
          </div>
          <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={(e) => pickFile(e.target.files?.[0] || null)} className="hidden" />
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
          <FileText className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0 text-right">
            <p className="text-sm font-semibold truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          <button type="button" onClick={reset} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0" aria-label="سڕین">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Rotation picker */}
      {file && !result && (
        <div className="mb-5">
          <p className="text-xs font-bold text-muted-foreground text-right mb-3">ئاراستەیا زڤرنێ هەلبژێرە</p>
          <div className="grid grid-cols-3 gap-2">
            {ROTATIONS.map((r, i) => (
              <button key={i} type="button" onClick={() => setRotationIdx(i)}
                className={`rounded-xl border px-3 py-3 flex flex-col items-center gap-1 transition ${rotationIdx === i ? "border-primary bg-primary/8 shadow-sm" : "border-border hover:border-primary/40 hover:bg-secondary/40"}`}>
                <RotateCw className={`w-5 h-5 ${rotationIdx === i ? "text-primary" : "text-muted-foreground"}`} style={{ transform: `rotate(${(i * 90)}deg)` }} />
                <span className={`text-sm font-extrabold ${rotationIdx === i ? "text-primary" : "text-foreground"}`}>{r.label}</span>
                <span className="text-[10px] text-muted-foreground">{r.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3 mb-4 text-right">{error}</div>}

      {/* Result */}
      {result && (
        <div className="rounded-xl border border-border bg-background p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">ئەنجام</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-success/15 text-success">ئامادەیە ✓</span>
          </div>
          <div className="rounded-lg bg-secondary/40 p-3 mb-4 text-right">
            <p className="text-xs text-muted-foreground mb-0.5">فایلا زڤیری</p>
            <p className="text-sm font-bold">{formatBytes(result.size)}</p>
          </div>
          <a href={result.url} download={result.name}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold hover:opacity-90 transition"
            style={{ boxShadow: "var(--shadow-glow)" }}>
            <Download className="w-4 h-4" /> دانلودکرن
          </a>
        </div>
      )}

      {!result && !loading && (
        <div className="flex justify-end">
          <button type="button" onClick={rotate} disabled={!file}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition"
            style={{ boxShadow: file ? "var(--shadow-glow)" : undefined }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
            {loading ? "د زڤرنێدا..." : "بزڤێرە و دانلود بکە"}
          </button>
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-end gap-2 text-primary">
          <span className="text-sm font-semibold">د زڤرنێدا...</span>
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
      {result && (
        <div className="flex justify-end mt-2">
          <button type="button" onClick={reset} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition">فایلەکادی ئەپلۆد بکە</button>
        </div>
      )}
    </div>
  );
}
