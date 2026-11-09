import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    setIsDark(isCurrentlyDark);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ai_pukhtana_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ai_pukhtana_theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? "گوهۆڕین بو دۆخێ ڕووناهی" : "گوهۆڕین بو دۆخێ تاری"}
      aria-label={isDark ? "گوهۆڕین بو دۆخێ ڕووناهی" : "گوهۆڕین بو دۆخێ تاری"}
      className={`relative inline-flex items-center justify-center w-8.5 h-8.5 rounded-full border border-border bg-card/80 backdrop-blur-md text-foreground transition-all duration-300 hover:scale-105 hover:bg-muted active:scale-95 shadow-2xs cursor-pointer ${className}`}
    >
      <Sun
        className={`w-4 h-4 text-amber-500 transition-transform duration-300 absolute ${
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`w-4 h-4 text-indigo-400 transition-transform duration-300 absolute ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />
    </button>
  );
}
