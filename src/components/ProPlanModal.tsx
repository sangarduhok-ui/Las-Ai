import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Crown,
  Check,
  Sparkles,
  MessageCircle,
  Key,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Flame,
} from "lucide-react";

export function ProPlanModal() {
  const {
    user,
    isAuthenticated,
    isProModalOpen,
    proModalToolTitle,
    closeProModal,
    openAuthModal,
    pricingConfig,
    redeemVipCode,
  } = useAuth();

  const [proDuration, setProDuration] = useState<"1m" | "3m" | "6m" | "1y">("3m");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [vipCode, setVipCode] = useState("");
  const [redeemAlert, setRedeemAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isProModalOpen) return null;

  const toEnglishDigits = (val: any): string => {
    if (val === null || val === undefined) return "";
    return String(val)
      .replace(/[٠۰]/g, "0")
      .replace(/[١۱]/g, "1")
      .replace(/[22]/g, "2")
      .replace(/[33]/g, "3")
      .replace(/[44]/g, "4")
      .replace(/[55]/g, "5")
      .replace(/[66]/g, "6")
      .replace(/[77]/g, "7")
      .replace(/[88]/g, "8")
      .replace(/[99]/g, "9");
  };

  const activeOptions = pricingConfig && pricingConfig.length > 0
    ? pricingConfig.filter((p) => p.isActive)
    : [
        { id: "1m" as const, label: "1 هەیڤ", price: 5000, originalPrice: null, discountLabel: null, isActive: true },
        { id: "3m" as const, label: "3 هەیڤ", price: 12000, originalPrice: 15000, discountLabel: "20% داشکاندن", isActive: true },
        { id: "6m" as const, label: "6 هەیڤ", price: 22000, originalPrice: 30000, discountLabel: "25% داشکاندن", isActive: true },
        { id: "1y" as const, label: "1 ساڵ", price: 40000, originalPrice: 60000, discountLabel: "35% باشترین داشکاندن", isActive: true },
      ];

  const activePro = activeOptions.find((p) => p.id === proDuration) || activeOptions[0] || {
    id: "3m",
    label: "3 هەیڤ",
    price: 12000,
    originalPrice: 15000,
    discountLabel: "20% داشکاندن",
    isActive: true,
  };

  const proWhatsAppUrl = `https://wa.me/9647501435868?text=${encodeURIComponent(
    `سلاڤ، دڤێت پلانا پرۆ (Pro Plan) بۆ ماوێ (${toEnglishDigits(activePro.label)}) ب کۆژمێ (${toEnglishDigits(activePro.price.toLocaleString("en-US"))} دینار) چالاک بکەم.${proModalToolTitle ? ` [ئامرازێ: ${proModalToolTitle}]` : ""}`
  )}`;

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      closeProModal();
      openAuthModal("login");
      return;
    }
    const res = redeemVipCode(vipCode);
    if (res.success) {
      setRedeemAlert({ type: "success", text: res.message });
      setVipCode("");
      setTimeout(() => {
        closeProModal();
      }, 2000);
    } else {
      setRedeemAlert({ type: "error", text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="relative w-full max-w-xl my-auto rounded-3xl bg-card border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 40px rgba(59, 130, 246, 0.15)" }}
      >
        {/* Glowing Top Banner */}
        <div
          className="relative p-6 text-primary-foreground flex items-center justify-between overflow-hidden shrink-0"
          style={{ background: "var(--gradient-hero, linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%))" }}
        >
          {/* Ambient lighting circle */}
          <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary-foreground/20 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg text-amber-300">
              <Crown className="w-7 h-7 drop-shadow-md animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black tracking-wide mb-1">
                <Flame className="w-3 h-3" /> پلانا بێ سنور (PRO PLAN)
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                چالاککرنا پلانا پڕۆ (Pro)
              </h2>
            </div>
          </div>

          <button
            onClick={closeProModal}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition cursor-pointer relative z-10"
            title="گرتن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Notice Banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            proModalToolTitle
              ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/30"
              : "bg-primary/10 dark:bg-primary/15 border-primary/30"
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 font-bold ${
              proModalToolTitle
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                : "bg-primary/20 text-primary"
            }`}>
              {proModalToolTitle ? <Lock className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <div className="text-xs sm:text-sm leading-relaxed">
              <span className={`font-extrabold block mb-0.5 ${
                proModalToolTitle ? "text-amber-700 dark:text-amber-300" : "text-primary font-bold"
              }`}>
                {proModalToolTitle ? "کرێدیتێن بکارئینانا بێ بەرامبەر ب داوی هاتن!" : "بەشداریکردن د پلانا پڕۆدا (Pro Plan)"}
              </span>
              <p className="text-muted-foreground">
                {proModalToolTitle ? (
                  <>
                    ئامرازێ <strong className="text-foreground font-bold">«{proModalToolTitle}»</strong> پێدڤی ب کرێدیتێن پلانا پڕۆ یە. بو بکارئینانا تەواو بێ سنور، هیڤیە پلانا پڕۆ چالاک بکە.
                  </>
                ) : (
                  "ب ئەندامبوون د پلانا پڕۆدا، بێ هیچ سنووردارکردنەکێ و ب بەرزترین لەزاتی و کوالیتی دەستگەیشتنت ب هەمی ئامرازێن Las AI دێ هەبیت."
                )}
              </p>
            </div>
          </div>

          {/* Duration Selector Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center justify-between">
              <span>ماوێ بەشداریکرنێ یێ دلخواز هەلبژێرە:</span>
              <span className="text-[11px] text-primary font-extrabold">بێ سنور بو هەمی ئامرازان</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeOptions.map((opt) => {
                const isSelected = proDuration === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setProDuration(opt.id as any)}
                    className={`relative p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 dark:bg-primary/20 shadow-md ring-2 ring-primary/30"
                        : "border-border hover:border-primary/40 bg-secondary/30"
                    }`}
                  >
                    {opt.discountLabel && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black bg-emerald-500 text-white px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-xs">
                        {toEnglishDigits(opt.discountLabel)}
                      </span>
                    )}
                    <span className="text-xs font-bold text-foreground block mb-0.5">{toEnglishDigits(opt.label)}</span>
                    <span className="text-sm sm:text-base font-extrabold font-mono text-primary" dir="ltr">
                      {toEnglishDigits(opt.price.toLocaleString("en-US"))}
                    </span>
                    <span className="text-[10px] text-muted-foreground">دینار</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Price Summary Box */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs text-muted-foreground block">کۆژمێ پارەی بۆ ({toEnglishDigits(activePro.label)}):</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground" dir="ltr">
                  {toEnglishDigits(activePro.price.toLocaleString("en-US"))}
                </span>
                <span className="text-xs text-muted-foreground">دینارێن عیراقی</span>
                {activePro.originalPrice && (
                  <span className="text-xs line-through text-muted-foreground font-mono" dir="ltr">
                    {toEnglishDigits(activePro.originalPrice.toLocaleString("en-US"))} د.ع
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1.5 rounded-xl border border-emerald-500/20">
              <Zap className="w-4 h-4" />
              <span>ئێکسەر دێ هێتە چالاککرن</span>
            </div>
          </div>

          {/* Pro Benefits List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              تایبەتمەندی و مفایێن پلانا پڕۆ:
            </h4>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              {[
                "بکارئینانا بێ سنور بو هەمی ئامرازان",
                "پشکنینا AI، پشکنینا دزیکرنێ و ڕاستنڤیس",
                "گشت خزمەتگوزاریێن PDF و ڤیدیۆ",
                "تاقیگەها ئامار و پشکنینا بەڵگەنامەیان (Forensics)",
                "بلندترین لەزاتی و مۆدێلێن زیرەکیا دەستکرد",
                "پشتەڤانیا بەردەوام ب ڕێکا واتساپێ",
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-secondary/20">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-foreground/90">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <a
              href={proWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>چالاککرن ب ڕێکا واتساپێ ({activePro.label} — {activePro.price.toLocaleString()} د.ع)</span>
            </a>

            <button
              type="button"
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="w-full py-2.5 px-4 rounded-xl bg-secondary/60 hover:bg-secondary border border-border text-foreground font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Key className="w-4 h-4 text-amber-500" />
              <span>
                {showKeyInput ? "گرتنا پشکێ کۆدێ VIP ▲" : "کۆدێ چالاککرنا VIP یان پڕۆ یێ هەی؟ ل ڤێرێ بنڤیسە ▼"}
              </span>
            </button>

            {showKeyInput && (
              <form onSubmit={handleRedeem} className="space-y-2 p-3.5 rounded-2xl bg-secondary/30 border border-amber-500/30 animate-in fade-in-50 duration-150">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={vipCode}
                    onChange={(e) => setVipCode(e.target.value.toUpperCase())}
                    placeholder="PRO-XXXX-XXXX-XXXX"
                    className="flex-1 h-11 px-3.5 rounded-xl bg-card border border-border focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider dir-ltr text-center"
                  />
                  <button
                    type="submit"
                    className="h-11 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>چالاککرن</span>
                  </button>
                </div>
                {redeemAlert && (
                  <p
                    className={`text-xs font-bold p-2 rounded-lg flex items-center gap-1.5 ${
                      redeemAlert.type === "success"
                        ? "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20"
                        : "text-destructive bg-destructive/10 border border-destructive/20"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    {redeemAlert.text}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-secondary/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <span>بەرسڤدانا لەزگین ل سەر واتساپێ (24/7)</span>
          <button
            onClick={closeProModal}
            className="font-bold text-foreground hover:text-primary transition cursor-pointer px-2 py-1"
          >
            پاشتر
          </button>
        </div>
      </div>
    </div>
  );
}
