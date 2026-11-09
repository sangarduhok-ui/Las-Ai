import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Volume2,
  Sparkles,
  MessageSquare,
  HelpCircle,
  Flame,
  Bot,
  Send,
  Loader2,
  Check,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  AlertTriangle,
  GraduationCap,
  RotateCcw,
  Trophy,
  Zap,
  Star,
  Award,
  Crown,
  Target,
  ArrowUpRight,
  X,
} from "lucide-react";
import {
  DailyQuizQuestion,
  WEEKLY_ENGLISH_CURRICULUM,
  MASTER_QUESTION_POOL,
} from "../data/englishCurriculum";

// ── Level Tiers Definition ──────────────────────────────────────────────────

export interface LearnerLevelInfo {
  level: number;
  titleKu: string;
  titleEn: string;
  icon: string;
  minXp: number;
  maxXp: number;
  color: string;
  gradient: string;
  badgeBg: string;
}

export const LEARNER_LEVELS: LearnerLevelInfo[] = [
  {
    level: 1,
    titleKu: "دەستپێکەرێ ئینگلیزی",
    titleEn: "Beginner Explorer",
    icon: "🌱",
    minXp: 0,
    maxXp: 50,
    color: "text-emerald-500",
    gradient: "from-emerald-500 to-teal-500",
    badgeBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  },
  {
    level: 2,
    titleKu: "فێرخوازێ چالاک",
    titleEn: "Active Learner",
    icon: "⚡",
    minXp: 50,
    maxXp: 120,
    color: "text-blue-500",
    gradient: "from-blue-500 to-indigo-500",
    badgeBg: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  },
  {
    level: 3,
    titleKu: "ئاخڤکەرێ ناڤین",
    titleEn: "Intermediate Speaker",
    icon: "🚀",
    minXp: 120,
    maxXp: 220,
    color: "text-purple-500",
    gradient: "from-purple-500 to-pink-500",
    badgeBg: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
  },
  {
    level: 4,
    titleKu: "ئەکادیمیێ پێشکەفتی",
    titleEn: "Advanced Scholar",
    icon: "🌟",
    minXp: 220,
    maxXp: 350,
    color: "text-amber-500",
    gradient: "from-amber-500 to-orange-500",
    badgeBg: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
  },
  {
    level: 5,
    titleKu: "مامۆستایێ زمانێ ئینگلیزی",
    titleEn: "English Master Champion",
    icon: "👑",
    minXp: 350,
    maxXp: 500,
    color: "text-rose-500",
    gradient: "from-rose-500 via-amber-500 to-yellow-400",
    badgeBg: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
  },
];

export const getLevelInfo = (xp: number) => {
  for (let i = LEARNER_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEARNER_LEVELS[i].minXp) {
      const current = LEARNER_LEVELS[i];
      const next = LEARNER_LEVELS[i + 1] || null;
      const range = current.maxXp - current.minXp;
      const progressInLevel = Math.min(Math.max(xp - current.minXp, 0), range);
      const percent = next ? Math.round((progressInLevel / range) * 100) : 100;
      const xpNeeded = next ? Math.max(current.maxXp - xp, 0) : 0;
      return { current, next, percent, xpNeeded, progressInLevel, range };
    }
  }
  return {
    current: LEARNER_LEVELS[0],
    next: LEARNER_LEVELS[1],
    percent: 0,
    xpNeeded: 50,
    progressInLevel: 0,
    range: 50,
  };
};

