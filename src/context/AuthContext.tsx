import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "admin" | "student" | "researcher" | "teacher" | "pro";
  roleLabel: string;
  membership: "free" | "pro" | "academic";
  membershipLabel: string;
  joinedDate: string;
  savedToolsCount: number;
  isGuest?: boolean;
  isAdmin?: boolean;
  status?: "active" | "banned";
}

export interface VipCodeItem {
  id: string;
  code: string;
  plan: "pro" | "academic";
  planLabel: string;
  duration: string;
  createdAt: string;
  createdForName?: string;
  createdForPhone?: string;
  isUsed: boolean;
  usedByEmail?: string;
  usedByName?: string;
  usedAt?: string;
}

export interface PlatformAnnouncement {
  text: string;
  active: boolean;
  type: "info" | "warning" | "success" | "promo";
}

export interface PricingPlanDuration {
  id: "1m" | "3m" | "6m" | "1y";
  label: string;
  price: number;
  originalPrice?: number | null;
  discountLabel?: string | null;
  isActive: boolean;
}

export const DEFAULT_PRICING_CONFIG: PricingPlanDuration[] = [
  { id: "1m", label: "1 هەیڤ", price: 5000, originalPrice: null, discountLabel: null, isActive: true },
  { id: "3m", label: "3 هەیڤ", price: 12000, originalPrice: 15000, discountLabel: "20% داشکاندن", isActive: true },
  { id: "6m", label: "6 هەیڤ", price: 22000, originalPrice: 30000, discountLabel: "25% داشکاندن", isActive: true },
  { id: "1y", label: "1 ساڵ", price: 40000, originalPrice: 60000, discountLabel: "35% باشترین داشکاندن", isActive: true },
];

export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  maxLimit: number;
  resetsAt: string;
  isPro: boolean;
  count?: number;
  message?: string;
}

export const FREE_DAILY_CREDITS = 10;
export const REFERRAL_BONUS_CREDITS = 25;  // credits given per successful referral

// Referral bonus storage key (separate from daily quota — persistent, not reset daily)
const REFERRAL_CREDITS_STORAGE_KEY = "ai_pukhtana_referral_credits_v1";
// Stores list of user IDs (phones/emails) that already used this user's referral code
const REFERRAL_USED_BY_STORAGE_KEY = "ai_pukhtana_referral_used_by_v1";

// Tools that are always unlimited (no credit cost) for free users
export const UNLIMITED_FREE_TOOLS = new Set([
  "planner",
  "chat",
  "summary",
  "audio_sum",
  "tts",
  "glossary",
  "grapher",
  "solver",
  "daily_briefing",
]);

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPro: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalView: "login" | "register" | "forgot" | "profile";
  isProModalOpen: boolean;
  proModalToolTitle: string | null;
  quotaVersion: number;
  dailyCredits: number;
  maxDailyCredits: number;
  bonusCredits: number;
  announcement: PlatformAnnouncement;
  allUsers: UserProfile[];
  vipCodes: VipCodeItem[];
  pricingConfig: PricingPlanDuration[];
  updatePricingConfig: (config: PricingPlanDuration[]) => void;
  getToolQuotaStatus: (toolId: string) => QuotaCheckResult;
  consumeToolQuota: (toolId: string, toolTitle?: string) => QuotaCheckResult;
  getUploadQuotaStatus: () => QuotaCheckResult;
  consumeUploadQuota: () => QuotaCheckResult;
  openProModal: (toolTitle?: string) => void;
  closeProModal: () => void;
  openAuthModal: (view?: "login" | "register" | "forgot" | "profile") => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone?: string; password?: string; role?: string }) => Promise<{ success: boolean; error?: string }>;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  loginWithPhoneOtp: (phone: string, code: string, name?: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  isLogoutConfirmOpen: boolean;
  requestLogout: () => void;
  cancelLogout: () => void;
  confirmLogout: () => void;
  logout: () => void;
  loginAsGuest: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  setAnnouncement: (ann: PlatformAnnouncement) => void;
  updateUserRole: (userId: string, role: UserProfile["role"], membership: UserProfile["membership"]) => void;
  toggleUserBan: (userId: string) => void;
  deleteUser: (userId: string) => void;
  addUserByAdmin: (user: UserProfile) => void;
  generateVipCode: (options: {
    plan?: "pro" | "academic";
    duration?: string;
    customerName?: string;
    customerPhone?: string;
    customCode?: string;
  }) => VipCodeItem;
  redeemVipCode: (code: string) => { success: boolean; message: string; plan?: string };
  deleteVipCode: (codeId: string) => void;
  // Referral / Invite friends
  getMyReferralCode: () => string;
  useReferralCode: (code: string) => { success: boolean; message: string };
  getReferralUsedBy: () => string[];
  hasRedeemedReferral: boolean;
  addBonusCredits: (amount: number) => void;
  // Notifications System
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  logAdminNotification: (title: string, message: string, type?: NotificationItem["type"]) => void;
  broadcastNotifications: NotificationItem[];
  broadcastNotification: (
    title: string,
    message: string,
    type?: NotificationItem["type"],
    actionSection?: string,
    targetAudience?: "all" | "free" | "pro"
  ) => void;
  deleteBroadcastNotification: (id: string) => void;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  read: boolean;
  type: "system" | "pro" | "feature" | "tip";
  actionLabel?: string;
  actionSection?: string;
  targetAudience?: "all" | "free" | "pro";
}

const STORAGE_KEY = "ai_pukhtana_auth_user";
const USERS_LIST_STORAGE_KEY = "ai_pukhtana_admin_users";
const ANNOUNCEMENT_STORAGE_KEY = "ai_pukhtana_announcement";
const VIP_CODES_STORAGE_KEY = "ai_pukhtana_vip_codes";
const PRICING_CONFIG_STORAGE_KEY = "ai_pukhtana_pricing_config";
// v3: switched to unified daily credit pool (10 credits/day for free users)
const DAILY_CREDITS_STORAGE_KEY = "ai_pukhtana_daily_credits_v3";

