import { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  Lock,
  Trash2,
  HardDrive,
  History,
  Laptop,
  Smartphone,
  Globe,
  AlertTriangle,
  Download,
  EyeOff,
  UserX,
  CheckCircle2,
  RefreshCw,
  Clock,
  FileText,
  KeyRound,
  FileBox,
  Radio,
  Sliders,
  LogOut,
  Sparkles,
} from "lucide-react";

interface UploadedFileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
}

interface AiHistoryItem {
  id: string;
  tool: string;
  query: string;
  timestamp: string;
}

interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  type: "desktop" | "mobile";
}

export function PrivacyCenter() {
  const [activeTab, setActiveTab] = useState<"overview" | "files" | "history" | "devices" | "settings">("overview");

  // Privacy Settings (stored in local state / localStorage)
  const [autoDeleteDays, setAutoDeleteDays] = useState<string>("7");
  const [noAiTraining, setNoAiTraining] = useState<boolean>(true);
  const [localProcessingOnly, setLocalProcessingOnly] = useState<boolean>(true);
  const [analyticsOptOut, setAnalyticsOptOut] = useState<boolean>(true);

  // Files State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([
    { id: "f1", name: "Lecture_Notes_AI.pdf", size: "4.2 MB", type: "PDF Document", uploadedAt: "ئەمڕۆ، 10:15" },
    { id: "f2", name: "Thesis_Draft_Chapter1.docx", size: "1.8 MB", type: "Word Document", uploadedAt: "دوێنێ، 16:40" },
    { id: "f3", name: "Handwriting_Math_Scan.png", size: "850 KB", type: "Image (OCR)", uploadedAt: "3 ڕۆژ لەمەوبەر" },
    { id: "f4", name: "Medical_Research_Dataset.csv", size: "320 KB", type: "CSV Dataset", uploadedAt: "5 ڕۆژ لەمەوبەر" },
  ]);

  // AI History State
  const [aiHistory, setAiHistory] = useState<AiHistoryItem[]>([
    { id: "h1", tool: "کورتکردن (Summary)", query: "کورتکردنەوەی بەشی سێیەمی مەلزەمەی زیندەزانی", timestamp: "ئەمڕۆ، 09:30" },
    { id: "h2", tool: "وەرگێڕێ ئەکادیمی", query: "وەرگێڕانی تێزی دەستنیشانکردنی نەخۆشی بە AI", timestamp: "دوێنێ، 14:20" },
    { id: "h3", tool: "شیکارکەرێ پرسیاران", query: "شیکارکردنی هاوکێشەی دیفرانسیاڵی پلە دوو", timestamp: "2 ڕۆژ لەمەوبەر" },
    { id: "h4", tool: "ڕاستنڤیسا زمانێ", query: "پێداچوونەوەی ڕێزمانی بۆ وتاری زانستی", timestamp: "4 ڕۆژ لەمەوبەر" },
  ]);

  // Active Sessions State
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: "s1",
      device: "Windows 11 PC",
      browser: "Chrome 128.0",
      os: "Windows",
      location: "هەولێر / دهۆک، کوردستان",
      ip: "185.193.***.***",
      lastActive: "ئێستا چالاکە",
      isCurrent: true,
      type: "desktop",
    },
    {
      id: "s2",
      device: "iPhone 15 Pro",
      browser: "Safari Mobile",
      os: "iOS 17.5",
      location: "سلێمانی، کوردستان",
      ip: "37.238.***.***",
      lastActive: "3 کاتژمێر لەمەوبەر",
      isCurrent: false,
      type: "mobile",
    },
  ]);

  const [confirmDeleteAllModal, setConfirmDeleteAllModal] = useState(false);
  const [confirmDeleteAccountModal, setConfirmDeleteAccountModal] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  // Delete Individual File
  const handleDeleteFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    showNotification("فایلەکە بە سەرکەوتوویی لە یادگەی کاتی سڕایەوە.");
  };

  // Delete All Files
  const handleDeleteAllFiles = () => {
    setUploadedFiles([]);
    showNotification("سەرجەم فایلە بارکراوەکان بە تەواوی سڕانەوە.");
  };

  // Delete Individual History
  const handleDeleteHistory = (id: string) => {
    setAiHistory((prev) => prev.filter((h) => h.id !== id));
    showNotification("تۆماری مێژووەکە سڕایەوە.");
  };

  // Clear All History
  const handleClearAllHistory = () => {
    setAiHistory([]);
    setUploadedFiles([]);
    setConfirmDeleteAllModal(false);
    showNotification("سەرجەم داتاکان، مێژوو و فایلە کاتییەکان بە تەواوی پاککرانەوە.");
  };

  // Revoke Session
  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showNotification("سێشن و ئامێرەکە دەرکرا و دەسەڵاتی هەڵوەشێنرایەوە.");
  };

  // Account Erasure (GDPR Zero-Trace Wipe)
  const handleDeleteAccount = () => {
    setUploadedFiles([]);
    setAiHistory([]);
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setConfirmDeleteAccountModal(false);
    showNotification("داواکاری سڕینەوەی تەواوی هەژمار و داتاکان بە سەرکەوتوویی جێبەجێ کرا (Zero-Trace Wipe).");
  };

  // Export Data Archive
  const handleDownloadDataArchive = () => {
    const archive = {
      accountStatus: "Verified Secure",
      exportedAt: new Date().toISOString(),
      privacySettings: {
        autoDeleteDays,
        noAiTraining,
        localProcessingOnly,
        analyticsOptOut,
      },
      uploadedFiles,
      aiHistory,
      activeSessions: sessions,
    };
    const blob = new Blob([JSON.stringify(archive, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `privacy_data_archive_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("فایلی ئەرشیفی تەواوی داتاکانت داگیرا.");
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Main Privacy Banner & Trust Badges */}
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> سەنتەری پاراستنی تایبەتمەندی و داتا
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground">
              Privacy Center & Trust Dashboard
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadDataArchive}
              className="py-2.5 px-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              داگرتنی داتای من (JSON Archive)
            </button>
            <button
              onClick={() => setConfirmDeleteAllModal(true)}
              className="py-2.5 px-4 rounded-xl bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 text-destructive text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              سڕینەوەی گشت مێژوو
            </button>
          </div>
        </div>

        {/* 4 Trust & Security Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
              <Lock className="w-4 h-4" />
              <span>ئینکریپشنی 256-بیت (SSL/TLS)</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              سەرجەم پەیوەندی و فایلەکان بە پارێزراوی تەواو لەنێوان مۆبایل/کۆمپیوتەرەکەت و سێرڤەر دەگوازرێنەوە.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 space-y-1">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-extrabold text-xs">
              <EyeOff className="w-4 h-4" />
              <span>داتاکانت بۆ AI بەکارنایەت</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              نڤیسین و پەڕاوەکانت ناخرێنە ناو ڕاهێنانی هیچ مۆدێلێکی گشتی (Zero Data Training Policy).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/25 space-y-1">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-extrabold text-xs">
              <Clock className="w-4 h-4" />
              <span>سڕینەوەی خۆکاری فایلەکان</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              فایلە کاتییەکان دوای کۆتایی هاتنی پرۆسێس بە خۆکارانە پاک دەکرێنەوە.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-xs">
              <Shield className="w-4 h-4" />
              <span>کۆنتڕۆڵی تەواوی بەکارهێنەر</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              دەسەڵاتی سڕینەوەی ڕاستەوخۆی مێژوو، سێشن و هەژمار بە یەک کلیک لەژێر دەستی خۆتە.
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-secondary/80 border border-border no-scrollbar">
        {[
          { id: "overview", label: "باری پارێزراوی (Overview)", icon: ShieldCheck },
          { id: "files", label: `فایلە بارکراوەکان (${uploadedFiles.length})`, icon: HardDrive },
          { id: "history", label: `مێژووی AI (${aiHistory.length})`, icon: History },
          { id: "devices", label: `ئامێرە چالاکەکان (${sessions.length})`, icon: Laptop },
          { id: "settings", label: "ڕێکخستنی تایبەتمەندی (Settings)", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`shrink-0 py-2.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm font-extrabold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start animate-in fade-in-0 duration-200">
          {/* Privacy Health Check Card */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> ئاستی پاراستنی تایبەتمەندی
              </h3>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                100٪ پارێزراوە
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between">
                <span className="font-bold text-foreground">پاراستنی ناونیشانی IP و شوێن:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">ئەنۆنیمس (Anonymous)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between">
                <span className="font-bold text-foreground">ڕاهێنانی مۆدێلەکانی AI لەسەر داتات:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">ناچالاککراوە (Disabled)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between">
                <span className="font-bold text-foreground">ماوەی پاککردنەوەی خۆکاری کاش:</span>
                <span className="font-mono font-bold text-primary">{autoDeleteDays} ڕۆژ</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" /> کردارە خێراکان
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={handleDownloadDataArchive}
                className="w-full p-3.5 rounded-2xl bg-secondary/40 hover:bg-secondary/70 border border-border text-right text-xs font-bold flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-primary" />
                  <span>داگرتنی کۆپییەکی تەواوی داتا و مێژووەکانت (JSON)</span>
                </div>
                <span className="text-[11px] text-muted-foreground">Export</span>
              </button>

              <button
                onClick={() => setConfirmDeleteAllModal(true)}
                className="w-full p-3.5 rounded-2xl bg-destructive/5 hover:bg-destructive/15 border border-destructive/20 text-right text-xs font-bold text-destructive flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4" />
                  <span>سڕینەوەی خێرای تەواوی فایلەکان و گفتوگۆکانی AI</span>
                </div>
                <span className="text-[11px]">Clear All</span>
              </button>

              <button
                onClick={() => setConfirmDeleteAccountModal(true)}
                className="w-full p-3.5 rounded-2xl bg-secondary/20 hover:bg-destructive/10 border border-border hover:border-destructive/30 text-right text-xs font-bold text-muted-foreground hover:text-destructive flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <UserX className="w-4 h-4" />
                  <span>سڕینەوەی یەکجارەکی هەژمار (Delete Account)</span>
                </div>
                <span className="text-[11px]">GDPR Wipe</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOADED FILES */}
      {activeTab === "files" && (
        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-4 animate-in fade-in-0 duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-foreground">فایلە بارکراوەکانی تۆ (Uploaded Temporary Files)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">ئەم فایلانە لە یادگەی کاتیدان بۆ پرۆسێسکردن و دەتوانی لە هەر ساتێکدا بسڕیتەوە.</p>
            </div>
            {uploadedFiles.length > 0 && (
              <button
                onClick={handleDeleteAllFiles}
                className="py-1.5 px-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                سڕینەوەی هەموو فایلەکان
              </button>
            )}
          </div>

          {uploadedFiles.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs bg-secondary/20 rounded-2xl border border-border">
              هیچ فایلێکی بارکراو لە یادگەدا نەماوە (سەرجەمیان سڕاونەتەوە).
            </div>
          ) : (
            <div className="space-y-2">
              {uploadedFiles.map((f) => (
                <div
                  key={f.id}
                  className="p-3.5 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between gap-3 group hover:border-primary/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <FileBox className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 text-right">
                      <span className="font-bold text-xs text-foreground block truncate">{f.name}</span>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mt-0.5">
                        <span>{f.size}</span>
                        <span>•</span>
                        <span>{f.type}</span>
                        <span>•</span>
                        <span>{f.uploadedAt}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteFile(f.id)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer shrink-0"
                    title="سڕینەوەی فایل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI HISTORY */}
      {activeTab === "history" && (
        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-4 animate-in fade-in-0 duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-foreground">مێژووی گفتوگۆ و ئامرازەکان (AI History)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">تۆماری پرسیار، کورتکردنەوە و شیکارییەکانی پێشووت.</p>
            </div>
            {aiHistory.length > 0 && (
              <button
                onClick={() => setAiHistory([])}
                className="py-1.5 px-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                سڕینەوەی تەواوی مێژوو
              </button>
            )}
          </div>

          {aiHistory.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs bg-secondary/20 rounded-2xl border border-border">
              تەواوی مێژووی AI سڕاوەتەوە و هیچ داتایەک نەماوەتەوە.
            </div>
          ) : (
            <div className="space-y-2">
              {aiHistory.map((h) => (
                <div
                  key={h.id}
                  className="p-3.5 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between gap-3 group hover:border-primary/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <History className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-primary">{h.tool}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{h.timestamp}</span>
                      </div>
                      <p className="text-xs text-foreground mt-0.5 truncate">{h.query}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteHistory(h.id)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer shrink-0"
                    title="سڕینەوەی ئەم تۆمارە"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ACTIVE DEVICES & SESSIONS */}
      {activeTab === "devices" && (
        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-4 animate-in fade-in-0 duration-200">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">ئامێر و سێشنە چالاکەکان (Login Sessions & Active Devices)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">ئەو ئامێرانەی لەم کاتەدا پەیوەستن بە هەژمارەکەتەوە.</p>
          </div>

          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                  s.isCurrent ? "bg-primary/5 border-primary/30 ring-1 ring-primary/20" : "bg-secondary/30 border-border"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0">
                    {s.type === "desktop" ? <Laptop className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-foreground">{s.device}</span>
                      {s.isCurrent && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          ئەم ئامێرە (Current)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono mt-0.5">
                      <span>{s.browser}</span>
                      <span>•</span>
                      <span>{s.location}</span>
                      <span>•</span>
                      <span>{s.lastActive}</span>
                    </div>
                  </div>
                </div>

                {!s.isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(s.id)}
                    className="py-1.5 px-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    دەرچوون لەم ئامێرە
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PRIVACY SETTINGS & POLICIES */}
      {activeTab === "settings" && (
        <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm space-y-6 animate-in fade-in-0 duration-200">
          <div>
            <h3 className="text-sm font-extrabold text-foreground">ڕێکخستنەکانی پاراستن و سڕینەوە (Privacy Policy Controls)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">هەڵبژاردنی سیاسەت و شێوازی پاراستنی داتاکانت.</p>
          </div>

          <div className="space-y-4">
            {/* Auto Delete Setting */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-foreground block">سڕینەوەی خۆکاری مێژوو و فایلەکان:</span>
                <span className="text-[11px] text-muted-foreground">دیاریکردنی ماوەی پاککردنەوەی خۆکاری داتاکان دوای بەسەرچوونی کات.</span>
              </div>
              <select
                value={autoDeleteDays}
                onChange={(e) => {
                  setAutoDeleteDays(e.target.value);
                  showNotification("سیاسەتی سڕینەوەی خۆکار نوێکرایەوە.");
                }}
                className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-bold font-mono"
              >
                <option value="1">1 ڕۆژ (خێرا)</option>
                <option value="7">7 ڕۆژ (پێشنیارکراو)</option>
                <option value="30">30 ڕۆژ</option>
                <option value="never">سڕینەوەی دەستی (Never)</option>
              </select>
            </div>

            {/* AI Training Opt-out */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-foreground block">قەدەغەکردنی ڕاهێنانی مۆدێلەکان (AI Training Opt-Out):</span>
                <span className="text-[11px] text-muted-foreground">دڵنیایی لەوەی زانیاری و پرسیارەکانت بۆ ڕاهێنانی مۆدێل بەکارناهێنرێن.</span>
              </div>
              <input
                type="checkbox"
                checked={noAiTraining}
                onChange={(e) => {
                  setNoAiTraining(e.target.checked);
                  showNotification("سیاسەتی AI Training نوێکرایەوە.");
                }}
                className="w-4 h-4 rounded text-primary cursor-pointer"
              />
            </div>

            {/* Local Processing Guarantee */}
            <div className="p-4 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-foreground block">شیکاری لۆکاڵی لە ناو براوسەر (In-Browser Processing):</span>
                <span className="text-[11px] text-muted-foreground">پرۆسێسکردنی فایل و هاش و بارکۆدەکان لەسەر ئامێرەکەت بێ ناردنی بۆ دەرەوە.</span>
              </div>
              <input
                type="checkbox"
                checked={localProcessingOnly}
                onChange={(e) => {
                  setLocalProcessingOnly(e.target.checked);
                  showNotification("شیکاری ناوخۆیی نوێکرایەوە.");
                }}
                className="w-4 h-4 rounded text-primary cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Delete All History */}
      {confirmDeleteAllModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-4 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-foreground">دڵنیایت لە سڕینەوەی گشت مێژوو؟</h3>
              <p className="text-xs text-muted-foreground">
                سەرجەم پرسیارەکانی پێشوو، فایلە بارکراوەکان و کاشی کاتی بە تەواوی دەسڕێنەوە و ناگەڕێندرێنەوە.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteAllModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-bold hover:bg-secondary/80 transition cursor-pointer"
              >
                پاشگەزبوونەوە
              </button>
              <button
                onClick={handleClearAllHistory}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:opacity-90 transition cursor-pointer"
              >
                بەڵێ، هەمووی بسڕەوە
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirm Delete Account (GDPR) */}
      {confirmDeleteAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-card border border-destructive/40 shadow-2xl space-y-4 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center mx-auto">
              <UserX className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-destructive">سڕینەوەی تەواوەتی هەژمار (Zero-Trace Wipe)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                بە جێبەجێکردنی ئەم بژاردەیە، تەواوی داتاکانت بەپێی ستانداردەکانی GDPR و مافی لەبیرکردن (Right to be Forgotten) لە سەرجەم سیستمەکان بە یەکجاری دەسڕێنەوە.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteAccountModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground text-xs font-bold hover:bg-secondary/80 transition cursor-pointer"
              >
                پاشگەزبوونەوە
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:opacity-90 transition cursor-pointer"
              >
                سڕینەوەی یەکجارەکی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
