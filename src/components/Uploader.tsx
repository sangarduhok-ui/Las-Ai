import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, FileText, X, Sparkles, Copy, Check, AlertCircle, Loader2, Brain, RotateCcw } from "lucide-react";

type Summary = {
  title?: string;
  language_detected?: string;
  main_points?: string[];
  definitions?: { term: string; definition: string }[];
  dates_formulas?: string[];
};

type QuizQuestion = {
  question: string;
  options: string[];
  answer_index: number;
  explanation?: string;
};

type Quiz = {
  title?: string;
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

export function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);

  const handleFile = (f: File | null) => {
    setError(null);
    setSummary(null);
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setError("قەبارا فایلێ پر یە. پترین قەبارە ٢٥ مێگابایتە.");
      return;
    }
    const ok = f.type === "application/pdf" || f.type.startsWith("image/");
    if (!ok) {
      setError("تنێ PDF یان وێنە قبوول دبیت.");
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
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const b64 = await fileToBase64(file);
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: b64, mimeType: file.type, fileName: file.name }),
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
        body: JSON.stringify({ fileBase64: b64, mimeType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "چەوتی د سەرڤیسێدا");
      setQuiz(data.quiz as Quiz);
      setTimeout(() => quizRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "چەوتیەک ڕویدا");
    } finally {
      setQuizLoading(false);
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
    <div className="w-full max-w-3xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-3xl border-2 border-dashed p-10 md:p-14 text-center transition-all bg-card ${
          dragOver
            ? "border-primary bg-accent/30 scale-[1.01]"
            : "border-border hover:border-primary/60 hover:bg-accent/10"
        }`}
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-primary-foreground animate-float"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
          >
            <Upload className="w-9 h-9" />
          </div>
          {file ? (
            <div className="flex items-center gap-3 bg-secondary px-4 py-2 rounded-full">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setSummary(null);
                  setQuiz(null);
                }}
                className="text-muted-foreground hover:text-destructive"
                aria-label="ژێبرن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-xl md:text-2xl font-bold">فایلا خۆ ڕاکێشە یان کلیک بکە</h3>
              <p className="text-muted-foreground text-sm">
                پشتەڤانیا PDF و وێنە دکەت • پترین قەبارە ٢٥ مێگابایت
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <button
          onClick={summarize}
          disabled={!file || loading || quizLoading}
          className="relative overflow-hidden rounded-2xl px-6 py-5 text-lg font-bold text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
        >
          <span className="flex items-center justify-center gap-3">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>د کورتکرنێدا...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>کورتە بکە</span>
              </>
            )}
          </span>
          {loading && <span className="absolute inset-0 shimmer pointer-events-none" />}
        </button>

        <button
          onClick={generateQuiz}
          disabled={!file || loading || quizLoading}
          className="relative overflow-hidden rounded-2xl px-6 py-5 text-lg font-bold border-2 border-primary text-primary bg-background transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/5 hover:scale-[1.01]"
        >
          <span className="flex items-center justify-center gap-3">
            {quizLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>د تاقیکرنێدا...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>تاقیکرن دروست بکە</span>
              </>
            )}
          </span>
        </button>
      </div>

      {(loading || quizLoading) && (
        <div className="mt-8 flex flex-col items-center gap-4 py-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-ring">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <p className="text-muted-foreground">
            {quizLoading ? "پرسیار تێنە ئامادەکرن..." : "پەڕە تێنە خواندن و کورتە ئامادە دبیت..."}
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
          className="mt-8 rounded-3xl p-6 md:p-8 border border-border"
          style={{ background: "var(--gradient-card)", boxShadow: "var(--shadow-elegant)" }}
        >
          <header className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
                  {quiz.title ?? "تاقیکرن"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {quiz.questions.length} پرسیار
                </p>
              </div>
            </div>
            {submitted && (
              <div className="text-center shrink-0">
                <div className="text-3xl font-extrabold text-primary">
                  {score}/{quiz.questions.length}
                </div>
                <div className="text-xs text-muted-foreground">نمرە</div>
              </div>
            )}
          </header>

          <div className="space-y-6">
            {quiz.questions.map((q, qi) => {
              const userAns = answers[qi];
              return (
                <div key={qi} className="rounded-2xl bg-card/60 p-5 border border-border">
                  <div className="flex gap-3 mb-4">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
                      {qi + 1}
                    </span>
                    <h3 className="font-bold text-base md:text-lg leading-relaxed">{q.question}</h3>
                  </div>
                  <div className="grid gap-2">
                    {q.options.map((opt, oi) => {
                      const selected = userAns === oi;
                      const isCorrect = oi === q.answer_index;
                      let cls = "border-border bg-background hover:border-primary/60 hover:bg-accent/20";
                      if (submitted) {
                        if (isCorrect) cls = "border-success bg-success/10";
                        else if (selected && !isCorrect) cls = "border-destructive bg-destructive/10";
                        else cls = "border-border bg-background opacity-70";
                      } else if (selected) {
                        cls = "border-primary bg-primary/10";
                      }
                      return (
                        <button
                          key={oi}
                          disabled={submitted}
                          onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                          className={`text-right rounded-xl border-2 px-4 py-3 transition-all flex items-center gap-3 ${cls} disabled:cursor-default`}
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full border-2 border-current font-bold flex items-center justify-center text-xs">
                            {["أ", "ب", "ج", "د"][oi] ?? oi + 1}
                          </span>
                          <span className="flex-1 text-sm md:text-base">{opt}</span>
                          {submitted && isCorrect && <Check className="w-5 h-5 text-success" />}
                          {submitted && selected && !isCorrect && <X className="w-5 h-5 text-destructive" />}
                        </button>
                      );
                    })}
                  </div>
                  {submitted && q.explanation && (
                    <div className="mt-3 text-sm rounded-xl bg-accent/30 p-3 leading-relaxed">
                      <span className="font-bold">💡 ڕوونکرن: </span>
                      {q.explanation}
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
          <header className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-border">
            <div>
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
              <ul className="space-y-2">
                {summary.main_points.map((p, i) => (
                  <li key={i} className="flex gap-3 leading-relaxed">
                    <span className="font-bold text-primary shrink-0">{i + 1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!!summary.definitions?.length && (
            <section className="mb-6">
              <h3 className="text-lg font-bold mb-3 text-primary">📖 پێناسێن گرنگ</h3>
              <div className="grid gap-3">
                {summary.definitions.map((d, i) => (
                  <div key={i} className="rounded-xl bg-secondary/60 p-4">
                    <div className="font-bold text-foreground">{d.term}</div>
                    <div className="text-muted-foreground text-sm mt-1 leading-relaxed">{d.definition}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!!summary.dates_formulas?.length && (
            <section>
              <h3 className="text-lg font-bold mb-3 text-primary">📅 دەم و فۆرمول</h3>
              <ul className="space-y-2">
                {summary.dates_formulas.map((d, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-primary">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      )}
    </div>
  );
}
