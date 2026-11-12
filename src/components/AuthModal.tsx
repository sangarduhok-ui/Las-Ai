import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  LogOut,
  Crown,
  KeyRound,
  Phone,
  Calendar,
  Camera,
  Key,
  RotateCcw,
  ChevronDown,
  Search,
  MessageSquare,
  Clock,
  MessageCircle,
} from "lucide-react";

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.83-1.56 1.56-3.63 2.41-5.82 2.41-1.45 0-2.87-.38-4.13-1.12l-.3-.18-3.11.82.83-3.03-.19-.31c-.81-1.3-1.24-2.81-1.24-4.42 0-4.54 3.7-8.24 8.24-8.24zm4.56 11.64c-.25-.72-.73-1.48-.81-1.71-.09-.23-.13-.4.13-.56.25-.17.81-.65 1-.8.19-.15.21-.3.08-.55-.13-.25-.39-1.07-1.25-2.03-.67-.75-1.5-1.25-1.75-1.4-.25-.15-.39-.02-.51.11-.11.11-.29.25-.44.38-.15.13-.25.17-.42.25-.17.08-.31.04-.44-.02-.13-.06-1.35-.56-1.85-.77-.49-.2-.42-.41-.43-.56h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.48-.61 1.69-1.2.21-.58.21-1.09.15-1.2-.06-.11-.23-.17-.48-.29z" />
    </svg>
  );
}

interface CountryInfo {
  name: string;
  nameKu: string;
  dial: string;
  flag: string;
  code: string;
}

const COUNTRIES: CountryInfo[] = [
  { name: "Iraq", nameKu: "عێراق", dial: "+964", flag: "🇮🇶", code: "IQ" },
  { name: "Turkey", nameKu: "تورکیا", dial: "+90", flag: "🇹🇷", code: "TR" },
  { name: "Iran", nameKu: "ئێران", dial: "+98", flag: "🇮🇷", code: "IR" },
  { name: "Syria", nameKu: "سووریا", dial: "+963", flag: "🇸🇾", code: "SY" },
  { name: "Germany", nameKu: "ئەڵمانیا", dial: "+49", flag: "🇩🇪", code: "DE" },
  { name: "United Kingdom", nameKu: "بەریتانیا", dial: "+44", flag: "🇬🇧", code: "GB" },
  { name: "United States", nameKu: "ئەمریکا", dial: "+1", flag: "🇺🇸", code: "US" },
  { name: "Canada", nameKu: "کەنەدا", dial: "+1", flag: "🇨🇦", code: "CA" },
  { name: "Sweden", nameKu: "سوید", dial: "+46", flag: "🇸🇪", code: "SE" },
  { name: "Netherlands", nameKu: "هۆڵەندا", dial: "+31", flag: "🇳🇱", code: "NL" },
  { name: "United Arab Emirates", nameKu: "ئیمارات", dial: "+971", flag: "🇦🇪", code: "AE" },
  { name: "Saudi Arabia", nameKu: "سعودیە", dial: "+966", flag: "🇸🇦", code: "SA" },
  { name: "Jordan", nameKu: "ئوردن", dial: "+962", flag: "🇯🇴", code: "JO" },
  { name: "Lebanon", nameKu: "لوبنان", dial: "+961", flag: "🇱🇧", code: "LB" },
  { name: "Egypt", nameKu: "میسر", dial: "+20", flag: "🇪🇬", code: "EG" },
  { name: "Qatar", nameKu: "قەتەر", dial: "+974", flag: "🇶🇦", code: "QA" },
  { name: "Kuwait", nameKu: "کووەیت", dial: "+965", flag: "🇰🇼", code: "KW" },
  { name: "France", nameKu: "فەرەنسا", dial: "+33", flag: "🇫🇷", code: "FR" },
  { name: "Norway", nameKu: "نەرویج", dial: "+47", flag: "🇳🇴", code: "NO" },
  { name: "Denmark", nameKu: "دانیمارک", dial: "+45", flag: "🇩🇰", code: "DK" },
  { name: "Finland", nameKu: "فینلاند", dial: "+358", flag: "🇫🇮", code: "FI" },
  { name: "Switzerland", nameKu: "سویسرا", dial: "+41", flag: "🇨🇭", code: "CH" },
  { name: "Austria", nameKu: "نەمسا", dial: "+43", flag: "🇦🇹", code: "AT" },
  { name: "Belgium", nameKu: "بەلجیکا", dial: "+32", flag: "🇧🇪", code: "BE" },
  { name: "Australia", nameKu: "ئوسترالیا", dial: "+61", flag: "🇦🇺", code: "AU" },
  { name: "Russia", nameKu: "ڕووسیا", dial: "+7", flag: "🇷🇺", code: "RU" },
  { name: "China", nameKu: "چین", dial: "+86", flag: "🇨🇳", code: "CN" },
  { name: "India", nameKu: "هندستان", dial: "+91", flag: "🇮🇳", code: "IN" },
];

