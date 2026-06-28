import type { ComplaintActivity } from "@/types";

interface ComplaintActivityTimelineProps {
  activity: ComplaintActivity[];
  compact?: boolean;
}

export function ComplaintActivityTimeline({ activity, compact = false }: ComplaintActivityTimelineProps) {
  if (!activity.length) return null;

  return (
    <div className={compact ? "mt-3" : "mt-4"}>
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Activity timeline</h4>
      <ol className="space-y-2 border-l-2 border-jucso-teal/30 pl-3">
        {activity.map((item, index) => (
          <li key={`${item.timestamp}-${index}`} className="relative">
            <span className="absolute -left-[1.15rem] top-1 w-2 h-2 rounded-full bg-jucso-teal" aria-hidden />
            <div className="text-xs font-semibold text-jucso-navy">{item.action}</div>
            {item.detail ? <p className="text-[10px] text-gray-500 mt-0.5">{item.detail}</p> : null}
            <p className="text-[10px] text-gray-400 mt-0.5">
              {item.actorName} · {item.timestamp}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
