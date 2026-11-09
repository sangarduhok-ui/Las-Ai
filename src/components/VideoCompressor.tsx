import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Upload,
  Minimize2,
  Download,
  X,
  FileVideo,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Sparkles,
  Zap,
  Check,
  StopCircle,
  Play,
  Eye,
  EyeOff,
  ShieldCheck,
  Film,
  TrendingDown,
  Layers,
} from "lucide-react";

export function VideoCompressor() {
  const { isAuthenticated, openAuthModal, consumeToolQuota } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [compressionPreset, setCompressionPreset] = useState<"high" | "balanced" | "light">("balanced");
  const [targetResolution, setTargetResolution] = useState<"original" | "720p" | "480p" | "360p">("720p");
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);
  const [outputMime, setOutputMime] = useState<string>("video/mp4");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSourcePreview, setShowSourcePreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileBlobRef = useRef<Blob | null>(null);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const activeRecorderRef = useRef<MediaRecorder | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (activeRecorderRef.current && activeRecorderRef.current.state !== "inactive") {
        activeRecorderRef.current.stop();
      }
    };
  }, [fileUrl, outputUrl]);

  const handleFileSelect = (f: File) => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);

    setFile(f);
    const blob = f.slice(0, f.size, f.type);
    fileBlobRef.current = blob;
    const url = URL.createObjectURL(blob);
    setFileUrl(url);

    setOutputUrl(null);
    setProgress(0);
    setConverting(false);
    setErrorMsg(null);
    setShowSourcePreview(false);
  };

  const getEstimatedSize = () => {
    if (!file) return { size: 0, text: "0 MB", percentSaved: 0 };
    const originalMB = file.size / (1024 * 1024);

    let factor = 0.45; // Balanced
    if (compressionPreset === "high") factor = 0.22; // ~78% reduction
    if (compressionPreset === "light") factor = 0.65; // ~35% reduction

    if (targetResolution === "480p") factor *= 0.7;
    if (targetResolution === "360p") factor *= 0.5;

    const finalMB = Math.max(0.5, originalMB * factor);
    const saved = Math.min(95, Math.max(10, Math.round(((originalMB - finalMB) / originalMB) * 100)));

    return {
      size: finalMB,
      text: finalMB > 1000 ? `${(finalMB / 1024).toFixed(2)} GB` : `${finalMB.toFixed(1)} MB`,
      percentSaved: saved,
    };
  };

  // Real client-side video encoder & compressor
  const compressVideoReal = async (
    videoUrl: string,
    resolution: "original" | "720p" | "480p" | "360p",
    preset: "high" | "balanced" | "light"
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      activeVideoRef.current = video;
      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        let targetWidth = video.videoWidth || 1280;
        let targetHeight = video.videoHeight || 720;
        const aspectRatio = targetWidth / targetHeight;

        if (resolution === "720p" && targetHeight > 720) {
          targetHeight = 720;
          targetWidth = Math.round(targetHeight * aspectRatio);
        } else if (resolution === "480p" && targetHeight > 480) {
          targetHeight = 480;
          targetWidth = Math.round(targetHeight * aspectRatio);
        } else if (resolution === "360p" && targetHeight > 360) {
          targetHeight = 360;
          targetWidth = Math.round(targetHeight * aspectRatio);
        }

        targetWidth = Math.floor(targetWidth / 2) * 2;
        targetHeight = Math.floor(targetHeight / 2) * 2;

        let videoBitsPerSecond = 1_200_000; // Balanced (1.2 Mbps)
        if (preset === "high") videoBitsPerSecond = 600_000; // 600 kbps (high compression)
        if (preset === "light") videoBitsPerSecond = 2_200_000; // 2.2 Mbps

        if (resolution === "480p") videoBitsPerSecond = Math.min(videoBitsPerSecond, 800_000);
        if (resolution === "360p") videoBitsPerSecond = Math.min(videoBitsPerSecond, 450_000);

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context failed"));

        const canvasStream = canvas.captureStream(25);

        try {
          const audioStream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream ? (video as any).mozCaptureStream() : null;
          if (audioStream && audioStream.getAudioTracks().length > 0) {
            audioStream.getAudioTracks().forEach((track: any) => canvasStream.addTrack(track));
          }
        } catch (e) {
          console.warn("Audio track capture not available", e);
        }

        let chosenMime = "video/webm;codecs=vp8,opus";
        if (MediaRecorder.isTypeSupported("video/mp4")) {
          chosenMime = "video/mp4";
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) {
          chosenMime = "video/webm;codecs=vp9,opus";
        } else if (MediaRecorder.isTypeSupported("video/webm")) {
          chosenMime = "video/webm";
        }

        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(canvasStream, {
            mimeType: chosenMime,
            videoBitsPerSecond,
            audioBitsPerSecond: 96_000,
          });
        } catch (err) {
          recorder = new MediaRecorder(canvasStream);
        }

        activeRecorderRef.current = recorder;
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          const mime = recorder.mimeType || chosenMime;
          setOutputMime(mime);
          const finalBlob = new Blob(chunks, { type: mime });
          resolve(finalBlob);
        };

        recorder.onerror = (e) => reject(e);

        const duration = video.duration || 10;

        const drawLoop = () => {
          if (!video.paused && !video.ended) {
            ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
            const percent = Math.min(99, Math.round((video.currentTime / duration) * 100));
            setProgress(percent);
            setProgressText(`کێمکرنا قەبارێ ڤیدیۆیێ... ${percent}%`);
            animFrameRef.current = requestAnimationFrame(drawLoop);
          }
        };

        video.onended = () => {
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          setProgress(100);
          setProgressText("کێمکرنا قەبارەی ب سەرکەفتیانە ب دووماهیک هات!");
          setTimeout(() => {
            if (recorder.state !== "inactive") recorder.stop();
          }, 300);
        };

        // Accelerated playback speed for fast encoding (2x to 3x)
        video.playbackRate = 2.5;

        recorder.start(250);
        video.play().then(() => {
          drawLoop();
        }).catch(reject);
      };

      video.onerror = () => reject(new Error("نەهاتە شیاین ڤیدیۆ بهێتە خواندن بۆ کێمکرنا قەبارەی"));
    });
  };

  const startCompression = async () => {
    if (!file || !fileUrl) return;
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    setConverting(true);
    setErrorMsg(null);
    setProgress(5);
    setProgressText("دەستپێکرنا مۆتۆڕێ کێمکرنا قەبارەی ب شێوەیێ ڕاستەقینە...");

    try {
      const compressedBlob = await compressVideoReal(fileUrl, targetResolution, compressionPreset);
      
      const url = URL.createObjectURL(compressedBlob);
      setOutputUrl(url);
      setOutputSize(compressedBlob.size);
      setProgress(100);
      setProgressText("کێمکرنا قەبارەی ب سەرکەفتیانە ب دووماهیک هات!");
      setConverting(false);
    } catch (err: any) {
      console.error("Compression error:", err);
      setConverting(false);
      setProgress(0);
      setErrorMsg(err?.message || "شاشیەک د کێمکرنا قەبارێ ڤیدیۆیێ دا رویدا");
    }
  };

  const cancelCompression = () => {
    if (activeVideoRef.current) {
      activeVideoRef.current.pause();
      activeVideoRef.current.src = "";
    }
    if (activeRecorderRef.current && activeRecorderRef.current.state !== "inactive") {
      activeRecorderRef.current.stop();
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setConverting(false);
    setProgress(0);
    setProgressText("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getSourceExt = () => {
    if (!file) return "";
    return file.name.split(".").pop()?.toUpperCase() || "FILE";
  };

  const getOutputExt = () => {
    if (outputMime.includes("mp4")) return "mp4";
    return "webm";
  };

  const estimated = getEstimatedSize();

  const presets = [
    {
      id: "high",
      title: "کێمکرنا زۆر (Maximum)",
      badge: "~75٪ کێمتر",
      desc: "بۆ واتسئاپ و ئیمەیڵێ (قەبارەکێ گەلەک بچووک)",
      icon: Zap,
      gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
    {
      id: "balanced",
      title: "هاوسەنگ (پێشنیارکری)",
      badge: "~50٪ کێمتر",
      desc: "کوالێتیا باش و قەبارەیەکێ زۆر گونجای",
      icon: Sparkles,
      recommended: true,
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
    {
      id: "light",
      title: "کوالێتیا بەرز (High Quality)",
      badge: "~30٪ کێمتر",
      desc: "پاراستنا روونیێ ب کەمترین دەستکاری د کوالێتیێ دا",
      icon: ShieldCheck,
      gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
      badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    },
  ] as const;

  const resolutions = [
    { id: "original", label: "سەرەکی (Original)", hint: "روونییا خۆ" },
    { id: "720p", label: "720p HD", hint: "هاوسەنگ و باش" },
    { id: "480p", label: "480p SD", hint: "گەلەک سڤک" },
    { id: "360p", label: "360p", hint: "بچووکترین" },
  ] as const;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Outer Card with subtle glassmorphism */}
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border/70 shadow-sm relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-3 shadow-xs">
            <Minimize2 className="w-3.5 h-3.5" /> ئامرازێ کێمکرنا قەبارێ ڤیدیۆیێ
          </div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center flex-wrap gap-2">
            <span>کێمکرنا قەبارێ ڤیدیۆیێ</span>
            <span className="text-muted-foreground/80 font-normal text-xs sm:text-sm md:text-base" dir="ltr">
              (Video Compressor)
            </span>
          </h2>
        </div>

        {/* File Upload Box or Selected File Bar */}
        <div className="mb-6 relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
            accept="video/*,.mkv,.avi,.mov,.flv,.webm,.3gp,.ts,.mp4,.mpg"
            className="hidden"
          />

          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files?.[0];
                if (f) handleFileSelect(f);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`py-12 px-6 rounded-3xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-3 text-center cursor-pointer group ${
                dragOver
                  ? "border-emerald-500 bg-emerald-500/10 scale-[0.99]"
                  : "border-border/80 hover:border-emerald-500/60 bg-secondary/20 hover:bg-secondary/40"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-base font-extrabold text-foreground block">
                  فایلێ ڤیدیۆیا خۆ ل ڤێرێ دانێ یان کلیک لێ بکە
                </span>
                <span className="text-xs text-muted-foreground block max-w-md">
                  پشتەڤانی بۆ جۆرێن سەرەکی (MP4, MKV, MOV, AVI, MPG, WebM) هەتا قەبارێ مەزن یێ چەندین گیگابایت
                </span>
              </div>
            </div>
          ) : (
            /* Redesigned Selected File Card */
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.03] overflow-hidden shadow-xs">
              <div className="p-4 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                {/* File Info on the right in RTL */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <FileVideo className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 text-right">
                    <span className="font-extrabold text-sm text-foreground block truncate max-w-[240px] sm:max-w-md" title={file.name}>
                      {file.name}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase">
                        {getSourceExt()}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        قەبارێ سەرەکی: <strong className="text-foreground">{formatFileSize(file.size)}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons on the left in RTL */}
                <div className="flex items-center gap-2 self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowSourcePreview(!showSourcePreview)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-background hover:bg-secondary text-xs font-bold text-foreground transition cursor-pointer"
                    title="پێشاندانا ڤیدیۆیێ"
                  >
                    {showSourcePreview ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="hidden sm:inline">ڤەشارتن</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="hidden sm:inline">پێشاندان</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileUrl) URL.revokeObjectURL(fileUrl);
                      fileBlobRef.current = null;
                      setFileUrl(null);
                      setOutputUrl(null);
                      setErrorMsg(null);
                      setShowSourcePreview(false);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-2 rounded-xl border border-destructive/20 bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition cursor-pointer"
                    title="ژێبرنا فایلی"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expandable Source Video Preview */}
              {showSourcePreview && fileUrl && (
                <div className="p-3 bg-black/40 border-t border-emerald-500/20 animate-in fade-in-0 duration-200">
                  <video
                    controls
                    src={fileUrl}
                    className="w-full max-h-56 rounded-xl bg-black object-contain mx-auto"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compression Options Section */}
        {file && (
          <div className="space-y-6 mb-6 animate-in fade-in-0 duration-300">
            {/* Presets Cards */}
            <div className="space-y-2.5">
              <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                ئاستێ کێمکرنا قەبارەی (Compression Preset):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {presets.map((preset) => {
                  const isSelected = compressionPreset === preset.id;
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setCompressionPreset(preset.id as any)}
                      className={`relative p-3.5 rounded-2xl border text-right transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 overflow-hidden group ${
                        isSelected
                          ? "bg-card border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                          : "bg-secondary/15 hover:bg-secondary/35 border-border/70 text-foreground"
                      }`}
                    >
                      {/* Active Indicator Bar on top */}
                      {isSelected && (
                        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                      )}

                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-emerald-500 text-white shadow-xs"
                              : "bg-secondary text-muted-foreground group-hover:text-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-foreground block truncate">
                          {preset.title}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border shrink-0 ${preset.badgeColor}`}
                      >
                        {preset.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resolution Selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-emerald-500" />
                ڕوونییا ڤیدیۆیێ (Video Resolution):
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {resolutions.map((res) => {
                  const isSelected = targetResolution === res.id;
                  return (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setTargetResolution(res.id as any)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                        isSelected
                          ? "bg-emerald-500 text-white border-emerald-500 shadow-xs shadow-emerald-500/25"
                          : "bg-secondary/20 hover:bg-secondary/40 border-border/70 text-foreground"
                      }`}
                    >
                      {res.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Comparison & Savings Estimate Widget */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-card to-teal-500/10 border border-emerald-500/30 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-muted-foreground font-medium">قەبارێ سەرەکی:</span>
                  <strong className="text-foreground font-black">{formatFileSize(file.size)}</strong>
                  <ArrowLeft className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">تەخمینی نوو:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-black">~ {estimated.text}</strong>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[11px]">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>نێزیکی {estimated.percentSaved}٪ پاشەکەوت</span>
                </div>
              </div>

              {/* Visual Reduction Meter */}
              <div className="w-full h-1.5 rounded-full bg-secondary/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                  style={{ width: `${estimated.percentSaved}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Button & Controls */}
        <div className="flex gap-2.5">
          {converting && (
            <button
              type="button"
              onClick={cancelCompression}
              className="px-4 py-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 text-destructive font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <StopCircle className="w-4 h-4" />
              <span>ڕاگرتن</span>
            </button>
          )}

          <button
            type="button"
            onClick={startCompression}
            disabled={!file || converting}
            className={`flex-1 py-2.5 sm:py-3 px-5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all duration-200 cursor-pointer ${
              !file || converting
                ? "opacity-50 cursor-not-allowed bg-slate-500"
                : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:opacity-95 active:scale-[0.99] shadow-emerald-500/20"
            }`}
          >
            {converting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{progressText || "د فشراندنا ڤیدیۆیێ دایە..."}</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>کێمکرنا قەبارێ ڤیدیۆیێ نوکە دەستپێبکە</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar with smooth look */}
        {converting && (
          <div className="mt-4 p-4 rounded-2xl bg-secondary/30 border border-emerald-500/20 space-y-2 animate-in fade-in-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                {progressText}
              </span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                {progress}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 transition-all duration-200 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-right min-w-0">
              <p className="font-bold text-sm text-destructive">شاشیەک چێبوو:</p>
              <p className="text-xs text-muted-foreground mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Success Output & Download Box */}
        {outputUrl && (
          <div className="mt-6 p-6 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 space-y-5 animate-in fade-in-0 duration-300">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="font-black text-base text-foreground block">
                    ڤیدیۆ ب سەرکەفتیانە قەبارێ وێ هاتە کێمکرن!
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                    <span>
                      قەبارێ نوو:{" "}
                      <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                        {formatFileSize(outputSize)}
                      </strong>
                    </span>
                    {file && file.size > outputSize && (
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                        {Math.round(((file.size - outputSize) / file.size) * 100)}٪ هاتە کێمکرن
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <a
                href={outputUrl}
                download={`${file?.name.replace(/\.[^/.]+$/, "") || "video"}_compressed.${getOutputExt()}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md shadow-emerald-600/25 transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                داگرتنا ڤیدیۆیێ نووکە ({formatFileSize(outputSize)})
              </a>
            </div>

            {/* Video Player Preview */}
            <div className="pt-4 border-t border-emerald-500/20 space-y-2">
              <span className="text-xs font-bold text-muted-foreground block text-right">
                پێشاندانا ڤیدیۆیێ پشتی کێمکرنێ (Video Preview):
              </span>
              <div className="rounded-2xl overflow-hidden bg-black border border-border shadow-md">
                <video
                  controls
                  src={outputUrl}
                  className="w-full max-h-72 object-contain mx-auto"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

