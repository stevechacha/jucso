import { useCallback, useState } from "react";
import { ApiError } from "@/api/client";
import { useDashboardTab } from "@/hooks/useDashboardTab";
import { useComplaintHighlight } from "@/hooks/useComplaintHighlight";
import { useComplaintDraft } from "@/hooks/useComplaintDraft";
import { useSuggestionDraft } from "@/hooks/useSuggestionDraft";
import { useComplaintCategories } from "@/hooks/useComplaintCategories";
import { jucsoApi } from "@/api/jucsoApi";
import { useApp } from "@/context/AppContext";
import type { Complaint, Suggestion } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/FormFields";
import { StatCard } from "@/components/ui/StatCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { ComplaintTable } from "@/components/complaints/ComplaintTable";
import { TrackComplaintPanel } from "@/components/complaints/TrackComplaintPanel";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { ElectionsPanel } from "@/components/elections/ElectionsPanel";
import { ProfilePanel } from "@/components/profile/ProfilePanel";
import { useLanguage } from "@/context/LanguageContext";
import { STUDENT_TABS, type TranslationKey } from "@/i18n/translations";

const DEFAULT_TAB: TranslationKey = "tabStudentOverview";

function formatDate() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function StudentDashboard() {
  const { user, complaints, setComplaints, suggestions, setSuggestions, clubs, setClubs, events, setEvents, apiEnabled, refreshPortalData, setPage } =
    useApp();
  const categories = useComplaintCategories();
  const { t } = useLanguage();
  const [tab, setTab] = useDashboardTab(STUDENT_TABS, DEFAULT_TAB);
  const { draft, setDraft, restored, savedAt, clearDraft, dismissRestored } = useComplaintDraft(user?.reg);
  const {
    draft: sugDraft,
    setDraft: setSugDraft,
    restored: sugRestored,
    savedAt: sugSavedAt,
    clearDraft: clearSugDraft,
    dismissRestored: dismissSugRestored,
  } = useSuggestionDraft(user?.reg);
  const [supportingFile, setSupportingFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [lastTrackingId, setLastTrackingId] = useState<string | null>(null);
  const [complaintError, setComplaintError] = useState<string | null>(null);
  const [complaintSubmitting, setComplaintSubmitting] = useState(false);

  const [sugSubmitted, setSugSubmitted] = useState(false);
  const [lastSuggestionId, setLastSuggestionId] = useState<string | null>(null);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [suggestionSubmitting, setSuggestionSubmitting] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const onHighlight = useCallback(
    (complaintId: string, tabKey?: string) => {
      setTab(tabKey ? (tabKey as TranslationKey) : "tabStudentMyComplaints");
      setHighlightId(complaintId);
    },
    [setTab],
  );

  useComplaintHighlight(onHighlight);

  if (!user) return null;

  const myComplaints = complaints.filter((c) => c.studentReg === user.reg);
  const mySuggestions = suggestions.filter((s) => s.studentName === user.name);

  const submitComplaint = async () => {
    if (!draft.category || !draft.description.trim()) return;
    if (apiEnabled && user.emailVerified === false) {
      setComplaintError(t("verifyEmailTitle"));
      return;
    }

    setComplaintError(null);
    setComplaintSubmitting(true);
    try {
      if (apiEnabled) {
        const complaint = await jucsoApi.createComplaint({
          category: draft.category,
          description: draft.description,
          urgent: draft.urgent,
          supportingDocument: supportingFile ?? undefined,
        });
        setLastTrackingId(complaint.id);
        await refreshPortalData();
      } else {
        const c: Complaint = {
          id: `JUC-${String(complaints.length + 1).padStart(3, "0")}`,
          category: draft.category,
          description: draft.description,
          ministry: categories[draft.category] ?? "Academics",
          status: "Pending",
          date: formatDate(),
          studentName: user!.name,
          studentReg: user!.reg,
          urgent: draft.urgent,
        };
        setComplaints((prev) => [c, ...prev]);
        setLastTrackingId(c.id);
      }
      clearDraft();
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setLastTrackingId(null);
        setSupportingFile(null);
      }, 3000);
    } catch (error) {
      setComplaintError(error instanceof ApiError ? error.message : t("complaintSubmitFailed"));
    } finally {
      setComplaintSubmitting(false);
    }
  };

  const submitSuggestion = async () => {
    if (!sugDraft.title.trim() || !sugDraft.description.trim()) return;

    setSuggestionError(null);
    setSuggestionSubmitting(true);
    try {
      if (apiEnabled) {
        const suggestion = await jucsoApi.createSuggestion({
          title: sugDraft.title,
          description: sugDraft.description,
        });
        setLastSuggestionId(suggestion.id);
        await refreshPortalData();
      } else {
        const s: Suggestion = {
          id: `SUG-${String(suggestions.length + 1).padStart(3, "0")}`,
          title: sugDraft.title,
          description: sugDraft.description,
          studentName: user!.name,
          date: formatDate(),
          status: "Received",
        };
        setSuggestions((prev) => [s, ...prev]);
        setLastSuggestionId(s.id);
      }
      clearSugDraft();
      setSugSubmitted(true);
      setTimeout(() => {
        setSugSubmitted(false);
        setLastSuggestionId(null);
      }, 4000);
    } catch (error) {
      setSuggestionError(error instanceof ApiError ? error.message : t("suggestionSubmitFailed"));
    } finally {
      setSuggestionSubmitting(false);
    }
  };

  const stats = [
    { icon: "📋", val: myComplaints.length, lab: t("totalComplaints"), color: "#1B2B6B" },
    { icon: "⏳", val: myComplaints.filter((c) => c.status === "Pending").length, lab: t("pending"), color: "#6B7280" },
    { icon: "🔄", val: myComplaints.filter((c) => c.status === "In Progress").length, lab: t("inProgress"), color: "#F59E0B" },
    { icon: "✅", val: myComplaints.filter((c) => c.status === "Resolved").length, lab: t("resolved"), color: "#10B981" },
  ];

  return (
    <DashboardShell
      label={t("studentDashboardLabel")}
      title={t("welcomeBack", { name: user.name.split(" ")[0] })}
      tabKeys={STUDENT_TABS}
      activeTabKey={tab}
      getTabLabel={(key) => t(key)}
      onTabChange={setTab}
    >
      <EmailVerificationBanner />
      {tab === "tabStudentOverview" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {stats.map((s) => (
              <StatCard key={s.lab} icon={s.icon} value={s.val} label={s.lab} color={s.color} />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <Button variant="navy" full onClick={() => setTab("tabStudentNewComplaint")}>
              {t("submitNewComplaint")}
            </Button>
            <Button variant="teal" full onClick={() => setTab("tabStudentSuggestions")}>
              {t("shareSuggestion")}
            </Button>
            <Button variant="outline" full onClick={() => setTab("tabStudentMyComplaints")}>
              {t("viewMyTickets")}
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-card overflow-hidden">
              <h2 className="px-5 py-4 border-b border-gray-100 font-display font-bold text-jucso-navy">
                {t("recentComplaints")}
              </h2>
              <ComplaintTable complaints={myComplaints.slice(0, 3)} />
            </div>
            <div className="bg-white rounded-xl shadow-card p-5">
              <TrackComplaintPanel regNumber={user.reg} title={t("quickTrack")} />
            </div>
          </div>
        </>
      )}

      {tab === "tabStudentMyComplaints" && (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <h2 className="px-5 py-4 border-b border-gray-100 font-display font-bold text-jucso-navy">
            My Complaints ({myComplaints.length})
          </h2>
          <ComplaintTable
            complaints={myComplaints}
            showResponse
            allowRating
            highlightId={highlightId}
            onRated={() => void refreshPortalData()}
          />
        </div>
      )}

      {tab === "tabStudentNewComplaint" && (
        <div className="max-w-lg">
          <div className="bg-white rounded-xl p-7 shadow-card">
            <h3 className="font-display font-bold text-jucso-navy text-lg mb-5">Submit New Complaint</h3>
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2" aria-hidden>
                  ✅
                </div>
                <div className="font-display font-bold text-emerald-800">Complaint Submitted!</div>
                {lastTrackingId && (
                  <p className="text-emerald-800 text-sm font-bold mt-3">Tracking ID: {lastTrackingId}</p>
                )}
                <p className="text-emerald-700 text-xs mt-2">
                  Your complaint has been routed to the correct ministry. Save your tracking ID or check status at{" "}
                  <button
                    type="button"
                    className="underline font-semibold"
                    onClick={() => setPage("track")}
                  >
                    Track complaint
                  </button>
                  .
                </p>
              </div>
            ) : (
              <>
                {restored && (
                  <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
                    <span>{t("complaintDraftRestored")}</span>
                    <button type="button" className="font-semibold underline shrink-0" onClick={dismissRestored}>
                      {t("dismiss")}
                    </button>
                  </div>
                )}
                {savedAt && !restored && (
                  <p className="text-[10px] text-gray-400 mb-3">{t("complaintDraftSaved")}</p>
                )}
                <Select
                  label="Complaint Category"
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                >
                  <option value="">— Select a category —</option>
                  {Object.keys(categories).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
                {draft.category && (
                  <p className="text-xs text-indigo-600 bg-indigo-50 rounded p-2 mb-4">
                    → Routed to: <strong>{categories[draft.category]}</strong> Ministry
                  </p>
                )}
                <Textarea
                  label="Describe Your Complaint"
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the issue clearly..."
                />
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.urgent}
                    onChange={(e) => setDraft({ ...draft, urgent: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-xs font-semibold text-red-600">Mark as urgent</span>
                </label>
                <label className="block mb-4">
                  <span className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Supporting document (optional)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                    onChange={(e) => setSupportingFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-jucso-slate file:text-jucso-navy file:font-semibold"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">PDF, Word, or images — max 5 MB</span>
                </label>
                <Button
                  full
                  variant="navy"
                  onClick={() => void submitComplaint()}
                  disabled={!draft.category || !draft.description.trim() || complaintSubmitting}
                >
                  {complaintSubmitting ? t("complaintSubmitting") : "Submit Complaint"}
                </Button>
                {complaintError ? (
                  <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
                    {complaintError}
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}

      {tab === "tabStudentSuggestions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-card">
            <h3 className="font-display font-bold text-jucso-navy mb-4">Share an Idea</h3>
            {sugSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                <div className="text-3xl mb-2" aria-hidden>
                  💡
                </div>
                <div className="font-display font-bold text-emerald-800">Suggestion Received!</div>
                {lastSuggestionId && (
                  <p className="text-emerald-800 text-xs mt-2 font-semibold">
                    Reference: <span className="font-mono">{lastSuggestionId}</span>
                  </p>
                )}
                <p className="text-emerald-700 text-xs mt-2">JUCSO leadership will review it within 7 days.</p>
              </div>
            ) : (
              <>
                {sugRestored && (
                  <div className="mb-4 flex items-center justify-between gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
                    <span>{t("suggestionDraftRestored")}</span>
                    <button type="button" className="font-semibold underline shrink-0" onClick={dismissSugRestored}>
                      {t("dismiss")}
                    </button>
                  </div>
                )}
                {sugSavedAt && !sugRestored && (
                  <p className="text-[10px] text-gray-400 mb-3">{t("suggestionDraftSaved")}</p>
                )}
                <Input
                  label="Suggestion Title"
                  value={sugDraft.title}
                  onChange={(e) => setSugDraft({ ...sugDraft, title: e.target.value })}
                  placeholder="Short, clear title"
                />
                <Textarea
                  label="Describe Your Idea"
                  value={sugDraft.description}
                  onChange={(e) => setSugDraft({ ...sugDraft, description: e.target.value })}
                  rows={4}
                  placeholder="Describe your suggestion in detail..."
                />
                <Button
                  full
                  variant="teal"
                  onClick={() => void submitSuggestion()}
                  disabled={!sugDraft.title.trim() || !sugDraft.description.trim() || suggestionSubmitting}
                >
                  {suggestionSubmitting ? t("suggestionSubmitting") : "Submit Suggestion"}
                </Button>
                {suggestionError ? (
                  <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
                    {suggestionError}
                  </p>
                ) : null}
              </>
            )}
          </div>
          <div>
            <h3 className="font-display font-bold text-jucso-navy mb-4">My Suggestions</h3>
            {mySuggestions.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm shadow-card">
                No suggestions submitted yet.
              </div>
            ) : (
              mySuggestions.map((s) => (
                <article key={s.id} className="bg-white rounded-xl p-4 mb-3 shadow-card">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="font-bold text-jucso-navy text-sm">{s.title}</div>
                    <StatusPill status={s.status} />
                  </div>
                  <p className="text-gray-500 text-xs">{s.description}</p>
                  {s.response && (
                    <p className="text-emerald-700 text-xs bg-emerald-50 rounded p-2 mt-2">
                      <strong>Leadership response:</strong> {s.response}
                    </p>
                  )}
                  {s.status !== "Implemented" && s.status !== "Declined" && s.isOverdue ? (
                    <p className="text-xs font-semibold text-red-600 mt-2">
                      {t("overdue")} — {t("slaDue", { date: s.dueAt ?? "" })}
                    </p>
                  ) : s.dueAt && s.status !== "Implemented" && s.status !== "Declined" ? (
                    <p className="text-xs text-gray-500 mt-2">{t("slaDue", { date: s.dueAt })}</p>
                  ) : null}
                  <time className="text-gray-400 text-xs mt-2 block">{s.date}</time>
                </article>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "tabStudentClubs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((c) => (
            <article key={c.id} className="bg-white rounded-xl p-5 shadow-card flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <Badge variant="navy">{c.category}</Badge>
                <span className="text-gray-400 text-xs">{c.members} members</span>
              </div>
              <h3 className="font-display font-bold text-jucso-navy mb-2 text-sm flex-1">{c.name}</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-4">{c.description}</p>
              <p className="text-gray-400 text-xs mb-4">Leader: {c.leader}</p>
              <Button
                variant={c.joined ? "white" : "navy"}
                size="sm"
                onClick={async () => {
                  if (apiEnabled) {
                    const updated = await jucsoApi.toggleClubJoin(c.id);
                    setClubs((prev) => prev.map((cl) => (cl.id === c.id ? { ...cl, ...updated } : cl)));
                  } else {
                    setClubs((prev) =>
                      prev.map((cl) =>
                        cl.id === c.id
                          ? { ...cl, joined: !cl.joined, members: cl.joined ? cl.members - 1 : cl.members + 1 }
                          : cl,
                      ),
                    );
                  }
                }}
              >
                {c.joined ? "Leave club" : "Join Club"}
              </Button>
            </article>
          ))}
        </div>
      )}

      {tab === "tabStudentEvents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((e) => {
            const pct = Math.round((e.registered / e.capacity) * 100);
            const full = pct >= 100;
            const onWaitlist = Boolean(e.isWaitlisted);
            return (
              <article key={e.id} className="bg-white rounded-xl p-5 shadow-card">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="font-display font-bold text-jucso-navy text-sm">{e.title}</h3>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {e.isRegistered && <Badge variant="green">{t("eventRegistered")}</Badge>}
                    {onWaitlist && (
                      <Badge variant="navy">
                        {t("eventWaitlist", { position: String(e.waitlistPosition ?? "?") })}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">{e.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>📅 {e.date}</div>
                  <div>📍 {e.location}</div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Capacity</span>
                    <span>
                      {e.registered}/{e.capacity} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-jucso-teal transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <Button
                  variant={e.isRegistered || onWaitlist ? "white" : full ? "outline" : "navy"}
                  size="sm"
                  full
                  onClick={async () => {
                    if (apiEnabled) {
                      const updated = await jucsoApi.toggleEventRegistration(e.id);
                      setEvents((prev) => prev.map((ev) => (ev.id === e.id ? updated : ev)));
                    } else {
                      setEvents((prev) =>
                        prev.map((ev) =>
                          ev.id === e.id
                            ? {
                                ...ev,
                                isRegistered: !ev.isRegistered && !ev.isWaitlisted,
                                isWaitlisted: full && !ev.isRegistered && !ev.isWaitlisted,
                                waitlistPosition: full && !ev.isRegistered && !ev.isWaitlisted ? 1 : null,
                                registered:
                                  ev.isRegistered && !ev.isWaitlisted
                                    ? ev.registered - 1
                                    : !full && !ev.isRegistered && !ev.isWaitlisted
                                      ? ev.registered + 1
                                      : ev.registered,
                              }
                            : ev,
                        ),
                      );
                    }
                  }}
                >
                  {e.isRegistered
                    ? t("eventCancelRegistration")
                    : onWaitlist
                      ? t("eventLeaveWaitlist")
                      : full
                        ? t("eventJoinWaitlist")
                        : t("eventRegisterNow")}
                </Button>
              </article>
            );
          })}
        </div>
      )}

      {tab === "tabStudentElections" && <ElectionsPanel apiEnabled={apiEnabled} />}

      {tab === "tabStudentProfile" && <ProfilePanel />}
    </DashboardShell>
  );
}
