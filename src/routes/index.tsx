import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Uploader } from "@/components/Uploader";
import { ChatBox } from "@/components/ChatBox";
import { Humanizer } from "@/components/Humanizer";
import { Handwriting } from "@/components/Handwriting";
import { AiTool } from "@/components/AiTool";
import { Math2Word } from "@/components/Math2Word";
import { BookOpen, Sparkles, Zap, Check, Crown, MessageCircle, FileText, Brain, Menu, X, GraduationCap, Wand2, ScanLine, CalendarCheck, ListOrdered, Sigma, Volume2, ClipboardCheck, BookA, ShieldCheck, FileSearch, Mail, Instagram, Facebook } from "lucide-react";
import sangarAsset from "@/assets/sangar.jpg.asset.json";

type ToolId = "summary" | "chat" | "humanize" | "ocr" | "planner" | "solver" | "math2word" | "tts" | "grader" | "glossary" | "testai" | "testplagiarism";

const WHATSAPP_NUMBER = "9647501435868";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hello, I want to activate my VIP subscription for AI Study Summary.",
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "کورتەیا خواندنێ ب AI — ئامرازەکێ زیرەک بو خواندکاران" },
      {
        name: "description",
        content:
          "بەلگەنامە و وێنێن خۆ بدانە و کورتەیەکا ڕێکوپێک وەربگرە ب کوردیا بادینی و ئینگلیزی ب هاریکاریا زیرەکیا دەستکرد.",
      },
      { property: "og:title", content: "کورتەیا خواندنێ ب AI" },
      { property: "og:description", content: "ئامرازەکێ زیرەک بو کورتکرنا پەرتوک و مەلزەمان." },
    ],
  }),
  component: Index,
});