export function AiDailyBriefing({ onSelectTool }: { onSelectTool?: (toolId: string) => void }) {
  // Navigation & Day State (Auto-selects current day of week)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => {
    return typeof window !== "undefined" ? new Date().getDay() : 1;
  });
  const [activeTab, setActiveTab] = useState<"quiz" | "vocabulary" | "dialogue" | "grammar" | "ai_tutor">("quiz");

  // Persistent XP & Gamification State
  const [totalXp, setTotalXp] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ai_pukhtana_english_xp");
      return saved ? parseInt(saved, 10) || 0 : 0;
    }
    return 0;
  });

  const [currentStreak, setCurrentStreak] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ai_pukhtana_english_streak");
      return saved ? parseInt(saved, 10) || 0 : 0;
    }
    return 0;
  });

  const [totalCorrectCount, setTotalCorrectCount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ai_pukhtana_english_correct");
      return saved ? parseInt(saved, 10) || 0 : 0;
    }
    return 0;
  });

  // Level Up Celebration state
  const [levelUpModal, setLevelUpModal] = useState<LearnerLevelInfo | null>(null);
  const [floatingXpText, setFloatingXpText] = useState<string | null>(null);

  // Dynamic Quiz State
  const [quizPool, setQuizPool] = useState<DailyQuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [isRoundFinished, setIsRoundFinished] = useState(false);

  // Dynamic AI Questions state
  const [generatingQuestion, setGeneratingQuestion] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Audio Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  // AI Tutor Q&A state
  const [tutorQuery, setTutorQuery] = useState("");
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);
  const [tutorError, setTutorError] = useState<string | null>(null);

  // Learning Launchpad Gate State
  const [hasStarted, setHasStarted] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ai_pukhtana_english_xp", totalXp.toString());
      localStorage.setItem("ai_pukhtana_english_streak", currentStreak.toString());
      localStorage.setItem("ai_pukhtana_english_correct", totalCorrectCount.toString());
    }
  }, [totalXp, currentStreak, totalCorrectCount]);

  // Quick Prompt pills for AI Tutor
  const QUICK_PROMPTS = [
    { label: "فەرقا Since و For چییە؟", query: "فەرقا ناڤبەرا Since و For د ڕستەیێن ئینگلیزی دا چییە دگەل چەند نموونەیێن ڕۆژانە؟" },
    { label: "چەوا بەحسا کارێ خۆ بکەم؟", query: "چەوا د چاوپێکەوتنا کار دا ب شێوازەکێ ئەکادیمی و بەهێز بەحسا ئەزموونا خۆ بکەم؟" },
    { label: "ڕاستڤەکرنا ڕستەیێ", query: "ئەڤ ڕستەیە بۆ من ڕاستڤە بکە و شیکاریا خەلەتیێ ب بادینی بدە: 'I am looking forward to meet you next week.'" },
    { label: "5 پەندێن گرنگ دگەل واتا", query: "5 پەند و دەستەواژەیێن گرنگ یێن ئینگلیزی بێنە دگەل واتایا وان ب بادینی و ڕستەیێن نموونە." },
    { label: "فەرقا Make و Do", query: "کەنگی Make و کەنگی Do بکاردێت؟ جوداهیێ ب خشتە و نموونەیێن سادە شی بکەرەوە." },
  ];

  // Set default day based on today
  useEffect(() => {
    const today = new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    setSelectedDayIndex(today);
  }, []);

  const currentLesson = WEEKLY_ENGLISH_CURRICULUM[selectedDayIndex] || WEEKLY_ENGLISH_CURRICULUM[1];
  const levelInfo = useMemo(() => getLevelInfo(totalXp), [totalXp]);

  // ── Smart Shuffle Function ────────────────────────────────────────────────
  const generateShuffledRound = useCallback(() => {
    const allQuestionsMap = new Map<string, DailyQuizQuestion>();

    WEEKLY_ENGLISH_CURRICULUM.forEach((day) => {
      day.quiz.forEach((q) => allQuestionsMap.set(q.id, q));
    });
    MASTER_QUESTION_POOL.forEach((q) => allQuestionsMap.set(q.id, q));

    const pool = Array.from(allQuestionsMap.values());

    // Fisher-Yates Random Shuffle
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Pick 5 varied questions for the round
    const selectedRound = shuffled.slice(0, Math.min(5, shuffled.length));
    setQuizPool(selectedRound);
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsRoundFinished(false);
  }, []);

  // Initialize round on mount and day change
  useEffect(() => {
    generateShuffledRound();
  }, [selectedDayIndex, generateShuffledRound]);

  const currentQuestion = quizPool[currentQuizIndex] || currentLesson.quiz[0];

  // ── Speech Synthesis (Audio Pronunciation) ──────────────────────────────────
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    if (speakingText === text && isSpeaking) {
      setIsSpeaking(false);
      setSpeakingText(null);
      return;
    }

    const cleanText = text.replace(/[/\\#*`~_]/g, "").trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find((v) => v.lang.startsWith("en-US") || v.lang.startsWith("en-GB")) || voices[0];
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingText(text);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingText(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingText(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // ── Handle Quiz Option Click & Gamification Award ──────────────────────────
  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
    setIsAnswerSubmitted(true);

    if (idx === currentQuestion.correctIndex) {
      const newStreak = currentStreak + 1;
      const comboBonus = newStreak >= 3 ? 5 : 0;
      const earnedXp = 10 + comboBonus;
      const newTotalXp = totalXp + earnedXp;

      // Check for Level Up
      const oldLevel = getLevelInfo(totalXp).current.level;
      const newLevelObj = getLevelInfo(newTotalXp).current;
      if (newLevelObj.level > oldLevel) {
        setLevelUpModal(newLevelObj);
      }

      setTotalXp(newTotalXp);
      setCurrentStreak(newStreak);
      setTotalCorrectCount((prev) => prev + 1);
      setSessionScore((prev) => prev + earnedXp);
      setSessionCorrectCount((prev) => prev + 1);

      // Trigger floating XP pop
      setFloatingXpText(`+${earnedXp} XP ${comboBonus > 0 ? "🔥 (Combo!)" : "✨"}`);
      setTimeout(() => setFloatingXpText(null), 2500);
    } else {
      // Wrong answer resets streak combo
      setCurrentStreak(0);
      setFloatingXpText("❌ بەرسڤا شاش");
      setTimeout(() => setFloatingXpText(null), 2000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuizIndex < quizPool.length - 1) {
      setCurrentQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsRoundFinished(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex((prev) => prev - 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setIsRoundFinished(false);
    }
  };

  // ── Generate Infinite Dynamic AI Quiz Question ─────────────────────────────
  const handleGenerateAiQuestion = async () => {
    setGeneratingQuestion(true);
    setAiError(null);
    try {
      const response = await fetch("/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "english_quiz_generator",
          input: `Create a unique, challenging, and engaging multiple-choice English learning question for Kurdish students. Level: ${levelInfo.current.titleEn}. Theme: ${currentLesson.themeTitleEn}. Make sure options are realistic and explanation is in pure Kurdish Badini.`,
        }),
      });

      const data = await response.json();
      if (data.output) {
        const jsonMatch = data.output.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const newQ: DailyQuizQuestion = {
            id: `ai-q-${Date.now()}`,
            question: parsed.question || "Choose the correct option:",
            category: parsed.category || "Grammar",
            difficulty: parsed.difficulty || "ناڤین",
            options: parsed.options || ["Option A", "Option B", "Option C", "Option D"],
            correctIndex: typeof parsed.answer_index === "number" ? parsed.answer_index : 0,
            explanationBadini: parsed.explanation || "بەرسڤا دروست و شرۆڤەیا زانستی ب زمانێ بادینی.",
            isAiGenerated: true,
          };

          setQuizPool((prev) => [...prev, newQ]);
          setCurrentQuizIndex(quizPool.length);
          setSelectedOption(null);
          setIsAnswerSubmitted(false);
          setIsRoundFinished(false);
        } else {
          throw new Error("نەهاتە دارشتن ب شێوەیەکێ دروست.");
        }
      } else {
        throw new Error(data.error || "خەلەتیەک ڕوویدا د پەیوەندیێ دا.");
      }
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "خەلەتی د دروستکرنا پرسیارا نوو دا.");
    } finally {
      setGeneratingQuestion(false);
    }
  };

  // ── Ask AI English Tutor ───────────────────────────────────────────────────
  const handleAskTutor = async (customPrompt?: string) => {
    const q = customPrompt || tutorQuery;
    if (!q.trim()) return;

    setTutorLoading(true);
    setTutorError(null);
    setTutorResponse(null);

    try {
      const response = await fetch("/api/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "english_tutor",
          input: q,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "خەلەتیەک ڕوویدا د وەرگرتنا بەرسڤێ دا.");
      }
      setTutorResponse(data.output || "");
    } catch (err: unknown) {
      setTutorError(err instanceof Error ? err.message : "پەیوەندی سەرکەفتی نەبوو.");
    } finally {
      setTutorLoading(false);
    }
  };

  return (
    <div className="w-full relative rounded-3xl border border-border/90 bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300">
      {/* ── Level Up Celebration Modal Overlay ────────────────────────────── */}
      {levelUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in-0 duration-300">
          <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-card via-background to-secondary/30 border-2 border-primary/40 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-300">
            <button
              type="button"
              onClick={() => setLevelUpModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-secondary/80 hover:bg-secondary border border-border text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-primary/20 border-2 border-amber-500/40 flex items-center justify-center text-4xl mx-auto shadow-xl animate-bounce">
              {levelUpModal.icon}
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-black">
                <Crown className="w-4 h-4" />
                <span>پیرۆزبایی! سەرکەفتن بۆ قۆناغەکا بلندتر</span>
              </span>
              <h3 className="text-2xl font-black text-foreground">
                گەهشتیە قۆناغا {levelUpModal.level}!
              </h3>
              <p className="text-sm font-bold text-primary">
                {levelUpModal.titleKu} ({levelUpModal.titleEn})
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                دەستخۆش بۆ بەردەوامیا تە د فێربوونێ دا! خاڵێن تە زێدە بوون و پێشکەفتنا تە یا بەردەوامە.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-secondary/40 border border-border/80 text-xs font-bold text-foreground">
              کۆی پۆینتێن تە: <span className="text-primary font-black font-['Plus_Jakarta_Sans',sans-serif]">+{totalXp} XP</span>
            </div>

            <button
              type="button"
              onClick={() => setLevelUpModal(null)}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm flex items-center justify-center gap-2 hover:opacity-95 transition cursor-pointer shadow-lg"
            >
              <span>بەردەوامبە لە فێربوون</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Top Header Banner with Centered Title ─────────────────────────── */}
      <div className="border-b border-border/70 bg-gradient-to-b from-primary/10 via-secondary/40 to-background/50 pt-2 sm:pt-2.5 pb-4 sm:pb-5 px-4 sm:px-6 text-center">
        {/* Main Title Badge (Centered) */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/15 via-indigo-500/15 to-primary/15 border border-primary/30 text-primary text-xs font-black shadow-xs mb-2.5 sm:mb-3">
            <GraduationCap className="w-4 h-4" />
            <span>فێربوونا زمانی ئینگلیزی یا ڕۆژانە</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
        </div>

        {/* Days of the Week Indicator (Directly under the top badge) */}
        <div className="flex items-center justify-center gap-1 overflow-x-auto pt-1 pb-2.5 scrollbar-none max-w-full">
          {WEEKLY_ENGLISH_CURRICULUM.map((lesson) => {
            const isToday = selectedDayIndex === lesson.dayId;
            return (
              <div
                key={lesson.dayId}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-black transition-all flex flex-col items-center gap-0 shrink-0 border select-none ${
                  isToday
                    ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.03]"
                    : "bg-secondary/40 text-muted-foreground/60 border-border/50 opacity-60 cursor-default pointer-events-none"
                }`}
              >
                <span>{lesson.dayNameKu}</span>
                <span className="text-[8.5px] opacity-80 font-['Plus_Jakarta_Sans',sans-serif] font-semibold leading-none">{lesson.dayNameEn.slice(0, 3)}</span>
              </div>
            );
          })}
        </div>

        {/* Theme Title & Topic (Shown only after clicking Start Learning) */}
        {hasStarted && (
          <div className="space-y-0.5 pt-1 animate-in fade-in-0 duration-300">
            <h2 className="text-base sm:text-lg font-black text-foreground tracking-tight">
              {currentLesson.themeTitleKu}
            </h2>
            <p className="text-[11px] sm:text-xs font-semibold font-['Plus_Jakarta_Sans',sans-serif] text-muted-foreground tracking-wide" dir="ltr">
              ({currentLesson.themeTitleEn})
            </p>
          </div>
        )}

        {/* ── Segmented Navigation Tabs (Shown only after starting) ───────── */}
        {hasStarted && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mt-3 pt-2.5 border-t border-border/60 animate-in fade-in-0 duration-300">
            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              className={`py-1.5 px-2.5 rounded-xl border text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === "quiz"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background/60 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/70"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>پرسیار و تاقیکرن</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("vocabulary")}
              className={`py-1.5 px-2.5 rounded-xl border text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === "vocabulary"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background/60 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/70"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>پەیڤ و زاراڤێن نوو</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("dialogue")}
              className={`py-1.5 px-2.5 rounded-xl border text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === "dialogue"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background/60 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/70"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>ئاخافتن و دیالۆگ</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("grammar")}
              className={`py-1.5 px-2.5 rounded-xl border text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === "grammar"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background/60 hover:bg-secondary text-muted-foreground hover:text-foreground border-border/70"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>ڕێزمان و خەلەتی</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ai_tutor")}
              className={`col-span-2 sm:col-span-1 py-1.5 px-2.5 rounded-xl border text-[11px] sm:text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === "ai_tutor"
                  ? "bg-gradient-to-r from-indigo-600 to-primary text-white border-primary shadow-xs"
                  : "bg-background/60 hover:bg-secondary text-indigo-600 dark:text-indigo-400 hover:text-foreground border-border/70"
              }`}
            >
              <Bot className="w-3.5 h-3.5 shrink-0" />
              <span>مامۆستایێ ژیر (AI)</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Main Tab Content Panels ───────────────────────────────────────── */}
      <div className="p-5 sm:p-6 text-right">
        {/* ── TAB 1: DYNAMIC & CONTINUOUS QUIZ SYSTEM ─────────────────────── */}
        {activeTab === "quiz" && !hasStarted && (
          <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-primary/10 via-secondary/30 to-background border border-primary/20 text-center space-y-6 shadow-sm animate-in fade-in-50 duration-300">
            {/* Animated Icon Avatar */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-primary via-indigo-600 to-primary/80 text-white flex items-center justify-center shadow-xl shadow-primary/25 ring-4 ring-primary/20 animate-bounce-subtle">
                <GraduationCap className="w-10 h-10" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            {/* Main Header Text */}
            <div className="space-y-1.5 max-w-xl mx-auto px-2">
              <h3 className="text-base sm:text-lg md:text-xl font-black text-foreground tracking-tight">
                ئامادەی دەست ب فێربوونا زمانێ ئینگلیزی بکەی؟
              </h3>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                ڕۆژانە <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-foreground">5</span> خولەکان تەرخان بکە بۆ بهێزکرنا ئاستێ زمانێ ئینگلیزی، بەرسڤدانا پرسیارێن ژیر، و ب دەستڤەئینانا پۆینت و سەرکەفتنێن نووی.
              </p>
            </div>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-2xl mx-auto text-xs">
              {/* Badge 1: Questions (Compact) */}
              <div className="px-4 py-3 rounded-2xl bg-card border border-border/80 flex items-center justify-center gap-2 shadow-xs shrink-0">
                <Target className="w-4 h-4 text-primary shrink-0" />
                <span className="font-bold text-foreground whitespace-nowrap">پرسیارێن ئاست بەرز</span>
              </div>

              {/* Badge 2: XP Points (Compact) */}
              <div className="px-4 py-3 rounded-2xl bg-card border border-border/80 flex items-center justify-center gap-2 shadow-xs shrink-0">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-bold text-foreground whitespace-nowrap">
                  <span className="font-['Plus_Jakarta_Sans',sans-serif] font-black text-amber-500">+100</span> پۆینتێن XP
                </span>
              </div>

              {/* Badge 3: Daily Topic (Extended with clear vertical spacing between lines) */}
              <div className="px-4 py-2.5 rounded-2xl bg-card border border-border/80 flex items-center gap-3 shadow-xs text-right">
                <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="flex flex-col gap-1.5 text-right justify-center">
                  <span className="font-bold text-foreground whitespace-nowrap leading-tight">
                    {currentLesson.themeTitleKu}
                  </span>
                  <span className="text-[10.5px] font-semibold text-muted-foreground font-['Plus_Jakarta_Sans',sans-serif] leading-tight" dir="ltr">
                    ({currentLesson.themeTitleEn})
                  </span>
                </div>
              </div>
            </div>

            {/* Launch CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setHasStarted(true)}
                className="group inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-sm sm:text-base shadow-lg shadow-primary/30 hover:shadow-primary/45 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <span>دەستپێکرنا فێربوونێ</span>
                <Sparkles className="w-5 h-5 transition-transform group-hover:rotate-12" />
              </button>
            </div>
          </div>
        )}

        {activeTab === "quiz" && hasStarted && (
          <div className="space-y-4 animate-in fade-in-0 duration-200">
            {/* Error notice if AI question generation fails */}
            {aiError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {/* If round is completed */}
            {isRoundFinished ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/50 to-background border border-primary/20 text-center space-y-5 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center mx-auto shadow-lg">
                  <Trophy className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-foreground">دەستخۆش! تە ئەڤ خۆلە ب سەرکەفتیانە تەمام کر</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    تە {sessionCorrectCount} ژ {quizPool.length} پرسیاران ب دروستی بەرسڤ دان دگەل وەرگرتنا پۆینت و قۆناغان.
                  </p>
                </div>

                <div className="inline-flex items-center gap-4 p-3 px-6 rounded-2xl bg-background border border-border">
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-bold">پۆینتێن ئەڤێ خۆلێ:</span>
                    <span className="text-lg font-black text-primary font-['Plus_Jakarta_Sans',sans-serif]">
                      +{sessionScore} XP
                    </span>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-bold">ڕێژەیا سەرکەفتنێ:</span>
                    <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-['Plus_Jakarta_Sans',sans-serif]">
                      {Math.round((sessionCorrectCount / (quizPool.length || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div>
                    <span className="text-[11px] text-muted-foreground block font-bold">کۆی پۆینتێن تە:</span>
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-['Plus_Jakarta_Sans',sans-serif]">
                      {totalXp} XP
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSessionScore(0);
                      setSessionCorrectCount(0);
                      generateShuffledRound();
                    }}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center gap-2 hover:opacity-95 transition cursor-pointer shadow-md"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>خۆلەکا نوو ب پرسیارێن تێکەڵ</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateAiQuestion}
                    disabled={generatingQuestion}
                    className="px-5 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>پرسیارا نوو</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Active Question Card */
              <div className="space-y-4">
                {/* Meta Bar with Floating XP Pop */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/40 border border-border/80 rounded-2xl p-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black font-['Plus_Jakarta_Sans',sans-serif]">
                      {currentQuizIndex + 1}/{quizPool.length}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-foreground">
                          پرسیارا <span className="font-['Plus_Jakarta_Sans',sans-serif]">{currentQuizIndex + 1}</span> ژ <span className="font-['Plus_Jakarta_Sans',sans-serif]">{quizPool.length}</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-primary font-bold border border-border">
                          {currentQuestion.category}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                          {currentQuestion.difficulty}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        بەرسڤا دروست هەڵبژێرە بۆ وەرگرتنا <span className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-foreground">+10</span> پۆینت و سەرکەفتن بۆ قۆناغەکا بلندتر
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* Live Floating Reward Toast */}
                    {floatingXpText && (
                      <div className="px-3 py-1 rounded-xl bg-emerald-500 text-white text-xs font-black shadow-lg animate-bounce flex items-center gap-1">
                        <span>{floatingXpText}</span>
                      </div>
                    )}

                    <div className="text-xs font-bold text-muted-foreground font-['Plus_Jakarta_Sans',sans-serif]">
                      Score: <span className="text-primary font-black">+{totalXp} XP</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateAiQuestion}
                      disabled={generatingQuestion}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:opacity-95 text-primary-foreground text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                      title="دروستکرنا پرسیارەکا نوو"
                    >
                      {generatingQuestion ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>پرسیارا نوو</span>
                    </button>
                  </div>
                </div>

                {/* Question Box */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-secondary/40 to-background border border-border/80 space-y-4 text-left" dir="ltr">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-base sm:text-lg font-bold text-foreground leading-relaxed font-['Plus_Jakarta_Sans',sans-serif] tracking-normal text-left" dir="ltr">
                      {currentQuestion.question}
                    </p>
                    <button
                      type="button"
                      onClick={() => speakText(currentQuestion.question)}
                      className={`p-2 rounded-xl border transition cursor-pointer shrink-0 ${
                        speakingText === currentQuestion.question && isSpeaking
                          ? "bg-primary text-primary-foreground border-primary animate-pulse"
                          : "bg-secondary/80 hover:bg-secondary border-border text-muted-foreground hover:text-foreground"
                      }`}
                      title="گوهداریکرنا دەنگی"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2" dir="ltr">
                    {currentQuestion.options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === currentQuestion.correctIndex;
                      const showResult = isAnswerSubmitted;

                      let btnStyle = "bg-card hover:bg-secondary/70 border-border text-foreground";
                      if (showResult) {
                        if (isCorrect) {
                          btnStyle =
                            "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/30";
                        } else if (isSelected && !isCorrect) {
                          btnStyle =
                            "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 font-bold ring-2 ring-rose-500/30";
                        } else {
                          btnStyle = "bg-card/50 border-border/60 text-muted-foreground opacity-60";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isAnswerSubmitted}
                          onClick={() => handleSelectOption(idx)}
                          className={`p-4 rounded-xl border text-sm font-['Plus_Jakarta_Sans',sans-serif] text-left transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer ${btnStyle}`}
                          dir="ltr"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-secondary border border-border/80 flex items-center justify-center text-xs font-black text-foreground font-['Plus_Jakarta_Sans',sans-serif]">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="font-semibold text-sm leading-snug">{option}</span>
                          </div>

                          {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                          {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation & Badini Reasoning */}
                  {isAnswerSubmitted && (
                    <div className="mt-4 p-4 rounded-2xl bg-secondary/60 border border-border space-y-2 animate-in fade-in-50 duration-300 text-right" dir="rtl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedOption === currentQuestion.correctIndex ? (
                            <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                              <Check className="w-3.5 h-3.5" />
                              <span>بەرسڤا تە ڕاستە! +10 پۆینت ({totalXp} XP)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>بەرسڤا تە شاش بوو!</span>
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-bold text-muted-foreground">شرۆڤەیا زانستی</span>
                      </div>

                      <div className="p-3 rounded-xl bg-background/80 border border-border/80 text-xs text-foreground font-medium leading-relaxed">
                        <span className="font-black text-primary ml-1 block mb-1">💡 بۆچی ئەڤ بەرسڤە ڕاستە؟</span>
                        {currentQuestion.explanationBadini}
                      </div>

                      {currentQuestion.englishRule && (
                        <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-xs font-['Plus_Jakarta_Sans',sans-serif] font-medium text-primary text-left" dir="ltr">
                          <span className="font-bold block text-[10px] text-muted-foreground">Grammar Rule:</span>
                          {currentQuestion.englishRule}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Quiz Navigation Controls */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    disabled={currentQuizIndex === 0}
                    className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-40 border border-border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>پرسیارا پێشتر</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <span>{currentQuizIndex === quizPool.length - 1 ? "تەواوکردنا خۆلێ" : "پرسیارا دواتر"}</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: DAILY VOCABULARY & IDIOMS ────────────────────────────── */}
        {activeTab === "vocabulary" && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            {/* Word of the day main card */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 via-secondary/40 to-background border border-border/80 p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4 text-left" dir="ltr">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap" dir="ltr">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                        {currentLesson.vocabulary.word}
                      </h3>
                      <span className="text-xs font-medium font-['Plus_Jakarta_Sans',sans-serif] text-muted-foreground bg-secondary px-3 py-1 rounded-lg border border-border">
                        {currentLesson.vocabulary.phonetic}
                      </span>
                      <span className="text-xs font-bold font-['Plus_Jakarta_Sans',sans-serif] text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                        {currentLesson.vocabulary.partOfSpeech}
                      </span>
                    </div>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 block mt-1 text-left" dir="rtl">
                      واتا ب کوردی (بادینی): {currentLesson.vocabulary.kurdishBadini}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => speakText(currentLesson.vocabulary.word)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-black flex items-center gap-2 transition cursor-pointer self-start sm:self-auto shadow-xs shrink-0 ${
                    speakingText === currentLesson.vocabulary.word && isSpeaking
                      ? "bg-indigo-600 text-white border-indigo-600 animate-pulse"
                      : "bg-secondary hover:bg-secondary/80 border-border text-foreground"
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>گوهداریکرنا دەنگی</span>
                </button>
              </div>

              {/* Definition */}
              <div className="p-4 rounded-xl bg-background/80 border border-border/80 space-y-1 text-left" dir="ltr">
                <span className="text-[11px] font-['Plus_Jakarta_Sans',sans-serif] uppercase tracking-wider text-muted-foreground block font-bold">
                  English Definition:
                </span>
                <p className="text-sm font-medium text-foreground leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                  {currentLesson.vocabulary.englishDefinition}
                </p>
              </div>

              {/* Example Sentences */}
              <div className="space-y-3 pt-1">
                <span className="text-xs font-black text-foreground block">
                  نموونەیێن بکارهێنانێ د ڕستەیێن ڕۆژانەدا (Example Sentences):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3" dir="ltr">
                  {currentLesson.vocabulary.examples.map((ex, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-secondary/40 border border-border/80 space-y-2 text-left" dir="ltr">
                      <div className="flex items-start justify-between gap-2" dir="ltr">
                        <p className="text-sm font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-foreground leading-relaxed text-left">
                          "{ex.en}"
                        </p>
                        <button
                          type="button"
                          onClick={() => speakText(ex.en)}
                          className="p-1.5 rounded-lg bg-background hover:bg-secondary border border-border text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                          title="گوهداریکرن"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground border-t border-border/50 pt-2 leading-relaxed text-right" dir="rtl">
                        واتا: {ex.ku}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synonyms, Antonyms & Usage Tip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-background/70 border border-border/70 text-left" dir="ltr">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                    هاوواتا (Synonyms):
                  </span>
                  <div className="flex flex-wrap gap-1.5" dir="ltr">
                    {currentLesson.vocabulary.synonyms.map((s, i) => (
                      <span key={i} className="text-xs font-['Plus_Jakarta_Sans',sans-serif] font-semibold bg-secondary px-2.5 py-1 rounded-md border border-border">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-background/70 border border-border/70 text-left" dir="ltr">
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block mb-1">
                    دژواتا (Antonyms):
                  </span>
                  <div className="flex flex-wrap gap-1.5" dir="ltr">
                    {currentLesson.vocabulary.antonyms.map((a, i) => (
                      <span key={i} className="text-xs font-['Plus_Jakarta_Sans',sans-serif] font-semibold bg-secondary px-2.5 py-1 rounded-md border border-border">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-background/70 border border-border/70">
                  <span className="text-[11px] font-bold text-primary block mb-1">تێبینیا فێرکاریێ:</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {currentLesson.vocabulary.usageTipBadini}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: DAILY CONVERSATION & SITUATIONAL DIALOGUES ─────────────── */}
        {activeTab === "dialogue" && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            {/* Scenario Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-secondary/40 border border-border/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-foreground">{currentLesson.dialogue.titleKu}</h3>
                  <span className="text-xs font-['Plus_Jakarta_Sans',sans-serif] font-medium text-muted-foreground">
                    Scenario: {currentLesson.dialogue.titleEn}
                  </span>
                </div>
              </div>

              <span className="text-xs px-3 py-1 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-bold self-start sm:self-auto">
                {currentLesson.dialogue.scenarioBadini}
              </span>
            </div>

            {/* Chat Bubble Thread */}
            <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl bg-background/80 border border-border/80 text-left" dir="ltr">
              {currentLesson.dialogue.lines.map((line, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    idx % 2 === 0
                      ? "bg-secondary/30 border-border/70 mr-0 ml-4 sm:ml-12"
                      : "bg-primary/5 border-primary/20 ml-0 mr-4 sm:mr-12"
                  }`}
                  dir="ltr"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 mb-2" dir="ltr">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${line.avatarColor} text-white flex items-center justify-center text-[10px] font-black`}>
                        {line.speaker[0]}
                      </div>
                      <span className="text-xs font-black text-foreground font-['Plus_Jakarta_Sans',sans-serif]">{line.speaker}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => speakText(line.textEn)}
                      className="px-2 py-1 rounded-lg bg-background hover:bg-secondary border border-border text-[11px] font-bold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>گوهدان</span>
                    </button>
                  </div>

                  <div className="space-y-1 text-left" dir="ltr">
                    <p className="text-sm font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-foreground leading-relaxed text-left">
                      {line.textEn}
                    </p>
                    <p className="text-xs text-muted-foreground pt-1 border-t border-border/40 text-right leading-relaxed" dir="rtl">
                      {line.textKu}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Golden Phrases Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-secondary/40 to-transparent border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black text-foreground">دەستەواژەیێن زێڕین د ئەڤێ گفتوگۆیێ دا (Golden Phrases):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="ltr">
                {currentLesson.dialogue.goldenPhrases.map((phrase, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-background/90 border border-border/80 space-y-1 text-left" dir="ltr">
                    <div className="flex items-center justify-between" dir="ltr">
                      <span className="text-xs font-['Plus_Jakarta_Sans',sans-serif] font-bold text-primary">{phrase.phrase}</span>
                      <button
                        type="button"
                        onClick={() => speakText(phrase.phrase)}
                        className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs font-bold text-foreground block text-right" dir="rtl">واتا: {phrase.meaningKu}</span>
                    <p className="text-[11px] text-muted-foreground text-right" dir="rtl">{phrase.usageNote}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: GRAMMAR RULES & RIGHT VS WRONG MISTAKES ──────────────── */}
        {activeTab === "grammar" && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            {/* Grammar Overview Header */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-secondary/50 to-background border border-border/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-foreground">{currentLesson.grammar.titleKu}</h3>
                    <span className="text-xs font-['Plus_Jakarta_Sans',sans-serif] font-medium text-muted-foreground">
                      Grammar Rule: {currentLesson.grammar.titleEn}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-background/80 border border-border/80 text-xs leading-relaxed text-foreground font-medium whitespace-pre-line">
                {currentLesson.grammar.ruleSummaryBadini}
              </div>

              {/* Grammar Formula */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs font-['Plus_Jakarta_Sans',sans-serif] font-bold text-purple-700 dark:text-purple-300 text-left" dir="ltr">
                <span className="text-[10px] text-muted-foreground block font-sans">یاسایا داڕشتنێ (Formula):</span>
                {currentLesson.grammar.formula}
              </div>
            </div>

            {/* Right vs Wrong Comparisons */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black text-foreground">
                  خەلەتیێن بەربەلاڤ د ناڤبەرا کوردی و ئینگلیزیێ دا (Common Kurdish Mistakes):
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" dir="ltr">
                {currentLesson.grammar.mistakes.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-secondary/30 border border-border/80 space-y-3 text-left" dir="ltr">
                    <div className="space-y-2" dir="ltr">
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between" dir="ltr">
                        <span className="text-xs font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-rose-600 dark:text-rose-400 text-left">
                          ❌ {m.wrong}
                        </span>
                        <span className="text-[10px] bg-rose-500/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                          Wrong
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between" dir="ltr">
                        <span className="text-xs font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-emerald-600 dark:text-emerald-400 text-left">
                          ✅ {m.right}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => speakText(m.right)}
                            className="p-1 rounded bg-background text-emerald-600 cursor-pointer"
                            title="گوهداریکرن"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                            Correct
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 text-xs text-muted-foreground leading-relaxed text-right" dir="rtl">
                      <span className="font-bold text-foreground block mb-0.5">بۆچی خەلەتە؟</span>
                      {m.explanationBadini}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Grammar Hack Tip */}
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-black text-primary block">تێبینی و ڕێسایا زێڕین (Quick Tip):</span>
                <p className="text-xs text-foreground/90 font-medium leading-relaxed mt-0.5">
                  {currentLesson.grammar.quickTipBadini}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: INTERACTIVE AI ENGLISH TUTOR ─────────────────────────── */}
        {activeTab === "ai_tutor" && (
          <div className="space-y-5 animate-in fade-in-0 duration-200">
            {/* Tutor Introduction */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-600/10 via-primary/10 to-transparent border border-primary/20 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">مامۆستایێ ژیرێ ئینگلیزی (AI English Tutor)</h3>
                  <p className="text-xs text-muted-foreground">
                    هەر پرسیارەکا تە دەربارەی ڕێزمان، پەیڤ، وەرگێڕان، ڕاستڤەکرنا ڕستەیان یان گفتوگۆیێ هەبیت بپرسە
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Prompts Suggestions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground block">پرسیارێن پێشنیارکری بۆ فێربوونێ:</span>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTutorQuery(p.query);
                      handleAskTutor(p.query);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-bold transition cursor-pointer hover:border-primary"
                  >
                    💡 {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Box */}
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  value={tutorQuery}
                  onChange={(e) => setTutorQuery(e.target.value)}
                  placeholder="پرسیارا خۆ دەربارەی زمانی ئینگلیزی بنڤیسە... (نموونە: جوداهیا ناڤبەرا In و At د دەمی دا چیە؟)"
                  rows={3}
                  className="w-full p-4 rounded-2xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none transition shadow-xs"
                />

                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={() => handleAskTutor()}
                    disabled={tutorLoading || !tutorQuery.trim()}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs flex items-center gap-2 hover:opacity-95 disabled:opacity-50 transition cursor-pointer shadow-md"
                  >
                    {tutorLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>یێ بەرسڤێ دروست دکەت...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>پرسیارێ بپڕسە</span>
                      </>
                    )}
                  </button>

                  {tutorResponse && (
                    <button
                      type="button"
                      onClick={() => setTutorResponse(null)}
                      className="text-xs text-muted-foreground hover:text-foreground font-bold cursor-pointer"
                    >
                      پاقژکرنەوە
                    </button>
                  )}
                </div>
              </div>

              {/* Error Box */}
              {tutorError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{tutorError}</span>
                </div>
              )}

              {/* AI Response Display */}
              {tutorResponse && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-secondary/50 via-background to-secondary/30 border border-border/90 space-y-3 animate-in fade-in-50 duration-300">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-xs font-black text-foreground">بەرسڤا مامۆستایێ ژیر ب بادینی:</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => speakText(tutorResponse)}
                      className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-primary" />
                      <span>گوهدان ب دەنگی</span>
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                    {tutorResponse}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM GAMIFICATION & LEVEL PROGRESSION BAR (All in English) ── */}
      <div className="border-t border-border/80 bg-gradient-to-r from-secondary/60 via-card to-secondary/40 p-4 sm:p-5 text-left font-['Plus_Jakarta_Sans',sans-serif]" dir="ltr">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Level Info & Rank */}
          <div className="flex items-center gap-3.5 shrink-0 text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/20 via-primary/10 to-indigo-500/20 border border-primary/30 flex items-center justify-center text-2xl shadow-md">
              {levelInfo.current.icon}
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-foreground">
                  Level {levelInfo.current.level}: {levelInfo.current.titleEn}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold border border-primary/20">
                  Tier {levelInfo.current.level}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground text-left">
                <span>Total XP: <strong className="text-foreground font-black">{totalXp} XP</strong></span>
                <span>•</span>
                <span>Correct: <strong className="text-foreground font-black">{totalCorrectCount}</strong></span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar to Next Level */}
          <div className="flex-1 max-w-lg space-y-1.5 text-left">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-muted-foreground flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-primary" />
                <span>Progress to Next Level:</span>
              </span>

              <span className="text-primary font-black">
                {levelInfo.next ? (
                  <>
                    {levelInfo.progressInLevel} / {levelInfo.range} XP ({levelInfo.percent}%)
                  </>
                ) : (
                  "Master Tier Reached! 👑"
                )}
              </span>
            </div>

            {/* Glowing Gradient Bar */}
            <div className="w-full h-3 rounded-full bg-secondary/80 border border-border/80 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-500 to-emerald-400 transition-all duration-500 shadow-sm relative"
                style={{ width: `${Math.min(levelInfo.percent, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{levelInfo.current.minXp} XP</span>
              {levelInfo.next ? (
                <span className="font-bold text-foreground">
                  Only {levelInfo.xpNeeded} XP needed for Level {levelInfo.next.level} ({levelInfo.next.titleEn})
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Maximum Learning Rank!</span>
              )}
              <span>{levelInfo.current.maxXp} XP</span>
            </div>
          </div>

          {/* Streak & Achievements Highlights */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500" />
              <div className="text-left">
                <span className="text-[10px] block font-bold text-muted-foreground leading-none">Streak Combo</span>
                <span className="text-xs font-black leading-tight">
                  {currentStreak} Correct {currentStreak >= 3 && "🔥 x2 Bonus"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
