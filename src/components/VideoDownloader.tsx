import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Download,
  Link as LinkIcon,
  Video,
  Music,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Copy,
  Sparkles,
  Film,
  Check,
} from "lucide-react";

interface VideoFormat {
  quality: string;
  label: string;
  url: string;
  ext: "mp4" | "mp3";
  size?: string;
  isDirectDownload?: boolean;
  needsPrepare?: boolean;
  formatCode?: string;
}

interface VideoResult {
  platform: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  author?: string;
  formats: VideoFormat[];
  originalUrl: string;
  timestamp: number;
}

const PLATFORMS = [
  { name: "TikTok", badge: "bg-pink-500/15 text-pink-400 border-pink-500/30" },
  { name: "YouTube", badge: "bg-red-500/15 text-red-400 border-red-500/30" },
  { name: "Instagram", badge: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  { name: "Facebook", badge: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { name: "Twitter/X", badge: "bg-slate-500/15 text-slate-300 border-slate-500/30" },
  { name: "Pinterest", badge: "bg-red-600/15 text-red-400 border-red-600/30" },
];

export function VideoDownloader() {
  const { isAuthenticated, openAuthModal, consumeToolQuota } = useAuth();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadingIdx, setDownloadingIdx] = useState<number | null>(null);
  const [downloadSuccessIdx, setDownloadSuccessIdx] = useState<number | null>(null);
  const [downloadStepText, setDownloadStepText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<VideoResult | null>(null);
  const [savedVideos, setSavedVideos] = useState<VideoResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"downloader" | "history">("downloader");
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved videos from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("saved_downloaded_videos");
      if (stored) {
        setSavedVideos(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading saved videos:", e);
    }
  }, []);

  // Save to localStorage when history changes
  const saveToHistory = (result: VideoResult) => {
    setSavedVideos((prev) => {
      const filtered = prev.filter((item) => item.originalUrl !== result.originalUrl);
      const updated = [result, ...filtered].slice(0, 30);
      try {
        localStorage.setItem("saved_downloaded_videos", JSON.stringify(updated));
      } catch (e) {
        console.error("Error persisting videos:", e);
      }
      return updated;
    });
  };

  const deleteFromHistory = (index: number) => {
    setSavedVideos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      try {
        localStorage.setItem("saved_downloaded_videos", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearAllHistory = () => {
    if (window.confirm("ما تو پشتڕاستی کو تە دڤێت هەمی مێژوویا ڤیدیۆیێن خەزنکری ژێببەی؟")) {
      setSavedVideos([]);
      localStorage.removeItem("saved_downloaded_videos");
    }
  };

  const handleFetchVideo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetUrl = url.trim();
    if (!targetUrl) {
      setError("تکایە سەرەتا لینکێ ڤیدیۆیێ دابنێ.");
      return;
    }
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentResult(null);

    try {
      const res = await fetch("/api/video-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "info", url: targetUrl }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "نەهاتە دیتن یان داگرتن ژ ڤی لینکی.");
      }

      const resultObj: VideoResult = {
        platform: data.platform || "Video",
        title: data.title || "ڤیدیۆیا داگرتی",
        thumbnail: data.thumbnail,
        duration: data.duration,
        author: data.author,
        formats: data.formats || [],
        originalUrl: targetUrl,
        timestamp: Date.now(),
      };

      setCurrentResult(resultObj);
      saveToHistory(resultObj);
    } catch (err: any) {
      setError(err.message || "کێشەیەک چێبوو د وەرگرتنا زانیاریێن ڤیدیۆیێدا.");
    } finally {
      setLoading(false);
    }
  };

  // Direct in-page background download with progress
  const handleDownloadFile = async (fmt: VideoFormat, videoTitle: string, index: number) => {
    if (downloadingIdx !== null) return;
    setDownloadingIdx(index);
    setError(null);

    try {
      let directUrl = fmt.url;

      // If YouTube or needs server preparation
      if (fmt.needsPrepare || !directUrl) {
        setDownloadStepText("د ئامادەکرنا فایلی دا...");
        const prepResp = await fetch("/api/video-download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "prepare",
            url: currentResult?.originalUrl || url,
            formatCode: fmt.formatCode || "720",
          }),
        });

        const prepData = await prepResp.json();
        if (!prepResp.ok || !prepData.success || !prepData.downloadUrl) {
          throw new Error(prepData.error || "نەهاتە ئامادەکرن بۆ داگرتنێ.");
        }
        directUrl = prepData.downloadUrl;
      }

      setDownloadStepText("داگرتن دەستپێکر...");

      const safeTitle = (videoTitle || "video")
        .replace(/[/\\?%*:|"<>]/g, "_")
        .trim()
        .slice(0, 80);
      const filename = `${safeTitle}.${fmt.ext}`;

      const downloadTarget = directUrl.includes("savenow.to") || directUrl.includes("tikwm.com")
        ? directUrl
        : `/api/video-download?url=${encodeURIComponent(directUrl)}&filename=${encodeURIComponent(filename)}`;

      // Trigger direct single browser download
      const a = document.createElement("a");
      a.href = downloadTarget;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        setDownloadingIdx(null);
        setDownloadStepText("");
        setDownloadSuccessIdx(index);
        setTimeout(() => setDownloadSuccessIdx(null), 3500);
      }, 1500);

      // Save to history
      if (currentResult) {
        saveToHistory(currentResult);
      }
    } catch (err: any) {
      console.error("Direct download failed:", err);
      setDownloadingIdx(null);
      setDownloadStepText("");
      setError(err.message || "کێشەیەک چێبوو د داگرتنا ڕاستەوخۆ دا.");
    }
  };

  const detectInputPlatform = (inputUrl: string) => {
    const u = inputUrl.toLowerCase();
    if (u.includes("tiktok.com")) return "TikTok";
    if (u.includes("youtube.com") || u.includes("youtu.be")) return "YouTube";
    if (u.includes("instagram.com")) return "Instagram";
    if (u.includes("facebook.com") || u.includes("fb.watch")) return "Facebook";
    if (u.includes("twitter.com") || u.includes("x.com")) return "Twitter/X";
    if (u.includes("pinterest.com") || u.includes("pin.it")) return "Pinterest";
    return null;
  };

  const currentDetectedPlatform = detectInputPlatform(url);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-card border border-border p-5 md:p-8 shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1 text-xs font-bold text-primary mb-3">
          <Film className="w-4 h-4" />
          <span>داگرتنا ڤیدیۆیان ژ هەمی پلاتفۆرمان</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">
          داگرتن و خەزنکرنا ڤیدیۆیان
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          لینکێ ڤیدیۆیێ دابنێ و ب کوالێتیا بەرز ڕاستەوخۆ ل ڤێرێ داگرە
        </p>

        {/* Platform Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          {PLATFORMS.map((p) => (
            <span
              key={p.name}
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${p.badge} transition-transform hover:scale-105`}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-3 mb-8 border-b border-border pb-4">
        <button
          onClick={() => setActiveTab("downloader")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            activeTab === "downloader"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <Download className="w-4 h-4" />
          داگرتنا نوو
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
            activeTab === "history"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <Film className="w-4 h-4" />
          ڤیدیۆیێن خەزنکری ({savedVideos.length})
        </button>
      </div>

      {activeTab === "downloader" && (
        <>
          {/* URL Input Bar */}
          <form onSubmit={handleFetchVideo} className="mb-8 space-y-4">
            <div className="relative">
              <LinkIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                placeholder="لینکێ ڤیدیۆیێ ل ڤێرێ دابنێ (نموونە: YouTube, TikTok, Facebook, Instagram...)"
                className="w-full h-14 pr-12 pl-12 rounded-2xl bg-secondary/50 border border-border shadow-inner text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition"
                dir="ltr"
                required
              />

              {url && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center">
                  <button
                    type="button"
                    onClick={() => setUrl("")}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                    title="پاککردنەوە"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {currentDetectedPlatform && (
              <div className="flex items-center gap-2 text-xs text-primary font-bold text-right justify-end">
                <span>پلاتفۆڕما هاتیە دەستنیشانکرن:</span>
                <span className="bg-primary/15 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                  {currentDetectedPlatform}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full h-13 rounded-2xl bg-primary text-primary-foreground font-extrabold text-base flex items-center justify-center gap-2.5 shadow-lg hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: "var(--gradient-primary)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>د دەرهێنان و ئامادەکرنا ڤیدیۆیێدا...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>داگرتن و خەزنکرنا ڤیدیۆیێ</span>
                </>
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3 text-sm font-semibold text-right">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Result Card */}
          {currentResult && (
            <div className="rounded-3xl bg-secondary/30 border border-border p-6 animate-in fade-in-50 duration-300">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Thumbnail / Player */}
                <div className="w-full md:w-64 shrink-0 rounded-2xl overflow-hidden bg-black/40 border border-border aspect-video md:aspect-[4/3] relative flex items-center justify-center">
                  {currentResult.thumbnail ? (
                    <img
                      src={currentResult.thumbnail}
                      alt={currentResult.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                      <Video className="w-10 h-10" />
                      <span className="text-xs font-semibold">{currentResult.platform}</span>
                    </div>
                  )}

                  {currentResult.duration && (
                    <span className="absolute bottom-2 left-2 bg-black/80 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {currentResult.duration}
                    </span>
                  )}

                  <span className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-[11px] font-extrabold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                    {currentResult.platform}
                  </span>
                </div>

                {/* Info & Download Options */}
                <div className="flex-1 w-full text-right">
                  <h3 className="text-lg font-bold text-foreground mb-1 leading-snug line-clamp-2">
                    {currentResult.title}
                  </h3>
                  {currentResult.author && (
                    <p className="text-xs text-muted-foreground font-semibold mb-4">
                      دانەر / خودان: {currentResult.author}
                    </p>
                  )}

                  <div className="space-y-2.5 mt-4">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      کوالێتی و بژاردەیێن داگرتنێ (خەزنکرنا ڕاستەوخۆ):
                    </h4>

                    {currentResult.formats.map((fmt, idx) => {
                      const isDownloading = downloadingIdx === idx;
                      const isSuccess = downloadSuccessIdx === idx;

                      return (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-border shadow-xs hover:border-primary/40 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                fmt.ext === "mp3"
                                  ? "bg-amber-500/15 text-amber-500"
                                  : "bg-primary/15 text-primary"
                              }`}
                            >
                              {fmt.ext === "mp3" ? (
                                <Music className="w-5 h-5" />
                              ) : (
                                <Video className="w-5 h-5" />
                              )}
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-sm block text-foreground">
                                {fmt.label}
                              </span>
                              <span className="text-xs text-muted-foreground font-medium">
                                {fmt.quality} {fmt.size ? `• ${fmt.size}` : ""}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDownloadFile(fmt, currentResult.title, idx)}
                            disabled={isDownloading}
                            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition shadow-sm cursor-pointer disabled:opacity-75 ${
                              isSuccess
                                ? "bg-emerald-600 text-white"
                                : fmt.ext === "mp3"
                                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                                  : "bg-primary hover:bg-primary/90 text-primary-foreground"
                            }`}
                          >
                            {isDownloading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>{downloadStepText || "داگرتن دەستپێکر..."}</span>
                              </>
                            ) : isSuccess ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>هاتە خەزنکرن ✓</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                <span>داگرتن ({fmt.ext.toUpperCase()})</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Guide */}
          <div className="mt-10 p-5 rounded-2xl bg-secondary/20 border border-border text-right text-xs leading-relaxed text-muted-foreground space-y-2">
            <h4 className="font-bold text-foreground text-sm mb-1 flex items-center gap-2 justify-end">
              <span>چەوا لینکێ ڤیدیۆیێ بینم؟</span>
              <Sparkles className="w-4 h-4 text-primary" />
            </h4>
            <p>1. ل ناڤ ئەپێ تیکتۆک، یوتوب یان فەیسبووک، کلیک ل سەر دوگمەیا <b>Share (شەیر)</b> بکە.</p>
            <p>2. هەلبژارتنا <b>Copy Link (کۆپیکرنا لینکێ)</b> بکە.</p>
            <p>3. وەرە لینکێ ل ڤێرێ دابنێ و دوگمەیا داگرتنێ لێبدە دا ڕاستەوخۆ د ئامیرێ تەدا بهێتە خەزنکرن.</p>
          </div>
        </>
      )}

      {/* Saved Videos History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <span className="text-xs font-bold text-muted-foreground">
              هەمی ڤیدیۆیێن خەزنکری: {savedVideos.length}
            </span>
            {savedVideos.length > 0 && (
              <button
                onClick={clearAllHistory}
                className="text-xs text-destructive hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ژێبرنا هەمی مێژوویێ
              </button>
            )}
          </div>

          {savedVideos.length === 0 ? (
            <div className="text-center py-16 px-4 bg-secondary/20 rounded-3xl border border-border text-muted-foreground">
              <Film className="w-12 h-12 mx-auto mb-3 opacity-40 text-primary" />
              <h4 className="font-bold text-base text-foreground mb-1">
                هێشتا چ ڤیدیۆ نەهاتینە خەزنکرن
              </h4>
              <p className="text-xs mb-4">
                هەر ڤیدیۆیەکا تو داگری دێ ب شێوەیەکێ ئۆتۆماتیکی ل ڤێرێ هێتە خەزنکرن.
              </p>
              <button
                onClick={() => setActiveTab("downloader")}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition cursor-pointer"
              >
                داگرتنا ئێکەم ڤیدیۆ
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {savedVideos.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-4 bg-card border border-border shadow-sm flex flex-col justify-between hover:border-primary/40 transition"
                >
                  <div className="flex gap-3 mb-3">
                    <div className="w-20 h-16 rounded-xl overflow-hidden bg-secondary shrink-0 relative flex items-center justify-center">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Video className="w-6 h-6 text-muted-foreground" />
                      )}
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                        {item.platform}
                      </span>
                    </div>
                    <div className="flex-1 text-right min-w-0">
                      <h4 className="font-bold text-xs text-foreground line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-1 truncate" dir="ltr">
                        {item.originalUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
                    <button
                      onClick={() => deleteFromHistory(idx)}
                      title="ژێبرن"
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition text-xs cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.originalUrl);
                          setCopiedIndex(idx);
                          setTimeout(() => setCopiedIndex(null), 2000);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold flex items-center gap-1 hover:bg-secondary/80 transition cursor-pointer"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                            <span>هاتە کۆپیکرن</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>کۆپیکرنا لینکێ</span>
                          </>
                        )}
                      </button>

                      {item.formats?.[0] && (
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(item.formats[0], item.title, 1000 + idx)}
                          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1 hover:opacity-90 transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>داگرتن</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
