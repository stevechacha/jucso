import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/api/client";
import { jucsoApi, type AdminOverview, type AdminUserRow } from "@/api/jucsoApi";
import { DEMO_USERS } from "@/constants/mock-data";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/FormFields";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardShell } from "@/components/layout/DashboardShell";

const TABS = ["overview", "users", "content", "system"] as const;
type AdminTab = (typeof TABS)[number];
const USERS_PER_PAGE = 7;

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

function AddStaffForm({ onCreated }: { onCreated: (user: AdminUserRow) => void }) {
  const [open, setOpen] = useState(false);
  const [ministries, setMinistries] = useState<Array<{ id: number; name: string }>>([]);
  const [form, setForm] = useState({
    reg_number: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "minister" as "minister" | "executive",
    ministry: "",
    phone_number: "",
  });
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    void jucsoApi.getMinistries().then(setMinistries).catch(console.error);
  }, [open]);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setSuccess("");

    try {
      const user = await jucsoApi.createStaff({
        reg_number: form.reg_number.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        ministry: form.role === "minister" ? form.ministry : undefined,
        phone_number: form.phone_number.trim() || undefined,
      });
      onCreated(user);
      setSuccess(`${user.name} added as ${user.role}.`);
      setForm({
        reg_number: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "minister",
        ministry: "",
        phone_number: "",
      });
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not add staff member.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div className="bg-white rounded-xl shadow-card p-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-jucso-navy text-sm">Staff accounts</h2>
          <p className="text-gray-500 text-xs mt-1">Add ministers and executives. Students register themselves.</p>
        </div>
        <Button variant="teal" size="sm" onClick={() => setOpen(true)}>
          + Add Staff
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-jucso-navy">Add Staff Member</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">
          Close
        </button>
      </div>
      <form onSubmit={(e) => void submit(e)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
          <Input label="PF Number" value={form.reg_number} onChange={(e) => update("reg_number", e.target.value)} placeholder="e.g. MIN/ACAD/002" required />
          <Select label="Role" value={form.role} onChange={(e) => update("role", e.target.value)}>
            <option value="minister">Minister</option>
            <option value="executive">Executive</option>
          </Select>
          <Input label="First Name" value={form.first_name} onChange={(e) => update("first_name", e.target.value)} required />
          <Input label="Last Name" value={form.last_name} onChange={(e) => update("last_name", e.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          <Input label="Phone (optional)" value={form.phone_number} onChange={(e) => update("phone_number", e.target.value)} />
          {form.role === "minister" && (
            <Select label="Ministry" value={form.ministry} onChange={(e) => update("ministry", e.target.value)} required>
              <option value="">Select ministry</option>
              {ministries.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </Select>
          )}
          <Input label="Temporary Password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} minLength={8} required />
        </div>
        {err && <p className="text-xs text-red-600 mb-3 bg-red-50 rounded-lg p-2">{err}</p>}
        {success && <p className="text-xs text-emerald-700 mb-3 bg-emerald-50 rounded-lg p-2">{success}</p>}
        <Button type="submit" variant="navy" size="sm" disabled={loading}>
          {loading ? "Saving…" : "Create Staff Account"}
        </Button>
      </form>
    </div>
  );
}

function UploadDocumentForm({ onUploaded }: { onUploaded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !file) {
      setErr("Document name and file are required.");
      return;
    }
    setLoading(true);
    setErr("");
    setSuccess("");
    try {
      await jucsoApi.uploadDocument({ name: name.trim(), file });
      setSuccess(`Uploaded “${name.trim()}”.`);
      setName("");
      setFile(null);
      onUploaded();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button variant="teal" size="sm" onClick={() => setOpen(true)}>
        + Upload Document
      </Button>
    );
  }

  return (
    <div className="mt-4 border border-gray-100 rounded-xl p-4 bg-jucso-slate/40">
      <h3 className="font-display font-bold text-jucso-navy text-sm mb-3">Upload to Supabase Storage</h3>
      <form onSubmit={(e) => void submit(e)}>
        <Input label="Document name" value={name} onChange={(e) => setName(e.target.value)} required />
        <label className="block mb-4">
          <span className="block text-xs font-semibold text-gray-600 mb-1.5">File</span>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-xs text-gray-600"
            required
          />
        </label>
        {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
        {success && <p className="text-xs text-emerald-700 mb-2">{success}</p>}
        <div className="flex gap-2">
          <Button type="submit" variant="navy" size="sm" disabled={loading}>
            {loading ? "Uploading…" : "Upload"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </form>
    </div>
  );
}

export function AdminDashboard() {
  const { complaints, suggestions, clubs, events, news, documents, apiEnabled, refreshPortalData } = useApp();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserRow[]>([]);
  const [userPage, setUserPage] = useState(1);

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
  const totalUserPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
  const currentUserPage = Math.min(userPage, totalUserPages);
  const pageUsers = users.slice(
    (currentUserPage - 1) * USERS_PER_PAGE,
    currentUserPage * USERS_PER_PAGE,
  );

  useEffect(() => {
    setUserPage(1);
  }, [users.length, tab]);

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
              <h2 className="font-display font-bold text-jucso-navy mb-4">System Status</h2>
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
              <h2 className="font-display font-bold text-jucso-navy mb-4">Activity Summary</h2>
              <ul>
                {activitySummary.map((s) => (
                  <li
                    key={s.lab}
                    className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-gray-600 text-xs">{s.lab}</span>
                    <span className="text-jucso-navy text-sm font-display font-bold">{s.val}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {tab === "users" && (
        <div className="space-y-5">
          {apiEnabled && (
            <AddStaffForm
              onCreated={(user) => {
                setAdminUsers((prev) => [user, ...prev]);
              }}
            />
          )}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <h2 className="px-5 py-4 border-b border-gray-100 font-display font-bold text-jucso-navy">
              Registered Users ({users.length})
            </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-jucso-slate">
                  {["PF / Reg Number", "Name", "Role", "Ministry", "Status"].map((h) => (
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
                {pageUsers.map((u, i) => (
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
          {users.length > USERS_PER_PAGE && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                Showing {(currentUserPage - 1) * USERS_PER_PAGE + 1}–
                {Math.min(currentUserPage * USERS_PER_PAGE, users.length)} of {users.length}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentUserPage <= 1}
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                >
                  ← Previous
                </Button>
                <span className="text-xs font-semibold text-jucso-navy min-w-[4.5rem] text-center">
                  Page {currentUserPage} / {totalUserPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentUserPage >= totalUserPages}
                  onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {tab === "content" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="font-display font-bold text-jucso-navy mb-4">
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
            <h2 className="font-display font-bold text-jucso-navy mb-4">Documents ({documents.length})</h2>
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
              {apiEnabled ? (
                <UploadDocumentForm onUploaded={() => void refreshPortalData()} />
              ) : (
                <Button variant="teal" size="sm" disabled>
                  + Upload Document
                </Button>
              )}
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
              <h3 className="font-display font-bold text-jucso-navy mb-1 text-sm">{s.title}</h3>
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
