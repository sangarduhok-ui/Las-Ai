import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut, X } from "lucide-react";

export function LogoutConfirmModal() {
  const { isLogoutConfirmOpen, cancelLogout, confirmLogout, user } = useAuth();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLogoutConfirmOpen) {
        cancelLogout();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLogoutConfirmOpen, cancelLogout]);

  if (!isLogoutConfirmOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
      onClick={cancelLogout}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md rounded-3xl bg-card border border-border/90 shadow-2xl p-6 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={cancelLogout}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-secondary/80 hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer"
          aria-label="گرتن"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-destructive/20 via-rose-500/15 to-red-500/10 border border-destructive/30 text-destructive mx-auto flex items-center justify-center shadow-lg shadow-destructive/15">
          <LogOut className="w-7 h-7" />
        </div>

        {/* Texts */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-black text-foreground">
            تۆ پشتڕاستی دێ دەرکەڤی؟
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {user ? (
              <>
                ئەرێ تو پشتڕاستی دڤێت ژ هەژمارا <span className="font-bold text-foreground font-mono">({user.name})</span> دەرکەڤی؟ داتایێن تە د پاراستی نە.
              </>
            ) : (
              "ئەرێ تو پشتڕاستی دڤێت ژ هەژمارا خۆ دەرکەڤی؟ هەمی پێزانینێن تە د پاراستی نە."
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
          {/* Cancel (No) */}
          <button
            type="button"
            onClick={cancelLogout}
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-secondary/80 hover:bg-secondary text-foreground font-bold text-xs sm:text-sm border border-border transition cursor-pointer active:scale-98"
          >
            نەخێر، بمینە
          </button>

          {/* Confirm (Yes) */}
          <button
            type="button"
            onClick={() => confirmLogout()}
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-extrabold text-xs sm:text-sm shadow-md shadow-destructive/25 transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>بەلێ، دەرکەڤە</span>
          </button>
        </div>
      </div>
    </div>
  );
}
