import { useState, useRef, DragEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Upload,
  X,
  Loader2,
  FileText,
  Download,
  FileDown,
  Settings2,
} from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const QUALITY_LEVELS = [
  {
    id: "low",
    label: "کێمکرنا سڤک",
    sub: "کوالیتییا بەرز و رون",
    badge: "کوالیتی بەرز",
    size: "~25-35٪ کێمتر",
    emoji: "🟢",
    scale: 0.88,
    value: 0.50,
  },
  {
    id: "medium",
    label: "کێمکرنا هاوسەنگ",
    sub: "هاوسەنگ و پێشنیارکری",
    badge: "پێشنیارکری",
    size: "~50-60٪ کێمتر",
    emoji: "🟡",
    scale: 0.72,
    value: 0.38,
  },
  {
    id: "high",
    label: "کێمکرنا زۆر",
    sub: "قەبارەیێ هەرە بچووک",
    badge: "هەرە بچووک",
    size: "~70-80٪ کێمتر",
    emoji: "🔴",
    scale: 0.55,
    value: 0.25,
  },
];

export function PdfCompress() {
  const { isAuthenticated, openAuthModal, consumeToolQuota } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [qualityIdx, setQualityIdx] = useState(1); // default: مامناوەند
  const [result, setResult] = useState<{
    url: string;
    name: string;
    originalSize: number;
    compressedSize: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = (incoming: File | null) => {
    if (!incoming) return;
    if (incoming.type !== "application/pdf" && !incoming.name.endsWith(".pdf")) {
      setError("تنێ فایلێن PDF قبول دکرن.");
      return;
    }
    setFile(incoming);
    setError(null);
    setResult(null);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropActive(true);
  };
  const onDragLeave = () => setDropActive(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropActive(false);
    pickFile(e.dataTransfer.files?.[0] || null);
  };

  const compress = async () => {
    if (!file) return;
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    setLoading(true);
    setError(null);
    setProgress("د ئامادەکرنێدا...");

    try {
      const selected = QUALITY_LEVELS[qualityIdx];
      let scale = selected.scale;
      let quality = selected.value;

      // ── 1. Load PDF.js ──────────────────────────────────────────────────
      // @ts-expect-error - pdfjs-dist is a transitive dep without proper types here
      const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs").catch(() => import("pdfjs-dist"));
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();
      const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdfJsDoc.numPages;

      const runPass = async (scaleVal: number, qualityVal: number, passTitle: string = "") => {
        const { PDFDocument } = await import("@cantoo/pdf-lib");
        const outputPdf = await PDFDocument.create();

        for (let i = 1; i <= totalPages; i++) {
          setProgress(`${passTitle}لاپەر ${i} / ${totalPages} د بچیکرنێدا...`);

          const page = await pdfJsDoc.getPage(i);
          const origViewport = page.getViewport({ scale: 1.0 });
          const renderViewport = page.getViewport({ scale: scaleVal });

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(renderViewport.width));
          canvas.height = Math.max(1, Math.round(renderViewport.height));
          const ctx = canvas.getContext("2d", { alpha: false })!;

          // White background
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

          const blob: Blob = await new Promise((resolve) => {
            canvas.toBlob((b) => resolve(b!), "image/jpeg", qualityVal);
          });

          const buffer = await blob.arrayBuffer();
          const jpegImage = await outputPdf.embedJpg(new Uint8Array(buffer));

          // Retain original physical PDF dimensions
          const pdfPage = outputPdf.addPage([origViewport.width, origViewport.height]);
          pdfPage.drawImage(jpegImage, {
            x: 0,
            y: 0,
            width: origViewport.width,
            height: origViewport.height,
          });
        }

        setProgress("د پاشەکەوتکرنا فایلێ بچیککریدا...");
        return await outputPdf.save({ useObjectStreams: true });
      };

      let compressedBytes = await runPass(scale, quality);

      // Safeguard: Ensure output size is strictly less than original size!
      if (compressedBytes.byteLength >= file.size) {
        setProgress("کێمکرنا زێدەتر دا قەبارە بچووک ببێت...");
        scale = Math.min(scale * 0.7, 0.52);
        quality = Math.min(quality * 0.7, 0.22);
        compressedBytes = await runPass(scale, quality, "قۆناغا دووێ: ");
      }

      const originalSize = file.size;
      const compressedSize = compressedBytes.byteLength;

      if (result?.url) URL.revokeObjectURL(result.url);

      const blob = new Blob([compressedBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const downloadName = file.name.replace(/\.pdf$/i, "") + "_compressed.pdf";

      setResult({ url, name: downloadName, originalSize, compressedSize });
    } catch (e) {
      console.error(e);
      setError(
        "کێشەیەک د بچیکرنادا هاتە دی. فایلێ خۆ بپشکنینە یان فایلەکێ دی تاقی بکە."
      );
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const reset = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setFile(null);
    setResult(null);
    setError(null);
  };

  const savedBytes = result ? result.originalSize - result.compressedSize : 0;
  const savedPercent =
    result && result.originalSize > 0
      ? Math.round((savedBytes / result.originalSize) * 100)
      : 0;

  return (
    <div
      className="rounded-2xl bg-card border border-border p-6 md:p-8"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      {/* Header */}
      <div className="mb-6 text-right">
        <div className="flex items-center justify-end gap-3 mb-1">
          <h3 className="text-xl font-extrabold">بچیکرنا قەبارەیێ PDFێ</h3>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground shrink-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <FileDown className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          فایلێ PDF بدانە بۆ کێمکرنا قەبارەی
        </p>
      </div>

      {/* Upload zone */}
      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-10 px-4 mb-6 ${
            dropActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/60 hover:bg-secondary/40"
          }`}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm mb-0.5">فایلا PDFێ خۆ بار بکە</p>
            <p className="text-xs text-muted-foreground">
              کلیک بکە یان drag &amp; drop بکە
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => pickFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
          <FileText className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0 text-right">
            <p className="text-sm font-semibold truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground font-mono" dir="ltr">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0 cursor-pointer"
            aria-label="سڕین"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quality selector — 3 compression sizes */}
      {file && !loading && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-muted-foreground">
              {result ? "دخوازی ب قەبارەیەکێ دی بچیک بکەی؟" : "ئاستەکێ هەلبژێرە:"}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">ئاستێ بچیکرنێ (3 قەبارە)</span>
              <Settings2 className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {QUALITY_LEVELS.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setQualityIdx(i)}
                className={`rounded-xl border px-3 py-3 text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                  qualityIdx === i
                    ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40"
                    : "border-border hover:border-primary/40 hover:bg-secondary/40"
                }`}
              >
                <span className="text-base leading-none">{q.emoji}</span>
                <span className={`text-xs font-extrabold mt-0.5 ${
                  qualityIdx === i ? "text-primary" : "text-foreground"
                }`}>
                  {q.label}
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {q.sub}
                </span>
                <span className={`text-[10px] font-bold mt-0.5 rounded-full px-1.5 py-0.5 ${
                  i === 0 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
                  i === 1 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                            "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                }`}>
                  {q.size}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3 mb-4 text-right">
          {error}
        </div>
      )}

      {/* Loading progress */}
      {loading && (
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm font-semibold text-primary">{progress}</span>
            <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ئەڤ پڕۆسێسە دەمی دخوازیت، چاڤەڕێ بە.
          </p>
        </div>
      )}

      {/* Result card */}
      {result && (
        <div className="rounded-xl border border-border bg-background p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground">ئەنجام</span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                savedBytes > 0
                  ? "bg-success/15 text-success"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {savedBytes > 0 ? `${savedPercent}% کێمتر` : "گۆهوڕین نەهاتەکرن"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4 text-right">
            <div className="rounded-lg bg-secondary/40 p-3">
              <p className="text-xs text-muted-foreground mb-0.5">بەری بچیکرنێ</p>
              <p className="text-sm font-bold font-mono" dir="ltr">{formatBytes(result.originalSize)}</p>
            </div>
            <div className="rounded-lg bg-success/10 p-3">
              <p className="text-xs text-muted-foreground mb-0.5">پشتی بچیکرنێ</p>
              <p className="text-sm font-bold text-success font-mono" dir="ltr">
                {formatBytes(result.compressedSize)}
              </p>
            </div>
          </div>
          <a
            href={result.url}
            download={result.name}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold hover:opacity-90 transition cursor-pointer"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <Download className="w-4 h-4" />
            دانلودکرن
          </a>
        </div>
      )}

      {/* Action button */}
      {file && !loading && (
        <div className="flex justify-between items-center mt-3">
          {result ? (
            <button
              type="button"
              onClick={reset}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition cursor-pointer"
            >
              فایلەکادی ئەپلۆد بکە
            </button>
          ) : <div />}
          <button
            type="button"
            onClick={compress}
            disabled={!file}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
            style={{ boxShadow: file ? "var(--shadow-glow)" : undefined }}
          >
            <FileDown className="w-4 h-4" />
            {result ? "دووبارە بچیک بکە" : "بچیک بکە"}
          </button>
        </div>
      )}
    </div>
  );
}
