import { useEffect, useState } from "react";
import { ApiError } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { Button } from "@/components/ui/Button";
import { exportAttendeesCsv } from "@/lib/exportAttendeesCsv";

interface AttendeeListPanelProps {
  kind: "club" | "event";
  itemId: string;
  itemName: string;
}

export function AttendeeListPanel({ kind, itemId, itemName }: AttendeeListPanelProps) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [attendees, setAttendees] = useState<
    Array<{ reg_number: string; name: string; email: string; date: string }>
  >([]);

  useEffect(() => {
    setLoading(true);
    setErr("");
    const load =
      kind === "club" ? jucsoApi.getClubMembers(itemId) : jucsoApi.getEventRegistrants(itemId);
    void load
      .then((data) => setAttendees(data.attendees))
      .catch((error) => setErr(error instanceof ApiError ? error.message : "Could not load list."))
      .finally(() => setLoading(false));
  }, [kind, itemId]);

  const label = kind === "club" ? "members" : "registrants";
  const slug = itemName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return (
    <div className="mt-2 p-3 bg-jucso-slate/60 rounded-lg border border-gray-100">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
          {attendees.length} {label}
        </p>
        {attendees.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              exportAttendeesCsv(
                attendees,
                `jucso-${kind}-${slug || itemId}.csv`,
              )
            }
          >
            Export CSV
          </Button>
        )}
      </div>
      {loading ? (
        <p className="text-xs text-gray-400">Loading…</p>
      ) : err ? (
        <p className="text-xs text-red-600">{err}</p>
      ) : attendees.length === 0 ? (
        <p className="text-xs text-gray-400">No {label} yet.</p>
      ) : (
        <div className="max-h-32 overflow-y-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left py-1 pr-2 font-bold">Reg</th>
                <th className="text-left py-1 pr-2 font-bold">Name</th>
                <th className="text-left py-1 font-bold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((a) => (
                <tr key={a.reg_number} className="border-t border-gray-100">
                  <td className="py-1 pr-2 text-jucso-navy font-semibold whitespace-nowrap">{a.reg_number}</td>
                  <td className="py-1 pr-2 text-gray-600 truncate max-w-[100px]">{a.name}</td>
                  <td className="py-1 text-gray-400 whitespace-nowrap">{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
