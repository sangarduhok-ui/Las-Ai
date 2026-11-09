import { useState, useRef, DragEvent } from "react";
import { Upload, X, Loader2, FileOutput, Download, Table2 } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ExcelToPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [result, setResult] = useState<{ url: string; name: string; sheets: number; rows: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | null) => {
    if (!f) return;
    const ok = f.name.endsWith(".xlsx") || f.name.endsWith(".xls") || f.type.includes("spreadsheet");
    if (!ok) { setError("تنێ فایلێن .xlsx / .xls قبول دکرن."); return; }
    setFile(f); setError(null); setResult(null);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(true); };
  const onDragLeave = () => setDropActive(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(false); pickFile(e.dataTransfer.files?.[0] || null); };

  const convert = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null); setProgress("د گۆڕینا فایلا Excel ب فۆرماتی دروست...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/convert-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const outName = file.name.replace(/\.[^.]+$/, "") + ".pdf";
        setResult({ url, name: outName, sheets: 1, rows: 0 });
        return;
      }

      // Fallback
      setProgress("د خواندنا فایلا Excelda...");
      const XLSX = await import("xlsx");
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab, { type: "array" });

      const { PDFDocument, rgb, StandardFonts } = await import("@cantoo/pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const PAGE_W = 841.89; // A4 landscape
      const PAGE_H = 595.28;
      const MARGIN = 30;
      const ROW_H = 18;
      const HEADER_H = 24;

      let totalRows = 0;

      for (let si = 0; si < wb.SheetNames.length; si++) {
        const sheetName = wb.SheetNames[si];
        setProgress(`Sheet "${sheetName}" — د پڕۆسێسکرنێدا...`);

        const ws = wb.Sheets[sheetName];
        const data: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" }) as string[][];
        if (!data.length) continue;

        // Calculate column widths
        const colCount = Math.max(...data.map(r => r.length));
        const maxColW = Math.floor((PAGE_W - 2 * MARGIN) / Math.max(colCount, 1));
        const colWidths = Array(colCount).fill(Math.min(maxColW, 120));

        // Paginate rows
        const usableH = PAGE_H - 2 * MARGIN;
        const rowsPerPage = Math.floor((usableH - HEADER_H) / ROW_H);
        const dataRows = data.slice(1); // skip header
        const header = data[0] ?? [];
        totalRows += dataRows.length;

        const totalPageCount = Math.ceil(dataRows.length / rowsPerPage) || 1;

        for (let pi = 0; pi < totalPageCount; pi++) {
          const page = pdfDoc.addPage([PAGE_W, PAGE_H]);

          // Sheet title
          page.drawText(`${sheetName}  (${pi + 1}/${totalPageCount})`, {
            x: MARGIN, y: PAGE_H - MARGIN,
            size: 11, font: boldFont, color: rgb(0.1, 0.1, 0.5),
          });

          let y = PAGE_H - MARGIN - HEADER_H;

          // Header row
          page.drawRectangle({ x: MARGIN, y, width: PAGE_W - 2 * MARGIN, height: HEADER_H, color: rgb(0.22, 0.19, 0.85), opacity: 0.9 });
          let x = MARGIN;
          header.forEach((cell, ci) => {
            const text = String(cell ?? "").substring(0, 20);
            page.drawText(text, { x: x + 3, y: y + 6, size: 8, font: boldFont, color: rgb(1, 1, 1) });
            x += colWidths[ci] ?? maxColW;
          });
          y -= ROW_H;

          // Data rows
          const pageData = dataRows.slice(pi * rowsPerPage, (pi + 1) * rowsPerPage);
          pageData.forEach((row, ri) => {
            if (ri % 2 === 0) {
              page.drawRectangle({ x: MARGIN, y, width: PAGE_W - 2 * MARGIN, height: ROW_H, color: rgb(0.96, 0.96, 0.99) });
            }
            let rx = MARGIN;
            for (let ci = 0; ci < colCount; ci++) {
              const text = String(row[ci] ?? "").substring(0, 22);
              if (text) page.drawText(text, { x: rx + 3, y: y + 4, size: 8, font, color: rgb(0.1, 0.1, 0.1) });
              rx += colWidths[ci] ?? maxColW;
            }
            // Row border
            page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: rgb(0.85, 0.85, 0.85) });
            y -= ROW_H;
          });
        }
      }

      setProgress("د ئامادەکرنا دانلودێدا...");
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setResult({ url, name: file.name.replace(/\.(xlsx|xls)$/i, "") + ".pdf", sheets: wb.SheetNames.length, rows: totalRows });
    } catch (e) {
      console.error(e);
      setError("کێشەیەکێ هاتە دی د گۆڕینا Excelda.");
    } finally { setLoading(false); setProgress(""); }
  };

  const reset = () => { if (result?.url) URL.revokeObjectURL(result.url); setFile(null); setResult(null); setError(null); };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 md:p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
      <div className="mb-6 text-right">
        <div className="flex items-center justify-end gap-3 mb-1">
          <h3 className="text-xl font-extrabold">گۆڕینا Excel بو PDF</h3>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground shrink-0" style={{ background: "var(--gradient-primary)" }}>
            <Table2 className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">فایلا Excel بدانە — خشتەیێن تێدا دبێن PDFêk bi rêkûpêk.</p>
      </div>

      {!file ? (
        <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}
          className={`relative w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-10 px-4 mb-6 ${dropActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/60 hover:bg-secondary/40"}`}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}><Upload className="w-6 h-6" /></div>
          <div className="text-center">
            <p className="font-bold text-sm mb-0.5">فایلا Excel خۆ بار بکە (.xlsx / .xls)</p>
            <p className="text-xs text-muted-foreground">کلیک بکە یان drag &amp; drop بکە</p>
          </div>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => pickFile(e.target.files?.[0] || null)} className="hidden" />
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
          <div className="grid grid-cols-2 gap-3 mb-4 text-right">
            <div className="rounded-lg bg-secondary/40 p-3"><p className="text-xs text-muted-foreground mb-0.5">ژمارەیا Sheetان</p><p className="text-sm font-bold">{result.sheets}</p></div>
            <div className="rounded-lg bg-secondary/40 p-3"><p className="text-xs text-muted-foreground mb-0.5">ژمارەیا ریزان</p><p className="text-sm font-bold">{result.rows.toLocaleString()}</p></div>
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
            <Table2 className="w-4 h-4" /> بگۆڕە — PDF دانلود بکە
          </button>
        </div>
      )}
      {result && <div className="flex justify-end mt-2"><button type="button" onClick={reset} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition">فایلەکادی ئەپلۆد بکە</button></div>}
    </div>
  );
}
