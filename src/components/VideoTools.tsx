import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Brain,
  Video,
  Zap,
  Sliders,
  Wifi,
  Check,
  X,
  Volume2,
  Tv,
  List,
  AlertCircle,
  RotateCcw,
  Download,
} from "lucide-react";
import { VideoDownloader } from "./VideoDownloader";

interface Props {
  defaultTab?: "downloader" | "quiz" | "chapter" | "adaptive";
}

export function VideoTools({ defaultTab = "downloader" }: Props) {
  const [activeTab, setActiveTab] = useState<"downloader" | "quiz" | "chapter" | "adaptive">(defaultTab);

  // --- Quiz Simulation States ---
  const [quizPlaying, setQuizPlaying] = useState(false);
  const [quizTime, setQuizTime] = useState(0); // in seconds
  const [quizTriggered, setQuizTriggered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSuccess, setQuizSuccess] = useState(false);
  const [quizError, setQuizError] = useState(false);
  const quizTimerRef = useRef<number | null>(null);

  // --- Chaptering States ---
  const [activeChapter, setActiveChapter] = useState(0);
  const [chapterTime, setChapterTime] = useState(0);
  const [chapterPlaying, setChapterPlaying] = useState(false);
  const chapterTimerRef = useRef<number | null>(null);

  // --- Adaptive Quality States ---
  const [networkSpeed, setNetworkSpeed] = useState<"slow" | "medium" | "fast">("fast");
  const [adaptivePlaying, setAdaptivePlaying] = useState(true);
  const [adaptiveTime, setAdaptiveTime] = useState(12); // start somewhere
  const adaptiveTimerRef = useRef<number | null>(null);

  const chaptersData = [
    {
      title: "پێشەکی و چەمکێن دەستپێکێ (Intro)",
      timeStart: 0,
      timeEnd: 80,
      summary: "پێشەکیەکا گشتی ل سەر بابەتێ وانەیێ و دیارکرنا خالێن سەرەکی یێن کو مامۆستا دێ بەحس کەت د وانەیێ دا.",
      slideText: "💡 Introduction to the Lecture",
    },
    {
      title: "دابەشکرنا زیرەکا بابەتان (AI Analysis)",
      timeStart: 80,
      timeEnd: 240,
      summary: "چەوانیا بکارئینانا زیرەکیا دەستکرد بۆ دابەشکرنا ڤیدیۆیا درێژ بۆ پشکێن بچووک و چەوانیا کارپێکرنا بابەتان.",
      slideText: "🤖 Topic Segmentation & Chaptering",
    },
    {
      title: "نڤیسینا کورتەیێن هوشمەند (Chapter Summaries)",
      timeStart: 240,
      timeEnd: 420,
      summary: "دروستکرنا کورتەیێن سەرنجڕاکێش و بەرهەڤکرنا خالێن سەرەکی یێن هەر بەشەکی ب شێوازەکێ ئۆتۆماتیکی.",
      slideText: "📝 Smart Chapter Summarization",
    },
    {
      title: "پوختەیا دوماهیێ و پرسیار (Q&A Wrap)",
      timeStart: 420,
      timeEnd: 600,
      summary: "کۆمکرن و پێداچوونا هەمی بابەتان و بەرسڤدانا پسیارێن گرنگ یێن قوتابیان یێن د مێشکێ وان دا.",
      slideText: "🏁 Conclusion & Final Q&A",
    },
  ];

  // Quiz Timer Effect
  useEffect(() => {
    if (quizPlaying) {
      quizTimerRef.current = window.setInterval(() => {
        setQuizTime((prev) => {
          if (prev >= 4) {
            // Trigger quiz at 5 seconds
            setQuizPlaying(false);
            setQuizTriggered(true);
            if (quizTimerRef.current) clearInterval(quizTimerRef.current);
            return 5;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    }
    return () => {
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, [quizPlaying]);

  // Chapter Timer Effect
  useEffect(() => {
    if (chapterPlaying) {
      chapterTimerRef.current = window.setInterval(() => {
        setChapterTime((prev) => {
          const currentChap = chaptersData[activeChapter];
          if (prev >= currentChap.timeEnd) {
            // go to next chapter if exists
            if (activeChapter < chaptersData.length - 1) {
              setActiveChapter((c) => c + 1);
              return chaptersData[activeChapter + 1].timeStart;
            } else {
              setChapterPlaying(false);
              if (chapterTimerRef.current) clearInterval(chapterTimerRef.current);
              return currentChap.timeEnd;
            }
          }
          return prev + 2; // speed up simulation a bit
        });
      }, 500);
    } else {
      if (chapterTimerRef.current) clearInterval(chapterTimerRef.current);
    }
    return () => {
      if (chapterTimerRef.current) clearInterval(chapterTimerRef.current);
    };
  }, [chapterPlaying, activeChapter]);

  // Adaptive Playback Simulation
  useEffect(() => {
    if (adaptivePlaying) {
      adaptiveTimerRef.current = window.setInterval(() => {
        setAdaptiveTime((prev) => (prev >= 120 ? 0 : prev + 1));
      }, 1000);
    } else {
      if (adaptiveTimerRef.current) clearInterval(adaptiveTimerRef.current);
    }
    return () => {
      if (adaptiveTimerRef.current) clearInterval(adaptiveTimerRef.current);
    };
  }, [adaptivePlaying]);

  const handleQuizAnswer = (optionIdx: number) => {
    setSelectedAnswer(optionIdx);
    if (optionIdx === 2) {
      // Option C is index 2, which is correct
      setQuizSuccess(true);
      setQuizError(false);
    } else {
      setQuizSuccess(false);
      setQuizError(true);
    }
  };

  const resumeQuizVideo = () => {
    setQuizTriggered(false);
    setSelectedAnswer(null);
    setQuizSuccess(false);
    setQuizError(false);
    setQuizTime(6); // advance past the quiz timestamp
    setQuizPlaying(true);
  };

  const restartQuizVideo = () => {
    setQuizTime(0);
    setQuizTriggered(false);
    setSelectedAnswer(null);
    setQuizSuccess(false);
    setQuizError(false);
    setQuizPlaying(true);
  };

  const handleChapterClick = (idx: number) => {
    setActiveChapter(idx);
    setChapterTime(chaptersData[idx].timeStart);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Adaptive Bitrate Specs
  const getAdaptiveDetails = () => {
    switch (networkSpeed) {
      case "slow":
        return {
          bitrate: "320 Kbps",
          resolution: "360p",
          latency: "280ms",
          bufferHealth: "باشە (جێگیر)",
          colorClass: "text-amber-500",
          speedLabel: "ئینتەرنێتێ لاواز (3G / لادێ)",
        };
      case "medium":
        return {
          bitrate: "1.8 Mbps",
          resolution: "720p HD",
          latency: "45ms",
          bufferHealth: "گەلەک باشە",
          colorClass: "text-blue-500",
          speedLabel: "ئینتەرنێتێ مامناوەند (4G LTE)",
        };
      case "fast":
      default:
        return {
          bitrate: "12.5 Mbps",
          resolution: "1080p Full HD",
          latency: "12ms",
          bufferHealth: "تەژی (Perfect)",
          colorClass: "text-emerald-500",
          speedLabel: "ئینتەرنێتێ خێرا (5G / فایبەر)",
        };
    }
  };

  const adaptiveDetails = getAdaptiveDetails();

  return (
    <div
      className="rounded-2xl bg-card border border-border p-6 md:p-8"
      style={{ boxShadow: "var(--shadow-elegant)" }}
    >
      {/* Section Header */}
      <div className="mb-8 text-right">
        <div className="flex items-center justify-end gap-3 mb-2">
          <h3 className="text-2xl font-extrabold text-foreground">
            خزمەتگوزاریێن پێشکەفتی یێن میدیا و ڤیدیۆیێ
          </h3>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-primary-foreground shrink-0"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Video className="w-6 h-6" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          ئەزموونا فێربوونێ ب تەکنەلۆژیا میدیا یا پێشکەفتی برە ئاستەکێ جیهانی یێ بێ وێنە
        </p>
      </div>

      {/* Custom Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-secondary/50 rounded-2xl mb-8" dir="rtl">
        <button
          onClick={() => setActiveTab("downloader")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 ${
            activeTab === "downloader"
              ? "bg-card text-foreground shadow-md border border-border/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Download className={`w-4 h-4 ${activeTab === "downloader" ? "text-primary" : ""}`} />
          <span>داگرتنا ڤیدیۆیان</span>
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 ${
            activeTab === "quiz"
              ? "bg-card text-foreground shadow-md border border-border/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Brain className={`w-4 h-4 ${activeTab === "quiz" ? "text-primary" : ""}`} />
          <span>پشکنینا ڤیدیۆیێ</span>
        </button>

        <button
          onClick={() => setActiveTab("chapter")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 ${
            activeTab === "chapter"
              ? "bg-card text-foreground shadow-md border border-border/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Tv className={`w-4 h-4 ${activeTab === "chapter" ? "text-primary" : ""}`} />
          <span>کورتکرنا ب AI</span>
        </button>

        <button
          onClick={() => setActiveTab("adaptive")}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 ${
            activeTab === "adaptive"
              ? "bg-card text-foreground shadow-md border border-border/40"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className={`w-4 h-4 ${activeTab === "adaptive" ? "text-primary" : ""}`} />
          <span>پەخوشکرنا داینامیکی</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {/* --- 0. Video Downloader Tab --- */}
        {activeTab === "downloader" && <VideoDownloader />}
        {/* --- 1. Interactive Video Quizzes Tab --- */}
        {activeTab === "quiz" && (
          <div className="space-y-6 text-right" dir="rtl">
            {/* Kurdish Info Card */}
            <div className="rounded-2xl bg-secondary/30 p-5 border border-border/60">
              <h4 className="font-extrabold text-base mb-2 flex items-center gap-2">
                <span>1️⃣ پشکینینا ناڤا ڤیدیۆیێ (Interactive Video Quizzes)</span>
                <span className="text-xl">🧠</span>
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ئیدی ڤیدیۆ بتنێ بۆ تەماشەکرنێ نینە! دەمێ قوتابی سەیری وانەیەکێ دکەت، ڤیدیۆ ل خولەکەکا
                دیارکری و گرنگ ڕادوەستیت و پرسیارەک ڕاستەوخۆ ل سەر شاشەیێ دیار دبیت. قوتابی نەشێت بەردەوام
                بیت و ڤیدیۆیێ لێ بدەت لایێ دی هەتا بەرسڤێ نەدەت! ئەڤە هشیاریا قوتابی د ناڤ پۆلێ دا سەد
                د سەد پشتڕاست دکەت.
              </p>
            </div>

            {/* Video Player Simulator */}
            <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between">
              {/* Animated Blackboard / Slide Content */}
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none relative">
                {/* Background grid representation */}
                <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

                {quizPlaying ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-2">
                      <Tv className="w-8 h-8 text-primary" />
                    </div>
                    <h5 className="text-slate-100 font-extrabold text-lg sm:text-2xl">
                      وانە: بنەما و چەمکێن زیرەکیا دەستکرد
                    </h5>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
                      مامۆستا ل سەر تەختەی شیکاریا پێشکەفتنا سیستەمێن فێربوونا مەکینێ دکەت...
                    </p>
                    {/* Simulated Waveform Animation */}
                    <div className="flex justify-center items-center gap-1.5 h-8 mt-4">
                      {[0.6, 0.9, 0.4, 0.85, 0.5, 0.95, 0.7, 0.4, 0.8, 0.5].map((h, i) => (
                        <span
                          key={i}
                          className="w-1 bg-primary rounded-full transition-all duration-300"
                          style={{
                            height: `${h * 100}%`,
                            animation: `pulse-waveform 1.2s infinite ease-in-out alternate`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : quizTriggered ? (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-10">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-lg w-full text-right shadow-2xl animate-[scaleUp_0.3s_ease-out]">
                      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> پرسیارا ناڤا ڤیدیۆیێ
                        </span>
                        <h6 className="font-extrabold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                          <Brain className="w-4 h-4 text-primary" /> پشکنینا هشیاریێ
                        </h6>
                      </div>

                      <p className="text-xs sm:text-sm font-bold text-slate-200 mb-4 leading-relaxed">
                        پسیار: ڕێژا هشیاریا قوتابی چەند د ناڤ پۆلێ دا پشتڕاست دبیت ب ڕێکا بەرسڤدانا ڤان
                        پرسیارێن ناڤا ڤیدیۆیێ؟
                      </p>

                      <div className="space-y-2">
                        {[
                          "A. پتر ژ %50 ژ دەمێ وانەیێ",
                          "B. نێزیکی %80 ژ قوتابیان",
                          "C. %100 (سەد د سەد) پشتڕاست دکەت",
                        ].map((option, idx) => {
                          let btnClass = "border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300";
                          if (selectedAnswer === idx) {
                            if (idx === 2) {
                              btnClass = "border-emerald-500/50 bg-emerald-950/20 text-emerald-400";
                            } else {
                              btnClass = "border-rose-500/50 bg-rose-950/20 text-rose-400";
                            }
                          }
                          return (
                            <button
                              key={idx}
                              onClick={() => handleQuizAnswer(idx)}
                              disabled={quizSuccess}
                              className={`w-full text-right rounded-xl border p-3 text-xs sm:text-sm font-bold transition flex items-center justify-between gap-2 ${btnClass}`}
                            >
                              <span className="flex-1 text-right">{option}</span>
                              {selectedAnswer === idx &&
                                (idx === 2 ? (
                                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                                ))}
                            </button>
                          );
                        })}
                      </div>

                      {/* Result Alerts */}
                      {quizSuccess && (
                        <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs font-bold text-emerald-400 flex items-center gap-2">
                          <Check className="w-4 h-4 shrink-0" />
                          <span>بەرسڤا تە یا ڕاستە! 🎉 نوکە دشێی بەردەوام بی ل سەر تەماشەکرنێ.</span>
                        </div>
                      )}
                      {quizError && (
                        <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs font-bold text-rose-400 flex items-center gap-2">
                          <X className="w-4 h-4 shrink-0" />
                          <span>بەرسڤا تە خەلەتە! دووبارە هەوڵ بدە بۆ بەردەوامبوونێ.</span>
                        </div>
                      )}

                      {/* Unlock Action Button */}
                      {quizSuccess && (
                        <button
                          onClick={resumeQuizVideo}
                          className="mt-4 w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-xs sm:text-sm font-bold hover:opacity-95 transition shadow-lg"
                        >
                          بەردەوام بە دگەل وانەیێ
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => setQuizPlaying(true)}
                      className="w-16 h-16 rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition flex items-center justify-center shadow-lg mx-auto"
                    >
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </button>
                    <h5 className="text-slate-100 font-extrabold text-base sm:text-lg">
                      دەستپێبکە بۆ تەماشەکرنا چەوانیا کارکرنا پشکنینی
                    </h5>
                    <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
                      ڤیدیۆ دێ ل چرکەیا 5 ڕاوەستیت بۆ ئەنجامدانا پشکنینا هشیاریێ ب شێوەیەکێ نەچاری.
                    </p>
                  </div>
                )}
              </div>

              {/* Player Control Bar */}
              <div className="bg-slate-900/90 border-t border-slate-800/80 px-4 py-3 flex items-center justify-between gap-4 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-3">
                  {quizPlaying ? (
                    <button onClick={() => setQuizPlaying(false)} className="hover:text-slate-200">
                      <Pause className="w-4 h-4 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={quizTime >= 10 ? restartQuizVideo : () => setQuizPlaying(true)}
                      disabled={quizTriggered}
                      className="hover:text-slate-200 disabled:opacity-30"
                    >
                      {quizTime >= 10 ? (
                        <RotateCcw className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
                  )}
                  <span>
                    {formatTime(quizTime)} / {formatTime(10)}
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                  <div
                    className="absolute top-0 right-0 h-full bg-primary transition-all duration-300"
                    style={{ width: `${(quizTime / 10) * 100}%` }}
                  />
                  {/* Lock Indicator dot on the timeline at 5s */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-amber-500 border border-slate-950 z-20"
                    style={{ right: "50%" }}
                    title="پشکنینا هشیاریێ ل ڤێرێ"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-sans">
                    1080p
                  </span>
                  <Volume2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 2. Video AI Chaptering Tab --- */}
        {activeTab === "chapter" && (
          <div className="space-y-6 text-right" dir="rtl">
            {/* Kurdish Info Card */}
            <div className="rounded-2xl bg-secondary/30 p-5 border border-border/60">
              <h4 className="font-extrabold text-base mb-2 flex items-center gap-2">
                <span>2️⃣ کورتکرنا ئۆتۆماتیکی ب زیرەکیا دەستکرد (Video AI Chaptering)</span>
                <span className="text-xl">🤖</span>
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                پێدڤی ناکەت قوتابی کاتژمێران بگەڕیت بۆ دۆزینەوەیا بەشەکێ بچووک! سیستەمێ مە یێ هۆشمەند ب
                شێوازەکێ ئۆتۆماتیکی ڤیدیۆیێن درێژ یێن وانەیان دابەش دکەتە سەر پشک و تاقمێن بچووک (Chapters)
                ل سەر بنەمایێ ناڤەڕۆکا ئاخفتنا مامۆستای، دگەل نڤیسینا کورتەیەکا هوشمانە بۆ هەر پشکەکێ. ل
                کویرێ پێدڤی بیت، د دۆ چرکەیدا ل وێرێ بە!
              </p>
            </div>

            {/* Split Screen Simulator (Player left, chapters right) */}
            <div className="grid md:grid-cols-5 gap-4">
              {/* Left Column: Player Screen & AI Summary Detail (3/5 width) */}
              <div className="md:col-span-3 flex flex-col gap-4">
                <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between">
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none relative">
                    <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />

                    {/* Teacher Slide Mockup */}
                    <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-5 w-full max-w-sm z-10 backdrop-blur shadow-lg">
                      <div className="flex items-center gap-1.5 text-xs text-primary mb-2 font-mono">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span>AI Video Chaptering Demo</span>
                      </div>
                      <h5 className="text-slate-100 font-extrabold text-sm sm:text-base mb-3">
                        {chaptersData[activeChapter].slideText}
                      </h5>
                      <div className="h-0.5 w-12 bg-primary/40 mx-auto mb-3" />
                      <p className="text-slate-400 text-[10px] sm:text-xs leading-relaxed">
                        نەخشە و کورتەیێن پەیوەندیدار ل دۆر ڤێ پشکێ یێن ب ڕێکا زیرەکیا دەستکرد هاتینە کورتکرن
                        ل ڤێرێ دهێنە نیشاندان.
                      </p>
                    </div>
                  </div>

                  {/* Player controls */}
                  <div className="bg-slate-900/90 border-t border-slate-800/80 px-4 py-3 flex items-center justify-between gap-4 text-xs font-mono text-slate-400">
                    <button
                      onClick={() => setChapterPlaying((p) => !p)}
                      className="hover:text-slate-200"
                    >
                      {chapterPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
                    <span className="text-[10px]">
                      {formatTime(chapterTime)} / {formatTime(600)}
                    </span>
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden relative">
                      <div
                        className="absolute top-0 right-0 h-full bg-primary transition-all duration-300"
                        style={{ width: `${(chapterTime / 600) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1 rounded">
                      Chapter {activeChapter + 1}
                    </span>
                  </div>
                </div>

                {/* Selected Chapter AI Summary Card */}
                <div
                  className="rounded-2xl border border-border bg-card p-5 text-right"
                  style={{ boxShadow: "var(--shadow-elegant)" }}
                >
                  <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                      {formatTime(chaptersData[activeChapter].timeStart)} -{" "}
                      {formatTime(chaptersData[activeChapter].timeEnd)}
                    </span>
                    <h5 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" /> کورتەیا هوشمەند یا پشکێ (AI Summary)
                    </h5>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {chaptersData[activeChapter].summary}
                  </p>
                </div>
              </div>

              {/* Right Column: Chapters Sidebar (2/5 width) */}
              <div className="md:col-span-2 flex flex-col gap-2">
                <span className="text-xs font-bold text-muted-foreground px-1 mb-1 block">
                  لیستا پشکێن ڤیدیۆیێ (Chapters List)
                </span>
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {chaptersData.map((chap, i) => {
                    const isActive = activeChapter === i;
                    return (
                      <button
                        key={i}
                        onClick={() => handleChapterClick(i)}
                        className={`w-full text-right rounded-xl border p-3.5 transition-all text-xs flex flex-col gap-1.5 ${
                          isActive
                            ? "border-primary bg-primary/5 text-foreground shadow-sm"
                            : "border-border bg-card hover:bg-secondary/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full font-bold">
                          <span className={`font-mono text-[10px] ${isActive ? "text-primary" : ""}`}>
                            {formatTime(chap.timeStart)}
                          </span>
                          <span className="text-foreground truncate">{chap.title}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed truncate-3-lines text-right w-full">
                          {chap.summary}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. Adaptive Bitrate Streaming Tab --- */}
        {activeTab === "adaptive" && (
          <div className="space-y-6 text-right" dir="rtl">
            {/* Kurdish Info Card */}
            <div className="rounded-2xl bg-secondary/30 p-5 border border-border/60">
              <h4 className="font-extrabold text-base mb-2 flex items-center gap-2">
                <span>3️⃣ گۆهرینا جۆری یا داینامیکی (Adaptive Bitrate Streaming)</span>
                <span className="text-xl">⚡</span>
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                خۆداحافیزیێ دگەل ڕاوەستیان و چاوەڕێکرنا ڤیدیۆیێ بکە! سیستەمێ پەخشکرنا ڤیدیۆیا مە
                (Player) ڕاستەوخۆ خۆ دگەل هێزا ئینتەرنێتا قوتابی دگونجینیت (رێک وەک یوتیوبێ). ئەگەر
                ئینتەرنێت لاواز ژی ببیت، جۆریا ڤیدیۆیێ (Quality) کەم و زیاد دبیت بەلێ وانە چ جاران ڕانەوستیت!
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-start">
              {/* Left Column: Player Screen Simulator (2/3 width) */}
              <div className="md:col-span-2 space-y-4">
                <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between">
                  {/* Stream Visual Representation */}
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none relative">
                    <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px]" />

                    {/* Simulated Player Render Quality */}
                    <div className="space-y-2 z-10 transition-all duration-300">
                      {/* We simulate blur or sharpness based on bitrate quality */}
                      <div
                        className={`w-28 h-20 bg-slate-800/80 rounded-lg mx-auto flex items-center justify-center border border-slate-700/60 shadow-lg text-slate-300 transition-all duration-500 ${
                          networkSpeed === "slow"
                            ? "blur-[2.5px] scale-95"
                            : networkSpeed === "medium"
                              ? "blur-[0.8px]"
                              : "blur-0"
                        }`}
                      >
                        <span className="font-extrabold text-xs">LECTURE SLIDE</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold block">
                        جۆریا نیشاندانێ (Render Quality)
                      </span>
                    </div>

                    {/* Floating Quality Overlay Badge */}
                    <div className="absolute top-3 left-3 bg-slate-900/90 border border-slate-800 px-2 py-1 rounded-lg text-[10px] font-bold text-slate-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>پەخشکرنا بەردەوام (Smooth)</span>
                    </div>

                    {/* Quality badge indicator on screen */}
                    <div className="absolute bottom-12 left-3 bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded text-[10px] font-bold">
                      {adaptiveDetails.resolution}
                    </div>
                  </div>

                  {/* Adaptive Control bar */}
                  <div className="bg-slate-900/90 border-t border-slate-800/80 px-4 py-3 flex items-center justify-between gap-4 text-xs font-mono text-slate-400">
                    <button
                      onClick={() => setAdaptivePlaying((p) => !p)}
                      className="hover:text-slate-200"
                    >
                      {adaptivePlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
                    <span>
                      {formatTime(adaptiveTime)} / {formatTime(120)}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
                      <div
                        className="absolute top-0 right-0 h-full bg-primary transition-all duration-300"
                        style={{ width: `${(adaptiveTime / 120) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-300 font-bold px-1.5 py-0.5 rounded bg-slate-800 flex items-center gap-1 font-sans">
                        <Wifi className="w-3 h-3 text-emerald-400" />
                        {adaptiveDetails.resolution}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Speed Control Panel & Performance Stats (1/3 width) */}
              <div className="space-y-4">
                <div
                  className="rounded-2xl border border-border bg-card p-5 text-right space-y-4"
                  style={{ boxShadow: "var(--shadow-elegant)" }}
                >
                  <h5 className="font-extrabold text-sm text-foreground flex items-center gap-2 justify-end">
                    <Sliders className="w-4 h-4 text-primary" /> خێراییا ئینتەرنێتێ تاقی بکە
                  </h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    جۆریا ئینتەرنێتێ بگۆڕە بۆ بینینا کا چەوان سیستەم ب شێوازەکێ داینامیکی خۆ دگونجینیت بێی
                    سەکوتان و ڕاوەستیان.
                  </p>

                  {/* Controller buttons */}
                  <div className="flex flex-col gap-2">
                    {[
                      { key: "fast", label: "خێرا (Fast - 1080p)", desc: "5G یان فایبەرا مال" },
                      { key: "medium", label: "ناڤنجی (Medium - 720p)", desc: "4G یان وایفایێ ئاسایی" },
                      { key: "slow", label: "لاواز (Slow - 360p)", desc: "ئینتەرنێتێ کێم یان لادێ" },
                    ].map((sp) => (
                      <button
                        key={sp.key}
                        onClick={() => setNetworkSpeed(sp.key as any)}
                        className={`w-full text-right rounded-xl border p-3 transition flex flex-col gap-0.5 ${
                          networkSpeed === sp.key
                            ? "border-primary bg-primary/5 text-foreground font-bold shadow-sm"
                            : "border-border bg-card hover:bg-secondary/40 text-muted-foreground"
                        }`}
                      >
                        <span className="text-xs text-foreground font-bold">{sp.label}</span>
                        <span className="text-[10px] text-muted-foreground">{sp.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Real-time stats card */}
                <div
                  className="rounded-2xl border border-border bg-card p-5 text-right text-xs space-y-3"
                  style={{ boxShadow: "var(--shadow-elegant)" }}
                >
                  <h6 className="font-extrabold text-foreground flex items-center gap-1.5 justify-end">
                    <Wifi className="w-4 h-4 text-primary" /> ئامارێن دروست و ڕاستەوخۆ
                  </h6>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] border-b border-border/50 pb-1.5">
                      <span className="font-mono font-bold text-foreground">
                        {adaptiveDetails.bitrate}
                      </span>
                      <span className="text-muted-foreground">خێراییا دابەزینێ (Bitrate):</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] border-b border-border/50 pb-1.5">
                      <span className={`font-mono font-bold ${adaptiveDetails.colorClass}`}>
                        {adaptiveDetails.resolution}
                      </span>
                      <span className="text-muted-foreground">کوالیتیێ ڤیدیۆیێ (Resolution):</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] border-b border-border/50 pb-1.5">
                      <span className="font-mono text-foreground font-bold">
                        {adaptiveDetails.latency}
                      </span>
                      <span className="text-muted-foreground">تاخیربوون (Ping Latency):</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-emerald-500 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {adaptiveDetails.bufferHealth}
                      </span>
                      <span className="text-muted-foreground">خەزینەکردن (Buffer Health):</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
