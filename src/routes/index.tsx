import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, lazy, Suspense, useMemo, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Layers,
  LineChart,
  Languages,
  PenTool,
  FileAudio,
  BookOpen,
  Sparkles,
  Zap,
  Check,
  Crown,
  Key,
  MessageCircle,
  FileText,
  Brain,
  Menu,
  X,
  GraduationCap,
  Wand2,
  ScanLine,
  CalendarCheck,
  ListOrdered,
  Sigma,
  Video,
  ClipboardCheck,
  BookA,
  ShieldCheck,
  FileSearch,
  Mail,
  Instagram,
  Facebook,
  FilePlus2,
  Scissors,
  FileDown,
  FileType2,
  Presentation,
  Table2,
  RotateCw,
  RefreshCw,
  Minimize2,
  Lock,
  Stamp,
  Search,
  Loader2,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Home,
  Microscope,
  Library,
  BookMarked,
  Quote,
  Binary,
  FileCode,
  Code2,
  Calculator,
  HelpCircle,
  QrCode,
  Scan,
  Hash,
  Globe,
  Fingerprint,
  ShieldAlert,
  Receipt,
  ShoppingCart,
  Truck,
  FileSpreadsheet,
  TrendingUp,
  Percent,
  Wallet,
  Tag,
  CreditCard,
  ArrowRightLeft,
  Target,
  BarChart3,
  Coins,
  Users,
  Settings,
  Gift,
} from "lucide-react";
import sangarAsset from "@/assets/sangar.jpg.asset.json";
import { UserNavButton } from "@/components/UserNavButton";
import { NotificationBell } from "@/components/NotificationBell";
import { useAuth } from "@/context/AuthContext";
import { UserProfileSection } from "@/components/UserProfileSection";
import { InviteFriends } from "@/components/InviteFriends";

// Lazy-loaded tools for optimal bundle size and instant initial load
const Uploader = lazy(() => import("@/components/Uploader").then((m) => ({ default: m.Uploader })));
const ChatBox = lazy(() => import("@/components/ChatBox").then((m) => ({ default: m.ChatBox })));
const Humanizer = lazy(() => import("@/components/Humanizer").then((m) => ({ default: m.Humanizer })));
const Handwriting = lazy(() => import("@/components/Handwriting").then((m) => ({ default: m.Handwriting })));
const AiTool = lazy(() => import("@/components/AiTool").then((m) => ({ default: m.AiTool })));
const AudioTranscriber = lazy(() => import("@/components/AudioTranscriber").then((m) => ({ default: m.AudioTranscriber })));
const MathSolver = lazy(() => import("@/components/MathSolver").then((m) => ({ default: m.MathSolver })));
const Math2Word = lazy(() => import("@/components/Math2Word").then((m) => ({ default: m.Math2Word })));
const FunctionGrapher = lazy(() => import("@/components/FunctionGrapher").then((m) => ({ default: m.FunctionGrapher })));
const AdminPanel = lazy(() => import("@/components/AdminPanel").then((m) => ({ default: m.AdminPanel })));
const PdfMerge = lazy(() => import("@/components/PdfMerge").then((m) => ({ default: m.PdfMerge })));
const PdfSplit = lazy(() => import("@/components/PdfSplit").then((m) => ({ default: m.PdfSplit })));
const PdfCompress = lazy(() => import("@/components/PdfCompress").then((m) => ({ default: m.PdfCompress })));
const PdfRotate = lazy(() => import("@/components/PdfRotate").then((m) => ({ default: m.PdfRotate })));
const PdfWatermark = lazy(() => import("@/components/PdfWatermark").then((m) => ({ default: m.PdfWatermark })));
const VideoDownloader = lazy(() => import("@/components/VideoDownloader").then((m) => ({ default: m.VideoDownloader })));
const VideoConverter = lazy(() => import("@/components/VideoConverter").then((m) => ({ default: m.VideoConverter })));
const VideoCompressor = lazy(() => import("@/components/VideoCompressor").then((m) => ({ default: m.VideoCompressor })));
const DocumentForensics = lazy(() => import("@/components/DocumentForensics").then((m) => ({ default: m.DocumentForensics })));
const PdfProtect = lazy(() => import("@/components/PdfProtect").then((m) => ({ default: m.PdfProtect })));
const PdfToWord = lazy(() => import("@/components/PdfToWord").then((m) => ({ default: m.PdfToWord })));
const PdfToPpt = lazy(() => import("@/components/PdfToPpt").then((m) => ({ default: m.PdfToPpt })));
const PdfToExcel = lazy(() => import("@/components/PdfToExcel").then((m) => ({ default: m.PdfToExcel })));
const FilesToPdf = lazy(() => import("@/components/FilesToPdf").then((m) => ({ default: m.FilesToPdf })));
const CitationTool = lazy(() => import("@/components/AcademicSuite").then((m) => ({ default: m.CitationTool })));
const DoiCitationTool = lazy(() => import("@/components/AcademicSuite").then((m) => ({ default: m.DoiCitationTool })));
const BibTexTool = lazy(() => import("@/components/AcademicSuite").then((m) => ({ default: m.BibTexTool })));
const LatexEditorTool = lazy(() => import("@/components/AcademicSuite").then((m) => ({ default: m.LatexEditorTool })));
const LatexWordTool = lazy(() => import("@/components/AcademicSuite").then((m) => ({ default: m.LatexWordTool })));
const QrCodeGenerator = lazy(() => import("@/components/SecuritySuite").then((m) => ({ default: m.QrCodeGenerator })));
const QrCodeScanner = lazy(() => import("@/components/SecuritySuite").then((m) => ({ default: m.QrCodeScanner })));
const HashGenerator = lazy(() => import("@/components/SecuritySuite").then((m) => ({ default: m.HashGenerator })));
const Base64Tool = lazy(() => import("@/components/SecuritySuite").then((m) => ({ default: m.Base64Tool })));
const UrlEncoderTool = lazy(() => import("@/components/SecuritySuite").then((m) => ({ default: m.UrlEncoderTool })));
const UuidGenerator = lazy(() => import("@/components/SecuritySuite").then((m) => ({ default: m.UuidGenerator })));
const LinksChecker = lazy(() => import("@/components/SecuritySuite").then((m) => ({ default: m.LinksChecker })));
const InvoiceGenerator = lazy(() => import("@/components/InvoiceGenerator").then((m) => ({ default: m.InvoiceGenerator })));
const ProfitCalculator = lazy(() => import("@/components/BusinessToolkit").then((m) => ({ default: m.ProfitCalculator })));
const VatCalculator = lazy(() => import("@/components/BusinessToolkit").then((m) => ({ default: m.VatCalculator })));
const SalaryCalculator = lazy(() => import("@/components/BusinessToolkit").then((m) => ({ default: m.SalaryCalculator })));
const DiscountCalculator = lazy(() => import("@/components/BusinessToolkit").then((m) => ({ default: m.DiscountCalculator })));
const LoanCalculator = lazy(() => import("@/components/BusinessToolkit").then((m) => ({ default: m.LoanCalculator })));
const CurrencyConverter = lazy(() => import("@/components/BusinessToolkit").then((m) => ({ default: m.CurrencyConverter })));
const BreakEvenCalculator = lazy(() => import("@/components/BusinessToolkit").then((m) => ({ default: m.BreakEvenCalculator })));
const RoiCalculator = lazy(() => import("@/components/BusinessToolkit").then((m) => ({ default: m.RoiCalculator })));
const StatisticsLab = lazy(() => import("@/components/StatisticsLab").then((m) => ({ default: m.StatisticsLab })));
const StudyGroupRoom = lazy(() => import("@/components/StudyGroupRoom").then((m) => ({ default: m.StudyGroupRoom })));
const AiDailyBriefing = lazy(() => import("@/components/AiDailyBriefing").then((m) => ({ default: m.AiDailyBriefing })));
const AiWelcomeAssistant = lazy(() => import("@/components/AiWelcomeAssistant").then((m) => ({ default: m.AiWelcomeAssistant })));

type ToolId =
  | "video_downloader"
  | "video_converter"
  | "video_compressor"
  | "summary"
  | "chat"
  | "humanize"
  | "ocr"
  | "planner"
  | "solver"
  | "math2word"
  | "tts"
  | "grader"
  | "glossary"
  | "testai"
  | "testplagiarism"
  | "grapher"
  | "grammar"
  | "translator"
  | "chat_doc"
  | "audio_sum"
  | "pdf_merge"
  | "pdf_split"
  | "pdf_compress"
  | "pdf_to_word"
  | "pdf_to_ppt"
  | "pdf_to_excel"
  | "word_to_pdf"
  | "excel_to_pdf"
  | "pdf_rotate"
  | "pdf_protect"
  | "pdf_watermark"
  | "files_to_pdf"
  | "document_forensics"
  | "research_assistant"
  | "paper_summarizer"
  | "abstract_generator"
  | "lit_review"
  | "research_question"
  | "methodology_assistant"
  | "citation_generator"
  | "bibtex_generator"
  | "doi_citation"
  | "latex_word"
  | "latex_editor"
  | "qr_generator"
  | "qr_scanner"
  | "hash_generator"
  | "base64_tool"
  | "url_encoder"
  | "uuid_generator"
  | "link_checker"
  | "invoice_tool"
  | "receipt_tool"
  | "quotation_tool"
  | "purchase_order_tool"
  | "delivery_note_tool"
  | "profit_calc"
  | "vat_calc"
  | "salary_calc"
  | "discount_calc"
  | "loan_calc"
  | "currency_calc"
  | "breakeven_calc"
  | "roi_calc"
  | "statistics_lab"
  | "study_group"
  | "daily_briefing";

const WHATSAPP_NUMBER = "9647501435868";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hello, I want to activate my VIP subscription for AI Study Summary.",
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

const SUBGROUP_THEMES: Record<
  string,
  {
    container: string;
    dot: string;
    badge: string;
    iconGradient: string;
    cardHoverBorder: string;
    titleHover: string;
    tabActive: string;
    tabBadge: string;
  }
> = {
  "زمان و ڕاستنڤیسین": {
    container: "bg-blue-500/[0.035] dark:bg-blue-500/[0.07] border-blue-500/25",
    dot: "bg-blue-500 shadow-xs shadow-blue-500/50",
    badge: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25",
    iconGradient: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
    cardHoverBorder: "hover:border-blue-500/60 hover:shadow-blue-500/10",
    titleHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
    tabActive: "bg-blue-600 text-white shadow-sm shadow-blue-500/30",
    tabBadge: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  },
  "پشکنینا AI و دزیکرنێ": {
    container: "bg-rose-500/[0.035] dark:bg-rose-500/[0.07] border-rose-500/25",
    dot: "bg-rose-500 shadow-xs shadow-rose-500/50",
    badge: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25",
    iconGradient: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
    cardHoverBorder: "hover:border-rose-500/60 hover:shadow-rose-500/10",
    titleHover: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
    tabActive: "bg-rose-600 text-white shadow-sm shadow-rose-500/30",
    tabBadge: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  },
  "ڤەکۆلین و تێز": {
    container: "bg-emerald-500/[0.035] dark:bg-emerald-500/[0.07] border-emerald-500/25",
    dot: "bg-emerald-500 shadow-xs shadow-emerald-500/50",
    badge: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    iconGradient: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
    cardHoverBorder: "hover:border-emerald-500/60 hover:shadow-emerald-500/10",
    titleHover: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
    tabActive: "bg-emerald-600 text-white shadow-sm shadow-emerald-500/30",
    tabBadge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  "ژێدەر و هاوکێشە": {
    container: "bg-amber-500/[0.035] dark:bg-amber-500/[0.07] border-amber-500/25",
    dot: "bg-amber-500 shadow-xs shadow-amber-500/50",
    badge: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25",
    iconGradient: "linear-gradient(135deg, #d97706 0%, #ea580c 100%)",
    cardHoverBorder: "hover:border-amber-500/60 hover:shadow-amber-500/10",
    titleHover: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
    tabActive: "bg-amber-600 text-white shadow-sm shadow-amber-500/30",
    tabBadge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
};

const FALLBACK_SUBGROUP_THEMES = [
  SUBGROUP_THEMES["زمان و ڕاستنڤیسین"],
  SUBGROUP_THEMES["پشکنینا AI و دزیکرنێ"],
  SUBGROUP_THEMES["ڤەکۆلین و تێز"],
  SUBGROUP_THEMES["ژێدەر و هاوکێشە"],
];

const getSubGroupTheme = (grpName: string, index: number = 0) => {
  return SUBGROUP_THEMES[grpName] || FALLBACK_SUBGROUP_THEMES[index % FALLBACK_SUBGROUP_THEMES.length];
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Las AI — پلاتفۆرمی زیرەک بو خواندکاران" },
      {
        name: "description",
        content:
          "بەلگەنامە و وێنێن خۆ بدانە و کورتەیەکا ڕێکوپێک وەربگرە ب کوردیا بادینی ب هاریکاریا زیرەکیا دەستکرد.",
      },
      { property: "og:title", content: "Las AI" },
      { property: "og:description", content: "پلاتفورمەکێ ئەکادیمی و پێشکەفتی بو قوتابی و خودانکاران." },
      { property: "og:image", content: "/logo.png" },
      { name: "twitter:description", content: "پلاتفورمەکێ ئەکادیمی و پێشکەفتی بو قوتابی و خودانکاران." },
      { name: "twitter:image", content: "/logo.png" },
    ],
  }),
  component: Index,
});

function ToolSkeletonLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[350px] rounded-3xl bg-card border border-border text-center shadow-lg animate-pulse">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-primary-foreground shadow-md"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Loader2 className="w-7 h-7 animate-spin" />
      </div>
      <h3 className="text-base font-bold text-foreground">د ئامادەکرن و بارکرنا ئامرازیدا...</h3>
      <p className="text-xs text-muted-foreground mt-1.5">تکایە کەمەکێ چاوەڕێبە</p>
    </div>
  );
}

function Index() {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isPro,
    announcement,
    openAuthModal,
    logout,
    redeemVipCode,
    pricingConfig,
    getToolQuotaStatus,
    openProModal,
    quotaVersion,
    dailyCredits,
    maxDailyCredits,
  } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<null | ToolId>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const [selectedSubGroup, setSelectedSubGroup] = useState<string | null>(null);
  const [activeExtraSection, setActiveExtraSection] = useState<'features' | 'pricing' | 'about' | 'profile' | 'admin' | 'invite' | null>(null);
  const [proDuration, setProDuration] = useState<"1m" | "3m" | "6m" | "1y">("1m");
  const [showPricingKeyInput, setShowPricingKeyInput] = useState(false);
  const [pricingVipCode, setPricingVipCode] = useState("");
  const [pricingRedeemAlert, setPricingRedeemAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<number | null>(null);
  const [mobileDrawerSearch, setMobileDrawerSearch] = useState("");
  const [hoveredCategoryIdx, setHoveredCategoryIdx] = useState<number | null>(null);
  const [popoverTop, setPopoverTop] = useState(0);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoryButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sidebarAsideRef = useRef<HTMLElement | null>(null);
  const toolContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setSelectedSubGroup(null);
  }, [selectedCategoryIndex, searchQuery]);


  const handleMouseEnterCategory = (idx: number) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      const btn = categoryButtonRefs.current[idx];
      const aside = sidebarAsideRef.current;
      if (btn && aside) {
        const btnRect = btn.getBoundingClientRect();
        const asideRect = aside.getBoundingClientRect();
        const btnCenter = btnRect.top - asideRect.top + btnRect.height / 2;

        const cat = categories[idx];
        const toolCount = cat ? cat.tools.length : 0;
        const maxLen = cat ? Math.max(...cat.tools.map((t) => (t.title || "").length)) : 0;
        const cols = toolCount > 12 ? 4 : toolCount > 4 ? 3 : 2;
        const rows = Math.ceil(toolCount / cols);
        const cardHeight = maxLen > 22 ? 46 : 40;
        const estimatedHeight = 44 + rows * cardHeight + 16;

        let desiredTop = btnCenter - estimatedHeight / 2;
        if (desiredTop < 0) desiredTop = 0;
        setPopoverTop(Math.max(0, desiredTop));
      }
      setHoveredCategoryIdx(idx);
    }, 450);
  };

  const handleMouseLeaveCategory = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCategoryIdx(null);
    }, 250);
  };

  const openTool = (id: ToolId) => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    const toolItem = allToolsList.find((t) => t.id === id);
    const toolTitle = toolItem?.title || id;

    if (!isPro) {
      const quota = getToolQuotaStatus(id);
      if (quota.remaining <= 0) {
        openProModal(toolTitle);
        return;
      }
    }

    setActiveTool(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        openTool(customEvent.detail as ToolId);
      }
    };
    window.addEventListener("lasai_open_tool", handler);
    return () => window.removeEventListener("lasai_open_tool", handler);
  }, []);

  const sangarImgUrl = import.meta.env.DEV ? "/sangar.jpg" : sangarAsset.url || "/sangar.jpg";

  const navLinks = [
    { href: "#features", label: "بوچی ئەم؟" },
    { href: "#upload", label: "ئامرازەکان" },
    { href: "#pricing", label: "بهایی" },
    { href: "#about", label: "دامەزرێنەر" },
  ];

  const categories = useMemo(
    () => [
      {
        num: "1",
        icon: BookOpen,
        gradient: "from-blue-600 to-indigo-600",
        title: "هاریکارێن زیرەک یێن خواندنێ",
        titleEn: "Smart Study Assistants",
        shortTitle: "هاریکارێن خواندنێ",
        desc: "کورتکرن، ئاخفتن، فێربوونا زمانی ئینگلیزی، پلانا خواندنێ، فەرهەنگ و دەنگ بۆ نڤیسین.",
        tools: [
          { id: "summary", icon: FileText, title: "کورتکرن", desc: "نڤیسینێ کورت بکە و تاقیکرنێ بکە." },
          { id: "chat", icon: MessageCircle, title: "ئاخفتن", desc: "پسیارێ ژ AI بکە ب کوردی." },
          { id: "daily_briefing", icon: GraduationCap, title: "فێربوونا زمانی ئینگلیزی یا ڕۆژانە", desc: "تاقیکرنێن ڕۆژانە، ڕێزمان، پەیڤ و گەشەپێدانا ئینگلیزی ب زیرەکی." },
          { id: "planner", icon: CalendarCheck, title: "پلانا خواندنێ", desc: "پلانا خواندنا ڕۆژانە بو تە." },
          { id: "glossary", icon: BookA, title: "فەرهەنگا زانستی", desc: "زاراڤێن ئەکادیمی." },
          { id: "audio_sum", icon: FileAudio, title: "دەنگ بۆ نڤیسین", desc: "تۆمارکرن و گۆڕینا دەنگی بۆ دەقی و کورتکرن." },
        ],
      },
      {
        num: "2",
        icon: Sigma,
        gradient: "from-emerald-600 to-teal-600",
        title: "ئامرازێن بیرکاری و زانستی",
        titleEn: "Math & Science Tools",
        shortTitle: "بیرکاری و زانست",
        desc: "چارەسەری پێنگاڤ، Math → Word، LaTeX ↔ Word، دەستکاریکەرێ LaTeX و نەخشەسازی.",
        tools: [
          { id: "solver", icon: ListOrdered, title: "چارەسەری پێنگاڤ", desc: "پسیار پێنگاڤ ب پێنگاڤ." },
          { id: "math2word", icon: Sigma, title: "Math → Word", desc: "هاوکێشە بو Microsoft Word." },
          { id: "latex_word", icon: Code2, title: "LaTeX ↔ Word", desc: "گوهۆڕینا هاوکێشەیان د ناڤبەرا LaTeX و Microsoft Word دا." },
          { id: "latex_editor", icon: Calculator, title: "LaTeX Equation Editor", desc: "دەستکاریکەرێ هاوکێشەیا LaTeX ب دیتنا ئێکسەر (KaTeX)." },
          { id: "grapher", icon: LineChart, title: "وێنەکێشێ نەخشەیان", desc: "کێشانا دینامیکی یا نەخشەیێن بیرکاری." },
        ],
      },
      {
        num: "3",
        icon: PenTool,
        gradient: "from-pink-600 via-purple-600 to-indigo-700",
        title: "ئامرازێن زمان و ڤەکۆلینا ئەکادیمی",
        titleEn: "Academic Writing & Research",
        shortTitle: "نڤیسین و ڤەکۆلین",
        desc: "ڕاستنڤیس، وەرگێڕان، Humanize، پشکنینا AI و دزیکرنێ، Research Assistant، ژێدەر و کورتکرنا پەڕاو.",
        tools: [
          // Subgroup: زمان و ڕاستنڤیسین
          { id: "grammar", icon: PenTool, title: "ڕاستنڤیسا زمانێ", desc: "ڕاستکرنا هەڵەیێن ڕێزمانی و پێشکەشکرنا خشتە.", group: "زمان و ڕاستنڤیسین" },
          { id: "translator", icon: Languages, title: "وەرگێڕێ ئەکادیمی", desc: "وەرگێڕانا دەقێن زانستی و ئەکادیمی ب دروستی.", group: "زمان و ڕاستنڤیسین" },
          { id: "humanize", icon: Wand2, title: "Humanize & Paraphrase", desc: "دارشتنا دووبارە (Paraphrase) و مرۆڤایەتیکرنا دەقێ AI.", group: "زمان و ڕاستنڤیسین" },
          { id: "ocr", icon: ScanLine, title: "دەستنڤیس بو دەقی", desc: "وێنەیێ دەستنڤیسی بخوینە.", group: "زمان و ڕاستنڤیسین" },
          { id: "grader", icon: ClipboardCheck, title: "نمرەدانا ڕاپۆرتێ", desc: "ڕاپۆرتا خۆ ب پیڤە و نمرەیێ ببینە.", group: "زمان و ڕاستنڤیسین" },
          
          // Subgroup: پشکنینا AI و دزیکرنێ
          { id: "testai", icon: ShieldCheck, title: "Test AI", desc: "ڕێژا نڤیسینا AI پشکنین بکە.", group: "پشکنینا AI و دزیکرنێ" },
          { id: "testplagiarism", icon: FileSearch, title: "Test Plagiarism", desc: "ڕێژا پلاجیاریزمێ پشکنین بکە.", group: "پشکنینا AI و دزیکرنێ" },
          
          // Subgroup: ڤەکۆلین و تێز
          { id: "research_assistant", icon: Brain, title: "Research Assistant", desc: "هاریکارێ ڤەکۆلینێ و دارشتنا پلان و تێزێ.", group: "ڤەکۆلین و تێز" },
          { id: "paper_summarizer", icon: FileText, title: "Paper Summarizer", desc: "کورتکرنا پەڕاوێ زانستی ب 6 پشکێن سەرەکی.", group: "ڤەکۆلین و تێز" },
          { id: "abstract_generator", icon: Sparkles, title: "Abstract Generator", desc: "چێکرنا کورتیا ئەکادیمی (Abstract) و پەیڤێن سەرەکی.", group: "ڤەکۆلین و تێز" },
          { id: "lit_review", icon: Library, title: "Literature Review Assistant", desc: "پێداچوونا ئەدەبیاتی زانستی و خشتەیێ بەراوردکاری.", group: "ڤەکۆلین و تێز" },
          { id: "research_question", icon: HelpCircle, title: "Research Question Generator", desc: "چێکرنا پسیار و گریمانەیێن ڤەکۆلینێ (PICO/FINER).", group: "ڤەکۆلین و تێز" },
          { id: "methodology_assistant", icon: Layers, title: "Methodology Assistant", desc: "دیارکرنا مێتۆدۆلۆژیا، نموونە و پلانا شیکاری.", group: "ڤەکۆلین و تێز" },
          
          // Subgroup: ژێدەرێن زانستی
          { id: "citation_generator", icon: Quote, title: "Citation Generator", desc: "ژێدەرگرتن ب ستانداردێن APA, MLA, Chicago, IEEE, Harvard.", group: "ژێدەرێن زانستی" },
          { id: "bibtex_generator", icon: FileCode, title: "BibTeX Generator", desc: "چێکرن و داگرتنا فایلا .bib بۆ LaTeX.", group: "ژێدەرێن زانستی" },
          { id: "doi_citation", icon: Binary, title: "DOI → Citation", desc: "وەرگرتنا ئێکسەر یا سەرچاوەی ب ژمارا DOI.", group: "ژێدەرێن زانستی" },
        ],
      },
      {
        num: "4",
        icon: FilePlus2,
        gradient: "from-amber-600 to-orange-600",
        title: "خزمەتگوزاریێن PDF",
        titleEn: "PDF Services",
        shortTitle: "خزمەتگوزاریێن PDF",
        desc: "یەکگرتن، دابەشکرن، بچیکرن، گۆڕینی Word/PPT/Excel و پاراستن.",
        tools: [
          { id: "pdf_merge", icon: FilePlus2, title: "یەکگرتنا PDF", desc: "چەند فایلێن PDF بکە یەک ب ئاسانی." },
          { id: "pdf_split", icon: Scissors, title: "دابەشکرنا PDF", desc: "PDF دابەش بکە ب رووپەلان یان بەشان." },
          { id: "pdf_compress", icon: FileDown, title: "بچیکرنا PDF", desc: "قەبارەیا فایلێ PDF کەم بکە ب پاراستنا کوالیتی." },
          { id: "pdf_to_word", icon: FileType2, title: "PDF بو Word", desc: "PDF بگۆڕە بو فایلێ Word ب دروستی." },
          { id: "pdf_to_ppt", icon: Presentation, title: "PDF بو PowerPoint", desc: "PDF بگۆڕە بو پێشکەشکرنا PPT." },
          { id: "pdf_to_excel", icon: Table2, title: "PDF بو Excel", desc: "خشتەیێن PDFێ بگۆڕە بو Excel." },
          { id: "files_to_pdf", icon: FileType2, title: "گهورینا فایلان بو PDF", desc: "فایلێن Office (Word, PowerPoint, Excel) و وێنەیان بگۆڕە بۆ PDF ب ئاسانی." },
          { id: "pdf_rotate", icon: RotateCw, title: "زڤرنا PDFێ", desc: "رووپەلێن PDF بزڤێرە بو هەر ئاراستەیەکێ." },
          { id: "pdf_protect", icon: Lock, title: "پاراستنا PDFێ", desc: "پاسۆردی بو PDF بدانە." },
          { id: "pdf_watermark", icon: Stamp, title: "نیشانا Watermark", desc: "نڤیسین یان وێنە ب شێوازا Watermark زێدە بکە." },
        ],
      },
      {
        num: "5",
        icon: Video,
        gradient: "from-rose-600 to-red-600",
        title: "تایبەتمەندیێن ڤیدیۆیان",
        titleEn: "Video Tools & Streaming",
        shortTitle: "تایبەتمەندیێن ڤیدیۆیان",
        desc: "داگرتن، گۆڕینی فۆرمات و کێمکرنا قەبارێ ڤیدیۆیان.",
        tools: [
          { id: "video_downloader", icon: FileDown, title: "داگرتنا ڤیدیۆیان", desc: "داگرتنا ڤیدیۆیان ژ سۆشیال میدیایێ ب لەز." },
          { id: "video_compressor", icon: Minimize2, title: "کێمکرنا قەبارێ ڤیدیۆ", desc: "کێمکرنا قەبارێ ڤیدیۆیێ ب پاراستنا کوالێتیێ." },
          { id: "video_converter", icon: RefreshCw, title: "گۆڕینا فۆرماتێ ڤیدیۆ و دەنگ", desc: "گۆڕینا جۆر و فۆرماتێن ڤیدیۆ و دەنگی ب ئاسانی." },
        ],
      },
      {
        num: "6",
        icon: ShieldCheck,
        gradient: "from-cyan-600 to-blue-700",
        title: "پشکنینا دادوەری و ساختەکاریێ",
        titleEn: "Document Forensics System",
        shortTitle: "دادوەری بەڵگەنامە",
        desc: "پشکنینا فۆنت، دەستکاریکرنا ڕەنگان، ELA و داتایێن مێتاداتا.",
        tools: [
          { id: "document_forensics", icon: ShieldCheck, title: "پشکنینا دادوەری یا بەڵگەنامەیان", desc: "پشکنینا فۆنت، دەستکاریکرنا ڕەنگان، ELA و داتایێن مێتاداتا." },
        ],
      },
      
      {
        num: "7",
        icon: ShieldAlert,
        gradient: "from-blue-600 via-indigo-600 to-purple-700",
        title: "تایبەتمەندیێن پاراستن و بارکۆدان",
        titleEn: "Security & QR Code Tools",
        shortTitle: "پاراستن و بارکۆد",
        desc: "QR Code Generator, Scanner, Hash, Base64, URL Encoder, UUID و Links Checker بۆ زانینا لینکێن خاپینۆک و هاک.",
        tools: [
          { id: "qr_generator", icon: QrCode, title: "QR Code Generator", desc: "چێکرنا بارکۆد و QR ب ئاسانی." },
          { id: "qr_scanner", icon: Scan, title: "QR Code Scanner", desc: "سکانکرن و خاندنا QR و بارکۆد." },
          { id: "hash_generator", icon: Hash, title: "Hash Generator", desc: "چێکرنا هاش (MD5, SHA-256) بو دەق و فایل." },
          { id: "base64_tool", icon: FileCode, title: "Base64 Encoder/Decoder", desc: "کۆدکرن و شیکرنا دەق و فایل ب Base64." },
          { id: "url_encoder", icon: Globe, title: "URL Encoder/Decoder", desc: "کۆدکرن و شیکرنا دروست یا لینکان." },
          { id: "uuid_generator", icon: Fingerprint, title: "UUID Generator", desc: "چێکرنا کۆد و ناسنامەیا بێهەڤتا UUID." },
          { id: "link_checker", icon: ShieldAlert, title: "Links Checker (پشکنینا لینکێن خاپینۆک)", desc: "پشکنینا سلامەتیا لینکان دژی ساختەکاریێ." },
        ],
      },
      {
        num: "8",
        icon: TrendingUp,
        gradient: "from-emerald-600 via-teal-600 to-cyan-700",
        title: "تایبەتمەندی و ئامرازێن بازرگانی",
        titleEn: "Business Toolkit",
        shortTitle: "ئامرازێن بازرگانی",
        desc: "Profit, VAT, Salary, Discount, Loan, Currency Converter, Break-even, ROI و Invoice Generator ب دیزاینەکا پێشکەفتی.",
        tools: [
          { id: "profit_calc", icon: TrendingUp, title: "Profit Calculator", desc: "هژمارتنا قازانجێ پۆختە، تێچوون و داهاتی." },
          { id: "vat_calc", icon: Percent, title: "VAT Calculator", desc: "هژمارتن، زێدەکرن یان دەرئینانا باجا VAT." },
          { id: "salary_calc", icon: Wallet, title: "Salary Calculator", desc: "هژمارتنا مووچەیێ پۆختە، دەمژمێرێن زێدە و بڕینان." },
          { id: "discount_calc", icon: Tag, title: "Discount Calculator", desc: "هژمارتنا ڕێژەیا داشکاندنێ و بهایێ پاشەکەوتکری." },
          { id: "loan_calc", icon: CreditCard, title: "Loan & EMI Calculator", desc: "هژمارتنا قیستێ مەهانە یێ قەرزی و فایدا وێ." },
          { id: "currency_calc", icon: Coins, title: "Currency Converter", desc: "گوهۆڕینا لەزگین یا دراڤان ب بهایێن نوو." },
          { id: "breakeven_calc", icon: Target, title: "Break-even Calculator", desc: "دیارکرنا خالا یەکسانبوونێ بۆ داپۆشینا تێچوونان." },
          { id: "roi_calc", icon: BarChart3, title: "ROI Calculator", desc: "هژمارتنا ڕێژە و قازانجێ زڤڕینا وەبەرهێنانێ." },
          { id: "invoice_tool", icon: FileSpreadsheet, title: "Invoice & Receipt Generator", desc: "چێکرن و چاپکرنا فاکتۆر، پسوولە و پێشنیازان." },
        ],
      },
      {
        num: "9",
        icon: BarChart3,
        gradient: "from-indigo-600 via-purple-600 to-pink-600",
        title: "تاقیگەها ئامار و شیکاریا داتایان",
        titleEn: "Statistics Lab & Data Science",
        shortTitle: "تاقیگەها ئامارێ",
        desc: "بارکرنا داتاسێت (CSV/Excel) → شیکاریا ئۆتۆماتیک یا Mean, Median, Mode, Variance, SD, Quartiles, Correlation, Regression, Charts و Report.",
        tools: [
          { id: "statistics_lab", icon: BarChart3, title: "Statistics Lab & Data Science Engine", desc: "شیکاریا هەمەلایەنە یا داتایان و ئامارێن زانستی." },
        ],
      },
    ],
    [],
  );

  const allToolsCount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.tools.length, 0);
  }, [categories]);

  const allToolsList = useMemo(() => {
    return categories.flatMap((cat) => cat.tools);
  }, [categories]);

  const renderQuotaBadge = (_toolId: string) => {
    if (isPro || !isAuthenticated) return null;
    if (dailyCredits > maxDailyCredits * 0.5) {
      // More than 50% credits remaining – show green
      return (
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0 flex items-center gap-0.5">
          ⚡ {dailyCredits}
        </span>
      );
    }
    if (dailyCredits > 0) {
      // Low credits – show amber
      return (
        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 shrink-0 flex items-center gap-0.5">
          ⚡ {dailyCredits}
        </span>
      );
    }
    // Zero credits – show locked
    return (
      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 flex items-center gap-1 shrink-0">
        <Lock className="w-2.5 h-2.5" /> 0
      </span>
    );
  };

  // Kurdish/Arabic character normalizer for robust search
  const normalizeSearch = (text: string) =>
    text
      .toLowerCase()
      .replace(/[ي]/g, "ی")
      .replace(/[ك]/g, "ک")
      .replace(/[ة]/g, "ە")
      .replace(/[أإآ]/g, "ا")
      .replace(/[\u064B-\u065F]/g, "")
      .trim();

  // Filter tools based on query and selected category
  const filteredCategories = useMemo(() => {
    const rawQ = searchQuery.trim();
    if (!rawQ) {
      if (selectedCategoryIndex !== null) {
        return categories.filter((_, idx) => idx === selectedCategoryIndex);
      }
      return categories;
    }

    const q = normalizeSearch(rawQ);

    return categories
      .map((cat) => {
        const catMatches =
          normalizeSearch(cat.title).includes(q) ||
          ((cat as any).titleEn && normalizeSearch((cat as any).titleEn).includes(q)) ||
          normalizeSearch(cat.shortTitle).includes(q);

        const matchingTools = cat.tools.filter((t) => {
          return (
            catMatches ||
            normalizeSearch(t.title).includes(q) ||
            normalizeSearch(t.desc).includes(q) ||
            normalizeSearch(t.id).includes(q)
          );
        });

        if (matchingTools.length === 0) return null;
        return { ...cat, tools: matchingTools };
      })
      .filter(Boolean) as typeof categories;
  }, [categories, searchQuery, selectedCategoryIndex]);

  const totalFilteredTools = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.tools.length, 0);
  }, [filteredCategories]);

  const filteredMobileCategories = useMemo(() => {
    if (!mobileDrawerSearch.trim()) return categories;
    const q = normalizeSearch(mobileDrawerSearch.trim());
    return categories
      .map((cat) => {
        const catMatches =
          normalizeSearch(cat.title).includes(q) ||
          ((cat as any).titleEn && normalizeSearch((cat as any).titleEn).includes(q)) ||
          normalizeSearch(cat.shortTitle).includes(q);

        const matchingTools = cat.tools.filter((t) => {
          return (
            catMatches ||
            normalizeSearch(t.title).includes(q) ||
            normalizeSearch(t.desc).includes(q) ||
            normalizeSearch(t.id).includes(q)
          );
        });

        if (matchingTools.length === 0) return null;
        return { ...cat, tools: matchingTools };
      })
      .filter(Boolean) as typeof categories;
  }, [categories, mobileDrawerSearch]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Platform Broadcast Announcement Banner */}
      {announcement?.active && announcement.text && (
        <div
          className={`w-full py-1.5 sm:py-2 px-3 sm:px-4 text-center text-[10.5px] sm:text-xs font-bold transition flex items-center justify-center gap-1.5 sm:gap-2 border-b z-50 leading-snug ${
            announcement.type === "warning"
              ? "bg-amber-500 text-slate-950 border-amber-600"
              : announcement.type === "success"
              ? "bg-emerald-600 text-white border-emerald-700"
              : announcement.type === "promo"
              ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white border-purple-700"
              : "bg-blue-600 text-white border-blue-700"
          }`}
        >
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className="leading-snug">{announcement.text}</span>
        </div>
      )}

      {/* Nav */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/85 border-b border-border transition-colors duration-300">
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="ڤەکرنا مینیویێ"
              className="lg:hidden inline-flex items-center justify-center w-8.5 h-8.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition shadow-2xs border border-border cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
            <UserNavButton onSelectSection={(section) => {
              setActiveExtraSection(section as any);
              setActiveTool(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }} />
            <NotificationBell onNavigateSection={(section) => {
              setActiveExtraSection(section as any);
              setActiveTool(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }} />
            
            {/* Pro Plan Buy / Upgrade Button - Always visible on mobile & desktop */}
            <button
              type="button"
              onClick={() => {
                setActiveExtraSection("pricing");
                setActiveTool(null);
                setSelectedCategoryIndex(null);
                setSearchQuery("");
                setMenuOpen(false);
                setTimeout(() => {
                  const el = document.getElementById("pro-plan-card") || document.getElementById("pricing");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }, 60);
              }}
              title="پلانی پڕۆ (Pro Plan) — کڕین و بەشداریکردن بێ سنوور"
              aria-label="پلانی پڕۆ"
              className={`relative h-8.5 px-2.5 sm:px-3 rounded-full transition-all duration-300 flex items-center gap-1.5 cursor-pointer shrink-0 group ${
                isPro
                  ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-xs"
                  : "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/25 hover:shadow-md hover:shadow-amber-500/40 hover:scale-105 active:scale-95 border border-amber-400/60"
              }`}
            >
              <span className="font-black text-xs tracking-wide">
                {isPro ? "VIP" : "Pro"}
              </span>
              <Crown className={`w-3.5 h-3.5 shrink-0 ${isPro ? "text-amber-500" : "text-slate-950 group-hover:rotate-12 transition-transform"}`} />
              {!isPro && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
              )}
            </button>

            {/* Desktop only: Theme Toggle */}
            <div className="hidden sm:flex items-center">
              <ThemeToggle />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTool(null);
              setActiveExtraSection(null);
              setSelectedCategoryIndex(null);
              setSearchQuery("");
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition active:scale-95 text-right"
            dir="ltr"
            aria-label="Las AI سەرەکی"
          >
            <img
              src="/logo.png"
              alt="Las AI Logo"
              className="w-9 h-9 rounded-xl object-cover shadow-sm ring-1 ring-primary/20"
            />
            <span className="font-extrabold text-xl sm:text-[22px] tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              <span>Las</span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent font-black">
                AI
              </span>
            </span>
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
          className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity ${menuOpen ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm bg-card border-l border-border shadow-2xl p-4 sm:p-5 flex flex-col transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"} overflow-y-auto`}
        >
          <div className="relative flex items-center justify-between mb-3 pb-2.5 border-b border-border min-h-[40px]" dir="ltr">
            {/* Left Controls: Close Button + Theme Toggle */}
            <div className="flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="گرتنا مینیویێ"
                className="w-7.5 h-7.5 rounded-full flex items-center justify-center bg-secondary hover:bg-secondary/80 text-foreground transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <ThemeToggle />
            </div>

            {/* Centered Las AI Logo & Name */}
            <button
              type="button"
              onClick={() => {
                setActiveTool(null);
                setActiveExtraSection(null);
                setSelectedCategoryIndex(null);
                setSearchQuery("");
                setMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition active:scale-95 z-0"
              dir="ltr"
              aria-label="Las AI سەرەکی"
            >
              <img
                src="/logo.png"
                alt="Las AI Logo"
                className="w-6.5 h-6.5 rounded-lg object-cover shadow-xs ring-1 ring-primary/20"
              />
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                <span>Las</span>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent font-black">
                  AI
                </span>
              </span>
            </button>

            {/* Spacer for symmetry on the right */}
            <div className="w-14 z-10 pointer-events-none" />
          </div>

          {/* Quick Search in Mobile Drawer */}
          <div className="mb-2.5 relative">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="لێگەڕیان د ناڤ هەمی بەش و ئامرازان دا..."
              value={mobileDrawerSearch}
              onChange={(e) => setMobileDrawerSearch(e.target.value)}
              className="w-full h-8.5 pr-8 pl-2.5 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:outline-none text-[11px] text-foreground placeholder:text-muted-foreground/70"
            />
            {mobileDrawerSearch && (
              <button
                type="button"
                onClick={() => setMobileDrawerSearch("")}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Main Home Button (Top of Menu) */}
          <button
            type="button"
            onClick={() => {
              setActiveTool(null);
              setActiveExtraSection(null);
              setSelectedCategoryIndex(null);
              setSearchQuery("");
              setMobileDrawerSearch("");
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`w-full mb-1.5 py-1.5 px-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 text-right font-black text-xs cursor-pointer ${
              activeTool === null && activeExtraSection === null && selectedCategoryIndex === null
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card hover:bg-secondary border-border/80 text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0 ${
                  activeTool === null && activeExtraSection === null && selectedCategoryIndex === null
                    ? "bg-white/20 text-white"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
              >
                <Home className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-xs">سەرەکی</span>
            </div>
            <ChevronLeft className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* Mobile Categories & Tools Accordion Section */}
          <div className="space-y-1.5 mb-2.5">
            <div className="space-y-1.5">
              {filteredMobileCategories.map((cat, idx) => {
                const CatIcon = cat.icon;
                const isExpanded = mobileExpandedCat === idx || (mobileDrawerSearch.trim().length > 0);
                const isSelected = selectedCategoryIndex === idx;

                return (
                  <div
                    key={cat.num}
                    className={`rounded-xl border transition-all overflow-hidden ${
                      isSelected
                        ? "border-primary/50 bg-primary/5 shadow-xs"
                        : "border-border/70 bg-card hover:border-border"
                    }`}
                  >
                    {/* Category Header Row */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileExpandedCat(isExpanded ? null : idx);
                      }}
                      className="w-full py-1.5 px-2.5 flex items-center justify-between gap-2 text-right transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center shrink-0 shadow-xs bg-gradient-to-br ${cat.gradient} text-white`}
                        >
                          <CatIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1 text-right">
                          <span className="font-bold text-xs text-foreground block truncate leading-tight">
                            {cat.shortTitle || cat.title}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                            isExpanded ? "rotate-180 text-primary" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded Tool List */}
                    {isExpanded && (
                      <div className="px-1.5 pb-2 pt-1 border-t border-border/40 space-y-1 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                        {/* Button to activate category view on main screen */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategoryIndex(idx);
                            setActiveTool(null);
                            setActiveExtraSection(null);
                            setMenuOpen(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="w-full py-1 px-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[10.5px] flex items-center justify-between transition cursor-pointer mb-0.5"
                        >
                          <span>دیتنا هەمی بەشی</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        {/* List of individual tools */}
                        {cat.tools.map((tool) => {
                          const ToolIcon = tool.icon;
                          const isToolActive = activeTool === tool.id;

                          return (
                            <button
                              key={tool.id}
                              type="button"
                              onClick={() => {
                                if (!isAuthenticated) {
                                  setMenuOpen(false);
                                  openAuthModal("login");
                                  return;
                                }
                                setSelectedCategoryIndex(idx);
                                setActiveTool(tool.id as ToolId);
                                setActiveExtraSection(null);
                                setMenuOpen(false);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={`w-full py-1.5 px-2 rounded-lg text-right flex items-center gap-2 transition cursor-pointer ${
                                isToolActive
                                  ? "bg-primary text-primary-foreground font-extrabold shadow-xs"
                                  : "bg-secondary/40 hover:bg-secondary/80 text-foreground"
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                  isToolActive
                                    ? "bg-white/20 text-white"
                                    : `bg-gradient-to-br ${cat.gradient} text-white`
                                }`}
                              >
                                <ToolIcon className="w-3 h-3" />
                              </div>
                              <div className="min-w-0 flex-1 text-right">
                                <span className="font-bold text-[11px] block truncate leading-tight">
                                  {tool.title}
                                </span>
                                <span
                                  className={`text-[9px] block truncate ${
                                    isToolActive ? "text-white/80" : "text-muted-foreground"
                                  }`}
                                >
                                  {tool.desc}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Page Links */}
          <div className="pt-2 border-t border-border/70 space-y-1 mb-2.5">
            <nav className="flex flex-col gap-1 text-xs font-bold">
              <button
                onClick={() => {
                  setActiveExtraSection("about");
                  setActiveTool(null);
                  setMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="py-1.5 px-2.5 rounded-xl hover:bg-secondary transition text-right flex items-center justify-between text-foreground border border-border/50 bg-card/60"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-secondary/80 text-foreground shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-xs">دامەزرێنەر</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <button
                onClick={() => {
                  setActiveExtraSection("features");
                  setActiveTool(null);
                  setMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="py-1.5 px-2.5 rounded-xl hover:bg-secondary transition text-right flex items-center justify-between text-foreground border border-border/50 bg-card/60"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-secondary/80 text-foreground shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-xs">بوچی ئەم؟</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <button
                onClick={() => {
                  setActiveExtraSection("pricing");
                  setActiveTool(null);
                  setMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="py-1.5 px-2.5 rounded-xl hover:bg-secondary transition text-right flex items-center justify-between text-foreground border border-border/50 bg-card/60"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs">پلانێن بهایی</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <button
                onClick={() => {
                  setActiveExtraSection("invite");
                  setActiveTool(null);
                  setMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="py-1.5 px-2.5 rounded-xl hover:bg-pink-500/10 transition text-right flex items-center justify-between text-pink-600 dark:text-pink-400 font-bold border border-pink-500/20 bg-pink-500/5"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-pink-500/15 text-pink-600 shrink-0">
                    <Gift className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">داخوازکرنا هەڤالان</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-pink-500/15 border border-pink-500/25">
                      +25 🎁
                    </span>
                  </div>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-pink-500/70" />
              </button>

              <button
                onClick={() => {
                  setActiveExtraSection("profile");
                  setActiveTool(null);
                  setMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="py-1.5 px-2.5 rounded-xl hover:bg-secondary transition text-right flex items-center justify-between font-bold text-foreground border border-border/50 bg-card/60"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6.5 h-6.5 rounded-lg flex items-center justify-center bg-secondary/80 text-foreground shrink-0">
                    <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-xs">پڕۆفایل و هەژمارا من</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </nav>
          </div>

          {/* User Auth Section in Mobile Drawer (Moved to bottom) */}
          <div className="mb-3 p-2.5 rounded-xl bg-secondary/40 border border-border/80 text-right">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div
                  onClick={() => {
                    setActiveExtraSection("profile");
                    setActiveTool(null);
                    setMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex items-center gap-2.5 cursor-pointer p-1 -m-1 rounded-lg hover:bg-secondary/70 transition group"
                  title="دیتنا پڕۆفایل و هەژمارا من"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden shadow-xs shrink-0 group-hover:scale-105 transition">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-extrabold text-xs text-foreground block truncate group-hover:text-primary transition">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground block truncate" dir="ltr">
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setActiveExtraSection("admin");
                        setActiveTool(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] font-black hover:bg-amber-500 hover:text-slate-950 transition text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Crown className="w-3 h-3" />
                      <span>پەنەلێ ڕێڤەبەری (Admin)</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold hover:bg-destructive hover:text-white transition text-center cursor-pointer"
                  >
                    دەرکەفتن
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-muted-foreground leading-snug">
                  بۆ پاراستنا داتایان و بکارئینانا بێسنوور، بچە ژوورڤە:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      openAuthModal("login");
                    }}
                    className="py-1.5 rounded-lg bg-primary/15 border border-primary/30 text-primary font-bold text-xs hover:bg-primary hover:text-primary-foreground transition text-center cursor-pointer"
                  >
                    چوونەژوورڤە
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      openAuthModal("register");
                    }}
                    className="py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs hover:opacity-90 transition text-center cursor-pointer shadow-xs"
                  >
                    خۆتۆمارکرن
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 text-[11px] text-muted-foreground text-center">
            © {new Date().getFullYear()} Las AI — Sangar Mohammed
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <div id="upload" className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* RIGHT SIDE: Categories Sidebar + Quick Nav (with elegant hero-green background) */}
          <aside ref={(el) => { sidebarAsideRef.current = el; }} className="hidden lg:block w-[240px] xl:w-[260px] sticky top-20 shrink-0 self-start z-30 p-2 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/25 shadow-xl shadow-emerald-500/10 relative backdrop-blur-xl bg-gradient-to-b from-emerald-500/20 via-teal-500/15 to-emerald-600/20 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-emerald-950/50 space-y-1.5">
            {/* Soft hero gradient glow layer */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none rounded-2xl overflow-hidden"
              style={{ background: "var(--gradient-hero)" }}
            />

            {/* Hover Tooltip / Floating Quick Preview of Category Tools — PREMIUM WIDE & FULL VISIBILITY */}
            {hoveredCategoryIdx !== null && categories[hoveredCategoryIdx] && (() => {
              const cat = categories[hoveredCategoryIdx];
              const CatIcon = cat.icon;
              const toolCount = cat.tools.length;

              const catTitleLength = (cat.title || "").length;
              const maxTitleLength = Math.max(...cat.tools.map((t) => (t.title || "").length));
              const hasLongTitles = maxTitleLength > 22 || catTitleLength > 20;

              // Tailored dynamic compact width & columns that adapt if text is longer
              let widthClass = "w-[360px]";
              let gridClass = "grid-cols-2";

              if (toolCount === 1) {
                widthClass = hasLongTitles ? "w-[350px] sm:w-[380px]" : "w-[300px]";
                gridClass = "grid-cols-1";
              } else if (toolCount === 2) {
                widthClass = hasLongTitles ? "w-[390px]" : "w-[340px]";
                gridClass = "grid-cols-2";
              } else if (toolCount <= 4) {
                widthClass = hasLongTitles ? "w-[420px]" : "w-[370px]";
                gridClass = "grid-cols-2";
              } else if (toolCount <= 6) {
                widthClass = hasLongTitles ? "w-[510px]" : "w-[460px]";
                gridClass = "grid-cols-2 sm:grid-cols-3";
              } else if (toolCount <= 12) {
                widthClass = hasLongTitles ? "w-[550px] xl:w-[590px]" : "w-[500px] xl:w-[540px]";
                gridClass = "grid-cols-3";
              } else {
                widthClass = hasLongTitles ? "w-[670px] xl:w-[730px]" : "w-[610px] xl:w-[660px]";
                gridClass = "grid-cols-3 xl:grid-cols-4";
              }

              return (
                <div
                  onMouseEnter={() => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); }}
                  onMouseLeave={handleMouseLeaveCategory}
                  className={`hidden lg:block absolute right-[105%] ${widthClass} rounded-2xl overflow-hidden shadow-xl z-50 border border-border/80 dark:border-white/10 animate-in fade-in-0 zoom-in-[0.98] slide-in-from-right-3 duration-150 backdrop-blur-xl`}
                  style={{
                    background: "var(--color-card)",
                    boxShadow: "0 18px 48px -8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.08)",
                    top: `${popoverTop}px`,
                  }}
                >
                  {/* Connector arrow */}
                  <div
                    className="absolute top-4 -right-[6px] w-3 h-3 rotate-45 border-r border-t border-border/70 dark:border-white/15 z-10"
                    style={{ background: "var(--color-card)" }}
                  />

                  {/* Gradient Compact Header */}
                  <div
                    className={`relative flex items-center justify-between gap-2.5 px-3 py-2 overflow-hidden bg-gradient-to-br ${cat.gradient}`}
                  >
                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full opacity-25 blur-lg bg-white pointer-events-none" />

                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-6.5 h-6.5 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-xs border border-white/30">
                        <CatIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1 text-right">
                        <h4 className="font-bold text-[11.5px] text-white leading-snug break-words">
                          {cat.title}
                        </h4>
                        {(cat as any).titleEn && (
                          <span className="text-[9px] text-white/80 font-medium tracking-wide block truncate mt-0.5" dir="ltr">
                            {(cat as any).titleEn}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[9px] font-bold text-white bg-black/25 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/20 shrink-0">
                      {cat.tools.length} ئامراز
                    </span>
                  </div>

                  {/* Tool Grid — Compact and beautifully proportioned */}
                  <div className="p-2.5">
                    <div className={`grid ${gridClass} gap-1.5`}>
                      {cat.tools.map((tool) => {
                        const ToolIcon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => {
                              if (!isAuthenticated) {
                                setHoveredCategoryIdx(null);
                                openAuthModal("login");
                                return;
                              }
                              setSelectedCategoryIndex(hoveredCategoryIdx);
                              setActiveTool(tool.id as ToolId);
                              setActiveExtraSection(null);
                              setHoveredCategoryIdx(null);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="text-right p-1.5 px-2.5 rounded-lg bg-secondary/45 hover:bg-primary/10 border border-border/50 hover:border-primary/40 hover:shadow-xs transition-all duration-150 flex flex-row-reverse items-center gap-2 group cursor-pointer min-h-[38px] h-auto"
                          >
                            {/* Icon */}
                            <div
                              className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all duration-150 bg-gradient-to-br ${cat.gradient} shadow-2xs group-hover:scale-105`}
                            >
                              <ToolIcon className="w-3.5 h-3.5 text-white" />
                            </div>
                            {/* Text - Complete display without cut off */}
                            <div className="min-w-0 flex-1 text-right flex flex-col justify-center py-0.5">
                              <span className="font-bold text-[9.5px] sm:text-[10px] text-foreground leading-[1.3] group-hover:text-primary transition-colors break-words whitespace-normal">
                                {tool.title}
                              </span>
                              {(tool as any).group && (
                                <span className="text-[8px] text-muted-foreground font-medium block truncate mt-0.5 opacity-75">
                                  {(tool as any).group}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="relative z-10 flex flex-col gap-1">
              {/* Main Page / Home Button */}
              {(() => {
                const isHomeSelected = !activeExtraSection && selectedCategoryIndex === null;
                return (
                  <button
                    onClick={() => {
                      setSelectedCategoryIndex(null);
                      setActiveTool(null);
                      setActiveExtraSection(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full text-right px-2.5 py-1.5 rounded-lg border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                      isHomeSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                        : "bg-card/90 dark:bg-card/85 border-border/80 hover:border-emerald-500/50 text-foreground hover:bg-card shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-6.5 h-6.5 rounded-md flex items-center justify-center transition shrink-0 ${
                          isHomeSelected
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white"
                        }`}
                      >
                        <Home className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-[11.5px] truncate block text-right">
                        سەرەکی
                      </span>
                    </div>
                    <ChevronLeft
                      className={`w-3.5 h-3.5 transition-transform mr-0.5 ${
                        isHomeSelected
                          ? "text-primary-foreground -translate-x-0.5"
                          : "text-muted-foreground group-hover:-translate-x-0.5"
                      }`}
                    />
                  </button>
                );
              })()}

              {categories.map((cat, idx) => {
                const isSelected = !activeExtraSection && selectedCategoryIndex === idx;
                return (
                  <button
                    key={idx}
                    ref={(el) => { categoryButtonRefs.current[idx] = el; }}
                    onMouseEnter={() => handleMouseEnterCategory(idx)}
                    onMouseLeave={handleMouseLeaveCategory}
                    onClick={() => {
                      setSelectedCategoryIndex(idx);
                      setActiveTool(null);
                      setActiveExtraSection(null);
                      setHoveredCategoryIdx(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full text-right px-2.5 py-1.5 rounded-lg border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                        : "bg-card/90 dark:bg-card/85 border-border/80 hover:border-emerald-500/50 text-foreground hover:bg-card shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-6.5 h-6.5 rounded-md flex items-center justify-center transition shrink-0 ${
                          isSelected
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : `bg-gradient-to-br ${cat.gradient} text-white`
                        }`}
                      >
                        <cat.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-[11.5px] truncate block text-right">
                        {cat.shortTitle}
                      </span>
                    </div>
                    <ChevronLeft
                      className={`w-3.5 h-3.5 transition-transform mr-0.5 ${
                        isSelected
                          ? "text-primary-foreground -translate-x-0.5"
                          : "text-muted-foreground group-hover:-translate-x-0.5"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Quick Nav Links placed vertically under each other in the sidebar */}
            <div className="relative z-10 pt-1.5 border-t border-emerald-500/25 mt-0.5 flex flex-col gap-1">
              <button
                onClick={() => {
                  const next = activeExtraSection === "about" ? null : "about";
                  setActiveExtraSection(next);
                  setActiveTool(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-full text-right px-2.5 py-1.5 rounded-lg border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                  activeExtraSection === "about"
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-card/80 dark:bg-card/70 border-border/70 hover:border-emerald-500/40 text-foreground hover:bg-card shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition shrink-0 ${
                      activeExtraSection === "about"
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    <GraduationCap className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-[11px] truncate block text-right">
                    دامەزرێنەر
                  </span>
                </div>
                <ChevronLeft
                  className={`w-3.5 h-3.5 transition-transform ${
                    activeExtraSection === "about"
                      ? "text-primary-foreground -translate-x-0.5"
                      : "text-muted-foreground group-hover:-translate-x-0.5"
                  }`}
                />
              </button>

              <button
                onClick={() => {
                  const next = activeExtraSection === "features" ? null : "features";
                  setActiveExtraSection(next);
                  setActiveTool(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-full text-right px-2.5 py-1.5 rounded-lg border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                  activeExtraSection === "features"
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-card/80 dark:bg-card/70 border-border/70 hover:border-emerald-500/40 text-foreground hover:bg-card shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition shrink-0 ${
                      activeExtraSection === "features"
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-[11px] truncate block text-right">
                    بوچی ئەم؟
                  </span>
                </div>
                <ChevronLeft
                  className={`w-3.5 h-3.5 transition-transform ${
                    activeExtraSection === "features"
                      ? "text-primary-foreground -translate-x-0.5"
                      : "text-muted-foreground group-hover:-translate-x-0.5"
                  }`}
                />
              </button>

              <button
                onClick={() => {
                  const next = activeExtraSection === "pricing" ? null : "pricing";
                  setActiveExtraSection(next);
                  setActiveTool(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-full text-right px-2.5 py-1.5 rounded-lg border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                  activeExtraSection === "pricing"
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-card/80 dark:bg-card/70 border-border/70 hover:border-emerald-500/40 text-foreground hover:bg-card shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition shrink-0 ${
                      activeExtraSection === "pricing"
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    <Crown className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-[11px] truncate block text-right">
                    پلانێن بهایی
                  </span>
                </div>
                <ChevronLeft
                  className={`w-3.5 h-3.5 transition-transform ${
                    activeExtraSection === "pricing"
                      ? "text-primary-foreground -translate-x-0.5"
                      : "text-muted-foreground group-hover:-translate-x-0.5"
                  }`}
                />
              </button>

              <button
                onClick={() => {
                  const next = activeExtraSection === "invite" ? null : "invite";
                  setActiveExtraSection(next);
                  setActiveTool(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-full text-right px-2.5 py-1.5 rounded-lg border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                  activeExtraSection === "invite"
                    ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-600 shadow-xs shadow-pink-500/25"
                    : "bg-card/80 dark:bg-card/70 border-border/70 hover:border-pink-500/40 text-foreground hover:bg-card shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition shrink-0 ${
                      activeExtraSection === "invite"
                        ? "bg-white/20 text-white"
                        : "bg-pink-500/10 text-pink-500"
                    }`}
                  >
                    <Gift className="w-3 h-3" />
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="font-bold text-[11px] truncate block text-right">
                      داخوازکرنا هەڤالان
                    </span>
                    <span className="text-[8.5px] px-1 py-0.2 rounded-full bg-pink-500/15 text-pink-600 dark:text-pink-300 font-extrabold border border-pink-500/25">
                      +25
                    </span>
                  </div>
                </div>
                <ChevronLeft
                  className={`w-3.5 h-3.5 transition-transform ${
                    activeExtraSection === "invite"
                      ? "text-white -translate-x-0.5"
                      : "text-muted-foreground group-hover:-translate-x-0.5"
                  }`}
                />
              </button>

              {/* پڕۆفایل و هەژمارەکەم (My Profile & Account Section) */}
              <button
                onClick={() => {
                  const next = activeExtraSection === "profile" ? null : "profile";
                  setActiveExtraSection(next);
                  setActiveTool(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-full text-right px-2.5 py-1.5 rounded-lg border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                  activeExtraSection === "profile"
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-card/80 dark:bg-card/70 border-border/70 hover:border-emerald-500/40 text-foreground hover:bg-card shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center transition shrink-0 ${
                      activeExtraSection === "profile"
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    <Settings className="w-3 h-3" />
                  </div>
                  <span className="font-bold text-[11px] truncate block text-right">
                    پڕۆفایل و هەژمارا من
                  </span>
                </div>
                <ChevronLeft
                  className={`w-3.5 h-3.5 transition-transform ${
                    activeExtraSection === "profile"
                      ? "text-primary-foreground -translate-x-0.5"
                      : "text-muted-foreground group-hover:-translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </aside>

          {/* LEFT MAIN AREA */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {/* When NO extra section is active: Show Tools Picker */}
            {!activeExtraSection && (
              <>
                {!activeTool && (
                  <>


                    {/* Mobile Horizontal Slider */}
                    <div className="lg:hidden flex gap-2.5 overflow-x-auto p-2 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/20 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-emerald-950/50 border border-emerald-500/25 backdrop-blur-md no-scrollbar snap-x mb-4">
                      <button
                        onClick={() => setSelectedCategoryIndex(null)}
                        className={`snap-start shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                          selectedCategoryIndex === null
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-card/90 text-foreground border-border/80 hover:bg-card shadow-xs"
                        }`}
                      >
                        <Home className="w-4 h-4" />
                        <span>سەرەکی</span>
                      </button>
                      {categories.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedCategoryIndex(idx);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`snap-start shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 border ${
                            selectedCategoryIndex === idx
                              ? "bg-primary text-primary-foreground border-primary shadow-md"
                              : "bg-card text-foreground border-border hover:bg-secondary"
                          }`}
                        >
                          <cat.icon className="w-4 h-4" />
                          <span>{cat.shortTitle}</span>
                        </button>
                      ))}
                    </div>

                    {/* When ON HOME ("سەرەکی"): Show clean Landing & Category Cards (NO massive 31-tool list) */}
                    {selectedCategoryIndex === null && !searchQuery.trim() ? (
                      <div className="space-y-6 animate-in fade-in-50 duration-300">
                        {/* AI Welcome Assistant – Dynamic & Interactive Homepage Experience */}
                        <Suspense fallback={null}>
                          <AiWelcomeAssistant
                            onSelectTool={(id) => {
                              if (id === "about") {
                                setActiveExtraSection("about");
                                setActiveTool(null);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                                return;
                              }
                              if (id === "english_learning" || id === "daily_briefing") {
                                openTool("daily_briefing");
                                return;
                              }
                              openTool(id as ToolId);
                            }}
                            onSelectCategory={(idx) => setSelectedCategoryIndex(idx)}
                          />
                        </Suspense>
                      </div>
                    ) : (
                      /* When a specific Category is Selected OR user is Searching */
                      <>
                        {/* Search Input Box */}
                        <div className="relative">
                          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ل ناڤ ئامرازان بگەڕە..."
                            className="w-full h-10 pr-10 pl-9 rounded-xl bg-card border border-border shadow-2xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-xs sm:text-[13px] transition"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center text-[10px] cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Category Header Banner */}
                        {searchQuery.trim() ? (
                          <div className="p-2.5 px-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <Search className="w-4 h-4 text-primary" />
                              <span className="text-xs font-bold text-foreground">
                                دەرئەنجامێن گەڕانێ بۆ: <span className="text-primary font-extrabold">"{searchQuery}"</span>
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-primary bg-background px-2.5 py-0.5 rounded-md border border-primary/20">
                              {totalFilteredTools} ئامراز
                            </span>
                          </div>
                        ) : selectedCategoryIndex !== null && categories[selectedCategoryIndex] ? (
                          <div className="p-2.5 px-3 rounded-xl bg-secondary/30 border border-border flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${categories[selectedCategoryIndex].gradient} shadow-2xs shrink-0`}
                              >
                                {(() => {
                                  const CatIcon = categories[selectedCategoryIndex].icon;
                                  return <CatIcon className="w-3.5 h-3.5 text-white" />;
                                })()}
                              </div>
                              <div className="min-w-0 text-right">
                                <h3 className="text-xs sm:text-[13px] font-bold text-foreground truncate">
                                  {categories[selectedCategoryIndex].title}
                                </h3>
                                {(categories[selectedCategoryIndex] as any).titleEn && (
                                  <span className="text-[9.5px] text-muted-foreground font-mono block truncate" dir="ltr">
                                    {(categories[selectedCategoryIndex] as any).titleEn}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                {categories[selectedCategoryIndex].tools.length} ئامراز
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedCategoryIndex(null);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-md bg-secondary hover:bg-secondary/80 transition cursor-pointer"
                              >
                                سەرەکی
                              </button>
                            </div>
                          </div>
                        ) : null}

                        {/* Tools Grid */}
                        {totalFilteredTools === 0 ? (
                          <div className="text-center py-10 px-4 bg-card rounded-xl border border-border my-3">
                            <p className="text-xs font-bold text-foreground mb-1">
                              چ ئامرازەک بۆ گەڕانەکا تە نەهاتە دیتن
                            </p>
                            <p className="text-[11px] text-muted-foreground mb-3">
                              پەیڤەکا دی تاقی بکە یان پیتان بپشکنە
                            </p>
                            <button
                              onClick={() => {
                                setSearchQuery("");
                                setSelectedCategoryIndex(null);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold hover:opacity-90 transition cursor-pointer"
                            >
                              پاقژکرنا لێگەڕیانێ
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4 animate-in fade-in-50 duration-300">
                            {filteredCategories.map((cat, ci) => {
                              const uniqueGroups = Array.from(
                                new Set(cat.tools.map((t: any) => t.group).filter(Boolean))
                              ) as string[];

                              return (
                                <div key={ci} className="space-y-3">
                                  {searchQuery.trim() && (
                                    <h4 className="text-[11px] font-bold border-b border-border pb-1 text-muted-foreground">
                                      <span>{cat.title}</span>
                                    </h4>
                                  )}

                                  {/* Subgroup Filter Tabs for categories with multiple groups */}
                                  {!searchQuery.trim() && uniqueGroups.length > 1 && (
                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar pt-0.5">
                                      <button
                                        onClick={() => setSelectedSubGroup(null)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                                          selectedSubGroup === null
                                            ? "bg-primary text-primary-foreground shadow-2xs scale-100"
                                            : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                                        }`}
                                      >
                                        هەمی
                                      </button>
                                      {uniqueGroups.map((grp, grpIdx) => {
                                        const theme = getSubGroupTheme(grp, grpIdx);
                                        const isSelected = selectedSubGroup === grp;
                                        return (
                                          <button
                                            key={grp}
                                            onClick={() => setSelectedSubGroup(isSelected ? null : grp)}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                                              isSelected
                                                ? `${theme.tabActive} border-transparent scale-100`
                                                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border-border/50"
                                            }`}
                                          >
                                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : theme.dot}`} />
                                            <span>{grp}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Grouped View vs Filtered Grid */}
                                  {!searchQuery.trim() && uniqueGroups.length > 1 && selectedSubGroup === null ? (
                                    <div className="space-y-4">
                                      {uniqueGroups.map((grpName, grpIdx) => {
                                        const theme = getSubGroupTheme(grpName, grpIdx);
                                        const groupTools = cat.tools.filter((t: any) => t.group === grpName);
                                        if (groupTools.length === 0) return null;
                                        return (
                                          <div
                                            key={grpName}
                                            className={`space-y-2.5 p-3 sm:p-3.5 rounded-xl border ${theme.container} backdrop-blur-xs transition-all`}
                                          >
                                            <div className="flex items-center border-b border-border/40 pb-2">
                                              <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${theme.dot} animate-pulse`} />
                                                <h4 className="text-xs sm:text-[13px] font-bold text-foreground">
                                                  {grpName}
                                                </h4>
                                              </div>
                                            </div>
                                            <div className={
                                              groupTools.length === 1
                                                ? "flex flex-wrap gap-2.5"
                                                : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5"
                                            }>
                                              {groupTools.map((t) => (
                                                <button
                                                  key={t.id}
                                                  onClick={() => openTool(t.id as ToolId)}
                                                  id={t.id === "chat" ? "chat" : undefined}
                                                  className={`group relative text-right rounded-lg p-2.5 bg-card border border-border ${theme.cardHoverBorder} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between cursor-pointer ${
                                                    groupTools.length === 1 ? "w-full sm:w-fit" : ""
                                                  }`}
                                                  style={{ boxShadow: "var(--shadow-elegant)" }}
                                                >
                                                  <div>
                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                      <div
                                                        className="w-6.5 h-6.5 rounded-md flex items-center justify-center text-white group-hover:scale-105 transition shadow-2xs"
                                                        style={{ background: theme.iconGradient }}
                                                      >
                                                        <t.icon className="w-3.5 h-3.5" />
                                                      </div>
                                                    </div>
                                                    <h4 className={`text-[11.5px] sm:text-xs font-bold mb-0.5 ${theme.titleHover} transition-colors text-foreground`}>
                                                      {t.title}
                                                    </h4>
                                                    <p className="text-muted-foreground text-[10px] sm:text-[10.5px] leading-snug line-clamp-2">
                                                      {t.desc}
                                                    </p>
                                                  </div>
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className={
                                      cat.tools.filter((t: any) => !selectedSubGroup || t.group === selectedSubGroup).length === 1
                                        ? "flex flex-wrap gap-2.5"
                                        : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5"
                                    }>
                                      {cat.tools
                                        .filter((t: any) => !selectedSubGroup || t.group === selectedSubGroup)
                                        .map((t) => {
                                           const grp = (t as any).group; const toolTheme = grp ? getSubGroupTheme(grp, uniqueGroups.indexOf(grp)) : null;
                                           return (
                                             <button
                                               key={t.id}
                                               onClick={() => openTool(t.id as ToolId)}
                                               id={t.id === "chat" ? "chat" : undefined}
                                               className={`group relative text-right rounded-lg p-2.5 bg-card border border-border ${
                                                 toolTheme ? toolTheme.cardHoverBorder : "hover:border-primary/60"
                                               } transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between cursor-pointer ${
                                                 cat.tools.filter((t: any) => !selectedSubGroup || t.group === selectedSubGroup).length === 1 ? "w-full sm:w-fit" : ""
                                               }`}
                                               style={{ boxShadow: "var(--shadow-elegant)" }}
                                             >
                                               <div>
                                                 <div className="flex items-center justify-between gap-1.5 mb-1.5">
                                                   <div
                                                     className="w-6.5 h-6.5 rounded-md flex items-center justify-center text-white group-hover:scale-105 transition shadow-2xs"
                                                     style={{ background: toolTheme ? toolTheme.iconGradient : "var(--gradient-primary)" }}
                                                   >
                                                     <t.icon className="w-3.5 h-3.5" />
                                                   </div>
                                                   {toolTheme && (
                                                     <span className={`text-[8px] font-bold px-1 py-0.2 rounded border ${toolTheme.badge}`}>
                                                       {(t as any).group}
                                                     </span>
                                                   )}
                                                 </div>
                                                 <h4 className={`text-[11.5px] sm:text-xs font-bold mb-0.5 ${
                                                   toolTheme ? toolTheme.titleHover : "group-hover:text-primary"
                                                 } transition-colors text-foreground ${
                                                   cat.tools.filter((t: any) => !selectedSubGroup || t.group === selectedSubGroup).length === 1 ? "sm:whitespace-nowrap" : ""
                                                 }`}>
                                                   {t.title}
                                                 </h4>
                                                 <p className="text-muted-foreground text-[10px] sm:text-[10.5px] leading-snug line-clamp-2">
                                                   {t.desc}
                                                 </p>
                                               </div>
                                             </button>
                                           );
                                         })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Active Tool View */}
                {activeTool && (
                  <div ref={toolContainerRef} className="animate-in fade-in-50 duration-300">
                    {!isAuthenticated ? (
                      <div className="p-8 md:p-12 rounded-3xl bg-card border border-border shadow-xl text-center space-y-5 max-w-xl mx-auto my-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 flex items-center justify-center mx-auto text-primary shadow-sm">
                          <Lock className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-extrabold text-foreground">
                            پێدڤیە سەرەتا بچیە ژوور
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            بو بکارئینانا ڤی ئامرازی و پاراستنا پێزانینێن خۆ، هیڤیە سەرەتا بچە ژوور یان هەژمارەکا نوو چێکە.
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <button
                            onClick={() => openAuthModal("login")}
                            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm hover:opacity-90 transition shadow-sm cursor-pointer"
                          >
                            چوونە ژوور
                          </button>
                          <button
                            onClick={() => openAuthModal("register")}
                            className="px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-foreground font-bold text-xs sm:text-sm transition cursor-pointer"
                          >
                            خۆتۆمارکرن
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const activeItem = allToolsList.find((t) => t.id === activeTool);
                          const activeTitle = activeItem?.title || activeTool || "";

                          return (
                            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                              <button
                                onClick={() => setActiveTool(null)}
                                aria-label="زڤرین بۆ هەمی ئامرازان"
                                title="زڤرین بۆ هەمی ئامرازان"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-secondary border border-border hover:bg-secondary/80 hover:scale-105 active:scale-95 transition text-foreground font-bold text-xs sm:text-sm cursor-pointer shadow-xs"
                              >
                                <ArrowRight className="w-4 h-4" />
                                <span>زڤرین بۆ هەمی ئامرازان</span>
                              </button>
                            </div>
                          );
                        })()}

                        <Suspense fallback={<ToolSkeletonLoader />}>
                      {activeTool === "summary" && <Uploader />}
                      {activeTool === "chat" && <ChatBox />}
                      {activeTool === "humanize" && <Humanizer />}
                      {activeTool === "ocr" && <Handwriting />}
                      {activeTool === "planner" && (
                        <AiTool
                          tool="planner"
                          title="پلانا خواندنا AI"
                          description="بابەت و دەمێ خواندنێ بنڤیسە، پلانەکا ڕۆژانە وەردگری."
                          placeholder="نموونە: 7 ڕۆژ بو تاقیکرنا کیمیایێ، 3 کاتژمێر د ڕۆژەکێدا"
                          buttonLabel="پلانا من بو دروست بکە"
                        />
                      )}
                      {activeTool === "solver" && (
                        <MathSolver
                          onOpenGrapher={() => openTool("grapher")}
                          onOpenWord={() => openTool("math2word")}
                        />
                      )}
                      {activeTool === "math2word" && <Math2Word />}
                      {activeTool === "grader" && (
                        <AiTool
                          tool="grader"
                          title="هەڵسەنگاندنا نڤیسینێ"
                          description="دەقێ نڤیسینێ یان وتارەکێ بدانە بۆ هەڵسەنگاندن و پێدانا نمرەیێ دگەل تێبینیان."
                          placeholder="دەقێ وتار یان نڤیسینا خۆ ل ڤێرێ بنڤیسە..."
                          buttonLabel="هەڵسەنگاندنێ بکە"
                          withFile
                          fileAccept="image/*,application/pdf,.docx,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        />
                      )}
                      {activeTool === "glossary" && (
                        <AiTool
                          tool="glossary"
                          title="فەرهەنگا زانستی"
                          description="بابەتەکێ زانستی بنڤیسە بۆ وەرگرتنا زاراوە و پێناسەیێن سەرەکی."
                          placeholder="نموونە: Calculus، Quantum Physics، Linear Algebra"
                          buttonLabel="زاراڤان نیشان بدە"
                          withFile
                          fileAccept="image/*,application/pdf,.docx,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        />
                      )}
                      {activeTool === "testai" && (
                        <AiTool
                          tool="testai"
                          title="پشکنینا نڤیسینا AI"
                          description="فایلێ PDF باربکە بۆ پشکنین و دیتنا ڕێژەیا نڤیسینا AI د ڤەکۆلینێدا."
                          placeholder=""
                          buttonLabel="پشکنینێ بکە"
                          withFile
                          fileOnly
                          showPercentage
                          fileAccept="application/pdf,.pdf"
                          onOpenTool={(t) => openTool(t as ToolId)}
                        />
                      )}
                      {activeTool === "testplagiarism" && (
                        <AiTool
                          tool="testplagiarism"
                          title="پشکنینا پلەجیاریزم (Plagiarism)"
                          description="فایلێ PDF باربکە بۆ پشکنین و دەستنیشانکرنا دەقێ دوبارە و کۆپیکری."
                          placeholder=""
                          buttonLabel="پشکنینێ بکە"
                          withFile
                          fileOnly
                          showPercentage
                          fileAccept="application/pdf,.pdf"
                          onOpenTool={(t) => openTool(t as ToolId)}
                        />
                      )}
                      {activeTool === "grapher" && <FunctionGrapher />}
                      {activeTool === "grammar" && (
                        <AiTool
                          tool="grammar"
                          title="ڕاستڤەکەرێ ڕێزمانی"
                          description="دەقێ کوردی، ئینگلیزی یان عەرەبی بنڤیسە بۆ ڕاستڤەکرنا هەڵەیێن ڕێزمانی و ڕێنووس."
                          placeholder="دەقێ خۆ ل ڤێرێ بنڤیسە بۆ ڕاستڤەکرنێ..."
                          buttonLabel="ڕاستڤە بکە"
                          withFile
                          fileAccept="image/*,application/pdf,.docx,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        />
                      )}
                      {activeTool === "translator" && (
                        <AiTool
                          tool="translator"
                          title="وەرگێڕێ ئەکادیمی"
                          description="دەقێ زانستی یان ئەکادیمی بنڤیسە یان فایلێ بنێرە بۆ وەرگێڕان."
                          placeholder="دەقێ ئەکادیمی ل ڤێرێ بنڤیسە..."
                          buttonLabel="وەرگێڕان"
                          withFile
                          fileAccept="image/*,application/pdf,.docx,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        />
                      )}
                      {activeTool === "audio_sum" && <AudioTranscriber />}

                      {/* ── PDF Services (Tools 12–21) ── */}
                      {activeTool === "pdf_merge" && <PdfMerge />}
                      {activeTool === "pdf_split" && <PdfSplit />}
                      {activeTool === "pdf_compress" && <PdfCompress />}
                      {activeTool === "pdf_to_word" && <PdfToWord />}
                      {activeTool === "pdf_to_ppt" && <PdfToPpt />}
                      {activeTool === "pdf_to_excel" && <PdfToExcel />}
                      {activeTool === "files_to_pdf" && <FilesToPdf />}
                      {activeTool === "pdf_rotate" && <PdfRotate />}
                      {activeTool === "pdf_protect" && <PdfProtect />}
                      {activeTool === "pdf_watermark" && <PdfWatermark />}

                      {/* ── Advanced Media, Forensics & Video ── */}
                      {activeTool === "video_converter" && <VideoConverter />}
                      {activeTool === "video_compressor" && <VideoCompressor />}
                      {activeTool === "video_downloader" && <VideoDownloader />}
                      {activeTool === "document_forensics" && <DocumentForensics />}

                      {/* ── Research & Academic Suite (11 Tools) ── */}
                      {activeTool === "research_assistant" && (
                        <AiTool
                          tool="research_assistant"
                          title="هاریکارێ ڤەکۆلینێ (Research Assistant)"
                          description="پلان، تێز و هزرێن ڤەکۆلینا ئەکادیمی بنڤیسە بۆ ڕێنمایی و پێشنیارێن زانستی."
                          placeholder="تەوەرێ ڤەکۆلینێ، پسیار یان هزرا تێزا خۆ ل ڤێرێ بنڤیسە..."
                          buttonLabel="داڕشتنا ڕاوێژا ڤەکۆلینێ"
                          withFile
                          fileAccept="image/*,application/pdf,.docx,.pptx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        />
                      )}
                      {activeTool === "paper_summarizer" && (
                        <AiTool
                          tool="paper_summarizer"
                          title="کورتکرنا پەڕاوێ زانستی (Paper Summarizer)"
                          description="فایلێ PDF یان دەقێ وتار و تێزان باربکە بۆ وەرگرتنا کورتیا ئەکادیمی یا 6 پشکی."
                          placeholder="دەقێ پەڕاو یان وتارا زانستی ل ڤێرێ بنڤیسە یان فایلێ PDF باربکە..."
                          buttonLabel="کورتکرنا پەڕاوی"
                          withFile
                          fileAccept="application/pdf,.docx,.pptx,image/*"
                        />
                      )}
                      {activeTool === "abstract_generator" && (
                        <AiTool
                          tool="abstract_generator"
                          title="چێکەرێ کورتیا ئەکادیمی (Abstract Generator)"
                          description="تەوەرێ ڤەکۆلینێ یان ڕەشنڤیسێ بنڤیسە بۆ چێکرنا ئەبستراکتێ ستانداردێ نێڤدەوڵەتی."
                          placeholder="ناڤەرۆکا ڤەکۆلینێ یان کورتیا بابەتێ خۆ بنڤیسە..."
                          buttonLabel="چێکرنا Abstract"
                          withFile
                          fileAccept="application/pdf,.docx,.pptx,image/*"
                        />
                      )}
                      {activeTool === "lit_review" && (
                        <AiTool
                          tool="lit_review"
                          title="پێداچوونا ئەدەبیاتێ (Literature Review Assistant)"
                          description="ژێدەر، کورتیا ڤەکۆلینان یان بابەتێ بنڤیسە بۆ بەراوردکرن، پولینکرن و دیتنا Research Gap."
                          placeholder="ناڤونیشان، ژێدەر یان کورتیا چەند ڤەکۆلینان ل ڤێرێ دابنێ..."
                          buttonLabel="شیکاریا پێداچوونا ئەدەبیاتێ"
                          withFile
                          fileAccept="application/pdf,.docx,.pptx,image/*"
                        />
                      )}
                      {activeTool === "research_question" && (
                        <AiTool
                          tool="research_question"
                          title="پسیار و گریمانەیێن ڤەکۆلینێ (Research Question Generator)"
                          description="تەوەر و ئارمانجا ڤەکۆلینا خۆ بنڤیسە بۆ داڕشتنا پسیارا سەرەکی، لاوەکی و گریمانەیێن (H0/H1)."
                          placeholder="نموونە: کارتێکرنا زیرەکیا دەستکرد ل سەر فێربوونا خواندەڤانێن زانکۆیێ..."
                          buttonLabel="داڕشتنا پسیار و گریمانەیان"
                        />
                      )}
                      {activeTool === "methodology_assistant" && (
                        <AiTool
                          tool="methodology_assistant"
                          title="مێتۆدۆلۆژیا ڤەکۆلینێ (Methodology Assistant)"
                          description="ئارمانجا ڤەکۆلینا خۆ بنڤیسە بۆ وەرگرتنا پلانا تەواو یا مێتۆدۆلۆژیا، قەبارەیا نموونەیێ و ئامرازێن شیکاریێ."
                          placeholder="تەوەر و مەرەما ڤەکۆلینا خۆ ل ڤێرێ بنڤیسە..."
                          buttonLabel="داڕشتنا مێتۆدۆلۆژیا"
                        />
                      )}
                      {activeTool === "citation_generator" && <CitationTool />}
                      {activeTool === "bibtex_generator" && <BibTexTool />}
                      {activeTool === "doi_citation" && <DoiCitationTool />}
                      {activeTool === "latex_word" && <LatexWordTool />}
                      {activeTool === "latex_editor" && <LatexEditorTool />}

                      {/* ── Security & QR Code Tools (7 Tools) ── */}
                      {activeTool === "qr_generator" && <QrCodeGenerator />}
                      {activeTool === "qr_scanner" && <QrCodeScanner />}
                      {activeTool === "hash_generator" && <HashGenerator />}
                      {activeTool === "base64_tool" && <Base64Tool />}
                      {activeTool === "url_encoder" && <UrlEncoderTool />}
                      {activeTool === "uuid_generator" && <UuidGenerator />}
                      {activeTool === "link_checker" && <LinksChecker />}

                      {/* ── Business Toolkit (9 Tools) ── */}
                      {activeTool === "profit_calc" && <ProfitCalculator />}
                      {activeTool === "vat_calc" && <VatCalculator />}
                      {activeTool === "salary_calc" && <SalaryCalculator />}
                      {activeTool === "discount_calc" && <DiscountCalculator />}
                      {activeTool === "loan_calc" && <LoanCalculator />}
                      {activeTool === "currency_calc" && <CurrencyConverter />}
                      {activeTool === "breakeven_calc" && <BreakEvenCalculator />}
                      {activeTool === "roi_calc" && <RoiCalculator />}
                      {activeTool === "invoice_tool" && <InvoiceGenerator initialDocType="invoice" />}
                      {activeTool === "receipt_tool" && <InvoiceGenerator initialDocType="receipt" />}
                      {activeTool === "quotation_tool" && <InvoiceGenerator initialDocType="quotation" />}
                      {activeTool === "purchase_order_tool" && <InvoiceGenerator initialDocType="purchase_order" />}
                      {activeTool === "delivery_note_tool" && <InvoiceGenerator initialDocType="delivery_note" />}

                      {/* ── Statistics Lab & Data Science ── */}
                      {activeTool === "statistics_lab" && <StatisticsLab />}

                      {/* ── Study Group Room ── */}
                      {activeTool === "study_group" && <StudyGroupRoom />}

                      {/* ── AI Daily Briefing ── */}
                      {activeTool === "daily_briefing" && (
                        <AiDailyBriefing onSelectTool={(id) => openTool(id as ToolId)} />
                      )}
                    </Suspense>
                  </>
                )}
              </div>
            )}
              </>
            )}

            {/* About - Conditional */}
            {activeExtraSection === "about" && (
              <section id="about" className="p-6 md:p-8 rounded-3xl border border-emerald-500/30 dark:border-emerald-500/20 bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 backdrop-blur-xl shadow-xl shadow-emerald-500/5 animate-in fade-in-0 slide-in-from-top-2 duration-300 relative overflow-hidden">
                {/* Ambient background glow */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

                <div className="max-w-5xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    <div className="relative flex justify-center">
                      <div
                        className="absolute -inset-3 rounded-3xl opacity-50 blur-2xl pointer-events-none"
                        style={{ background: "var(--gradient-primary)" }}
                      />
                      <div
                        className="relative rounded-3xl overflow-hidden border-4 border-card w-48 h-60 md:w-56 md:h-72 shadow-2xl"
                        style={{ boxShadow: "var(--shadow-glow)" }}
                      >
                        <img
                          src={sangarImgUrl}
                          alt="سەنگەر محمد حەسەن"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <div className="text-right space-y-4 sm:space-y-4.5">
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>دامەزرینەر</span>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">سەنگەر محمد حەسەن</h3>
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        باوەرنامەیا ماستەر ب زانستێن بیرکاری
                      </p>
                      <p className="text-sm md:text-base leading-loose sm:leading-[2] text-foreground/90 font-medium text-justify">
                        ئارمانجا من پێش ئێخستنا کار و خواندنا ئەکادیمی یە ب هاریکاریا زیرەکیا دەستکرد، داکو خودان کار و قوتابیێن هێژا بشێن ب ساناهی و بلەز فێربن و دەرفەت و کارێن باشتر بدەست ڤە بینن.
                      </p>
                      <div className="pt-2 flex justify-center">
                        <a
                          href="mailto:sangarduhok@gmail.com"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                          dir="ltr"
                        >
                          <Mail className="w-4 h-4" />
                          sangarduhok@gmail.com
                        </a>
                      </div>
                      <div className="flex items-center gap-4 justify-center pt-3">
                        <a
                          href="mailto:sangarduhok@gmail.com"
                          aria-label="Email"
                          className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
                        >
                          <Mail className="w-5 h-5" />
                        </a>
                        <a
                          href="https://www.facebook.com/share/1DrTW5Z1ik/?mibextid=wwXIfr"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Facebook"
                          className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                        <a
                          href="https://www.instagram.com/sangar__98?igsh=NHgxbzY2bGQ5M2I0&utm_source=qr"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Instagram"
                          className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Features - Clean, Minimal & Elegant */}
            {activeExtraSection === "features" && (
              <section id="features" className="space-y-3 animate-in fade-in-50 duration-300 text-right">
                {/* Clean Header */}
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-2xs relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />
                  
                  <div className="max-w-2xl space-y-1.5 relative z-10">
                    <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                      بوچی پلاتفۆڕما <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">Las AI</span> هەلبژێری؟
                    </h2>

                    <p className="text-muted-foreground text-xs sm:text-[12.5px] leading-relaxed">
                      پلاتفۆڕمەکا زیرەکییا دەستکرد تایبەت بۆ پێشخستنا خواندن، نڤیسین و ڤەکۆلینا ئەکادیمی ب زمانێ کوردی، د ئێک جهدا ب ساناهی و بلەز.
                    </p>
                  </div>
                </div>

                {/* Clean 6 Benefit Cards (Without busy badges or clutter) */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {[
                    {
                      icon: Zap,
                      gradient: "from-amber-500 to-orange-600",
                      title: "بلندترین لەزاتی د فێربوونێ دا",
                      desc: "کورتکرنا پەرتووک و بابەتان، چێکرنا تاقیکرنێن زیرەک و پلانا خواندنا ڕۆژانە.",
                    },
                    {
                      icon: BookOpen,
                      gradient: "from-blue-600 to-indigo-600",
                      title: "هاریکارێ ڤەکۆلین و تێزێ",
                      desc: "پێداچوونا ئەدەبیاتێ، پرسیارێن زانستی و بەرهەڤکرنا ژێدەران ب ستانداردێن جیهانی.",
                    },
                    {
                      icon: ShieldCheck,
                      gradient: "from-emerald-600 to-teal-600",
                      title: "پشکنینا AI و ڕاستنڤیس",
                      desc: "پشکنینا دەقێ AI، دیتنا پلاجیاریزمێ، ڕاستکرنا ڕێزمانی و مرۆڤایەتیکرنا دەقێ AI.",
                    },
                    {
                      icon: Sigma,
                      gradient: "from-purple-600 to-pink-600",
                      title: "بیرکاری و زانستێن هوور",
                      desc: "چارەسەرکرنا هاوکێشەیان پێنگاڤ ب پێنگاڤ، کێشانا نەخشەیان و گوهۆڕین بۆ Word.",
                    },
                    {
                      icon: FileText,
                      gradient: "from-cyan-600 to-blue-700",
                      title: "خزمەتگوزاریێن گشتگیر یێن PDF",
                      desc: "یەکگرتن، دابەشکرن، بچیککرن و گوهۆڕینا PDF بۆ Word, PowerPoint و Excel.",
                    },
                    {
                      icon: BarChart3,
                      gradient: "from-rose-600 to-red-600",
                      title: "تاقیگەها ئامارێ و بازرگانی",
                      desc: "شیکاریا داتاسێتێن CSV ب ئامارێن زانستی، پشکنینا بەڵگەنامەیان و ژمێریاری.",
                    },
                  ].map((benefit, i) => (
                    <div
                      key={i}
                      className="p-3 sm:p-3.5 rounded-xl bg-card border border-border/80 hover:border-primary/50 transition-all duration-200 hover:-translate-y-0.5 shadow-2xs group flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${benefit.gradient} shadow-2xs group-hover:scale-105 transition`}
                        >
                          <benefit.icon className="w-3.5 h-3.5" />
                        </div>

                        <h3 className="font-bold text-xs sm:text-[12.5px] text-foreground group-hover:text-primary transition-colors">
                          {benefit.title}
                        </h3>

                        <p className="text-muted-foreground text-[10px] sm:text-[10.5px] leading-relaxed">
                          {benefit.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pricing - Conditional */}
            {activeExtraSection === "pricing" && (
              <section id="pricing" className="p-3 sm:p-5 rounded-2xl bg-secondary/20 border border-border animate-in fade-in-50 duration-300">
                <div className="max-w-5xl mx-auto space-y-3.5">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black">پلانێن بهایی</h2>
                    <p className="text-muted-foreground text-xs mt-0.5">پلانەکێ هەلبژێرە بۆ گەهشتن ب هەمی تایبەتمەندیان.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3.5 sm:gap-4 w-full">
                    {/* Free */}
                    <div className="rounded-2xl p-3.5 sm:p-4.5 bg-card border border-border flex flex-col justify-between shadow-2xs order-2 md:order-1">
                      <div>
                        <div className="mb-2">
                          <h3 className="text-sm sm:text-base font-bold mb-0.5">پلانا بێ بەرامبەر</h3>
                          <p className="text-muted-foreground text-[10.5px]">بو تاقیکرن و بکارئینانا کێم</p>
                        </div>
                        <div className="mb-2.5">
                          <span className="text-2xl sm:text-3xl font-extrabold font-mono" dir="ltr">0</span>
                          <span className="text-muted-foreground text-xs"> دینار</span>
                        </div>
                        <ul className="space-y-1.5 mb-3.5">
                          {[
                            "بکارئینانا ئازاد بۆ ئامرازێن سەرەکی",
                            "10 کرێدیتێن ڕۆژانە بو ئامرازێن پێشکەفتی",
                            "نوودبیتەڤە ل دەمژمێر 12:00 شەڤێ",
                            "پشتەڤانیا PDF و فایلێن سەرەتایی",
                            "لەزا ئاسایی",
                            "خالێن سەرەکی و پێناسە",
                          ].map((t) => (
                            <li key={t} className="flex items-center gap-2 text-[11px] sm:text-xs">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        onClick={() => setActiveExtraSection(null)}
                        className="block w-full text-center rounded-xl border border-border bg-background py-1.5 px-3 font-bold text-xs hover:bg-secondary transition cursor-pointer"
                      >
                        دەستپێبکە
                      </button>
                    </div>

                    {/* Pro Plan */}
                    {(() => {
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

                      const activeOptions = (pricingConfig && pricingConfig.length > 0)
                        ? pricingConfig.filter((p) => p.isActive)
                        : [
                            { id: "1m" as const, label: "1 هەیڤ", price: 5000, originalPrice: null, discountLabel: null, isActive: true },
                            { id: "3m" as const, label: "3 هەیڤ", price: 12000, originalPrice: 15000, discountLabel: "20% داشکاندن", isActive: true },
                            { id: "6m" as const, label: "6 هەیڤ", price: 22000, originalPrice: 30000, discountLabel: "25% داشکاندن", isActive: true },
                            { id: "1y" as const, label: "1 ساڵ", price: 40000, originalPrice: 60000, discountLabel: "35% باشترین داشکاندن", isActive: true },
                          ];
                      const activePro = activeOptions.find((p) => p.id === proDuration) || activeOptions[0];
                      const proWhatsAppUrl = `https://wa.me/9647501435868?text=${encodeURIComponent(
                        `سلاڤ، دڤێت پلانا پرۆ (Pro Plan) بۆ ماوێ (${toEnglishDigits(activePro.label)}) ب کۆژمێ (${toEnglishDigits(activePro.price.toLocaleString("en-US"))} دینار) چالاک بکەم.`
                      )}`;

                      return (
                        <div
                          id="pro-plan-card"
                          className="relative rounded-2xl p-3.5 sm:p-4.5 text-primary-foreground flex flex-col justify-between scroll-mt-24 order-1 md:order-2 shadow-md"
                          style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}
                        >
                          <div>
                            <div className="mb-2">
                              <h3 className="text-sm sm:text-base font-bold mb-0.5">پلانا پڕۆ (Pro Plan)</h3>
                              <p className="text-primary-foreground/85 text-[10.5px]">بو خواندەڤانێن جددی، ڤەکۆلەران و پیشەوەران</p>
                            </div>

                            {/* Duration Selector Pills with English Numbers */}
                            <div className="mb-2.5 space-y-1">
                              <label className="text-[10px] font-bold text-primary-foreground/90 block">
                                ماوێ بەشداریکرنێ هەلبژێرە:
                              </label>
                              <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-black/20 backdrop-blur-xs border border-white/15">
                                {activeOptions.map((opt) => {
                                  const isSelected = proDuration === opt.id;
                                  const cleanLabel = toEnglishDigits(opt.label);
                                  const match = cleanLabel.match(/^(\d+)\s*(.*)$/);
                                  const num = match ? match[1] : cleanLabel;
                                  const unit = match ? match[2] : "";

                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => setProDuration(opt.id)}
                                      className={`py-1 px-1 rounded-md text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer min-h-[34px] ${
                                        isSelected
                                          ? "bg-primary-foreground text-primary shadow-2xs font-black scale-[1.02]"
                                          : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
                                      }`}
                                    >
                                      <span className="font-mono text-xs sm:text-sm leading-none font-black">{num}</span>
                                      {unit && <span className="text-[8.5px] leading-tight mt-0.5 opacity-90">{unit}</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Price Display */}
                            <div className="mb-2.5 flex items-baseline gap-2 flex-wrap">
                              <span
                                className="text-2xl sm:text-3xl font-extrabold font-mono tracking-normal select-all"
                                dir="ltr"
                                style={{ fontVariantNumeric: "tabular-nums" }}
                              >
                                {toEnglishDigits(activePro.price.toLocaleString("en-US"))}
                              </span>
                              <span className="text-primary-foreground/80 text-xs">دینار / {toEnglishDigits(activePro.label)}</span>
                              {activePro.originalPrice && (
                                <span className="text-[10px] line-through text-primary-foreground/60 font-mono" dir="ltr">
                                  {toEnglishDigits(activePro.originalPrice.toLocaleString("en-US"))} د.ع
                                </span>
                              )}
                              {activePro.discountLabel && (
                                <span className="text-[8.5px] px-1.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black">
                                  {toEnglishDigits(activePro.discountLabel)}
                                </span>
                              )}
                            </div>

                            {/* Features */}
                            <ul className="space-y-1 mb-3 text-[11px] sm:text-xs">
                              {[
                                "بکارئینان و ئەپلۆدکرنا بێ سنور (Unlimited)",
                                "پشتەڤانیا هەمی جورێن فایل و ڤیدیۆیان",
                                "بلندترین لەزاتی و بلەزتر",
                                "چێکرنا کورتە، ئەزموون و شیکاریا بێ سنور",
                                "پشتەڤانیا بەردەوام و هەمی تایبەتمەندیێن داهاتی",
                              ].map((t) => (
                                <li key={t} className="flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-1.5 pt-1">
                            {/* WhatsApp Button with Dynamic Duration & Price */}
                            <a
                              href={proWhatsAppUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 rounded-xl bg-primary-foreground text-primary px-3 py-2 font-bold text-xs hover:opacity-95 shadow-2xs transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>چالاککرن ({toEnglishDigits(activePro.label)})</span>
                            </a>

                            {/* Button to Open/Close Key Input (چالاکرن برێکا کۆدی) */}
                            <button
                              type="button"
                              onClick={() => setShowPricingKeyInput(!showPricingKeyInput)}
                              className="w-full py-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-primary-foreground font-semibold text-[10.5px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Key className="w-3 h-3 text-amber-300" />
                              <span>
                                {showPricingKeyInput
                                  ? "گرتنا پشکێ کلیلێ ▲"
                                  : "چالاکرن برێکا کۆدی ▼"}
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Pro Key Redemption Box (Only visible when user clicks the Key button) */}
                  {showPricingKeyInput && (
                    <div className="mt-6 max-w-3xl mx-auto p-6 rounded-3xl bg-card border-2 border-amber-500/40 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <Key className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-foreground">نڤیسینا کلیلا چالاککرنا پڕۆ (Pro Key)</h3>
                            <p className="text-xs text-muted-foreground">
                              ئەگەر ب ڕێکا واتساپێ کلیل بو تە هاتبیتە فرێکرن، ل ڤێرێ بنڤیسە دا ئێکسەر چالاک ببیت.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setShowPricingKeyInput(false)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                          title="گرتن"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!isAuthenticated) {
                            openAuthModal("login");
                            return;
                          }
                          const res = redeemVipCode(pricingVipCode);
                          if (res.success) {
                            setPricingRedeemAlert({ type: "success", text: res.message });
                            setPricingVipCode("");
                          } else {
                            setPricingRedeemAlert({ type: "error", text: res.message });
                          }
                        }}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                      >
                        <input
                          type="text"
                          required
                          value={pricingVipCode}
                          onChange={(e) => setPricingVipCode(e.target.value.toUpperCase())}
                          placeholder="PRO-XXXX-XXXX-XXXX-XXXX"
                          className="flex-1 h-12 px-4 rounded-2xl bg-secondary/40 border border-border focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs sm:text-sm font-mono font-bold uppercase tracking-wider dir-ltr text-center sm:text-left"
                        />
                        <button
                          type="submit"
                          className="h-12 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition shrink-0"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>چالاککرنا کلیلێ</span>
                        </button>
                      </form>

                      {pricingRedeemAlert && (
                        <div
                          className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in-0 ${
                            pricingRedeemAlert.type === "success"
                              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                              : "bg-destructive/15 border border-destructive/30 text-destructive"
                          }`}
                        >
                          <Check className="w-4 h-4 shrink-0" />
                          <span>{pricingRedeemAlert.text}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Invite Friends - Dedicated Section */}
            {activeExtraSection === "invite" && (
              <section className="animate-in fade-in-50 duration-300">
                <InviteFriends />
              </section>
            )}

            {/* Profile & Account - Dedicated Section */}
            {activeExtraSection === "profile" && (
              <UserProfileSection
                onGoHome={() => setActiveExtraSection(null)}
                onOpenAdmin={() => setActiveExtraSection("admin")}
              />
            )}

            {/* Super Admin Dashboard - Dedicated Section */}
            {activeExtraSection === "admin" && (
              <AdminPanel onGoHome={() => setActiveExtraSection(null)} />
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-5">
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] sm:text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => {
              setActiveTool(null);
              setActiveExtraSection(null);
              setSelectedCategoryIndex(null);
              setSearchQuery("");
              setMenuOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 shrink-0 cursor-pointer hover:opacity-80 transition active:scale-95"
            aria-label="Las AI سەرەکی"
          >
            <img
              src="/logo.png"
              alt="Las AI Logo"
              className="w-6 h-6 rounded-md object-cover shadow-xs"
            />
            <span className="font-black text-foreground text-xs sm:text-sm">Las AI</span>
          </button>

          <div className="hidden md:inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>پشتەڤانیکری ژ لایێ زیرەکیا دەستکرد</span>
          </div>

          <p className="text-[11px] sm:text-xs font-medium text-muted-foreground">
            © {new Date().getFullYear()} Las AI — هەمی ماف پاراستینە بۆ Sangar Mohammed
          </p>
        </div>
      </footer>
    </div>
  );
}
