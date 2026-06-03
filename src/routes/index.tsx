import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Uploader } from "@/components/Uploader";
import { ChatBox } from "@/components/ChatBox";
import { BookOpen, Sparkles, Zap, Check, Crown, MessageCircle, FileText, Brain, Menu, X, GraduationCap } from "lucide-react";
import sangarAsset from "@/assets/sangar.jpg.asset.json";

const WHATSAPP_NUMBER = "9647501435868";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hello, I want to activate my VIP subscription for AI Study Summary.",
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "پوختەی خوێندن بە AI — ئامرازی زیرەک بۆ خوێندکاران" },
      {
        name: "description",
        content:
          "بەڵگەنامە و وێنەکانت بنێرە و پوختەیەکی ڕێکوپێک وەربگرە بە کوردی و ئینگلیزی بە یارمەتی زیرەکی دەستکرد.",
      },
      { property: "og:title", content: "پوختەی خوێندن بە AI" },
      { property: "og:description", content: "ئامرازێکی زیرەک بۆ پوختەکردنی کتێب و مەلزەمە." },
    ],
  }),
  component: Index,
});

function Index() {
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
            <span className="font-extrabold text-lg">پوختەی AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">تایبەتمەندیەکان</a>
            <a href="#upload" className="hover:text-foreground transition">پوختەکردن</a>
            <a href="#chat" className="hover:text-foreground transition">گفتوگۆ</a>
            <a href="#pricing" className="hover:text-foreground transition">نرخەکان</a>
          </nav>
          <button
            onClick={(e) => {
              e.preventDefault();
              const dispatched = window.dispatchEvent(new CustomEvent("trigger-quiz"));
              void dispatched;
              // If no file uploaded yet, scroll user to upload section
              setTimeout(() => {
                const el = document.getElementById("upload");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 50);
            }}
            className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90"
          >
            تاقیکردنی خۆڕایی
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative max-w-5xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/60 px-4 py-1.5 text-sm font-medium text-accent-foreground mb-6">
            <Sparkles className="w-4 h-4" />
            <span>پاڵپشتیکراو لە لایەن زیرەکی دەستکرد</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            خوێندنت{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-primary)" }}
            >
              خێراتر و ئاسانتر
            </span>{" "}
            بکە
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            PDF یان وێنەی مەلزەمەکانت دابنێ، لە چەند چرکەیەکدا پوختەیەکی ڕێکوپێک بە کوردی
            وەردەگریت — خاڵە سەرەکیەکان، پێناسە و فۆرمولەکان.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success" /> کوردی و ئینگلیزی</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success" /> OCR بۆ وێنە</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success" /> پشتگیری PDF</span>
          </div>
        </div>
      </section>

      {/* Upload */}
      <section id="upload" className="px-4 md:px-6 pb-20">
        <Uploader />
      </section>

      {/* Chat */}
      <section id="chat" className="px-4 md:px-6 py-20 bg-secondary/40 border-y border-border">
        <ChatBox />
      </section>

      {/* Features */}
      <section id="features" className="px-4 md:px-6 py-20 bg-secondary/40 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3">بۆچی ئێمە؟</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            تەکنەلۆجیای پێشکەوتوو بۆ یارمەتی خوێندکارانی کوردی.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: "خێرایی بەرز", desc: "لە کەمتر لە چەند چرکەیەکدا پوختەکە ئامادە دەبێت." },
              { icon: FileText, title: "OCR زیرەک", desc: "دەق دەردەهێنێت لە وێنە و PDFی سکانکراو بە کوردی و ئینگلیزی." },
              { icon: BookOpen, title: "ڕێکخستنی ڕێکوپێک", desc: "خاڵە سەرەکی، پێناسە، ڕێکەوت و فۆرمول جیاکراوەتەوە." },
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
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-3">پلانەکانی نرخ</h2>
          <p className="text-center text-muted-foreground mb-12">پلانێک هەڵبژێرە کە لەگەڵ پێداویستیتدا بگونجێت.</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free */}
            <div className="rounded-3xl p-7 bg-card border border-border flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">پلانی خۆڕایی</h3>
                <p className="text-muted-foreground text-sm">بۆ تاقیکردنەوە و بەکارهێنانی کەم</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-extrabold">٠</span>
                <span className="text-muted-foreground"> دینار</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "٣ پوختە لە ڕۆژێکدا",
                  "زۆرترین ٥ پەڕە بۆ هەر فایلێک",
                  "پشتگیری PDF و وێنە",
                  "خاڵە سەرەکی و پێناسە",
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
                دەست پێبکە
              </a>
            </div>

            {/* VIP */}
            <div
              className="relative rounded-3xl p-7 text-primary-foreground flex flex-col"
              style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}
            >
              <div className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-primary-foreground/95 text-primary px-3 py-1 text-xs font-bold">
                <Crown className="w-3.5 h-3.5" /> باشترین
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">پلانی VIP</h3>
                <p className="text-primary-foreground/80 text-sm">بۆ خوێندکارانی جیددی</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-extrabold">٥,٠٠٠</span>
                <span className="text-primary-foreground/80"> دینار / مانگ</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "پوختەی بێسنوور",
                  "پشتگیری ١٥٠ پەڕە بۆ هەر فایلێک",
                  "خێرایی بەرزتر",
                  "پشتگیری تایبەت ٢٤/٧",
                  "هەموو تایبەتمەندیە داهاتووەکان",
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
                چالاککردن لە واتساپ
              </a>
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
            <span className="font-bold text-foreground">پوختەی AI</span>
          </div>
          <p>© {new Date().getFullYear()} — هەموو مافەکان پارێزراون.</p>
        </div>
      </footer>
    </div>
  );
}
