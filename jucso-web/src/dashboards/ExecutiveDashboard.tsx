import { useEffect, useState } from "react";
import { useDashboardTab } from "@/hooks/useDashboardTab";
import { jucsoApi, type ExecutiveStats } from "@/api/jucsoApi";
import { useApp } from "@/context/AppContext";
import { exportComplaintsCsv } from "@/lib/exportComplaintsCsv";
import { exportSuggestionsCsv } from "@/lib/exportSuggestionsCsv";
import { Button } from "@/components/ui/Button";
import { ConfidentialBadge } from "@/components/complaints/ConfidentialBadge";
import { StatCard } from "@/components/ui/StatCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProfilePanel } from "@/components/profile/ProfilePanel";
import { SuggestionReviewPanel } from "@/components/suggestions/SuggestionReviewPanel";
import { useLanguage } from "@/context/LanguageContext";
import { EXECUTIVE_TABS, type TranslationKey } from "@/i18n/translations";

const DEFAULT_TAB: TranslationKey = "tabExecutiveOverview";

export function ExecutiveDashboard() {
  const { user, complaints, suggestions, apiEnabled, refreshPortalData } = useApp();
  if (!user) return null;

  const { t } = useLanguage();
  const [tab, setTab] = useDashboardTab(EXECUTIVE_TABS, DEFAULT_TAB);
  const [filterMin, setFilterMin] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<ExecutiveStats | null>(null);

  useEffect(() => {
    if (!apiEnabled) return;
    void jucsoApi.getExecutiveStats().then(setStats).catch(console.error);
  }, [apiEnabled, complaints]);

  const ministries = [...new Set(complaints.map((c) => c.ministry))];
  const filtered = complaints.filter((c) => {
    if (filterMin !== "All" && c.ministry !== filterMin) return false;
    if (filterStatus !== "All" && c.status !== filterStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.id.toLowerCase().includes(q) ||
      c.studentName.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  });

  const miniStats =
    stats?.ministry_stats ??
    ministries.map((m) => {
      const ministryComplaints = complaints.filter((c) => c.ministry === m);
      const resolved = ministryComplaints.filter((c) => c.status === "Resolved").length;
      return {
        name: m,
        total: ministryComplaints.length,
        pending: ministryComplaints.filter((c) => c.status === "Pending").length,
        resolved,
        rate: Math.round((resolved / Math.max(1, ministryComplaints.length)) * 100),
      };
    });

  const totalStats = [
    {
      icon: "📊",
      val: stats?.total_complaints ?? complaints.length,
      lab: "Total Complaints",
      color: "#1B2B6B",
    },
    {
      icon: "⚠️",
      val: stats?.urgent ?? complaints.filter((c) => c.urgent).length,
      lab: "Urgent",
      color: "#EF4444",
    },
    {
      icon: "🔓",
      val: stats?.open_issues ?? complaints.filter((c) => c.status !== "Resolved").length,
      lab: "Open Issues",
      color: "#F59E0B",
    },
    {
      icon: "✅",
      val: stats?.resolved ?? complaints.filter((c) => c.status === "Resolved").length,
      lab: "Resolved",
      color: "#10B981",
    },
  ];

  const urgentIssues =
    stats?.urgent_issues ?? complaints.filter((c) => c.urgent && c.status !== "Resolved");

  const rateColor = (rate: number) => (rate > 70 ? "#10B981" : rate > 40 ? "#F59E0B" : "#EF4444");

  return (
    <DashboardShell
      label={t("executiveDashboardLabel")}
      title={t("welcomeBack", { name: user.name.split(" ")[0] })}
      tabKeys={EXECUTIVE_TABS}
      activeTabKey={tab}
      getTabLabel={(key) => t(key)}
      onTabChange={setTab}
    >
      {tab === "tabExecutiveOverview" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {totalStats.map((s) => (
              <StatCard key={s.lab} icon={s.icon} value={s.val} label={s.lab} color={s.color} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl shadow-card p-5">
              <h2 className="font-display font-bold text-jucso-navy mb-4">Ministry Resolution Rates</h2>
              {miniStats.map((m) => (
                <div key={m.name} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-semibold">{m.name}</span>
                    <span className="text-gray-400">
                      {m.resolved}/{m.total} ({m.rate}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${m.rate}%`, background: rateColor(m.rate) }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-card p-5">
              <h2 className="font-display font-bold text-jucso-navy mb-4">Urgent Issues</h2>
              {urgentIssues.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No urgent open issues 🎉</p>
              ) : (
                urgentIssues.map((c) => (
                    <div key={c.id} className="flex items-start gap-3 mb-3 bg-red-50 rounded-lg p-3">
                      <span className="text-red-500 text-sm mt-0.5">⚠</span>
                      <div>
                        <div className="font-bold text-red-800 text-xs">
                          {c.id} — {c.ministry}
                        </div>
                        <p className="text-red-700 text-xs mt-0.5 leading-relaxed">{c.description}</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </>
      )}

      {tab === "tabExecutiveAllComplaints" && (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-display font-bold text-jucso-navy">All Complaints ({filtered.length})</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => exportComplaintsCsv(filtered)}>
                Export CSV
              </Button>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search complaints…"
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-jucso-teal"
                aria-label="Search complaints"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-jucso-teal"
                aria-label="Filter by status"
              >
                <option value="All">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <select
              value={filterMin}
              onChange={(e) => setFilterMin(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-jucso-teal"
              aria-label="Filter by ministry"
            >
              <option value="All">All Ministries</option>
              {ministries.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-jucso-slate">
                  {["ID", "Student", "Category", "Ministry", "Status", "Date"].map((h) => (
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
                {filtered.map((c, i) => (
                  <tr key={c.id} className={`border-t border-gray-50 ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                    <td className="px-4 py-3 text-jucso-teal font-bold">
                      <span className="inline-flex items-center gap-1 flex-wrap">
                        {c.id}
                        {c.urgent && <span className="text-red-500 ml-1">⚠</span>}
                        {c.isConfidential && <ConfidentialBadge />}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{c.studentName}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate">{c.category}</td>
                    <td className="px-4 py-3 font-semibold text-jucso-navy whitespace-nowrap">{c.ministry}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "tabExecutiveSuggestions" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => exportSuggestionsCsv(suggestions)}>
              Export suggestions CSV
            </Button>
          </div>
          <SuggestionReviewPanel
            suggestions={suggestions}
            apiEnabled={apiEnabled}
            onUpdated={() => void refreshPortalData()}
          />
        </div>
      )}

      {tab === "tabExecutiveMinistryStats" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {miniStats.map((m) => (
            <article key={m.name} className="bg-white rounded-xl p-5 shadow-card">
              <h3 className="font-display font-bold text-jucso-navy mb-4 text-sm">{m.name}</h3>
              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                {[
                  { v: m.total, l: "Total", c: "#1B2B6B" },
                  { v: m.pending, l: "Pending", c: "#F59E0B" },
                  { v: m.resolved, l: "Resolved", c: "#10B981" },
                ].map((s) => (
                  <div key={s.l} className="bg-jucso-slate rounded-lg p-2">
                    <div className="font-display font-bold text-lg" style={{ color: s.c }}>
                      {s.v}
                    </div>
                    <div className="text-[9px] text-gray-400 uppercase tracking-widest">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Resolution rate</span>
                <span className="font-bold" style={{ color: rateColor(m.rate) }}>
                  {m.rate}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${m.rate}%`, background: rateColor(m.rate) }}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === "tabExecutiveProfile" && <ProfilePanel />}
    </DashboardShell>
  );
}
