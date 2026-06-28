import { generateStaffTempPassword } from "@/lib/generateTempPassword";
import { downloadJsonBackup, getLastBackupLabel } from "@/lib/downloadJsonBackup";
import { useDashboardTab } from "@/hooks/useDashboardTab";
import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/api/client";
import { jucsoApi, type AdminOverview, type AdminUserRow } from "@/api/jucsoApi";
import type { AdminSystemStatusResponse } from "@/api/types";
import { DEMO_USERS } from "@/constants/mock-data";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/FormFields";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SuggestionReviewPanel } from "@/components/suggestions/SuggestionReviewPanel";
import type { NewsItem } from "@/types";

const TABS = ["overview", "users", "content", "system"] as const;
type AdminTab = (typeof TABS)[number];
const USERS_PER_PAGE = 7;

const SYSTEM_STATUS_FALLBACK = [
  { lab: "API", val: "Unknown", ok: true },
  { lab: "Database", val: "Unknown", ok: true },
  { lab: "Email", val: "Unknown", ok: true },
  { lab: "SMS", val: "Not configured", ok: true },
  { lab: "File Storage", val: "Unknown", ok: true },
  { lab: "SSL", val: "Unknown", ok: true },
] as const;

const SYSTEM_TOOLS = [
  { id: "backup", title: "Database Backup", action: "Run Backup Now", icon: "💾" },
  { id: "security", title: "Security Updates", action: "Check for Updates", icon: "🔒" },
  { id: "logs", title: "Error Logs", action: "View Logs", icon: "📝" },
  { id: "performance", title: "Performance Monitor", action: "View Report", icon: "⚡" },
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
    setForm((prev) => (prev.password ? prev : { ...prev, password: generateStaffTempPassword() }));
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
      setSuccess(
        `${user.name} added as ${user.role}. Share the temporary password in person or a secure channel — they must change it on first login.`,
      );
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
          <div className="md:col-span-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Temporary Password"
                  type="text"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mb-0.5 shrink-0"
                onClick={() => update("password", generateStaffTempPassword())}
              >
                Regenerate
              </Button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Auto-generated format: JUCSO-xxxxxxxxxx! — share once, then the staff member sets their own password at first login.
            </p>
          </div>
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

function AddNewsForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tag, setTag] = useState("Announcement");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setSuccess("");
    try {
      await jucsoApi.createNews({ title: title.trim(), excerpt: excerpt.trim(), tag });
      setSuccess(`Published “${title.trim()}”.`);
      setTitle("");
      setExcerpt("");
      setTag("Announcement");
      onCreated();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not publish announcement.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button variant="teal" size="sm" onClick={() => setOpen(true)}>
        + Add Announcement
      </Button>
    );
  }

  return (
    <div className="mt-4 border border-gray-100 rounded-xl p-4 bg-jucso-slate/40">
      <h3 className="font-display font-bold text-jucso-navy text-sm mb-3">New announcement</h3>
      <form onSubmit={(e) => void submit(e)}>
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea label="Summary" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} required />
        <Select label="Category" value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="Announcement">Announcement</option>
          <option value="Events">Events</option>
          <option value="Clubs">Clubs</option>
          <option value="Notice">Notice</option>
        </Select>
        {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
        {success && <p className="text-xs text-emerald-700 mb-2">{success}</p>}
        <div className="flex gap-2">
          <Button type="submit" variant="navy" size="sm" disabled={loading}>
            {loading ? "Publishing…" : "Publish"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </form>
    </div>
  );
}

