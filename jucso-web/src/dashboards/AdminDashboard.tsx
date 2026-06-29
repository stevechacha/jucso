import { generateStaffTempPassword } from "@/lib/generateTempPassword";
import { downloadJsonBackup, getLastBackupLabel } from "@/lib/downloadJsonBackup";
import { exportUsersCsv } from "@/lib/exportUsersCsv";
import { exportComplaintsCsv } from "@/lib/exportComplaintsCsv";
import { exportContactInboxCsv } from "@/lib/exportContactInboxCsv";
import { useDashboardTab } from "@/hooks/useDashboardTab";
import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/api/client";
import { jucsoApi, type AdminOverview, type AdminUserRow, type ContactMessageRow, type PortalBackupRestoreSummary } from "@/api/jucsoApi";
import type { AdminSystemStatusResponse } from "@/api/types";
import { DEMO_USERS } from "@/constants/mock-data";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/FormFields";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SuggestionReviewPanel } from "@/components/suggestions/SuggestionReviewPanel";
import { AttendeeListPanel } from "@/components/admin/AttendeeListPanel";
import { ProfilePanel } from "@/components/profile/ProfilePanel";
import { ComplaintTable } from "@/components/complaints/ComplaintTable";
import { useLanguage } from "@/context/LanguageContext";
import { ADMIN_TABS, type TranslationKey } from "@/i18n/translations";
import type { Club, Document, Event, NewsItem } from "@/types";

const DEFAULT_TAB: TranslationKey = "tabAdminOverview";

function eventDateToInput(dateLabel: string): string {
  const parsed = new Date(dateLabel);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

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
  { id: "backup", titleKey: "systemBackup", actionKey: "systemBackupAction", icon: "💾" },
  { id: "security", titleKey: "systemSecurity", actionKey: "systemSecurityAction", icon: "🔒" },
  { id: "logs", titleKey: "systemLogs", actionKey: "systemLogsAction", icon: "📝" },
  { id: "performance", titleKey: "systemPerformance", actionKey: "systemPerformanceAction", icon: "⚡" },
] as const;

function roleBadgeVariant(role: string): "gold" | "teal" | "navy" | "gray" {
  if (role === "admin") return "gold";
  if (role === "executive") return "teal";
  if (role === "minister") return "navy";
  return "gray";
}

