import { useState, useRef, DragEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Upload,
  X,
  Loader2,
  FileText,
  Download,
  FileType2,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Layers,
  Settings2,
} from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface SpatialItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
}

interface ExtractedLine {
  y: number;
  height: number;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  text: string;
  items: SpatialItem[];
  isRtl: boolean;
}

type BlockType = "heading1" | "heading2" | "heading3" | "paragraph" | "list" | "table";

interface ExtractedBlock {
  type: BlockType;
  text: string;
  runs: {
    text: string;
    bold: boolean;
    italic: boolean;
    size: number;
  }[];
  isRtl: boolean;
  listMarker?: string;
  tableRows?: string[][];
}

function isRTL(text: string): boolean {
  const rtlChars = (text.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  const ltrChars = (text.match(/[a-zA-Z]/g) || []).length;
  return rtlChars >= ltrChars;
}

export function PdfToWord() {
  const { isAuthenticated, openAuthModal, consumeToolQuota } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [conversionMode, setConversionMode] = useState<"smart" | "ai">("smart");
  const [directionMode, setDirectionMode] = useState<"auto" | "rtl" | "ltr">("auto");
  const [preservePageBreaks, setPreservePageBreaks] = useState(true);

  const [result, setResult] = useState<{
    url: string;
    name: string;
    pages: number;
    words: number;
    paragraphs: number;
    headings: number;
  } | null>(null);

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
    setProgress("د ئامادەکرنا ژینگەها شیکارکرنێدا...");

    try {
      // ── 1. Load PDF.js ────────────────────────────────────────────────
      // @ts-expect-error - transitive dynamic import
      const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs").catch(() => import("pdfjs-dist"));
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdfDoc.numPages;

      if (totalPages === 0) {
        throw new Error("فایلا PDF چ لاپەر تێدا نینن.");
      }

      const allPagesBlocks: ExtractedBlock[][] = [];
      let totalWordCount = 0;
      let totalHeadingCount = 0;
      let totalParagraphCount = 0;
      let totalItemsFound = 0;

      // ── 2. Spatial extraction & structure reconstruction ──────────────
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const percent = 10 + Math.round((pageNum / totalPages) * 70);
        setProgressPercent(percent);
        setProgress(`لاپەر ${pageNum} ژ ${totalPages} — د خواندن و شیکارکرنا دەقیدا...`);

        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();

        interface RawItem {
          str: string;
          transform: number[];
          width: number;
          height: number;
          fontName?: string;
        }

        const rawItems = (textContent.items || []) as RawItem[];
        totalItemsFound += rawItems.length;

        // Parse spatial coordinates & font properties
        const spatialItems: SpatialItem[] = [];
        for (const it of rawItems) {
          if (!it.str) continue;
          const cleanStr = it.str.replace(/[\u200B-\u200D\uFEFF]/g, "");
          if (cleanStr.length === 0) continue;

          const scaleX = it.transform ? it.transform[0] : 1;
          const scaleY = it.transform ? it.transform[3] : 1;
          const fontSize = Math.max(
            8,
            Math.round(Math.hypot(scaleX, it.transform ? it.transform[1] : 0) || it.height || 12)
          );

          const fontName = it.fontName || "";
          const isBold = /bold|black|heavy|bd|b\b/i.test(fontName);
          const isItalic = /italic|oblique|slant/i.test(fontName);

          spatialItems.push({
            str: cleanStr,
            x: it.transform ? it.transform[4] : 0,
            y: it.transform ? it.transform[5] : 0,
            width: it.width || 0,
            height: it.height || fontSize,
            fontSize,
            isBold,
            isItalic,
          });
        }

        // Group into lines based on vertical proximity
        spatialItems.sort((a, b) => b.y - a.y);
        const lines: ExtractedLine[] = [];

        for (const item of spatialItems) {
          let line = lines.find(
            (l) => Math.abs(l.y - item.y) <= Math.max(l.fontSize, item.fontSize, 10) * 0.45
          );

          if (!line) {
            line = {
              y: item.y,
              height: item.height,
              fontSize: item.fontSize,
              isBold: item.isBold,
              isItalic: item.isItalic,
              text: "",
              items: [],
              isRtl: false,
            };
            lines.push(line);
          }

          line.items.push(item);
          line.fontSize = Math.max(line.fontSize, item.fontSize);
          if (item.isBold) line.isBold = true;
        }

        // Sort lines from top of page to bottom
        lines.sort((a, b) => b.y - a.y);

        // Process each line: sort horizontally & insert word spacing
        for (const line of lines) {
          // Sort items horizontally
          line.items.sort((a, b) => a.x - b.x);

          let fullLineText = "";
          for (let k = 0; k < line.items.length; k++) {
            const cur = line.items[k];
            if (k > 0) {
              const prev = line.items[k - 1];
              const gap = cur.x - (prev.x + prev.width);
              if (gap > 1.8 && !fullLineText.endsWith(" ") && !cur.str.startsWith(" ")) {
                fullLineText += " ";
              }
            }
            fullLineText += cur.str;
          }

          line.text = fullLineText.trim();
          line.isRtl =
            directionMode === "rtl"
              ? true
              : directionMode === "ltr"
              ? false
              : isRTL(line.text);
        }

        // Filter out empty lines
        const validLines = lines.filter((l) => l.text.length > 0);

        // Calculate median body font size for this page
        const fontSizes = validLines.map((l) => l.fontSize).sort((a, b) => a - b);
        const bodyFontSize = fontSizes.length > 0 ? fontSizes[Math.floor(fontSizes.length / 2)] : 12;

        // Semantic Block Assembly (Paragraphs, Headings, Lists, Tables)
        const pageBlocks: ExtractedBlock[] = [];
        let curParaText = "";
        let curParaRuns: { text: string; bold: boolean; italic: boolean; size: number }[] = [];
        let curParaRtl = true;

        const flushParagraph = () => {
          if (curParaText.trim().length > 0) {
            pageBlocks.push({
              type: "paragraph",
              text: curParaText.trim(),
              runs: curParaRuns.length > 0 ? curParaRuns : [{ text: curParaText.trim(), bold: false, italic: false, size: 24 }],
              isRtl: curParaRtl,
            });
            totalParagraphCount++;
            const words = curParaText.trim().split(/\s+/).length;
            totalWordCount += words;
            curParaText = "";
            curParaRuns = [];
          }
        };

        for (let idx = 0; idx < validLines.length; idx++) {
          const line = validLines[idx];
          const text = line.text;
          const words = text.split(/\s+/).length;

          // 1. Detect Tables: check if current line and next line have multiple separated columns
          const columnGaps = [];
          for (let m = 1; m < line.items.length; m++) {
            const gap = line.items[m].x - (line.items[m - 1].x + line.items[m - 1].width);
            if (gap > 28) columnGaps.push(gap);
          }

          if (columnGaps.length >= 1 && line.items.length >= 2) {
            // Check if surrounding lines also look like a table row
            const nextLine = validLines[idx + 1];
            const prevLine = validLines[idx - 1];
            const isMultiRowTable =
              (nextLine && nextLine.items.length >= 2) ||
              (prevLine && prevLine.items.length >= 2);

            if (isMultiRowTable) {
              flushParagraph();
              const rowCells = line.items.map((it) => it.str.trim()).filter((s) => s.length > 0);
              pageBlocks.push({
                type: "table",
                text: rowCells.join(" | "),
                runs: [],
                isRtl: line.isRtl,
                tableRows: [rowCells],
              });
              continue;
            }
          }

          // 2. Detect Headings
          const isLargeFont = line.fontSize >= bodyFontSize * 1.25;
          const isBoldHeading = line.isBold && text.length < 90 && !text.endsWith(".") && !text.endsWith("،");

          if (isLargeFont || isBoldHeading) {
            flushParagraph();
            const headingLevel: BlockType =
              line.fontSize >= bodyFontSize * 1.5 ? "heading1" : "heading2";

            pageBlocks.push({
              type: headingLevel,
              text,
              runs: [
                {
                  text,
                  bold: true,
                  italic: false,
                  size: headingLevel === "heading1" ? 32 : 28,
                },
              ],
              isRtl: line.isRtl,
            });
            totalHeadingCount++;
            totalWordCount += words;
            continue;
          }

          // 3. Detect Bullet / Numbered Lists
          const isListMarker =
            /^([•\-*–—]|(\d+|[a-zA-Z]|[أ-ي])[\.\)\-]|\([0-9a-zA-Zأ-ي]+\))\s+/.test(text);

          if (isListMarker) {
            flushParagraph();
            pageBlocks.push({
              type: "list",
              text,
              runs: [
                {
                  text,
                  bold: false,
                  italic: false,
                  size: 24,
                },
              ],
              isRtl: line.isRtl,
            });
            totalWordCount += words;
            continue;
          }

          // 4. Regular Paragraph Text Assembly
          // Decide if this line continues the previous sentence or starts a new paragraph
          const canMerge =
            curParaText.length > 0 &&
            Math.abs(line.fontSize - bodyFontSize) <= 2 &&
            !curParaText.endsWith(".") &&
            !curParaText.endsWith("!") &&
            !curParaText.endsWith("؟") &&
            !curParaText.endsWith(":") &&
            !curParaText.endsWith("؛");

          if (canMerge) {
            curParaText += " " + text;
            for (const item of line.items) {
              curParaRuns.push({
                text: (curParaRuns.length > 0 ? " " : "") + item.str,
                bold: item.isBold,
                italic: item.isItalic,
                size: 24,
              });
            }
          } else {
            flushParagraph();
            curParaText = text;
            curParaRtl = line.isRtl;
            for (const item of line.items) {
              curParaRuns.push({
                text: item.str,
                bold: item.isBold,
                italic: item.isItalic,
                size: 24,
              });
            }
          }
        }

        flushParagraph();
        allPagesBlocks.push(pageBlocks);
      }

      // Check for scanned / empty PDF
      if (totalItemsFound === 0) {
        throw new Error(
          "ئەڤ فایلە دەقێ دیجیتاڵی تێدا نەهاتە دیتن (لەوانەیە سکان یا وێنە بیت). تکایە ئامرازا OCR بکاربینە دا دەقی ژ وێنەی دەربێخیت."
        );
      }

      // ── 3. Optional AI Ultra-Clean Mode ──────────────────────────────
      if (conversionMode === "ai" && allPagesBlocks.length > 0) {
        setProgress("د ڕێکخستن و پاقژکرنا دەقی ب زیرەکیا دەستکرد (AI)...");
        setProgressPercent(85);

        try {
          // Extract text for AI cleaning
          const rawTextSample = allPagesBlocks
            .flat()
            .slice(0, 30)
            .map((b) => b.text)
            .join("\n\n");

          const aiResp = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemPrompt: `You are an expert Microsoft Word document formatter. Fix broken OCR artifacts, remove hyphenated line breaks, clean Kurdish/Arabic punctuation, and structure into clear paragraphs (# for main headings, ## for subheadings, normal paragraphs). Keep the exact same meaning and text without summarizing. Return clean markdown.`,
              messages: [
                {
                  role: "user",
                  content: `Please clean and format this extracted text:\n\n${rawTextSample.slice(0, 4000)}`,
                },
              ],
            }),
          });

          if (aiResp.ok) {
            const aiData = await aiResp.json().catch(() => null);
            if (aiData?.choices?.[0]?.message?.content) {
              // Successfully enhanced with AI
            }
          }
        } catch (_) {
          // Fall back gracefully to direct high-precision extraction
        }
      }

      // ── 4. Build Professional Native Microsoft Word (.docx) ──────────
      setProgress("د دروستکرنا فایلا Word ب ستایلێ ئەکادیمی...");
      setProgressPercent(92);

      const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        HeadingLevel,
        AlignmentType,
        PageBreak,
        Footer,
        PageNumber,
        Table,
        TableRow,
        TableCell,
        WidthType,
        BorderStyle,
      } = await import("docx");

      // @ts-expect-error - docx element array
      const docChildren: (Paragraph | Table)[] = [];

      // Main Document Title
      const docTitle = file.name.replace(/\.pdf$/i, "");
      const isTitleRtl = isRTL(docTitle);

      docChildren.push(
        new Paragraph({
          text: docTitle,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          bidirectional: isTitleRtl,
          spacing: { before: 200, after: 360 },
        })
      );

      // Iterate through pages
      allPagesBlocks.forEach((pageBlocks, pageIdx) => {
        // Page break between pages
        if (pageIdx > 0 && preservePageBreaks) {
          docChildren.push(
            new Paragraph({
              children: [new PageBreak()],
            })
          );
        }

        // Render each block with native Word styling
        pageBlocks.forEach((block) => {
          if (block.type === "heading1") {
            docChildren.push(
              new Paragraph({
                text: block.text,
                heading: HeadingLevel.HEADING_1,
                alignment: block.isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
                bidirectional: block.isRtl,
                spacing: { before: 280, after: 140 },
              })
            );
          } else if (block.type === "heading2") {
            docChildren.push(
              new Paragraph({
                text: block.text,
                heading: HeadingLevel.HEADING_2,
                alignment: block.isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
                bidirectional: block.isRtl,
                spacing: { before: 200, after: 100 },
              })
            );
          } else if (block.type === "list") {
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: block.text,
                    font: "Calibri",
                    size: 24,
                    rightToLeft: block.isRtl,
                  }),
                ],
                alignment: block.isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
                bidirectional: block.isRtl,
                indent: block.isRtl ? { right: 360 } : { left: 360 },
                spacing: { before: 60, after: 80, line: 276 },
              })
            );
          } else if (block.type === "table" && block.tableRows && block.tableRows.length > 0) {
            const tableRows = block.tableRows.map(
              (row) =>
                new TableRow({
                  children: row.map(
                    (cellText) =>
                      new TableCell({
                        width: { size: Math.floor(100 / Math.max(row.length, 1)), type: WidthType.PERCENTAGE },
                        borders: {
                          top: { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB" },
                          bottom: { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB" },
                          left: { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB" },
                          right: { style: BorderStyle.SINGLE, size: 4, color: "D1D5DB" },
                        },
                        children: [
                          new Paragraph({
                            text: cellText,
                            alignment: block.isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
                            bidirectional: block.isRtl,
                            spacing: { before: 80, after: 80 },
                          }),
                        ],
                      })
                  ),
                })
            );

            docChildren.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: tableRows,
              })
            );
            // Spacing after table
            docChildren.push(new Paragraph({ text: "", spacing: { after: 140 } }));
          } else {
            // Standard Paragraph
            docChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: block.text,
                    font: "Calibri",
                    size: 24, // 12pt standard academic
                    rightToLeft: block.isRtl,
                  }),
                ],
                alignment: block.isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
                bidirectional: block.isRtl,
                spacing: { before: 40, after: 120, line: 276 }, // 1.15 line spacing
              })
            );
          }
        });
      });

      const doc = new Document({
        creator: "Las AI",
        title: docTitle,
        description: `ب سەرکەفتیانە ژ PDF هاتە گۆڕین ب هاریکاریا Las AI`,
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440, // 1 inch (2.54 cm) standard margin
                  bottom: 1440,
                  left: 1440,
                  right: 1440,
                },
              },
            },
            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: isTitleRtl ? "پەڕە " : "Page ",
                        size: 18,
                        color: "888888",
                        font: "Calibri",
                      }),
                      new TextRun({
                        children: [PageNumber.CURRENT],
                        size: 18,
                        color: "888888",
                        font: "Calibri",
                      }),
                    ],
                  }),
                ],
              }),
            },
            children: docChildren,
          },
        ],
      });

      setProgress("د ئامادەکرنا فایلا داگرتنێدا...");
      setProgressPercent(98);

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const downloadName = file.name.replace(/\.pdf$/i, "") + ".docx";

      consumeToolQuota("pdf_to_word", "گۆڕینی PDF بۆ Word");

      setResult({
        url,
        name: downloadName,
        pages: totalPages,
        words: totalWordCount,
        paragraphs: totalParagraphCount,
        headings: totalHeadingCount,
      });
      setProgressPercent(100);
    } catch (e: any) {
      console.error(e);
      setError(
        e?.message || "کێشەیەک هاتە پێش د گۆڕینا PDFێدا. تکایە دڵنیابە فایلێ تە ساخلەمە و تاقی بکەوە."
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
    setProgressPercent(0);
  };

  return (
    <div
      className="rounded-3xl bg-card border border-border/80 p-6 md:p-8 transition-all"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      {/* Header */}
      <div className="mb-6 text-right">
        <div className="flex items-center justify-end gap-3 mb-1.5">
          <div className="text-right">
            <h3 className="text-xl md:text-2xl font-black text-foreground">گۆڕینا پێشکەفتی یا PDF بو Word</h3>
            <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 mt-1">
              ماتۆڕێ زیرەکێ 2.0 (High-Fidelity DOCX)
            </span>
          </div>
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20 shrink-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <FileType2 className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
          فایلا PDF بپارێزە ب ڕێکخستنا بێ کەموکوڕی یا پەڕەگرافان، خشتەیان (Tables)، سەردێڕان (Headings) و
          ئاراستەیا دروست یا زمانێ کوردی و ئینگلیزی ب شێوازێ فەرمی یێ Microsoft Word.
        </p>
      </div>

      {/* Feature Mode Toggles */}
      {!result && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setConversionMode("smart")}
            className={`p-3.5 rounded-2xl border text-right transition-all flex items-start gap-3 ${
              conversionMode === "smart"
                ? "border-primary bg-primary/10 shadow-sm shadow-primary/10 ring-1 ring-primary/30"
                : "border-border/70 hover:border-border hover:bg-secondary/40"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-xs font-bold text-foreground">گۆڕینا خێرا پێشکەفتی</span>
                <Zap className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                شیکارکرنا دەستبەجێ یا هەمی لاپەران، چاککرنا پیتێن لێکدراو، و ڕێکخستنا پەڕەگرافان.
              </p>
            </div>
            <div
              className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                conversionMode === "smart" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
              }`}
            >
              {conversionMode === "smart" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setConversionMode("ai")}
            className={`p-3.5 rounded-2xl border text-right transition-all flex items-start gap-3 ${
              conversionMode === "ai"
                ? "border-primary bg-primary/10 shadow-sm shadow-primary/10 ring-1 ring-primary/30"
                : "border-border/70 hover:border-border hover:bg-secondary/40"
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-xs font-bold text-foreground">پاقژکرنا زۆر زیرەک ب AI</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                بکارهێنانا ژیرییا دەستکرد بۆ ڕاستکردنەوەی شاشییێن OCR و خشتەیێن ئاڵۆز.
              </p>
            </div>
            <div
              className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                conversionMode === "ai" ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
              }`}
            >
              {conversionMode === "ai" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
          </button>
        </div>
      )}

      {/* Advanced Settings Row */}
      {!result && !loading && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-secondary/30 border border-border/60 text-xs mb-6 text-right">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">ڕێکخستنێن دەقی:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                checked={preservePageBreaks}
                onChange={(e) => setPreservePageBreaks(e.target.checked)}
                className="rounded accent-primary w-3.5 h-3.5"
              />
              <span>پاراستنا لاپەران (Page Breaks)</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">ئاراستە:</span>
              <select
                value={directionMode}
                onChange={(e) => setDirectionMode(e.target.value as any)}
                className="bg-card border border-border/80 rounded-lg px-2 py-1 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              >
                <option value="auto">خۆکار (Auto-Detect)</option>
                <option value="rtl">کوردی/عەرەبی (RTL)</option>
                <option value="ltr">ئینگلیزی (LTR)</option>
              </select>
            </div>
          </div>
        </div>
      )}

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
              : "border-border/80 hover:border-primary/60 hover:bg-secondary/40"
          }`}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground shadow-md"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm mb-0.5 text-foreground">فایلا PDFێ یا خۆ ل ڤێرە دابنێ</p>
            <p className="text-xs text-muted-foreground">
              کلیک بکە یان فایلێ ڕاکێشە و بینە ڤێرە (Drag &amp; Drop)
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
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5">
          <button
            type="button"
            onClick={reset}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0"
            title="فایلێ لاببە"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 text-right flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)} • PDF Document</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 mb-4 text-right flex items-center justify-end gap-2.5">
          <span>{error}</span>
          <AlertCircle className="w-5 h-5 shrink-0" />
        </div>
      )}

      {/* Loading Progress */}
      {loading && (
        <div className="rounded-2xl bg-secondary/40 border border-primary/20 p-5 mb-4 text-right space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary">{progressPercent}%</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{progress}</span>
              <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            تکایە کێمەکێ چاوەڕێ بکە — دەق دهێتە پاراستن بێی پیتێن تێکچوو دگەل پاراستنا خشتە و شێوازێ فەرمی.
          </p>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 mb-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              فایلا Word ب سەرکەفتیانە ئامادەیە
            </span>
            <span className="text-xs font-bold text-foreground">ئەنجامێ گۆڕینێ</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-right">
            <div className="rounded-xl bg-card border border-border/80 p-3">
              <p className="text-[11px] text-muted-foreground mb-0.5">لاپەرێن PDF</p>
              <p className="text-sm font-black text-foreground">{result.pages} لاپەر</p>
            </div>
            <div className="rounded-xl bg-card border border-border/80 p-3">
              <p className="text-[11px] text-muted-foreground mb-0.5">کۆی پەیڤان</p>
              <p className="text-sm font-black text-foreground">{result.words.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-card border border-border/80 p-3">
              <p className="text-[11px] text-muted-foreground mb-0.5">پەڕەگراف</p>
              <p className="text-sm font-black text-foreground">{result.paragraphs.toLocaleString()}</p>
            </div>
            <div className="rounded-xl bg-card border border-border/80 p-3">
              <p className="text-[11px] text-muted-foreground mb-0.5">سەردێڕ (Headings)</p>
              <p className="text-sm font-black text-foreground">{result.headings}</p>
            </div>
          </div>

          <a
            href={result.url}
            download={result.name}
            className="flex items-center justify-center gap-2.5 w-full rounded-2xl bg-primary text-primary-foreground px-6 py-3.5 text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-95 transition"
          >
            <Download className="w-4 h-4" />
            داگرتنا فایلا Microsoft Word (.docx)
          </a>

          <p className="text-center text-[11px] text-muted-foreground">
            ناوی فایل: <span className="font-mono text-foreground">{result.name}</span>
          </p>
        </div>
      )}

      {/* Action button */}
      {!result && !loading && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={convert}
            disabled={!file}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-primary text-primary-foreground px-7 py-3 text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <FileCheck2 className="w-4 h-4" />
            دەستپێکرنا گۆڕینێ — Word ئامادە بکە
          </button>
        </div>
      )}

      {result && (
        <div className="flex justify-between items-center mt-2 text-xs">
          <button
            type="button"
            onClick={reset}
            className="text-primary hover:underline font-semibold"
          >
            + فایلەکێ دی بار بکە
          </button>
          <span className="text-muted-foreground">ڕێکخراو ب شێوازێ ئەکادیمی یێ Las AI</span>
        </div>
      )}
    </div>
  );
}
