import { useEffect, useState } from "react";
import { jucsoApi, type AdminOverview, type AdminUserRow } from "@/api/jucsoApi";
import { DEMO_USERS } from "@/constants/mock-data";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardShell } from "@/components/layout/DashboardShell";

const TABS = ["overview", "users", "content", "system"] as const;
type AdminTab = (typeof TABS)[number];

const SYSTEM_STATUS = [
  { lab: "Web Server", val: "Running", ok: true },
  { lab: "Database", val: "Connected", ok: true },
  { lab: "Last Backup", val: "Jun 28, 06:00 AM", ok: true },
  { lab: "SSL Certificate", val: "Valid (Let's Encrypt)", ok: true },
  { lab: "Storage Used", val: "2.1 GB / 10 GB", ok: true },
] as const;

const SYSTEM_TOOLS = [
  { title: "Database Backup", desc: "Last backup: Today at 06:00 AM", action: "Run Backup Now", icon: "💾" },
  { title: "Security Updates", desc: "All packages up to date", action: "Check for Updates", icon: "🔒" },
  { title: "Error Logs", desc: "0 critical errors in last 24h", action: "View Logs", icon: "📝" },
  { title: "Performance Monitor", desc: "Average page load: 1.2s", action: "View Report", icon: "⚡" },
] as const;

function roleBadgeVariant(role: string): "gold" | "teal" | "navy" | "gray" {
  if (role === "admin") return "gold";
  if (role === "executive") return "teal";
  if (role === "minister") return "navy";
  return "gray";
}

export function AdminDashboard() {
  const { complaints, suggestions, clubs, events, news, documents, apiEnabled } = useApp();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserRow[]>([]);

  useEffect(() => {
    if (!apiEnabled) return;
    void Promise.all([jucsoApi.getAdminOverview(), jucsoApi.getAdminUsers()])
      .then(([overviewData, usersData]) => {
        setOverview(overviewData);
        setAdminUsers(usersData);
      })
      .catch(console.error);
  }, [apiEnabled, complaints, suggestions]);

  const mockUsers = Object.values(DEMO_USERS);
  const users = apiEnabled && adminUsers.length > 0 ? adminUsers : mockUsers;

  const overviewStats = [
    {
      icon: "👥",
      val: overview?.total_users ?? mockUsers.length,
      lab: "Total Users",
      color: "#1B2B6B",
    },
    {
      icon: "📋",
      val: overview?.total_complaints ?? complaints.length,
      lab: "Total Complaints",
      color: "#00B4C6",
    },
    {
      icon: "💡",
      val: overview?.total_suggestions ?? suggestions.length,
      lab: "Suggestions",
      color: "#F5A623",
    },
    { icon: "💚", val: "99%", lab: "System Health", color: "#10B981" },
  ];

  const activitySummary = [
    { lab: "Active Clubs", val: overview?.active_clubs ?? clubs.length },
    { lab: "Upcoming Events", val: overview?.upcoming_events ?? events.length },
    {
      lab: "Open Complaints",
      val: overview?.open_complaints ?? complaints.filter((c) => c.status !== "Resolved").length,
    },
    {
      lab: "Suggestions Pending",
      val: overview?.pending_suggestions ?? suggestions.filter((s) => s.status !== "Implemented").length,
    },
    {
      lab: "Registered Students",
      val: overview?.registered_students ?? mockUsers.filter((u) => u.role === "student").length,
    },
  ];

  return (
    <DashboardShell
      label="Admin Panel"
      title="System Administration"
      tabs={[...TABS]}
      activeTab={tab}
      onTabChange={(t) => setTab(t as AdminTab)}
    >
      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {overviewStats.map((s) => (
              <StatCard key={s.lab} icon={s.icon} value={s.val} label={s.lab} color={s.color} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl shadow-card p-5">
              <h2 className="font-display font-extrabold text-jucso-navy mb-4">System Status</h2>
              <ul>
                {SYSTEM_STATUS.map((s) => (
                  <li
                    key={s.lab}
                    className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-gray-600 text-xs">{s.lab}</span>
                    <span className={`text-xs font-semibold ${s.ok ? "text-emerald-600" : "text-red-600"}`}>
                      {s.ok ? "✓ " : ""}
                      {s.val}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-card p-5">
              <h2 className="font-display font-extrabold text-jucso-navy mb-4">Activity Summary</h2>
              <ul>
                {activitySummary.map((s) => (
                  <li
                    key={s.lab}
                    className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-gray-600 text-xs">{s.lab}</span>
                    <span className="text-jucso-navy text-sm font-display font-extrabold">{s.val}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {tab === "users" && (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <h2 className="px-5 py-4 border-b border-gray-100 font-display font-extrabold text-jucso-navy">
            Registered Users ({users.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-jucso-slate">
                  {["Reg Number", "Name", "Role", "Ministry", "Status"].map((h) => (
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
                {users.map((u, i) => (
                  <tr key={u.reg} className={`border-t border-gray-50 ${i % 2 === 1 ? "bg-gray-50/50" : ""}`}>
                    <td className="px-4 py-3 text-jucso-teal font-bold">{u.reg}</td>
                    <td className="px-4 py-3 text-gray-700">{u.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={roleBadgeVariant(u.role)}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.ministry ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold text-xs ${
                          "isActive" in u && u.isActive === false ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {"isActive" in u && u.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "content" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="font-display font-extrabold text-jucso-navy mb-4">
              News & Announcements ({news.length})
            </h2>
            <ul>
              {news.slice(0, 4).map((n) => (
                <li key={n.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-jucso-navy font-semibold text-xs truncate">{n.title}</div>
                    <div className="text-gray-400 text-[10px] mt-0.5">
                      {n.tag} · {n.date}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Button variant="teal" size="sm">
                + Add Announcement
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="font-display font-extrabold text-jucso-navy mb-4">Documents ({documents.length})</h2>
            <ul>
              {documents.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-jucso-navy font-semibold text-xs truncate">{d.name}</div>
                    <div className="text-gray-400 text-[10px] mt-0.5">
                      {d.size} · {d.date}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Replace
                  </Button>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Button variant="teal" size="sm">
                + Upload Document
              </Button>
            </div>
          </div>
        </div>
      )}

      {tab === "system" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SYSTEM_TOOLS.map((s) => (
            <article key={s.title} className="bg-white rounded-xl p-5 shadow-card">
              <div className="text-3xl mb-3" aria-hidden>
                {s.icon}
              </div>
              <h3 className="font-display font-extrabold text-jucso-navy mb-1 text-sm">{s.title}</h3>
              <p className="text-gray-500 text-xs mb-4">{s.desc}</p>
              <Button variant="outline" size="sm">
                {s.action}
              </Button>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
