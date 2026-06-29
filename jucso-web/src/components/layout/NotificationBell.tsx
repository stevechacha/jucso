import { useEffect, useRef, useState } from "react";
import { jucsoApi } from "@/api/jucsoApi";
import { isApiEnabled } from "@/api/client";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import { applyNotificationLink } from "@/lib/notificationNavigation";
import {
  canUseBrowserNotifications,
  notificationPermission,
  requestNotificationPermission,
  showBrowserNotification,
} from "@/lib/browserNotifications";
import type { PortalNotification } from "@/types";

export function NotificationBell() {
  const { user, apiEnabled, setPage } = useApp();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PortalNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef(0);

  const load = async () => {
    if (!apiEnabled || !user) return;
    try {
      const data = await jucsoApi.getNotifications();
      const prevUnread = prevUnreadRef.current;
      setItems(data.results);
      setUnread(data.unread_count);
      if (data.unread_count > prevUnread && prevUnread > 0) {
        const newest = data.results.find((n) => !n.is_read);
        if (newest) {
          showBrowserNotification(newest.title, newest.message, () => {
            if (newest.link) applyNotificationLink(newest.link, setPage);
          });
        }
      }
      prevUnreadRef.current = data.unread_count;
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, [user, apiEnabled]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!user || !isApiEnabled) return null;

  const markAllRead = async () => {
    const res = await jucsoApi.markNotificationsRead();
    setUnread(res.unread_count);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const openItem = async (item: PortalNotification) => {
    if (!item.is_read) {
      await jucsoApi.markNotificationsRead([item.id]);
      setUnread((c) => Math.max(0, c - 1));
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
    }
    setOpen(false);
    if (item.link?.startsWith("/dashboard")) {
      applyNotificationLink(item.link, setPage);
    } else if (item.link?.startsWith("/")) {
      window.location.href = item.link;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative w-9 h-9 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer"
        aria-label={unread ? `${t("notifTitle")}, ${t("notifUnread", { count: String(unread) })}` : t("notifTitle")}
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-jucso-gold text-jucso-navy text-[10px] font-black flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white rounded-xl shadow-xl border border-gray-100 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-display font-bold text-jucso-navy text-sm">{t("notifTitle")}</h3>
            <div className="flex items-center gap-2">
              {canUseBrowserNotifications() && notificationPermission() === "default" && (
                <button
                  type="button"
                  onClick={() => void requestNotificationPermission()}
                  className="text-[10px] text-jucso-teal font-semibold cursor-pointer hover:underline"
                >
                  {t("notifEnableBrowser")}
                </button>
              )}
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="text-xs text-jucso-teal font-semibold cursor-pointer hover:underline"
                >
                  {t("notifMarkAllRead")}
                </button>
              )}
            </div>
          </div>
          {items.length === 0 ? (
            <p className="text-xs text-gray-400 px-4 py-6 text-center">{t("notifEmpty")}</p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => void openItem(item)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                      item.is_read ? "opacity-70" : "bg-cyan-50/40"
                    }`}
                  >
                    <div className="font-semibold text-xs text-jucso-navy">{item.title}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{item.message}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
