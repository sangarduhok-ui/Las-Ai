import React, { useState, useEffect, useRef } from "react";
import { useAuth, NotificationItem } from "@/context/AuthContext";
import {
  Bell,
  CheckCheck,
  Trash2,
  Sparkles,
  Crown,
  Zap,
  Info,
  Clock,
  ExternalLink,
  X,
  UserCheck,
} from "lucide-react";

interface NotificationBellProps {
  onNavigateSection?: (section: string) => void;
}

export function NotificationBell({ onNavigateSection }: NotificationBellProps) {
  const {
    isAdmin,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
    if (item.actionSection && onNavigateSection) {
      setIsOpen(false);
      onNavigateSection(item.actionSection);
    }
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "pro":
        return <Crown className="w-4 h-4 text-amber-500" />;
      case "feature":
        return <Sparkles className="w-4 h-4 text-cyan-500" />;
      case "tip":
        return <Zap className="w-4 h-4 text-emerald-500" />;
      default:
        return isAdmin ? <UserCheck className="w-4 h-4 text-indigo-500" /> : <Info className="w-4 h-4 text-indigo-500" />;
    }
  };

  const getIconBg = (type: NotificationItem["type"]) => {
    switch (type) {
      case "pro":
        return "bg-amber-500/10 border-amber-500/30 text-amber-600";
      case "feature":
        return "bg-cyan-500/10 border-cyan-500/30 text-cyan-600";
      case "tip":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-600";
      default:
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-600";
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="ئاگەهداری"
        title={isAdmin ? "ئاگەهدارییێن ڕێڤەبەریێ (Live Admin Feed)" : "ئاگەهداری"}
        className={`relative inline-flex items-center justify-center w-8.5 h-8.5 rounded-full transition shadow-2xs border cursor-pointer ${
          isOpen
            ? "bg-primary text-primary-foreground border-primary shadow-md"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border"
        }`}
      >
        <Bell className={`w-4 h-4 transition-transform ${unreadNotificationCount > 0 ? "animate-pulse" : ""}`} />

        {/* Unread Counter Badge */}
        {unreadNotificationCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-full ring-2 ring-background animate-bounce shadow-xs">
            {unreadNotificationCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 sm:hidden animate-in fade-in-0 duration-150"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="fixed left-3 right-3 top-16 mt-1 sm:mt-2.5 sm:absolute sm:left-auto sm:right-0 sm:top-full w-auto sm:w-[380px] rounded-3xl bg-card border border-border/80 shadow-2xl z-50 overflow-hidden text-right animate-in fade-in-0 zoom-in-95 duration-150"
            style={{
              boxShadow: "0 20px 50px -10px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08)",
            }}
            dir="rtl"
          >
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-b from-secondary/60 to-transparent border-b border-border/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-foreground leading-none">
                  {isAdmin ? "ئاگەهداری و چالاکیێن ڕێڤەبەریێ" : "ئاگەهداری"}
                </h3>
                {isAdmin && (
                  <span className="text-[10px] font-bold text-amber-500 block mt-1">
                    ڕووداو و چالاکیێن بەکارهێنەران (Live Admin Feed)
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification Items List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40 overscroll-contain">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-secondary/60 border border-border flex items-center justify-center mx-auto text-muted-foreground">
                  <Bell className="w-6 h-6 opacity-40" />
                </div>
                <p className="text-xs font-bold text-muted-foreground">چ ئاگەهداری نینن</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 transition flex items-start gap-3 cursor-pointer group relative ${
                    item.read
                      ? "bg-card hover:bg-secondary/40 opacity-80"
                      : "bg-primary/5 hover:bg-primary/10"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 shadow-2xs ${getIconBg(
                      item.type
                    )}`}
                  >
                    {getIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-right space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs leading-snug truncate ${
                          item.read ? "font-bold text-foreground" : "font-black text-foreground"
                        }`}
                      >
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 ring-2 ring-primary/20" />
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {item.message}
                    </p>

                    {/* Timestamp & Action Link */}
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-muted-foreground/80 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>

                      {item.actionLabel && (
                        <span className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5">
                          {item.actionLabel}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hover Delete Action */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    title="ژێبرن"
                    className="opacity-0 group-hover:opacity-100 transition p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg absolute left-2 top-2 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </>
    )}
  </div>
  );
}
