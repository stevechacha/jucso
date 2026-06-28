import { Fragment, useState } from "react";
import type { Complaint } from "@/types";
import { StatusPill } from "@/components/ui/StatusPill";

interface ComplaintTableProps {
  complaints: Complaint[];
  showResponse?: boolean;
}

export function ComplaintTable({ complaints, showResponse = false }: ComplaintTableProps) {
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
                  {c.id}
                  {c.urgent && (
                    <span className="ml-1 text-red-500" title="Urgent">
                      ⚠
                    </span>
                  )}
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
                    {showResponse && c.response && (
                      <div className="text-emerald-700 text-xs bg-emerald-50 rounded p-2">
                        <strong>Response:</strong> {c.response}
                      </div>
                    )}
                    {showResponse && !c.response && (
                      <div className="text-gray-400 text-xs italic">No response yet.</div>
                    )}
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
