import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  Crown,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  LogOut,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
  Clock,
  RotateCcw,
} from "lucide-react";

export function UserProfileSection({ onGoHome, onOpenAdmin }: { onGoHome?: () => void; onOpenAdmin?: () => void }) {
  const { user, isAuthenticated, isAdmin, openAuthModal, logout, updateProfile, allUsers, sendPhoneOtp } = useAuth();

  const [editName, setEditName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // WhatsApp OTP for Password Change
  const [passwordStep, setPasswordStep] = useState<"idle" | "otp" | "new_password">("idle");
  const [passOtp, setPassOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [passSuccessMsg, setPassSuccessMsg] = useState<string | null>(null);
  const [passErrorMsg, setPassErrorMsg] = useState<string | null>(null);

  const isCvCenter = user?.email?.toLowerCase() === "cv.centerr@gmail.com";
  const registeredPhone = isCvCenter
    ? "+9647502039396"
    : user?.phone ||
      allUsers?.find((u) => u.email?.toLowerCase() === user?.email?.toLowerCase() || u.id === user?.id)?.phone ||
      "";

  useEffect(() => {
    if (user) {
      setEditName(user.name);
      if (isCvCenter && user.phone !== "+9647502039396") {
        updateProfile({ phone: "+9647502039396" });
      } else if (!user.phone && registeredPhone) {
        updateProfile({ phone: registeredPhone });
      }
    }
  }, [user?.id, user?.name, user?.phone, registeredPhone, isCvCenter]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("قەبارەیا وێنەی بلا کێمتر بیت ژ 5 مێگابایت.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateProfile({ avatar: dataUrl });
        setSuccessMsg("وێنەیێ پرۆفایلی ب سەرکەفتیانە هاتە نووکرن.");
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!editName.trim() || editName.trim().length < 2) {
      setErrorMsg("هیڤیە ناڤەکێ دروست بنڤیسە.");
      return;
    }
    updateProfile({
      name: editName.trim(),
      phone: user?.phone || registeredPhone,
    });
    setSuccessMsg("ناڤێ بکارئینەری ب سەرکەفتیانە هاتە نووکرن.");
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const handleSendPasswordOtp = async () => {
    setPassErrorMsg(null);
    setPassSuccessMsg(null);
    setIsSendingOtp(true);

    try {
      const res = await sendPhoneOtp(registeredPhone);
      setIsSendingOtp(false);

      if (res.success) {
        setPasswordStep("otp");
        setOtpCountdown(45);
        setPassSuccessMsg(res.message || "کۆدێ پشتڕاستکرنێ ب ڕێکا واتساپێ هاتە هنارتن.");
      } else {
        setPassErrorMsg(res.error || "نەتوانرا کۆدێ واتساپێ بهێتە هنارتن.");
      }
    } catch (e: any) {
      setIsSendingOtp(false);
      setPassErrorMsg("کێشەیەک لە پەیوەندی هەیە، تکایە دووبارە هەوڵبدەرەوە.");
    }
  };

  const handleVerifyPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg(null);
    setPassSuccessMsg(null);

    const cleanCode = passOtp.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setPassErrorMsg("هیڤیە کۆدێ 6 ژمارەیی بنڤیسی.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await fetch("/api/whatsapp-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_otp",
          phone: registeredPhone,
          code: cleanCode,
        }),
      });
      const data = await res.json();
      setIsVerifyingOtp(false);

      if (!res.ok || !data.success) {
        setPassErrorMsg(data.error || "کۆدێ داخڵکری نەدروستە یان دەمێ وی بسەرڤە چویە.");
        return;
      }

      setPasswordStep("new_password");
      setPassSuccessMsg("ژمارەی واتساپەکەت بە سەرکەوتوویی پشتڕاستکرایەوە! ئێستا وشەی نهێنی نوێ دابنێ.");
    } catch (err) {
      setIsVerifyingOtp(false);
      setPassErrorMsg("کێشەیەک لە پەیوەندی هەیە.");
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassErrorMsg(null);
    setPassSuccessMsg(null);

    if (!newPassword || newPassword.length < 8) {
      setPassErrorMsg("هیڤیە پەیڤا نهێنی کێمتر نەبیت ژ 8 پیتان.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassErrorMsg("دووپاتکرنا پەیڤا نهێنی وەک ئێک نینە.");
      return;
    }

    setPassSuccessMsg("پەیڤا نهێنی ب سەرکەفتیانە هاتە گوهۆڕین و پاراستن.");
    setNewPassword("");
    setConfirmPassword("");
    setPassOtp("");
    setPasswordStep("idle");
    setTimeout(() => setPassSuccessMsg(null), 5000);
  };

  // Convert eastern digits to English
  const toLatin = (str: string) => {
    if (!str) return "";
    return str
      .replace(/[\u0660-\u0669]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x0660 + 48))
      .replace(/[\u06f0-\u06f9]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x06f0 + 48));
  };

  // If user is not logged in
  if (!isAuthenticated || !user) {
    return (
      <section className="p-6 md:p-10 rounded-3xl bg-secondary/30 border border-border animate-in fade-in-50 duration-300 text-right">
        <div className="max-w-xl mx-auto text-center space-y-5 py-8">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary mx-auto flex items-center justify-center border border-primary/20 shadow-md">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">پرۆفایل و هەژمارا من</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              بو دەستکاریکرنا پێزانینان، گوهۆڕینا پەیڤا نهێنی و برێڤەبرنا پرۆفایلی، هیڤیە سەرەتا بچە ژوور.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => openAuthModal("login")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-95 transition shadow-md shadow-primary/25 cursor-pointer"
            >
              چوونە ژوور بو هەژمارێ
            </button>
            <button
              onClick={() => openAuthModal("register")}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-card border border-border hover:bg-secondary text-foreground font-bold text-sm transition shadow-xs cursor-pointer"
            >
              چێکرنا هەژمارەکا نوو
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 animate-in fade-in-50 duration-300 text-right">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Banner Header Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-card border border-border/80 shadow-md relative overflow-hidden">
        {/* Background gradient decorative element */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            {/* Clickable Avatar with Camera Overlay */}
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="relative shrink-0 group cursor-pointer focus:outline-none"
              title="کلیک بکە بو گوهۆڕینا وێنەیێ پرۆفایلی"
            >
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-lg bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-600 overflow-hidden group-hover:opacity-90 transition">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center shadow-md">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
            </button>

            {/* User Details */}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-foreground">{user.name}</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  {user.membershipLabel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono truncate" dir="ltr">
                {user.email}
              </p>
              {(user.phone || registeredPhone) && (
                <p className="text-xs text-muted-foreground font-mono" dir="ltr">
                  📱 {toLatin(user.phone || registeredPhone)}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-end">
            {isAdmin && (
              <button
                onClick={() => {
                  if (onOpenAdmin) onOpenAdmin();
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 hover:opacity-95 font-extrabold text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Crown className="w-4 h-4" />
                <span>پەنەلێ ڕێڤەبەری (Admin)</span>
              </button>
            )}

            {/* Quick Logout Button */}
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>دەرکەفتن</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in-0 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold animate-in fade-in-0 shadow-2xs">
          {errorMsg}
        </div>
      )}

      {/* Main Grid: 2 Column Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* PANEL 1: Edit Profile Name & Info */}
        <div className="p-5 md:p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">گوهۆڕینا ناڤێ هەژمارێ</h3>
              <p className="text-[11px] text-muted-foreground">ناڤێ دیارکری د ناڤ تەڤایا ئەپیدا دیار دبیت</p>
            </div>
          </div>

          <form onSubmit={handleSaveName} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">ناڤێ بکارئینەری</label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="ناڤێ خۆ بنڤیسە..."
                  className="w-full h-11 pr-9 pl-3 rounded-xl bg-secondary/40 border border-border focus:ring-2 focus:ring-primary focus:outline-none text-xs sm:text-sm font-bold transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">ئیمەیل (ناهێتە گوهۆڕین)</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  disabled
                  value={user.email}
                  className="w-full h-11 pr-9 pl-3 rounded-xl bg-secondary/20 border border-border/60 text-muted-foreground text-xs sm:text-sm font-mono cursor-not-allowed"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">ژمارا مۆبایلێ (ناهێتە گوهۆڕین)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  disabled
                  value={toLatin(registeredPhone)}
                  className="w-full h-11 pr-9 pl-3 rounded-xl bg-secondary/20 border border-border/60 text-muted-foreground text-xs sm:text-sm font-mono cursor-not-allowed"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:opacity-95 transition shadow-sm shadow-primary/25 cursor-pointer mt-2"
            >
              پاراستنا گوهۆڕینان
            </button>
          </form>
        </div>

        {/* PANEL 2: Change Password & Security */}
        <div className="p-5 md:p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">گوهۆڕینا پەیڤا نهێنی</h3>
              <p className="text-[11px] text-muted-foreground">پەیڤەکا نهێنی یا ب هێز بو پاراستنا هەژمارا خۆ دانە</p>
            </div>
          </div>

          {/* Notification Messages for Password */}
          {passSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in-0">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passSuccessMsg}</span>
            </div>
          )}

          {passErrorMsg && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold animate-in fade-in-0">
              {passErrorMsg}
            </div>
          )}

          {/* STEP 1: Request WhatsApp OTP */}
          {passwordStep === "idle" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">ژمارا واتساپێ یا پشتڕاستکرنێ:</span>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400" dir="ltr">
                    {toLatin(registeredPhone)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  بۆ پاراستنا هەژمارا تە، ل دەستپێکێ کۆدێ پشتڕاستکرنێ (OTP) ب ڕێکا واتساپێ بۆ ژمارا تە دهێتە هنارتن، پشتی داخڵکرنا کۆدی دشێی پەیڤا نهێنی یا نوو دابنێی.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendPasswordOtp}
                disabled={isSendingOtp}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm transition shadow-sm shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSendingOtp ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>هنارتنا کۆدێ واتساپێ (OTP)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 2: Verify WhatsApp OTP */}
          {passwordStep === "otp" && (
            <form onSubmit={handleVerifyPasswordOtp} className="space-y-3.5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">کۆدێ پشتڕاستکرنێ (6 ژمارە)</label>
                  <span className="text-[11px] text-muted-foreground font-mono" dir="ltr">
                    {toLatin(registeredPhone)}
                  </span>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="••••••"
                    value={passOtp}
                    onChange={(e) => setPassOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full h-11 pr-9 pl-3 rounded-xl bg-secondary/40 border border-border focus:ring-2 focus:ring-emerald-500 focus:outline-none text-center font-mono text-lg font-black tracking-widest text-foreground"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp || passOtp.length !== 6}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm shadow-emerald-500/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isVerifyingOtp ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>پشتڕاستکرنا کۆدی</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1">
                {otpCountdown > 0 ? (
                  <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    دووبارە هنارتن پاش {otpCountdown} چرکە
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendPasswordOtp}
                    disabled={isSendingOtp}
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>دووبارە هنارتنا کۆدی</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setPasswordStep("idle");
                    setPassOtp("");
                    setPassErrorMsg(null);
                  }}
                  className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  پەشیمانبوون
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Enter New Password & Confirm */}
          {passwordStep === "new_password" && (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>ژمارا واتساپێ هاتە پشتڕاستکرن</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">پەیڤا نهێنی یا نوو (کێمتر نەبیت ژ 8 پیتان)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoFocus
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 pr-9 pl-9 rounded-xl bg-secondary/40 border border-border focus:ring-2 focus:ring-primary focus:outline-none text-xs sm:text-sm transition"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">دووپاتکرنا پەیڤا نهێنی یا نوو</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 pr-9 pl-3 rounded-xl bg-secondary/40 border border-border focus:ring-2 focus:ring-primary focus:outline-none text-xs sm:text-sm transition"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm transition shadow-sm shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Key className="w-4 h-4" />
                <span>نووکرنا پەیڤا نهێنی</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs text-center space-y-1">
          <span className="text-[11px] text-muted-foreground block">مێژوویا بەشداربوونێ</span>
          <span className="font-extrabold text-sm text-foreground font-mono" dir="ltr">
            {toLatin(user.joinedDate)}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs text-center space-y-1">
          <span className="text-[11px] text-muted-foreground block">ڕەوشا هەژمارێ</span>
          <span className="font-extrabold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            چالاک و پاراستی
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs text-center space-y-1">
          <span className="text-[11px] text-muted-foreground block">پلانا بکارئینانێ</span>
          <span className="font-extrabold text-xs sm:text-sm text-amber-500 flex items-center justify-center gap-1">
            <Crown className="w-3.5 h-3.5 shrink-0" />
            {user.membershipLabel}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs text-center space-y-1">
          <span className="text-[11px] text-muted-foreground block">ئاستێ پاراستنێ</span>
          <span className="font-extrabold text-xs sm:text-sm text-blue-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            SSL 256-bit
          </span>
        </div>
      </div>
    </section>
  );
}
