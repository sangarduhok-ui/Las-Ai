import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  Crown,
  ChevronDown,
  Sparkles,
  Zap,
  Gift,
} from "lucide-react";

export function UserNavButton({ onSelectSection }: { onSelectSection?: (section: string) => void }) {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isPro,
    openAuthModal,
    logout,
    dailyCredits,
    maxDailyCredits,
    bonusCredits,
    openProModal,
  } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => openAuthModal("login")}
          className="h-8.5 px-3 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 hover:border-primary text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">چوونە ژوور</span>
          <span className="sm:hidden">چوونەژوور</span>
        </button>

        <button
          onClick={() => openAuthModal("register")}
          className="hidden md:flex h-8.5 px-3.5 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition shadow-xs shadow-primary/25 items-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>خۆتۆمارکرن</span>
        </button>
      </div>
    );
  }

  const firstName = user.name ? user.name.trim().split(/\s+/)[0] : "بکارئینەر";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="h-8.5 pr-1.5 pl-2.5 rounded-full bg-card border border-border/80 hover:border-primary/50 text-foreground transition flex items-center gap-1.5 shadow-2xs group cursor-pointer text-xs"
      >
        <div className="relative">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center overflow-hidden shadow-xs">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{firstName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-card" />
        </div>

        <span className="font-bold text-xs text-foreground hidden sm:inline-block max-w-[100px] truncate">
          {firstName}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform duration-200 ${
            dropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl bg-card border border-border/80 shadow-2xl p-2.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150 text-right backdrop-blur-xl">
          {/* Header User Card */}
          <div
            onClick={() => {
              setDropdownOpen(false);
              if (onSelectSection) {
                onSelectSection("profile");
              } else {
                openAuthModal("profile");
              }
            }}
            className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 border border-border/60 mb-2 space-y-2.5 cursor-pointer transition group"
            title="دیتنا پرۆفایل و هەژمارا من"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center overflow-hidden shadow-xs shrink-0 group-hover:scale-105 transition">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-sm text-foreground truncate group-hover:text-primary transition">
                  {user.name}
                </h4>
                <p className="text-[11px] text-muted-foreground font-mono truncate" dir="ltr">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Plan Badge / Status */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(false);
                if (onSelectSection) onSelectSection("pricing");
              }}
              className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-background hover:bg-secondary/70 border border-border/70 text-xs cursor-pointer transition"
              title="دیتنا پلان و بهایێ (Pro Plan)"
            >
              <span className="text-[11px] text-muted-foreground font-medium">پلانا نوکە:</span>
              <span className="font-bold text-[11px] text-primary flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-500" />
                {user.membershipLabel}
              </span>
            </div>

            {/* Daily Credits Bar – for other premium/advanced tools */}
            {!isPro && (
              <div className="px-3 py-2 rounded-lg bg-background border border-border/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    کرێدیتێن ڕۆژانە
                  </span>
                  <span
                    className={`text-[11px] font-extrabold ${
                      dailyCredits === 0
                        ? "text-destructive"
                        : dailyCredits <= 3
                        ? "text-amber-500"
                        : "text-emerald-500"
                    }`}
                  >
                    {dailyCredits} / {maxDailyCredits}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dailyCredits === 0
                        ? "bg-destructive"
                        : dailyCredits <= 3
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${(dailyCredits / maxDailyCredits) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {dailyCredits === 0
                    ? "کرێدیتێن ئەڤڕۆ ب داوی هاتن — نیڤا شەڤێ نوودبنەڤە"
                    : `نیڤا شەڤێ نوودبیتەڤە · ${dailyCredits} کرێدیت ماینە`}
                </p>
                {dailyCredits === 0 && (
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      openProModal();
                    }}
                    className="w-full mt-1 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 text-[11px] font-extrabold flex items-center justify-center gap-1 hover:opacity-90 transition cursor-pointer"
                  >
                    <Crown className="w-3 h-3" />
                    پلانا پڕۆ — بکارئینانا بێ سنور
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Menu Actions */}
          <div className="space-y-0.5">
            {isAdmin && (
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  if (onSelectSection) onSelectSection("admin");
                }}
                className="w-full px-3 py-2.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 flex items-center justify-between transition cursor-pointer border border-amber-500/25 mb-1"
              >
                <div className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>پەنەلێ ڕێڤەبەری (Admin Panel)</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black">
                  Admin
                </span>
              </button>
            )}

            {/* Bonus Credits Pill if any */}
            {bonusCredits > 0 && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1">
                  <Gift className="w-3 h-3 text-emerald-500" />
                  کریدیتێن دیاری (بۆنوس):
                </span>
                <span className="font-extrabold text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  +{bonusCredits}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                setDropdownOpen(false);
                if (onSelectSection) onSelectSection("pricing");
              }}
              className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>پلانا پرۆ</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                Pro
              </span>
            </button>

            <button
              onClick={() => {
                setDropdownOpen(false);
                if (onSelectSection) {
                  onSelectSection("invite");
                } else {
                  openAuthModal("profile");
                }
              }}
              className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Gift className="w-4 h-4 text-pink-500" />
                <span>داخوازکرنا هەڤالان</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-pink-500/10 text-pink-600 dark:text-pink-400 font-extrabold border border-pink-500/20">
                +25 🎁
              </span>
            </button>

            <button
              onClick={() => {
                setDropdownOpen(false);
                if (onSelectSection) {
                  onSelectSection("profile");
                } else {
                  openAuthModal("profile");
                }
              }}
              className="w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span>پرۆفایل و هەژمارا من</span>
              </div>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-border/60 mt-2 pt-1.5">
            <button
              onClick={() => {
                setDropdownOpen(false);
                logout();
              }}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 flex items-center gap-2.5 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>دەرکەفتن ژ هەژمارێ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
