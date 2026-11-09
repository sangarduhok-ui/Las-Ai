import { useState, useRef, useEffect, DragEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Upload,
  X,
  Loader2,
  Scissors,
  FileText,
  CheckCircle2,
  Download,
  Plus,
  Trash2,
  Hash,
  LayoutGrid,
  List,
  Eye,
  ExternalLink,
} from "lucide-react";

type SplitMode = "ranges" | "every" | "individual";

interface Range {
  id: string;
  from: string;
  to: string;
}

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

let _idCounter = 0;
function uid() { return String(++_idCounter); }

function newRange(): Range {
  return { id: uid(), from: "", to: "" };
}

export function PdfSplit() {
  const { isAuthenticated, openAuthModal, consumeToolQuota } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<{
    url: string;
    name: string;
    page?: number;
    isTempUrl?: boolean;
    pageCount?: number;
    pageRange?: string;
  } | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [mode, setMode] = useState<SplitMode>("ranges");
  const [ranges, setRanges] = useState<Range[]>([newRange()]);
  const [everyN, setEveryN] = useState("1");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ name: string; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── cleanup on unmount ── */
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      if (previewModal?.isTempUrl) URL.revokeObjectURL(previewModal.url);
      results.forEach((r) => URL.revokeObjectURL(r.url));
    };
  }, [fileUrl, previewModal, results]);

  const closePreview = () => {
    if (previewModal?.isTempUrl) {
      URL.revokeObjectURL(previewModal.url);
    }
    setPreviewModal(null);
  };

  const previewFile = () => {
    if (!file || !fileUrl) return;
    if (previewModal?.isTempUrl) {
      URL.revokeObjectURL(previewModal.url);
    }
    setPreviewModal({
      url: fileUrl,
      name: file.name,
      pageCount: pageCount ?? undefined,
    });
  };

  /* ── file pick ── */
  const pickFile = async (f: File | null) => {
    if (!f) return;
    setError(null);
    setResults([]);
    setFile(f);
    setPageCount(null);
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(URL.createObjectURL(f));

    try {
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      const bytes = await f.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      setPageCount(pdf.getPageCount());
    } catch {
      setError("فایلا PDF نەهاتە خواندن. تکایە فایلێکی دروست هەلبژێرە.");
      setFile(null);
    }
  };

  /* ── drag ── */
  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(true); };
  const onDragLeave = () => setDropActive(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDropActive(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  };

  /* ── ranges helpers ── */
  const addRange = () => setRanges((r) => [...r, newRange()]);
  const removeRange = (id: string) => setRanges((r) => r.filter((x) => x.id !== id));
  const updateRange = (id: string, key: "from" | "to", val: string) =>
    setRanges((r) => r.map((x) => (x.id === id ? { ...x, [key]: val } : x)));

  /* ── parse range string ── */
  const parseRange = (from: string, to: string, max: number): number[] | null => {
    const f = parseInt(from, 10);
    const t = parseInt(to, 10);
    if (isNaN(f) || isNaN(t) || f < 1 || t < f || t > max) return null;
    return Array.from({ length: t - f + 1 }, (_, i) => f - 1 + i); // 0-based
  };

  /* ── preview ONLY selected range pages ── */
  const previewRange = async (rng: Range) => {
    if (!file || pageCount === null) return;
    setError(null);

    const fromVal = rng.from.trim() || "1";
    const toVal = rng.to.trim() || (pageCount ? String(pageCount) : "1");
    const pages = parseRange(fromVal, toVal, pageCount);

    if (!pages || pages.length === 0) {
      setError(`ژمارەیا لاپەران (${fromVal}–${toVal}) نادروستە یان ژ سنووری فایلێ (${pageCount}) دەربازدبیت.`);
      return;
    }

    try {
      setPreviewingId(rng.id);
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      const srcBytes = await file.arrayBuffer();
      const src = await PDFDocument.load(srcBytes);
      const dest = await PDFDocument.create();
      const copied = await dest.copyPages(src, pages);
      copied.forEach((p) => dest.addPage(p));
      const bytes = await dest.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      if (previewModal?.isTempUrl) {
        URL.revokeObjectURL(previewModal.url);
      }

      setPreviewModal({
        url,
        name: file.name,
        isTempUrl: true,
        pageCount: pages.length,
        pageRange: `${fromVal} تا ${toVal}`,
      });
    } catch (e) {
      console.error(e);
      setError("کێشەیەک هاتە پێش د ئامادەکرنا پێشبینینا لاپەراندا.");
    } finally {
      setPreviewingId(null);
    }
  };

  /* ── split ── */
  const split = async () => {
    if (!file || pageCount === null) return;
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    setLoading(true);
    setError(null);
    // revoke old URLs
    results.forEach((r) => URL.revokeObjectURL(r.url));
    setResults([]);

    try {
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      const srcBytes = await file.arrayBuffer();

      let parts: { pages: number[]; label: string }[] = [];

      if (mode === "individual") {
        parts = Array.from({ length: pageCount }, (_, i) => ({
          pages: [i],
          label: `لاپەر-${i + 1}`,
        }));
      } else if (mode === "every") {
        const n = Math.max(1, parseInt(everyN, 10) || 1);
        for (let i = 0; i < pageCount; i += n) {
          const chunk = Array.from({ length: Math.min(n, pageCount - i) }, (_, j) => i + j);
          const from = i + 1;
          const to = Math.min(i + n, pageCount);
          parts.push({ pages: chunk, label: `لاپەر-${from}${from !== to ? `-${to}` : ""}` });
        }
      } else {
        // ranges mode — validate first
        if (ranges.every((r) => !r.from.trim() && !r.to.trim())) {
          setError(`تکایە ژمارەیا لاپەران دیار بکە (1 تا ${pageCount}).`);
          setLoading(false);
          return;
        }
        for (const rng of ranges) {
          if (!rng.from.trim() || !rng.to.trim()) {
            setError(`تکایە هەر دوو خانەیێن "ژ" و "تا" پڕ بکە.`);
            setLoading(false);
            return;
          }
          const pages = parseRange(rng.from, rng.to, pageCount);
          if (!pages) {
            setError(`ژمارەیا رووپەلێ (${rng.from}–${rng.to}) نادروستە یان ژ سنووری فایلێ (${pageCount}) دەربازدبیت.`);
            setLoading(false);
            return;
          }
          parts.push({ pages, label: `لاپەر-${rng.from}-${rng.to}` });
        }
      }

      const newResults: { name: string; url: string }[] = [];

      for (const part of parts) {
        const src = await PDFDocument.load(srcBytes);
        const dest = await PDFDocument.create();
        const copied = await dest.copyPages(src, part.pages);
        copied.forEach((p) => dest.addPage(p));
        const bytes = await dest.save();
        const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
        newResults.push({ name: `${part.label}.pdf`, url: URL.createObjectURL(blob) });
      }

      setResults(newResults);
    } catch (e) {
      setError("کێشەیەک هاتە دی د دابەشکرنێدا.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const downloadAll = () => {
    results.forEach(({ name, url }, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, i * 150); // small delay between each to avoid browser blocking
    });
  };

  const reset = () => {
    results.forEach((r) => URL.revokeObjectURL(r.url));
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
    if (previewModal?.isTempUrl) {
      URL.revokeObjectURL(previewModal.url);
    }
    setPreviewModal(null);
    setFile(null);
    setPageCount(null);
    setResults([]);
    setError(null);
    setRanges([newRange()]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const modes: { key: SplitMode; label: string; icon: React.ElementType; desc: string }[] = [
    { key: "ranges", icon: List, label: "دیاریکرنا بەشان", desc: "ژمارەیا لاپەران ب دلێ خۆ دیار بکە" },
    { key: "every", icon: Hash, label: "هەر چەند لاپەرەک", desc: "ب شێوەیەکێ وەکهەڤ دابەش بکە" },
    { key: "individual", icon: LayoutGrid, label: "هەر لاپەرەک جودا", desc: "هەر لاپەرەک دبیتە فایلەکێ جودا" },
  ];

  return (
    <div className="rounded-2xl bg-card border border-border p-6 md:p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>

      {/* Header */}
      <div className="mb-6 text-right">
        <div className="flex items-center justify-end gap-3 mb-1">
          <h3 className="text-xl font-extrabold">دابەشکرنا PDFێ</h3>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground shrink-0" style={{ background: "var(--gradient-primary)" }}>
            <Scissors className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          فایلا PDF ئەپلۆد بکە و شێوازێ دابەشکرنێ هەلبژێرە
        </p>
      </div>

      {/* Upload zone */}
      {!file ? (
        <div
          onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-10 px-4 mb-6 ${
            dropActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/60 hover:bg-secondary/40"
          }`}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm mb-0.5">فایلا PDF خۆ بدانە</p>
            <p className="text-xs text-muted-foreground">کلیک بکە یان drag &amp; drop بکە</p>
          </div>
          <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} className="hidden" />
        </div>
      ) : (
        <div className="mb-6">
          {/* File card */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3 mb-4">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0 text-right">
              <p className="text-sm font-semibold truncate mb-1">{file.name}</p>
              <div className="flex items-center justify-start gap-3 text-xs mt-1">
                {pageCount !== null && (
                  <span className="font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md text-[11px] inline-flex items-center gap-1">
                    <span>{pageCount}</span>
                    <span>لاپەر</span>
                  </span>
                )}
                <span className="font-mono text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md text-[11px]" dir="ltr">
                  {formatBytes(file.size)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={previewFile}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition shrink-0 cursor-pointer"
                title="پێشبینینا فایلی"
                aria-label="پێشبینینا فایلی"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={reset}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0 cursor-pointer"
                title="لابردنا فایلی"
                aria-label="لابردنا فایلی"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode selector */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {modes.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => { setMode(m.key); setResults([]); setError(null); }}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center transition ${
                  mode === m.key
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <m.icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold leading-tight">{m.label}</span>
                <span className="text-[10px] leading-tight opacity-70 hidden sm:block">{m.desc}</span>
              </button>
            ))}
          </div>

          {/* Mode inputs */}
          {mode === "ranges" && (
            <div className="space-y-2 mb-4">
              <p className="text-xs font-bold text-muted-foreground text-right mb-2">
                ژمارەیا لاپەران دیار بکە (1 تا {pageCount})
              </p>
              {ranges.map((rng, idx) => (
                <div key={rng.id} className="flex items-center gap-2">
                  {/* Badge — لایێ راستێ (first in RTL = right) */}
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-extrabold text-primary-foreground shrink-0"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {idx + 1}
                  </span>

                  {/* Inner box: ژ (from) لایێ راستێ — تا (to) لایێ چەپێ */}
                  <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-xl px-3 py-2">
                    {/* RIGHT side: from */}
                    <input
                      type="number" min="1" max={pageCount ?? 9999}
                      value={rng.from}
                      onChange={(e) => updateRange(rng.id, "from", e.target.value)}
                      placeholder="1"
                      className="flex-1 bg-transparent text-sm text-center focus:outline-none"
                      dir="ltr"
                    />
                    <span className="text-xs text-muted-foreground shrink-0 px-1">ژ</span>
                    <span className="text-muted-foreground/40 shrink-0">—</span>
                    <span className="text-xs text-muted-foreground shrink-0 px-1">تا</span>
                    {/* LEFT side: to */}
                    <input
                      type="number" min="1" max={pageCount ?? 9999}
                      value={rng.to}
                      onChange={(e) => updateRange(rng.id, "to", e.target.value)}
                      placeholder={String(pageCount ?? "...")}
                      className="flex-1 bg-transparent text-sm text-center focus:outline-none"
                      dir="ltr"
                    />
                  </div>

                  {/* Eye — پێشبینینا بتنێ ئەڤان لاپەران */}
                  <button
                    type="button"
                    onClick={() => previewRange(rng)}
                    disabled={previewingId === rng.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition shrink-0 cursor-pointer disabled:opacity-50"
                    title="پێشبینینا بتنێ ئەڤان لاپەران"
                    aria-label="پێشبینین"
                  >
                    {previewingId === rng.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                  {/* X — لایێ چەپێ (last in RTL = left) */}
                  <button
                    type="button"
                    onClick={() => removeRange(rng.id)}
                    disabled={ranges.length === 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive disabled:opacity-25 transition shrink-0 cursor-pointer"
                    title="ژێبرنا ئەڤی بەشی"
                    aria-label="ژێبرن"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addRange}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border hover:border-primary/60 py-2 text-sm text-muted-foreground hover:text-foreground transition mt-1"
              >
                <Plus className="w-4 h-4" />
                بەشەکێ نوو زێدە بکە
              </button>
            </div>
          )}

          {mode === "every" && (
            <div className="mb-4 text-right">
              <p className="text-xs font-bold text-muted-foreground mb-2">
                هەر چەند لاپەر ببنە بەشەک؟
              </p>
              <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3">
                <span className="text-sm text-muted-foreground flex-1 text-right">لاپەر د هەر بەشەکیدا</span>
                <input
                  type="number" min="1" max={pageCount ?? 999}
                  value={everyN}
                  onChange={(e) => setEveryN(e.target.value)}
                  className="w-20 text-center text-lg font-bold bg-transparent border border-border rounded-lg py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  dir="ltr"
                />
                <span className="text-sm text-muted-foreground">هەر</span>
              </div>
              {pageCount && (
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  ئەڤ فایله دێ بیتە {Math.ceil(pageCount / Math.max(1, parseInt(everyN) || 1))} بەش
                </p>
              )}
            </div>
          )}

          {mode === "individual" && (
            <div className="mb-4 rounded-xl bg-secondary/40 border border-border px-4 py-3 text-right">
              <p className="text-sm font-semibold">
                هەر لاپەرەک دێ بیتە فایلەکێ PDFێ یێ سەربەخۆ
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pageCount} لاپەر → {pageCount} فایل
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3 mb-4 text-right">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mb-4 rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={downloadAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition"
            >
              <Download className="w-3.5 h-3.5" />
              هەمیان دانلۆد بکە
            </button>
            <span className="text-xs font-bold text-success flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {results.length} بەش ئامادەی دانلۆدێ
            </span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {results.map((r) => (
              <div
                key={r.url}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2 hover:border-primary/50 hover:bg-primary/5 transition group"
              >
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <span className="flex-1 text-sm truncate text-right font-medium">{r.name}</span>
                <button
                  type="button"
                  onClick={() => setPreviewModal({ url: r.url, name: r.name })}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition shrink-0 cursor-pointer"
                  title="پێشبینین"
                  aria-label="پێشبینین"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <a
                  href={r.url}
                  download={r.name}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition shrink-0 cursor-pointer"
                  title="داگرتن"
                  aria-label="داگرتن"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action row */}
      {file && (
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            ژ نوو دەستپێبکە
          </button>
          <button
            type="button"
            onClick={split}
            disabled={loading || !pageCount}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
            {loading ? "د دابەشکرنێدا..." : "دابەش بکە و دانلۆد بکە"}
          </button>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closePreview}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-background border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-right">
                  <p className="font-bold text-sm text-foreground truncate">{previewModal.name}</p>
                  {previewModal.pageRange ? (
                    <p className="text-[11px] text-primary font-bold flex items-center gap-1.5 justify-end mt-0.5">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">
                        بتنێ لاپەرێن دەستنیشانکری
                      </span>
                      <span>{previewModal.pageCount} لاپەر (ژ {previewModal.pageRange})</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      پێشبینینا ناڤەرۆکا فایلی {previewModal.pageCount ? `(${previewModal.pageCount} لاپەر)` : ""}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ڤەکرن ل پەڕەکێ نوو</span>
                </a>
                <button
                  type="button"
                  onClick={closePreview}
                  className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                  aria-label="داخستن"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: PDF iframe viewer */}
            <div className="flex-1 p-2 bg-muted/20 min-h-[65vh] sm:min-h-[75vh]">
              <iframe
                src={`${previewModal.url}#toolbar=1`}
                className="w-full h-full min-h-[65vh] sm:min-h-[75vh] rounded-2xl border border-border/80 bg-background"
                title={previewModal.name}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