export function AuthModal() {
  const {
    user,
    isAuthenticated,
    isAuthModalOpen,
    authModalView,
    openAuthModal,
    closeAuthModal,
    login,
    register,
    sendPhoneOtp,
    loginWithPhoneOtp,
    resetUserPassword,
    logout,
    updateProfile,
    useReferralCode,
  } = useAuth();

  // Form states
  const [identifier, setIdentifier] = useState(""); // Email or Phone for login
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Country selector state
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(COUNTRIES[0]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryMenuRef = useRef<HTMLDivElement>(null);

  // Registration OTP step state
  const [registerStep, setRegisterStep] = useState<"form" | "otp">("form");
  const [otpCode, setOtpCode] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [formattedTargetPhone, setFormattedTargetPhone] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password WhatsApp OTP state
  const [forgotStep, setForgotStep] = useState<"phone" | "otp" | "new_password" | "done">("phone");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotCountdown, setForgotCountdown] = useState(0);
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirmPass, setForgotConfirmPass] = useState("");
  const [showForgotPass, setShowForgotPass] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profileTab, setProfileTab] = useState<"name" | "password">("name");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name);
    }
  }, [user]);

  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
    setForgotStep("phone");
    setForgotPhone("");
    setForgotOtp("");
    setForgotNewPass("");
    setForgotConfirmPass("");
    setNewPassword("");
    setConfirmPassword("");
    setRegisterStep("form");
    setOtpCode("");
    setCountryDropdownOpen(false);

    // Auto-detect referral code from URL if present (e.g. ?ref=INV-XXXX-XXXX)
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get("ref");
        if (ref && ref.toUpperCase().startsWith("INV-")) {
          setReferralCode(ref.toUpperCase());
        }
      } catch {}
    }
  }, [authModalView, isAuthModalOpen, profileTab]);

  // Click outside to close country dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryMenuRef.current && !countryMenuRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Countdown timer for Forgot OTP resend
  useEffect(() => {
    if (forgotCountdown <= 0) return;
    const timer = setInterval(() => {
      setForgotCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [forgotCountdown]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("قەبارەی وێنەکە با لە 5 مێگابایت کەمتر بێت.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateProfile({ avatar: dataUrl });
        setSuccessMsg("وێنەی پڕۆفایل بە سەرکەوتوویی نوێکرایەوە.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!newPassword || newPassword.length < 8) {
      setError("هیڤیە پەیڤا نهێنی یا نوو ژ 8 پیتان کێمتر نەبیت.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("دووبارەکرنا پەیڤا نهێنی وەکی ئێک نینە.");
      return;
    }

    setSuccessMsg("پەیڤا نهێنی ب سەرکەفتیانە هاتە نووکرن.");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Handle ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: "", color: "bg-muted" };
    if (pass.length < 8) return { score: 1, text: "کەمتر لە 8 پیت", color: "bg-rose-500", width: "w-1/4" };

    let score = 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, text: "لاواز", color: "bg-rose-500", width: "w-1/4" };
    if (score <= 2) return { score: 2, text: "مامناوەند", color: "bg-amber-500", width: "w-2/4" };
    if (score <= 3) return { score: 3, text: "باش", color: "bg-blue-500", width: "w-3/4" };
    return { score: 4, text: "زۆر بەهێز", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = getPasswordStrength(password);

  // ── SUBMIT LOGIN ──
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(identifier, password);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || "شاشیەک ڕوویدا د دەمێ چوونەژوورڤە دا.");
    }
  };

  // Helper to construct normalized full phone number
  const getFullPhoneNumber = () => {
    let clean = phone.replace(/\D/g, "");
    if (selectedCountry.code === "IQ" && clean.startsWith("0")) {
      clean = clean.substring(1);
    } else if (clean.startsWith("0")) {
      clean = clean.substring(1);
    }
    return `${selectedCountry.dial}${clean}`;
  };

  // ── SUBMIT REGISTER STEP 1: VALIDATE & SEND WHATSAPP OTP ──
  const handleRegisterSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || name.trim().length < 2) {
      setError("هیڤیە ناڤێ خۆ یێ دروست بنڤیسی.");
      return;
    }

    if (!email || !email.includes("@")) {
      setError("هیڤیە ئیمەیڵەکێ دروست بنڤیسی.");
      return;
    }

    const digitsOnly = phone.replace(/\D/g, "");
    if (!phone || digitsOnly.length < 8) {
      setError("هیڤیە ژمارەکا مۆبایلێ یا دروست بنڤیسی.");
      return;
    }

    if (!agreeTerms) {
      setError("هیڤیە ل دەستپێکێ مەرج و ڕێنمایان قەبوول بکەی.");
      return;
    }

    if (password.length < 8) {
      setError("هیڤیە پەیڤا نهێنی ژ 8 پیتان کێمتر نەبیت.");
      return;
    }

    const fullPhone = getFullPhoneNumber();
    setFormattedTargetPhone(fullPhone);

    setIsSubmitting(true);
    const res = await sendPhoneOtp(fullPhone);
    setIsSubmitting(false);

    if (res.success) {
      setRegisterStep("otp");
      setOtpCountdown(45);
      setSuccessMsg(res.message || "کۆدێ پشتڕاستکرنێ ب ڕێکا واتساپێ هاتە هنارتن.");
    } else {
      setError(res.error || "کۆدێ واتساپێ نەهاتە هنارتن.");
    }
  };

  // ── SUBMIT REGISTER STEP 2: VERIFY OTP & COMPLETE REGISTRATION ──
  const handleRegisterVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpCode || otpCode.trim().length !== 6) {
      setError("هیڤیە کۆدێ 6 ژمارەیی بنڤیسی.");
      return;
    }

    setIsSubmitting(true);
    const res = await loginWithPhoneOtp(formattedTargetPhone || getFullPhoneNumber(), otpCode, name, email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || "کۆد نەدروستە یان دەمێ وی بسەرڤە چویە.");
    } else {
      // If user entered a referral code, apply it now to award 25 bonus credits
      if (referralCode && referralCode.trim()) {
        useReferralCode(referralCode.trim());
      }
    }
  };

  // Helper to construct normalized full phone number for forgot
  const getForgotFullPhoneNumber = () => {
    let clean = forgotPhone.replace(/\D/g, "");
    if (selectedCountry.code === "IQ" && clean.startsWith("0")) {
      clean = clean.substring(1);
    } else if (clean.startsWith("0")) {
      clean = clean.substring(1);
    }
    return `${selectedCountry.dial}${clean}`;
  };

  // ── SUBMIT FORGOT STEP 1: SEND OTP TO WHATSAPP ──
  const handleForgotSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const clean = forgotPhone.replace(/\D/g, "");
    if (!clean || clean.length < 8) {
      setError("هیڤیە ژمارەکا مۆبایلێ یا دروست (واتساپ) بنڤیسی.");
      return;
    }

    const fullPhone = getForgotFullPhoneNumber();
    setIsSubmitting(true);
    const res = await sendPhoneOtp(fullPhone);
    setIsSubmitting(false);

    if (res.success) {
      setForgotStep("otp");
      setForgotCountdown(45);
      setSuccessMsg(res.message || "کۆدێ پشتڕاستکرنێ ب ڕێکا واتساپێ هاتە هنارتن.");
    } else {
      setError(res.error || "کۆدێ واتساپێ نەهاتە هنارتن.");
    }
  };

  // ── SUBMIT FORGOT STEP 2: VERIFY OTP ──
  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setError("هیڤیە کۆدێ 6 ژمارەیی بنڤیسی.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/whatsapp-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_otp",
          phone: getForgotFullPhoneNumber(),
          code: forgotOtp.trim(),
        }),
      });
      const data = await res.json();
      setIsSubmitting(false);

      if (!res.ok || !data.success) {
        setError(data.error || "کۆدەکە هەڵەیە یان بەسەرچووە.");
        return;
      }

      setForgotStep("new_password");
      setSuccessMsg("ژمارەکەت بە سەرکەوتوویی پشتڕاستکرایەوە! ئێستا وشەی نهێنی نوێ دابنێ.");
    } catch (err) {
      setIsSubmitting(false);
      setError("کێشەیەک لە پەیوەندی هەیە.");
    }
  };

  // ── SUBMIT FORGOT STEP 3: SET NEW PASSWORD ──
  const handleForgotSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!forgotNewPass || forgotNewPass.length < 8) {
      setError("وشەی نهێنی با کەمتر نەبێت لە 8 پیت.");
      return;
    }

    if (forgotNewPass !== forgotConfirmPass) {
      setError("دووپاتکردنەوەی وشەی نهێنی وەک یەک نییە.");
      return;
    }

    setIsSubmitting(true);
    const res = await resetUserPassword(getForgotFullPhoneNumber(), forgotNewPass);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || "نەهاتە گوهۆڕین.");
      return;
    }

    setForgotStep("done");
    setSuccessMsg("وشەی نهێنی نوێ بە سەرکەوتوویی پاشەکەوتکرا!");
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.nameKu.includes(countrySearch) ||
      c.dial.includes(countrySearch)
  );

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
        onClick={closeAuthModal}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-md my-auto rounded-3xl bg-card border border-border/80 shadow-2xl overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-200 text-right max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col"
        style={{
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Top Decorative Gradient Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 shrink-0" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-3.5 left-3.5 w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition border border-border/60 cursor-pointer z-20 shadow-xs"
          aria-label="داخستن"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* ── VIEW: USER PROFILE (When logged in and user clicks profile) ── */}
          {authModalView === "profile" && user ? (
            <div className="p-4 sm:p-5 space-y-3">
              {/* Hidden Avatar File Input */}
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarFileChange}
                accept="image/*"
                className="hidden"
              />

              {/* Profile Header */}
              <div className="flex items-center gap-3 border-b border-border/70 pb-3">
                {/* Clickable Avatar for Upload */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative shrink-0 group cursor-pointer focus:outline-none"
                  title="کلیک بکە بۆ گۆڕینی وێنەی پڕۆفایل"
                >
                  <div className="w-13 h-13 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-md bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-600 overflow-hidden group-hover:opacity-90 transition">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  {/* Camera overlay indicator */}
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center shadow-xs">
                    <Camera className="w-2.5 h-2.5 text-white" />
                  </div>
                </button>

                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-base text-foreground truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono truncate" dir="ltr">
                    {user.email}
                  </p>
                  {user.phone && (
                    <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5" dir="ltr">
                      📱 {user.phone.replace(/[\u0660-\u0669]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x0660 + 48)).replace(/[\u06f0-\u06f9]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x06f0 + 48))}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                      <Crown className="w-2.5 h-2.5" />
                      {user.membershipLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback messages */}
              {error && (
                <div className="p-2 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium animate-in fade-in-0">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium animate-in fade-in-0 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Quick Stats Grid - Compact */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-secondary/30 border border-border/50 text-center">
                  <span className="text-[10px] text-muted-foreground block mb-0.5">بەرواری بەشداربوون</span>
                  <span className="font-bold text-xs text-foreground font-mono" dir="ltr">
                    {user.joinedDate.replace(/[\u0660-\u0669]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x0660 + 48)).replace(/[\u06f0-\u06f9]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x06f0 + 48))}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-secondary/30 border border-border/50 text-center">
                  <span className="text-[10px] text-muted-foreground block mb-0.5">دۆخی هەژمار</span>
                  <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    چالاک و پارێزراو
                  </span>
                </div>
              </div>

              {/* Settings Sub-Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-secondary/60 border border-border/80 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setProfileTab("name")}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    profileTab === "name"
                      ? "bg-card text-foreground shadow-xs font-extrabold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  گۆڕینی ناوی هەژمار
                </button>
                <button
                  type="button"
                  onClick={() => setProfileTab("password")}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    profileTab === "password"
                      ? "bg-card text-foreground shadow-xs font-extrabold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  گۆڕینی وشەی نهێنی
                </button>
              </div>

              {/* TAB 1: Edit Name */}
              {profileTab === "name" ? (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground block">
                    ناوی بەکارهێنەر
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full h-10 pr-9 pl-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:outline-none text-xs sm:text-sm font-bold"
                        placeholder="ناوی نوێ بنووسە..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (editName.trim()) {
                          updateProfile({ name: editName.trim() });
                          setSuccessMsg("ناوەکەت بە سەرکەوتوویی نوێکرایەوە.");
                        }
                      }}
                      className="px-4 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition cursor-pointer shrink-0 shadow-2xs"
                    >
                      پاشەکەوت
                    </button>
                  </div>
                </div>
              ) : (
                /* TAB 2: Change Password */
                <form onSubmit={handleChangePasswordSubmit} className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">وشەی نهێنی نوێ (لانی کەم 8 پیت)</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-10 pr-9 pl-9 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:outline-none text-xs sm:text-sm transition"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">دووپاتکردنەوەی وشەی نهێنی نوێ</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-10 pr-9 pl-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:outline-none text-xs sm:text-sm transition"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:opacity-95 transition shadow-md shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Key className="w-4 h-4" />
                    پاراستنا پەیڤا نهێنی یا نوو
                  </button>
                </form>
              )}

              {/* Logout Action */}
              <div className="pt-2 border-t border-border/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  دەرکەفتن ژ هەژمارێ
                </button>
              </div>
            </div>
          ) : authModalView === "forgot" ? (
            /* ── VIEW: FORGOT PASSWORD WITH WHATSAPP OTP ── */
            <div className="p-5 sm:p-6 space-y-4">
              <div className="text-right space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-foreground">
                  {forgotStep === "phone" && "ژمارا مۆبایلا خۆ بنڤیسە"}
                  {forgotStep === "otp" && "کۆدێ پشتڕاستکرنێ یێ WhatsApp"}
                  {forgotStep === "new_password" && "دانانا پەیڤا نهێنی یا نوو"}
                  {forgotStep === "done" && "پەیڤا نهێنی هاتە نووکرن!"}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {forgotStep === "phone" && "وێ ژمارا پێ هاتیە تۆمارکرن بنڤیسە دا کۆدێ OTP ب ڕێکا واتساپێ بگەهیتە تە."}
                  {forgotStep === "otp" && `کۆدێ 6 ژمارەیی بنڤیسە یێ بۆ (${getForgotFullPhoneNumber()}) هاتیە هنارتن.`}
                  {forgotStep === "new_password" && "هیڤیە پەیڤەکا نهێنی یا نوو و ب هێز دابنێ بۆ هەژمارا خۆ."}
                  {forgotStep === "done" && "پیرۆزە! پەیڤا نهێنی یا هەژمارا تە ب سەرکەفتیانە هاتە نووکرن."}
                </p>
              </div>

              {/* Error banner */}
              {error && (
                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium animate-in fade-in-0">
                  {error}
                </div>
              )}

              {/* Success message */}
              {successMsg && forgotStep !== "done" && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium animate-in fade-in-0 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ── STEP 1: PHONE INPUT ── */}
              {forgotStep === "phone" && (
                <form onSubmit={handleForgotSendOtp} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground block">
                      ژمارەی مۆبایل (واتساپ)
                    </label>

                    <div
                      className="relative flex items-center bg-secondary/40 border border-border rounded-xl focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition"
                      dir="ltr"
                      ref={countryMenuRef}
                    >
                      {/* Left: Country Picker Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                        className="h-10 px-2.5 flex items-center gap-1.5 border-r border-border/80 hover:bg-secondary/80 rounded-l-xl transition cursor-pointer text-xs font-bold text-foreground shrink-0 select-none"
                        title="هەڵبژاردنی وڵات"
                      >
                        <span className="text-base leading-none">{selectedCountry.flag}</span>
                        <span className="font-mono text-xs text-foreground" dir="ltr">
                          {selectedCountry.dial}
                        </span>
                        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${countryDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {/* Phone number input */}
                      <input
                        type="tel"
                        required
                        placeholder="750 123 4567"
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value)}
                        className="w-full h-10 px-3 bg-transparent text-xs sm:text-sm font-mono text-foreground focus:outline-none tracking-wider placeholder:text-muted-foreground/60"
                        dir="ltr"
                      />

                      {/* Floating Dropdown List */}
                      {countryDropdownOpen && (
                        <div
                          className="absolute left-0 top-full mt-1.5 w-64 max-h-56 overflow-y-auto rounded-2xl bg-card border border-border shadow-xl z-50 p-1.5 text-right space-y-1 animate-in fade-in-0 zoom-in-95 duration-150"
                          dir="rtl"
                        >
                          <div className="p-1 sticky top-0 bg-card z-10">
                            <input
                              type="text"
                              placeholder="گەڕان بەدوای وڵات..."
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              className="w-full h-8 px-2.5 rounded-lg bg-secondary text-xs focus:outline-none focus:ring-1 focus:ring-primary text-right"
                              autoFocus
                            />
                          </div>
                          {filteredCountries.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setCountryDropdownOpen(false);
                                setCountrySearch("");
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-secondary transition cursor-pointer ${
                                selectedCountry.code === c.code ? "bg-primary/10 text-primary font-bold" : "text-foreground"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span>{c.flag}</span>
                                <span>{c.nameKu}</span>
                              </div>
                              <span className="font-mono text-[11px] text-muted-foreground" dir="ltr">
                                {c.dial}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span>ناردنی کۆدی پشتڕاستکردنەوە بۆ WhatsApp</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ── STEP 2: OTP VERIFICATION ── */}
              {forgotStep === "otp" && (
                <form onSubmit={handleForgotVerifyOtp} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">کۆدی پشتڕاستکردنەوە (6 ژمارە)</label>
                    <div className="relative">
                      <Key className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        placeholder="••••••"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ""))}
                        className="w-full h-12 pr-9 pl-3 rounded-xl bg-secondary/40 border border-border focus:ring-2 focus:ring-emerald-500 focus:outline-none text-center font-mono text-lg font-black tracking-widest text-foreground"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || forgotOtp.length !== 6}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>پشتڕاستکردنەوەی کۆد</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    {forgotCountdown > 0 ? (
                      <span className="text-[11px] text-muted-foreground font-mono flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        دووبارە ناردنەوە پاش {forgotCountdown} چرکە
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleForgotSendOtp}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>دووبارە ناردنەوەی کۆد</span>
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* ── STEP 3: SET NEW PASSWORD ── */}
              {forgotStep === "new_password" && (
                <form onSubmit={handleForgotSetNewPassword} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">وشەی نهێنی نوێ</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type={showForgotPass ? "text" : "password"}
                        required
                        placeholder="کەمتر نەبێت لە 8 پیت..."
                        value={forgotNewPass}
                        onChange={(e) => setForgotNewPass(e.target.value)}
                        className="w-full h-10 pr-9 pl-9 rounded-xl bg-secondary/40 border border-border focus:ring-2 focus:ring-primary focus:outline-none text-xs sm:text-sm"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPass(!showForgotPass)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">دووپاتکردنەوەی وشەی نهێنی نوێ</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type={showForgotPass ? "text" : "password"}
                        required
                        placeholder="دووبارە وشەی نهێنی بنووسەوە..."
                        value={forgotConfirmPass}
                        onChange={(e) => setForgotConfirmPass(e.target.value)}
                        className="w-full h-10 pr-9 pl-3 rounded-xl bg-secondary/40 border border-border focus:ring-2 focus:ring-primary focus:outline-none text-xs sm:text-sm"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-black text-xs sm:text-sm hover:opacity-95 transition shadow-md shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>پاشەکەوتکردنی وشەی نهێنی نوێ</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ── STEP 4: SUCCESS DONE ── */}
              {forgotStep === "done" && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-right space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>وشەی نهێنی بە سەرکەوتوویی نوێکرایەوە!</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    نوکە دشێی ب پەیڤا نهێنی یا نوو بچیە د ناڤ هەژمارا خۆ دا.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      openAuthModal("login");
                      setForgotStep("phone");
                    }}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs hover:opacity-90 transition cursor-pointer"
                  >
                    چوونەژوورڤە بۆ هەژمارێ
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── VIEW: LOGIN & REGISTER TABS ── */
            <div className="p-5 sm:p-6 space-y-3.5">
              {/* Header / Title */}
              <div className="text-center flex flex-col items-center justify-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20 shadow-xs">
                  <img src="/logo.png" alt="Las AI Logo" className="w-3.5 h-3.5 rounded-full object-cover" />
                  <span className="font-extrabold">Las AI</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-foreground text-center">
                  {authModalView === "login" ? "چوونەژوورڤە بۆ هەژمارێ" : "چێکرنا هەژمارەکا نوو"}
                </h3>
              </div>

              {/* Segmented Switcher: Login vs Register */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-secondary/60 border border-border/80 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    openAuthModal("login");
                    setRegisterStep("form");
                    setError(null);
                  }}
                  className={`py-2 rounded-lg transition-all cursor-pointer ${
                    authModalView === "login"
                      ? "bg-card text-foreground shadow-xs font-extrabold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  چوونەژوورڤە
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openAuthModal("register");
                    setRegisterStep("form");
                    setError(null);
                  }}
                  className={`py-2 rounded-lg transition-all cursor-pointer ${
                    authModalView === "register"
                      ? "bg-card text-foreground shadow-xs font-extrabold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  چێکرنا هەژمارێ
                </button>
              </div>

              {/* Error banner */}
              {error && (
                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium animate-in fade-in-0">
                  {error}
                </div>
              )}

              {/* Success message */}
              {successMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium animate-in fade-in-0 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* ── LOGIN FORM ── */}
              {authModalView === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">ئیمەیل یان ژمارا مۆبایلێ</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="name@example.com"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full h-10 pr-9 pl-3 rounded-xl bg-secondary/40 border border-border focus:ring-2 focus:ring-primary focus:outline-none text-xs sm:text-sm transition"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">پەیڤا نهێنی</label>
                      <button
                        type="button"
                        onClick={() => openAuthModal("forgot")}
                        className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                      >
                        تە پەیڤا نهێنی ژبیرکریە؟
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-10 pr-9 pl-9 rounded-xl bg-secondary/40 border border-border focus:ring-2 focus:ring-primary focus:outline-none text-xs sm:text-sm transition"
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

                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer select-none">
                      من ل بیرا خۆ بینە ل سەر ڤی ئامێری
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 sm:h-11 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:opacity-95 transition shadow-md shadow-primary/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "چوونەژوورڤە"
                    )}
                  </button>
                </form>
              ) : registerStep === "form" ? (
                /* ── REGISTER STEP 1: FORM (Email + Phone + Name + Password) ── */
                <form onSubmit={handleRegisterSendOtp} className="space-y-3">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">ناڤێ تەواو</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="ناڤێ سێیانی بنڤیسە..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-10 pr-9 pl-3 rounded-xl bg-secondary/40 border border-border focus:ring-2 focus:ring-primary focus:outline-none text-xs sm:text-sm transition"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">ئیمەیل</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-10 pr-9 pl-3 rounded-xl bg-secondary/40 border border-border focus:ring-2 focus:ring-primary focus:outline-none text-xs sm:text-sm transition"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Phone with Country Picker */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground block">
                      ژمارا مۆبایلێ (واتساپ)
                    </label>

                    <div
                      className="relative flex items-center bg-secondary/40 border border-border rounded-xl focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition"
                      dir="ltr"
                      ref={countryMenuRef}
                    >
                      {/* Left: Country Picker Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                        className="h-10 px-2.5 flex items-center gap-1.5 border-r border-border/80 hover:bg-secondary/80 rounded-l-xl transition cursor-pointer text-xs font-bold text-foreground shrink-0 select-none"
                        title="هەلبژارتنا وەلاتێ"
                      >
                        <span className="text-base leading-none">{selectedCountry.flag}</span>
                        <span className="font-mono text-xs text-foreground" dir="ltr">
                          {selectedCountry.dial}
                        </span>
                        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${countryDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {/* Right: Phone Input */}
                      <input
                        type="tel"
                        required
                        placeholder={selectedCountry.code === "IQ" ? "0750 XXX XXXX" : "750 XXX XXXX"}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 h-10 px-3 bg-transparent text-xs sm:text-sm font-mono focus:outline-none text-foreground"
                        dir="ltr"
                      />

                      {/* Country Dropdown Popover */}
                      {countryDropdownOpen && (
                        <div className="absolute top-full left-0 mt-1.5 w-64 max-h-60 rounded-2xl bg-card border border-border/90 shadow-2xl p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150 flex flex-col text-right backdrop-blur-xl" dir="rtl">
                          {/* Search bar inside country picker */}
                          <div className="relative mb-2" dir="rtl">
                            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="لێگەڕیان بو وەلاتی..."
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              className="w-full h-8 pr-8 pl-2 rounded-lg bg-secondary/50 border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>

                          {/* Country List */}
                          <div className="overflow-y-auto flex-1 space-y-0.5 overscroll-contain">
                            {filteredCountries.map((country) => (
                              <button
                                key={country.code + country.dial}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setCountryDropdownOpen(false);
                                  setCountrySearch("");
                                }}
                                className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                                  selectedCountry.code === country.code && selectedCountry.dial === country.dial
                                    ? "bg-primary/15 text-primary font-bold"
                                    : "hover:bg-secondary text-foreground"
                                }`}
                              >
                                <span className="font-mono text-[11px] text-muted-foreground" dir="ltr">
                                  {country.dial}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs truncate">{country.nameKu}</span>
                                  <span className="text-base">{country.flag}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">پەیڤا نهێنی</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="کێمتر نەبیت ژ 8 پیتان..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-10 pr-9 pl-9 rounded-xl bg-secondary/40 border border-border focus:ring-2 focus:ring-primary focus:outline-none text-xs sm:text-sm transition"
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

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="space-y-1 pt-0.5">
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                          <span>هێزا پەیڤا نهێنی:</span>
                          <span className={strength.score >= 3 ? "text-emerald-500" : "text-amber-500"}>
                            {strength.text}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                    {/* Optional Referral Code */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">
                          کۆدا داخوازکرنێ (ئارەزوومەندانە)
                        </label>
                        <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded-md border border-pink-500/20">
                          +25 کرێدیتان 🎁
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="INV-XXXX-XXXX"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        className="w-full h-9 px-3 rounded-xl bg-secondary/40 border border-border focus:ring-2 focus:ring-pink-500 focus:outline-none text-xs font-mono tracking-wider transition uppercase"
                        dir="ltr"
                      />
                    </div>

                    {/* Terms */}
                  <div className="flex items-start gap-2 pt-0.5">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary cursor-pointer accent-primary"
                    />
                    <label htmlFor="terms" className="text-[11px] text-muted-foreground leading-snug cursor-pointer select-none">
                      ڕازی مە ب <span className="text-primary font-bold">مەرج و یاسایێن پاراستنا پێزانینان</span> ل Las AI.
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 sm:h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <WhatsAppIcon className="w-4 h-4" />
                        <span>خۆتۆمارکرن</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* ── REGISTER STEP 2: ENTER WHATSAPP OTP CODE ── */
                <form onSubmit={handleRegisterVerifyOtp} className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-500" />
                      <span dir="ltr">{formattedTargetPhone || getFullPhoneNumber()}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterStep("form");
                        setError(null);
                      }}
                      className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                    >
                      گوهۆڕینا پێزانینان
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block text-center">
                      کۆدێ 6 ژمارەیی یێ واتساپێ بنڤیسە:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      placeholder="••••••"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full h-12 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-emerald-500 focus:outline-none text-center font-mono text-xl tracking-[0.4em] font-extrabold transition text-foreground"
                      dir="ltr"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length !== 6}
                    className="w-full h-10 sm:h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm transition shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "پشتڕاستکرن و چوونەژوورڤە"
                    )}
                  </button>

                  {/* Resend OTP button */}
                  <div className="text-center pt-1">
                    {otpCountdown > 0 ? (
                      <span className="text-[11px] text-muted-foreground">
                        دووبارە فرێکرن پاش ({otpCountdown} چرکە)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRegisterSendOtp}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>دووبارە فرێکرنا کۆدی</span>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
