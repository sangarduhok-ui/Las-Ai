import { useState, useRef, useCallback, DragEvent, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Upload,
  X,
  GripVertical,
  ChevronUp,
  ChevronDown,
  FilePlus2,
  Loader2,
  Download,
  FileText,
  Trash2,
  Plus,
  Sparkles,
  CheckCircle2,
  Eye,
  ExternalLink,
} from "lucide-react";

interface PdfFile {
  id: string;
  file: File;
  pageCount?: number;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PdfMerge() {
  const { isAuthenticated, openAuthModal, consumeToolQuota } = useAuth();
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const [previewModal, setPreviewModal] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);

  const previewPdf = (file: File) => {
    if (previewModal?.url) {
      URL.revokeObjectURL(previewModal.url);
    }
    const url = URL.createObjectURL(file);
    setPreviewModal({ url, name: file.name });
  };

  const closePreview = () => {
    if (previewModal?.url) {
      URL.revokeObjectURL(previewModal.url);
    }
    setPreviewModal(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && previewModal) {
        closePreview();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewModal]);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (!arr.length) {
      setError("تنێ فایلێن PDF لڤی بەشی دا دهێنە وەرگرتن.");
      return;
    }
    setError(null);
    setSuccess(false);
    const newEntries: PdfFile[] = arr.map((f) => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      file: f,
    }));
    setFiles((prev) => [...prev, ...newEntries]);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setSuccess(false);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    setFiles((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  // Drag-and-drop reorder handlers
  const onDragStart = (index: number) => {
    dragItem.current = index;
  };

  const onDragEnter = (id: string) => {
    setDragOverId(id);
  };

  const onDragEnd = () => {
    setDragOverId(null);
    dragItem.current = null;
  };

  const onDrop = (targetIndex: number) => {
    if (dragItem.current === null || dragItem.current === targetIndex) return;
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragItem.current!, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    dragItem.current = null;
    setDragOverId(null);
  };

  // Drop-zone handlers (for adding new files by drag)
  const onDropZoneDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropZoneActive(true);
  };

  const onDropZoneDragLeave = () => setDropZoneActive(false);

  const onDropZoneDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropZoneActive(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const merge = async () => {
    if (files.length < 2) {
      setError("کێمتر ژ 2 فایلێن PDF هەلبژێرە.");
      return;
    }
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Dynamically import pdf-lib so it's not in the main bundle
      const { PDFDocument } = await import("@cantoo/pdf-lib");

      const mergedPdf = await PDFDocument.create();

      for (const entry of files) {
        const arrayBuffer = await entry.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "merged_document.pdf";
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      }, 1500);

      setSuccess(true);
    } catch (e) {
      console.error(e);
      setError("کێشەیەک هاتە دی د دەمی یەکگرتنێدا. تکایە فایلێن دیکە تاقی بکە.");
    } finally {
      setLoading(false);
    }
  };

  const totalSize = files.reduce((s, f) => s + f.file.size, 0);

  return (
    <div
      className="rounded-2xl bg-card border border-border p-6 md:p-8"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      {/* Header */}
      <div className="mb-6 text-right">
        <div className="flex items-center justify-end gap-3 mb-1">
          <h3 className="text-xl font-extrabold">یەکگرتنا فایلێن PDF</h3>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground shrink-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <FilePlus2 className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          فایلێن PDF ی خۆ ئەپلۆد بکە و ڕێزبەندیا وان دروست بکە.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={onDropZoneDragOver}
        onDragLeave={onDropZoneDragLeave}
        onDrop={onDropZoneDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-8 px-4 mb-6 ${
          dropZoneActive
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
          <p className="font-bold text-sm mb-0.5">
            فایلان ئەپڵود بکە
          </p>
          <p className="text-xs text-muted-foreground">
            کلیک بکە یان drag &amp; drop بکە
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mb-6">
          {/* Stats bar */}
          <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => { setFiles([]); setSuccess(false); }}
              className="flex items-center gap-1 hover:text-destructive transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              ژێبرنا هەمی فایلان
            </button>
            <span className="font-semibold">
              {files.length} فایل &nbsp;·&nbsp; {formatBytes(totalSize)}
            </span>
          </div>

          {/* Draggable file rows */}
          <div className="space-y-2">
            {files.map((entry, index) => (
              <div
                key={entry.id}
                draggable
                onDragStart={() => onDragStart(index)}
                onDragEnter={() => onDragEnter(entry.id)}
                onDragEnd={onDragEnd}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(index)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 bg-background transition-all select-none ${
                  dragOverId === entry.id
                    ? "border-primary bg-primary/5 scale-[1.01] shadow-md"
                    : "border-border hover:border-primary/40"
                }`}
                style={{ boxShadow: dragOverId === entry.id ? "var(--shadow-glow)" : undefined }}
              >
                {/* Drag handle */}
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0" />

                {/* Order badge */}
                <span
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold text-primary-foreground shrink-0"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {index + 1}
                </span>

                {/* PDF icon */}
                <FileText className="w-4 h-4 text-primary shrink-0" />

                {/* File info */}
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-sm font-semibold truncate">{entry.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(entry.file.size)}</p>
                </div>

                {/* Preview button */}
                <button
                  type="button"
                  onClick={() => previewPdf(entry.file)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition shrink-0 cursor-pointer"
                  title="پێشبینینا فایلی (Preview)"
                  aria-label="پێشبینینا فایلی"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {/* Move buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-25 transition"
                    aria-label="بوژیربین"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === files.length - 1}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary disabled:opacity-25 transition"
                    aria-label="بخاربین"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeFile(entry.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0 cursor-pointer"
                  aria-label="ژێبرن"
                  title="ژێبرن"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add more inline button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border hover:border-primary/60 py-2.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <Plus className="w-4 h-4" />
            فایلێن دیکە زێدە بکە
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3 mb-4 text-right">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-xl bg-success/10 text-success text-sm p-3 mb-4 text-right flex items-center gap-2 justify-end">
          <span>فایلا یەکگرتی ب سەرکەفتی هاتە دانلۆدکرن!</span>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        </div>
      )}

      {/* Merge button */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground text-right">
          {files.length < 2
            ? "2 فایلان یان زێدەتر هەلبژێرە"
            : `${files.length} فایل ئامادەی یەکگرتنێ`}
        </p>
        <button
          type="button"
          onClick={merge}
          disabled={loading || files.length < 2}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition shrink-0"
          style={{ boxShadow: files.length >= 2 ? "var(--shadow-glow)" : undefined }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            <Download className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? "د یەکگرتنێدا..." : success ? "دانلۆدا دوبارە" : "یەک بکە و دانلۆد بکە"}
        </button>
      </div>

      {/* PDF Preview Modal */}
      {previewModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in-0 duration-200"
          onClick={closePreview}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
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
                  <p className="text-[11px] text-muted-foreground">پێشبینینا ناڤەرۆکا فایلی</p>
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
