/** Browser notification helpers (permission + display when tab is in background). */

export function canUseBrowserNotifications(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  if (!canUseBrowserNotifications()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!canUseBrowserNotifications()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function showBrowserNotification(title: string, body: string, onClick?: () => void): void {
  if (!canUseBrowserNotifications() || Notification.permission !== "granted") return;
  if (!document.hidden) return;
  try {
    const notification = new Notification(title, { body, icon: "/favicon.svg", tag: "jucso-portal" });
    notification.onclick = () => {
      window.focus();
      onClick?.();
      notification.close();
    };
  } catch {
    /* ignore */
  }
}
