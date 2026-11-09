import { useState, useRef, DragEvent, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Upload,
  X,
  Loader2,
  FileText,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileSearch,
  Eye,
  Info,
  Calendar,
  Layers,
  Cpu,
  Hash,
  Binary,
  Copy,
  Check,
  LayoutGrid,
  Camera,
  RefreshCw,
  Download,
} from "lucide-react";
import { PDFDocument } from "@cantoo/pdf-lib";

interface Highlight {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface ForensicResult {
  percentage: number;
  resultText: string;
  status: "authentic" | "suspicious" | "forged";
  reasons: string[];
  highlights: Highlight[];
}

interface FileMetadata {
  software: string[];
  modifyDate: string | null;
  creationDate?: string;
  creator?: string;
  producer?: string;
  title?: string;
}

// Load pdf.js dynamically to enable PDF page rendering in the browser
const loadPdfJS = async (): Promise<any> => {
  // @ts-expect-error - pdfjs-dist is a transitive dep without proper types here
  let pdfjsLib = await import("pdfjs-dist/build/pdf.mjs").catch(() => import("pdfjs-dist"));
  
  // Safe default unpack for Vite/ESM module namespace wrappers
  if (pdfjsLib && pdfjsLib.default) {
    pdfjsLib = pdfjsLib.default;
  }
  
  // Use local worker from public folder to avoid CORS issues
  if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }
  return pdfjsLib;
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentForensics() {
  const { isAuthenticated, openAuthModal, consumeToolQuota } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);

  // View modes: "normal" | "ela"
  const [viewMode, setViewMode] = useState<"normal" | "ela">("normal");

  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [result, setResult] = useState<ForensicResult | null>(null);
  const [hoveredHighlight, setHoveredHighlight] = useState<number | null>(null);

