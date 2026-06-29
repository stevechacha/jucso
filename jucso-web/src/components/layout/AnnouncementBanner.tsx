import type { PortalAnnouncement } from "@/types";

const PRIORITY_STYLES: Record<PortalAnnouncement["priority"], string> = {
  info: "bg-cyan-50 border-cyan-200 text-cyan-900",
  warning: "bg-amber-50 border-amber-200 text-amber-900",
  urgent: "bg-red-50 border-red-200 text-red-900",
};

export function AnnouncementBanner({
  announcement,
  onDismiss,
}: {
  announcement: PortalAnnouncement;
  onDismiss?: () => void;
}) {
  return (
    <div
      className={`border-b px-4 py-2.5 text-sm ${PRIORITY_STYLES[announcement.priority]}`}
      role="status"
      aria-live="polite"
    >
      <div className="max-w-6xl mx-auto flex items-start gap-3 justify-between">
        <p className="leading-relaxed">
          <span className="font-semibold mr-1 capitalize">{announcement.priority}:</span>
          {announcement.message}
          {announcement.link_url && (
            <>
              {" "}
              <a
                href={announcement.link_url}
                className="font-semibold underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                {announcement.link_label || "Learn more"}
              </a>
            </>
          )}
        </p>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-xs font-semibold opacity-70 hover:opacity-100 cursor-pointer"
            aria-label="Dismiss announcement"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
