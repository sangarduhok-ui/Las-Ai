import React, { useState, useRef, useEffect, DragEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Upload,
  X,
  Loader2,
  FileText,
  Download,
  Stamp,
  Type,
  Palette,
  RotateCcw,
  Check,
  Eye,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import { PDFDocument, degrees } from "@cantoo/pdf-lib";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FontOption {
  id: string;
  name: string;
  nameKurdish: string;
  cssFamily: string;
  category: "kurdish" | "standard" | "classic" | "stamp";
}

const WATERMARK_FONTS: FontOption[] = [
  { id: "noto-kufi", name: "Noto Kufi Arabic", nameKurdish: "نۆتۆ کوفی (کوردی فەرمی)",      cssFamily: "'Noto Kufi Arabic', sans-serif",          category: "kurdish"  },
  { id: "cairo",    name: "Cairo",            nameKurdish: "قاهیرە (سەردەمی)",               cssFamily: "'Cairo', 'Noto Kufi Arabic', sans-serif", category: "kurdish"  },
  { id: "amiri",    name: "Amiri",            nameKurdish: "ئەمیری (نەسخ کلاسیک)",           cssFamily: "'Amiri', 'Noto Kufi Arabic', serif",      category: "classic"  },
  { id: "inter",    name: "Inter",            nameKurdish: "ئینتەر (نێڤدەولەتی)",            cssFamily: "'Inter', sans-serif",                    category: "standard" },
  { id: "times",    name: "Times New Roman",  nameKurdish: "تایمز (Serif کلاسیک)",            cssFamily: "'Times New Roman', Times, serif",         category: "classic"  },
  { id: "courier",  name: "Courier New",      nameKurdish: "کوریەر (ماشینی)",                 cssFamily: "'Courier New', Courier, monospace",       category: "standard" },
  { id: "impact",   name: "Impact",           nameKurdish: "ئیمپاکت (مۆرێ ئەستوور)",         cssFamily: "Impact, Haettenschweiler, sans-serif",    category: "stamp"    },
  { id: "tahoma",   name: "Tahoma",           nameKurdish: "تاهۆما (سیستەمی)",               cssFamily: "Tahoma, Arial, sans-serif",               category: "standard" },
];

const WATERMARK_COLORS = [
  { id: "red",   name: "سۆر",       hex: "#dc2626" },
  { id: "gray",  name: "خۆلەمێشی",  hex: "#4b5563" },
  { id: "blue",  name: "شین",       hex: "#2563eb" },
  { id: "black", name: "ڕەش",       hex: "#111827" },
  { id: "green", name: "کەسک",      hex: "#16a34a" },
  { id: "amber", name: "زێڕین",     hex: "#d97706" },
];

const ANGLE_OPTIONS = [
  { id: "diagonal",   label: "لار ↗",      sublabel: "(45°)"  },
  { id: "horizontal", label: "ئاسۆیی →",   sublabel: "(0°)"   },
  { id: "reverse",    label: "لاریێ دی ↘", sublabel: "(-45°)" },
];

const SIZE_OPTIONS = [
  { id: "normal", label: "نۆرمال",     sublabel: "ئاسایی" },
  { id: "large",  label: "مەزن",       sublabel: "Large"  },
  { id: "xlarge", label: "گەلەک مەزن", sublabel: "Extra"  },
];

const WM_CSS = `
  .wm-card{border-radius:20px;background:var(--card);border:1px solid var(--border);padding:28px;box-shadow:var(--shadow-elegant,0 4px 24px rgba(0,0,0,.08))}
  .wm-header{display:flex;align-items:center;justify-content:flex-end;gap:12px;margin-bottom:22px}
  .wm-icon-box{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:var(--gradient-primary,var(--primary));color:var(--primary-foreground);flex-shrink:0}
  .wm-title{font-size:1.1rem;font-weight:800;text-align:right;direction:rtl}
  .wm-sub{font-size:.72rem;color:var(--muted-foreground);text-align:right;direction:rtl}
  .wm-upload{border:2px dashed var(--border);border-radius:16px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:36px 16px;margin-bottom:20px;transition:border-color .2s,background .2s;text-align:center}
  .wm-upload:hover,.wm-upload.drag{border-color:var(--primary);background:color-mix(in srgb,var(--primary) 5%,transparent)}
  .wm-upload-icon{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:var(--gradient-primary,var(--primary));color:var(--primary-foreground)}
  .wm-upload-t{font-size:.88rem;font-weight:700;direction:rtl}
  .wm-upload-h{font-size:.73rem;color:var(--muted-foreground);direction:rtl}
  .wm-chip{display:flex;align-items:center;gap:10px;background:var(--secondary);border-radius:14px;padding:10px 14px;margin-bottom:20px;border:1px solid var(--border)}
  .wm-chip-info{flex:1;min-width:0;text-align:right;direction:rtl}
  .wm-chip-name{font-size:.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .wm-chip-meta{font-size:.72rem;color:var(--muted-foreground)}
  .wm-chip-rm{width:32px;height:32px;border-radius:8px;border:none;background:transparent;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted-foreground);transition:color .15s,background .15s}
  .wm-chip-rm:hover{color:var(--destructive);background:color-mix(in srgb,var(--destructive) 12%,transparent)}
  .wm-layout{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
  @media(max-width:700px){.wm-layout{grid-template-columns:1fr}}
  .wm-settings{display:flex;flex-direction:column;gap:12px}
  .wm-sec{background:var(--secondary,#f5f5f5);border:1px solid color-mix(in srgb,var(--border) 60%,transparent);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px}
  .wm-sec-hd{display:flex;align-items:center;justify-content:flex-end;gap:7px;direction:rtl}
  .wm-sec-title{font-size:.7rem;font-weight:700;color:var(--muted-foreground);text-transform:uppercase;letter-spacing:.04em}
  .wm-text-in{width:100%;border-radius:10px;border:1px solid var(--border);background:var(--background);padding:9px 14px;font-size:.92rem;font-weight:700;text-align:center;outline:none;transition:box-shadow .15s;color:var(--foreground);box-sizing:border-box}
  .wm-text-in:focus{box-shadow:0 0 0 2.5px color-mix(in srgb,var(--primary) 35%,transparent)}
  .wm-font-btn{display:flex;align-items:center;justify-content:space-between;gap:8px;border-radius:10px;border:1px solid var(--border);background:var(--background);padding:8px 12px;font-size:.8rem;font-weight:600;cursor:pointer;color:var(--foreground);transition:border-color .15s;width:100%}
  .wm-font-btn:hover{border-color:var(--primary)}
  @keyframes wm-in{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:none}}
  .wm-font-dd{position:absolute;top:calc(100% + 6px);right:0;left:0;background:var(--card);border:1px solid var(--border);border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.18);padding:6px;z-index:60;max-height:240px;overflow-y:auto;animation:wm-in .15s ease}
  .wm-font-item{display:flex;align-items:center;width:100%;border:none;background:transparent;cursor:pointer;padding:9px 12px;border-radius:9px;font-size:.82rem;text-align:right;direction:rtl;color:var(--foreground);transition:background .12s;gap:8px}
  .wm-font-item:hover{background:var(--secondary)}
  .wm-font-item.on{background:var(--primary);color:var(--primary-foreground);font-weight:700}
  .wm-font-sub{font-size:.68rem;color:var(--muted-foreground);font-weight:400}
  .wm-font-item.on .wm-font-sub{color:color-mix(in srgb,var(--primary-foreground) 70%,transparent)}
  .wm-sel-f{display:flex;flex-direction:column;gap:5px;position:relative}
  .wm-sel-lbl{display:flex;align-items:center;justify-content:flex-end;gap:5px;font-size:.7rem;font-weight:700;color:var(--muted-foreground);direction:rtl}
  .wm-sel-btn{display:flex;align-items:center;justify-content:space-between;gap:8px;border-radius:10px;border:1px solid var(--border);background:var(--background);padding:8px 12px;font-size:.8rem;font-weight:600;cursor:pointer;color:var(--foreground);transition:border-color .15s;width:100%;direction:rtl}
  .wm-sel-btn:hover{border-color:var(--primary)}
  .wm-sel-dd{position:absolute;top:calc(100% + 5px);right:0;left:0;background:var(--card);border:1px solid var(--border);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.16);padding:5px;z-index:60;animation:wm-in .15s ease}
  .wm-sel-item{display:flex;align-items:center;justify-content:space-between;width:100%;border:none;background:transparent;cursor:pointer;padding:8px 11px;border-radius:8px;font-size:.8rem;font-weight:500;text-align:right;direction:rtl;color:var(--foreground);transition:background .12s}
  .wm-sel-item:hover{background:var(--secondary)}
  .wm-sel-item.on{background:var(--primary);color:var(--primary-foreground);font-weight:700}
  .wm-op-val{font-size:.78rem;font-weight:800;min-width:36px;text-align:center;background:color-mix(in srgb,var(--primary) 12%,transparent);color:var(--primary);border-radius:7px;padding:2px 6px}
  .wm-slider{width:100%;accent-color:var(--primary);cursor:pointer}
  .wm-op-hints{display:flex;justify-content:space-between;font-size:.67rem;color:var(--muted-foreground);direction:rtl}
  .wm-colors{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}
  .wm-sw{width:28px;height:28px;border-radius:50%;border:2px solid transparent;cursor:pointer;transition:transform .15s,box-shadow .15s;display:flex;align-items:center;justify-content:center}
  .wm-sw:hover{transform:scale(1.12)}
  .wm-sw.on{transform:scale(1.18);box-shadow:0 0 0 2.5px var(--background),0 0 0 5px var(--primary)}
  .wm-pv-panel{display:flex;flex-direction:column;gap:10px}
  .wm-pv-lbl{display:flex;align-items:center;justify-content:space-between;font-size:.72rem;font-weight:700;color:var(--muted-foreground);direction:rtl}
  .wm-pv-lbl-l{display:flex;align-items:center;gap:6px;color:var(--primary)}
  .wm-pv-wrap{border-radius:16px;border:1.5px solid var(--border);background:color-mix(in srgb,var(--muted,#888) 15%,transparent);padding:16px;display:flex;align-items:center;justify-content:center;min-height:280px}
  .wm-pv-doc{position:relative;background:white;border-radius:8px;box-shadow:0 4px 28px rgba(0,0,0,.2);overflow:hidden;width:100%;max-width:300px;container-type:inline-size}
  .wm-pv-badge{position:absolute;top:7px;right:7px;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);color:white;font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;pointer-events:none;direction:rtl}
  .wm-pv-ov{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;overflow:hidden;padding:12px}
  .wm-err{background:color-mix(in srgb,var(--destructive) 10%,transparent);color:var(--destructive);border-radius:10px;padding:10px 14px;font-size:.82rem;text-align:right;direction:rtl;margin-top:14px}
  .wm-result{border-radius:14px;border:1px solid var(--border);background:var(--background);padding:16px;margin-top:14px}
  .wm-result-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;direction:rtl}
  .wm-result-badge{font-size:.72rem;font-weight:700;padding:3px 10px;border-radius:99px;background:color-mix(in srgb,#22c55e 15%,transparent);color:#16a34a}
  .wm-dl-btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;border-radius:12px;background:var(--gradient-primary,var(--primary));color:var(--primary-foreground);padding:11px 20px;font-size:.88rem;font-weight:700;border:none;cursor:pointer;text-decoration:none;transition:opacity .15s;box-shadow:var(--shadow-glow,0 2px 12px rgba(0,0,0,.15))}
  .wm-dl-btn:hover{opacity:.88}
  .wm-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:18px;direction:rtl}
  .wm-actions-hint{font-size:.75rem;color:var(--muted-foreground)}
  .wm-apply-btn{display:inline-flex;align-items:center;gap:8px;border-radius:12px;background:var(--gradient-primary,var(--primary));color:var(--primary-foreground);padding:10px 22px;font-size:.88rem;font-weight:700;border:none;cursor:pointer;transition:opacity .15s;box-shadow:var(--shadow-glow,0 2px 12px rgba(0,0,0,.15))}
  .wm-apply-btn:hover:not(:disabled){opacity:.88}
  .wm-apply-btn:disabled{opacity:.45;cursor:not-allowed}
  .wm-load-row{display:flex;align-items:center;gap:8px;color:var(--primary);padding:6px 0;direction:rtl;margin-top:14px}
  .wm-reset-lnk{font-size:.75rem;color:var(--muted-foreground);background:none;border:none;cursor:pointer;text-decoration:underline;text-underline-offset:2px;transition:color .15s;display:block;text-align:center;margin-top:8px;direction:rtl}
  .wm-reset-lnk:hover{color:var(--foreground)}
`;

function WmSelect({ value, onChange, options, label, icon: Icon }: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string; sublabel?: string }[];
  label: string;
  icon: React.ComponentType<{ style?: React.CSSProperties }>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cur = options.find(o => o.id === value);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div className="wm-sel-f" ref={ref}>
      <label className="wm-sel-lbl"><Icon style={{ width: 13, height: 13 }} />{label}</label>
      <button type="button" className="wm-sel-btn" onClick={() => setOpen(!open)}>
        <span>
          {cur?.label}
          {cur?.sublabel && <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}> {cur.sublabel}</span>}
        </span>
        <ChevronDown style={{ width: 13, height: 13, color: "var(--muted-foreground)", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>
      {open && (
        <div className="wm-sel-dd">
          {options.map(opt => (
            <button key={opt.id} type="button"
              className={`wm-sel-item ${value === opt.id ? "on" : ""}`}
              onClick={() => { onChange(opt.id); setOpen(false); }}>
              <span>
                {opt.label}
                {opt.sublabel && <span style={{ color: value === opt.id ? "inherit" : "var(--muted-foreground)", fontWeight: 400, fontSize: ".72em" }}> {opt.sublabel}</span>}
              </span>
              {value === opt.id && <Check style={{ width: 13, height: 13, flexShrink: 0 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PdfWatermark() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(0.2);
  const [selectedFont, setSelectedFont] = useState<FontOption>(WATERMARK_FONTS[0]);
  const [selectedColor, setSelectedColor] = useState(WATERMARK_COLORS[0]);
  const [rotation, setRotation] = useState<"diagonal" | "horizontal" | "reverse">("diagonal");
  const [sizeScale, setSizeScale] = useState<"normal" | "large" | "xlarge">("large");
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRenderingPreview, setIsRenderingPreview] = useState(false);
  const [previewPageInfo, setPreviewPageInfo] = useState<{ totalPages: number; aspectRatio: number } | null>(null);
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) setShowFontMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Handle PDF file selection & render page 1 preview
  const pickFile = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) {
      setError("تنێ فایلێن PDF قبول دکرن.");
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };


  // Render Page 1 of PDF for live preview
  useEffect(() => {
    if (!file) { setPreviewUrl(null); setPreviewPageInfo(null); return; }
    let isCancelled = false;
    (async () => {
      setIsRenderingPreview(true);
      try {
        // @ts-expect-error - pdfjs-dist dynamic import
        const pdfjsModule = await import("pdfjs-dist/build/pdf.mjs").catch(() => import("pdfjs-dist"));
        const pdfjsLib: any = (pdfjsModule as any).default || pdfjsModule;
        if (pdfjsLib.GlobalWorkerOptions) pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (isCancelled) return;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.4 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(viewport.width));
        canvas.height = Math.max(1, Math.round(viewport.height));
        const ctx = canvas.getContext("2d", { alpha: false });
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          if (!isCancelled) {
            setPreviewUrl(canvas.toDataURL("image/jpeg", 0.88));
            setPreviewPageInfo({ totalPages: pdf.numPages, aspectRatio: viewport.width / viewport.height });
          }
        }
      } catch (err) {
        console.warn("PDF preview render error:", err);
      } finally {
        if (!isCancelled) setIsRenderingPreview(false);
      }
    })();
    return () => { isCancelled = true; };
  }, [file]);

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(true); };
  const onDragLeave = () => setDropActive(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(false); pickFile(e.dataTransfer.files?.[0] || null); };

  const createWatermarkPng = (watermarkText: string, fontFamily: string, colorHex: string, fontSize: number): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const textWidth = Math.ceil(ctx.measureText(watermarkText).width);
    const textHeight = Math.ceil(fontSize * 1.35);
    const scale = 2, pad = 24;
    canvas.width = (textWidth + pad * 2) * scale;
    canvas.height = (textHeight + pad * 2) * scale;
    ctx.scale(scale, scale);
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = colorHex;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(watermarkText, (textWidth + pad * 2) / 2, (textHeight + pad * 2) / 2);
    return canvas;
  };

  const applyWatermark = async () => {
    if (!file || !text.trim()) return;
    if (!isAuthenticated) { openAuthModal("login"); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const baseFontSize = sizeScale === "normal" ? 44 : sizeScale === "large" ? 64 : 84;
      const watermarkCanvas = createWatermarkPng(text.trim(), selectedFont.cssFamily, selectedColor.hex, baseFontSize);
      const pngRes = await fetch(watermarkCanvas.toDataURL("image/png"));
      const pngBuffer = await pngRes.arrayBuffer();
      const watermarkImage = await pdfDoc.embedPng(pngBuffer);
      const w = watermarkCanvas.width / 2, h = watermarkCanvas.height / 2;
      const angleDeg = rotation === "diagonal" ? 45 : rotation === "reverse" ? -45 : 0;
      const angleRad = (angleDeg * Math.PI) / 180;
      const cx = w / 2, cy = h / 2;
      const rotCx = cx * Math.cos(angleRad) - cy * Math.sin(angleRad);
      const rotCy = cx * Math.sin(angleRad) + cy * Math.cos(angleRad);
      pdfDoc.getPages().forEach((page) => {
        const { width: pWidth, height: pHeight } = page.getSize();
        page.drawImage(watermarkImage, { x: pWidth / 2 - rotCx, y: pHeight / 2 - rotCy, width: w, height: h, rotate: degrees(angleDeg), opacity });
      });
      const bytes = await pdfDoc.save({ useObjectStreams: true });
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResult({ url: URL.createObjectURL(blob), name: file.name.replace(/\.pdf$/i, "") + " ب نیشانا ئاڤێ.pdf", size: bytes.byteLength });
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "کێشەیەک هاتە دیتن د زێدەکرنا نیشانا ئاڤێدا.");
    } finally { setLoading(false); }
  };

  const reset = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setFile(null); setResult(null); setError(null); setPreviewUrl(null);
  };

  const prevRot = rotation === "diagonal" ? "rotate(-45deg)" : rotation === "reverse" ? "rotate(45deg)" : "none";
  const prevFs  = sizeScale === "normal" ? "clamp(14px,4cqw,28px)" : sizeScale === "large" ? "clamp(18px,6cqw,42px)" : "clamp(22px,8cqw,56px)";

  return (
    <>
      <style>{WM_CSS}</style>
      <div className="wm-card">

        {/* Header */}
        <div className="wm-header">
          <div>
            <div className="wm-title">نیشانا Watermark لسەر PDF</div>
            <div className="wm-sub">زێدەکرنا نیشانا ئاڤێ لسەر هەمی لاپەرێن فایلێ</div>
          </div>
          <div className="wm-icon-box"><Stamp style={{ width: 20, height: 20 }} /></div>
        </div>

        {/* Upload / File chip */}
        {!file ? (
          <div
            className={`wm-upload ${dropActive ? "drag" : ""}`}
            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="wm-upload-icon"><Upload style={{ width: 24, height: 24 }} /></div>
            <div>
              <div className="wm-upload-t">فایلا PDF بار بکە</div>
              <div className="wm-upload-h">کلیک بکە یان فایلێ لێرە باڤێژە (Drag &amp; Drop)</div>
            </div>
            <input ref={fileInputRef} type="file" accept="application/pdf,.pdf"
              onChange={(e) => pickFile(e.target.files?.[0] || null)} style={{ display: "none" }} />
          </div>
        ) : (
          <div className="wm-chip">
            <FileText style={{ width: 20, height: 20, color: "var(--primary)", flexShrink: 0 }} />
            <div className="wm-chip-info">
              <div className="wm-chip-name">{file.name}</div>
              <div className="wm-chip-meta">{formatBytes(file.size)}{previewPageInfo && ` • ${previewPageInfo.totalPages} لاپەر`}</div>
            </div>
            <button type="button" className="wm-chip-rm" onClick={reset}><X style={{ width: 16, height: 16 }} /></button>
          </div>
        )}

        {/* Settings + Preview two-panel */}
        {!result && (
          <div className="wm-layout">

            {/* ── Settings column ── */}
            <div className="wm-settings">

              {/* 1. Watermark text */}
              <div className="wm-sec">
                <div className="wm-sec-hd">
                  <span className="wm-sec-title">نڤیسینا نیشانا ئاڤێ</span>
                  <Type style={{ width: 14, height: 14, color: "var(--primary)" }} />
                </div>
                <input
                  type="text" value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="نموونە: CONFIDENTIAL" maxLength={45} dir="auto"
                  style={{ fontFamily: selectedFont.cssFamily }}
                  className="wm-text-in"
                />
              </div>

              {/* 2. Font */}
              <div className="wm-sec">
                <div className="wm-sec-hd">
                  <span className="wm-sec-title">فۆنت</span>
                  <Type style={{ width: 14, height: 14, color: "var(--primary)" }} />
                </div>
                <div style={{ position: "relative" }} ref={fontMenuRef}>
                  <button type="button" className="wm-font-btn" onClick={() => setShowFontMenu(!showFontMenu)}>
                    <ChevronDown style={{ width: 14, height: 14, color: "var(--muted-foreground)", flexShrink: 0, transform: showFontMenu ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
                    <span style={{ fontFamily: selectedFont.cssFamily, fontWeight: 600 }}>{selectedFont.name}</span>
                  </button>
                  {showFontMenu && (
                    <div className="wm-font-dd">
                      {WATERMARK_FONTS.map((f) => (
                        <button key={f.id} type="button"
                          className={`wm-font-item ${selectedFont.id === f.id ? "on" : ""}`}
                          onClick={() => { setSelectedFont(f); setShowFontMenu(false); }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {selectedFont.id === f.id && <Check style={{ width: 13, height: 13, flexShrink: 0 }} />}
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontFamily: f.cssFamily }}>{f.name}</div>
                              <div className="wm-font-sub">{f.nameKurdish}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Opacity */}
              <div className="wm-sec">
                <div className="wm-sec-hd">
                  <span className="wm-op-val">{Math.round(opacity * 100)}%</span>
                  <span className="wm-sec-title">ڕوناهی / شەفافی</span>
                  <SlidersHorizontal style={{ width: 14, height: 14, color: "var(--primary)" }} />
                </div>
                <input type="range" min={5} max={70} step={5} value={Math.round(opacity * 100)}
                  onChange={(e) => setOpacity(parseInt(e.target.value) / 100)} className="wm-slider" />
                <div className="wm-op-hints"><span>کێمتر دیار</span><span>زێدە دیار</span></div>
              </div>

              {/* 4. Color */}
              <div className="wm-sec">
                <div className="wm-sec-hd">
                  <span className="wm-sec-title" style={{ marginLeft: "auto" }}>{selectedColor.name}</span>
                  <span className="wm-sec-title">ڕەنگ</span>
                  <Palette style={{ width: 14, height: 14, color: "var(--primary)" }} />
                </div>
                <div className="wm-colors">
                  {WATERMARK_COLORS.map((c) => (
                    <button key={c.id} type="button" title={c.name}
                      className={`wm-sw ${selectedColor.id === c.id ? "on" : ""}`}
                      style={{ background: c.hex }} onClick={() => setSelectedColor(c)}>
                      {selectedColor.id === c.id && <Check style={{ width: 12, height: 12, color: "white" }} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Angle + Size */}
              <div className="wm-sec">
                <div className="wm-sec-hd">
                  <span className="wm-sec-title">ئاراستە و مەزناتی</span>
                  <RotateCcw style={{ width: 14, height: 14, color: "var(--primary)" }} />
                </div>
                <WmSelect value={rotation} onChange={(v) => setRotation(v as any)} options={ANGLE_OPTIONS} label="ئاراستەی کەوتنێ" icon={RotateCcw} />
                <WmSelect value={sizeScale} onChange={(v) => setSizeScale(v as any)} options={SIZE_OPTIONS} label="مەزناتی" icon={SlidersHorizontal} />
              </div>
            </div>

            {/* ── Preview column ── */}
            <div className="wm-pv-panel">
              <div className="wm-pv-lbl">
                <span>{previewPageInfo ? `لاپەر 1 ژ ${previewPageInfo.totalPages}` : "پێشبینین"}</span>
                <div className="wm-pv-lbl-l"><Eye style={{ width: 14, height: 14 }} /><span>پێشبینینا ڕاستەوخۆ</span></div>
              </div>
              <div className="wm-pv-wrap">
                {isRenderingPreview ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <Loader2 style={{ width: 28, height: 28, color: "var(--primary)" }} className="animate-spin" />
                    <span style={{ fontSize: ".75rem", color: "var(--muted-foreground)" }}>د ئامادەکرنا پێشبینینێدا...</span>
                  </div>
                ) : (
                  <div className="wm-pv-doc" style={{ aspectRatio: previewPageInfo ? `${previewPageInfo.aspectRatio}` : "1 / 1.414" }}>
                    {previewUrl ? (
                      <img src={previewUrl} alt="PDF Page 1" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", padding: 20, display: "flex", flexDirection: "column", gap: 10, background: "white" }}>
                        <div style={{ width: "60%", height: 14, background: "#e5e7eb", borderRadius: 4, marginBottom: 8 }} />
                        {[1, .9, .85, 1, .75, 1, .88].map((w, i) => (
                          <div key={i} style={{ width: `${w * 100}%`, height: 9, background: "#f3f4f6", borderRadius: 3 }} />
                        ))}
                      </div>
                    )}
                    {/* Live watermark overlay */}
                    <div className="wm-pv-ov">
                      <span style={{
                        fontFamily: selectedFont.cssFamily, color: selectedColor.hex, opacity,
                        transform: prevRot, display: "inline-block", textAlign: "center",
                        fontWeight: 900, fontSize: prevFs, letterSpacing: "0.05em",
                        lineHeight: 1.2, wordBreak: "break-word", maxWidth: "100%", transition: "all .15s",
                      }}>
                        {text || "WATERMARK"}
                      </span>
                    </div>
                    <div className="wm-pv-badge">لاپەر 1</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="wm-err">{error}</div>}

        {/* Result download */}
        {result && (
          <div className="wm-result">
            <div className="wm-result-top">
              <span style={{ fontSize: ".82rem", fontWeight: 600 }}>ئەنجامێ نیشانا ئاڤێ</span>
              <span className="wm-result-badge">ئامادەیە ✓</span>
            </div>
            <a href={result.url} download={result.name} className="wm-dl-btn">
              <Download style={{ width: 16, height: 16 }} />
              داگرتنا PDF ب نیشانا ئاڤێ ({formatBytes(result.size)})
            </a>
          </div>
        )}

        {/* Action row */}
        {!result && !loading && (
          <div className="wm-actions">
            <span className="wm-actions-hint">
              {!file ? "تکایە فایلەکێ PDF بار بکە" : "هەمی لاپەرێن PDF دێ نیشانا ئاڤێ وەرگرن"}
            </span>
            <button type="button" className="wm-apply-btn"
              onClick={!file ? () => fileInputRef.current?.click() : applyWatermark}
              disabled={!!file && !text.trim()}>
              {!file
                ? <><Upload style={{ width: 16, height: 16 }} /> فایلێ PDF بار بکە</>
                : <><Stamp style={{ width: 16, height: 16 }} /> زێدە بکە و داگرە</>
              }
            </button>
          </div>
        )}

        {loading && (
          <div className="wm-load-row">
            <Loader2 style={{ width: 16, height: 16, color: "var(--primary)" }} className="animate-spin" />
            <span style={{ fontSize: ".82rem", fontWeight: 600 }}>د زێدەکرنا نیشانا ئاڤێدا لسەر لاپەران...</span>
          </div>
        )}

        {result && <button type="button" className="wm-reset-lnk" onClick={reset}>فایلەکێ دی بار بکە</button>}
      </div>
    </>
  );
}

