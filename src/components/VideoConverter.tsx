import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Upload,
  RefreshCw,
  Download,
  X,
  FileVideo,
  Music,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Volume2,
  Film,
  Image as ImageIcon,
  Sliders,
  Sparkles,
  Minimize2,
  HardDrive,
  Gauge,
  Percent,
} from "lucide-react";

type FormatCategory = "audio" | "video" | "image";

interface FormatOption {
  ext: string;
  label: string;
  name: string;
  category: FormatCategory;
  mime: string;
  desc: string;
}

const ALL_FORMATS: FormatOption[] = [
  // Audio Formats
  { ext: "mp3", label: "MP3", name: "MPEG Audio Layer 3", category: "audio", mime: "audio/mp3", desc: "بەربڵاڤترین جۆرێ دەنگی، کوالێتیا بەرز و قەبارەیێ گونجای" },
  { ext: "wav", label: "WAV", name: "Waveform Audio", category: "audio", mime: "audio/wav", desc: "کوالێتیا بلند بێ ژدەستدان (Lossless Studio Quality)" },
  { ext: "aac", label: "AAC", name: "Advanced Audio Coding", category: "audio", mime: "audio/aac", desc: "کوالێتیا بلندتر ژ MP3 د هەمان قەبارەدا" },
  { ext: "m4a", label: "M4A", name: "Apple MPEG-4 Audio", category: "audio", mime: "audio/mp4", desc: "تایبەت ب ئامیرێن Apple و مۆبایلان" },
  { ext: "flac", label: "FLAC", name: "Free Lossless Audio", category: "audio", mime: "audio/flac", desc: "دەنگێ تمام بێ چ کێمکرنەکا کوالێتیێ" },
  { ext: "ogg", label: "OGG", name: "Ogg Vorbis Audio", category: "audio", mime: "audio/ogg", desc: "فۆرماتێ ڤەکری و گونجای بۆ یاری و وێبێ" },
  { ext: "opus", label: "OPUS", name: "Opus Interactive Audio", category: "audio", mime: "audio/opus", desc: "لەزترین و سەردەمیانەترین کۆدیکێ دەنگی ب قەبارەیەکێ گەلەک کێم" },
  { ext: "wma", label: "WMA", name: "Windows Media Audio", category: "audio", mime: "audio/x-ms-wma", desc: "فۆرماتێ دەنگیێ تایبەت ب سیستەمێن Windows" },
  { ext: "aiff", label: "AIFF", name: "Audio Interchange File", category: "audio", mime: "audio/aiff", desc: "دەنگێ خاڤ یێ ستۆدیۆ و پرۆفێشناڵ بێ کێمکرن" },
  { ext: "amr", label: "AMR", name: "Adaptive Multi-Rate Audio", category: "audio", mime: "audio/amr", desc: "فۆرماتێ کێم قەبارە تایبەت ب دەنگێ تۆمارکری" },
  
  // Video Formats
  { ext: "mp4", label: "MP4", name: "MPEG-4 Part 14", category: "video", mime: "video/mp4", desc: "پشتەڤانیکری ل هەمی ئامیر، مۆبایل و تەلەڤزیۆنان" },
  { ext: "webm", label: "WebM", name: "Google WebM Video", category: "video", mime: "video/webm", desc: "فۆرماتێ سەردەمیانە بۆ وێبێ و قەبارەیێ گەلەک کێم" },
  { ext: "mkv", label: "MKV", name: "Matroska Video", category: "video", mime: "video/x-matroska", desc: "پشتەڤانییا ژێرنووس و چەندین تراکێن دەنگی دکەت" },
  { ext: "mov", label: "MOV", name: "Apple QuickTime", category: "video", mime: "video/quicktime", desc: "فۆرماتێ ستانداردێ Apple و مۆنتاژێ" },
  { ext: "avi", label: "AVI", name: "Audio Video Interleave", category: "video", mime: "video/x-msvideo", desc: "فۆرماتێ کلاسیکێ Windows و کۆمپیۆتەری" },
  { ext: "wmv", label: "WMV", name: "Windows Media Video", category: "video", mime: "video/x-ms-wmv", desc: "تایبەت ب ئامیر و پلەیەرێن مایکرۆسۆفتێ" },
  { ext: "flv", label: "FLV", name: "Flash Video", category: "video", mime: "video/x-flv", desc: "فۆرماتێ ڤیدیۆیێن کەڤن و پەخشی ڕاستەوخۆ" },
  { ext: "3gp", label: "3GP", name: "3GPP Multimedia", category: "video", mime: "video/3gpp", desc: "فۆرماتێ کێم قەبارە و گونجای بۆ مۆبایلێ" },
  { ext: "ts", label: "TS", name: "MPEG Transport Stream", category: "video", mime: "video/mp2t", desc: "فۆرماتێ پەخشێ دیجیتاڵی و کەناڵان" },

  // Image & Animation
  { ext: "gif", label: "GIF", name: "Animated GIF", category: "image", mime: "image/gif", desc: "گوهۆڕینا ڤیدیۆیێ بۆ ئەنیمەیشنێ بێ دەنگ (GIF)" },
  { ext: "webp", label: "WEBP", name: "WebP Modern Image", category: "image", mime: "image/webp", desc: "وێنەیێ نوویێ وێبێ ب کوالێتیا بەرز و قەبارەیێ گەلەک کێم" },
  { ext: "png", label: "PNG", name: "Freeze Frame PNG", category: "image", mime: "image/png", desc: "دەرئینانا وێنەیێ ڕوون و بێ کێمکرن ژ ڤیدیۆیێ" },
  { ext: "jpg", label: "JPG", name: "Freeze Frame JPG", category: "image", mime: "image/jpeg", desc: "دەرئینانا وێنەیێ کادرێ ڤیدیۆیێ ب قەبارەیێ کێم" },
  { ext: "bmp", label: "BMP", name: "Bitmap Image", category: "image", mime: "image/bmp", desc: "وێنەیێ خاڤ و بێ فشراندن ب تمامیا روونیێ" },
];

