import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isTextLtr } from "@/lib/utils";
import {
  Upload,
  FileText,
  X,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Brain,
  RotateCcw,
  MessageCircle,
  Send,
  Crown,
} from "lucide-react";

type Summary = {
  title?: string;
  language_detected?: string;
  main_points?: string[];
  definitions?: { term: string; definition: string }[];
  dates_formulas?: string[];
};

type QuizQuestion = {
  question: string;
  question_ku?: string;
  options: string[];
  options_ku?: string[];
  answer_index: number;
  explanation?: string;
  explanation_ku?: string;
};

type Quiz = {
  title?: string;
  title_ku?: string;
  questions: QuizQuestion[];
};

const MAX_BYTES = 25 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result);
      const i = s.indexOf(",");
      resolve(i >= 0 ? s.slice(i + 1) : s);
    };
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function getMimeType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") {
    return file.type;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return "application/pdf";
    case "doc": return "application/msword";
    case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls": return "application/vnd.ms-excel";
    case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "ppt": return "application/vnd.ms-powerpoint";
    case "pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "webp": return "image/webp";
    default: return file.type || "application/octet-stream";
  }
}

export function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const { isAuthenticated, isPro, consumeUploadQuota, getUploadQuotaStatus, openAuthModal } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);

  // Chat with File states
  const [chatActive, setChatActive] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatActive && chatMessages.length === 0) {
      setChatMessages([
        {
          role: "assistant",
          content: "سلاڤ! ئەڤە دەقێ فایلا تە هاتیە خاندن. هەر پرسیارەکا تە هەبیت لسەر ناوەڕۆکێ فایلی، بپرسە.",
        },
      ]);
    }
  }, [chatActive, chatMessages.length]);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const handleFile = (f: File | null) => {
    setError(null);
    setSummary(null);
    setQuiz(null);
    setChatActive(false);
    setChatMessages([]);
    setChatInput("");
    setAnswers({});
    setSubmitted(false);
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setError("قەبارا فایلێ پر یە. پترین قەبارە 25 مێگابایتە.");
      return;
    }
    const mime = getMimeType(f);
    const isImage = mime.startsWith("image/");
    const isPdf = mime === "application/pdf";
    const isOffice = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ].includes(mime) || 
    /\.(docx?|xlsx?|pptx?)$/i.test(f.name);

    if (!isImage && !isPdf && !isOffice) {
      setError("تنێ PDF، وێنە یان فایلێن ئۆفیس قبوول دبن.");
      return;
    }
    setFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  }, []);

  const summarize = async () => {
    if (!file) return;
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    const quota = consumeUploadQuota();
    if (!quota.allowed) {
      setError(quota.message || "سنووری ئەپلۆدی بێبەرامبەری ئەمڕۆت تەواو بوو (2 لە 2). تا 12:00ی شەو چاوەڕێ بکە یان پلانی پڕۆ چالاک بکە!");
      return;
    }
    setChatActive(false);
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const b64 = await fileToBase64(file);
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: b64, mimeType: getMimeType(file), fileName: file.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "چەوتی د سەرڤیسێدا");
      setSummary(data.summary as Summary);
    } catch (e) {
      setError(e instanceof Error ? e.message : "چەوتیەک ڕویدا");
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (!file) return;
    const quota = consumeUploadQuota();
    if (!quota.allowed) {
      setError(quota.message || "سنووری ئەپلۆدی بێبەرامبەری ئەمڕۆت تەواو بوو (2 لە 2). تا 12:00ی شەو چاوەڕێ بکە یان پلانی پڕۆ چالاک بکە!");
      return;
    }
    setChatActive(false);
    setQuizLoading(true);
    setError(null);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    try {
      const b64 = await fileToBase64(file);
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: b64, mimeType: getMimeType(file), fileName: file.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "چەوتی د سەرڤیسێدا");
      setQuiz(data.quiz as Quiz);
      setTimeout(
        () => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "چەوتیەک ڕویدا");
    } finally {
      setQuizLoading(false);
    }
  };

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading || !file) return;
    setError(null);
    const next: Array<{ role: "user" | "assistant"; content: string }> = [
      ...chatMessages,
      { role: "user", content: text },
    ];
    setChatMessages(next);
    setChatInput("");
    setChatLoading(true);

    try {
      const b64 = await fileToBase64(file);
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          fileBase64: b64,
          mimeType: getMimeType(file),
          fileName: file.name,
        }),
      });

      if (!resp.ok || !resp.body) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.error || "چەوتی د پەیوەندیکرنێدا");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      setChatMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed?.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setChatMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "چەوتی");
    } finally {
      setChatLoading(false);
    }
  };


  const fileRef = useRef(file);
  const busyRef = useRef(false);
  useEffect(() => {
    fileRef.current = file;
    busyRef.current = loading || quizLoading;
  }, [file, loading, quizLoading]);

  useEffect(() => {
    const hSum = () => {
      if (fileRef.current && !busyRef.current) summarize();
    };
    const hQuiz = () => {
      if (fileRef.current && !busyRef.current) generateQuiz();
    };
    window.addEventListener("trigger-summarize", hSum);
    window.addEventListener("trigger-quiz", hQuiz);
    return () => {
      window.removeEventListener("trigger-summarize", hSum);
      window.removeEventListener("trigger-quiz", hQuiz);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summaryText = summary
    ? [
        summary.title ? `📘 ${summary.title}` : "",
        "",
        "🔹 خالێن سەرەکی:",
        ...(summary.main_points ?? []).map((p, i) => `${i + 1}. ${p}`),
        "",
        "📖 پێناسێن گرنگ:",
        ...(summary.definitions ?? []).map((d) => `• ${d.term}: ${d.definition}`),
        "",
        "📅 دەم و فۆرمول:",
        ...(summary.dates_formulas ?? []).map((d) => `• ${d}`),
      ].join("\n")
    : "";

  const copy = async () => {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const score = quiz
    ? quiz.questions.reduce((acc, q, i) => acc + (answers[i] === q.answer_index ? 1 : 0), 0)
    : 0;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="w-full max-w-3xl mx-auto">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed ${
          file ? "py-4 md:py-5 px-4" : "py-6 md:py-8 px-5"
        } text-center transition-all bg-card ${
          dragOver
            ? "border-primary bg-accent/30 scale-[1.01]"
            : "border-border hover:border-primary/60 hover:bg-accent/10"
        }`}
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <div className={`flex flex-col items-center ${file ? "gap-2.5" : "gap-3"}`}>
          {file ? (
            <div className="flex items-center justify-center gap-2.5">
              <span className="text-xs text-muted-foreground font-medium hover:text-primary transition-colors">
                کلیک بکە بۆ گوهۆڕینا فایلی
              </span>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground animate-float transition-all"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
              >
                <Upload className="w-4 h-4" />
              </div>
            </div>
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground animate-float transition-all"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
            >
              <Upload className="w-7 h-7" />
            </div>
          )}

          {file ? (
            <div className="flex items-center gap-2.5 bg-secondary/80 border border-border px-3.5 py-1.5 rounded-full text-xs sm:text-sm max-w-full">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="font-semibold truncate max-w-[240px] sm:max-w-xs" dir="ltr">
                {file.name}
              </span>
              <span className="text-[11px] text-muted-foreground shrink-0" dir="ltr">
                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setSummary(null);
                  setQuiz(null);
                }}
                className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                aria-label="ژێبرن"
                title="فایلی ژێببە"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-base md:text-lg font-bold">فایلا خۆ ڕاکێشە یان کلیک بکە</h3>
              <p className="text-muted-foreground text-xs md:text-sm">
                پشتەڤانیا وێنە و PDF و فایلان دکەت • پترین قەبارە 25 مێگابایت
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <button
          onClick={summarize}
          disabled={!file || loading || quizLoading || chatLoading}
          className="relative overflow-hidden rounded-xl px-4 py-3 text-sm font-bold text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
        >
          <span className="flex items-center justify-center gap-3">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>د کورتکرنێدا...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>کورت بکە</span>
              </>
            )}
          </span>
          {loading && <span className="absolute inset-0 shimmer pointer-events-none" />}
        </button>

        <button
          onClick={generateQuiz}
          disabled={!file || loading || quizLoading || chatLoading}
          className="relative overflow-hidden rounded-xl px-4 py-3 text-sm font-bold border-2 border-primary text-primary bg-background transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/5 hover:scale-[1.01]"
        >
          <span className="flex items-center justify-center gap-3">
            {quizLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>د تاقیکرنێدا...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>تاقیکرنێ دروست بکە</span>
              </>
            )}
          </span>
        </button>

        <button
          onClick={() => {
            setChatActive(true);
            setSummary(null);
            setQuiz(null);
            setTimeout(() => {
              chatRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
          }}
          disabled={!file || loading || quizLoading || chatLoading}
          className={`relative overflow-hidden rounded-xl px-4 py-3 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] flex items-center justify-center ${
            chatActive
              ? "bg-primary text-primary-foreground shadow-lg"
              : "border-2 border-primary text-primary bg-background hover:bg-primary/5"
          }`}
        >
          <span className="flex items-center justify-center gap-3">
            {chatLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>د چاتکرنێدا...</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                <span>چات دگەل فایلی</span>
              </>
            )}
          </span>
        </button>
      </div>
    </div>


      {(loading || quizLoading) && (
        <div className="mt-8 flex flex-col items-center gap-4 py-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-ring">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <p className="text-muted-foreground">
            {quizLoading ? "پرسیار تێنە ئامادەکرن..." : "فایل یێ دهێتە خواندن و کورتی یا ئامادە دبیت..."}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5">
          <AlertCircle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-destructive">چەوتی</p>
            <p className="text-sm text-foreground/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {quiz && !quizLoading && (
        <article
          ref={quizRef}
          className="mt-6 rounded-2xl p-4 sm:p-5 md:p-6 border border-border"
          style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-elegant)" }}
        >
          <header
            dir={isTextLtr(quiz.title ?? quiz.questions[0]?.question) ? "ltr" : "rtl"}
            className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-border"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-primary-foreground shrink-0"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Brain className="w-4.5 h-4.5" />
              </div>
              <div className={isTextLtr(quiz.title ?? quiz.questions[0]?.question) ? "text-left font-sans" : "text-right"}>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">
                  {quiz.title ?? "تاقیکرن"}
                </h2>
                {quiz.title_ku && isTextLtr(quiz.title) && (
                  <p className="text-xs text-muted-foreground mt-0.5" dir="rtl">{quiz.title_ku}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{quiz.questions.length} پرسیار</p>
              </div>
            </div>
            {submitted && (
              <div className="text-center shrink-0">
                <div className="text-2xl font-extrabold text-primary">
                  {score}/{quiz.questions.length}
                </div>
                <div className="text-[11px] text-muted-foreground">نمرە</div>
              </div>
            )}
          </header>

          <div className="space-y-3.5 sm:space-y-4">
            {quiz.questions.map((q, qi) => {
              const userAns = answers[qi];
              const isQLtr = isTextLtr(q.question);
              return (
                <div
                  key={qi}
                  dir={isQLtr ? "ltr" : "rtl"}
                  className={`rounded-xl bg-card/60 p-3.5 sm:p-4 border border-border ${
                    isQLtr ? "text-left font-sans" : "text-right"
                  }`}
                >
                  <div className="flex items-start gap-2.5 mb-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs mt-0.5">
                      {qi + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm sm:text-base leading-snug">{q.question}</h3>
                      {q.question_ku && (
                        <p className="text-xs sm:text-sm text-primary/85 dark:text-primary-foreground/90 mt-1 leading-snug font-medium" dir="rtl">
                          {q.question_ku}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-1.5 sm:gap-2">
                    {q.options.map((opt, oi) => {
                      const selected = userAns === oi;
                      const isCorrect = oi === q.answer_index;
                      const isOptLtr = isTextLtr(opt);
                      let cls =
                        "border-border bg-background hover:border-primary/60 hover:bg-accent/20";
                      if (submitted) {
                        if (isCorrect) cls = "border-success bg-success/10";
                        else if (selected && !isCorrect)
                          cls = "border-destructive bg-destructive/10";
                        else cls = "border-border bg-background opacity-70";
                      } else if (selected) {
                        cls = "border-primary bg-primary/10";
                      }
                      return (
                        <button
                          key={oi}
                          disabled={submitted}
                          dir={isOptLtr ? "ltr" : "rtl"}
                          onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                          className={`${
                            isOptLtr ? "text-left font-sans" : "text-right"
                          } rounded-lg border px-3 py-2 text-xs sm:text-sm transition-all flex items-center gap-2.5 ${cls} disabled:cursor-default`}
                        >
                          <span className="shrink-0 w-5.5 h-5.5 rounded-full border border-current font-bold flex items-center justify-center text-[11px]">
                            {isOptLtr ? ["A", "B", "C", "D"][oi] ?? oi + 1 : ["أ", "ب", "ج", "د"][oi] ?? oi + 1}
                          </span>
                          <span className="flex-1">
                            {opt}
                            {q.options_ku?.[oi] && (
                              <span className="block text-[11px] text-muted-foreground mt-0.5" dir="rtl">
                                {q.options_ku[oi]}
                              </span>
                            )}
                          </span>
                          {submitted && isCorrect && <Check className="w-4 h-4 text-success shrink-0" />}
                          {submitted && selected && !isCorrect && (
                            <X className="w-4 h-4 text-destructive shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (q.explanation || q.explanation_ku) && (
                    <div
                      dir={isTextLtr(q.explanation) ? "ltr" : "rtl"}
                      className={`mt-2.5 text-xs rounded-lg bg-accent/30 p-2.5 leading-relaxed ${
                        isTextLtr(q.explanation) ? "text-left font-sans" : "text-right"
                      }`}
                    >
                      {q.explanation && <div className="font-medium">💡 {q.explanation}</div>}
                      {q.explanation_ku && (
                        <div className="text-muted-foreground mt-1" dir="rtl">
                          💡 ڕوونکرن: {q.explanation_ku}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 justify-end">
            {!submitted ? (
              <button
                onClick={() => setSubmitted(true)}
                disabled={Object.keys(answers).length < quiz.questions.length}
                className="rounded-xl bg-primary text-primary-foreground px-6 py-3 font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                پێشکێشکرنا بەرسڤان
              </button>
            ) : (
              <button
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
                className="flex items-center gap-2 rounded-xl border-2 border-primary text-primary px-6 py-3 font-bold hover:bg-primary/5 transition"
              >
                <RotateCcw className="w-4 h-4" />
                دیسا تاقی بکە
              </button>
            )}
          </div>
        </article>
      )}

      {summary && !loading && (
        <article
          className="mt-8 rounded-3xl p-6 md:p-8 border border-border"
          style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-elegant)" }}
        >
          <header
            dir={isTextLtr(summary.title) ? "ltr" : "rtl"}
            className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-border"
          >
            <div className={isTextLtr(summary.title) ? "text-left font-sans" : "text-right"}>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
                {summary.title ?? "کورتەیا بەلگەنامێ"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">کورتەیەکا ئامادەکری بو خواندنێ</p>
            </div>
            <button
              onClick={copy}
              className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "هاتە کۆپیکرن" : "کۆپی"}
            </button>
          </header>

          {!!summary.main_points?.length && (
            <section className="mb-6">
              <h3 className="text-lg font-bold mb-3 text-primary">🔹 خالێن سەرەکی</h3>
              <ul className="space-y-2.5">
                {summary.main_points.map((p, i) => {
                  const isPointLtr = isTextLtr(p);
                  return (
                    <li
                      key={i}
                      dir={isPointLtr ? "ltr" : "rtl"}
                      className={`flex gap-3 leading-relaxed ${isPointLtr ? "text-left font-sans" : "text-right"}`}
                    >
                      <span className="font-bold text-primary shrink-0">{i + 1}.</span>
                      <span className="flex-1">{p}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {!!summary.definitions?.length && (
            <section className="mb-6">
              <h3 className="text-lg font-bold mb-3 text-primary">📖 پێناسێن گرنگ</h3>
              <div className="grid gap-3">
                {summary.definitions.map((d, i) => {
                  const isDefLtr = isTextLtr(d.term + " " + d.definition);
                  return (
                    <div
                      key={i}
                      dir={isDefLtr ? "ltr" : "rtl"}
                      className={`rounded-xl bg-secondary/60 p-4 ${isDefLtr ? "text-left font-sans" : "text-right"}`}
                    >
                      <div className="font-bold text-foreground">{d.term}</div>
                      <div className="text-muted-foreground text-sm mt-1 leading-relaxed">
                        {d.definition}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {!!summary.dates_formulas?.length && (
            <section>
              <h3 className="text-lg font-bold mb-3 text-primary">📅 دەم و فۆرمول</h3>
              <ul className="space-y-2">
                {summary.dates_formulas.map((d, i) => {
                  const isDateLtr = isTextLtr(d);
                  return (
                    <li
                      key={i}
                      dir={isDateLtr ? "ltr" : "rtl"}
                      className={`flex gap-3 ${isDateLtr ? "text-left font-sans" : "text-right"}`}
                    >
                      <span className="text-primary">•</span>
                      <span className="flex-1">{d}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </article>
      )}

      {chatActive && (
        <article
          ref={chatRef}
          className="mt-6 rounded-2xl p-4 sm:p-5 md:p-6 border border-border flex flex-col w-full"
          style={{ 
            background: "var(--gradient-card)", 
            boxShadow: "var(--shadow-elegant)",
            height: "min(70vh, 600px)"
          }}
        >
          <header className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-border">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-primary-foreground shrink-0"
              style={{ background: "var(--gradient-primary)" }}
            >
              <MessageCircle className="w-4.5 h-4.5" />
            </div>
            <div className="text-right">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                چات دگەل فایلی
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">پرسیاران ژ ناوەڕۆکێ فایلی بکە</p>
            </div>
          </header>

          <div 
            ref={chatScrollRef} 
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 sm:space-y-3 border border-border rounded-xl bg-card/40 mb-3"
          >
            {chatMessages.map((m, i) => {
              const isMsgLtr = isTextLtr(m.content);
              return (
                <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div
                    dir={isMsgLtr ? "ltr" : "rtl"}
                    className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isMsgLtr ? "text-left font-sans" : "text-right"
                    } ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-bl-xs"
                        : "bg-secondary text-foreground rounded-br-xs"
                    }`}
                  >
                    {m.content || (chatLoading && i === chatMessages.length - 1 ? "…" : "")}
                  </div>
                </div>
              );
            })}
            {chatLoading && chatMessages[chatMessages.length - 1]?.role === "user" && (
              <div className="flex justify-end">
                <div className="bg-secondary rounded-xl rounded-br-xs px-3.5 py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-end gap-2 bg-background/50 p-2 rounded-xl border border-border">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              dir={chatInput.trim() ? (isTextLtr(chatInput) ? "ltr" : "rtl") : "auto"}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendChatMessage();
                }
              }}
              placeholder="پرسیارەکێ بنڤیسە..."
              rows={1}
              className={`flex-1 resize-none rounded-lg border-0 bg-transparent px-3 py-2 text-xs sm:text-sm focus:outline-none max-h-32 ${
                chatInput.trim() && isTextLtr(chatInput) ? "text-left font-sans" : "text-right"
              }`}
            />
            <button
              onClick={sendChatMessage}
              disabled={chatLoading || !chatInput.trim()}
              className="rounded-lg bg-primary text-primary-foreground w-9 h-9 flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {chatLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 rotate-180" />
              )}
            </button>
          </div>
        </article>
      )}
    </div>
  );
}