const ADMIN_NOTIFICATIONS_STORAGE_KEY = "las_ai_admin_notifications_v3";
const USER_NOTIFICATIONS_STORAGE_KEY_PREFIX = "las_ai_user_notifications_v3_";
const BROADCAST_NOTIFICATIONS_STORAGE_KEY = "las_ai_broadcast_notifications_v3";

// Clean up all legacy sample/hardcoded notifications
try {
  if (typeof window !== "undefined") {
    localStorage.removeItem("las_ai_notifications_v1");
    localStorage.removeItem("las_ai_notifications_v2");
    localStorage.removeItem("las_ai_notifications_v3_badini");
    localStorage.removeItem("las_ai_notifications_v4_badini");
    localStorage.removeItem("las_ai_notifications");
    localStorage.removeItem("ai_pukhtana_notifications");
  }
} catch {}

export const ADMIN_EMAIL = "sangarduhok@gmail.com";

const initialSampleVipCodes: VipCodeItem[] = [];

const adminProfile: UserProfile = {
  id: "usr_admin_sangar",
  name: "سەنگەر محمد (بەڕێوەبەر)",
  email: ADMIN_EMAIL,
  phone: "+9647501435868",
  avatar: "/sangar.jpg",
  role: "admin",
  roleLabel: "بەڕێوەبەری سەرەکی (Admin)",
  membership: "pro",
  membershipLabel: "دەسەڵاتی تەواو (Super Admin)",
  joinedDate: "2023/09/01",
  savedToolsCount: 48,
  isAdmin: true,
  status: "active",
};

const initialSampleUsers: UserProfile[] = [
  adminProfile,
  {
    id: "usr_2",
    name: "ئاراس کەریم",
    email: "aras.karim@student.uod.ac",
    phone: "+9647509876543",
    role: "student",
    roleLabel: "فێرخوازی زانکۆ",
    membership: "pro",
    membershipLabel: "پلانی پرۆ (Pro)",
    joinedDate: "2024/02/10",
    savedToolsCount: 14,
    isAdmin: false,
    status: "active",
  },
  {
    id: "usr_3",
    name: "د. هێمن ئەحمەد",
    email: "dr.hemin@univ.edu.krd",
    phone: "+9647701234567",
    role: "researcher",
    roleLabel: "توێژەری ئەکادیمی",
    membership: "academic",
    membershipLabel: "پلانی ئەکادیمی (Academic)",
    joinedDate: "2024/01/05",
    savedToolsCount: 29,
    isAdmin: false,
    status: "active",
  },
  {
    id: "usr_4",
    name: "سۆما عەلی",
    email: "soma.ali99@gmail.com",
    phone: "+9647504445566",
    role: "student",
    roleLabel: "فێرخواز",
    membership: "free",
    membershipLabel: "بێبەرامبەر (Free)",
    joinedDate: "2024/03/18",
    savedToolsCount: 5,
    isAdmin: false,
    status: "active",
  },
];

