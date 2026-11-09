import { useState } from "react";
import {
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Sparkles,
  MessageCircle,
  Star,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { useAuth, REFERRAL_BONUS_CREDITS } from "@/context/AuthContext";

export function InviteFriends() {
  const {
    user,
    isAuthenticated,
    getMyReferralCode,
    useReferralCode,
    bonusCredits,
    getReferralUsedBy,
    hasRedeemedReferral,
    openAuthModal,
  } = useAuth();

  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [redeemResult, setRedeemResult] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showInputSection, setShowInputSection] = useState(false);

  const myCode = isAuthenticated ? getMyReferralCode() : "";
  const usedByCount = getReferralUsedBy().length;

  // Build share link & message
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://las-ai.com";
  const shareLink = myCode ? `${siteUrl}?ref=${myCode}` : siteUrl;
  const shareText = `سلاڤ! 🌟
پلاتفۆرمەکا Las AI تاقی بکە — زێدەتر ژ 30 ئامرازێن زیرەک بۆ خواندەڤان و مامۆستایان (کورتکرنا پەرتووکان، نڤیسینا ئەکادیمی، ژمێریاری، وۆرد و PDF).

🎁 دیاریا تایبەت: 25 کرێدیتێن بێبەرامبەر ب دەستخۆڤە بینە!
🔑 کۆدا من: ${myCode}

🔗 لینکا ئێکسەر:
${shareLink}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopy = async () => {
    if (!myCode) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal("register");
      return;
    }
    setRedeemResult(null);
    setIsRedeeming(true);
    await new Promise((r) => setTimeout(r, 500));
    const res = useReferralCode(inputCode.trim());
    setIsRedeeming(false);
    setRedeemResult({ type: res.success ? "success" : "error", text: res.message });
    if (res.success) {
      setInputCode("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-3.5 text-right" dir="rtl">
      {/* Compact Header Banner */}
      <div className="relative rounded-2xl overflow-hidden p-4 sm:p-5 bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-600 text-white shadow-md">
        {/* Ambient glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-1 min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-black leading-snug flex items-center gap-1.5 flex-wrap">
              <span>هەڤالێن خۆ داخواز بکە و</span>
              <span className="text-yellow-300 font-black">25 کرێدیتان</span>
              <span>وەربگرە! 🎁</span>
            </h2>
            <p className="text-white/85 text-[11px] sm:text-xs leading-relaxed">
              بۆ هەر کەسێ کۆدا تە بکاربینیت، تو و ئەو هەردوو <strong>25 کرێدیتێن دیاری</strong> وەردگرن.
            </p>
          </div>

          {/* Compact Bonus Stats Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 border border-white/25 backdrop-blur-md shrink-0 shadow-xs">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300 shrink-0" />
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-yellow-300 font-mono leading-none">{bonusCredits}</span>
                <span className="text-[10px] font-bold text-white/90">کرێدیت</span>
              </div>
              <span className="text-[9px] text-white/75 block">دیاریا کۆمکری</span>
            </div>
          </div>
        </div>

        {/* Compact 3-step guide */}
        <div className="relative z-10 mt-3.5 pt-3 border-t border-white/15 grid grid-cols-3 gap-1.5 sm:gap-2">
          {[
            { step: "1", label: "کۆدا خۆ کۆپی بکە", icon: Copy },
            { step: "2", label: "بۆ هەڤالێن خۆ بنێرە", icon: Share2 },
            { step: "3", label: "هەردوو 25 کرێدیت", icon: Gift },
          ].map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-center sm:justify-start gap-1.5 p-1.5 sm:p-2 rounded-xl bg-white/10 border border-white/10 text-center sm:text-right min-w-0"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black shrink-0">
                {s.step}
              </div>
              <s.icon className="w-3.5 h-3.5 text-white/80 hidden sm:block shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-bold text-white/95 leading-tight truncate">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* My Referral Code Card */}
      {isAuthenticated ? (
        <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-extrabold text-xs sm:text-sm text-foreground">کۆدا داخوازکرنا من</h3>
            </div>
            {usedByCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {usedByCount} هەڤال بەشدار بووینە (+{usedByCount * REFERRAL_BONUS_CREDITS} 🎁)
              </span>
            )}
          </div>

          {/* Unified Clean Code Box & Copy */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className="flex-1 h-10 px-3.5 rounded-xl bg-secondary/50 border border-border font-mono font-black text-sm sm:text-base text-primary tracking-widest flex items-center justify-center select-all"
                dir="ltr"
              >
                {myCode}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                title="کۆپیکرنا لینکا داخوازکرنێ"
                className={`h-10 px-3.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer border ${
                  copied
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                    : "bg-secondary border-border hover:bg-secondary/80 text-foreground"
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "هاتە کۆپیکرن!" : "کۆپیکرنا لینکێ"}</span>
              </button>
            </div>

            {/* Share via WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>شاندنا لینک و کۆدێ ب واتساپێ (WhatsApp)</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-card border border-border/80 p-5 text-center space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-foreground">
            بۆ دیتنا کۆدا داخوازکرنا خۆ، سەرەتا بچە ژوورڤە
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition cursor-pointer shadow-xs"
          >
            چوونەژوورڤە
          </button>
        </div>
      )}

      {/* Enter a friend's code section */}
      <div className="rounded-2xl bg-card border border-border/80 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowInputSection((v) => !v)}
          className="w-full flex items-center justify-between gap-2.5 px-4 py-3 hover:bg-secondary/30 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div className="text-right">
              <p className="font-extrabold text-xs text-foreground">کۆدا هەڤالەکی دی بنڤیسە</p>
              <p className="text-[10px] text-muted-foreground">
                {hasRedeemedReferral
                  ? "تە پێشتر دیاریا 25 کرێدیتان وەرگرتیە"
                  : "دیاریا 25 کرێدیتان ب دەستخۆڤە بینە (بتنێ 1 جار)"}
              </p>
            </div>
          </div>
          {showInputSection ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </button>

        {showInputSection && (
          <div className="px-4 pb-4 space-y-2.5 border-t border-border/60 pt-3 animate-in fade-in-0 duration-150">
            {hasRedeemedReferral ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>تە پێشتر دیاریا 25 کرێدیتان وەرگرتیە. هەر کەسەک بتنێ 1 جار دشێت دیاریێ وەربگریت!</span>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  ئەگەر هەڤالەکی کۆدا داخوازکرنا خۆ پێ دابیت، ل ڤێرێ بنڤیسە بۆ ستاندنا <strong className="text-foreground">25 کرێدیتێن دیاری</strong>:
                </p>
                <form onSubmit={handleRedeem} className="flex gap-2">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => {
                      setInputCode(e.target.value.toUpperCase());
                      setRedeemResult(null);
                    }}
                    placeholder="INV-XXXX-XXXX"
                    className="flex-1 h-9.5 px-3 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs font-mono uppercase tracking-wider"
                    dir="ltr"
                  />
                  <button
                    type="submit"
                    disabled={isRedeeming || !inputCode.trim()}
                    className="h-9.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-black text-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-xs"
                  >
                    {isRedeeming ? "..." : "چالاک بکە"}
                  </button>
                </form>

                {redeemResult && (
                  <div
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      redeemResult.type === "success"
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-destructive/15 border border-destructive/30 text-destructive"
                    }`}
                  >
                    {redeemResult.type === "success" ? <Sparkles className="w-3.5 h-3.5 shrink-0" /> : <span>⚠</span>}
                    <span>{redeemResult.text}</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