function EditStaffModal({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUserRow;
  onClose: () => void;
  onSaved: (user: AdminUserRow) => void;
}) {
  const [ministries, setMinistries] = useState<Array<{ id: number; name: string }>>([]);
  const [role, setRole] = useState<"minister" | "executive">(
    user.role === "executive" ? "executive" : "minister",
  );
  const [ministry, setMinistry] = useState(user.ministry ?? "");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void jucsoApi.getMinistries().then(setMinistries).catch(console.error);
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const updated = await jucsoApi.updateAdminUser(user.reg, {
        role,
        ministry: role === "minister" ? ministry : "",
      });
      onSaved(updated);
      onClose();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not update staff member.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-card p-5 w-full max-w-md">
        <h2 className="font-display font-bold text-jucso-navy mb-1">Edit staff — {user.name}</h2>
        <p className="text-xs text-gray-500 mb-4">{user.reg}</p>
        <form onSubmit={(e) => void submit(e)}>
          <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as "minister" | "executive")}>
            <option value="minister">Minister</option>
            <option value="executive">Executive</option>
          </Select>
          {role === "minister" && (
            <Select label="Ministry" value={ministry} onChange={(e) => setMinistry(e.target.value)} required>
              <option value="">Select ministry</option>
              {ministries.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </Select>
          )}
          {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
          <div className="flex gap-2 mt-3">
            <Button type="submit" variant="teal" size="sm" disabled={loading}>
              {loading ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
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
  const [body, setBody] = useState("");
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
      await jucsoApi.createNews({ title: title.trim(), excerpt: excerpt.trim(), body: body.trim(), tag });
      setSuccess(`Published “${title.trim()}”.`);
      setTitle("");
      setExcerpt("");
      setBody("");
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
        <Textarea label="Summary" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} required />
        <Textarea label="Full article (optional)" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
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
  const [body, setBody] = useState("");
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
        ...(body.trim() ? { body: body.trim() } : {}),
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
      <Textarea label="Summary" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} required />
      <Textarea
        label="Full article (optional)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={5}
        placeholder="Leave blank to keep existing full text"
      />
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

function SiteAnnouncementPanel({ apiEnabled }: { apiEnabled: boolean }) {
  const [items, setItems] = useState<import("@/types").PortalAnnouncement[]>([]);
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<import("@/types").AnnouncementPriority>("info");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = () => {
    if (!apiEnabled) return;
    void jucsoApi.getAnnouncements().then(setItems).catch(console.error);
  };

  useEffect(() => {
    load();
  }, [apiEnabled]);

  const publish = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setErr("");
    try {
      await jucsoApi.createAnnouncement({ message: message.trim(), priority });
      setMessage("");
      load();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not publish site banner.");
    } finally {
      setLoading(false);
    }
  };

  const deactivate = async (id: number) => {
    await jucsoApi.deactivateAnnouncement(id);
    load();
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-card">
      <h3 className="font-display font-bold text-jucso-navy text-sm mb-1">Site-wide banner</h3>
      <p className="text-xs text-gray-500 mb-4">Urgent notices appear at the top of every public page.</p>
      <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} rows={2} />
      <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)}>
        <option value="info">Info</option>
        <option value="warning">Warning</option>
        <option value="urgent">Urgent</option>
      </Select>
      {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
      <Button variant="navy" size="sm" disabled={!apiEnabled || loading || !message.trim()} onClick={() => void publish()}>
        {loading ? "Publishing…" : "Publish banner"}
      </Button>
      {items.length > 0 && (
        <ul className="mt-4 space-y-2 text-xs">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3 border border-gray-100 rounded-lg p-3">
              <div>
                <span className="font-semibold capitalize text-jucso-navy">{item.priority}</span>
                <p className="text-gray-600 mt-0.5">{item.message}</p>
              </div>
              {item.is_active !== false && (
                <Button variant="outline" size="sm" onClick={() => void deactivate(item.id)}>
                  Hide
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SystemToolsPanel({ apiEnabled }: { apiEnabled: boolean }) {
  const { t } = useLanguage();
  const [lastBackup, setLastBackup] = useState<string | null>(() => getLastBackupLabel());
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMsg, setBackupMsg] = useState("");
  const [restoreFile, setRestoreFile] = useState<Record<string, unknown> | null>(null);
  const [restorePreview, setRestorePreview] = useState<PortalBackupRestoreSummary | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<AdminSystemStatusResponse | null>(null);
  const [activeTool, setActiveTool] = useState<(typeof SYSTEM_TOOLS)[number]["id"] | null>(null);

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
      setBackupMsg(t("systemBackupSuccess"));
    } catch (error) {
      setBackupMsg(error instanceof ApiError ? error.message : "Backup failed.");
    } finally {
      setBackupLoading(false);
    }
  };

  const onRestoreFile = async (file: File | null) => {
    if (!file) return;
    setRestoreLoading(true);
    setBackupMsg("");
    setRestorePreview(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Record<string, unknown>;
      setRestoreFile(data);
      const preview = await jucsoApi.previewPortalBackupRestore(data);
      setRestorePreview(preview);
      setBackupMsg("Restore preview ready. Confirm to apply content changes.");
    } catch (error) {
      setRestoreFile(null);
      setRestorePreview(null);
      setBackupMsg(error instanceof ApiError ? error.message : "Could not read backup file.");
    } finally {
      setRestoreLoading(false);
    }
  };

  const confirmRestore = async () => {
    if (!restoreFile || !apiEnabled) return;
    setRestoreLoading(true);
    setBackupMsg("");
    try {
      const result = await jucsoApi.restorePortalBackup(restoreFile);
      setRestorePreview(result);
      setBackupMsg("Backup restored. Clubs, events, news, and document metadata were merged.");
      setRestoreFile(null);
    } catch (error) {
      setBackupMsg(error instanceof ApiError ? error.message : "Restore failed.");
    } finally {
      setRestoreLoading(false);
    }
  };

  const toolDesc = (id: (typeof SYSTEM_TOOLS)[number]["id"]) => {
    if (id === "backup") {
      return lastBackup ? `Last backup: ${lastBackup}` : "No backup downloaded yet from this browser.";
    }
    if (id === "security") {
      if (!systemStatus) return "Checking email, SMS, and SSL configuration…";
      return t("registryStatus", {
        status: systemStatus.registry_configured ? t("registryOn") : t("registryOff"),
      });
    }
    if (id === "logs") {
      return systemStatus?.cron_runs?.length
        ? `${systemStatus.cron_runs.length} recent scheduled job(s) recorded.`
        : "No scheduled jobs have run yet.";
    }
    return systemStatus
      ? `${systemStatus.open_complaints ?? 0} open complaints · ${systemStatus.pending_suggestions ?? 0} pending suggestions`
      : "Checking portal workload…";
  };

  const renderDetail = () => {
    if (!systemStatus || !activeTool || activeTool === "backup") {
      if (activeTool !== "backup") return null;
      return (
        <div className="bg-white rounded-xl p-5 shadow-card text-xs space-y-3">
          <h3 className="font-display font-bold text-jucso-navy">Restore from backup</h3>
          <p className="text-gray-500">
            Upload a JSON backup to merge clubs, events, news, and document metadata. Users, complaints, and
            suggestions are not restored.
          </p>
          <input
            type="file"
            accept="application/json,.json"
            disabled={!apiEnabled || restoreLoading}
            onChange={(e) => void onRestoreFile(e.target.files?.[0] ?? null)}
            className="block text-xs"
          />
          {restorePreview && (
            <div className="bg-jucso-slate rounded-lg p-3 space-y-1">
              <p>Clubs: {restorePreview.clubs.created} new, {restorePreview.clubs.updated} updated</p>
              <p>Events: {restorePreview.events.created} new, {restorePreview.events.updated} updated</p>
              <p>News: {restorePreview.news.created} new, {restorePreview.news.updated} updated</p>
              <p>Documents: {restorePreview.documents.created} new, {restorePreview.documents.updated} updated</p>
              {restorePreview.dry_run && restoreFile && (
                <Button size="sm" variant="navy" className="mt-2" disabled={restoreLoading} onClick={() => void confirmRestore()}>
                  {restoreLoading ? "Restoring…" : "Confirm restore"}
                </Button>
              )}
            </div>
          )}
        </div>
      );
    }

    if (!systemStatus) return null;

    if (activeTool === "security") {
      return (
        <div className="bg-white rounded-xl p-5 shadow-card text-xs space-y-2">
          <h3 className="font-display font-bold text-jucso-navy">{t("securityChecklist")}</h3>
          <p>Email: {systemStatus.email_configured ? "configured" : "not configured"}</p>
          <p>SMS: {systemStatus.sms_configured ? "configured" : "not configured"}</p>
          <p>Storage: {systemStatus.storage_configured ? "configured" : "not configured"}</p>
          <p>SSL: {systemStatus.ssl_enabled ? "enabled" : "disabled"}</p>
          <p>Debug mode: {systemStatus.debug ? "on" : "off"}</p>
          <p>{t("registryStatus", { status: systemStatus.registry_configured ? t("registryOn") : t("registryOff") })}</p>
        </div>
      );
    }

    if (activeTool === "logs") {
      return (
        <div className="bg-white rounded-xl p-5 shadow-card text-xs">
          <h3 className="font-display font-bold text-jucso-navy mb-3">{t("cronJobLogs")}</h3>
          {systemStatus.cron_runs?.length ? (
            <ul className="space-y-2">
              {systemStatus.cron_runs.map((run) => (
                <li key={`${run.job_name}-${run.ran_at}`} className="border-b border-gray-50 pb-2">
                  <div className="font-semibold text-jucso-navy">{run.job_name}</div>
                  <div className="text-gray-500">{new Date(run.ran_at).toLocaleString()}</div>
                  <div className={run.success ? "text-emerald-700" : "text-red-600"}>{run.detail || (run.success ? "OK" : "Failed")}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No cron runs logged yet. Configure Railway cron with `railway.cron.toml`.</p>
          )}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl p-5 shadow-card text-xs space-y-2">
        <h3 className="font-display font-bold text-jucso-navy">{t("performanceMetrics")}</h3>
        <p>Open complaints: {systemStatus.open_complaints ?? 0}</p>
        <p>Overdue complaints: {systemStatus.overdue_complaints ?? 0}</p>
        <p>Pending suggestions: {systemStatus.pending_suggestions ?? 0}</p>
        <p>Overdue suggestions: {systemStatus.overdue_suggestions ?? 0}</p>
        <p>API: {systemStatus.api} · Database: {systemStatus.database}</p>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <SiteAnnouncementPanel apiEnabled={apiEnabled} />
      {backupMsg && <p className="text-xs text-jucso-navy bg-jucso-slate rounded-lg px-3 py-2">{backupMsg}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SYSTEM_TOOLS.map((s) => (
          <article key={s.id} className="bg-white rounded-xl p-5 shadow-card">
            <div className="text-3xl mb-3" aria-hidden>
              {s.icon}
            </div>
            <h3 className="font-display font-bold text-jucso-navy mb-1 text-sm">{t(s.titleKey)}</h3>
            <p className="text-gray-500 text-xs mb-4">{toolDesc(s.id)}</p>
            <Button
              variant="outline"
              size="sm"
              disabled={!apiEnabled || (s.id === "backup" && backupLoading)}
              onClick={() => {
                if (s.id === "backup") {
                  setActiveTool("backup");
                  void runBackup();
                  return;
                }
                setActiveTool(activeTool === s.id ? null : s.id);
              }}
            >
              {s.id === "backup" && backupLoading ? "Exporting…" : t(s.actionKey)}
            </Button>
          </article>
        ))}
      </div>
      {renderDetail()}
    </div>
  );
}

function ContactInboxPanel() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [inboxFilter, setInboxFilter] = useState<"all" | "unread">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);

  const load = () => {
    void jucsoApi
      .getContactMessages()
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: string) => {
    setUpdatingId(id);
    try {
      await jucsoApi.markContactMessageRead(id, true);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const markUnread = async (id: string) => {
    setUpdatingId(id);
    try {
      await jucsoApi.markContactMessageRead(id, false);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: false } : m)));
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const sendReply = async (id: string) => {
    const reply = replyDrafts[id]?.trim();
    if (!reply) return;
    setReplyingId(id);
    try {
      const updated = await jucsoApi.replyContactMessage(id, reply);
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
      setReplyDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setReplyingId(null);
    }
  };

  const removeMessage = async (id: string) => {
    if (!window.confirm("Delete this message permanently?")) return;
    setUpdatingId(id);
    try {
      await jucsoApi.deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markAllRead = async () => {
    setBulkWorking(true);
    try {
      await jucsoApi.markAllContactMessagesRead();
      setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
    } catch (error) {
      console.error(error);
    } finally {
      setBulkWorking(false);
    }
  };

  const bulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} message(s) permanently?`)) return;
    setBulkWorking(true);
    try {
      await jucsoApi.bulkDeleteContactMessages([...selectedIds]);
      setMessages((prev) => prev.filter((m) => !selectedIds.has(m.id)));
      setSelectedIds(new Set());
    } catch (error) {
      console.error(error);
    } finally {
      setBulkWorking(false);
    }
  };

  const unread = messages.filter((m) => !m.is_read).length;
  const visible = inboxFilter === "unread" ? messages.filter((m) => !m.is_read) : messages;

  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <h2 className="font-display font-bold text-jucso-navy">
          {t("contactInbox")} ({messages.length}
          {unread > 0 ? ` · ${unread} ${t("contactUnread").toLowerCase()}` : ""})
        </h2>
        <div className="flex gap-1 flex-wrap">
          {unread > 0 && (
            <Button size="sm" variant="outline" disabled={bulkWorking} onClick={() => void markAllRead()}>
              {t("contactMarkAllRead")}
            </Button>
          )}
          {selectedIds.size > 0 && (
            <Button
              size="sm"
              variant="outline"
              disabled={bulkWorking}
              onClick={() => void bulkDelete()}
              className="!text-red-600 !border-red-200"
            >
              {t("contactBulkDelete", { count: String(selectedIds.size) })}
            </Button>
          )}
          {messages.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => exportContactInboxCsv(messages)}>
              {t("contactExportCsv")}
            </Button>
          )}
          <Button
            size="sm"
            variant={inboxFilter === "all" ? "navy" : "outline"}
            onClick={() => setInboxFilter("all")}
          >
            {t("contactAll")}
          </Button>
          <Button
            size="sm"
            variant={inboxFilter === "unread" ? "navy" : "outline"}
            onClick={() => setInboxFilter("unread")}
          >
            {t("contactUnread")}
          </Button>
        </div>
      </div>
      {loading ? (
        <p className="text-gray-400 text-sm">{t("loadingMessages")}</p>
      ) : visible.length === 0 ? (
        <p className="text-gray-400 text-sm">
          {inboxFilter === "unread" ? t("contactNoUnread") : t("contactNoMessages")}
        </p>
      ) : (
        <ul className="max-h-80 overflow-y-auto">
          {visible.map((m) => (
            <li
              key={m.id}
              className={`py-3 border-b border-gray-50 last:border-0 ${m.is_read ? "opacity-70" : "bg-indigo-50/40 -mx-2 px-2 rounded-lg"}`}
            >
              <div className="flex items-start gap-2 mb-1">
                <input
                  type="checkbox"
                  checked={selectedIds.has(m.id)}
                  onChange={() => toggleSelected(m.id)}
                  className="mt-1 rounded"
                  aria-label={`Select message ${m.subject || m.id}`}
                />
                <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2 text-xs mb-1">
                <span className="font-semibold text-jucso-navy">{m.subject || "(No subject)"}</span>
                <span className="text-gray-400 whitespace-nowrap">{m.date}</span>
              </div>
              <div className="text-[10px] text-gray-500 mb-1">
                {m.name} · {m.email}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-2">{m.message}</p>
              {m.admin_reply && (
                <div className="mb-2 rounded-lg bg-emerald-50 border border-emerald-100 p-2 text-xs">
                  <div className="font-semibold text-emerald-800 mb-1">
                    {m.replied_by_name ? t("contactRepliedBy", { name: m.replied_by_name }) : t("contactReply")}
                  </div>
                  <p className="text-emerald-900 whitespace-pre-wrap">{m.admin_reply}</p>
                </div>
              )}
              {!m.admin_reply && (
                <div className="mb-2">
                  <Textarea
                    label={t("contactReply")}
                    value={replyDrafts[m.id] ?? ""}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [m.id]: e.target.value }))}
                    rows={3}
                    placeholder={t("contactReplyPlaceholder")}
                  />
                  <Button
                    size="sm"
                    variant="teal"
                    className="mt-2"
                    disabled={replyingId === m.id || !(replyDrafts[m.id] ?? "").trim()}
                    onClick={() => void sendReply(m.id)}
                  >
                    {replyingId === m.id ? t("contactSendingReply") : t("contactSendReply")}
                  </Button>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                {!m.is_read ? (
                  <Button size="sm" variant="outline" disabled={updatingId === m.id} onClick={() => void markRead(m.id)}>
                    {updatingId === m.id ? "…" : t("contactMarkRead")}
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled={updatingId === m.id} onClick={() => void markUnread(m.id)}>
                    {updatingId === m.id ? "…" : t("contactMarkUnread")}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updatingId === m.id}
                  onClick={() => void removeMessage(m.id)}
                  className="!text-red-600 !border-red-200"
                >
                  {t("contactDelete")}
                </Button>
              </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EditDocumentForm({
  item,
  onSaved,
  onCancel,
}: {
  item: Document;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await jucsoApi.updateDocument(item.id, { name: name.trim() });
      onSaved();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not update document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-2 border border-indigo-100 rounded-lg p-3 bg-indigo-50/40">
      <Input label="Document name" value={name} onChange={(e) => setName(e.target.value)} required />
      {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="navy" size="sm" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function EditClubForm({
  item,
  onSaved,
  onCancel,
}: {
  item: Club;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [leader, setLeader] = useState(item.leader);
  const [category, setCategory] = useState(item.category);
  const [description, setDescription] = useState(item.description);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await jucsoApi.updateClub(item.id, {
        name: name.trim(),
        leader: leader.trim(),
        category,
        description: description.trim(),
      });
      onSaved();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not update club.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-2 border border-indigo-100 rounded-lg p-3 bg-indigo-50/40">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Leader" value={leader} onChange={(e) => setLeader(e.target.value)} required />
      <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="Academic">Academic</option>
        <option value="Sports">Sports</option>
        <option value="Arts">Arts</option>
        <option value="Social">Social</option>
      </Select>
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        required
      />
      {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="navy" size="sm" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function EditEventForm({
  item,
  onSaved,
  onCancel,
}: {
  item: Event;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [location, setLocation] = useState(item.location);
  const [eventDate, setEventDate] = useState(eventDateToInput(item.date));
  const [capacity, setCapacity] = useState(String(item.capacity));
  const [description, setDescription] = useState(item.description);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await jucsoApi.updateEvent(item.id, {
        title: title.trim(),
        location: location.trim(),
        event_date: eventDate,
        capacity: parseInt(capacity, 10),
        description: description.trim(),
      });
      onSaved();
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not update event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="mt-2 border border-indigo-100 rounded-lg p-3 bg-indigo-50/40">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
      <Input label="Date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
      <Input label="Capacity" type="number" min={1} value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        required
      />
      {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="navy" size="sm" disabled={loading}>
          {loading ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
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
  const { t } = useLanguage();
  const [tab, setTab] = useDashboardTab(ADMIN_TABS, DEFAULT_TAB);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserRow[]>([]);
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [userPage, setUserPage] = useState(1);
  const [deletingNewsId, setDeletingNewsId] = useState<string | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<AdminSystemStatusResponse | null>(null);
  const [deletingClubId, setDeletingClubId] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [editingClubId, setEditingClubId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [viewingClubMembersId, setViewingClubMembersId] = useState<string | null>(null);
  const [viewingEventRegistrantsId, setViewingEventRegistrantsId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

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

  const removeClub = async (id: string) => {
    if (!window.confirm("Deactivate this club?")) return;
    setDeletingClubId(id);
    try {
      await jucsoApi.deleteClub(id);
      await refreshPortalData();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingClubId(null);
    }
  };

  const removeEvent = async (id: string) => {
    if (!window.confirm("Deactivate this event?")) return;
    setDeletingEventId(id);
    try {
      await jucsoApi.deleteEvent(id);
      await refreshPortalData();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingEventId(null);
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
  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.reg.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      (u.ministry?.toLowerCase().includes(q) ?? false)
    );
  });
  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const currentUserPage = Math.min(userPage, totalUserPages);
  const pageUsers = filteredUsers.slice(
    (currentUserPage - 1) * USERS_PER_PAGE,
    currentUserPage * USERS_PER_PAGE,
  );

  useEffect(() => {
    setUserPage(1);
  }, [users.length, tab, userSearch, userRoleFilter]);

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

  const openComplaints = complaints.filter((c) => c.status !== "Resolved");

  return (
    <DashboardShell
      label={t("adminDashboardLabel")}
      title={t("adminDashboardLabel")}
      tabKeys={ADMIN_TABS}
      activeTabKey={tab}
      getTabLabel={(key) => t(key)}
      onTabChange={setTab}
    >
      {tab === "tabAdminOverview" && (
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
          <div className="mt-5 bg-white rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-display font-bold text-jucso-navy">Open Complaints ({openComplaints.length})</h2>
              {apiEnabled && openComplaints.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => exportComplaintsCsv(openComplaints)}>
                  Export CSV
                </Button>
              )}
            </div>
            {openComplaints.length === 0 ? (
              <p className="px-5 py-8 text-center text-gray-400 text-sm">No open complaints.</p>
            ) : (
              <ComplaintTable complaints={openComplaints.slice(0, 8)} />
            )}
          </div>
        </>
      )}

      {tab === "tabAdminUsers" && (
        <div className="space-y-5">
          {apiEnabled && (
            <AddStaffForm
              onCreated={(user) => {
                setAdminUsers((prev) => [user, ...prev]);
              }}
            />
          )}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
              <h2 className="font-display font-bold text-jucso-navy">
                Registered Users ({filteredUsers.length})
              </h2>
              {apiEnabled && adminUsers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportUsersCsv(filteredUsers as AdminUserRow[])}
                >
                  Export CSV
                </Button>
              )}
            </div>
            <div className="px-5 py-3 border-b border-gray-50 flex flex-col sm:flex-row gap-2">
              <input
                type="search"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, reg number, ministry…"
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-jucso-teal"
                aria-label="Search users"
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-jucso-teal bg-white"
                aria-label="Filter by role"
              >
                <option value="all">All roles</option>
                <option value="student">Students</option>
                <option value="minister">Ministers</option>
                <option value="executive">Executives</option>
                <option value="admin">Admins</option>
              </select>
            </div>
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
                        <div className="flex flex-col gap-1 items-start">
                          {(u.role === "minister" || u.role === "executive") && (
                            <button
                              type="button"
                              onClick={() => setEditingUser(u as AdminUserRow)}
                              className="text-xs font-semibold text-jucso-teal underline cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => void toggleUserActive(u as AdminUserRow)}
                            className={`text-xs font-semibold underline cursor-pointer ${
                              u.isActive === false ? "text-emerald-600" : "text-red-600"
                            }`}
                          >
                            {u.isActive === false ? "Activate" : "Deactivate"}
                          </button>
                        </div>
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
          {filteredUsers.length > USERS_PER_PAGE && (
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                Showing {(currentUserPage - 1) * USERS_PER_PAGE + 1}–
                {Math.min(currentUserPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
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

      {tab === "tabAdminContent" && (
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
                <li key={d.id} className="py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-jucso-navy font-semibold text-xs truncate">{d.name}</div>
                      <div className="text-gray-400 text-[10px] mt-0.5">
                        {d.type} · {d.size} · {d.date}
                      </div>
                    </div>
                    {apiEnabled && (
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingDocId(editingDocId === d.id ? null : d.id)}
                        >
                          {editingDocId === d.id ? "Close" : "Edit"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={deletingDocId === d.id}
                          onClick={() => void removeDocument(d.id)}
                        >
                          {deletingDocId === d.id ? "…" : "Remove"}
                        </Button>
                      </div>
                    )}
                  </div>
                  {editingDocId === d.id && (
                    <EditDocumentForm
                      item={d}
                      onCancel={() => setEditingDocId(null)}
                      onSaved={() => {
                        setEditingDocId(null);
                        void refreshPortalData();
                      }}
                    />
                  )}
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
                {clubs.slice(0, 8).map((c) => (
                  <li key={c.id} className="py-2 border-b border-gray-50 last:border-0 text-xs">
                    <div className="flex justify-between gap-2">
                      <div>
                        <div className="font-semibold text-jucso-navy">{c.name}</div>
                        <div className="text-gray-400 text-[10px]">{c.category} · {c.members} members</div>
                      </div>
                      {apiEnabled && (
                        <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setViewingClubMembersId(viewingClubMembersId === c.id ? null : c.id);
                              setEditingClubId(null);
                            }}
                          >
                            {viewingClubMembersId === c.id ? "Hide" : "Members"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingClubId(editingClubId === c.id ? null : c.id);
                              setViewingClubMembersId(null);
                            }}
                          >
                            {editingClubId === c.id ? "Close" : "Edit"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={deletingClubId === c.id}
                            onClick={() => void removeClub(c.id)}
                          >
                            {deletingClubId === c.id ? "…" : "Remove"}
                          </Button>
                        </div>
                      )}
                    </div>
                    {editingClubId === c.id && (
                      <EditClubForm
                        item={c}
                        onCancel={() => setEditingClubId(null)}
                        onSaved={() => {
                          setEditingClubId(null);
                          void refreshPortalData();
                        }}
                      />
                    )}
                    {viewingClubMembersId === c.id && (
                      <AttendeeListPanel kind="club" itemId={c.id} itemName={c.name} />
                    )}
                  </li>
                ))}
              </ul>
              {apiEnabled && <AddClubForm onCreated={() => void refreshPortalData()} />}
            </div>
            <div className="bg-white rounded-xl shadow-card p-5">
              <h2 className="font-display font-bold text-jucso-navy mb-4">Events ({events.length})</h2>
              <ul className="mb-4 max-h-40 overflow-y-auto">
                {events.slice(0, 8).map((e) => (
                  <li key={e.id} className="py-2 border-b border-gray-50 last:border-0 text-xs">
                    <div className="flex justify-between gap-2">
                      <div>
                        <div className="font-semibold text-jucso-navy">{e.title}</div>
                        <div className="text-gray-400 text-[10px]">{e.date} · {e.location}</div>
                      </div>
                      {apiEnabled && (
                        <div className="flex gap-1 shrink-0 flex-wrap justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setViewingEventRegistrantsId(viewingEventRegistrantsId === e.id ? null : e.id);
                              setEditingEventId(null);
                            }}
                          >
                            {viewingEventRegistrantsId === e.id ? "Hide" : "Attendees"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingEventId(editingEventId === e.id ? null : e.id);
                              setViewingEventRegistrantsId(null);
                            }}
                          >
                            {editingEventId === e.id ? "Close" : "Edit"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={deletingEventId === e.id}
                            onClick={() => void removeEvent(e.id)}
                          >
                            {deletingEventId === e.id ? "…" : "Remove"}
                          </Button>
                        </div>
                      )}
                    </div>
                    {editingEventId === e.id && (
                      <EditEventForm
                        item={e}
                        onCancel={() => setEditingEventId(null)}
                        onSaved={() => {
                          setEditingEventId(null);
                          void refreshPortalData();
                        }}
                      />
                    )}
                    {viewingEventRegistrantsId === e.id && (
                      <AttendeeListPanel kind="event" itemId={e.id} itemName={e.title} />
                    )}
                  </li>
                ))}
              </ul>
              {apiEnabled && <AddEventForm onCreated={() => void refreshPortalData()} />}
            </div>
            {apiEnabled && <ContactInboxPanel />}
          </div>
        </div>
      )}

      {tab === "tabAdminSystem" && <SystemToolsPanel apiEnabled={apiEnabled} />}

      {tab === "tabAdminProfile" && <ProfilePanel />}

      {editingUser && (
        <EditStaffModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={(updated) => {
            setAdminUsers((prev) => prev.map((u) => (u.reg === updated.reg ? updated : u)));
            setEditingUser(null);
          }}
        />
      )}
    </DashboardShell>
  );
}
