import { useState, useRef, DragEvent } from "react";
import {
  Upload,
  X,
  Loader2,
  Sparkles,
  FileText,
  CheckCircle2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Props {
  icon: React.ElementType;
  title: string;
  description: string;
  buttonLabel: string;
  fileAccept?: string;
  tool: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const fileToBase64 = (f: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      res(s.split(",")[1] || "");
    };
    r.onerror = rej;
    r.readAsDataURL(f);
  });

export function PdfTool({
  icon: Icon,
  title,
  description,
  buttonLabel,
  fileAccept = "application/pdf,.pdf",
  tool,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [output, setOutput] = useState<string>("");
  const [dropActive, setDropActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = (incoming: File | null) => {
    if (!incoming) return;
    setFile(incoming);
    setError(null);
    setOutput("");
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropActive(true);
  };
  const onDragLeave = () => setDropActive(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropActive(false);
    const f = e.dataTransfer.files?.[0] || null;
    pickFile(f);
  };

  const run = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const fileBase64 = await fileToBase64(file);
      const r = await fetch("/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool,
          input: `${title}: ${file.name}`,
          fileBase64,
          mimeType: file.type || "application/pdf",
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "چەوتی");
      setOutput((data.output || "").replace(/\*\*/g, ""));
    } catch (e) {
      setError(e instanceof Error ? e.message : "کێشەیەک هاتە دی.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl bg-card border border-border p-6 md:p-8"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      {/* Header */}
      <div className="mb-6 text-right">
        <div className="flex items-center justify-end gap-3 mb-1">
          <h3 className="text-xl font-extrabold">{title}</h3>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground shrink-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Drop / Upload zone */}
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
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm mb-0.5">فایلا خۆ بار بکە</p>
            <p className="text-xs text-muted-foreground">
              کلیک بکە یان drag &amp; drop بکە
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={fileAccept}
            onChange={(e) => pickFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>
      ) : (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
          <FileText className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0 text-right">
            <p className="text-sm font-semibold truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => { setFile(null); setOutput(""); setError(null); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0"
            aria-label="سڕین"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3 mb-4 text-right">
          {error}
        </div>
      )}

      {/* Action button */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={run}
          disabled={loading || !file}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition"
          style={{ boxShadow: file ? "var(--shadow-glow)" : undefined }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : output ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {loading ? "د پڕۆسێسکرنێدا..." : buttonLabel}
        </button>
      </div>

      {/* Output */}
      {output && (
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="text-xs font-semibold text-muted-foreground text-right mb-3">ئەنجام</p>
          <div className="text-sm leading-relaxed text-right [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pr-5 [&>ul]:my-2 [&>ol]:list-decimal [&>ol]:pr-5 [&>ol]:my-2">
            <ReactMarkdown>{output}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
