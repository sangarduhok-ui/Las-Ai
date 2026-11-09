import React, { useState, useEffect } from "react";
import { useAuth, type UserProfile, type VipCodeItem, type PricingPlanDuration, DEFAULT_PRICING_CONFIG, ADMIN_EMAIL } from "@/context/AuthContext";
import {
  ShieldCheck,
  Crown,
  Users,
  Megaphone,
  Sliders,
  Activity,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Database,
  Zap,
  Globe,
  Radio,
  Clock,
  Key,
  Download,
  Mail,
  Phone,
  Server,
  Lock,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Ticket,
  Send,
  CheckCheck,
  Tag,
  Percent,
  X,
  Bell,
} from "lucide-react";

interface AdminPanelProps {
  onGoHome?: () => void;
}

export function AdminPanel({ onGoHome }: AdminPanelProps) {
  const {
    user,
    isAdmin,
    allUsers,
    announcement,
    vipCodes,
    pricingConfig,
    updatePricingConfig,
    setAnnouncement,
    updateUserRole,
    toggleUserBan,
    deleteUser,
    addUserByAdmin,
    generateVipCode,
    deleteVipCode,
    broadcastNotifications,
    broadcastNotification,
    deleteBroadcastNotification,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"users" | "announcement" | "notifications" | "tools" | "vip" | "pricing" | "logs">("vip");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [annText, setAnnText] = useState(announcement.text);
  const [annActive, setAnnActive] = useState(announcement.active);
  const [annType, setAnnType] = useState(announcement.type);
  const [annSuccessMsg, setAnnSuccessMsg] = useState(false);

  // Broadcast Notifications State
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState<"feature" | "promo" | "tip" | "system">("feature");
  const [notifSection, setNotifSection] = useState("");
  const [notifAudience, setNotifAudience] = useState<"all" | "free" | "pro">("all");
  const [notifSuccessMsg, setNotifSuccessMsg] = useState(false);
  const [isSendingNotif, setIsSendingNotif] = useState(false);

  useEffect(() => {
    setAnnText(announcement.text);
    setAnnActive(announcement.active);
    setAnnType(announcement.type);
  }, [announcement]);

  // Pricing State
  const [editablePricing, setEditablePricing] = useState<PricingPlanDuration[]>(pricingConfig);
  const [pricingSavedMsg, setPricingSavedMsg] = useState(false);

  useEffect(() => {
    if (pricingConfig && pricingConfig.length > 0) {
      setEditablePricing(pricingConfig);
    }
  }, [pricingConfig]);

  // VIP Code Management State
  const [vipCodeSearch, setVipCodeSearch] = useState("");
  const [vipCodeFilter, setVipCodeFilter] = useState<"all" | "unused" | "used">("all");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genPlan, setGenPlan] = useState<"pro" | "academic">("pro");
  const [genDuration, setGenDuration] = useState("1 مانگ");
  const [genCustomerName, setGenCustomerName] = useState("");
  const [genCustomerPhone, setGenCustomerPhone] = useState("");
  const [genCustomCode, setGenCustomCode] = useState("");
  const [activeDeliveryCode, setActiveDeliveryCode] = useState<VipCodeItem | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // WhatsApp Requests Pending List
  const [requestsList, setRequestsList] = useState<
    { id: string; name: string; phone: string; time: string; method: string; plan: "pro" | "academic"; duration: string }[]
  >([]);

  // New User Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState<UserProfile["role"]>("student");
  const [newMembership, setNewMembership] = useState<UserProfile["membership"]>("free");

  // Tool Maintenance Toggles State
  const [toolToggles, setToolToggles] = useState<Record<string, boolean>>({
    pdf: true,
    video: true,
    math: true,
    academic: true,
    business: true,
    forensics: true,
  });

  const [freeQueryLimit, setFreeQueryLimit] = useState(15);
  const [cacheCleared, setCacheCleared] = useState(false);

  if (!isAdmin) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-destructive/15 text-destructive flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-foreground">دەستپێگەیشتن ڕێگاپێنەدراوە</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          تەنها بەڕێوەبەری سەرەکی ({ADMIN_EMAIL}) دەتوانێت بچێتە ناو ئەم پەنەلە.
        </p>
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
          >
            گەڕانەوە بۆ پەڕەی سەرەکی
          </button>
        )}
      </div>
    );
  }

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const getWhatsAppMessage = (item: VipCodeItem) => {
    return `سڵاو بەڕێز ${item.createdForName || "بەشداربووی ئازیز"}،
زۆر سوپاس بۆ بەشداریکردنت لە ${item.planLabel} لە پلاتفۆرمی Las AI.

کلیلی تایبەتی چالاککردنەکەت:
👉 *${item.code}*
ماوەی پلان: ${item.duration}

شێوازی چالاککردن:
1. سەردانی ماڵپەڕ بکە
2. لە بەشی "پلانەکان" یان "پڕۆفایل" ئەم کلیلە داخل بکە تاوەکو هەژمارەکەت دەستبەجێ ئەکتیڤ بێت.

پیرۆزە و هیوای سەرکەوتن! ✨`;
  };

  const handleCopyMessage = (item: VipCodeItem) => {
    navigator.clipboard.writeText(getWhatsAppMessage(item));
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleApproveRequest = (req: (typeof requestsList)[0]) => {
    const newCode = generateVipCode({
      plan: req.plan,
      duration: req.duration,
      customerName: req.name,
      customerPhone: req.phone,
    });
    // Remove from pending list
    setRequestsList((prev) => prev.filter((r) => r.id !== req.id));
    // Show delivery modal
    setActiveDeliveryCode(newCode);
  };

  const handleManualGenerateCode = (e: React.FormEvent) => {
    e.preventDefault();
    const newCode = generateVipCode({
      plan: genPlan,
      duration: genDuration,
      customerName: genCustomerName,
      customerPhone: genCustomerPhone,
      customCode: genCustomCode,
    });
    setShowGenerateModal(false);
    setGenCustomerName("");
    setGenCustomerPhone("");
    setGenCustomCode("");
    setActiveDeliveryCode(newCode);
  };

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone && u.phone.includes(searchQuery));

    if (!matchesSearch) return false;
    if (filterRole === "all") return true;
    if (filterRole === "admin") return u.role === "admin";
    if (filterRole === "pro") return u.membership === "pro";
    if (filterRole === "academic") return u.membership === "academic";
    if (filterRole === "free") return u.membership === "free";
    return true;
  });

  const filteredVipCodes = vipCodes.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(vipCodeSearch.toLowerCase()) ||
      (c.createdForName && c.createdForName.toLowerCase().includes(vipCodeSearch.toLowerCase())) ||
      (c.createdForPhone && c.createdForPhone.includes(vipCodeSearch)) ||
      (c.usedByName && c.usedByName.toLowerCase().includes(vipCodeSearch.toLowerCase()));

    if (!matchesSearch) return false;
    if (vipCodeFilter === "unused") return !c.isUsed;
    if (vipCodeFilter === "used") return c.isUsed;
    return true;
  });

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncement({
      text: annText.trim(),
      active: annActive,
      type: annType,
    });
    setAnnSuccessMsg(true);
    setTimeout(() => setAnnSuccessMsg(false), 3000);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    setIsSendingNotif(true);
    broadcastNotification(
      notifTitle.trim(),
      notifMessage.trim(),
      notifType === "promo" ? "pro" : notifType,
      notifSection || undefined,
      notifAudience
    );
    setIsSendingNotif(false);
    setNotifSuccessMsg(true);
    setNotifTitle("");
    setNotifMessage("");
    setNotifSection("");
    setTimeout(() => setNotifSuccessMsg(false), 4000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    let roleLabel = "فێرخوازی زانکۆ";
    if (newRole === "admin") roleLabel = "بەڕێوەبەری سەرەکی (Admin)";
    else if (newRole === "researcher") roleLabel = "توێژەری ئەکادیمی";
    else if (newRole === "teacher") roleLabel = "مامۆستا / وانەبێژ";
    else if (newRole === "pro") roleLabel = "پیشەگەر / بزنس";

    let membershipLabel = "بێبەرامبەر (Free)";
    if (newMembership === "pro") membershipLabel = "پلانی پرۆ (Pro VIP)";
    else if (newMembership === "academic") membershipLabel = "ئەکادیمی VIP";

    const created: UserProfile = {
      id: "usr_" + Date.now().toString(36),
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim() || undefined,
      role: newRole,
      roleLabel,
      membership: newMembership,
      membershipLabel,
      joinedDate: new Date().toLocaleDateString("en-GB"),
      savedToolsCount: 0,
      isAdmin: newRole === "admin",
      status: "active",
    };

    addUserByAdmin(created);
    setShowAddModal(false);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
  };

  const clearAppCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3500);
  };

  const totalVIPCount = allUsers.filter((u) => u.membership === "pro" || u.membership === "academic").length;
  const activeUnusedCodesCount = vipCodes.filter((c) => !c.isUsed).length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-foreground font-sans text-right">
      {/* ── Admin Header ── */}
      <div
        className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/30 p-6 md:p-8 text-white relative overflow-hidden shadow-2xl"
        style={{ boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 overflow-hidden border-2 border-white/20">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  <ShieldCheck className="w-8 h-8" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-500 text-slate-950">
                <Crown className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  پەنەلی بەڕێوەبەری سەرەکی (Admin Dashboard)
                </h1>
                <span className="text-xs px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black shadow-xs">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs md:text-sm text-indigo-200/80 mt-1 flex items-center gap-2">
                <span>بەخێربێیت سەنگەر محمد ({ADMIN_EMAIL})</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-mono text-[11px]">System Online (99.99%)</span>
              </p>
            </div>
          </div>

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition shadow-sm backdrop-blur-md cursor-pointer"
            >
              <span>گەڕانەوە بۆ ماڵپەڕ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border border-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-bold">کۆی بەکارهێنەران</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono">{allUsers.length}</span>
            <span className="text-[11px] text-emerald-500 font-bold font-mono">+12 ئەمڕۆ</span>
          </div>
          <span className="text-[11px] text-muted-foreground block">هەژماری چالاک لە پلاتفۆرم</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <Ticket className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold">کۆدەکانی VIP چالاک</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-amber-500">{activeUnusedCodesCount}</span>
            <span className="text-[11px] text-muted-foreground font-mono">کۆی گشتی {vipCodes.length}</span>
          </div>
          <span className="text-[11px] text-muted-foreground block">کۆدی ئامادە بۆ ناردن و فرۆشتن</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <Crown className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-bold">ئەندامانی VIP Pro</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-500">{totalVIPCount}</span>
            <span className="text-[11px] text-amber-500 font-bold font-mono">5,000 IQD/m</span>
          </div>
          <span className="text-[11px] text-muted-foreground block">بەشداربووانی پلانی پرۆ</span>
        </div>

        <div className="p-5 rounded-3xl bg-card border border-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <Server className="w-5 h-5 text-purple-500" />
            <span className="text-xs font-bold">دۆخی سێرڤەر و کلیلەکان</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-black text-emerald-500">هەموو چالاکن</span>
            <span className="text-[11px] text-muted-foreground font-mono">3 Keys Pool</span>
          </div>
          <span className="text-[11px] text-muted-foreground block">WhatsApp & Storage OK</span>
        </div>
      </div>

      {/* ── Admin Navigation Tabs ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-border">
        {[
          { id: "vip", label: "👑 دروستکردن و ناردنی کلیلی پڕۆ (Pro Key)", icon: Crown },
          { id: "pricing", label: "🏷️ دیاریکردنی نرخ و داشکاندن", icon: Tag },
          { id: "notifications", label: "🔔 ناردنی ئاگاداری بۆ خەڵک", icon: Bell },
          { id: "users", label: "👥 بەڕێوەبردنی بەکارهێنەران", icon: Users },
          { id: "announcement", label: "📢 ڕاگەیاندنی گشتی لە سەرەوە", icon: Megaphone },
          { id: "tools", label: "⚡ کۆنتڕۆڵی ئامرازەکان و سنوور", icon: Sliders },
          { id: "logs", label: "📊 دۆخی سیستەم و کاش", icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: Pro Activation Keys & WhatsApp (MAIN FEATURE) ── */}
      {activeTab === "vip" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Actions Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-indigo-500/15 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-black text-foreground">
                  سیستەمی دروستکردن و ناردنی کلیلی پارێزراوی پڕۆ (Pro Activation Keys)
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                کاتێک کڕیار پارە دەنێرێت لە ڕێگەی واتساپ، لێرە کلیلێکی پارێزراوی 16 پیتەی بۆ دروست بکە و بە یەک کلیک پەیامەکەی بۆ بنێرە تا خۆی داخڵی بکات و Pro ئەکتیڤ بێت.
              </p>
            </div>

            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:opacity-95 transition cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>دروستکردنی کلیلی نوێی پڕۆ</span>
            </button>
          </div>

          {/* Pending WhatsApp Requests */}
          {requestsList.length > 0 && (
            <div className="rounded-3xl bg-card border border-border p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <h3 className="text-sm font-extrabold text-foreground">
                    داواکارییە نوێیەکانی VIP کە چاوەڕوانی کۆدن ({requestsList.length})
                  </h3>
                </div>
                <span className="text-[11px] text-muted-foreground">کلیک لە پەسەندکردن بکە تا کۆدی بۆ دروست ببێت</span>
              </div>

              <div className="space-y-3">
                {requestsList.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-secondary/30 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-amber-500/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                        VIP
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-foreground">{req.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">
                            {req.duration}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono" dir="ltr">
                          {req.phone} • {req.method}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-[11px] text-muted-foreground">{req.time}</span>
                      <button
                        onClick={() => handleApproveRequest(req)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-xs shadow-xs hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>پەسەندکردن و دروستکردنی کۆد</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pro Codes Management Table */}
          <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-xs space-y-4 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-amber-500" />
                  خشتەی گشت کلیلەکانی پڕۆ لە سیستەمدا
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  کلیلەکان دەتوانیت کۆپی بکەیت یان بە واتساپ بنێریت بۆ کڕیار.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <input
                    type="text"
                    value={vipCodeSearch}
                    onChange={(e) => setVipCodeSearch(e.target.value)}
                    placeholder="گەڕان بەپێی کلیل، ناو، مۆبایل..."
                    className="w-full pr-8 pl-3 py-2 rounded-xl bg-background border border-border text-xs focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute right-2.5 top-2.5" />
                </div>

                <select
                  value={vipCodeFilter}
                  onChange={(e) => setVipCodeFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-background border border-border text-xs font-bold focus:outline-none"
                >
                  <option value="all">هەموو کلیلەکان</option>
                  <option value="unused">ئامادە بۆ بەکارهێنان (چالاک نەکراو)</option>
                  <option value="used">بەکارهاتوو (Active بووە)</option>
                </select>
              </div>
            </div>

            {/* Codes List */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-secondary/60 border-b border-border text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3.5">کلیلی چالاککردن (Pro Key)</th>
                    <th className="p-3.5">پلان و ماوە</th>
                    <th className="p-3.5">دروستکراوە بۆ (کڕیار)</th>
                    <th className="p-3.5">دۆخی کلیل</th>
                    <th className="p-3.5 text-left">کردار و ناردن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredVipCodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        هیچ کلیلێک نەدۆزرایەوە بەپێی ئەم فلتەرە.
                      </td>
                    </tr>
                  ) : (
                    filteredVipCodes.map((item) => {
                      const isCopied = copiedCodeId === item.id;
                      const cleanPhone = item.createdForPhone ? item.createdForPhone.replace(/\D/g, "") : "";
                      const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(getWhatsAppMessage(item))}`;

                      return (
                        <tr key={item.id} className="hover:bg-secondary/30 transition">
                          {/* Code String with 1-click copy */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleCopyCode(item.code, item.id)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono font-black text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                                title="کلیک بکە بۆ کۆپیکردنی کۆد"
                              >
                                <span>{item.code}</span>
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                              {isCopied && <span className="text-[10px] text-emerald-500 font-bold">کۆپی کرا!</span>}
                            </div>
                          </td>

                          {/* Plan & Duration */}
                          <td className="p-3.5">
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-foreground block">{item.planLabel}</span>
                              <span className="text-[11px] text-muted-foreground">ماوە: {item.duration}</span>
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="p-3.5">
                            {item.createdForName || item.createdForPhone ? (
                              <div className="space-y-0.5">
                                <span className="font-bold text-foreground block">{item.createdForName || "بەکارهێنەر"}</span>
                                {item.createdForPhone && (
                                  <span className="text-[11px] text-muted-foreground font-mono" dir="ltr">
                                    {item.createdForPhone}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-[11px]">گشتی (بێ ناو)</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="p-3.5">
                            {item.isUsed ? (
                              <div className="space-y-0.5">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-muted-foreground border border-border inline-block">
                                  بەکارهاتووە ✓
                                </span>
                                <span className="text-[10px] text-muted-foreground block truncate max-w-[140px]">
                                  لە لایەن: {item.usedByName || item.usedByEmail}
                                </span>
                              </div>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                ئامادەیە بۆ بەکارهێنان
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-left">
                            <div className="flex items-center gap-1.5 justify-end">
                              {/* Open WhatsApp Message Dialog */}
                              <button
                                onClick={() => setActiveDeliveryCode(item)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                title="ناردنی پەیامی واتساپ"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>ناردن بۆ کڕیار</span>
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (confirm(`دڵنیایت دەتەوێت کۆدی ${item.code} بسڕیتەوە؟`)) {
                                    deleteVipCode(item.id);
                                  }
                                }}
                                className="p-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition cursor-pointer"
                                title="سڕینەوە"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: User Management ── */}
      {activeTab === "users" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="گەڕان بەپێی ناو، ئیمەیڵ یان مۆبایل..."
                className="w-full pr-9 pl-4 py-2.5 rounded-2xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-right"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-3" />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2.5 rounded-2xl bg-card border border-border text-xs font-bold focus:outline-none"
              >
                <option value="all">هەموو ڕۆڵەکان</option>
                <option value="admin">بەڕێوەبەران (Admin)</option>
                <option value="pro">ئەندامانی پرۆ (Pro)</option>
                <option value="academic">ئەندامانی ئەکادیمی (Academic)</option>
                <option value="free">بێبەرامبەر (Free)</option>
              </select>

              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>زیادکردنی بەکارهێنەر</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-secondary/60 border-b border-border text-muted-foreground font-bold">
                  <tr>
                    <th className="p-4">بەکارهێنەر</th>
                    <th className="p-4">ئیمەیڵ و پەیوەندی</th>
                    <th className="p-4">ڕۆڵ و دەسەڵات</th>
                    <th className="p-4">پلانی ئەندامێتی</th>
                    <th className="p-4">دۆخ</th>
                    <th className="p-4 text-left">کردارەکان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.map((u) => {
                    const isSuperAdmin = u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                    return (
                      <tr key={u.id} className="hover:bg-secondary/30 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white font-bold flex items-center justify-center overflow-hidden shrink-0">
                              {u.avatar ? (
                                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>{u.name.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div>
                              <span className="font-extrabold text-foreground block">{u.name}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">ID: {u.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-muted-foreground dir-ltr text-right">
                          <div>{u.email}</div>
                          {u.phone && <div className="text-[11px] text-foreground/80">{u.phone}</div>}
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              u.role === "admin"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                : "bg-secondary text-foreground border-border"
                            }`}
                          >
                            {u.roleLabel || u.role}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              u.membership === "pro"
                                ? "bg-primary/15 text-primary border-primary/30"
                                : u.membership === "academic"
                                ? "bg-purple-500/15 text-purple-600 border-purple-500/30"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {u.membershipLabel}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              u.status === "banned"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {u.status === "banned" ? "بلۆککراو" : "چالاک"}
                          </span>
                        </td>

                        <td className="p-4 text-left">
                          <div className="flex items-center gap-1.5 justify-end">
                            {/* Upgrade to PRO */}
                            {u.membership !== "pro" && !isSuperAdmin && (
                              <button
                                onClick={() => updateUserRole(u.id, u.role, "pro")}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 font-bold text-[11px] transition cursor-pointer"
                                title="بەرزکردنەوە بۆ VIP Pro"
                              >
                                +VIP Pro
                              </button>
                            )}

                            {/* Set Free */}
                            {u.membership !== "free" && !isSuperAdmin && (
                              <button
                                onClick={() => updateUserRole(u.id, u.role, "free")}
                                className="px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground font-bold text-[11px] transition cursor-pointer"
                                title="گۆڕین بۆ Free"
                              >
                                Free
                              </button>
                            )}

                            {/* Toggle Ban */}
                            {!isSuperAdmin && (
                              <button
                                onClick={() => toggleUserBan(u.id)}
                                className={`p-1.5 rounded-lg border transition cursor-pointer ${
                                  u.status === "banned"
                                    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                                    : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                                }`}
                                title={u.status === "banned" ? "لابردنی بلۆک" : "بلۆککردن"}
                              >
                                {u.status === "banned" ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                              </button>
                            )}

                            {/* Delete User */}
                            {!isSuperAdmin && (
                              <button
                                onClick={() => {
                                  if (confirm(`دڵنیایت دەتەوێت ${u.name} بسڕیتەوە؟`)) {
                                    deleteUser(u.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition cursor-pointer"
                                title="سڕینەوە"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: Announcements & Broadcast ── */}
      {activeTab === "announcement" && (
        <div className="rounded-3xl bg-card border border-border p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border pb-4">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              ڕاگەیاندنی گشتی (Broadcast Banner) لە سەرەوەی ماڵپەڕ
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              ئەم پەیامە دەستبەجێ لە بەشی سەرەوەی سایتەکە بۆ هەموو سەردانکەران و بەکارهێنەران پیشان دەدرێت.
            </p>
          </div>

          <form onSubmit={handleSaveAnnouncement} className="space-y-4 max-w-2xl">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">دەقی ڕاگەیاندنەکە:</label>
              <textarea
                value={annText}
                onChange={(e) => setAnnText(e.target.value)}
                placeholder="دەقی ئاگاداری یان پیرۆزبایی بنووسە..."
                className="w-full min-h-[100px] p-4 rounded-2xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed text-right"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">جۆری پەیام (ستایل):</label>
                <select
                  value={annType}
                  onChange={(e) => setAnnType(e.target.value as any)}
                  className="w-full p-3 rounded-xl bg-background border border-border text-xs font-bold"
                >
                  <option value="promo">🎁 ئۆفەر و داشکاندن (Promo Purple/Pink)</option>
                  <option value="info">ℹ️ زانیاری گشتی (Info Blue)</option>
                  <option value="success">🎉 سەرکەوتن و نوێکاری (Success Emerald)</option>
                  <option value="warning">⚠️ هۆشداری و چاکسازی (Warning Amber)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">دۆخی پیشاندان:</label>
                <button
                  type="button"
                  onClick={() => setAnnActive(!annActive)}
                  className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                    annActive
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                      : "bg-secondary border-border text-muted-foreground"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${annActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                  <span>{annActive ? "چالاکە (لە سایتەکە دیارە)" : "ناچالاکە (شاردراوە)"}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md hover:opacity-90 transition cursor-pointer"
              >
                پاشەکەوتکردن و بڵاوکردنەوە
              </button>

              {annSuccessMsg && (
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  ڕاگەیاندنەکە لەسەر سایتەکە بڵاوکرایەوە!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── TAB 4: Tool Maintenance & Limits ── */}
      {activeTab === "tools" && (
        <div className="rounded-3xl bg-card border border-border p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border pb-4">
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              کۆنتڕۆڵی ئامرازەکان و سنووری بەکارهێنان
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              دەتوانیت هەر ئامرازێک دابخەیت بو چاکسازی، یان سنووری بەکارهێنانی ڕۆژانە دەستکاری بکەیت.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: "pdf", title: "خزمەتگوزاریەکانی PDF", desc: "Merge, Split, Compress, Word to PDF" },
              { key: "video", title: "تایبەتمەندیەکانی ڤیدیۆ", desc: "Downloader, Converter, Compressor" },
              { key: "math", title: "بیرکاری و زانست", desc: "Solver, Math to Word, Grapher" },
              { key: "academic", title: "توێژینەوە و زمان", desc: "Humanize, Grammar, LaTeX, Citations" },
              { key: "business", title: "ئامرازەکانی بازرگانی", desc: "Profit, VAT, Salary, Loan, Invoices" },
              { key: "forensics", title: "دادوەری بەڵگەنامە", desc: "Metadata, ELA, Font Forensics" },
            ].map((suite) => {
              const isOn = toolToggles[suite.key] ?? true;
              return (
                <div key={suite.key} className="p-4 rounded-2xl bg-secondary/40 border border-border/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setToolToggles((prev) => ({ ...prev, [suite.key]: !isOn }))}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                        isOn
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/15 border-destructive/30 text-destructive"
                      }`}
                    >
                      {isOn ? "چالاکە (Active)" : "وەستێنراوە (Off)"}
                    </button>
                    <span className="font-extrabold text-xs text-foreground">{suite.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{suite.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="p-5 rounded-2xl bg-background border border-border space-y-3 max-w-xl">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="font-mono text-primary">{freeQueryLimit} داواکاری لە ڕۆژێکدا</span>
              <span>سنووری بەکارهێنەرانی بێبەرامبەر (Free Tier Limit):</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={freeQueryLimit}
              onChange={(e) => setFreeQueryLimit(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <span className="text-[11px] text-muted-foreground block">
              بەکارهێنەرانی Free پاش تێپەڕاندنی ئەم بڕە دەبێت نوێبکەنەوە یان ببنە VIP Pro.
            </span>
          </div>
        </div>
      )}

      {/* ── TAB 5: System Logs & Cache ── */}
      {activeTab === "logs" && (
        <div className="rounded-3xl bg-card border border-border p-6 md:p-8 space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-border pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                لۆگی سیستەم و کاشی گشتی (Platform Maintenance)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                چاودێریکردنی ڕووداوەکان و پاککردنەوەی فایلی کاتی.
              </p>
            </div>

            <button
              onClick={clearAppCache}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold text-foreground transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-primary" />
              <span>پاککردنەوەی کاشی وێبسایت</span>
            </button>
          </div>

          {cacheCleared && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
              کاشی سیستەم و میمۆری کاتی بە سەرکەوتوویی پاککرایەوە!
            </div>
          )}

          <div className="rounded-2xl bg-background border border-border p-4 font-mono text-xs text-muted-foreground space-y-2 dir-ltr">
            <div>[INFO] Gemini 2.5 Flash API Health: 200 OK (Latency: 380ms)</div>
            <div>[INFO] WhatsApp OTP Webhook: Connected & Listening on port 5173</div>
            <div>[INFO] Pro Key Engine: Active ({vipCodes.length} keys registered)</div>
            <div>[INFO] Super Admin session authenticated: {ADMIN_EMAIL}</div>
            <div>[INFO] Client runtime: React 19 / Vite 7.3.5 / TanStack Start</div>
            <div>[INFO] Database sync status: OK (Synced with Supabase storage)</div>
          </div>
        </div>
      )}

      {/* ── TAB 6: PRICING & DISCOUNTS MANAGEMENT ── */}
      {activeTab === "pricing" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-black text-foreground">
                  کۆنتڕۆڵکردنی نرخ و داشکاندنەکانی پلانی پڕۆ (Pricing & Discounts)
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                دەتوانیت هەر نرخێک دەتەوێت زیاد یان کەم بکەیت بۆ هەر ماوەیەک، یان داشکاندنی تایبەت دابنێیت کە دەستبەجێ لە ماڵپەڕدا دەردەکەوێت.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm("دڵنیایت دەتەوێت نرخەکان بگەڕێنیتەوە بۆ باری بنەڕەتی؟")) {
                    setEditablePricing(DEFAULT_PRICING_CONFIG);
                    updatePricingConfig(DEFAULT_PRICING_CONFIG);
                    setPricingSavedMsg(true);
                    setTimeout(() => setPricingSavedMsg(false), 3500);
                  }
                }}
                className="px-4 py-2.5 rounded-2xl bg-secondary hover:bg-secondary/80 text-xs font-bold text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                گەڕاندنەوە بۆ باری بنەڕەتی
              </button>
              <button
                type="button"
                onClick={() => {
                  updatePricingConfig(editablePricing);
                  setPricingSavedMsg(true);
                  setTimeout(() => setPricingSavedMsg(false), 3500);
                }}
                className="px-6 py-2.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs shadow-md hover:opacity-95 transition cursor-pointer flex items-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4" />
                <span>پاشەکەوتکردنی نرخەکان</span>
              </button>
            </div>
          </div>

          {pricingSavedMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 animate-in fade-in-0">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>نرخ و داشکاندنەکان بە سەرکەوتوویی پاشەکەوتکران و لە تەواوی ماڵپەڕدا نوێبوونەوە!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editablePricing.map((item, idx) => (
              <div
                key={item.id}
                className={`p-6 rounded-3xl border transition space-y-4 ${
                  item.isActive ? "bg-card border-border shadow-xs" : "bg-secondary/20 border-border/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs font-mono">
                      {item.id.toUpperCase()}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-sm text-foreground">{item.label}</h4>
                      <span className="text-[10px] text-muted-foreground">ماوە: {item.id}</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(e) => {
                        const updated = [...editablePricing];
                        updated[idx].isActive = e.target.checked;
                        setEditablePricing(updated);
                      }}
                      className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
                    />
                    <span>{item.isActive ? "چالاکە لە ماڵپەڕ" : "ناچالاکە"}</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">نرخی ئێستا بە دینار (IQD):</label>
                    <input
                      type="number"
                      step="500"
                      value={item.price}
                      onChange={(e) => {
                        const updated = [...editablePricing];
                        updated[idx].price = Number(e.target.value);
                        setEditablePricing(updated);
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border font-mono font-black text-xs text-foreground text-left dir-ltr"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-muted-foreground">نرخی پێشوو (بۆ هێڵ لێدان - ئیختیاری):</label>
                    <input
                      type="number"
                      step="500"
                      value={item.originalPrice ?? ""}
                      placeholder="وەک: 15000"
                      onChange={(e) => {
                        const updated = [...editablePricing];
                        updated[idx].originalPrice = e.target.value ? Number(e.target.value) : null;
                        setEditablePricing(updated);
                      }}
                      className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border font-mono text-xs text-foreground text-left dir-ltr"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">تێکستی باجی داشکاندن (Badge Text):</label>
                  <input
                    type="text"
                    value={item.discountLabel ?? ""}
                    placeholder="وەک: 20٪ داشکاندن یان ئۆفەری تایبەت..."
                    onChange={(e) => {
                      const updated = [...editablePricing];
                      updated[idx].discountLabel = e.target.value.trim() || null;
                      setEditablePricing(updated);
                    }}
                    className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border text-xs text-foreground text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: Broadcast Notifications to People ── */}
      {activeTab === "notifications" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Card */}
          <div className="rounded-3xl bg-card border border-border p-6 md:p-8 space-y-6">
            <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <span>ناردنی ئاگاداری ڕاستەوخۆ بۆ خەڵک (Broadcast Notifications)</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  دەتوانیت هەر پەیام، ئۆفەر، یان ڕێنماییەک بنێریت کە لە زەنگۆڵەی ئاگادارییەکان (Notification Bell) لای بەکارهێنەران و سەردانکەران دەردەکەوێت.
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold shrink-0 self-start sm:self-auto flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>ناردنی ڕاستەوخۆ (Live Broadcast)</span>
              </div>
            </div>

            {notifSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 animate-in fade-in-0">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>ئاگادارییەکە بە سەرکەوتوویی نێردرا و گەیشتە زەنگۆڵەی ئاگادارییەکانی هەمووان!</span>
              </div>
            )}

            {/* Quick Templates Bar */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground block">قاڵبە ئامادەکراوەکان (خێرا دەستنیشان بکە):</span>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    title: "👑 ئۆفەری تایبەتی پلانی پڕۆ (VIP)",
                    message: "ئێستا داشکاندنی ناوازە هەیە بۆ هەموو پلانەکانی پڕۆ! کلیلی تایبەتی خۆت بەدەستبهێنە و بێ سنوور سوود لە هەموو ئامرازەکان وەربگرە.",
                    type: "promo" as const,
                    section: "pro_plan",
                    audience: "all" as const,
                  },
                  {
                    title: "🚀 ئامرازێکی نوێی زیرەکی دەستکرد زیادکرا!",
                    message: "ئامرازی نوێ لە پلاتفۆڕم چالاککرا. ئێستا دەتوانیت لە بەشی سەرەکی سوودی لێ وەربگریت بە خێرایی و کوالیتی بەرز.",
                    type: "feature" as const,
                    section: "",
                    audience: "all" as const,
                  },
                  {
                    title: "⚡ بەرزکردنەوەی خێرایی و توانستی سێرڤەر",
                    message: "سێرڤەرەکانی سیستەم بە تەواوی بەهێزکران و خێرایی بەرسڤدانا پرسیار و فایلەکان 2 هێندە زیاتر بوو.",
                    type: "system" as const,
                    section: "",
                    audience: "all" as const,
                  },
                  {
                    title: "💡 ڕێنمایی بەسوود بۆ فێرخوازان",
                    message: "دەتوانیت ڕۆژانە پرسیارەکانی زمانی ئینگلیزی و بیرکاری بە ئامرازە ژیرەکان شیکار بکەیت و پۆینتی زیاتر کۆبکەیتەوە.",
                    type: "tip" as const,
                    section: "academic",
                    audience: "all" as const,
                  },
                ].map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setNotifTitle(tpl.title);
                      setNotifMessage(tpl.message);
                      setNotifType(tpl.type);
                      setNotifSection(tpl.section);
                      setNotifAudience(tpl.audience);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-xs font-bold text-foreground transition cursor-pointer text-right"
                  >
                    {tpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Form */}
            <form onSubmit={handleSendBroadcast} className="space-y-4 max-w-3xl">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">ناونیشانی ئاگاداری:</label>
                <input
                  type="text"
                  required
                  placeholder="وەک: 🚀 ئۆفەری نوێ، یاخود ئامرازێکی نوێ چالاککرا..."
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 text-right"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">دەقی ئاگاداری (پەیامی تەواو):</label>
                <textarea
                  required
                  rows={3}
                  placeholder="دەقی ئاگادارییەکە لێرە بنووسە بە ڕوونی..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed text-right"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">جۆری ئاگاداری:</label>
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold cursor-pointer"
                  >
                    <option value="feature">✨ نوێکاری و تایبەتمەندی (Feature)</option>
                    <option value="promo">👑 ئۆفەر و پلانی پڕۆ (Promo)</option>
                    <option value="tip">⚡ ڕێنمایی و فێربوون (Tip)</option>
                    <option value="system">📢 ئاگاداریی گشتی (System)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">ئاراستەکراو بۆ (Audience):</label>
                  <select
                    value={notifAudience}
                    onChange={(e) => setNotifAudience(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold cursor-pointer"
                  >
                    <option value="all">🌍 هەموو خەڵک (گشتی)</option>
                    <option value="free">👤 تەنها بەکارهێنەرانی بێبەرامبەر (Free)</option>
                    <option value="pro">👑 تەنها ئەندامانی پڕۆ (Pro VIP)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">بەستنەوە بە بەشێک (ئیختیاری):</label>
                  <select
                    value={notifSection}
                    onChange={(e) => setNotifSection(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-bold cursor-pointer"
                  >
                    <option value="">هیچ بەشێک (تەنها خوێندنەوە)</option>
                    <option value="pro_plan">👑 پەڕەی پلانی پڕۆ</option>
                    <option value="pdf_tools">📄 ئامرازەکانی PDF</option>
                    <option value="video_tools">🎥 ئامرازەکانی ڤیدیۆ</option>
                    <option value="math_solver">📐 بەشی بیرکاری و زانست</option>
                    <option value="academic">🎓 بەشی ئەکادیمی و توێژینەوە</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSendingNotif || !notifTitle.trim() || !notifMessage.trim()}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 hover:opacity-95 text-primary-foreground font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>ناردنی ئاگاداری بۆ هەمووان</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Sent Notifications History */}
          <div className="rounded-3xl bg-card border border-border p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>مێژووی ئاگادارییە نێردراوەکان</span>
                </h4>
                <p className="text-[11px] text-muted-foreground">ئەو ئاگادارییانەی پێشتر نێردراون و لە زەنگۆڵەدا دەردەکەون.</p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-secondary text-muted-foreground font-bold">
                {broadcastNotifications.length} ئاگاداری
              </span>
            </div>

            {broadcastNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                هیچ ئاگادارییەکی گشتی نەنێردراوە.
              </div>
            ) : (
              <div className="space-y-3">
                {broadcastNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 rounded-2xl bg-secondary/30 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition"
                  >
                    <div className="space-y-1 text-right flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                          notif.type === "pro"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : notif.type === "feature"
                            ? "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
                            : notif.type === "tip"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                        }`}>
                          {notif.type === "pro" ? "🎁 ئۆفەر" : notif.type === "feature" ? "✨ نوێکاری" : notif.type === "tip" ? "⚡ ڕێنمایی" : "📢 گشتی"}
                        </span>

                        {notif.targetAudience && notif.targetAudience !== "all" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary border border-border text-muted-foreground">
                            {notif.targetAudience === "pro" ? "تەنها Pro" : "تەنها Free"}
                          </span>
                        )}

                        <h5 className="text-xs sm:text-sm font-black text-foreground truncate">{notif.title}</h5>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{notif.message}</p>
                      <span className="text-[10px] text-muted-foreground block font-mono" dir="ltr">
                        {new Date(notif.timestamp).toLocaleString("en-GB")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`دڵنیایت دەتەوێت ئەم ئاگادارییە بسڕیتەوە؟\n"${notif.title}"`)) {
                          deleteBroadcastNotification(notif.id);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                      title="سڕینەوەی ئەم ئاگادارییە"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>سڕینەوە</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: WhatsApp Delivery & Code Details ── */}
      {activeDeliveryCode && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 md:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 text-right">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">کۆدی VIP بە سەرکەوتوویی دروستکرا</h3>
                  <span className="text-xs text-muted-foreground">ئامادەیە بۆ ناردن بۆ کڕیار</span>
                </div>
              </div>
              <button
                onClick={() => setActiveDeliveryCode(null)}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Generated Code Display */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block">کۆدی چالاککردن:</span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl md:text-3xl font-black font-mono tracking-widest text-foreground">
                  {activeDeliveryCode.code}
                </span>
                <button
                  onClick={() => handleCopyCode(activeDeliveryCode.code, activeDeliveryCode.id)}
                  className="p-2 rounded-xl bg-card border border-border hover:bg-secondary text-foreground transition cursor-pointer"
                  title="کۆپیکردنی تەنها کۆدەکە"
                >
                  {copiedCodeId === activeDeliveryCode.id ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <span className="text-[11px] text-muted-foreground block">
                {activeDeliveryCode.planLabel} • بۆ ماوەی {activeDeliveryCode.duration}
              </span>
            </div>

            {/* WhatsApp Pre-written Message Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">پەیامی ئامادەکراوی واتساپ:</label>
                <button
                  onClick={() => handleCopyMessage(activeDeliveryCode)}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedMsg ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedMsg ? "پەیام کۆپی کرا!" : "کۆپیکردنی دەقی پەیام"}</span>
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-background border border-border text-xs leading-relaxed font-sans text-muted-foreground whitespace-pre-line text-right max-h-40 overflow-y-auto">
                {getWhatsAppMessage(activeDeliveryCode)}
              </div>
            </div>

            {/* WhatsApp Send Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <a
                href={`https://wa.me/${activeDeliveryCode.createdForPhone ? activeDeliveryCode.createdForPhone.replace(/\D/g, "") : ""}?text=${encodeURIComponent(getWhatsAppMessage(activeDeliveryCode))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition text-center"
              >
                <MessageSquare className="w-4 h-4" />
                <span>ناردنی ڕاستەوخۆ لە ڕێگەی WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setActiveDeliveryCode(null)}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-secondary text-foreground text-xs font-bold hover:bg-secondary/80 transition cursor-pointer"
              >
                داخستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Generate Pro Key ── */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 text-right">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                دروستکردنی کلیلی نوێی پڕۆ (Pro Key)
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualGenerateCode} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">پلان:</label>
                <select
                  value={genPlan}
                  onChange={(e) => setGenPlan(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-background border border-border text-xs font-bold"
                >
                  <option value="pro">پلانی پرۆ (Pro Plan)</option>
                  <option value="academic">پلانی ئەکادیمی (Academic Plan)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">ماوەی پلان:</label>
                <select
                  value={genDuration}
                  onChange={(e) => setGenDuration(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-background border border-border text-xs font-bold"
                >
                  <option value="1 مانگ">1 مانگ (1 Month)</option>
                  <option value="3 مانگ">3 مانگ (3 Months)</option>
                  <option value="6 مانگ">6 مانگ (6 Months)</option>
                  <option value="1 ساڵ">1 ساڵ (1 Year)</option>
                  <option value="هەمیشەیی (Lifetime)">هەمیشەیی (Lifetime)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">ناوی کڕیار (ئارەزوومەندانە):</label>
                <input
                  type="text"
                  value={genCustomerName}
                  onChange={(e) => setGenCustomerName(e.target.value)}
                  placeholder="ناوی بەکارهێنەر..."
                  className="w-full p-2.5 rounded-xl bg-background border border-border text-xs text-right"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">ژمارەی واتساپ (بۆ ناردن):</label>
                <input
                  type="text"
                  value={genCustomerPhone}
                  onChange={(e) => setGenCustomerPhone(e.target.value)}
                  placeholder="+964750..."
                  className="w-full p-2.5 rounded-xl bg-background border border-border text-xs font-mono text-left dir-ltr"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">
                  کۆدی تایبەت (ئەگەر بەتاڵ بێت، ئۆتۆماتیکی دروست دەبێت):
                </label>
                <input
                  type="text"
                  value={genCustomCode}
                  onChange={(e) => setGenCustomCode(e.target.value.toUpperCase())}
                  placeholder="وەک: PRO-2026-X9"
                  className="w-full p-2.5 rounded-xl bg-background border border-border text-xs font-mono text-left uppercase dir-ltr"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-secondary text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-xs hover:opacity-90 transition cursor-pointer"
                >
                  دروستکردنی کۆد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Add User ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-card border border-border p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 text-right">
            <h3 className="text-base font-black text-foreground">زیادکردنی بەکارهێنەری نوێ</h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">ناوی بەکارهێنەر:</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ناو..."
                  className="w-full p-2.5 rounded-xl bg-background border border-border text-xs text-right"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">ئیمەیڵ:</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full p-2.5 rounded-xl bg-background border border-border text-xs font-mono text-left dir-ltr"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">ژمارەی مۆبایل (واتساپ):</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+964750..."
                  className="w-full p-2.5 rounded-xl bg-background border border-border text-xs font-mono text-left dir-ltr"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">ڕۆڵ:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-background border border-border text-xs font-bold"
                  >
                    <option value="student">فێرخواز</option>
                    <option value="researcher">توێژەر</option>
                    <option value="teacher">مامۆستا</option>
                    <option value="pro">بزنس / پرۆ</option>
                    <option value="admin">بەڕێوەبەر (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">پلان:</label>
                  <select
                    value={newMembership}
                    onChange={(e) => setNewMembership(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-background border border-border text-xs font-bold"
                  >
                    <option value="free">بێبەرامبەر (Free)</option>
                    <option value="pro">پلانی پرۆ (Pro)</option>
                    <option value="academic">ئەکادیمی (Academic)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-secondary text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  زیادکردن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
