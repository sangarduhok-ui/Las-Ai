import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Detects whether a text is predominantly LTR (e.g. English, Latin script) or RTL (Kurdish, Arabic, Persian).
 */
export function detectTextDirection(text: string | null | undefined): "ltr" | "rtl" {
  if (!text || !text.trim()) return "rtl";
  // Remove markdown code fences and URLs
  const clean = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .trim();

  // Arabic / Kurdish / Persian Unicode ranges
  const rtlChars = clean.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g);
  const rtlCount = rtlChars ? rtlChars.length : 0;

  // Latin / English characters
  const ltrChars = clean.match(/[a-zA-Z]/g);
  const ltrCount = ltrChars ? ltrChars.length : 0;

  if (ltrCount > rtlCount) return "ltr";
  if (rtlCount > 0) return "rtl";

  // Fallback to first strong directional character
  for (const char of clean) {
    if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(char)) return "rtl";
    if (/[a-zA-Z]/.test(char)) return "ltr";
  }

  return "rtl";
}

export function isTextLtr(text: string | null | undefined): boolean {
  return detectTextDirection(text) === "ltr";
}

/**
 * Converts Eastern Arabic-Indic (0123456789) and Persian (0123456789) numerals to Western digits (0-9).
 */
export function toWesternDigits(str: string | null | undefined): string {
  if (!str) return str ?? "";
  return str
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
}