const defaultProfiles: Record<string, UserProfile> = {
  admin: adminProfile,
  guest: {
    id: "usr_guest_" + Math.random().toString(36).substring(7),
    name: "فێرخوازی میوان",
    email: "guest@las-ai.edu",
    role: "student",
    roleLabel: "فێرخواز",
    membership: "free",
    membershipLabel: "بێبەرامبەر (Free)",
    joinedDate: new Date().toLocaleDateString("en-GB"),
    savedToolsCount: 3,
    isGuest: true,
    isAdmin: false,
    status: "active",
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(initialSampleUsers);
  const [vipCodes, setVipCodes] = useState<VipCodeItem[]>(initialSampleVipCodes);
  const [pricingConfig, setPricingConfig] = useState<PricingPlanDuration[]>(DEFAULT_PRICING_CONFIG);
  const [announcement, setAnnouncementState] = useState<PlatformAnnouncement>({
    text: "بخێربهێن بۆ پلاتفۆڕما Las AI!",
    active: true,
    type: "promo",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "register" | "forgot" | "profile">("login");
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [proModalToolTitle, setProModalToolTitle] = useState<string | null>(null);
  const [quotaVersion, setQuotaVersion] = useState(0);

  const isUserAdmin =
    !!user &&
    (user.role === "admin" ||
      user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      user.isAdmin === true);

  const isUserPro =
    isUserAdmin ||
    (!!user && (user.membership === "pro" || user.membership === "academic"));

  // ─── Notification State ───────────────────────────────────────────────────
  const [adminNotifications, setAdminNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_NOTIFICATIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [userNotifications, setUserNotifications] = useState<NotificationItem[]>([]);
  const [broadcastNotifications, setBroadcastNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(BROADCAST_NOTIFICATIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Sync user-specific notifications & ensure single Badini welcome message
  useEffect(() => {
    if (user?.id) {
      const key = `${USER_NOTIFICATIONS_STORAGE_KEY_PREFIX}${user.id}`;
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          setUserNotifications(JSON.parse(saved));
        } else {
          // Exactly 1 welcoming notification in Badini
          const welcomeNotif: NotificationItem = {
            id: `notif_welcome_${user.id}`,
            title: "🚀 ب خێر هاتی بۆ Las AI!",
            message: `سڵاڤ ${user.name}، ب خێر هاتی بۆ پلاتفۆڕما Las AI! نوکە دشێی مفای ژ هەمی ئامرازێن پێشکەفتی یێن زیرەکیا دەستکرد وەربگری.`,
            time: "نوکە",
            timestamp: Date.now(),
            read: false,
            type: "system",
          };
          const initial = [welcomeNotif];
          setUserNotifications(initial);
          localStorage.setItem(key, JSON.stringify(initial));
        }
      } catch {}
    } else {
      setUserNotifications([]);
    }
  }, [user?.id, user?.name]);

  // Load initial persistent state on mount
  useEffect(() => {
    try {
      const savedUsersList = localStorage.getItem(USERS_LIST_STORAGE_KEY);
      let list: UserProfile[] = initialSampleUsers;
      if (savedUsersList) {
        try {
          list = JSON.parse(savedUsersList);
          setAllUsers(list);
        } catch {}
      }

      const savedUser = localStorage.getItem(STORAGE_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          parsed.role = "admin";
          parsed.roleLabel = "بەڕێوەبەری سەرەکی (Admin)";
          parsed.membership = "pro";
          parsed.membershipLabel = "دەسەڵاتی تەواو (Super Admin)";
          parsed.isAdmin = true;
          if (!parsed.phone) parsed.phone = adminProfile.phone;
        } else if (parsed.email?.toLowerCase() === "cv.centerr@gmail.com") {
          parsed.phone = "+9647502039396";
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          } catch {}
        } else if (!parsed.phone) {
          const match = list.find((u) => u.email?.toLowerCase() === parsed.email?.toLowerCase() || u.id === parsed.id);
          if (match?.phone) {
            parsed.phone = match.phone;
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
            } catch {}
          }
        }
        setUser(parsed);
      }

      const savedVipCodes = localStorage.getItem(VIP_CODES_STORAGE_KEY);
      if (savedVipCodes) {
        setVipCodes(JSON.parse(savedVipCodes));
      }

      const savedPricing = localStorage.getItem(PRICING_CONFIG_STORAGE_KEY);
      if (savedPricing) {
        setPricingConfig(JSON.parse(savedPricing));
      }

      const savedAnn = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
      if (savedAnn) {
        setAnnouncementState(JSON.parse(savedAnn));
      }
    } catch (e) {
      console.error("Failed to load user auth state", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync live announcement from server in real-time for all users, visitors & devices
  useEffect(() => {
    let isMounted = true;

    const fetchServerAnnouncement = async () => {
      try {
        const res = await fetch("/api/announcement", {
          cache: "no-store",
          headers: { Pragma: "no-cache" },
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.data && isMounted) {
            setAnnouncementState(json.data);
            try {
              localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(json.data));
            } catch {}
          }
        }
      } catch (err) {
        // Fallback to local state
      }
    };

    fetchServerAnnouncement();

    // Poll every 3 seconds so any changes made by Admin appear instantly for everyone without page refresh
    const interval = setInterval(fetchServerAnnouncement, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Sync live pricing from server in real-time for all users, visitors & devices
  useEffect(() => {
    let isMounted = true;

    const fetchServerPricing = async () => {
      try {
        const res = await fetch("/api/pricing", {
          cache: "no-store",
          headers: { Pragma: "no-cache" },
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json?.data) && json.data.length > 0 && isMounted) {
            setPricingConfig(json.data);
            try {
              localStorage.setItem(PRICING_CONFIG_STORAGE_KEY, JSON.stringify(json.data));
            } catch {}
          }
        }
      } catch (err) {
        // Fallback to local state
      }
    };

    fetchServerPricing();

    // Poll every 4 seconds so any price updates made by Admin appear for everyone instantly
    const interval = setInterval(fetchServerPricing, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Sync live broadcast notifications from server in real-time for all users
  useEffect(() => {
    let isMounted = true;

    const fetchServerNotifications = async () => {
      try {
        const res = await fetch("/api/notifications", {
          cache: "no-store",
          headers: { Pragma: "no-cache" },
        });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json?.data) && isMounted) {
            setBroadcastNotifications(json.data);
            try {
              localStorage.setItem(BROADCAST_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(json.data));
            } catch {}
          }
        }
      } catch (err) {}
    };

    fetchServerNotifications();
    const interval = setInterval(fetchServerNotifications, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const logAdminNotification = (title: string, message: string, type: NotificationItem["type"] = "system") => {
    const newNotif: NotificationItem = {
      id: "notif_adm_" + Date.now() + "_" + Math.random().toString(36).substring(7),
      title,
      message,
      time: "نوکە",
      timestamp: Date.now(),
      read: false,
      type,
    };
    setAdminNotifications((prev) => {
      const updated = [newNotif, ...prev].slice(0, 50);
      try {
        localStorage.setItem(ADMIN_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const broadcastNotification = (
    title: string,
    message: string,
    type: NotificationItem["type"] = "feature",
    actionSection?: string,
    targetAudience?: "all" | "free" | "pro"
  ) => {
    const bcNotif: NotificationItem = {
      id: "notif_bc_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(7),
      title,
      message,
      time: "نوکە",
      timestamp: Date.now(),
      read: false,
      type,
      actionSection,
      targetAudience,
    };
    setBroadcastNotifications((prev) => {
      const updated = [bcNotif, ...prev].slice(0, 30);
      try {
        localStorage.setItem(BROADCAST_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    logAdminNotification(`📢 ${title}`, message, type);

    // Sync to server so all users & visitors get it!
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        message,
        type,
        actionSection,
        targetAudience,
      }),
    }).catch((err) => console.error("Failed to sync broadcast notification:", err));
  };

  const deleteBroadcastNotification = async (id: string) => {
    setBroadcastNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      try {
        localStorage.setItem(BROADCAST_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
    } catch {}
  };

  const markNotificationAsRead = (id: string) => {
    if (isUserAdmin) {
      setAdminNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        try {
          localStorage.setItem(ADMIN_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } else if (user?.id) {
      setUserNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        try {
          localStorage.setItem(`${USER_NOTIFICATIONS_STORAGE_KEY_PREFIX}${user.id}`, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const markAllNotificationsAsRead = () => {
    if (isUserAdmin) {
      setAdminNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, read: true }));
        try {
          localStorage.setItem(ADMIN_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } else if (user?.id) {
      setUserNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, read: true }));
        try {
          localStorage.setItem(`${USER_NOTIFICATIONS_STORAGE_KEY_PREFIX}${user.id}`, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const deleteNotification = (id: string) => {
    if (isUserAdmin) {
      setAdminNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        try {
          localStorage.setItem(ADMIN_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    } else if (user?.id) {
      setUserNotifications((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        try {
          localStorage.setItem(`${USER_NOTIFICATIONS_STORAGE_KEY_PREFIX}${user.id}`, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const clearAllNotifications = () => {
    if (isUserAdmin) {
      setAdminNotifications([]);
      try {
        localStorage.removeItem(ADMIN_NOTIFICATIONS_STORAGE_KEY);
      } catch {}
    } else if (user?.id) {
      setUserNotifications([]);
      try {
        localStorage.removeItem(`${USER_NOTIFICATIONS_STORAGE_KEY_PREFIX}${user.id}`);
      } catch {}
    }
  };

  const filteredBroadcasts = broadcastNotifications.filter((b) => {
    if (b.targetAudience === "pro" && !isUserPro) return false;
    if (b.targetAudience === "free" && isUserPro) return false;
    return true;
  });

  const activeNotifications: NotificationItem[] = isUserAdmin
    ? adminNotifications
    : user
    ? [...userNotifications, ...filteredBroadcasts.filter((b) => !userNotifications.some((u) => u.id === b.id))].sort((a, b) => b.timestamp - a.timestamp)
    : filteredBroadcasts;

  const unreadNotificationCount = activeNotifications.filter((n) => !n.read).length;

  const updatePricingConfig = (newConfig: PricingPlanDuration[]) => {
    setPricingConfig(newConfig);
    try {
      localStorage.setItem(PRICING_CONFIG_STORAGE_KEY, JSON.stringify(newConfig));
    } catch {}

    // Persist to server in real-time so all users and devices receive the updated prices
    fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: newConfig }),
    }).catch((err) => {
      console.error("Failed to sync pricing to server:", err);
    });
  };

  const saveUser = (newUser: UserProfile | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const saveUsersList = (users: UserProfile[]) => {
    setAllUsers(users);
    localStorage.setItem(USERS_LIST_STORAGE_KEY, JSON.stringify(users));
  };

  const saveVipCodes = (codes: VipCodeItem[]) => {
    setVipCodes(codes);
    localStorage.setItem(VIP_CODES_STORAGE_KEY, JSON.stringify(codes));
  };

  const setAnnouncement = (ann: PlatformAnnouncement) => {
    setAnnouncementState(ann);
    try {
      localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(ann));
    } catch {}

    if (ann.active && ann.text) {
      broadcastNotification("📢 ئاگەهدارییا نوو ژ ڕێڤەبەریێ", ann.text);
    }

    // Persist to server so all visitors and devices receive the change
    fetch("/api/announcement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ann),
    }).catch((err) => {
      console.warn("Failed to persist announcement to server:", err);
    });
  };

  const openAuthModal = (view: "login" | "register" | "forgot" | "profile" = "login") => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (identifier: string, _password?: string) => {
    await new Promise((res) => setTimeout(res, 500));

    if (!identifier || identifier.trim().length < 3) {
      return { success: false, error: "تکایە ئیمەیڵ یان ژمارەی مۆبایل بنووسە." };
    }

    const trimmed = identifier.trim().toLowerCase();
    const isEmail = trimmed.includes("@");
    const isPhone = !isEmail && /\d/.test(trimmed);

    if (!isEmail && !isPhone) {
      return { success: false, error: "تکایە ئیمەیڵێکی دروست یان ژمارەی مۆبایل بنووسە." };
    }

    // Check if admin email
    const isAdminUser = trimmed === ADMIN_EMAIL.toLowerCase() || trimmed.includes("sangarduhok") || trimmed === "sangar";

    const cleanInputDigits = trimmed.replace(/\D/g, "");
    const existingUser = allUsers.find((u) => {
      if (isEmail && u.email.toLowerCase() === trimmed) return true;
      if (u.phone) {
        const uDigits = u.phone.replace(/\D/g, "");
        if (cleanInputDigits.length >= 7 && (uDigits.endsWith(cleanInputDigits) || cleanInputDigits.endsWith(uDigits))) {
          return true;
        }
      }
      return false;
    });

    const loggedUser: UserProfile = isAdminUser
      ? adminProfile
      : existingUser
      ? {
          ...existingUser,
          status: "active",
        }
      : {
          id: "usr_" + Math.random().toString(36).substring(7),
          name: isEmail ? trimmed.split("@")[0] : `بەکارهێنەر (${trimmed})`,
          email: isEmail ? trimmed : `${trimmed.replace(/\D/g, "")}@phone.user`,
          phone: isPhone ? trimmed : undefined,
          role: "student" as const,
          roleLabel: "فێرخواز",
          membership: "free" as const,
          membershipLabel: "بێبەرامبەر (Free)",
          joinedDate: new Date().toLocaleDateString("en-GB"),
          savedToolsCount: 4,
          isAdmin: false,
          status: "active",
        };

    saveUser(loggedUser);

    // Also add or update in allUsers list
    if (!allUsers.some((u) => u.email.toLowerCase() === loggedUser.email.toLowerCase())) {
      saveUsersList([loggedUser, ...allUsers]);
    } else {
      saveUsersList(allUsers.map((u) => (u.email.toLowerCase() === loggedUser.email.toLowerCase() ? loggedUser : u)));
    }

    if (!isAdminUser) {
      logAdminNotification(
        "🔑 چوونەژوورڤەیا بەکارهێنەری",
        `بەکارهێنەر (${loggedUser.name}) ب ناڤونیشانێ (${loggedUser.email || loggedUser.phone}) هاتە ژوورڤە.`,
        "system"
      );
    }

    closeAuthModal();
    return { success: true };
  };

  const register = async (data: { name: string; email: string; phone?: string; password?: string; role?: string }) => {
    await new Promise((res) => setTimeout(res, 600));

    if (!data.name || data.name.trim().length < 2) {
      return { success: false, error: "تکایە ناوی تەواوی خۆت بنووسە." };
    }
    if (!data.email || !data.email.includes("@")) {
      return { success: false, error: "تکایە ئیمەیڵێکی دروست بنووسە." };
    }
    if (!data.phone || data.phone.replace(/\D/g, "").length < 9) {
      return { success: false, error: "تکایە ژمارەی مۆبایلی خۆت (واتساپ) بنووسە." };
    }

    const emailTrimmed = data.email.trim().toLowerCase();
    const isAdminUser = emailTrimmed === ADMIN_EMAIL.toLowerCase();

    let roleLabel = "فێرخوازی زانکۆ";
    if (isAdminUser) roleLabel = "بەڕێوەبەری سەرەکی (Admin)";
    else if (data.role === "researcher") roleLabel = "توێژەری ئەکادیمی";
    else if (data.role === "teacher") roleLabel = "مامۆستا / وانەبێژ";
    else if (data.role === "pro") roleLabel = "پیشەگەر / بزنس";

    const newUser: UserProfile = {
      id: isAdminUser ? "usr_admin_sangar" : "usr_" + Date.now().toString(36),
      name: data.name.trim(),
      email: emailTrimmed,
      phone: data.phone.trim(),
      role: isAdminUser ? "admin" : ((data.role as any) || "student"),
      roleLabel,
      membership: isAdminUser ? "pro" : "free",
      membershipLabel: isAdminUser ? "دەسەڵاتی تەواو (Super Admin)" : "بێبەرامبەر (Free)",
      joinedDate: new Date().toLocaleDateString("en-GB"),
      savedToolsCount: 0,
      isAdmin: isAdminUser,
      status: "active",
    };

    saveUser(newUser);
    saveUsersList([newUser, ...allUsers.filter((u) => u.email.toLowerCase() !== newUser.email.toLowerCase())]);

    if (!isAdminUser) {
      logAdminNotification(
        "👤 تۆماربوونا بەکارهێنەرەکێ نوو",
        `بەکارهێنەرێ نوو (${newUser.name} - ${newUser.phone || newUser.email}) ل پلاتفۆڕمێ هاتە تۆمارکرن.`,
        "system"
      );
    }

    closeAuthModal();
    return { success: true };
  };

  const sendPhoneOtp = async (phone: string) => {
    try {
      const res = await fetch("/api/whatsapp-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "نەتوانرا کۆد بنێردرێت." };
      }
      return { success: true, message: data.message };
    } catch (e: any) {
      return { success: false, error: "کێشەیەک لە پەیوەندی هەیە، تکایە دووبارە هەوڵبدەرەوە." };
    }
  };

  const loginWithPhoneOtp = async (phone: string, code: string, name?: string, email?: string) => {
    try {
      const res = await fetch("/api/whatsapp-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", phone, code, name, email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.user) {
        return { success: false, error: data.error || "کۆدەکە هەڵەیە یان بەسەرچووە." };
      }

      const verifiedUser: UserProfile = data.user;
      if (verifiedUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        verifiedUser.role = "admin";
        verifiedUser.isAdmin = true;
        verifiedUser.membership = "pro";
        verifiedUser.membershipLabel = "دەسەڵاتی تەواو (Super Admin)";
      }

      saveUser(verifiedUser);
      if (!verifiedUser.isAdmin) {
        logAdminNotification(
          "📱 چوونەژوورڤە ب ڕێکا واتساپێ / مۆبایل",
          `بەکارهێنەر (${verifiedUser.name} - ${verifiedUser.phone || verifiedUser.email}) هاتە ژوورڤە.`,
          "system"
        );
      }
      closeAuthModal();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: "کێشەیەک ڕوویدا لە کاتی پشتڕاستکردنەوە." };
    }
  };

  const loginAsGuest = () => {
    const guestUser: UserProfile = {
      ...defaultProfiles.guest,
      id: "usr_guest_" + Math.random().toString(36).substring(7),
    };
    saveUser(guestUser);
    closeAuthModal();
  };

  const requestLogout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const cancelLogout = () => {
    setIsLogoutConfirmOpen(false);
  };

  const confirmLogout = () => {
    saveUser(null);
    setIsLogoutConfirmOpen(false);
    closeAuthModal();
  };

  const logout = () => {
    setIsLogoutConfirmOpen(true);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    saveUser(updated);
    saveUsersList(allUsers.map((u) => (u.id === user.id ? updated : u)));
  };

  const updateUserRole = (userId: string, role: UserProfile["role"], membership: UserProfile["membership"]) => {
    let roleLabel = "فێرخواز";
    if (role === "admin") roleLabel = "بەڕێوەبەری سەرەکی (Admin)";
    else if (role === "researcher") roleLabel = "توێژەری ئەکادیمی";
    else if (role === "teacher") roleLabel = "مامۆستا / وانەبێژ";
    else if (role === "pro") roleLabel = "پیشەگەر / بزنس";

    let membershipLabel = "بێبەرامبەر (Free)";
    if (membership === "pro") membershipLabel = "پلانی پرۆ (Pro VIP)";
    else if (membership === "academic") membershipLabel = "ئەکادیمی VIP";

    const updated = allUsers.map((u) =>
      u.id === userId
        ? { ...u, role, roleLabel, membership, membershipLabel, isAdmin: role === "admin" }
        : u,
    );
    saveUsersList(updated);

    if (user && user.id === userId) {
      const cur = updated.find((u) => u.id === userId);
      if (cur) saveUser(cur);
    }

    logAdminNotification(
      "⚙️ ئەپدەیتکرنا پلەیا بەکارهێنەری",
      `پلەیا بەکارهێنەر ب ناسنامەیا (${userId}) بۆ (${roleLabel} / ${membershipLabel}) هاتە گوهۆڕین.`,
      "system"
    );
  };

  const toggleUserBan = (userId: string) => {
    const updated = allUsers.map((u) =>
      u.id === userId
        ? { ...u, status: (u.status === "banned" ? "active" : "banned") as "active" | "banned" }
        : u,
    );
    saveUsersList(updated);
    logAdminNotification(
      "🚫 ڕاگرتن / چالاککرنا بەکارهێنەری",
      `بارودۆخێ بەکارهێنەر ب ناسنامەیا (${userId}) هاتە گوهۆڕین.`,
      "system"
    );
  };

  const deleteUser = (userId: string) => {
    const updated = allUsers.filter((u) => u.id !== userId);
    saveUsersList(updated);
    logAdminNotification(
      "🗑️ ژێبرنا بەکارهێنەری",
      `بەکارهێنەر ب ناسنامەیا (${userId}) ژ سیستەمی هاتە سڕینەوە.`,
      "system"
    );
  };

  const addUserByAdmin = (newUser: UserProfile) => {
    saveUsersList([newUser, ...allUsers]);
  };

  const generateVipCode = (options: {
    plan?: "pro" | "academic";
    duration?: string;
    customerName?: string;
    customerPhone?: string;
    customCode?: string;
  }) => {
    const plan = options.plan || "pro";
    const planLabel = plan === "academic" ? "پلانی ئەکادیمی (Academic)" : "پلانی پرۆ (Pro)";
    const duration = options.duration || "1 مانگ";

    // Generate highly secure 16-character alphanumeric key (e.g. PRO-8K9N-4X7P-2W9Q-6H2M)
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const genSegment = (len: number) => {
      let s = "";
      for (let i = 0; i < len; i++) {
        s += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return s;
    };
    const prefix = plan === "academic" ? "ACAD" : "PRO";
    const secureGenerated = `${prefix}-${genSegment(4)}-${genSegment(4)}-${genSegment(4)}-${genSegment(4)}`;

    const codeStr = (options.customCode?.trim() || secureGenerated)
      .replace(/[\u200E\u200F\u202A-\u202E\s]/g, "")
      .toUpperCase();

    const newCodeItem: VipCodeItem = {
      id: "code_" + Date.now().toString(36),
      code: codeStr,
      plan,
      planLabel,
      duration,
      createdAt: new Date().toLocaleDateString("en-GB"),
      createdForName: options.customerName?.trim() || undefined,
      createdForPhone: options.customerPhone?.trim() || undefined,
      isUsed: false,
    };

    let currentList: VipCodeItem[] = [];
    try {
      const stored = localStorage.getItem(VIP_CODES_STORAGE_KEY);
      currentList = stored ? JSON.parse(stored) : vipCodes;
    } catch {
      currentList = vipCodes;
    }

    const updated = [newCodeItem, ...currentList.filter((c) => c.code !== newCodeItem.code)];
    saveVipCodes(updated);
    logAdminNotification(
      "✨ دروستکرنا کۆدێ VIP",
      `کۆدێ (${newCodeItem.code}) بۆ (${newCodeItem.createdForName || "بەکارهێنەر"} - ${newCodeItem.planLabel}) هاتە دروستکرن.`,
      "pro"
    );
    return newCodeItem;
  };

  const redeemVipCode = (inputCode: string) => {
    // Strip hidden Unicode directional marks (RTL/LTR) & trim spaces
    const clean = (inputCode || "")
      .replace(/[\u200E\u200F\u202A-\u202E\s]/g, "")
      .trim()
      .toUpperCase();

    if (!clean) {
      return { success: false, message: "تکایە کۆدی چالاککردن بنووسە." };
    }

    // Ensure we have an active user profile
    let activeUser = user;
    if (!activeUser) {
      activeUser = {
        id: "usr_" + Math.random().toString(36).substring(7),
        name: "بەکارهێنەری پرۆ",
        email: "pro.user@las-ai.com",
        role: "student",
        roleLabel: "فێرخواز",
        membership: "pro",
        membershipLabel: "پلانی پرۆ (Pro)",
        joinedDate: new Date().toLocaleDateString("en-GB"),
        savedToolsCount: 0,
        isAdmin: false,
      };
    }

    // Load latest codes from localStorage
    let currentCodes: VipCodeItem[] = vipCodes;
    try {
      const stored = localStorage.getItem(VIP_CODES_STORAGE_KEY);
      if (stored) currentCodes = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }

    const cleanNorm = clean.replace(/[^A-Z0-9]/g, "");

    const foundCode = currentCodes.find((c) => {
      const cNorm = c.code.replace(/[\u200E\u200F\u202A-\u202E\s]/g, "").trim().toUpperCase();
      return cNorm === clean || cNorm.replace(/[^A-Z0-9]/g, "") === cleanNorm;
    });

    if (!foundCode) {
      return {
        success: false,
        message: "کۆدی داخڵکراو هەڵەیە یان بوونی نییە. تکایە دڵنیابە لە دروستی کلیلەکەت.",
      };
    }

    // Strict 1-person enforcement: If already used, reject permanently!
    if (foundCode.isUsed) {
      const usedInfo = foundCode.usedByName
        ? `${foundCode.usedByName} (${foundCode.usedAt || "پێشتر"})`
        : foundCode.usedAt || "پێشتر";
      return {
        success: false,
        message: `ئەم کلیلە پێشتر لەلایەن [${usedInfo}] بەکارهێنراوە و ناچالاک بووە! هەر کلیلێک تەنها بۆ یەک کەس و یەک جار بەکاردێت.`,
      };
    }

    // Mark code as used immediately and record the exact user & timestamp
    const updatedCodes = currentCodes.map((c) =>
      c.id === foundCode.id
        ? {
            ...c,
            isUsed: true,
            usedByEmail: activeUser.email,
            usedByName: activeUser.name,
            usedAt: new Date().toLocaleDateString("en-GB") + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        : c,
    );
    saveVipCodes(updatedCodes);

    // Upgrade user to Pro
    const updatedUser: UserProfile = {
      ...activeUser,
      membership: foundCode.plan,
      membershipLabel: foundCode.planLabel,
    };
    saveUser(updatedUser);
    saveUsersList(allUsers.map((u) => (u.id === activeUser.id ? updatedUser : u)));

    // User notification
    if (activeUser.id) {
      const userKey = `${USER_NOTIFICATIONS_STORAGE_KEY_PREFIX}${activeUser.id}`;
      const proNotif: NotificationItem = {
        id: "notif_pro_" + Date.now(),
        title: "💎 پلانا پڕۆ هاتە چالاککرن!",
        message: `پیرۆزە! هەژمارا تە ب سەرکەفتیانە بۆ ${foundCode.planLabel} بۆ ماوێ (${foundCode.duration}) هاتە چالاککرن.`,
        time: "نوکە",
        timestamp: Date.now(),
        read: false,
        type: "pro",
      };
      setUserNotifications((prev) => {
        const updatedNotifs = [proNotif, ...prev];
        try {
          localStorage.setItem(userKey, JSON.stringify(updatedNotifs));
        } catch {}
        return updatedNotifs;
      });
    }

    // Admin notification
    logAdminNotification(
      "💎 چالاککرنا کۆدێ VIP",
      `بەکارهێنەر (${activeUser.name}) کۆدێ (${foundCode.code}) بۆ پلانا (${foundCode.planLabel}) چالاک کر.`,
      "pro"
    );

    return {
      success: true,
      message: `پیرۆزە! هەژمارەکەت بە سەرکەوتوویی بۆ ${foundCode.planLabel} بۆ ماوەی (${foundCode.duration}) چالاککرا!`,
      plan: foundCode.planLabel,
    };
  };

  const deleteVipCode = (codeId: string) => {
    const updated = vipCodes.filter((c) => c.id !== codeId);
    saveVipCodes(updated);
  };

  const openProModal = (toolTitle?: string) => {
    setProModalToolTitle(toolTitle || null);
    setIsProModalOpen(true);
  };

  const closeProModal = () => {
    setIsProModalOpen(false);
    setProModalToolTitle(null);
  };

  const getTodayDateString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  // ─── Daily Credits Helpers ────────────────────────────────────────────────
  // Storage format: { date: "YYYY-MM-DD", credits: number }
  // Free users start each day with FREE_DAILY_CREDITS (10). Each tool use
  // deducts 1 credit from the shared pool. Resets automatically at midnight.

  const getDailyCreditsData = (): { date: string; credits: number } => {
    try {
      const raw = localStorage.getItem(DAILY_CREDITS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === getTodayDateString() && typeof parsed.credits === "number") {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    // New day → full credit allowance
    return { date: getTodayDateString(), credits: FREE_DAILY_CREDITS };
  };

  const saveDailyCreditsData = (credits: number) => {
    try {
      const clamped = Math.max(0, Math.min(FREE_DAILY_CREDITS, credits));
      localStorage.setItem(
        DAILY_CREDITS_STORAGE_KEY,
        JSON.stringify({ date: getTodayDateString(), credits: clamped }),
      );
      setQuotaVersion((v) => v + 1);
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Referral / Bonus Credits (persistent, not daily-reset) ─────────────
  const getBonusCredits = (): number => {
    try {
      const raw = localStorage.getItem(REFERRAL_CREDITS_STORAGE_KEY);
      if (raw) return Math.max(0, parseInt(raw, 10) || 0);
    } catch {}
    return 0;
  };

  const addBonusCredits = (amount: number) => {
    try {
      const current = getBonusCredits();
      const next = current + amount;
      localStorage.setItem(REFERRAL_CREDITS_STORAGE_KEY, String(next));
      setQuotaVersion((v) => v + 1);
    } catch {}
  };

  const getReferralUsedBy = (): string[] => {
    try {
      const raw = localStorage.getItem(REFERRAL_USED_BY_STORAGE_KEY);
      if (raw) return JSON.parse(raw) as string[];
    } catch {}
    return [];
  };

  const DEVICE_REFERRAL_FLAG = "ai_pukhtana_has_redeemed_referral_v1";

  // Check if current user or device has already redeemed ANY referral code once
  const checkHasRedeemedReferral = (): boolean => {
    try {
      if (localStorage.getItem(DEVICE_REFERRAL_FLAG) === "true") return true;
      const usedBy = getReferralUsedBy();
      if (user?.id && usedBy.includes(user.id)) return true;
      if (user?.email && usedBy.includes(user.email.toLowerCase())) return true;
      if (user?.phone && usedBy.includes(user.phone)) return true;
    } catch {}
    return false;
  };

  // Derive a unique deterministic invite code for the logged-in user
  // Format: INV-XXXXXXXX (based on user id hash)
  const getMyReferralCode = (): string => {
    if (!user) return "";
    // Derive a simple 8-char code from user id
    const base = (user.id + user.email).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
      hash = ((hash << 5) - hash) + base.charCodeAt(i);
      hash |= 0;
    }
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    let h = Math.abs(hash);
    for (let i = 0; i < 8; i++) {
      code += chars[h % chars.length];
      h = Math.floor(h / chars.length) + (i + 1) * 37;
    }
    return `INV-${code.slice(0, 4)}-${code.slice(4)}`;
  };

  // When a new user registers using a referral code or redeems one, this is called.
  // STRICT 1-TIME ENFORCEMENT: Each user/device can only redeem ONCE ever.
  const useReferralCode = (code: string): { success: boolean; message: string } => {
    const clean = (code || "").replace(/[^A-Z0-9-]/gi, "").toUpperCase().trim();
    if (!clean || !clean.startsWith("INV-")) {
      return { success: false, message: "کۆدا داعوتکرنێ هەڵەیە. تکایە دڵنیابە لە دروستیی کۆدەکە." };
    }

    // Prevent self-referral
    if (user && getMyReferralCode() === clean) {
      return { success: false, message: "ناشی کۆدا خۆیا تایبەت بکارببینی بۆ وەرگرتنا دیاریێ." };
    }

    // Strict 1-time check: If user or device has already redeemed any code, permanently reject
    if (checkHasRedeemedReferral()) {
      return {
        success: false,
        message: "تە پێشتر 25 کرێدیتا دیاری وەرگرتیە! هەر کەسەک یان ئامیرەک بتنێ یەک جار دشێت دیارییا 25 کرێدیتان وەربگریت.",
      };
    }

    // Award the 25 bonus credits (gift)
    addBonusCredits(REFERRAL_BONUS_CREDITS);

    // Permanently record on device and in account lists
    try {
      localStorage.setItem(DEVICE_REFERRAL_FLAG, "true");
      const usedBy = getReferralUsedBy();
      const identifiers = [
        user?.id,
        user?.email ? user.email.toLowerCase() : null,
        user?.phone,
        "device_" + Date.now().toString(36),
      ].filter(Boolean) as string[];

      const updatedUsedBy = Array.from(new Set([...usedBy, ...identifiers]));
      localStorage.setItem(REFERRAL_USED_BY_STORAGE_KEY, JSON.stringify(updatedUsedBy));
      setQuotaVersion((v) => v + 1);
    } catch {}

    logAdminNotification(
      "🎁 وەرگرتنا دیارییا داعوەتێ",
      `بەکارهێنەر (${user?.name || "بەکارهێنەر"}) دیارییا 25 کرێدیتان وەرگرت.`,
      "tip"
    );

    return {
      success: true,
      message: `پیرۆزە! 25 کرێدیتی دیاری (Bonus Credits) بۆ تە هاتە زیادکرن! ✨`,
    };
  };

  // Compute current credit balance (reactive via quotaVersion)
  const currentCreditsData = getDailyCreditsData();
  const currentCredits = isUserPro ? FREE_DAILY_CREDITS : currentCreditsData.credits;
  const currentBonusCredits = getBonusCredits();

  // ─── Quota API (now credit-based, bonus credits used first) ─────────────

  const getToolQuotaStatus = (toolId: string): QuotaCheckResult => {
    // Completely free & unlimited tools requested by user
    if (isUserPro || UNLIMITED_FREE_TOOLS.has(toolId)) {
      return {
        allowed: true,
        remaining: Infinity,
        maxLimit: Infinity,
        resetsAt: "بێ سنوور (Free)",
        isPro: true,
        count: 0,
      };
    }
    const data = getDailyCreditsData();
    const bonus = getBonusCredits();
    const totalAvailable = data.credits + bonus;
    return {
      allowed: totalAvailable > 0,
      remaining: totalAvailable,
      maxLimit: FREE_DAILY_CREDITS,
      resetsAt: "نیوەشەو",
      isPro: false,
      count: Math.max(0, FREE_DAILY_CREDITS - data.credits),
      message:
        totalAvailable > 0
          ? undefined
          : `کریدیتی ئەمڕۆت بۆ ئامرازە پێشکەوتووەکان تەواو بوو. تکایە چاوەڕێ بکە تا نیوەشەو (12:00 شەو) بۆ ${FREE_DAILY_CREDITS} کریدیتی نوێ، یان پلانی پڕۆ (Pro) چالاک بکە بۆ بەکارهێنانی بێ سنوور!`,
    };
  };

  const consumeToolQuota = (toolId: string, toolTitle?: string): QuotaCheckResult => {
    // Exempt free tools never consume any credits
    if (isUserPro || UNLIMITED_FREE_TOOLS.has(toolId)) {
      return {
        allowed: true,
        remaining: Infinity,
        maxLimit: Infinity,
        resetsAt: "بێ سنوور (Free)",
        isPro: true,
        count: 0,
      };
    }
    const data = getDailyCreditsData();
    const bonus = getBonusCredits();
    const totalAvailable = data.credits + bonus;

    if (totalAvailable <= 0) {
      // No credits left → trigger Pro modal
      openProModal(toolTitle || "ئامرازەکان");
      return {
        allowed: false,
        remaining: 0,
        maxLimit: FREE_DAILY_CREDITS,
        resetsAt: "نیوەشەو",
        isPro: false,
        count: FREE_DAILY_CREDITS,
        message: `کریدیتی ئەمڕۆت تەواو بوو (0 لە ${FREE_DAILY_CREDITS}). بۆ بەکارهێنانی نامحدود، پلانی پڕۆ (Pro Plan) چالاک بکە!`,
      };
    }

    // Consume bonus credits first, then daily credits
    if (bonus > 0) {
      addBonusCredits(-1);
    } else {
      const newCredits = data.credits - 1;
      saveDailyCreditsData(newCredits);
    }

    const remaining = totalAvailable - 1;
    return {
      allowed: true,
      remaining,
      maxLimit: FREE_DAILY_CREDITS,
      resetsAt: "نیوەشەو",
      isPro: false,
      count: Math.max(0, FREE_DAILY_CREDITS - data.credits),
    };
  };

  const getUploadQuotaStatus = (): QuotaCheckResult => {
    return getToolQuotaStatus("summary");
  };

  const consumeUploadQuota = (): QuotaCheckResult => {
    return consumeToolQuota("summary", "کورتکردنی پەڕگە و ئەپلۆد");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: isUserAdmin,
        isPro: isUserPro,
        isLoading,
        isAuthModalOpen,
        authModalView,
        isProModalOpen,
        proModalToolTitle,
        quotaVersion,
        dailyCredits: currentCredits,
        maxDailyCredits: FREE_DAILY_CREDITS,
        bonusCredits: currentBonusCredits,
        announcement,
        allUsers,
        vipCodes,
        pricingConfig,
        updatePricingConfig,
        getToolQuotaStatus,
        consumeToolQuota,
        getUploadQuotaStatus,
        consumeUploadQuota,
        openProModal,
        closeProModal,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        sendPhoneOtp,
        loginWithPhoneOtp,
        isLogoutConfirmOpen,
        requestLogout,
        cancelLogout,
        confirmLogout,
        logout,
        loginAsGuest,
        updateProfile,
        setAnnouncement,
        updateUserRole,
        toggleUserBan,
        deleteUser,
        addUserByAdmin,
        generateVipCode,
        redeemVipCode,
        deleteVipCode,
        getMyReferralCode,
        useReferralCode,
        getReferralUsedBy,
        hasRedeemedReferral: checkHasRedeemedReferral(),
        addBonusCredits,
        // Notifications System
        notifications: activeNotifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        logAdminNotification,
        broadcastNotifications,
        broadcastNotification,
        deleteBroadcastNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
