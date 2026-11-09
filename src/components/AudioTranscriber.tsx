import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Upload,
  FileAudio,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Download,
  Edit3,
  AlertCircle,
  Loader2,
  Trash2,
  Save,
} from "lucide-react";
import { isTextLtr } from "@/lib/utils";

type InputTab = "mic" | "upload";
type ProcessingMode = "transcribe" | "both";

export function AudioTranscriber() {
  const [activeTab, setActiveTab] = useState<InputTab>("mic");
  const [processingMode, setProcessingMode] = useState<ProcessingMode>("transcribe");

  // Mic recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // File upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileAudioUrl, setFileAudioUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Processing & result states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Output states
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState("");
  const [outputTab, setOutputTab] = useState<"transcription" | "summary">("transcription");
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");

  // Clean up Object URLs on unmount
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      if (fileAudioUrl) URL.revokeObjectURL(fileAudioUrl);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [recordedAudioUrl, fileAudioUrl]);

  // Timer format (MM:SS)
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // ── Recording Handlers ──
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let mimeType = "audio/webm";
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4";
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg";
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("دەستپێڕاگەیشتن ب مایکڕۆفۆنێ نەهاتە دان. هیڤیە د وێبگەڕێ خۆدا ڕێپێدانێ ب مایکڕۆفۆنێ بدە (Microphone Permission).");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
      mediaRecorderRef.current.stream?.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setRecordedBlob(null);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
  };

  // ── File Upload Handlers ──
  const handleFileSelect = (file: File) => {
    setError(null);
    if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|ogg|webm|aac|flac)$/i.test(file.name)) {
      setError("تەنها فایلێن دەنگی وەرگرتن (MP3, WAV, M4A, OGG, WebM, AAC, FLAC).");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError("قەبارەیا فایلی زۆر مەزنە (سنوور: 25 مێگابایت).");
      return;
    }

    if (fileAudioUrl) URL.revokeObjectURL(fileAudioUrl);
    setUploadedFile(file);
    setFileAudioUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // ── Conversion to Base64 ──
  const fileToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // ── Execute Transcription ──
  const handleTranscribe = async () => {
    setError(null);
    setLoading(true);
    setLoadingStep("د گوهداریکرن و شیکاریا دەنگیدا...");

    try {
      let payload: Record<string, unknown> = {
        tool: "audio_sum",
        audioMode: processingMode,
      };

      if (activeTab === "mic") {
        if (!recordedBlob) {
          throw new Error("هیچ دەنگەک نەهاتیە تۆمارکرن.");
        }
        setLoadingStep("د گۆڕینا دەنگی بۆ دەقیدا ب زیرەکی دەستکرد...");
        const base64 = await fileToBase64(recordedBlob);
        payload.fileBase64 = base64;
        payload.mimeType = recordedBlob.type || "audio/webm";
        payload.fileName = "voice-recording.webm";
      } else {
        if (!uploadedFile) {
          throw new Error("هیچ فایلەکێ دەنگی نەهاتیە هەڵبژارتن.");
        }
        setLoadingStep("د بارکردن و شیکاریا فایلا دەنگیدا...");
        const base64 = await fileToBase64(uploadedFile);
        payload.fileBase64 = base64;
        payload.mimeType = uploadedFile.type || "audio/mpeg";
        payload.fileName = uploadedFile.name;
      }

      const res = await fetch("/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "خەلەتی د سێرڤیسێ AI دا ڕوویدا.");
      }

      const rawOutput = (data.output || "").trim();
      const directTrans = (data.transcription || "").trim();
      const directSum = (data.summary || "").trim();

      if (directTrans) {
        setTranscription(directTrans);
        setEditedText(directTrans);
        setSummary(directSum);
      } else if (rawOutput) {
        setTranscription(rawOutput);
        setEditedText(rawOutput);
        setSummary("");
      } else {
        throw new Error("هیچ دەقەک نەهاتە دەرهێنان ژ دەنگی. دڵنیابە دەنگێ تۆمارکری یان فایلی ڕوون و بێ کێشەیە.");
      }

      setOutputTab("transcription");
      setIsEditing(false);
    } catch (err: unknown) {
      console.error("Transcribe error:", err);
      setError(err instanceof Error ? err.message : "خەلەتیەک ڕوویدا.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  // ── Reset ──
  const handleReset = () => {
    cancelRecording();
    if (fileAudioUrl) {
      URL.revokeObjectURL(fileAudioUrl);
      setFileAudioUrl(null);
    }
    setUploadedFile(null);
    setTranscription("");
    setSummary("");
    setEditedText("");
    setIsEditing(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ── Copy to Clipboard ──
  const handleCopy = async () => {
    const textToCopy = isEditing
      ? editedText
      : outputTab === "summary" && summary
      ? summary
      : transcription;
    if (!textToCopy) return;

    let success = false;
    if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        success = true;
      } catch (err) {
        console.warn("navigator.clipboard.writeText failed:", err);
      }
    }

    if (!success && typeof document !== "undefined") {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "0";
        textarea.style.left = "0";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch (err) {
        console.error("Fallback execCommand copy failed:", err);
      }
    }

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Download Text ──
  const handleDownload = () => {
    const textToDownload = isEditing
      ? editedText
      : outputTab === "summary" && summary
      ? summary
      : transcription;
    const blob = new Blob([textToDownload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `دەقی_دەنگ_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const currentDisplayContent = isEditing
    ? editedText
    : outputTab === "summary" && summary
    ? summary
    : transcription;
  const isLtr = isTextLtr(currentDisplayContent);
  const wordCount = currentDisplayContent.trim() ? currentDisplayContent.trim().split(/\s+/).length : 0;
  const charCount = currentDisplayContent.length;

  const hasAudioSource =
    (activeTab === "mic" && !!recordedBlob) ||
    (activeTab === "upload" && !!uploadedFile);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* ── Main Tool Card ── */}
      <div className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm backdrop-blur-sm">
        {/* Header */}
        <div className="text-center space-y-1.5 mb-5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500/20 via-primary/20 to-purple-500/20 text-primary border border-primary/20 mb-0.5 shadow-inner">
            <Mic className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            دەنگ بۆ نڤیسین
          </h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
            دەنگێ خۆ تۆمار بکە یان فایلەکێ دەنگی باربکە بۆ گۆڕینێ بۆ دەق و پوختە.
          </p>
        </div>

        {/* ── Top Tabs (Microphone / Upload) ── */}
        <div className="flex items-center justify-center p-1.5 bg-secondary/50 rounded-2xl border border-border/60 max-w-xs sm:max-w-sm mx-auto mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("mic")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "mic"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mic className="w-4 h-4 text-rose-500" />
            <span>تۆمارکرن (مایک)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "upload"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="w-4 h-4 text-indigo-500" />
            <span>بارکرنا فایلی</span>
          </button>
        </div>

        {/* ── TAB 1: Live Voice Recording ── */}
        {activeTab === "mic" && (
          <div className="rounded-2xl border border-border/70 bg-secondary/20 p-4 sm:p-5 flex flex-col items-center justify-center text-center space-y-3">
            {!isRecording && !recordedAudioUrl && (
              <>
                <button
                  type="button"
                  onClick={startRecording}
                  className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white flex items-center justify-center shadow-md hover:shadow-red-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="کلیک بکە بۆ تۆمارکرنێ"
                >
                  <span className="absolute -inset-1 rounded-full bg-red-500/20 animate-ping group-hover:opacity-75 opacity-0 transition-opacity" />
                  <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
                <div className="space-y-0.5">
                  <p className="font-bold text-sm text-foreground">
                    کلیک ل سەر مایکڕۆفۆنێ بکە بۆ دەستپێکرنا تۆمارکرنێ
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    دەتوانی بە زمانی کوردی، ئینگلیزی یان عەرەبی بدوێیت
                  </p>
                </div>
              </>
            )}

            {/* During Recording */}
            {isRecording && (
              <div className="space-y-3.5 w-full max-w-sm">
                <div className="relative mx-auto w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500 flex items-center justify-center animate-pulse">
                  <span className="absolute -inset-2 rounded-full border border-rose-500/40 animate-ping" />
                  <Mic className="w-7 h-7 text-rose-500 animate-bounce" />
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 text-xs font-bold font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                    <span>د تۆمارکردندایە...</span>
                    <span>{formatTime(recordingSeconds)}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    قسە بکە، سیستەم ڕاستەوخۆ دەنگێ تە تۆمار دکەت
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-sm hover:shadow active:scale-95 transition cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>ڕاگرتن و تەواوکرن</span>
                  </button>

                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-border hover:bg-destructive/10 hover:border-destructive/30 text-muted-foreground hover:text-destructive text-xs font-semibold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>پەشیمانبوونەوە</span>
                  </button>
                </div>
              </div>
            )}

            {/* After Recording Completed */}
            {!isRecording && recordedAudioUrl && (
              <div className="w-full max-w-md space-y-3">
                <div className="flex items-center justify-between bg-card border border-border/80 rounded-2xl p-3.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
                      title="سڕینەوە و دووبارە تۆمارکردن"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={startRecording}
                      className="text-xs font-bold text-primary hover:underline px-2 py-1 rounded-lg hover:bg-primary/10 transition cursor-pointer"
                    >
                      دووبارە تۆمار بکە
                    </button>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <p className="font-bold text-xs text-foreground">دەنگێ تۆمارکری</p>
                      <span className="text-[10.5px] text-muted-foreground font-mono">
                        ماوە: {formatTime(recordingSeconds)}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                      <FileAudio className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Audio Player Preview */}
                <div className="w-full bg-card rounded-2xl p-1.5 border border-border shadow-inner">
                  <audio controls src={recordedAudioUrl} className="w-full h-9 outline-none" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: Audio File Upload ── */}
        {activeTab === "upload" && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac,.flac"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {!uploadedFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 py-6 px-4 text-center group ${
                  dragActive
                    ? "border-primary bg-primary/10 scale-[1.01]"
                    : "border-border hover:border-primary/60 hover:bg-primary/5 bg-secondary/15"
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-primary text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                    فایلێ دەنگی ل ڤێرێ دانە یان کلیک بکە بۆ هەڵبژارتنێ
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    پشتگیری ژ فۆرماتێن (MP3, WAV, M4A, OGG, WebM, AAC) دکەت (تا 25MB)
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all mt-0.5">
                  <FileAudio className="w-3.5 h-3.5" />
                  <span>هەڵبژاردنی فایلی دەنگ</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-secondary/30 p-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        if (fileAudioUrl) URL.revokeObjectURL(fileAudioUrl);
                        setFileAudioUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
                      title="سڕینەوەی فایل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-primary hover:underline px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition cursor-pointer"
                    >
                      گۆڕینی فایل
                    </button>
                  </div>

                  <div className="flex items-center gap-3 truncate">
                    <div className="text-right truncate">
                      <p className="font-bold text-sm text-foreground truncate">{uploadedFile.name}</p>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
                      <FileAudio className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {fileAudioUrl && (
                  <div className="w-full bg-card rounded-2xl p-2 border border-border shadow-inner">
                    <audio controls src={fileAudioUrl} className="w-full h-10 outline-none" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Mode Selection Options ── */}
        <div className="mt-5 pt-4 border-t border-border/60">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-3.5">
            <span className="text-xs font-semibold text-muted-foreground">جۆرێ دەرئەنجامی:</span>
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setProcessingMode("transcribe")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                  processingMode === "transcribe"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                دەرهێنانا دەقی (Speech to Text)
              </button>

              <button
                type="button"
                onClick={() => setProcessingMode("both")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                  processingMode === "both"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                دەقی تەمام + پوختەکرن (Full + Summary)
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <div>
              {(recordedBlob || uploadedFile || transcription) && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:border-destructive/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive text-[11px] font-medium transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>پاقژکرن</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleTranscribe}
              disabled={loading || !hasAudioSource}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary via-indigo-600 to-purple-600 text-white px-5 py-2 text-xs font-bold shadow-sm hover:shadow hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{loadingStep || "د جێبەجێکرندا..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {processingMode === "transcribe"
                      ? "گۆڕین بۆ نڤیسینێ (Transcribe)"
                      : "نڤیسین دگەل پوختەکرنێ"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 flex items-start gap-2.5 text-right">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}
      </div>

      {/* ── Results Display Card ── */}
      {transcription && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm backdrop-blur-sm space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Header of results */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-secondary text-xs font-semibold text-foreground transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "کۆپی بوو ✓" : "کۆپیکردن"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-secondary text-xs font-semibold text-foreground transition cursor-pointer"
                title="داگرتن وەک فایلی دەق"
              >
                <Download className="w-3.5 h-3.5" />
                <span>داگرتن (.txt)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  isEditing
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-secondary text-foreground"
                }`}
                title="دەستکاریکردنی دەق"
              >
                {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                <span>{isEditing ? "تەواو" : "دەستکاری"}</span>
              </button>
            </div>

            {/* Tabs for Transcription vs Summary */}
            <div className="flex items-center gap-2">
              {summary ? (
                <div className="flex items-center p-1 bg-secondary/60 rounded-xl border border-border/60">
                  <button
                    type="button"
                    onClick={() => setOutputTab("transcription")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      outputTab === "transcription"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    دەقێ دەنگی (Transcript)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputTab("summary")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      outputTab === "summary"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    پوختە و خاڵ (Summary)
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-muted-foreground">دەقێ دروستکریێ دەنگی</span>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <div className="flex items-center gap-3">
              <span>{wordCount} پەیڤ (Words)</span>
              <span>•</span>
              <span>{charCount} پیت</span>
            </div>
          </div>

          {/* Content Body */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={10}
                dir={isLtr ? "ltr" : "rtl"}
                className={`w-full rounded-2xl border border-primary/40 bg-secondary/20 p-4 text-sm leading-[2] focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-y font-normal ${
                  isLtr ? "text-left font-sans" : "text-right"
                }`}
              />
              <p className="text-[11px] text-muted-foreground text-right">
                دەتوانی دەقێ ڕاست بکەیەوە یان گۆڕانکاری لێ بکەیت.
              </p>
            </div>
          ) : (
            <div
              dir={isLtr ? "ltr" : "rtl"}
              className={`rounded-2xl border border-border/60 bg-secondary/15 p-5 sm:p-6 text-foreground leading-[2.1] text-sm sm:text-base whitespace-pre-wrap select-text ${
                isLtr ? "text-left font-sans" : "text-right font-normal"
              }`}
            >
              {currentDisplayContent}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