function EditNewsForm({
  item,
  onSaved,
  onCancel,
}: {
  item: NewsItem;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [excerpt, setExcerpt] = useState(item.excerpt);
  const [tag, setTag] = useState(item.tag);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await jucsoApi.updateNews(item.id, {
        title: title.trim(),
        excerpt: excerpt.trim(),
        tag,
      });
      onSaved();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not update announcement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-3 border border-indigo-100 rounded-xl p-4 bg-indigo-50/40">
      <h4 className="font-display font-bold text-jucso-navy text-xs mb-3">Edit {item.id}</h4>
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Textarea label="Summary" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} required />
      <Select label="Category" value={tag} onChange={(e) => setTag(e.target.value as NewsItem["tag"])}>
        <option value="Announcement">Announcement</option>
        <option value="Events">Events</option>
        <option value="Clubs">Clubs</option>
        <option value="Notice">Notice</option>
      </Select>
      {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="navy" size="sm" disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function SystemToolsPanel({ apiEnabled }: { apiEnabled: boolean }) {
  const [lastBackup, setLastBackup] = useState<string | null>(() => getLastBackupLabel());
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMsg, setBackupMsg] = useState("");
  const [systemStatus, setSystemStatus] = useState<AdminSystemStatusResponse | null>(null);

  useEffect(() => {
    if (!apiEnabled) return;
    void jucsoApi.getSystemStatus().then(setSystemStatus).catch(console.error);
  }, [apiEnabled]);

  const runBackup = async () => {
    if (!apiEnabled) return;
    setBackupLoading(true);
    setBackupMsg("");
    try {
      const data = await jucsoApi.downloadPortalBackup();
      downloadJsonBackup(data);
      setLastBackup(getLastBackupLabel());
      setBackupMsg("Backup downloaded successfully.");
    } catch (error) {
      setBackupMsg(error instanceof ApiError ? error.message : "Backup failed.");
    } finally {
      setBackupLoading(false);
    }
  };

  const toolDesc = (id: (typeof SYSTEM_TOOLS)[number]["id"]) => {
    if (id === "backup") {
      return lastBackup ? `Last backup: ${lastBackup}` : "No backup downloaded yet from this browser.";
    }
    if (id === "security") {
      if (!systemStatus) return "Checking email, SMS, and SSL configuration…";
      return [
        `Email: ${systemStatus.email_configured ? "configured" : "not configured"}`,
        `SMS: ${systemStatus.sms_configured ? "configured" : "not configured"}`,
        `SSL: ${systemStatus.ssl_enabled ? "enabled" : "disabled"}`,
      ].join(" · ");
    }
    if (id === "logs") {
      return systemStatus?.debug
        ? "Debug mode is on — use Railway deployment logs in production."
        : "View application logs in your Railway deployment dashboard.";
    }
    return systemStatus
      ? `API ${systemStatus.api} · Database ${systemStatus.database}`
      : "Checking API and database connectivity…";
  };

  return (
    <div className="space-y-4">
      {backupMsg && <p className="text-xs text-jucso-navy bg-jucso-slate rounded-lg px-3 py-2">{backupMsg}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SYSTEM_TOOLS.map((s) => (
          <article key={s.id} className="bg-white rounded-xl p-5 shadow-card">
            <div className="text-3xl mb-3" aria-hidden>
              {s.icon}
            </div>
            <h3 className="font-display font-bold text-jucso-navy mb-1 text-sm">{s.title}</h3>
            <p className="text-gray-500 text-xs mb-4">{toolDesc(s.id)}</p>
            <Button
              variant="outline"
              size="sm"
              disabled={s.id === "backup" ? !apiEnabled || backupLoading : true}
              onClick={s.id === "backup" ? () => void runBackup() : undefined}
            >
              {s.id === "backup" && backupLoading ? "Exporting…" : s.action}
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}

function ContactInboxPanel() {
  const [messages, setMessages] = useState<
    Array<{ id: string; name: string; email: string; subject: string; message: string; date: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void jucsoApi
      .getContactMessages()
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <h2 className="font-display font-bold text-jucso-navy mb-4">Contact Inbox ({messages.length})</h2>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading messages…</p>
      ) : messages.length === 0 ? (
        <p className="text-gray-400 text-sm">No contact messages yet.</p>
      ) : (
        <ul className="max-h-80 overflow-y-auto">
          {messages.map((m) => (
            <li key={m.id} className="py-3 border-b border-gray-50 last:border-0">
              <div className="flex justify-between gap-2 text-xs mb-1">
                <span className="font-semibold text-jucso-navy">{m.subject}</span>
                <span className="text-gray-400 whitespace-nowrap">{m.date}</span>
              </div>
              <div className="text-[10px] text-gray-500 mb-1">
                {m.name} · {m.email}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddClubForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", leader: "", category: "Academic" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await jucsoApi.createClub({
        name: form.name.trim(),
        description: form.description.trim(),
        leader: form.leader.trim(),
        category: form.category,
      });
      setForm({ name: "", description: "", leader: "", category: "Academic" });
      onCreated();
      setOpen(false);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not create club.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button variant="teal" size="sm" onClick={() => setOpen(true)}>
        + Add Club
      </Button>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-4 border border-gray-100 rounded-xl p-4 bg-jucso-slate/40">
      <h3 className="font-display font-bold text-jucso-navy text-sm mb-3">New club</h3>
      <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <Input
        label="Leader"
        value={form.leader}
        onChange={(e) => setForm({ ...form, leader: e.target.value })}
        required
      />
      <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
        <option value="Academic">Academic</option>
        <option value="Sports">Sports</option>
        <option value="Arts">Arts</option>
        <option value="Social">Social</option>
      </Select>
      <Textarea
        label="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
        required
      />
      {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="navy" size="sm" disabled={loading}>
          {loading ? "Saving…" : "Create club"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
    </form>
  );
}

function AddEventForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    event_date: "",
    capacity: "50",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await jucsoApi.createEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        event_date: form.event_date,
        capacity: parseInt(form.capacity, 10),
      });
      setForm({ title: "", description: "", location: "", event_date: "", capacity: "50" });
      onCreated();
      setOpen(false);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not create event.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button variant="teal" size="sm" onClick={() => setOpen(true)}>
        + Add Event
      </Button>
    );
  }

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-4 border border-gray-100 rounded-xl p-4 bg-jucso-slate/40">
      <h3 className="font-display font-bold text-jucso-navy text-sm mb-3">New event</h3>
      <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      <Input
        label="Location"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        required
      />
      <Input
        label="Date"
        type="date"
        value={form.event_date}
        onChange={(e) => setForm({ ...form, event_date: e.target.value })}
        required
      />
      <Input
        label="Capacity"
        type="number"
        min={1}
        value={form.capacity}
        onChange={(e) => setForm({ ...form, capacity: e.target.value })}
        required
      />
      <Textarea
        label="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
        required
      />
      {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="navy" size="sm" disabled={loading}>
          {loading ? "Saving…" : "Create event"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
    </form>
  );
}

export function AdminDashboard() {
  const { complaints, suggestions, clubs, events, news, documents, apiEnabled, refreshPortalData } = useApp();
  const [tab, setTab] = useDashboardTab(TABS, "overview");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserRow[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [deletingNewsId, setDeletingNewsId] = useState<string | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<AdminSystemStatusResponse | null>(null);

  useEffect(() => {
    if (!apiEnabled) return;
    void jucsoApi.getSystemStatus().then(setSystemStatus).catch(console.error);
  }, [apiEnabled]);

  const systemStatusRows = systemStatus
    ? [
        { lab: "API", val: systemStatus.api === "ok" ? "Running" : systemStatus.api, ok: systemStatus.api === "ok" },
        {
          lab: "Database",
          val: systemStatus.database === "connected" ? "Connected" : systemStatus.database,
          ok: systemStatus.database === "connected",
        },
        {
          lab: "Email",
          val: systemStatus.email_configured ? "Configured" : "Not configured",
          ok: systemStatus.email_configured,
        },
        {
          lab: "SMS",
          val: systemStatus.sms_configured ? "Configured" : "Not configured",
          ok: systemStatus.sms_configured,
        },
        {
          lab: "File Storage",
          val: systemStatus.storage_configured ? "Supabase connected" : "Not configured",
          ok: systemStatus.storage_configured,
        },
        {
          lab: "SSL",
          val: systemStatus.ssl_enabled ? "Enabled" : "Disabled",
          ok: systemStatus.ssl_enabled,
        },
        {
          lab: "Last Backup",
          val: getLastBackupLabel() ?? "Not downloaded in this browser",
          ok: Boolean(getLastBackupLabel()),
        },
      ]
    : [...SYSTEM_STATUS_FALLBACK];

  const removeNews = async (id: string) => {
    if (!window.confirm("Remove this announcement from the site?")) return;
    setDeletingNewsId(id);
    try {
      await jucsoApi.deleteNews(id);
      await refreshPortalData();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingNewsId(null);
    }
  };

  const removeDocument = async (id: string) => {
    if (!window.confirm("Remove this document from the site?")) return;
    setDeletingDocId(id);
    try {
      await jucsoApi.deleteDocument(id);
      await refreshPortalData();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingDocId(null);
    }
  };

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

  const toggleUserActive = async (row: AdminUserRow) => {
    if (!apiEnabled) return;
    try {
      const updated = await jucsoApi.setUserActive(row.reg, !row.isActive);
      setAdminUsers((prev) => prev.map((u) => (u.reg === updated.reg ? updated : u)));
    } catch (error) {
      console.error(error);
    }
  };

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
                {systemStatusRows.map((s) => (
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
                      {apiEnabled && "isActive" in u ? (
                        <button
                          type="button"
                          onClick={() => void toggleUserActive(u as AdminUserRow)}
                          className={`text-xs font-semibold underline cursor-pointer ${
                            u.isActive === false ? "text-emerald-600" : "text-red-600"
                          }`}
                        >
                          {u.isActive === false ? "Activate" : "Deactivate"}
                        </button>
                      ) : (
                        <span
                          className={`font-semibold text-xs ${
                            "isActive" in u && u.isActive === false ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          {"isActive" in u && u.isActive === false ? "Inactive" : "Active"}
                        </span>
                      )}
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
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="font-display font-bold text-jucso-navy mb-4">Review Suggestions</h2>
            <SuggestionReviewPanel
              suggestions={suggestions}
              apiEnabled={apiEnabled}
              onUpdated={() => void refreshPortalData()}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl shadow-card p-5">
            <h2 className="font-display font-bold text-jucso-navy mb-4">
              News & Announcements ({news.length})
            </h2>
            <ul>
              {news.slice(0, 8).map((n) => (
                <li key={n.id} className="py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-jucso-navy font-semibold text-xs truncate">{n.title}</div>
                      <div className="text-gray-400 text-[10px] mt-0.5">
                        {n.tag} · {n.date}
                      </div>
                    </div>
                    {apiEnabled && (
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingNewsId(editingNewsId === n.id ? null : n.id)}
                        >
                          {editingNewsId === n.id ? "Close" : "Edit"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={deletingNewsId === n.id}
                          onClick={() => void removeNews(n.id)}
                        >
                          {deletingNewsId === n.id ? "…" : "Remove"}
                        </Button>
                      </div>
                    )}
                  </div>
                  {editingNewsId === n.id && (
                    <EditNewsForm
                      item={n}
                      onCancel={() => setEditingNewsId(null)}
                      onSaved={() => {
                        setEditingNewsId(null);
                        void refreshPortalData();
                      }}
                    />
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              {apiEnabled ? (
                <AddNewsForm onCreated={() => void refreshPortalData()} />
              ) : (
                <Button variant="teal" size="sm" disabled>
                  + Add Announcement
                </Button>
              )}
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
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!apiEnabled || deletingDocId === d.id}
                    onClick={() => void removeDocument(d.id)}
                  >
                    {deletingDocId === d.id ? "…" : "Remove"}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl shadow-card p-5">
              <h2 className="font-display font-bold text-jucso-navy mb-4">Clubs ({clubs.length})</h2>
              <ul className="mb-4 max-h-40 overflow-y-auto">
                {clubs.slice(0, 5).map((c) => (
                  <li key={c.id} className="py-2 border-b border-gray-50 last:border-0 text-xs">
                    <div className="font-semibold text-jucso-navy">{c.name}</div>
                    <div className="text-gray-400 text-[10px]">{c.category} · {c.members} members</div>
                  </li>
                ))}
              </ul>
              {apiEnabled && <AddClubForm onCreated={() => void refreshPortalData()} />}
            </div>
            <div className="bg-white rounded-xl shadow-card p-5">
              <h2 className="font-display font-bold text-jucso-navy mb-4">Events ({events.length})</h2>
              <ul className="mb-4 max-h-40 overflow-y-auto">
                {events.slice(0, 5).map((e) => (
                  <li key={e.id} className="py-2 border-b border-gray-50 last:border-0 text-xs">
                    <div className="font-semibold text-jucso-navy">{e.title}</div>
                    <div className="text-gray-400 text-[10px]">{e.date} · {e.location}</div>
                  </li>
                ))}
              </ul>
              {apiEnabled && <AddEventForm onCreated={() => void refreshPortalData()} />}
            </div>
            {apiEnabled && <ContactInboxPanel />}
          </div>
        </div>
      )}

      {tab === "system" && <SystemToolsPanel apiEnabled={apiEnabled} />}
    </DashboardShell>
  );
}
