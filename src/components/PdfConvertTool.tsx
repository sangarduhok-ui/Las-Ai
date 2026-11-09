import { useState, useRef, DragEvent } from "react";
import { Upload, X, FileText, ExternalLink, ArrowRight } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface ConvertService {
  name: string;
  url: string;
  color: string;
  badge: string;
}

interface Props {
  icon: React.ElementType;
  title: string;
  description: string;
  fileAccept?: string;
  services: ConvertService[];
}

export function PdfConvertTool({ icon: Icon, title, description, fileAccept = "application/pdf,.pdf", services }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | null) => {
    if (!f) return;
    setFile(f); setError(null);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(true); };
  const onDragLeave = () => setDropActive(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(false); pickFile(e.dataTransfer.files?.[0] || null); };

  const reset = () => { setFile(null); setError(null); };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 md:p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
      {/* Header */}
      <div className="mb-6 text-right">
        <div className="flex items-center justify-end gap-3 mb-1">
          <h3 className="text-xl font-extrabold">{title}</h3>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground shrink-0" style={{ background: "var(--gradient-primary)" }}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Upload zone */}
      {!file ? (
        <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}
          className={`relative w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-10 px-4 mb-6 ${dropActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/60 hover:bg-secondary/40"}`}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm mb-0.5">فایلا خۆ بار بکە</p>
            <p className="text-xs text-muted-foreground">کلیک بکە یان drag &amp; drop بکە</p>
          </div>
          <input ref={fileInputRef} type="file" accept={fileAccept} onChange={(e) => pickFile(e.target.files?.[0] || null)} className="hidden" />
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
          <FileText className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0 text-right">
            <p className="text-sm font-semibold truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          <button type="button" onClick={reset} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3 mb-4 text-right">{error}</div>}

      {/* Services */}
      <div>
        <p className="text-xs font-bold text-muted-foreground text-right mb-3">
          {file ? "ئامرازێکی ژ ژێرین هەلبژێرە — فایلا خۆ ل ئەوێ بار بکە" : "ژ ئامرازێن ئازادێن ژێرین هەلبژێرە"}
        </p>
        <div className="space-y-2">
          {services.map((svc, i) => (
            <a
              key={i}
              href={svc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 hover:border-primary/50 hover:bg-primary/5 transition group"
            >
              {/* Colored badge */}
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold text-white shrink-0 ${svc.color}`}>
                {svc.badge}
              </span>
              <div className="flex-1 text-right min-w-0">
                <p className="text-sm font-bold truncate">{svc.name}</p>
                <p className="text-xs text-muted-foreground">ئازاد · ئۆنلاین · بێ نصبکرن</p>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition shrink-0">
                <span className="text-xs font-semibold">بچۆ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </a>
          ))}
        </div>

        {/* Info note */}
        <div className="mt-4 rounded-xl bg-secondary/40 border border-border px-4 py-3 flex items-start gap-2 text-right">
          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            ئەم جورە گۆڕیnanê (PDF ↔ Word / PPT / Excel) پتر ژ توانا براوزەرێ دخوازن. ئامرازێن سەرووکی ئازاد، ئەمنی، و بدون نصبکرنێ نin.
          </p>
        </div>
      </div>
    </div>
  );
}
