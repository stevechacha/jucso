import { Fragment, useState } from "react";
import type { Complaint } from "@/types";
import { ComplaintActivityTimeline } from "@/components/complaints/ComplaintActivityTimeline";
import { ComplaintAttachmentLink } from "@/components/complaints/ComplaintAttachmentLink";
import { ComplaintSatisfactionPanel } from "@/components/complaints/ComplaintSatisfactionPanel";
import { ConfidentialBadge } from "@/components/complaints/ConfidentialBadge";
import { EscalatedBadge } from "@/components/complaints/EscalatedBadge";
import { StatusPill } from "@/components/ui/StatusPill";
import { useLanguage } from "@/context/LanguageContext";

interface ComplaintTableProps {
  complaints: Complaint[];
  showResponse?: boolean;
  allowRating?: boolean;
  onRated?: () => void;
}

export function ComplaintTable({ complaints, showResponse = false, allowRating = false, onRated }: ComplaintTableProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (complaints.length === 0) {
    return <div className="p-8 text-center text-gray-400 text-sm">No complaints found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-jucso-slate">
            {["ID", "Category", "Ministry", "Status", "Date"].map((h) => (
              <th
                key={h}
                scope="col"
                className="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {complaints.map((c, i) => (
            <Fragment key={c.id}>
              <tr
                className={`border-t border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              >
                <td className="px-4 py-3 text-jucso-teal font-bold whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 flex-wrap">
                    {c.id}
                    {c.urgent && (
                      <span className="text-red-500" title="Urgent">
                        ⚠
                      </span>
                    )}
                    {c.isConfidential && <ConfidentialBadge />}
                    {c.isEscalated && <EscalatedBadge />}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">{c.category}</td>
                <td className="px-4 py-3 font-semibold text-jucso-navy whitespace-nowrap">
                  {c.ministry}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={c.status} />
                </td>
                <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{c.date}</td>
              </tr>
              {expanded === c.id && (
                <tr className="border-t border-gray-100">
                  <td colSpan={5} className="px-4 py-3 bg-indigo-50">
                    <div className="text-gray-700 text-xs mb-2">
                      <strong>Description:</strong> {c.description}
                    </div>
                    <ComplaintAttachmentLink url={c.supportingDocumentUrl} className="mb-2 block" />
                    {c.status !== "Resolved" && c.isOverdue ? (
                      <p className="text-xs font-semibold text-red-600 mb-2">
                        {t("overdue")} — {t("slaDue", { date: c.dueAt ?? "" })}
                      </p>
                    ) : c.dueAt && c.status !== "Resolved" ? (
                      <p className="text-xs text-gray-500 mb-2">{t("slaDue", { date: c.dueAt })}</p>
                    ) : null}
                    {c.activity?.length ? (
                      <div className="mb-3">
                        <ComplaintActivityTimeline activity={c.activity} compact />
                      </div>
                    ) : null}
                    {showResponse && c.response && (
                      <div className="text-emerald-700 text-xs bg-emerald-50 rounded p-2">
                        <strong>Response:</strong> {c.response}
                      </div>
                    )}
                    {showResponse && !c.response && (
                      <div className="text-gray-400 text-xs italic">{t("noResponseYet")}</div>
                    )}
                    {(allowRating || c.satisfactionRating) && c.status === "Resolved" ? (
                      <ComplaintSatisfactionPanel complaint={c} onRated={onRated ? () => onRated() : undefined} />
                    ) : null}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