function Index() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<null | ToolId>(null);

  const navLinks = [
    { href: "#features", label: "بوچی ئەم؟" },
    { href: "#upload", label: "کورتکرن" },
    { href: "#chat", label: "تایبەتمەندی" },
    { href: "#pricing", label: "بهایی" },
    { href: "#about", label: "دەربارەی مە" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-lg">کورتەیا AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-foreground transition">{l.label}</a>
            ))}
          </nav>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="ڤەکرنا مینیویێ"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:opacity-90"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Slide-out menu */}
      <div
        className={`fixed inset-0 z-50 transition ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity ${menuOpen ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-card border-l border-border shadow-2xl p-6 flex flex-col transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-extrabold text-lg">کورتەیا AI</span>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="داخستن"
              className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-semibold hover:bg-secondary transition text-right"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-auto pt-6 text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} کورتەیا AI
          </div>
        </aside>
      </div>


      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative max-w-5xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/60 px-4 py-1.5 text-sm font-medium text-accent-foreground mb-6">
            <Sparkles className="w-4 h-4" />
            <span>پشتەڤانیکری ژ لایێ زیرەکیا دەستکرد</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            خواندنا خۆ{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              لەزتر و ئاسانتر
            </span>{" "}
            بکە
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            PDF یان وێنێن مەلزەمێن خۆ بدانە، د چەند چرکەیەکێدا کورتەیەکا ڕێکوپێک ب کوردی
            وەردگری — خالێن سەرەکی، پێناسە و فۆرمول.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success" /> کوردی و ئینگلیزی</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success" /> OCR بو وێنە</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success" /> پشتەڤانیا PDF</span>
          </div>
        </div>
      </section>

      {/* Tools picker */}
      <section id="upload" className="px-4 md:px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          {!activeTool && (
            <>
              <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3">تایبەتمەندی</h2>
              <p className="text-center text-muted-foreground mb-10">یەکێ هەلبژێرە بو دەستپێکرنێ</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { id: "summary" as ToolId, icon: FileText, title: "کورتکرن", desc: "PDF یان وێنە بکە کورتە." },
                  { id: "chat" as ToolId, icon: MessageCircle, title: "ئاخفتن", desc: "پسیارێ ژ AI بکە ب کوردی." },
                  { id: "humanize" as ToolId, icon: Wand2, title: "Humanize Text", desc: "نڤیسینا AI بکە مرۆڤی." },
                  { id: "ocr" as ToolId, icon: ScanLine, title: "دەستنڤیس بو دەقی", desc: "وێنەیێ دەستنڤیسی بخوینە." },
                  { id: "planner" as ToolId, icon: CalendarCheck, title: "پلانا خواندنێ", desc: "پلانێ خواندنا ڕۆژانە بو تە." },
                  { id: "solver" as ToolId, icon: ListOrdered, title: "چارەسەری پێنگاڤ", desc: "پسیار پێنگاڤ ب پێنگاڤ." },
                  { id: "math2word" as ToolId, icon: Sigma, title: "Math → Word", desc: "هاوکێشە بو Microsoft Word." },
                  { id: "tts" as ToolId, icon: Volume2, title: "کورتەیا دەنگی", desc: "کورتە بکە و گوهداری بکە." },
                  { id: "grader" as ToolId, icon: ClipboardCheck, title: "نمرەدانا ڕاپۆرتێ", desc: "ڕاپۆرتا خۆ ب پیڤە و نمرەیێ ببینە." },
                  { id: "glossary" as ToolId, icon: BookA, title: "فەرهەنگا زانستی", desc: "زاراڤێن ئەکادیمی." },
                  { id: "testai" as ToolId, icon: ShieldCheck, title: "Test AI", desc: "ڕێژا نڤیسینا AI بپشکنە." },
                  { id: "testplagiarism" as ToolId, icon: FileSearch, title: "Test Plagiarism", desc: "ڕێژا پلاجیاریزمێ بپشکنە." },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTool(t.id)}
                    id={t.id === "chat" ? "chat" : undefined}
                    className="group relative text-right rounded-2xl p-4 bg-card border border-border hover:border-primary/60 transition"
                    style={{ boxShadow: "var(--shadow-elegant)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-primary-foreground group-hover:scale-110 transition"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      <t.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-extrabold mb-1">{t.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{t.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTool && (
            <div>
              <button
                onClick={() => setActiveTool(null)}
                className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-semibold hover:bg-secondary/80 transition"
              >
                <X className="w-4 h-4" />
                ڤەگەڕان بو تایبەتمەندی
              </button>
              {activeTool === "summary" && <Uploader />}
              {activeTool === "chat" && <ChatBox />}
              {activeTool === "humanize" && <Humanizer />}
              {activeTool === "ocr" && <Handwriting />}
              {activeTool === "planner" && (
                <AiTool tool="planner" title="پلانا خواندنا AI" description="بابەت و دەمێ خواندنێ بنڤیسە، پلانەکێ ڕۆژانە وەردگری."
                  placeholder="نموونە: ٧ ڕۆژ بو تاقیکرنا کیمیایێ، ٣ کاتژمێر د ڕۆژەکێدا"
                  buttonLabel="پلانا من بو دروست بکە" />
              )}
              {activeTool === "solver" && (
                <AiTool tool="solver" title="چارەسەرکرن پێنگاڤ ب پێنگاڤ" description="پسیارێ بنڤیسە یان وێنەیێ پسیارێ بدانە."
                  placeholder="نموونە: ٢x² + ٥x − ٣ = ٠ چارەسەر بکە"
                  buttonLabel="چارەسەر بکە" withFile fileAccept="image/*,application/pdf" />
              )}
              {activeTool === "math2word" && <Math2Word />}
              {activeTool === "tts" && (
                <AiTool tool="tts" title="کورتەیا دەنگی" description="دەقی بنڤیسە یان فایلی بدانە، کورتە و گوهداری."
                  placeholder="دەقێ خۆ یێ درێژ ل ڤێرێ بنڤیسە..."
                  buttonLabel="کورتە و گوهداری" withTTS withFile
                  fileAccept="image/*,application/pdf,.docx,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation" />
              )}
              {activeTool === "grader" && (
                <AiTool tool="grader" title="نمرەدانا ڕاپۆرت/وتارێ" description="ڕاپۆرتی بنڤیسە یان فایلی بدانە، نمرە و ڕاسپاردە وەردگری."
                  placeholder="دەقێ ڕاپۆرتا خۆ ل ڤێرێ بدانە..."
                  buttonLabel="نمرە بدە" withFile
                  fileAccept="image/*,application/pdf,.docx,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation" />
              )}
              {activeTool === "glossary" && (
                <AiTool tool="glossary" title="فەرهەنگا زاراڤێن ئەکادیمی" description="بابەتی بنڤیسە یان فایلی بدانە، لیستا زاراڤان وەردگری."
                  placeholder="نموونە: Calculus، Quantum Physics، Linear Algebra"
                  buttonLabel="زاراڤان نیشان بدە" withFile
                  fileAccept="image/*,application/pdf,.docx,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation" />
              )}
              {activeTool === "testai" && (
                <AiTool tool="testai" title="پشکنینا نڤیسینا AI" description="دەقی بنڤیسە یان فایلی بدانە، ڕێژا AI تێ پێشبینیکرن."
                  placeholder="دەقێ ڤەکولینا خۆ ل ڤێرێ بدانە..."
                  buttonLabel="پشکنینێ بکە" withFile showPercentage
                  fileAccept="image/*,application/pdf,.docx,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation" />
              )}
              {activeTool === "testplagiarism" && (
                <AiTool tool="testplagiarism" title="پشکنینا پلاجیاریزمێ" description="دەقی بنڤیسە یان فایلی بدانە، ڕێژا پلاجیاریزمێ تێ پێشبینیکرن."
                  placeholder="دەقێ ڤەکولینا خۆ ل ڤێرێ بدانە..."
                  buttonLabel="پشکنینێ بکە" withFile showPercentage
                  fileAccept="image/*,application/pdf,.docx,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation" />
              )}
            </div>
          )}
        </div>
      </section>


      {/* Features */}
      <section id="features" className="px-4 md:px-6 py-20 bg-secondary/40 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3">بوچی ئەم؟</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            تەکنەلۆژیا پێشکەفتی بو هاریکاریا خواندکارێن کورد.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: "لەزا بلند", desc: "د چەند چرکەیەکێ کێمدا کورتە ئامادە دبیت." },
              { icon: FileText, title: "OCR یێ زیرەک", desc: "دەقی ژ وێنە و PDFێن سکانکری دەردێخیت ب کوردی و ئینگلیزی." },
              { icon: BookOpen, title: "ڕێکخستنەکا ڕێکوپێک", desc: "خالێن سەرەکی، پێناسە، دەم و فۆرمول هاتینە جیاکرن." },
            ].map((f, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-card border border-border hover:border-primary/40 transition"
                style={{ boxShadow: "var(--shadow-elegant)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 md:px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3">پلانێن بهایی</h2>
          <p className="text-center text-muted-foreground mb-12">پلانەکێ هەلبژێرە.</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="rounded-3xl p-7 bg-card border border-border flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">پلانا بێ بەرامبەر</h3>
                <p className="text-muted-foreground text-sm">بو تاقیکرن و بکارئینانا کێم</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-extrabold">٠</span>
                <span className="text-muted-foreground"> دینار</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "١٠ کورتە د ڕۆژەکێدا",
                  "پترین ٥٠ پەڕە بو هەر فایلەکێ",
                  "پشتەڤانیا PDF و وێنە",
                  "خالێن سەرەکی و پێناسە",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#upload"
                className="block text-center rounded-xl border-2 border-border bg-background px-5 py-3 font-semibold hover:bg-secondary transition"
              >
                دەستپێبکە
              </a>
            </div>

            {/* VIP */}
            <div
              className="relative rounded-3xl p-7 text-primary-foreground flex flex-col"
              style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}
            >
              <div className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-primary-foreground/95 text-primary px-3 py-1 text-xs font-bold">
                <Crown className="w-3.5 h-3.5" /> یا باشترین
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">پلانا VIP</h3>
                <p className="text-primary-foreground/80 text-sm">بو خواندکارێن جددی</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-extrabold">٥,٠٠٠</span>
                <span className="text-primary-foreground/80"> دینار / هەیڤ</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "کورتەیا بێ سنور",
                  "پشتەڤانیا ١٥٠ پەڕی بو هەر فایلەکێ",
                  "لەزا بلندتر",
                  "پشتەڤانیا هەمی فایلان",
                  "هەمی تایبەتمەندیێن داهاتی",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary-foreground text-primary px-5 py-3 font-bold hover:opacity-95 transition"
              >
                <MessageCircle className="w-5 h-5" />
                چالاککرن ل واتساپێ
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-4 md:px-6 py-20 bg-secondary/40 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">دەربارەی مە</h2>

          <div className="grid md:grid-cols-2 gap-10 items-center max-w-4xl mx-auto">
            <div className="relative flex justify-center md:justify-end">
              <div
                className="absolute -inset-4 rounded-3xl opacity-40 blur-2xl"
                style={{ background: "var(--gradient-primary)" }}
              />
              <div
                className="relative rounded-3xl overflow-hidden border-4 border-card w-44 h-56 md:w-52 md:h-64"
                style={{ boxShadow: "var(--shadow-glow)" }}
              >
                <img
                  src={sangarAsset.url}
                  alt="سەنگەر محمد حەسەن"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/60 px-3 py-1 text-xs font-semibold text-accent-foreground mb-4">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>دامەزرینەر</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold mb-2">سەنگەر محمد حەسەن</h3>
              <p className="text-muted-foreground font-semibold mb-5">
                باوەرنامەیا ماستەر ب زانستێن بیرکاری
              </p>
              <p className="text-base md:text-lg leading-relaxed text-foreground/90 mb-5">
                ئارمانجا من پێشخستنا خواندنێیە ب هاریکاریا زیرەکیا دەستکرد، داکو
                قوتابیێن هێژا بشێن ب ساناهی و بلەز فێربن و دەرفەتێن باشتر بدەست ڤە بینن.
              </p>
              <a
                href="mailto:sangarduhok@gmail.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline mb-4"
                dir="ltr"
              >
                <Mail className="w-4 h-4" />
                sangarduhok@gmail.com
              </a>
              <div className="flex items-center gap-3 justify-end">
                <a
                  href="https://www.instagram.com/sangar__98?igsh=NHgxbzY2bGQ5M2I0&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://www.facebook.com/share/1DrTW5Z1ik/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="mailto:sangarduhok@gmail.com"
                  aria-label="Email"
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">کورتەیا AI</span>
          </div>
          <p>© {new Date().getFullYear()} — هەمی ماف پاراستینە.</p>
        </div>
      </footer>
    </div>
  );
}