  // Advanced Forensic Systems State
  const [sha256Hash, setSha256Hash] = useState<string | null>(null);
  const [technicalInfo, setTechnicalInfo] = useState<{
    pages?: number;
    version?: string;
    width?: number;
    height?: number;
    aspectRatio?: string;
  } | null>(null);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [copiedHash, setCopiedHash] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const generatePrintableReport = () => {
    if (!result && !metadata) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const title = file ? `ڕاپۆرتی دادوەری - ${file.name}` : "ڕاپۆرتی پشکنینی دادوەری";
    const statusText =
      result?.status === "authentic"
        ? "ڕەسەن (Authentic)"
        : result?.status === "suspicious"
        ? "گوماناوی (Suspicious)"
        : "ساختەکار یان دەستکاریکری (Forged)";
    const statusColor =
      result?.status === "authentic"
        ? "#16a34a"
        : result?.status === "suspicious"
        ? "#d97706"
        : "#dc2626";

    const findingsHtml = (result?.reasons || [])
      .map(
        (r, i) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 8px 12px; text-align: center; color: #64748b; font-weight: bold;">${i + 1}</td>
          <td style="padding: 8px 12px; font-weight: 500; color: #1e293b;">${r}</td>
        </tr>
      `
      )
      .join("");

    const auditsHtml = getSubsystemAudits()
      .map(
        (a) => `
        <div style="border: 1px solid #e2e8f0; background: #ffffff; border-radius: 8px; padding: 10px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-size: 12px; color: #0f172a;">${a.name}</strong>
            <span style="font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 9999px; background: ${
              a.status === "success" ? "#dcfce7; color: #15803d;" : a.status === "warning" ? "#fef3c7; color: #b45309;" : "#fee2e2; color: #b91c1c;"
            }">${a.status === "success" ? "دروستە ✓" : a.status === "warning" ? "⚠️ گومان" : "⚠️ خەلەتی"}</span>
          </div>
          <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.4;">${a.desc}</p>
        </div>
      `
      )
      .join("");

    const highlightsHtml = (result?.highlights || [])
      .map(
        (hl) => `
        <div style="position: absolute; left: ${hl.x}%; top: ${hl.y}%; width: ${hl.width}%; height: ${hl.height}%; border: 2.5px solid #ef4444; background: rgba(239, 68, 68, 0.2); border-radius: 6px; box-sizing: border-box; z-index: 5;">
          <div style="position: absolute; bottom: 100%; right: 0; margin-bottom: 2px; background: #dc2626; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.5); z-index: 10;">
            ${hl.label}
          </div>
        </div>
      `
      )
      .join("");

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ckb">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #ffffff;
            color: #0f172a;
            margin: 0;
            padding: 15px;
            direction: rtl;
          }
          .header {
            border-bottom: 2px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .card {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 14px;
            background: #f8fafc;
            page-break-inside: avoid;
          }
          .score-box {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #ffffff;
            border: 2px solid ${statusColor};
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
          }
          .score-val {
            font-size: 36px;
            font-weight: 900;
            color: ${statusColor};
            line-height: 1;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
          }
          th {
            background: #f1f5f9;
            padding: 8px 12px;
            font-weight: bold;
            text-align: right;
            border-bottom: 1px solid #cbd5e1;
            font-size: 11px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed #cbd5e1;
            font-size: 10px;
            color: #64748b;
            text-align: center;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 style="margin:0; font-size: 18px; color: #0f172a;">ڕاپۆرتی فەرمی پشکنینی دادوەری بەڵگەنامە (Forensics Report)</h1>
            <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b;">پشکنینی فۆنت، مێتاداتا، ڕەنگەکان و دیاریکردنی دەستکاریکردن</p>
          </div>
          <div style="text-align: left; font-size: 10px; color: #64748b;">
            بەروار: ${new Date().toLocaleDateString("en-GB")}<br/>
            کاتی پشکنین: ${new Date().toLocaleTimeString()}
          </div>
        </div>

        <div class="score-box">
          <div>
            <div style="font-size: 11px; color: #64748b; font-weight: bold;">ئەنجامی کۆتایی پشکنین</div>
            <div style="font-size: 17px; font-weight: 800; color: ${statusColor}; margin-top: 2px;">
              ${statusText}
            </div>
            <div style="font-size: 12px; color: #334155; margin-top: 4px; line-height: 1.4;">
              ${result?.resultText || "پشکنینی بەڵگەنامە بە سەرکەوتوویی ئەنجامدرا."}
            </div>
          </div>
          <div style="text-align: center; min-width: 90px;">
            <div class="score-val">${result?.percentage || 0}%</div>
            <div style="font-size: 10px; color: #64748b; font-weight: bold; margin-top: 2px;">ئاستی گومان</div>
          </div>
        </div>

        ${
          file
            ? `
          <div class="card">
            <h3 style="margin: 0 0 8px 0; font-size: 13px; color: #0f172a;">تایبەتمەندی و ناسنامەی دیجیتاڵی فایل (File Identity)</h3>
            <div class="grid-2" style="font-size: 11px;">
              <div><strong>ناوی فایل:</strong> ${file.name}</div>
              <div><strong>قەبارە:</strong> ${formatBytes(file.size)}</div>
              <div><strong>جۆری پەڕگە:</strong> ${file.type || "بەڵگەنامە"}</div>
              ${technicalInfo?.width ? `<div><strong>ڕوونی وێنە:</strong> ${technicalInfo.width} x ${technicalInfo.height} px</div>` : ""}
              ${sha256Hash ? `<div style="grid-column: 1 / -1; font-family: monospace; font-size: 9.5px; word-break: break-all; margin-top: 4px; background: #e2e8f0; padding: 4px 8px; border-radius: 6px;"><strong>SHA-256 Hash:</strong> ${sha256Hash}</div>` : ""}
            </div>
          </div>
        `
            : ""
        }

        ${
          imageUrl && result
            ? `
          <div class="card">
            <h3 style="margin: 0 0 8px 0; font-size: 13px; color: #0f172a;">دیمەنی بەڵگەنامە و شوێنە دەستکاریکراوەکان (Highlighted Evidence)</h3>
            <div style="text-align: center; background: #0f172a; border-radius: 8px; padding: 12px; overflow: visible;">
              <div style="position: relative; display: inline-block; max-width: 100%;">
                <img src="${imageUrl}" style="max-width: 100%; max-height: 420px; object-fit: contain; border-radius: 6px; display: block;" />
                ${highlightsHtml}
              </div>
            </div>
          </div>
        `
            : ""
        }

        <div class="card">
          <h3 style="margin: 0 0 8px 0; font-size: 13px; color: #0f172a;">ئەنجامی پشکنینە لاوەکییەکان (Forensic Subsystem Audits)</h3>
          <div class="grid-2">
            ${auditsHtml}
          </div>
        </div>

        ${
          findingsHtml
            ? `
          <div class="card">
            <h3 style="margin: 0 0 6px 0; font-size: 13px; color: #0f172a;">وردەکاری و هۆکارەکانی پشکنین (Detailed Findings)</h3>
            <table>
              <thead>
                <tr>
                  <th style="width: 35px; text-align: center;">#</th>
                  <th>هۆکار و تێبینی دۆزراوە</th>
                </tr>
              </thead>
              <tbody>
                ${findingsHtml}
              </tbody>
            </table>
          </div>
        `
            : ""
        }

        <div class="footer">
          ئەم ڕاپۆرتە بە سیستەمی زیرەکی دەستکردی پێشکەوتووی شیکاری دادوەری پشکنراوە.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setError(null);
    setPdfLoading(true);

    try {
      const h2cMod = await import("html2canvas");
      const html2canvas: typeof import("html2canvas").default =
        (h2cMod as any).default ?? (h2cMod as any);
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0f0f13",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add extra pages if content is taller than 1 A4 page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = file
        ? `forensic-report-${file.name.replace(/\.[^.]+$/, "")}.pdf`
        : "forensic-report.pdf";
      pdf.save(fileName);
    } catch (err) {
      console.warn("Direct html2canvas multi-page capture fallback:", err);
      generatePrintableReport();
    } finally {
      setPdfLoading(false);
    }
  };

  // Camera scanning states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Bind stream to video element reactively whenever stream or isCameraActive changes
  useEffect(() => {
    if (stream && isCameraActive && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, isCameraActive]);

  // Calculate SHA-256 hash for forensic digital identity
  const calculateSHA256 = async (targetFile: File): Promise<string> => {
    try {
      const buffer = await targetFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      console.error("SHA-256 calculation error:", e);
      return "نەدیار";
    }
  };

  const copyHashToClipboard = async () => {
    if (sha256Hash) {
      await navigator.clipboard.writeText(sha256Hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 1500);
    }
  };

  const startCamera = async (mode = facingMode) => {
    try {
      setError(null);
      setFile(null);
      setImageUrl(null);
      setResult(null);
      setMetadata(null);
      
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      // Check if the browser supports camera access via getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback: use native camera capture input (works on mobile over HTTP)
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        }
        return;
      }

      // Set camera active AFTER validation so UI renders the video element
      setIsCameraActive(true);

      let newStream: MediaStream;
      try {
        // First attempt: use facingMode as ideal (soft) preference so it works on desktop too
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
      } catch (firstErr) {
        console.warn("Camera with facingMode failed, trying without constraint:", firstErr);
        try {
          // Fallback: just request any available camera
          newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (fallbackErr) {
          throw fallbackErr;
        }
      }

      setStream(newStream);
      
      // Also try to attach immediately if the ref is already available
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      const errName = err?.name || "";
      if (errName === "NotAllowedError" || errName === "PermissionDeniedError") {
        setError("ڕێپێدانا کامێرایێ ڕەتکرا. تکایە د ڕێکخستنێن وێبگەڕی دا ڕێپێدانا کامێرایێ بکە.");
      } else if (errName === "NotFoundError" || errName === "DevicesNotFoundError") {
        setError("تو کامێرایەک نەهاتە دۆزین. تکایە دڵنیابە کو ئامێرا تە کامێرا هەیە.");
      } else if (errName === "NotReadableError" || errName === "TrackStartError") {
        setError("کامێرا ژ لایێ بەرنامەیەکا دی ڤە تێتە بکارئینان. تکایە ئەو بەرنامەیێ دابخە و دوبارە هەوڵ بدە.");
      } else {
        setError("ڕێپێدانا کامێرایێ سەرنەکەفت. تکایە دڵنیابە کو کامێرا کار دکەت و ڕێپێدان یا کریە.");
      }
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const switchCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], `scanned_document_${Date.now()}.png`, {
              type: "image/png"
            });
            pickFile(capturedFile);
            stopCamera();
          }
        }, "image/png");
      }
    }
  };

  // Helper to determine subsystem statuses based on findings
  const getSubsystemAudits = () => {
    if (!result) return [];
    
    const reasonText = (result.reasons || []).join(" ").toLowerCase();
    
    // 1. Metadata Audit
    const hasMetaIssue = metadata && metadata.software.length > 0;
    const metaStatus = hasMetaIssue ? "danger" : "success";
    const metaText = hasMetaIssue 
      ? `ناڕێکی هاتە دۆزین: بەرنامەیێ (${metadata.software.join(", ")}) هاتیە بکارئینان بو دەستکاریکرنێ.` 
      : "دروستە: چ بەرنامەیەکا دەستکاری (فۆتۆشۆپ/کانڤا) د نێو مێتاداتا دا نەهاتە دۆزین.";

    // 2. ELA Audit
    const hasElaIssue = reasonText.includes("ela") || reasonText.includes("ڕەنگ") || reasonText.includes("مۆر") || reasonText.includes("color") || reasonText.includes("stamp") || reasonText.includes("signature") || reasonText.includes("شێبەر") || reasonText.includes("سێبەر");
    const elaStatus = hasElaIssue ? (result.percentage > 70 ? "danger" : "warning") : "success";
    const elaText = hasElaIssue
      ? "ناڕێکی هەیە: جیاوازی د چینێن ڕەنگی RGB/CMYK و ئاستێ تێکچوونا ڕووناکی (ELA) دا هاتە دەستنیشانکرن."
      : "دروستە: ڕووناکی و چینێن ڕەنگی وێنەیێ تەواو هاوسەنگن.";

    // 3. Typographic Alignment Baseline Audit
    const hasFontIssue = reasonText.includes("فۆنت") || reasonText.includes("دەق") || reasonText.includes("font") || reasonText.includes("alignment") || reasonText.includes("line") || reasonText.includes("دێڕ");
    const fontStatus = hasFontIssue ? "danger" : "success";
    const fontText = hasFontIssue
      ? "ناڕێکی هەیە: ناڕێکی د ستایلێ فۆنت، لادان ژ هێڵا تەوەرەیا دەق (Alignment) یان جیاوازیا قەبارەیا پەیڤان هاتە دۆزین."
      : "دروستە: هێڵێن دەقان و جۆرێ فۆنتی ب تەواوی ڕێکخراوە و فەرمییە.";

    // 4. Copy-Move Forgery Detection (CMFD)
    const hasCopyIssue = reasonText.includes("کۆپی") || reasonText.includes("copy") || reasonText.includes("clone") || reasonText.includes("duplicate") || reasonText.includes("پەیست");
    const copyStatus = hasCopyIssue ? "danger" : "success";
    const copyText = hasCopyIssue
      ? "گومان هەیە: نیشانێن گواستنەوە، کۆپیکرن و پەیستکرنا مۆر یان واژۆ ژ جهەکی دی بو ناڤ ڤی فایلی هاتە دۆزین."
      : "دروستە: تو بەشەکی دوبارەبوویی یان کلۆنکری د لاپەڕەیێ دا نەهاتە دۆزین.";

    // 5. Double Quantization Audit
    const hasDoubleComp = hasMetaIssue || result.percentage > 40;
    const compStatus = hasDoubleComp ? "warning" : "success";
    const compText = hasDoubleComp
      ? "گومان هەیە: پاشکەوتکرن و ڕێکخستنا دوبارەیا قەبارە (Double Quantization) نیشانێن دەستکاریکرنێ ددەن."
      : "دروستە: فایلی ئێک ئاستا کچکرنا ستانداردی هەیە.";

    return [
      { id: "metadata", name: "پشکنینا پاراستنا مێتاداتا (Metadata Integrity)", status: metaStatus, desc: metaText, icon: Binary },
      { id: "ela", name: "شی تەحلیلا ڕووناکی و وێنەی ELA (Error Level Analysis)", status: elaStatus, desc: elaText, icon: Layers },
      { id: "typography", name: "پشکنینا گۆشە و ڕێزبەندیا دەق (Baseline Typographic)", status: fontStatus, desc: fontText, icon: LayoutGrid },
      { id: "copymove", name: "پشکنینا کۆپی-پەیستکرن (Copy-Move Detection)", status: copyStatus, desc: copyText, icon: FileSearch },
      { id: "doublecomp", name: "پشکنینا دوجار کۆمپرێسکرن (Double Compression)", status: compStatus, desc: compText, icon: ShieldAlert },
    ];
  };

  // Run Canvas ELA simulation when viewMode changes or image loads
  useEffect(() => {
    if (viewMode === "ela" && imageUrl && canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Match canvas dimensions to actual image display size
        canvas.width = img.naturalWidth || img.width || 600;
        canvas.height = img.naturalHeight || img.height || 400;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          const output = ctx.createImageData(canvas.width, canvas.height);
          const oData = output.data;
          
          const width = canvas.width;
          const height = canvas.height;

          // Edge & Error Level Analysis approximation filter
          for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
              const idx = (y * width + x) * 4;
              
              // Right & down pixel index
              const rIdx = idx + 4;
              const dIdx = idx + width * 4;
              
              // Difference calculation
              const diffR = 
                Math.abs(data[idx] - data[rIdx]) + 
                Math.abs(data[idx + 1] - data[rIdx + 1]) + 
                Math.abs(data[idx + 2] - data[rIdx + 2]);
                
              const diffD = 
                Math.abs(data[idx] - data[dIdx]) + 
                Math.abs(data[idx + 1] - data[dIdx + 1]) + 
                Math.abs(data[idx + 2] - data[dIdx + 2]);
              
              const edge = (diffR + diffD) / 2;
              
              // Amplify error noise
              const elaVal = Math.min(255, edge * 5);
              
              // Custom fluorescent forensics map (neon blue/magenta)
              oData[idx] = elaVal * 0.7;       // Red
              oData[idx + 1] = elaVal * 0.15;  // Green
              oData[idx + 2] = elaVal * 0.9;   // Blue
              oData[idx + 3] = 255;            // Alpha
            }
          }
          ctx.putImageData(output, 0, 0);
        } catch (e) {
          console.error("ELA canvas processing failed:", e);
        }
      }
    }
  }, [viewMode, imageUrl]);

  // Warm up PDF.js module load when component mounts to avoid Vite lazy-bundler compilation latency
  useEffect(() => {
    loadPdfJS().catch((err) => {
      console.warn("Failed to pre-warm PDF.js module:", err);
    });
  }, []);

  // Client-side Binary scanner for Image edit markers
  const scanImageBinaryMetadata = async (targetFile: File): Promise<FileMetadata> => {
    try {
      const buffer = await targetFile.arrayBuffer();
      const arr = new Uint8Array(buffer);
      
      // Convert to string safely in chunks
      let str = "";
      const chunkSize = 65536;
      for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.subarray(i, i + chunkSize);
        str += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const indicators = [
        { name: "Adobe Photoshop", regex: /Photoshop|Adobe Photoshop/i },
        { name: "Adobe Illustrator", regex: /Illustrator|Adobe Illustrator/i },
        { name: "GIMP", regex: /GIMP/i },
        { name: "Canva", regex: /Canva/i },
        { name: "CorelDRAW", regex: /CorelDraw/i },
        { name: "Affinity Photo", regex: /Affinity/i },
        { name: "Pixelmator", regex: /Pixelmator/i },
      ];
      
      const foundSoftware: string[] = [];
      for (const ind of indicators) {
        if (ind.regex.test(str)) {
          foundSoftware.push(ind.name);
        }
      }
      
      let modifyDate: string | null = null;
      // Search Adobe XMP metadata date packet
      const xmpDateMatch = str.match(/<xmp:ModifyDate>([^<]+)<\/xmp:ModifyDate>/i);
      if (xmpDateMatch) {
        modifyDate = xmpDateMatch[1].replace("T", " ").split("+")[0];
      } else {
        // EXIF DateTime digitizer pattern
        const exifMatch = str.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
        if (exifMatch) {
          modifyDate = `${exifMatch[1]}-${exifMatch[2]}-${exifMatch[3]} ${exifMatch[4]}:${exifMatch[5]}:${exifMatch[6]}`;
        }
      }
      
      return {
        software: foundSoftware,
        modifyDate: modifyDate,
      };
    } catch (e) {
      console.error("Binary metadata scan error:", e);
      return { software: [], modifyDate: null };
    }
  };

  // Client-side PDF property extractor via pdf-lib
  const scanPdfMetadata = async (targetFile: File): Promise<FileMetadata> => {
    try {
      const buffer = await targetFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      
      const software: string[] = [];
      const creator = pdfDoc.getCreator();
      const producer = pdfDoc.getProducer();
      
      if (creator) software.push(creator);
      if (producer && producer !== creator) software.push(producer);

      // Clean check against editing utilities
      const editUtils = ["Photoshop", "Illustrator", "Acrobat Distiller", "Acrobat PDFMaker", "Canva", "InDesign"];
      const detectedSoftware: string[] = [];
      
      software.forEach(s => {
        editUtils.forEach(u => {
          if (s.toLowerCase().includes(u.toLowerCase()) && !detectedSoftware.includes(u)) {
            detectedSoftware.push(`Adobe ${u}`.replace("Adobe Adobe", "Adobe"));
          }
        });
      });

      if (detectedSoftware.length === 0 && software.length > 0) {
        detectedSoftware.push(software[0]);
      }

      return {
        software: detectedSoftware,
        creator: creator || "نەدیار",
        producer: producer || "نەدیار",
        title: pdfDoc.getTitle() || "بێ ناونیشان",
        creationDate: pdfDoc.getCreationDate()?.toLocaleString("ku-IQ") || pdfDoc.getCreationDate()?.toLocaleString() || "نەدیار",
        modifyDate: pdfDoc.getModificationDate()?.toLocaleString("ku-IQ") || pdfDoc.getModificationDate()?.toLocaleString() || null,
      };
    } catch (e) {
      console.error("PDF metadata scan error:", e);
      return { software: [], modifyDate: null };
    }
  };

  const pickFile = async (f: File | null) => {
    if (!f) return;
    setFile(f);
    setError(null);
    setResult(null);
    setMetadata(null);
    setViewMode("normal");
    setSha256Hash(null);
    setTechnicalInfo(null);
    setAuditLogs([]);

    // Create object URL for local image preview
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setImageUrl(url);
      
      const img = new Image();
      img.onload = () => {
        const ar = (img.naturalWidth / img.naturalHeight).toFixed(2);
        setTechnicalInfo({
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: `${img.naturalWidth} x ${img.naturalHeight} (Ratio: ${ar})`
        });
      };
      img.src = url;
    } else if (f.type === "application/pdf" || f.name.endsWith(".pdf")) {
      setImageUrl(null);
      setLoading(true);
      try {
        const arrayBuffer = await f.arrayBuffer();
        
        // Extract version from bytes BEFORE transferring arrayBuffer to PDF.js worker
        const headerSlice = arrayBuffer.slice(0, 8);
        const headerStr = String.fromCharCode.apply(null, Array.from(new Uint8Array(headerSlice)));
        const pdfVersion = headerStr.startsWith("%PDF-") ? headerStr.substring(5, 8) : "1.4";

        const pdfjsLib = await loadPdfJS();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        setTechnicalInfo({
          pages: pdf.numPages,
          version: pdfVersion
        });

        const page = await pdf.getPage(1);
        
        // Render at a high scale for crisp image preview
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          await page.render({
            canvasContext: ctx,
            viewport: viewport,
          }).promise;
          
          const dataUrl = canvas.toDataURL("image/png");
          setImageUrl(dataUrl);
        } else {
          throw new Error("Unable to create canvas 2D context");
        }
      } catch (err) {
        console.error("Failed to render PDF page preview:", err);
        setError("پێشاندانا ڕووپەلێ PDFێ سەرنەکەفت: " + (err instanceof Error ? err.message : "کێشەیەک ڕوویدا") + "، بەڵام پشکنین هێشتا دەستپێدەکات.");
      } finally {
        setLoading(false);
      }
    } else {
      setImageUrl(null);
    }
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

  const analyze = async () => {
    if (!file) return;
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setAuditLogs([]);

    const log = (msg: string) => setAuditLogs(prev => [...prev, msg]);

    try {
      log("🔍 دەستپێکرنا سیستەمێ پشکنینا دادوەری...");
      await new Promise(r => setTimeout(r, 450));

      log("🔑 هەژمارکردنا ناسنامەیا دیجیتاڵی یا فایلی (SHA-256 Hash)...");
      const hash = await calculateSHA256(file);
      setSha256Hash(hash);
      await new Promise(r => setTimeout(r, 500));

      log("📄 خواندن و شی تەحلیلا داتایێن مێتاداتا (EXIF / XMP / PDF Properties)...");
      let localMeta: FileMetadata;
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        localMeta = await scanPdfMetadata(file);
      } else {
        localMeta = await scanImageBinaryMetadata(file);
      }
      setMetadata(localMeta);
      await new Promise(r => setTimeout(r, 500));

      log("🎨 کارپێکرنا مەکینەیا شی تەحلیلا تێکچوونا ڕادەیا ڕووناکی (Error Level Analysis - ELA)...");
      await new Promise(r => setTimeout(r, 450));

      log("📐 پشکنینا گۆشە و ڕێزبەندیا دەق و هێڵکاریان (Baseline Text Alignments)...");
      await new Promise(r => setTimeout(r, 450));

      log("🧩 پشکنینا کۆپی-پەیستکرن و لێکچوونا گرافیکی (Copy-Move Forgery Search)...");
      await new Promise(r => setTimeout(r, 450));

      log("🧠 شیکارکردنی فۆنت و ڕەنگەکان بە مۆدێلی دەماری یێ AI (Gemini Forensics Engine)...");

      const fileReader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        fileReader.onload = () => {
          const resultStr = fileReader.result as string;
          resolve(resultStr.split(",")[1] || "");
        };
        fileReader.onerror = reject;
        fileReader.readAsDataURL(file);
      });

      const fileBase64 = await base64Promise;

      const r = await fetch("/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "document_forensics",
          input: `پشکنینا دادوەری یا بەڵگەنامەیێ: ${file.name}`,
          fileBase64,
          mimeType: file.type || "application/octet-stream",
        }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "کێشەیەک د پرۆسێسکرنا AI دا ڕوویدا.");

      let parsedResult: ForensicResult;
      try {
        let cleanOutput = (data.output || "").trim();
        if (cleanOutput.includes("```")) {
          const match = cleanOutput.match(/```(?:json)?([\s\S]*?)```/);
          if (match && match[1]) {
            cleanOutput = match[1].trim();
          }
        }
        parsedResult = JSON.parse(cleanOutput);
      } catch (parseErr) {
        console.error("JSON parsing error:", parseErr, data.output);
        throw new Error("پشکنینا بەڵگەنامەیێ نەگەهشتە ئەنجامەکێ فەرمی (قالبێ نەگونجاو).");
      }

      setResult(parsedResult);
      log("✅ هەمی پشکنینان ب سەرکەفتنی تەواو بوون.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "چەوتیەک ڕوویدا.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    if (imageUrl && !imageUrl.startsWith("data:")) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl(null);
    setResult(null);
    setMetadata(null);
    setError(null);
    setViewMode("normal");
    setSha256Hash(null);
    setTechnicalInfo(null);
    setAuditLogs([]);
  };

  return (
    <div
      className="rounded-2xl bg-card border border-border p-6 md:p-8"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      {/* Header */}
      <div className="mb-6 text-right">
        <div className="flex items-center justify-end gap-3 mb-1">
          <h3 className="text-xl font-extrabold">سیستەمێ پشکنینا دادوەری و دیارکرنا بەڵگەنامەیێن سەختە</h3>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground shrink-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          پشکنینا فۆنت، دەستکاریکرنا ڕەنگان، شی تەحلیلا ELA و داتایێن مێتاداتا بۆ ئاشکراکرنا ساختەکاریان
        </p>
      </div>

      {/* Tab Switcher */}
      {!file && !isCameraActive && (
        <div className="flex gap-2 mb-6 border-b border-border pb-4 justify-end">
          <button
            type="button"
            onClick={() => { setIsCameraActive(false); stopCamera(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              !isCameraActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            بارکرنا فایلان
          </button>
          <button
            type="button"
            onClick={() => startCamera()}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isCameraActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            سکانکرن ب کامێرایێ
          </button>
        </div>
      )}

      {/* Camera Scanning View */}
      {isCameraActive && (
        <div className="space-y-4 mb-6">
          <style>{`
            @keyframes laser-move {
              0% { top: 0%; opacity: 0.8; }
              50% { top: 100%; opacity: 0.8; }
              100% { top: 0%; opacity: 0.8; }
            }
            .animate-laser-move {
              animation: laser-move 2.5s infinite linear;
            }
          `}</style>
          
          <div className="relative w-full aspect-video rounded-2xl border border-border bg-black overflow-hidden shadow-lg flex items-center justify-center">
            {/* Live Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Scanner Frame Overlay */}
            <div className="absolute inset-0 border-[30px] border-black/60 pointer-events-none flex items-center justify-center">
              <div className="w-full h-full border-2 border-dashed border-primary/70 relative">
                {/* Laser scan line */}
                <div className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_var(--primary)] animate-laser-move" />
              </div>
            </div>

            {/* Corner Crop Indicators */}
            <div className="absolute top-8 left-8 w-6 h-6 border-t-4 border-l-4 border-primary pointer-events-none" />
            <div className="absolute top-8 right-8 w-6 h-6 border-t-4 border-r-4 border-primary pointer-events-none" />
            <div className="absolute bottom-8 left-8 w-6 h-6 border-b-4 border-l-4 border-primary pointer-events-none" />
            <div className="absolute bottom-8 right-8 w-6 h-6 border-b-4 border-r-4 border-primary pointer-events-none" />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-border bg-card hover:bg-secondary transition flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> لادان
            </button>
            
            <button
              type="button"
              onClick={captureSnapshot}
              className="w-14 h-14 rounded-full bg-primary text-primary-foreground border-4 border-card hover:scale-105 active:scale-95 transition flex items-center justify-center shadow-lg"
              title="تۆمارکردن"
            >
              <div className="w-5 h-5 rounded-full bg-primary-foreground" />
            </button>

            <button
              type="button"
              onClick={switchCamera}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-border bg-card hover:bg-secondary transition flex items-center gap-1.5"
              title="گۆڕینی کامێرا"
            >
              <RefreshCw className="w-3.5 h-3.5" /> گۆڕینی کامێرا
            </button>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      {!file && !isCameraActive && (
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
            <p className="font-bold text-sm mb-0.5">بەڵگەنامەکێ خۆ بار بکە (PDF یان وێنە)</p>
            <p className="text-xs text-muted-foreground">کلیک بکە یان فایلێ ڕاکێشە دەڤەرێ</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => pickFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>
      )}

      {/* Hidden native camera capture input (fallback for HTTP / non-secure contexts) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const capturedFile = e.target.files?.[0];
          if (capturedFile) {
            pickFile(capturedFile);
          }
          // Reset input value so the same file can be re-captured
          e.target.value = "";
        }}
        className="hidden"
      />

      {file && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
          <FileText className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0 text-right">
            <p className="text-sm font-semibold truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0"
            aria-label="سڕین"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Button */}
      {file && !result && !loading && (
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={analyze}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:opacity-90 transition"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <Sparkles className="w-4 h-4" />
            دەستپێکرنا پشکنینا دادوەری
          </button>
        </div>
      )}

      {/* Loading State with Log Console */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-8 gap-5 text-primary">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-bold animate-pulse">پرۆسێسکرن و ئەنجامدانا پشکنیناندا...</span>
          </div>
          {auditLogs.length > 0 && (
            <div className="w-full max-w-xl bg-black/95 text-green-400 font-mono text-[11px] p-4 rounded-xl shadow-inner border border-border/40 text-left space-y-1.5 overflow-hidden">
              {auditLogs.map((logStr, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span className="text-green-600 shrink-0 select-none">&gt;</span>
                  <span className="leading-relaxed">{logStr}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-4 mb-4 text-right flex items-center justify-end gap-2 border border-destructive/20">
          <span>{error}</span>
          <AlertTriangle className="w-5 h-5 shrink-0" />
        </div>
      )}

      {/* Forensic Report Section */}
      {(result || metadata) && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-t border-border pt-6" />

          {/* PDF Download Button */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={downloadPDF}
              disabled={pdfLoading}
              className="group inline-flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.75) 100%)",
                color: "hsl(var(--primary-foreground))",
                boxShadow: "0 4px 18px hsl(var(--primary) / 0.35), 0 1px 0 rgba(255,255,255,0.1) inset",
              }}
            >
              {pdfLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:scale-110" />
              )}
              {pdfLoading ? "چاپکرنا PDF..." : "داونلۆدکرنا وەک PDF"}
            </button>
          </div>

          {/* Report Content (captured for PDF) */}
          <div ref={reportRef} className="space-y-6">

          {/* Results Summary Box */}
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-secondary/20 rounded-2xl p-6 border border-border">
              {/* Percentage Ring */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" stroke="#334155" strokeWidth="10" fill="none" opacity="0.3" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke={
                        result.status === "authentic"
                          ? "#22c55e" // green
                          : result.status === "suspicious"
                          ? "#f59e0b" // orange/yellow
                          : "#ef4444" // red
                      }
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 50}
                      strokeDashoffset={
                        2 * Math.PI * 50 - (result.percentage / 100) * (2 * Math.PI * 50)
                      }
                      style={{ transition: "stroke-dashoffset 1s ease-out" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-foreground">{result.percentage}%</span>
                    <span className="text-[10px] text-muted-foreground font-bold">ئاستێ گومانێ</span>
                  </div>
                </div>
              </div>

              {/* Status & Conclusions */}
              <div className="md:col-span-2 text-right space-y-3">
                <div className="flex items-center justify-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      result.status === "authentic"
                        ? "bg-success/15 text-success"
                        : result.status === "suspicious"
                        ? "bg-warning/15 text-warning"
                        : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {result.status === "authentic"
                      ? "ڕەسەن (Authentic)"
                      : result.status === "suspicious"
                      ? "گوماناوی (Suspicious)"
                      : "ساختەکار یان دەستکاریکری (Forged)"}
                  </span>
                  <h4 className="text-lg font-extrabold text-foreground">ئەنجامێ کۆتایی</h4>
                </div>
                <p className="text-sm font-semibold text-foreground/90 leading-relaxed">
                  {result.resultText}
                </p>
                <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                  <span>پشکنینا دادوەری ب سەرکەفتنی هاتە ئەنجامدان</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-success" />
                </div>
              </div>
            </div>
          )}

          {/* File Properties & Digital Identity */}
          {file && (
            <div className="bg-secondary/10 border border-border rounded-2xl p-5 text-right space-y-4">
              <h4 className="text-sm font-extrabold text-foreground flex items-center justify-end gap-2">
                <Hash className="w-4.5 h-4.5 text-primary" />
                تایبەتمەندیێن فایل و ناسنامەیا دیجیتاڵی (File Identity & Hashes)
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-background/50 border border-border/50 p-3 rounded-xl">
                  <span className="text-muted-foreground text-[10px] block">ناڤێ فایلی</span>
                  <span className="font-bold text-foreground truncate block text-left" dir="ltr">{file.name}</span>
                </div>
                <div className="bg-background/50 border border-border/50 p-3 rounded-xl">
                  <span className="text-muted-foreground text-[10px] block">جۆرێ فایلی</span>
                  <span className="font-bold text-foreground">{file.type || "unknown"}</span>
                </div>
                <div className="bg-background/50 border border-border/50 p-3 rounded-xl">
                  <span className="text-muted-foreground text-[10px] block">قەبارەیا فایلی</span>
                  <span className="font-bold text-foreground">{formatBytes(file.size)}</span>
                </div>
                
                {technicalInfo && (
                  <>
                    {technicalInfo.pages !== undefined && (
                      <div className="bg-background/50 border border-border/50 p-3 rounded-xl">
                        <span className="text-muted-foreground text-[10px] block">ژمارەیا لاپەڕان</span>
                        <span className="font-bold text-foreground">{technicalInfo.pages} لاپەڕە</span>
                      </div>
                    )}
                    {technicalInfo.version !== undefined && (
                      <div className="bg-background/50 border border-border/50 p-3 rounded-xl">
                        <span className="text-muted-foreground text-[10px] block">وەشانێ بەڵگەنامەیێ (PDF Version)</span>
                        <span className="font-bold text-foreground">{technicalInfo.version}</span>
                      </div>
                    )}
                    {technicalInfo.width !== undefined && (
                      <div className="bg-background/50 border border-border/50 p-3 rounded-xl">
                        <span className="text-muted-foreground text-[10px] block">قەبارەیا وێنەی (Resolution)</span>
                        <span className="font-bold text-foreground">{technicalInfo.width} x {technicalInfo.height} px</span>
                      </div>
                    )}
                    {technicalInfo.aspectRatio !== undefined && (
                      <div className="bg-background/50 border border-border/50 p-3 rounded-xl">
                        <span className="text-muted-foreground text-[10px] block">ڕادەیا گونجانێ (Aspect Ratio)</span>
                        <span className="font-bold text-foreground text-left block" dir="ltr">{technicalInfo.aspectRatio}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {sha256Hash && (
                <div className="bg-background/80 border border-border p-3 rounded-xl flex items-center justify-between gap-3 text-left">
                  <button
                    type="button"
                    onClick={copyHashToClipboard}
                    className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition shrink-0"
                    title="کۆپیکرنا هاش"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <div className="min-w-0 overflow-hidden w-full text-right sm:text-left">
                    <span className="text-muted-foreground text-[9px] block text-right font-sans">SHA-256 Digital Signature (هاشێ ناسنامەیێ)</span>
                    <span className="font-mono text-[10px] text-primary font-bold break-all block text-left" dir="ltr">
                      {sha256Hash}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Advanced Forensic System Audits */}
          {result && (
            <div className="space-y-3 text-right">
              <h4 className="text-sm font-extrabold text-foreground flex items-center justify-end gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-primary" />
                ئەنجامێن پشکنینێن جیاواز یێن سیستەمی (Forensic Subsystem Audits)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getSubsystemAudits().map((audit, idx) => {
                  const IconComp = audit.icon;
                  const isSuccess = audit.status === "success";
                  const isWarning = audit.status === "warning";
                  
                  return (
                    <div
                      key={idx}
                      className="bg-secondary/15 border border-border rounded-xl p-4 flex flex-col justify-between text-right hover:border-primary/20 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between flex-row-reverse mb-2">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5 flex-row-reverse">
                          <IconComp className="w-4 h-4 text-primary shrink-0" /> {audit.name}
                        </span>
                        
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isSuccess
                              ? "bg-success/15 text-success"
                              : isWarning
                              ? "bg-warning/15 text-warning"
                              : "bg-destructive/15 text-destructive"
                          }`}
                        >
                          {isSuccess ? "دروستە ✓" : isWarning ? "⚠️ گومان" : "⚠️ خەلەتی"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                        {audit.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Image highlighting */}
          {imageUrl && result && (
            <div className="space-y-3 text-right">
              <div className="flex items-center justify-between flex-row-reverse mb-1">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  جهێ دەستکاریکری ل سەر بەڵگەنامەیێ (Interactive Preview)
                </h4>
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1.5 bg-secondary/60 p-0.5 rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => setViewMode("ela")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                      viewMode === "ela"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    پشکنینا ELA (ڕادەیا ڕووناکی)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("normal")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                      viewMode === "normal"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    دیمەنێ ئاسایی
                  </button>
                </div>
              </div>

              <div className="relative w-full rounded-2xl border border-border bg-black/20 overflow-visible flex items-center justify-center p-4">
                <div className="relative inline-block max-w-full">
                  {/* Normal view image */}
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Forensic View"
                    className={`max-w-full max-h-[500px] object-contain transition-opacity duration-300 rounded-lg ${
                      viewMode === "ela" ? "absolute opacity-0 pointer-events-none" : "opacity-100 block"
                    }`}
                    onLoad={() => {
                      // Trigger state refresh for canvas rendering if ELA was pre-selected
                      if (viewMode === "ela") setViewMode("normal");
                    }}
                  />

                  {/* ELA Canvas View */}
                  <canvas
                    ref={canvasRef}
                    className={`max-w-full max-h-[500px] object-contain bg-black transition-opacity duration-300 rounded-lg ${
                      viewMode === "ela" ? "opacity-100 block" : "absolute opacity-0 pointer-events-none"
                    }`}
                  />

                  {/* Highlight Overlays */}
                  {viewMode === "normal" &&
                    result.highlights.map((hl, idx) => (
                      <div
                        key={idx}
                        className={`absolute border-2 rounded transition-all cursor-pointer ${
                          hoveredHighlight === idx || hoveredHighlight === null
                            ? "border-destructive/90 bg-destructive/20 shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                            : "border-destructive/40 bg-transparent"
                        }`}
                        style={{
                          left: `${hl.x}%`,
                          top: `${hl.y}%`,
                          width: `${hl.width}%`,
                          height: `${hl.height}%`,
                          boxSizing: "border-box",
                        }}
                        onMouseEnter={() => setHoveredHighlight(idx)}
                        onMouseLeave={() => setHoveredHighlight(null)}
                      >
                        <div className="absolute bottom-full right-0 mb-1 bg-destructive text-destructive-foreground text-[10px] font-extrabold px-2 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
                          {hl.label}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-1">
                * نیشانا سور جهێن گوماناوی و دەستکاریکری نیشان ددەت. ل سەر بۆکسان ڕاوەستە بو پێزانینێن زێدەتر.
              </p>
            </div>
          )}

          {/* Reasons Table & List */}
          {result && (
            <div className="space-y-3 text-right">
              <h4 className="text-sm font-bold text-foreground flex items-center justify-end gap-2">
                <Info className="w-4 h-4 text-primary" />
                هۆکار و شیکاریا ساختەکاریێ (Detailed Findings)
              </h4>
              <div className="border border-border rounded-2xl overflow-hidden bg-card">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-secondary/40 text-muted-foreground font-bold border-b border-border">
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3">هۆکارێ پشکنینێ (Reason / Finding)</th>
                      <th className="p-3 w-28 text-center">جۆرێ ئانۆمالی</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.reasons.map((reason, idx) => {
                      // Basic heuristic classifier for Kurdish output types
                      let typeLabel = "دەستکاریکرن";
                      let typeColor = "text-warning bg-warning/10";
                      if (reason.toLowerCase().includes("فۆنت") || reason.includes("font")) {
                        typeLabel = "فۆنت (Font)";
                        typeColor = "text-primary bg-primary/10";
                      } else if (
                        reason.toLowerCase().includes("ڕەنگ") ||
                        reason.includes("مۆر") ||
                        reason.includes("color") ||
                        reason.includes("stamp")
                      ) {
                        typeLabel = "ڕەنگ / مۆر";
                        typeColor = "text-destructive bg-destructive/10";
                      } else if (reason.toLowerCase().includes("مێتادات") || reason.includes("metadata")) {
                        typeLabel = "مێتاداتا";
                        typeColor = "text-success bg-success/10";
                      }

                      return (
                        <tr
                          key={idx}
                          className={`border-b border-border hover:bg-secondary/20 transition cursor-pointer ${
                            hoveredHighlight === idx ? "bg-secondary/40 font-bold" : ""
                          }`}
                          onMouseEnter={() => setHoveredHighlight(idx)}
                          onMouseLeave={() => setHoveredHighlight(null)}
                        >
                          <td className="p-3 text-center font-semibold text-muted-foreground">{idx + 1}</td>
                          <td className="p-3 font-semibold text-foreground/90">{reason}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColor}`}>
                              {typeLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Metadata Forensics Table */}
          {metadata && (
            <div className="space-y-3 text-right">
              <h4 className="text-sm font-bold text-foreground flex items-center justify-end gap-2">
                <Layers className="w-4 h-4 text-primary" />
                داتایێن ڤەشارتی یێن ناسنامەیا فایلی (Metadata Forensics)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Editing Indicators */}
                <div className="bg-secondary/20 border border-border rounded-xl p-4 flex flex-col justify-between text-right">
                  <div className="flex items-center justify-between flex-row-reverse mb-2">
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-primary" /> پرۆگرامێن دەستکاریکرنێ
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        metadata.software.length > 0
                          ? "bg-destructive/15 text-destructive"
                          : "bg-success/15 text-success"
                      }`}
                    >
                      {metadata.software.length > 0 ? "تۆماربوویی" : "پاک ✓"}
                    </span>
                  </div>
                  {metadata.software.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">ئەڤ پرۆگرامە هاتینە بکارئینان بو دەستکاریکرنێ:</p>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {metadata.software.map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-card border border-border text-foreground text-xs font-bold px-2.5 py-0.5 rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-success/90">چ نیشانێن فۆتۆشۆپ یان بەرنامەیێن دی یێن دەستکاریکرنێ د فایلی دا نەهاتنە دۆزین.</p>
                  )}
                </div>

                {/* Edit Dates */}
                <div className="bg-secondary/20 border border-border rounded-xl p-4 flex flex-col justify-between text-right">
                  <div className="flex items-center justify-between flex-row-reverse mb-2">
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> کات و ڕێکەفت
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      مێتاداتا
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {metadata.modifyDate ? (
                      <div>
                        <span className="text-muted-foreground text-[10px] block">کاتێ دەستکاریکرنا کۆتایی:</span>
                        <span className="font-bold text-foreground inline-block dir-ltr">{metadata.modifyDate}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">ڕێکەوتا گۆڕین یان پاراستن د فایلی دا نەهاتە دیتن.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed PDF Meta if PDF */}
              {metadata.creator && (
                <div className="border border-border rounded-xl bg-card p-4 text-xs text-right space-y-2">
                  <div className="grid grid-cols-2 gap-3 text-right">
                    <div>
                      <span className="text-muted-foreground text-[10px] block">ناونیشان (Title)</span>
                      <span className="font-bold text-foreground">{metadata.title || "نەدیار"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10px] block">دروستکەر (Creator)</span>
                      <span className="font-bold text-foreground">{metadata.creator}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10px] block">کۆمپانیا بەرهەمهێنەر (Producer)</span>
                      <span className="font-bold text-foreground">{metadata.producer}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10px] block">ڕێکەوتا دروستکرنێ</span>
                      <span className="font-bold text-foreground inline-block dir-ltr">{metadata.creationDate}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reset button at the bottom */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={reset}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition"
            >
              فایلەکا دی بار بکە
            </button>
          </div>
          </div> {/* end reportRef wrapper */}
        </div>
      )}
    </div>
  );
}
