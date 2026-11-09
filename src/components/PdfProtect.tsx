import { useState, useRef, DragEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { Upload, X, FileText, Lock, Eye, EyeOff, Download, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { PDFDocument } from "@cantoo/pdf-lib";

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PdfProtect() {
  const { isAuthenticated, openAuthModal, consumeToolQuota } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setError(null);
    setDone(false);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDropActive(true); };
  const onDragLeave = () => setDropActive(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropActive(false);
    pickFile(e.dataTransfer.files?.[0] || null);
  };

  const reset = () => {
    setFile(null);
    setPassword("");
    setConfirmPassword("");
    setError(null);
    setDone(false);
  };

  const protect = async () => {
    if (!file) return;
    if (!password) { setError("تکایە پاسۆردەکێ بنڤیسە."); return; }
    if (password !== confirmPassword) { setError("هەردوو پاسۆرد وەکو ئێك نینن. دوبارە بنڤیسە."); return; }
    if (password.length < 4) { setError("ئەو پاسۆردێ تە بکارئینای یێ کورت و نەگونجایە"); return; }
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    setLoading(true);
    setError(null);
    setDone(false);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Encrypt with user + owner password
      pdfDoc.encrypt({
        userPassword: password,
        ownerPassword: password + "_owner",
        permissions: {
          printing: "lowResolution",
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: true,
          documentAssembly: false,
        },
      });

      const protectedBytes = await pdfDoc.save();

      // Trigger download
      const blob = new Blob([protectedBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      const baseName = file.name.replace(/\.pdf$/i, "");
      a.download = `${baseName}_protected.pdf`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(url);
      }, 1500);

      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF پاراستن serkeft nebû. Dîsa biceribîne.");
    } finally {
      setLoading(false);
    }
  };

  const isReady = file && password && confirmPassword && !loading;

  return (
    <div className="rounded-2xl bg-card border border-border p-6 md:p-8" style={{ boxShadow: "var(--shadow-elegant)" }}>
      {/* Header */}
      <div className="mb-6 text-right">
        <div className="flex items-center justify-end gap-3 mb-1">
          <h3 className="text-xl font-extrabold">پاراستنا PDFێ ب پاسۆرد</h3>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground shrink-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Lock className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          فایلێ PDF هەلبژێرە و پاسۆردەکی بۆ دروست بکە
        </p>
      </div>

      {/* Upload zone */}
      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-10 px-4 mb-6 ${
            dropActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/60 hover:bg-secondary/40"
          }`}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm mb-0.5">فایلا PDF بار بکە</p>
            <p className="text-xs text-muted-foreground">کلیک بکە یان drag &amp; drop بکە</p>
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

      {/* Password fields */}
      {file && (
        <div className="space-y-4 mb-6">
          {/* Password */}
          <div className="text-right">
            <label className="block text-sm font-bold mb-1.5">پاسۆرد</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); setDone(false); }}
                placeholder="پاسۆردا نوێ بنڤیسە..."
                autoComplete="new-password"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-10 text-sm text-right focus:outline-none focus:border-primary transition"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                aria-label="پاسۆرد نیشان بدە"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="text-right">
            <label className="block text-sm font-bold mb-1.5">دوبارە پاسۆرد</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(null); setDone(false); }}
                placeholder="دوبارە پاسۆرد بنڤیسە..."
                autoComplete="new-password"
                className={`w-full rounded-xl border bg-background px-4 py-2.5 pr-10 text-sm text-right focus:outline-none focus:border-primary transition ${
                  confirmPassword && password !== confirmPassword ? "border-destructive" : "border-border"
                }`}
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                aria-label="پاسۆرد نیشان بدە"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive mt-1">هەردوو پاسۆرد وەکو ئێك نینن</p>
            )}
          </div>

          {/* Strength hint */}
          {password && (
            <div className="flex items-center justify-end gap-2">
              {[1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  className={`h-1.5 w-8 rounded-full transition-all ${
                    password.length >= lvl * 3
                      ? lvl <= 1 ? "bg-destructive" : lvl <= 2 ? "bg-amber-500" : lvl <= 3 ? "bg-yellow-400" : "bg-success"
                      : "bg-border"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground">
                {password.length < 4 ? "قەls" : password.length < 7 ? "مامناوەند" : password.length < 10 ? "باش" : "زۆر باش"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-3 mb-4 text-right">
          {error}
        </div>
      )}

      {/* Done message */}
      {done && (
        <div className="rounded-xl bg-success/10 text-success text-sm p-3 mb-4 text-right flex items-center gap-2 justify-end">
          <span>فایلا پاراستی ب پاسۆردی هاتە دروستکرن</span>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        </div>
      )}

      {/* Action */}
      {file && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={protect}
            disabled={!isReady || password !== confirmPassword}
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition"
            style={{ boxShadow: isReady ? "var(--shadow-glow)" : undefined }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : done ? (
              <Download className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {loading ? "د پڕۆسێسکرنێدا..." : done ? "دوبارە داگرتن" : "PDF بپارێزە"}
          </button>
        </div>
      )}


    </div>
  );
}
