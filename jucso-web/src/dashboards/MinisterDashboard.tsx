import { useEffect, useState } from "react";
import { useDashboardTab } from "@/hooks/useDashboardTab";
import { exportComplaintsCsv } from "@/lib/exportComplaintsCsv";
import { jucsoApi } from "@/api/jucsoApi";
import { useApp } from "@/context/AppContext";
import type { ComplaintStatus } from "@/types";
import type { MinisterWorkloadResponse } from "@/api/types";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/FormFields";
import { StatCard } from "@/components/ui/StatCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { ComplaintActivityTimeline } from "@/components/complaints/ComplaintActivityTimeline";
import { ComplaintAttachmentLink } from "@/components/complaints/ComplaintAttachmentLink";
import { ConfidentialBadge } from "@/components/complaints/ConfidentialBadge";
import { EscalatedBadge } from "@/components/complaints/EscalatedBadge";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProfilePanel } from "@/components/profile/ProfilePanel";
import { SuggestionReviewPanel } from "@/components/suggestions/SuggestionReviewPanel";
import { useLanguage } from "@/context/LanguageContext";
import { MINISTER_TABS, type TranslationKey } from "@/i18n/translations";

const DEFAULT_TAB: TranslationKey = "tabMinisterIncoming";

export function MinisterDashboard() {
  const { user, complaints, setComplaints, suggestions, apiEnabled, refreshPortalData } = useApp();
  const { t } = useLanguage();
  const [tab, setTab] = useDashboardTab(MINISTER_TABS, DEFAULT_TAB);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [forwardMinistry, setForwardMinistry] = useState("");
  const [ministries, setMinistries] = useState<Array<{ id: number; name: string }>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [workload, setWorkload] = useState<MinisterWorkloadResponse | null>(null);
  const [escalating, setEscalating] = useState(false);

  useEffect(() => {
    if (!apiEnabled) return;
    void jucsoApi.getMinistries().then(setMinistries).catch(console.error);
  }, [apiEnabled]);

  useEffect(() => {
    if (!apiEnabled || tab !== "tabMinisterOverview") return;
    void jucsoApi.getMinisterWorkload().then(setWorkload).catch(console.error);
  }, [apiEnabled, tab]);

  if (!user?.ministry) return null;

  const myComplaints = complaints.filter((c) => c.ministry === user.ministry);
  const selected = complaints.find((c) => c.id === selectedId);

  const respond = async (id: string, status: ComplaintStatus) => {
    if (apiEnabled) {
      await jucsoApi.updateComplaint(id, { status, response: responseText || undefined });
      await refreshPortalData();
    } else {
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status, response: responseText || c.response } : c)),
      );
    }
    setSelectedId(null);
    setResponseText("");
    setForwardMinistry("");
  };

  const forward = async (id: string) => {
    if (!forwardMinistry || forwardMinistry === user.ministry) return;
    if (apiEnabled) {
      await jucsoApi.updateComplaint(id, { ministry: forwardMinistry });
      await refreshPortalData();
    } else {
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ministry: forwardMinistry, status: "Pending" } : c)),
      );
    }
    setSelectedId(null);
    setResponseText("");
    setForwardMinistry("");
  };

  const escalate = async (id: string) => {
    if (!apiEnabled) return;
    setEscalating(true);
    try {
      await jucsoApi.escalateComplaint(id);
      await refreshPortalData();
    } catch (error) {
      console.error(error);
    } finally {
      setEscalating(false);
    }
  };

  const stats = workload
    ? [
        { icon: "📋", val: workload.open_count, lab: t("openCases"), color: "#1B2B6B" },
        { icon: "✅", val: workload.resolved_this_week, lab: t("resolvedThisWeek"), color: "#10B981" },
        { icon: "⏰", val: workload.overdue_count, lab: t("overdueSla"), color: "#EF4444" },
        { icon: "⚠", val: workload.urgent_open, lab: t("urgentOpen"), color: "#F59E0B" },
      ]
    : [
        { icon: "📋", val: myComplaints.length, lab: "Total Assigned", color: "#1B2B6B" },
        { icon: "⏳", val: myComplaints.filter((c) => c.status === "Pending").length, lab: "Pending", color: "#6B7280" },
        { icon: "🔄", val: myComplaints.filter((c) => c.status === "In Progress").length, lab: "In Progress", color: "#F59E0B" },
        { icon: "✅", val: myComplaints.filter((c) => c.status === "Resolved").length, lab: "Resolved", color: "#10B981" },
      ];

  const filtered =
    tab === "tabMinisterIncoming"
      ? myComplaints.filter((c) => c.status !== "Resolved")
      : myComplaints.filter((c) => c.status === "Resolved");

  const statusFiltered =
    tab === "tabMinisterIncoming" && statusFilter !== "All"
      ? filtered.filter((c) => c.status === statusFilter)
      : filtered;

  const searched = searchQuery.trim()
    ? statusFiltered.filter((c) => {
        const q = searchQuery.toLowerCase();
        return (
          c.id.toLowerCase().includes(q) ||
          c.studentName.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        );
      })
    : statusFiltered;

  return (
    <DashboardShell
      label={t("ministerDashboard", { ministry: user.ministry })}
      title={t("welcomeBack", { name: user.name.split(" ")[0] })}
      tabKeys={MINISTER_TABS}
      activeTabKey={tab}
      getTabLabel={(key) => t(key)}
      onTabChange={setTab}
    >
      {tab === "tabMinisterOverview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <StatCard key={s.lab} icon={s.icon} value={s.val} label={s.lab} color={s.color} />
          ))}
        </div>
      )}

      {(tab === "tabMinisterIncoming" || tab === "tabMinisterResolved") && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <div className="md:col-span-3 bg-white rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-display font-bold text-jucso-navy">
                {tab === "tabMinisterIncoming" ? "Pending & In Progress" : "Resolved Cases"}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportComplaintsCsv(
                    searched,
                    `jucso-${user.ministry?.toLowerCase().replace(/\s+/g, "-") ?? "ministry"}-complaints.csv`,
                  )
                }
              >
                Export CSV
              </Button>
            </div>
            <div className="px-5 py-3 border-b border-gray-50 flex flex-col sm:flex-row gap-2">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, student, category…"
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-jucso-teal"
                aria-label="Search complaints"
              />
              {tab === "tabMinisterIncoming" && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-jucso-teal bg-white"
                  aria-label="Filter by status"
                >
                  <option value="All">All open</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                </select>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-jucso-slate">
                    {["ID", "Student", "Description", "Status"].map((h) => (
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
                  {searched.map((c, i) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={`border-t border-gray-50 cursor-pointer hover:bg-indigo-50 transition-colors ${
                        selectedId === c.id ? "bg-indigo-50" : i % 2 === 1 ? "bg-gray-50/50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-jucso-teal font-bold">
                        <span className="inline-flex items-center gap-1 flex-wrap">
                          {c.id}
                          {c.urgent && <span className="text-red-500 ml-1">⚠</span>}
                          {c.isOverdue && <span className="text-red-600 text-[10px] font-bold ml-1">{t("suggestionOverdue")}</span>}
                          {c.isConfidential && <ConfidentialBadge />}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{c.studentName}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{c.description}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:col-span-2">
            {selected ? (
              <div className="bg-white rounded-xl p-5 shadow-card">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <h3 className="font-display font-bold text-jucso-navy text-sm">Complaint {selected.id}</h3>
                  <div className="flex items-center gap-2">
                    {selected.isConfidential && <ConfidentialBadge />}
                    {selected.isEscalated && <EscalatedBadge />}
                    <StatusPill status={selected.status} />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-1">
                  From: <span className="font-semibold text-gray-700">{selected.studentName}</span> (
                  {selected.studentReg})
                </p>
                <p className="text-xs text-gray-400 mb-3">Filed: {selected.date}</p>
                {selected.isOverdue ? (
                  <p className="text-xs font-semibold text-red-600 mb-2">Overdue — due {selected.dueAt}</p>
                ) : selected.dueAt ? (
                  <p className="text-xs text-gray-500 mb-2">SLA due: {selected.dueAt}</p>
                ) : null}
                <div className="bg-jucso-slate rounded-lg p-3 mb-4">
                  <div className="font-semibold text-jucso-navy text-xs mb-1">{selected.category}</div>
                  <p className="text-gray-600 text-xs leading-relaxed">{selected.description}</p>
                </div>
                <ComplaintAttachmentLink url={selected.supportingDocumentUrl} className="mb-4" />
                {selected.response && (
                  <div className="bg-emerald-50 rounded-lg p-3 mb-4">
                    <p className="text-emerald-700 text-xs">
                      <strong>Previous response:</strong> {selected.response}
                    </p>
                  </div>
                )}
                {selected.activity?.length ? (
                  <ComplaintActivityTimeline activity={selected.activity} compact />
                ) : null}
                <Textarea
                  label="Write Response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={3}
                  placeholder="Type your response to the student..."
                />
                <div className="flex gap-2 flex-wrap mb-4">
                  <Button size="sm" variant="teal" onClick={() => respond(selected.id, "In Progress")}>
                    Mark In Progress
                  </Button>
                  <Button size="sm" variant="navy" onClick={() => respond(selected.id, "Resolved")}>
                    Mark Resolved
                  </Button>
                  {!selected.isEscalated && selected.status !== "Resolved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={escalating}
                      onClick={() => void escalate(selected.id)}
                    >
                      {escalating ? "Escalating…" : "Escalate to Executive"}
                    </Button>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <Select
                    label="Forward to ministry"
                    value={forwardMinistry}
                    onChange={(e) => setForwardMinistry(e.target.value)}
                  >
                    <option value="">Select ministry…</option>
                    {ministries
                      .filter((m) => m.name !== user.ministry)
                      .map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                  </Select>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    disabled={!forwardMinistry}
                    onClick={() => void forward(selected.id)}
                  >
                    Forward complaint
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm shadow-card">
                Select a complaint to respond
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "tabMinisterSuggestions" && (
        <SuggestionReviewPanel
          suggestions={suggestions}
          apiEnabled={apiEnabled}
          onUpdated={() => void refreshPortalData()}
        />
      )}

      {tab === "tabMinisterProfile" && <ProfilePanel />}
    </DashboardShell>
  );
}