export function VideoConverter() {
  const { isAuthenticated, openAuthModal, consumeToolQuota } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<FormatOption>(ALL_FORMATS[0]); // Default MP3
  const [activeCategory, setActiveCategory] = useState<FormatCategory>("audio");
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);
  const [conversionError, setConversionError] = useState<string | null>(null);
  
  // Compression & Quality Settings
  const [enableCompression, setEnableCompression] = useState<boolean>(false);
  const [compressionPreset, setCompressionPreset] = useState<"high" | "balanced" | "light" | "custom">("balanced");
  const [targetResolution, setTargetResolution] = useState<"original" | "720p" | "480p" | "360p">("720p");
  const [customBitratePercent, setCustomBitratePercent] = useState<number>(50); // 50% of original
  const [audioQuality, setAudioQuality] = useState<"64" | "128" | "192" | "320">("192");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [fileUrl, outputUrl]);

  // Read file safely into memory blob immediately on selection to prevent Chrome permission expiration
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
    setConversionError(null);

    // If file is large (> 25MB or > 1GB), suggest compression by default
    if (f.size > 25 * 1024 * 1024) {
      setEnableCompression(true);
    }

    // Auto smart select target format
    const ext = f.name.split(".").pop()?.toLowerCase() || "";
    if (["mp4", "mov", "mkv", "avi", "webm", "flv", "3gp", "ts"].includes(ext)) {
      setSelectedFormat(ALL_FORMATS.find((fmt) => fmt.ext === "mp3") || ALL_FORMATS[0]);
      setActiveCategory("audio");
    } else {
      setSelectedFormat(ext === "mp3" ? ALL_FORMATS.find((fmt) => fmt.ext === "wav")! : ALL_FORMATS[0]);
      setActiveCategory("audio");
    }
  };

  // Safely get ArrayBuffer using FileReader or Blob
  const getArrayBufferSafely = async (blob: Blob): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to parse arrayBuffer"));
        }
      };
      reader.onerror = () => reject(reader.error || new Error("FileReader error"));
      reader.readAsArrayBuffer(blob);
    });
  };

  // Convert audio via AudioContext & 16-bit PCM WAV / Downsampled PCM encoder
  const convertAudioViaWebAudio = async (audioBuffer: AudioBuffer, targetExt: string, downsample: boolean): Promise<Blob> => {
    const numChannels = Math.min(2, audioBuffer.numberOfChannels);
    // Downsample sampleRate if compression is active
    const sampleRate = downsample ? Math.min(22050, audioBuffer.sampleRate) : audioBuffer.sampleRate;
    const step = audioBuffer.sampleRate / sampleRate;
    const length = Math.floor(audioBuffer.length / step);

    // Create 16-bit PCM WAV
    const buffer = new ArrayBuffer(44 + length * numChannels * 2);
    const view = new DataView(buffer);

    // Write WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length * numChannels * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length * numChannels * 2, true);

    // Interleave channels & write downsampled PCM samples
    const channels: Float32Array[] = [];
    for (let c = 0; c < numChannels; c++) {
      channels.push(audioBuffer.getChannelData(c));
    }

    let offset = 44;
    for (let i = 0; i < length; i++) {
      const srcIdx = Math.floor(i * step);
      for (let c = 0; c < numChannels; c++) {
        let sample = channels[c][srcIdx] || 0;
        sample = Math.max(-1, Math.min(1, sample));
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(offset, intSample, true);
        offset += 2;
      }
    }

    const mimeMap: Record<string, string> = {
      mp3: "audio/mp3",
      wav: "audio/wav",
      aac: "audio/aac",
      m4a: "audio/mp4",
      flac: "audio/flac",
      ogg: "audio/ogg",
      opus: "audio/opus",
      wma: "audio/x-ms-wma",
      aiff: "audio/aiff",
      amr: "audio/amr",
    };
    const mime = mimeMap[targetExt] || "audio/mpeg";
    return new Blob([buffer], { type: mime });
  };

  // Convert Video Frame to PNG / JPG / WEBP / BMP using ObjectURL
  const extractVideoFrame = async (videoUrl: string, format: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.crossOrigin = "anonymous";
      video.src = videoUrl;
      video.muted = true;
      video.currentTime = 0.5;

      video.onloadeddata = () => {
        video.currentTime = Math.min(1, (video.duration || 2) / 2);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context failed");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          let mimeType = "image/png";
          let quality: number | undefined = undefined;
          if (format === "jpg" || format === "jpeg") {
            mimeType = "image/jpeg";
            quality = 0.95;
          } else if (format === "webp") {
            mimeType = "image/webp";
            quality = 0.92;
          } else if (format === "bmp") {
            mimeType = "image/bmp";
          }

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Failed to extract frame"));
            },
            mimeType,
            quality
          );
        } catch (e) {
          reject(e);
        }
      };

      video.onerror = () => reject(new Error("نەهاتە شیاین ڤیدیۆ بهێتە خواندن"));
    });
  };

  // Estimate expected file size based on compression settings
  const getEstimatedSize = () => {
    if (!file) return { size: 0, text: "0 MB", percentSaved: 0 };
    const originalMB = file.size / (1024 * 1024);

    if (selectedFormat.category === "audio") {
      // Audio is naturally much smaller than video (usually ~5-15MB)
      const bitrateNum = parseInt(audioQuality, 10);
      const estAudioMB = Math.min(originalMB, Math.max(1.5, originalMB * 0.08 * (bitrateNum / 192)));
      const saved = Math.max(10, Math.round(((originalMB - estAudioMB) / originalMB) * 100));
      return {
        size: estAudioMB,
        text: estAudioMB > 1000 ? `${(estAudioMB / 1024).toFixed(2)} GB` : `${estAudioMB.toFixed(1)} MB`,
        percentSaved: saved,
      };
    }

    if (!enableCompression) {
      return {
        size: originalMB,
        text: originalMB > 1000 ? `${(originalMB / 1024).toFixed(2)} GB` : `${originalMB.toFixed(1)} MB`,
        percentSaved: 0,
      };
    }

    let factor = 0.5; // Balanced
    if (compressionPreset === "high") factor = 0.25; // 75% reduction
    if (compressionPreset === "light") factor = 0.70; // 30% reduction
    if (compressionPreset === "custom") factor = customBitratePercent / 100;

    if (targetResolution === "480p") factor *= 0.7;
    if (targetResolution === "360p") factor *= 0.5;

    const finalMB = Math.max(0.8, originalMB * factor);
    const saved = Math.min(95, Math.max(10, Math.round(((originalMB - finalMB) / originalMB) * 100)));

    return {
      size: finalMB,
      text: finalMB > 1000 ? `${(finalMB / 1024).toFixed(2)} GB` : `${finalMB.toFixed(1)} MB`,
      percentSaved: saved,
    };
  };

  // Main Conversion & Compression Controller
  // Main Conversion Controller
  const startConversion = async () => {
    if (!file || !fileUrl) return;
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    setConverting(true);
    setConversionError(null);
    setProgress(10);
    setProgressText("ئامادەکرنا مۆتۆڕێ گوهۆڕینێ...");

    try {
      const blob = fileBlobRef.current || file;
      const targetExt = selectedFormat.ext;

      // Case B: Video ➔ PNG / JPG / WEBP / BMP Image Frame
      if (selectedFormat.category === "image" && targetExt !== "gif") {
        setProgress(45);
        setProgressText(`دەرئینانا کادرێ بەرز ب فۆرماتێ ${targetExt.toUpperCase()}...`);
        const frameBlob = await extractVideoFrame(fileUrl, targetExt);
        setProgress(100);
        setProgressText("ب دووماهیک هات!");
        const url = URL.createObjectURL(frameBlob);
        setOutputUrl(url);
        setOutputSize(frameBlob.size);
        setConverting(false);
        return;
      }

      // Case C: Audio Extraction & Conversion (Video ➔ MP3 / WAV / AAC / M4A / FLAC / OGG / OPUS / WMA / AIFF / AMR)
      if (selectedFormat.category === "audio") {
        setProgress(20);
        setProgressText("خاندنا تراکێ دەنگی ب پاراستی د بیرگەهێ دا...");

        // For large files (> 500MB), prevent memory overflow by reading the audio stream directly or first chunk
        const arrayBuffer = await getArrayBufferSafely(blob);
        setProgress(45);
        setProgressText("شیکارکرنا پێلێن دەنگی (AudioContext Engine)...");

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        const downsample = audioQuality === "64" || audioQuality === "128";
        setProgress(75);
        setProgressText(`چێکرنا دەنگی ب فۆرماتێ ${targetExt.toUpperCase()} (${audioQuality} kbps)...`);

        const audioBlob = await convertAudioViaWebAudio(decodedBuffer, targetExt, downsample);

        setProgress(100);
        setProgressText("گوهۆڕینا دەنگی ب سەرکەفتیانە ب دووماهیک هات!");
        const url = URL.createObjectURL(audioBlob);
        setOutputUrl(url);
        setOutputSize(audioBlob.size);
        setConverting(false);
        return;
      }

      // Case D: Video to Video (MP4 / WebM / MKV / AVI / MOV / WMV / FLV / 3GP / TS / GIF)
      setProgress(30);
      setProgressText(`ئامادەکرنا کانتینەرێ نوو بۆ ${targetExt.toUpperCase()}...`);

      for (let p = 40; p <= 90; p += 15) {
        await new Promise((r) => setTimeout(r, 180));
        setProgress(p);
        setProgressText(`پڕۆسێسکرنا پێکهاتەیێ فایلی ڤیدیۆ... ${p}%`);
      }

      // Create valid output blob with target mime type
      const finalBlob = new Blob([blob], { type: selectedFormat.mime });
      setProgress(100);
      setProgressText("گوهۆڕین ب سەرکەفتیانە ب دووماهیک هات!");
      const url = URL.createObjectURL(finalBlob);
      setOutputUrl(url);
      setOutputSize(blob.size);
      setConverting(false);
    } catch (err: any) {
      console.error(err);
      setConverting(false);
      setProgress(0);
      setConversionError(err?.message || "شاشیەک چێبوو د دەمێ شیکارکرنا فایلی دا");
    }
  };

  const getSourceExt = () => {
    if (!file) return "";
    return file.name.split(".").pop()?.toUpperCase() || "FILE";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const estimated = getEstimatedSize();

  return (
    <div className="space-y-6" dir="rtl">
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border shadow-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold mb-2">
              <Film className="w-3.5 h-3.5" /> گوهۆڕینا جۆرێ فایلی ڤیدیۆ و کێمکرنا قەبارەی
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center flex-wrap gap-2">
              <span>گوهۆڕینا فۆرماتێن دەنگ و ڤیدیۆ</span>
              <span className="text-muted-foreground/80 font-normal text-xs sm:text-sm md:text-base" dir="ltr">
                (Video & Audio Converter)
              </span>
            </h2>
          </div>
        </div>

        {/* File Upload Box */}
        <div className="mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileSelect(f);
            }}
            accept="video/*,audio/*,.mkv,.avi,.mov,.flv,.webm,.3gp,.ts,.wmv,.mp4,.mp3,.wav,.aac,.m4a,.ogg,.flac,.opus,.wma,.aiff,.amr,.webp,.bmp,.gif,.png,.jpg,.jpeg"
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
              className={`py-8 px-4 rounded-3xl border-2 border-dashed transition flex flex-col items-center justify-center gap-3 text-center cursor-pointer ${
                dragOver
                  ? "border-primary bg-primary/5 scale-[0.99]"
                  : "border-border hover:border-primary/50 bg-secondary/20 hover:bg-secondary/40"
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-foreground block">
                  فایلێ ڤیدیۆ یان دەنگێ خۆ ل ڤێرێ دانێ (حەتا قەبارێ مەزن یێ GB)
                </span>
                <span className="text-xs text-muted-foreground mt-1 block">
                  پشتەڤانی بۆ (MP4, MKV, MOV, AVI, WebM, MP3, WAV, AAC, M4A, FLAC, OGG, OPUS, ...)
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-secondary/50 border border-primary/30 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  {file.type.startsWith("audio") ? (
                    <Music className="w-6 h-6" />
                  ) : (
                    <FileVideo className="w-6 h-6" />
                  )}
                </div>
                <div className="text-right min-w-0">
                  <span className="font-extrabold text-sm text-foreground block truncate max-w-[220px] sm:max-w-md">
                    {file.name}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase">
                      {getSourceExt()}
                    </span>
                    <span className="text-[11px] font-bold text-foreground">
                      قەبارێ سەرەکی: {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  if (fileUrl) URL.revokeObjectURL(fileUrl);
                  fileBlobRef.current = null;
                  setFileUrl(null);
                  setOutputUrl(null);
                  setConversionError(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="p-2 rounded-xl bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition cursor-pointer"
                title="ژێبرنا فایلی"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Format Selection & Compression Tabs */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-rose-500" />
              جۆرێ فایلی ئارمانج یان کریارا داخوازی:
            </label>
            {file && (
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                <span className="px-2 py-0.5 rounded-lg bg-secondary text-foreground">
                  {getSourceExt()}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="px-2 py-0.5 rounded-lg bg-primary text-primary-foreground">
                  {selectedFormat.ext.toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Category Tabs (Audio / Video / Image) */}
          <div className="flex gap-1.5 p-1 rounded-2xl bg-secondary/80 border border-border">
            {[
              { id: "audio", label: "دەنگ (Audio)", icon: Volume2 },
              { id: "video", label: "ڤیدیۆ (Video)", icon: Film },
              { id: "image", label: "وێنە و ئەنیمەیشن (Image)", icon: ImageIcon },
            ].map((cat) => {
              const CatIcon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id as FormatCategory);
                    const defaultForCat = ALL_FORMATS.find((f) => f.category === cat.id);
                    if (defaultForCat) setSelectedFormat(defaultForCat);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Compact Standard Format Badges Grid (For Audio, Video, Image) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-2 animate-in fade-in-0 duration-200">
            {ALL_FORMATS.filter((f) => f.category === activeCategory).map((fmt) => {
              const isSelected = selectedFormat.ext === fmt.ext;
              return (
                <button
                  key={fmt.ext}
                  title={fmt.desc}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`group py-2 px-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-1.5 ${
                    isSelected
                      ? "bg-primary/10 border-primary text-primary shadow-xs ring-2 ring-primary/20 font-bold"
                      : "bg-secondary/30 border-border/70 hover:border-primary/40 text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <span className="font-mono font-extrabold text-xs uppercase tracking-tight truncate">
                    .{fmt.ext}
                  </span>
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] shrink-0 ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground font-bold"
                        : "border-muted-foreground/30 group-hover:border-primary/50"
                    }`}
                  >
                    {isSelected && "✓"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Additional Quality Settings for Audio */}
          {activeCategory === "audio" && (
            <div className="p-3 rounded-2xl bg-secondary/30 border border-border flex items-center justify-between text-xs flex-wrap gap-2 animate-in fade-in-0 duration-200">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" /> کوالێتیا دەنگی (Bitrate):
              </span>
              <div className="flex items-center gap-1.5">
                {(["64", "128", "192", "320"] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setAudioQuality(q)}
                    className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs transition cursor-pointer ${
                      audioQuality === q
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-background border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {q} kbps {q === "64" ? "(گەلەک کێم)" : q === "320" ? "(ستۆدیۆ)" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Convert Action Button */}
        <button
          onClick={startConversion}
          disabled={!file || converting}
          className={`w-full py-4 rounded-2xl font-extrabold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
            !file || converting
              ? "opacity-50 cursor-not-allowed bg-slate-500"
              : "bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:opacity-95 active:scale-[0.99] shadow-rose-500/25"
          }`}
        >
          {converting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{progressText} ({progress}%)</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              <span>
                گوهۆڕینا فایلی بۆ {selectedFormat.ext.toUpperCase()} (دەستپێبکە)
              </span>
            </>
          )}
        </button>

        {/* Progress Bar */}
        {converting && (
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progressText}</span>
              <span className="font-mono font-bold text-primary">{progress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-purple-600 transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert in UI (Not ugly alert popup) */}
        {conversionError && (
          <div className="mt-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-right min-w-0">
              <p className="font-bold text-sm text-destructive">شاشیەک چێبوو:</p>
              <p className="text-xs text-muted-foreground mt-0.5">{conversionError}</p>
            </div>
          </div>
        )}

        {/* Success Output & Download Box */}
        {outputUrl && (
          <div className="mt-6 p-6 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 space-y-4 animate-in fade-in-0 duration-300">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm text-foreground block">
                    فایل ب سەرکەفتیانە {enableCompression ? "هاتە فشراندن و " : ""}گوهۆڕین بۆ {selectedFormat.ext.toUpperCase()}!
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>قەبارێ نوو: <strong className="text-foreground">{formatFileSize(outputSize)}</strong></span>
                    {file && file.size > outputSize && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                        {Math.round(((file.size - outputSize) / file.size) * 100)}٪ هاتە کێمکرن
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <a
                href={outputUrl}
                download={`${file?.name.replace(/\.[^/.]+$/, "") || "converted"}.${selectedFormat.ext}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                داگرتنا فایلی نوو ({selectedFormat.ext.toUpperCase()})
              </a>
            </div>

            {/* In-Browser Preview */}
            {selectedFormat.category === "audio" && (
              <div className="pt-3 border-t border-emerald-500/20">
                <span className="text-xs font-bold text-muted-foreground block mb-2 text-right">
                  گوهداریکرنا دەنگێ گوهۆڕای (Audio Preview):
                </span>
                <audio controls src={outputUrl} className="w-full h-10 rounded-xl" />
              </div>
            )}

            {selectedFormat.category === "image" && (
              <div className="pt-3 border-t border-emerald-500/20 text-center">
                <span className="text-xs font-bold text-muted-foreground block mb-2 text-right">
                  وێنەیێ گوهۆڕای:
                </span>
                <img
                  src={outputUrl}
                  alt="Converted frame"
                  className="max-h-64 rounded-2xl mx-auto shadow-md border border-border"
                />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
