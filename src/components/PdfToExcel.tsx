import { useState, useRef, DragEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { Upload, X, Loader2, FileText, Download, Table2 } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PdfToExcel() {
  const { isAuthenticated, openAuthModal, consumeToolQuota } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string; rows: number; pages: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) { setError("تنێ فایلێن PDF قبول دکرن."); return; }
    setFile(f); setError(null); setResult(null);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(true); };
  const onDragLeave = () => setDropActive(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(false); pickFile(e.dataTransfer.files?.[0] || null); };

  const convert = async () => {
    if (!file) return;
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    setLoading(true); setError(null); setResult(null); setProgress("د ئامادەکرنێدا...");
    try {
      // 1. Extract text with PDF.js
      // @ts-expect-error transitive
      const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs").catch(() => import("pdfjs-dist"));
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const ab = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: ab }).promise;
      const totalPages = pdfDoc.numPages;

      // Collect all rows: [pageNo, lineNo, text]
      const allRows: (string | number)[][] = [["لاپەر", "ژمارەی ریز", "دەق"]];
      let totalRows = 0;

      for (let i = 1; i <= totalPages; i++) {
        setProgress(`لاپەر ${i} / ${totalPages} — د خواندنێدا...`);
        const page = await pdfDoc.getPage(i);
        const tc = await page.getTextContent();
        interface TItem { str: string; transform: number[]; hasEOL?: boolean }
        const items = tc.items as TItem[];

        // Group by Y position into lines
        const lineMap = new Map<number, string>();
        for (const it of items) {
          const y = Math.round(it.transform[5]);
          lineMap.set(y, (lineMap.get(y) ?? "") + it.str);
        }
        // Sort by descending Y (top of page first)
        const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
        let lineNo = 1;
        for (const y of sortedYs) {
          const text = lineMap.get(y)!.trim();
          if (text) {
            allRows.push([i, lineNo++, text]);
            totalRows++;
          }
        }
      }

      // 2. Build XLSX
      setProgress("د دروستکرنا فایلا Excelda...");
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.aoa_to_sheet(allRows);

      // Column widths
      ws["!cols"] = [{ wch: 8 }, { wch: 8 }, { wch: 80 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PDF Content");

      setProgress("د ئامادەکرنا دانلودێدا...");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      setResult({ url, name: file.name.replace(/\.pdf$/i, "") + ".xlsx", rows: totalRows, pages: totalPages });
    } catch (e) {
      console.error(e);
      setError("کێشەیەکێ هاتە دی د گۆڕینا PDFێدا.");
    } finally { setLoading(false); setProgress(""); }
  };

  const reset = () => { if (result?.url) URL.revokeObjectURL(result.url); setFile(null); setResult(null); setError(null); };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 md:p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
      <div className="mb-6 text-right">
        <div className="flex items-center justify-end gap-3 mb-1">
          <h3 className="text-xl font-extrabold">گۆڕینا PDF بو Excel</h3>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground shrink-0" style={{ background: "var(--gradient-primary)" }}>
            <Table2 className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">فایلێ PDF بدانە — دەقا هەر لاپەرێ ب ریزان دبێت ستونا Excelê.</p>
      </div>

      {!file ? (
        <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}
          className={`relative w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-10 px-4 mb-6 ${dropActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/60 hover:bg-secondary/40"}`}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><Upload className="w-6 h-6" /></div>
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
          <div className="grid grid-cols-2 gap-3 mb-4 text-right">
            <div className="rounded-lg bg-secondary/40 p-3"><p className="text-xs text-muted-foreground mb-0.5">ژمارەیا لاپەران</p><p className="text-sm font-bold">{result.pages} لاپەر</p></div>
            <div className="rounded-lg bg-secondary/40 p-3"><p className="text-xs text-muted-foreground mb-0.5">ژمارەیا ریزان</p><p className="text-sm font-bold">{result.rows.toLocaleString()}</p></div>
          </div>
          <a href={result.url} download={result.name} className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold hover:opacity-90 transition" style={{ boxShadow: "var(--shadow-glow)" }}>
            <Download className="w-4 h-4" /> دانلودکرنا فایلا Excel
          </a>
          <p className="text-center text-[10px] text-muted-foreground mt-2">{result.name}</p>
        </div>
      )}

      {!result && !loading && (
        <div className="flex justify-end">
          <button type="button" onClick={convert} disabled={!file} className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition" style={{ boxShadow: file ? "var(--shadow-glow)" : undefined }}>
            <Table2 className="w-4 h-4" /> بگۆڕە — Excel دانلود بکە
          </button>
        </div>
      )}
      {result && <div className="flex justify-end mt-2"><button type="button" onClick={reset} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition">فایلەکادی ئەپلۆد بکە</button></div>}
    </div>
  );
}
