import { useState } from "react";
import { ApiError } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import type { Suggestion, SuggestionStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/FormFields";
import { StatusPill } from "@/components/ui/StatusPill";
import { useLanguage } from "@/context/LanguageContext";

const STATUSES: SuggestionStatus[] = ["Received", "Under Review", "Implemented", "Declined"];

function suggestionPk(id: string): number {
  return parseInt(id.replace(/^SUG-/, ""), 10);
}

interface SuggestionReviewPanelProps {
  suggestions: Suggestion[];
  onUpdated: () => void;
  apiEnabled: boolean;
}

export function SuggestionReviewPanel({ suggestions, onUpdated, apiEnabled }: SuggestionReviewPanelProps) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<SuggestionStatus>("Under Review");
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const selected = suggestions.find((s) => s.id === selectedId);
  const pending = suggestions.filter((s) => s.status !== "Implemented" && s.status !== "Declined");

  const openSuggestion = (s: Suggestion) => {
    setSelectedId(s.id);
    setStatus(s.status);
    setResponseText(s.response ?? "");
    setErr("");
  };

  const save = async () => {
    if (!selected || !apiEnabled) return;
    setLoading(true);
    setErr("");
    try {
      await jucsoApi.updateSuggestion(suggestionPk(selected.id), {
        status,
        response: responseText.trim() || undefined,
      });
      setSelectedId(null);
      onUpdated();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not update suggestion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
      <div className="md:col-span-3 bg-white rounded-xl shadow-card overflow-hidden">
        <h2 className="px-5 py-4 border-b border-gray-100 font-display font-bold text-jucso-navy">
          {t("suggestionsPending", { count: String(pending.length) })}
        </h2>
        {suggestions.length === 0 ? (
          <p className="p-6 text-center text-gray-400 text-sm">No suggestions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-jucso-slate">
                  {["Title", "Student", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suggestions.map((s, i) => (
                  <tr
                    key={s.id}
                    onClick={() => openSuggestion(s)}
                    className={`border-t border-gray-50 cursor-pointer hover:bg-indigo-50 transition-colors ${
                      selectedId === s.id ? "bg-indigo-50" : i % 2 === 1 ? "bg-gray-50/50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-jucso-navy max-w-[140px] truncate">
                      {s.title}
                      {s.isOverdue ? (
                        <span className="ml-1 text-[10px] font-bold text-red-600">{t("suggestionOverdue")}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{s.studentName}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="md:col-span-2">
        {selected ? (
          <div className="bg-white rounded-xl p-5 shadow-card">
            <h3 className="font-display font-bold text-jucso-navy text-sm mb-2">{selected.title}</h3>
            <p className="text-xs text-gray-500 mb-1">From {selected.studentName}</p>
            {selected.isOverdue ? (
              <p className="text-xs font-semibold text-red-600 mb-2">{t("overdue")} — {t("slaDue", { date: selected.dueAt ?? "" })}</p>
            ) : selected.dueAt ? (
              <p className="text-xs text-gray-500 mb-2">{t("slaDue", { date: selected.dueAt })}</p>
            ) : null}
            <p className="text-xs text-gray-600 leading-relaxed mb-4">{selected.description}</p>
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as SuggestionStatus)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Textarea
              label="Response to student"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={3}
              placeholder="Optional feedback for the student..."
            />
            {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
            <div className="flex gap-2">
              <Button size="sm" variant="navy" onClick={() => void save()} disabled={loading || !apiEnabled}>
                {loading ? "Saving…" : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedId(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm shadow-card">
            Select a suggestion to review
          </div>
        )}
      </div>
    </div>
  );
}
