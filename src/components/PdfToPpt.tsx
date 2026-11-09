import { useState, useRef, DragEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Upload,
  X,
  Loader2,
  FileText,
  Download,
  Presentation,
  CheckCircle2,
  Sliders,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Type,
  MousePointerClick
} from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface SlidePreview {
  index: number;
  dataUrl: string;
  aspect: number;
}

interface TextShapeItem {
  text: string;
  x: number; // inches
  y: number; // inches
  w: number; // inches
  h: number; // inches
  fontSize: number; // points
  bold: boolean;
  italic: boolean;
  color: string;
  align: "left" | "right" | "center";
  canvasBounds: {
    cx: number;
    cy: number;
    cw: number;
    ch: number;
    topBg: { r: number; g: number; b: number };
    botBg: { r: number; g: number; b: number };
  };
}

export function PdfToPpt() {
  const { isAuthenticated, openAuthModal, consumeToolQuota } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);

  // Conversion options
  const [enableShapes, setEnableShapes] = useState(true);
  const [qualityMode, setQualityMode] = useState<"high" | "ultra">("high");
  const [includeNotes, setIncludeNotes] = useState(true);

  // Result state
  const [result, setResult] = useState<{
    url: string;
    name: string;
    slides: number;
    shapesCount: number;
    aspectRatioName: string;
    previews: SlidePreview[];
  } | null>(null);

  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) {
      setError("تنێ فایلێن PDF دهێنە وەرگرتن.");
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
    setProgressPercent(0);
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

  const convert = async () => {
    if (!file) return;
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgressPercent(5);
    setProgress("د دەستپێکرنێدا... بارکرنا پێکهاتەیان");

    try {
      // 1. Load PDF.js
      // @ts-expect-error - pdfjs-dist is a transitive dep without proper types here
      const pdfjsModule = await import("pdfjs-dist/build/pdf.mjs").catch(() => import("pdfjs-dist"));
      const pdfjsLib: any = (pdfjsModule as any).default || pdfjsModule;
      if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }

      const ab = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: ab }).promise;
      const totalPages = pdfDoc.numPages;

      if (totalPages === 0) {
        throw new Error("فایلێ PDF چ لاپەر تێدا نینن.");
      }

      setProgressPercent(15);
      setProgress(`دیتنا ${totalPages} لاپەران — ئامادەکرنا شێوە و تێکستێ دەستکاریکری...`);

      const scale = qualityMode === "ultra" ? 2.5 : 1.8;
      const jpegQuality = qualityMode === "ultra" ? 0.95 : 0.90;

      // Determine aspect ratio from first page
      const page1 = await pdfDoc.getPage(1);
      const origViewport1 = page1.getViewport({ scale: 1.0 });
      const firstAspect = origViewport1.width / origViewport1.height;

      let slideWidth = 10;
      let slideHeight = 5.625;
      let aspectName = "16:9 پان (Widescreen)";

      if (firstAspect >= 1.55) {
        slideWidth = 10;
        slideHeight = 5.625;
        aspectName = "16:9 پان (Widescreen)";
      } else if (firstAspect >= 1.2 && firstAspect <= 1.45) {
        slideWidth = 10;
        slideHeight = 7.5;
        aspectName = "4:3 ستاندارد (Standard)";
      } else {
        slideWidth = 10;
        slideHeight = Number((10 / firstAspect).toFixed(3));
        aspectName = `ڕێژەیا ئەسلی (${firstAspect.toFixed(2)}:1)`;
      }

      const renderedSlides: {
        index: number;
        dataUrl: string;
        aspect: number;
        shapes: TextShapeItem[];
        text: string;
      }[] = [];

      let totalShapesFound = 0;

      // 2. Process each page: render graphics, extract text items as editable shapes
      for (let i = 1; i <= totalPages; i++) {
        const percent = Math.round(15 + (i / totalPages) * 65);
        setProgressPercent(percent);
        setProgress(`گوهۆڕینا لاپەرێ ${i} ژ ${totalPages} (چێکرنا شێوە و تێکستێ دەستکاریکری)...`);

        const page = await pdfDoc.getPage(i);
        const origViewport = page.getViewport({ scale: 1.0 });
        const viewport = page.getViewport({ scale });

        // A. Render full graphics to canvas
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);

        const ctx = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
        if (!ctx) throw new Error("کێشەیەک د چێکرنا کانوێسیدا پەیدابوو");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        // B. Extract text items with geometry for shape generation
        const tc = await page.getTextContent();
        interface RawTItem {
          str: string;
          transform: number[];
          width: number;
          height: number;
          fontName: string;
        }

        const validItems: {
          str: string;
          x: number;
          y: number;
          w: number;
          h: number;
          fontSize: number;
          fontName: string;
        }[] = [];

        let allPageText = "";

        for (const rawItem of tc.items as RawTItem[]) {
          const s = rawItem.str ? rawItem.str.trim() : "";
          if (!s) continue;
          allPageText += (allPageText ? " " : "") + s;

          const tX = rawItem.transform[4];
          const tY = rawItem.transform[5];
          const scaleY = rawItem.transform[3];
          const fontSz = Math.hypot(rawItem.transform[0], rawItem.transform[1]) || scaleY || 12;

          validItems.push({
            str: rawItem.str,
            x: tX,
            y: tY,
            w: rawItem.width,
            h: fontSz,
            fontSize: fontSz,
            fontName: rawItem.fontName || "",
          });
        }

        // C. Group text items into lines & cohesive text blocks
        validItems.sort((a, b) => b.y - a.y || a.x - b.x);

        const lines: {
          text: string;
          minX: number;
          maxX: number;
          y: number;
          fontSize: number;
          isBold: boolean;
          isItalic: boolean;
        }[] = [];

        for (const item of validItems) {
          const existingLine = lines.find(
            (l) => Math.abs(l.y - item.y) <= Math.min(l.fontSize, item.fontSize) * 0.45
          );

          const isItemBold =
            item.fontName.toLowerCase().includes("bold") ||
            item.fontName.toLowerCase().includes("black") ||
            item.fontName.toLowerCase().includes("heavy");

          const isItemItalic =
            item.fontName.toLowerCase().includes("italic") ||
            item.fontName.toLowerCase().includes("oblique");

          if (existingLine) {
            const gap = item.x - existingLine.maxX;
            if (gap > 2 && !existingLine.text.endsWith(" ") && !item.str.startsWith(" ")) {
              existingLine.text += " ";
            }
            existingLine.text += item.str;
            existingLine.minX = Math.min(existingLine.minX, item.x);
            existingLine.maxX = Math.max(existingLine.maxX, item.x + item.w);
            existingLine.fontSize = Math.max(existingLine.fontSize, item.fontSize);
            if (isItemBold) existingLine.isBold = true;
            if (isItemItalic) existingLine.isItalic = true;
          } else {
            lines.push({
              text: item.str,
              minX: item.x,
              maxX: item.x + item.w,
              y: item.y,
              fontSize: item.fontSize,
              isBold: isItemBold,
              isItalic: isItemItalic,
            });
          }
        }

        // D. Create editable PowerPoint text shapes & sample colors
        const shapes: TextShapeItem[] = [];
        const scaleX = canvas.width / origViewport.width;
        const scaleY = canvas.height / origViewport.height;
        const scaleToInchesX = slideWidth / origViewport.width;
        const scaleToInchesY = slideHeight / origViewport.height;

        for (const line of lines) {
          const trimmedText = line.text.trim();
          if (!trimmedText) continue;

          // Canvas coordinates
          const cx = Math.max(0, Math.round(line.minX * scaleX));
          const topPts = origViewport.height - line.y - line.fontSize;
          const cy = Math.max(0, Math.round(topPts * scaleY));
          const cw = Math.min(canvas.width - cx, Math.round((line.maxX - line.minX) * scaleX));
          const ch = Math.min(canvas.height - cy, Math.round(line.fontSize * scaleY));

          // Sample background color above and below
          const sampleX = Math.max(0, Math.min(canvas.width - 1, cx + 4));
          const topY = Math.max(0, cy - 4);
          const botY = Math.min(canvas.height - 1, cy + ch + 4);

          const topP = ctx.getImageData(sampleX, topY, 1, 1).data;
          const botP = ctx.getImageData(sampleX, botY, 1, 1).data;
          const topBg = { r: topP[0], g: topP[1], b: topP[2] };
          const botBg = { r: botP[0], g: botP[1], b: botP[2] };
          const avgBg = {
            r: (topBg.r + botBg.r) / 2,
            g: (topBg.g + botBg.g) / 2,
            b: (topBg.b + botBg.b) / 2,
          };

          // Find text glyph color by sampling pixels in text bounding box with highest contrast
          let bestColor = { r: 255, g: 255, b: 255 };
          let maxDist = -1;
          const sW = Math.max(1, Math.min(cw, 100));
          const sH = Math.max(1, Math.min(ch, 50));

          try {
            const idata = ctx.getImageData(cx, cy, sW, sH).data;
            for (let idx = 0; idx < idata.length; idx += 16) {
              const r = idata[idx];
              const g = idata[idx + 1];
              const b = idata[idx + 2];
              const dist = Math.hypot(r - avgBg.r, g - avgBg.g, b - avgBg.b);
              if (dist > maxDist) {
                maxDist = dist;
                bestColor = { r, g, b };
              }
            }
          } catch {
            // fallback
          }

          const bgLum = 0.299 * avgBg.r + 0.587 * avgBg.g + 0.114 * avgBg.b;
          let textColorHex = "FFFFFF";
          if (maxDist > 45) {
            textColorHex = [bestColor.r, bestColor.g, bestColor.b]
              .map((c) => c.toString(16).padStart(2, "0"))
              .join("")
              .toUpperCase();
          } else {
            textColorHex = bgLum > 140 ? "1A1A2E" : "FFFFFF";
          }

          // PowerPoint coordinates
          const xInches = line.minX * scaleToInchesX;
          const yInches = topPts * scaleToInchesY;
          const wInches = Math.max(0.6, (line.maxX - line.minX) * scaleToInchesX + 0.25);
          const hInches = Math.max(0.35, line.fontSize * scaleToInchesY * 1.35);

          // Calculate PowerPoint font size (pt)
          let pptFontSize = Math.round(line.fontSize * (slideHeight * 72 / origViewport.height));
          pptFontSize = Math.max(10, Math.min(54, pptFontSize));

          const isRTL = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(trimmedText);

          shapes.push({
            text: trimmedText,
            x: xInches,
            y: yInches,
            w: wInches,
            h: hInches,
            fontSize: pptFontSize,
            bold: line.isBold,
            italic: line.isItalic,
            color: textColorHex,
            align: isRTL ? "right" : "left",
            canvasBounds: { cx, cy, cw, ch, topBg, botBg },
          });
        }

        totalShapesFound += shapes.length;

        // E. If editable shapes enabled: erase old text from the background image on canvas
        if (enableShapes && shapes.length > 0) {
          for (const s of shapes) {
            const { cx, cy, cw, ch, topBg, botBg } = s.canvasBounds;
            const padX = 4;
            const padY = 3;
            const rx = Math.max(0, cx - padX);
            const ry = Math.max(0, cy - padY);
            const rw = Math.min(canvas.width - rx, cw + padX * 2);
            const rh = Math.min(canvas.height - ry, ch + padY * 2);

            const grad = ctx.createLinearGradient(rx, ry, rx, ry + rh);
            grad.addColorStop(0, `rgb(${topBg.r}, ${topBg.g}, ${topBg.b})`);
            grad.addColorStop(1, `rgb(${botBg.r}, ${botBg.g}, ${botBg.b})`);
            ctx.fillStyle = grad;
            ctx.fillRect(rx, ry, rw, rh);
          }
        }

        const dataUrl = canvas.toDataURL("image/jpeg", jpegQuality);

        renderedSlides.push({
          index: i,
          dataUrl,
          aspect: firstAspect,
          shapes,
          text: allPageText,
        });
      }

      // 3. Build PPTX presentation with shapes & background
      setProgressPercent(85);
      setProgress("د چێکرنا فایلا PowerPoint دا (دانانا شێوە و تێکستێ دەستکاریکری)...");

      const PptxGenJS = (await import("pptxgenjs")).default;
      const prs = new PptxGenJS();
      prs.title = file.name.replace(/\.pdf$/i, "");

      if (firstAspect >= 1.55) {
        prs.layout = "LAYOUT_16x9";
      } else if (firstAspect >= 1.2 && firstAspect <= 1.45) {
        prs.layout = "LAYOUT_4x3";
      } else {
        prs.defineLayout({
          name: "CUSTOM_LAYOUT",
          width: slideWidth,
          height: slideHeight,
        });
        prs.layout = "CUSTOM_LAYOUT";
      }

      renderedSlides.forEach((slideData) => {
        const slide = prs.addSlide();

        // Layer 1: Background artwork & graphics
        slide.background = { color: "FFFFFF" };
        slide.addImage({
          data: slideData.dataUrl,
          x: 0,
          y: 0,
          w: slideWidth,
          h: slideHeight,
        });

        // Layer 2: Editable shapes & text boxes on top!
        if (enableShapes && slideData.shapes.length > 0) {
          slideData.shapes.forEach((s) => {
            slide.addText(s.text, {
              x: Number(s.x.toFixed(3)),
              y: Number(s.y.toFixed(3)),
              w: Number(s.w.toFixed(3)),
              h: Number(s.h.toFixed(3)),
              fontSize: s.fontSize,
              bold: s.bold,
              italic: s.italic,
              color: s.color,
              fontFace: "Arial",
              align: s.align,
              valign: "top",
              wrap: true,
              margin: 0,
            });
          });
        }

        // Layer 3: Speaker notes
        if (includeNotes && slideData.text.trim()) {
          slide.addNotes(slideData.text.trim());
        }
      });

      setProgressPercent(95);
      setProgress("د ئامادەکرنا فایلا داگرتنێدا...");

      const blob = (await prs.write({ outputType: "blob" })) as Blob;
      const url = URL.createObjectURL(blob);
      const outputName = file.name.replace(/\.pdf$/i, "") + ".pptx";

      // Quota consumption
      consumeToolQuota("pdf_to_ppt", "گوهۆڕینا PDF بۆ PowerPoint");

      setProgressPercent(100);
      setResult({
        url,
        name: outputName,
        slides: totalPages,
        shapesCount: totalShapesFound,
        aspectRatioName: aspectName,
        previews: renderedSlides.map((s) => ({
          index: s.index,
          dataUrl: s.dataUrl,
          aspect: s.aspect,
        })),
      });
      setActivePreviewIndex(0);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "کێشەیەکێ نەچاوەڕوانکری پەیدابوو د گوهۆڕینا PDFێدا.";
      setError(`کێشە د گوهۆڕینێدا چێبوو: ${msg}`);
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
    setProgressPercent(0);
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 md:p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
      {/* Header */}
      <div className="mb-6 text-right">
        <div className="flex items-center justify-end gap-3 mb-1">
          <div>
            <h3 className="text-xl font-extrabold flex items-center gap-2 justify-end">
              <span>گوهۆڕینا PDF بۆ PowerPoint</span>
            </h3>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground shrink-0 shadow-sm"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Presentation className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          هەمی تێکست دبنە سندوقێن تێکستی و شێوە (Shape) دا کو بشێی ڕاستەوخۆ د ناڤ پاوەرپۆینتدا دەستکاریێ بکەی.
        </p>
      </div>

      {/* Upload Box */}
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
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground shadow-md"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm mb-0.5">فایلا PDF بار بکە</p>
            <p className="text-xs text-muted-foreground">کلیک بکە یان فایلێ لڤێرە ڕابکێشە (Drag &amp; Drop)</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground/80 mt-1">
            <span className="flex items-center gap-1">
              <MousePointerClick className="w-3.5 h-3.5 text-primary" /> تێکست و سەردێڕێن دەستکاریکری (Shape)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-success" /> پاراستنا 100٪ یا باکگراوند و وێنان
            </span>
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
        <div className="mb-6 rounded-2xl border border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={reset}
              disabled={loading}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0"
              title="ژێبرن"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 min-w-0 text-right">
              <div>
                <p className="text-sm font-bold truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Conversion Options */}
          {!result && !loading && (
            <div className="mt-4 pt-4 border-t border-border/60">
              <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-foreground mb-3">
                <span>ڕێکخستنێن شێوە و تێکستێ پاوەرپۆینت</span>
                <Sliders className="w-3.5 h-3.5 text-primary" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                {/* Editable Shapes Toggle */}
                <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                  <span className="text-[11px] font-bold text-muted-foreground block mb-1.5">شێوازێ تێکستێ سلایدێ</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEnableShapes(true)}
                      className={`flex-1 text-xs py-2 px-2 rounded-lg font-bold transition text-center flex items-center justify-center gap-1.5 ${
                        enableShapes
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" /> شێوە و تێکستێ دەستکاریکری
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnableShapes(false)}
                      className={`flex-1 text-xs py-2 px-2 rounded-lg font-bold transition text-center ${
                        !enableShapes
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      تنێ وێنەیێ دیزاینێ
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                    {enableShapes
                      ? "تێکست (وەکی ناڤێ نڤیسەری، سەردێڕ و خاڵ) دبنە سندوقێن تێکستێ یێن ڕاستەقینە و دشێی د ناڤ PowerPoint دا بنڤیسیەڤە."
                      : "لاپەر وەک وێنە دمینن بێی چێکرنا سندوقێن تێکستی."}
                  </p>
                </div>

                {/* Quality & Notes Mode */}
                <div className="rounded-xl border border-border/70 bg-background/80 p-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground block mb-1.5">کوالێتیا باکگراوندی</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setQualityMode("high")}
                        className={`flex-1 text-xs py-1.5 px-2 rounded-lg font-bold transition text-center ${
                          qualityMode === "high"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Full HD (بلەز)
                      </button>
                      <button
                        type="button"
                        onClick={() => setQualityMode("ultra")}
                        className={`flex-1 text-xs py-1.5 px-2 rounded-lg font-bold transition text-center ${
                          qualityMode === "ultra"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Ultra HD 4K (زەلال)
                      </button>
                    </div>
                  </div>
                  <label className="flex items-center justify-end gap-2 mt-2 cursor-pointer select-none">
                    <span className="text-[11px] text-muted-foreground">تۆمارکرنا تێکستی د تێبینییاندا (Notes)</span>
                    <input
                      type="checkbox"
                      checked={includeNotes}
                      onChange={(e) => setIncludeNotes(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3.5 mb-4 text-right">
          {error}
        </div>
      )}

      {/* Progress & Loading State */}
      {loading && (
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-5 mb-5 text-right">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-primary">{progressPercent}%</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{progress}</span>
              <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
            </div>
          </div>
          {/* Progress bar track */}
          <div className="w-full bg-secondary/80 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%`, background: "var(--gradient-primary)" }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            پشکنینا هەمی پەیڤان، سەردێڕان و دروستکرنا شێوەیێن دەستکاریکری بۆ د ناڤ PowerPoint دا...
          </p>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="rounded-2xl border border-border bg-background p-5 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-success/15 text-success flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> ئامادەیە ب شێوە و تێکستێ دەستکاریکری
            </span>
            <span className="text-sm font-bold text-foreground">ئەنجامێ سەرکەفتیێ گوهۆڕینێ</span>
          </div>

          {/* Quick info chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4 text-right">
            <div className="rounded-xl bg-secondary/40 p-2.5">
              <p className="text-[10px] text-muted-foreground">ژمارەیا سلایدان</p>
              <p className="text-sm font-extrabold text-primary">{result.slides} سلاید</p>
            </div>
            <div className="rounded-xl bg-secondary/40 p-2.5">
              <p className="text-[10px] text-muted-foreground">شێوەیێن دەستکاریکری (Shapes)</p>
              <p className="text-sm font-extrabold text-success">{result.shapesCount} شێوە</p>
            </div>
            <div className="rounded-xl bg-secondary/40 p-2.5 col-span-2 sm:col-span-1">
              <p className="text-[10px] text-muted-foreground">ڕەهەندێ شاشەیێ</p>
              <p className="text-xs font-bold text-foreground truncate">{result.aspectRatioName}</p>
            </div>
          </div>

          {/* Slide Preview Viewer */}
          {result.previews && result.previews.length > 0 && (
            <div className="mb-5 rounded-xl border border-border/80 bg-secondary/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActivePreviewIndex((prev) => Math.max(0, prev - 1))}
                    disabled={activePreviewIndex === 0}
                    className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono text-muted-foreground px-2">
                    {activePreviewIndex + 1} / {result.previews.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActivePreviewIndex((prev) => Math.min(result.previews.length - 1, prev + 1))}
                    disabled={activePreviewIndex === result.previews.length - 1}
                    className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>پێشبینیا سلایدان</span>
                  <Eye className="w-3.5 h-3.5 text-primary" />
                </span>
              </div>

              {/* Main large active preview */}
              <div className="relative rounded-lg overflow-hidden border border-border/70 bg-black/5 flex items-center justify-center aspect-video max-h-[280px]">
                <img
                  src={result.previews[activePreviewIndex].dataUrl}
                  alt={`سلایدا ${activePreviewIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                  سلاید {activePreviewIndex + 1}
                </div>
              </div>

              {/* Mini thumbnails ribbon */}
              <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1 scrollbar-thin">
                {result.previews.map((p, idx) => (
                  <button
                    key={p.index}
                    type="button"
                    onClick={() => setActivePreviewIndex(idx)}
                    className={`relative rounded-md overflow-hidden shrink-0 border-2 transition aspect-video w-16 h-10 ${
                      activePreviewIndex === idx ? "border-primary ring-2 ring-primary/20 scale-105" : "border-border/60 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={p.dataUrl} alt={`پێشبینیا ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Download Button */}
          <a
            href={result.url}
            download={result.name}
            className="flex items-center justify-center gap-2.5 w-full rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-extrabold hover:opacity-95 transition active:scale-[0.99] shadow-md"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <Download className="w-4 h-4" /> داگرتنا فایلا نویکری یا PowerPoint (.pptx)
          </a>
          <p className="text-center text-[11px] text-muted-foreground mt-2 truncate">
            {result.name}
          </p>
        </div>
      )}

      {/* Action Button */}
      {!result && !loading && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={convert}
            disabled={!file}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-7 py-3 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition active:scale-[0.98]"
            style={{ boxShadow: file ? "var(--shadow-glow)" : undefined }}
          >
            <Presentation className="w-4 h-4" /> بگوهۆڕە بۆ PowerPoint
          </button>
        </div>
      )}

      {/* Reset button after completion */}
      {result && (
        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition"
          >
            گوهۆڕینا فایلەکێ دی
          </button>
        </div>
      )}
    </div>
  );
}
