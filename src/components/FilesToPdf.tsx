import { useState, useRef, DragEvent, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Upload, X, FileText, FileType2, Presentation, Table2, Loader2, Download } from "lucide-react";
import html2canvas from "html2canvas";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilesToPdf() {
  const { isAuthenticated, openAuthModal, consumeToolQuota } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileAccept = ".doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.bmp,.svg,.txt,.csv,.md,.json";

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (f.size === 0) {
      setError("ئەڤ فایلە یا بەتاڵە و قەبارێ وێ (0 KB) یە! دەمێ فایل ل سەر کۆمپیوتەری دهێتە دروستکرن (وەک New Document)، هەتا تێدا نەهێتە نڤیسین و خەزنکرن (Save)، بەتاڵە. تکایە فایلێ بکەوە، دەق یان وێنە تێدا بنڤیسە و Save بکە، پاشان لێرە دانە.");
      setFile(null);
      setResult(null);
      return;
    }
    setFile(f); 
    setError(null);
    setResult(null);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(true); };
  const onDragLeave = () => setDropActive(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(false); pickFile(e.dataTransfer.files?.[0] || null); };

  const reset = () => { 
    if (result?.url) URL.revokeObjectURL(result.url); 
    setFile(null); 
    setError(null); 
    setResult(null); 
  };

  const convertToPdf = async () => {
    if (!file) return;
    if (file.size === 0) {
      setError("ئەڤ فایلە یا بەتاڵە (0 KB). تکایە فایلەکێ هەلبژێرە کو زانیاری تێدابن و خەزنکری بیت.");
      return;
    }
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    const quota = consumeToolQuota("files_to_pdf", "گۆڕینی فایل بۆ PDF");
    if (!quota.allowed) {
      setError(quota.message || "تە مافێ بکارئینانێ نینە یان کوتایا تە یا ب دوماهیک هاتی.");
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    const supportedExts = ['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'csv', 'jpg', 'jpeg', 'png', 'webp', 'bmp', 'svg', 'txt', 'md', 'json', 'pdf'];
    if (!supportedExts.includes(ext)) {
      setError(`ببورە، فۆرماتا فایلا (.${ext.toUpperCase()}) ناهێتە پشتەڤانیکردن. فۆرماتێن پشتەڤانیکری: Word (.docx, .doc), PowerPoint (.pptx, .ppt), Excel (.xlsx, .xls), وێنە (PNG, JPG, WebP), و دەق.`);
      return;
    }

    setLoading(true); setError(null); setResult(null);
    
    try {
      // 0. PDF (Already PDF - keep untouched)
      if (ext === 'pdf') {
        const url = URL.createObjectURL(file);
        setResult({ url, name: file.name });
        return;
      }

      // 1. Office formats (Word, PowerPoint, Excel) - 100% exact layout, shapes, textboxes, and photos preserved
      if (['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'csv'].includes(ext)) {
        setProgress("د گۆڕینا فایلێدا ب دیزاین و شێوەیێن دروست بێی تێکچوون...");
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
        return;
      }

      // 2. Images (JPG, PNG, WebP, BMP, SVG) - 1:1 direct exact match
      if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'svg'].includes(ext)) {
        setProgress("د دروستکرنا PDF ژ وێنەی دا...");
        const { PDFDocument } = await import("@cantoo/pdf-lib");
        const pdfDoc = await PDFDocument.create();

        const imgUrl = URL.createObjectURL(file);
        try {
          const imgEl = new Image();
          await new Promise((resolve, reject) => {
            imgEl.onload = resolve;
            imgEl.onerror = () => reject(new Error("نەهاتە بارکرن وەک وێنە"));
            imgEl.src = imgUrl;
          });

          const c = document.createElement("canvas");
          c.width = imgEl.naturalWidth || 800;
          c.height = imgEl.naturalHeight || 600;
          const ctx = c.getContext("2d")!;
          ctx.drawImage(imgEl, 0, 0);

          const pngDataUrl = c.toDataURL("image/png");
          const base64 = pngDataUrl.split(",")[1];
          const pngBytes = Uint8Array.from(atob(base64), ch => ch.charCodeAt(0));
          const embeddedImg = await pdfDoc.embedPng(pngBytes);

          // 1:1 image page with zero borders or distortion
          const page = pdfDoc.addPage([c.width, c.height]);
          page.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: c.width,
            height: c.height,
          });

          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          setResult({ url, name: file.name.replace(/\.[^.]+$/, "") + ".pdf" });
        } finally {
          URL.revokeObjectURL(imgUrl);
        }

      // 4. Text & Code (TXT, CSV, MD, JSON)
      } else if (['txt', 'csv', 'md', 'json'].includes(ext)) {
        setProgress("د خواندنا دەقی دا...");
        const rawText = await file.text();
        if (!rawText.trim()) {
          throw new Error("فایلا دەقی یا بەتاڵە!");
        }

        setProgress("د ئامادەکرنا PDF دا...");
        const iframe = document.createElement("iframe");
        iframe.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:794px;border:none;background:white;";
        document.body.appendChild(iframe);

        try {
          const iDoc = iframe.contentDocument!;
          iDoc.open();
          const safeText = rawText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          iDoc.write(`<!DOCTYPE html><html dir="auto"><head><meta charset="utf-8">
            <style>
              body{font-family:system-ui,-apple-system,'Segoe UI',Tahoma,Arial,monospace;font-size:11pt;line-height:1.7;padding:40px;margin:0;color:#111;direction:auto;white-space:pre-wrap;word-break:break-word;background:white;}
            </style></head><body>${safeText}</body></html>`);
          iDoc.close();

          await new Promise(r => setTimeout(r, 400));
          const canvas = await html2canvas(iDoc.body, { scale: 1.5, useCORS: true, logging: false });

          const { PDFDocument, rgb } = await import("@cantoo/pdf-lib");
          const pdfDoc = await PDFDocument.create();

          const PAGE_W = 794;
          const PAGE_H = 1123;
          const totalHeight = Math.max(canvas.height, 100);
          const scaledPageHeight = Math.floor((PAGE_H / PAGE_W) * canvas.width) || 1000;
          const totalPages = Math.ceil(totalHeight / scaledPageHeight) || 1;

          for (let p = 0; p < totalPages; p++) {
            const currentHeight = Math.min(scaledPageHeight, totalHeight - p * scaledPageHeight);
            if (currentHeight <= 0) break;

            const pageCanvas = document.createElement("canvas");
            pageCanvas.width = canvas.width;
            pageCanvas.height = currentHeight;
            const pCtx = pageCanvas.getContext("2d")!;
            pCtx.fillStyle = "#ffffff";
            pCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            pCtx.drawImage(canvas, 0, p * scaledPageHeight, canvas.width, currentHeight, 0, 0, pageCanvas.width, currentHeight);

            const jpegDataUrl = pageCanvas.toDataURL("image/jpeg", 0.9);
            const base64 = jpegDataUrl.split(",")[1];
            const jpegBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            const jpegImg = await pdfDoc.embedJpg(jpegBytes);
            const page = pdfDoc.addPage([PAGE_W, PAGE_H]);
            const drawH = (currentHeight / canvas.width) * PAGE_W;
            page.drawImage(jpegImg, { x: 0, y: PAGE_H - drawH, width: PAGE_W, height: drawH });
          }

          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          setResult({ url, name: file.name.replace(/\.[^.]+$/, "") + ".pdf" });
        } finally {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }
      }
    } catch (e: any) {
      console.error(e);
      let rawMsg = e?.message || String(e);
      let friendlyMsg = rawMsg;
      if (rawMsg.includes("End of data reached") || rawMsg.includes("Corrupted zip") || rawMsg.includes("can't find end of central directory")) {
        friendlyMsg = "ئەڤ فایلە یا بەتاڵە یان تێکچوویە (قەبارێ وێ سفرە). ئەگەر تە نوکە فایل ل سەر کۆمپیوتەری دروستکریە، پێویستە دەق تێدا بنڤیسی و خەزن (Save) بکەی، پاشان بار بکەی.";
      }
      setError("کێشەیەک هاتە دی د گۆڕینێدا: " + friendlyMsg);
    } finally { 
      setLoading(false); 
      setProgress(""); 
    }
  };

  useEffect(() => {
    if (file && !result && !loading && !error) {
      convertToPdf();
    }
  }, [file]);

  return (
    <div className="rounded-2xl bg-card border border-border p-6 md:p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
      {/* Header */}
      <div className="mb-8 text-right">
        <div className="flex items-center justify-end gap-3 mb-2">
          <h3 className="text-2xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
            گەڕۆکا گۆڕینا فایلان بو PDF
          </h3>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground shrink-0 shadow-lg" style={{ background: "var(--gradient-primary)" }}>
            <FileType2 className="w-6 h-6" />
          </div>
        </div>
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          هەر فایلەکێ (Word, PowerPoint, Excel) یان وێنە و دەق بدانە لێرە بۆ گۆڕین بو PDFێکا جوان.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Word", icon: FileType2, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
          { label: "PowerPoint", icon: Presentation, color: "text-red-500 bg-red-500/10 border-red-500/20" },
          { label: "Excel", icon: Table2, color: "text-green-500 bg-green-500/10 border-green-500/20" },
        ].map(cat => (
          <div key={cat.label} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${cat.color}`}>
            <cat.icon className="w-6 h-6 mb-1.5" />
            <span className="text-xs font-bold">{cat.label}</span>
          </div>
        ))}
      </div>

      {/* Upload zone */}
      {!file ? (
        <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}
          className={`relative w-full rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4 py-12 px-4 mb-8 ${dropActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/60 hover:bg-secondary/40"}`}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg" style={{ background: "var(--gradient-primary)" }}>
            <Upload className="w-7 h-7" />
          </div>
          <div className="text-center">
            <p className="font-extrabold text-base mb-1">فایلا خۆ بار بکە (Word, PowerPoint, Excel)</p>
            <p className="text-sm text-muted-foreground">کلیک بکە یان drag &amp; drop بکە</p>
          </div>
          <input ref={fileInputRef} type="file" accept={fileAccept} onChange={(e) => pickFile(e.target.files?.[0] || null)} className="hidden" />
        </div>
      ) : (
        <div className="mb-8 flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 shadow-sm">
          <FileText className="w-7 h-7 text-primary shrink-0" />
          <div className="flex-1 min-w-0 text-right">
            <p className="text-base font-bold truncate text-foreground">{file.name}</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">{formatBytes(file.size)}</p>
          </div>
          <button type="button" onClick={reset} className="w-9 h-9 rounded-xl flex items-center justify-center bg-background border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition shrink-0 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold p-4 mb-6 text-right shadow-sm">{error}</div>}

      {loading && (
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm font-semibold text-primary">{progress}</span>
            <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
          </div>
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
    </div>
  );
}
