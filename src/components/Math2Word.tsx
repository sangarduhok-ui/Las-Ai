import { useState, useRef } from "react";
import { Sparkles, Loader2, Upload, X, Download } from "lucide-react";
import { Document, Packer, Paragraph, TextRun } from "docx";

export function Math2Word() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (f: File) => new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(",")[1] || "");
    r.onerror = rej;
    r.readAsDataURL(f);
  });

  const run = async () => {
    if (!input.trim() && !file) return;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const payload: Record<string, unknown> = { tool: "math2word", input };
      if (file) {
        payload.fileBase64 = await fileToBase64(file);
        payload.mimeType = file.type || "application/octet-stream";
      }
      const r = await fetch("/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "هەڵە");
      setOutput((data.output || "").trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "هەڵە");
    } finally {
      setLoading(false);
    }
  };

  const downloadDocx = async () => {
    const lines = output.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const doc = new Document({
      sections: [
        {
          children: lines.map(
            (line) =>
              new Paragraph({
                children: [new TextRun({ text: line, font: "Cambria Math", size: 28 })],
                spacing: { after: 200 },
              }),
          ),
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "equations.docx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl bg-card border border-border p-6 md:p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
      <div className="mb-4 text-right">
        <h3 className="text-xl font-extrabold mb-1">هاوکێشە بۆ Microsoft Word</h3>
        <p className="text-sm text-muted-foreground">هاوکێشە بنووسە یان وێنە دابنێ، فایلێکی Word وەردەگریت کە تەنها هاوکێشەکانی تێدایە.</p>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="نمونە: integral of x squared from 0 to 1"
        className="w-full min-h-[120px] rounded-xl border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
      />

      <div className="mt-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
        />
        {!file ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            type="button"
            className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/60 p-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <Upload className="w-4 h-4" />
            وێنەی هاوکێشە دابنێ
          </button>
        ) : (
          <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
            <button onClick={() => setFile(null)} type="button" className="text-muted-foreground hover:text-destructive">
              <X className="w-4 h-4" />
            </button>
            <span className="truncate text-right">{file.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end mt-4 mb-4">
        <button
          onClick={run}
          disabled={loading || (!input.trim() && !file)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "پرۆسێسکردن..." : "بیگۆڕە"}
        </button>
      </div>

      {error && <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3 mb-3 text-right">{error}</div>}

      {output && (
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={downloadDocx}
              className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:opacity-90"
            >
              <Download className="w-4 h-4" />
              دانلودی Word
            </button>
            <span className="text-xs font-semibold text-muted-foreground">هاوکێشەکان</span>
          </div>
          <pre dir="ltr" className="whitespace-pre-wrap text-base leading-loose font-mono">{output}</pre>
        </div>
      )}
    </div>
  );
}
