import { useState } from "react";
import { useDashboardTab } from "@/hooks/useDashboardTab";
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
import { ProfilePanel } from "@/components/profile/ProfilePanel";

const TABS = ["overview", "my complaints", "new complaint", "suggestions", "clubs", "events", "profile"] as const;
type StudentTab = (typeof TABS)[number];

function formatDate() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function StudentDashboard() {
  const { user, complaints, setComplaints, suggestions, setSuggestions, clubs, setClubs, events, setEvents, apiEnabled, refreshPortalData, setPage } =
    useApp();
  const categories = useComplaintCategories();

  if (!user) return null;

  const [tab, setTab] = useDashboardTab(TABS, "overview");
  const myComplaints = complaints.filter((c) => c.studentReg === user.reg);
  const mySuggestions = suggestions.filter((s) => s.studentName === user.name);

  const [newCat, setNewCat] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newUrgent, setNewUrgent] = useState(false);
  const [supportingFile, setSupportingFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [lastTrackingId, setLastTrackingId] = useState<string | null>(null);

  const [sugTitle, setSugTitle] = useState("");
  const [sugDesc, setSugDesc] = useState("");
  const [sugSubmitted, setSugSubmitted] = useState(false);
  const [lastSuggestionId, setLastSuggestionId] = useState<string | null>(null);

  const submitComplaint = async () => {
    if (!newCat || !newDesc.trim()) return;
    if (apiEnabled) {
      const complaint = await jucsoApi.createComplaint({
        category: newCat,
        description: newDesc,
        urgent: newUrgent,
        supportingDocument: supportingFile ?? undefined,
      });
      setLastTrackingId(complaint.id);
      await refreshPortalData();
    } else {
      const c: Complaint = {
        id: `JUC-${String(complaints.length + 1).padStart(3, "0")}`,
        category: newCat,
        description: newDesc,
        ministry: categories[newCat] ?? "Academics",
        status: "Pending",
        date: formatDate(),
        studentName: user.name,
        studentReg: user.reg,
        urgent: newUrgent,
      };
      setComplaints((prev) => [c, ...prev]);
      setLastTrackingId(c.id);
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setLastTrackingId(null);
      setNewCat("");
      setNewDesc("");
      setNewUrgent(false);
      setSupportingFile(null);
    }, 3000);
  };

  const submitSuggestion = async () => {
    if (!sugTitle.trim() || !sugDesc.trim()) return;
    if (apiEnabled) {
      const suggestion = await jucsoApi.createSuggestion({ title: sugTitle, description: sugDesc });
      setLastSuggestionId(suggestion.id);
      await refreshPortalData();
    } else {
      const s: Suggestion = {
        id: `SUG-${String(suggestions.length + 1).padStart(3, "0")}`,
        title: sugTitle,
        description: sugDesc,
        studentName: user.name,
        date: formatDate(),
        status: "Received",
      };
      setSuggestions((prev) => [s, ...prev]);
      setLastSuggestionId(s.id);
    }
    setSugSubmitted(true);
    setTimeout(() => {
      setSugSubmitted(false);
      setLastSuggestionId(null);
      setSugTitle("");
      setSugDesc("");
    }, 4000);
  };

  const stats = [
    { icon: "📋", val: myComplaints.length, lab: "Total Complaints", color: "#1B2B6B" },
    { icon: "⏳", val: myComplaints.filter((c) => c.status === "Pending").length, lab: "Pending", color: "#6B7280" },
    { icon: "🔄", val: myComplaints.filter((c) => c.status === "In Progress").length, lab: "In Progress", color: "#F59E0B" },
    { icon: "✅", val: myComplaints.filter((c) => c.status === "Resolved").length, lab: "Resolved", color: "#10B981" },
  ];

  return (
    <DashboardShell
      label="Student Portal"
      title={`Welcome back, ${user.name.split(" ")[0]}`}
      tabs={[...TABS]}
      activeTab={tab}
      onTabChange={(t) => setTab(t as StudentTab)}
    >
      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {stats.map((s) => (
              <StatCard key={s.lab} icon={s.icon} value={s.val} label={s.lab} color={s.color} />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <Button variant="navy" full onClick={() => setTab("new complaint")}>
              Submit New Complaint
            </Button>
            <Button variant="teal" full onClick={() => setTab("suggestions")}>
              Share a Suggestion
            </Button>
            <Button variant="outline" full onClick={() => setTab("my complaints")}>
              View My Tickets
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-card overflow-hidden">
              <h2 className="px-5 py-4 border-b border-gray-100 font-display font-bold text-jucso-navy">
                Recent Complaints
              </h2>
              <ComplaintTable complaints={myComplaints.slice(0, 3)} />
            </div>
            <div className="bg-white rounded-xl shadow-card p-5">
              <TrackComplaintPanel regNumber={user.reg} title="Quick track" />
            </div>
          </div>
        </>
      )}

      {tab === "my complaints" && (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <h2 className="px-5 py-4 border-b border-gray-100 font-display font-bold text-jucso-navy">
            My Complaints ({myComplaints.length})
          </h2>
          <ComplaintTable complaints={myComplaints} showResponse />
        </div>
      )}

      {tab === "new complaint" && (
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
                <Select label="Complaint Category" value={newCat} onChange={(e) => setNewCat(e.target.value)}>
                  <option value="">— Select a category —</option>
                  {Object.keys(categories).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
                {newCat && (
                  <p className="text-xs text-indigo-600 bg-indigo-50 rounded p-2 mb-4">
                    → Routed to: <strong>{categories[newCat]}</strong> Ministry
                  </p>
                )}
                <Textarea
                  label="Describe Your Complaint"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={4}
                  placeholder="Describe the issue clearly..."
                />
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newUrgent}
                    onChange={(e) => setNewUrgent(e.target.checked)}
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
                <Button full variant="navy" onClick={submitComplaint} disabled={!newCat || !newDesc.trim()}>
                  Submit Complaint
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "suggestions" && (
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
                <Input
                  label="Suggestion Title"
                  value={sugTitle}
                  onChange={(e) => setSugTitle(e.target.value)}
                  placeholder="Short, clear title"
                />
                <Textarea
                  label="Describe Your Idea"
                  value={sugDesc}
                  onChange={(e) => setSugDesc(e.target.value)}
                  rows={4}
                  placeholder="Describe your suggestion in detail..."
                />
                <Button full variant="teal" onClick={submitSuggestion} disabled={!sugTitle.trim() || !sugDesc.trim()}>
                  Submit Suggestion
                </Button>
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
                  <time className="text-gray-400 text-xs mt-2 block">{s.date}</time>
                </article>
              ))
            )}
          </div>
        </div>
      )}

      {tab === "clubs" && (
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
                {c.joined ? "✓ Joined" : "Join Club"}
              </Button>
            </article>
          ))}
        </div>
      )}

      {tab === "events" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((e) => {
            const pct = Math.round((e.registered / e.capacity) * 100);
            const full = pct >= 100;
            return (
              <article key={e.id} className="bg-white rounded-xl p-5 shadow-card">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h3 className="font-display font-bold text-jucso-navy text-sm">{e.title}</h3>
                  {e.isRegistered && <Badge variant="green">Registered</Badge>}
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
                  variant={e.isRegistered ? "white" : full ? "outline" : "navy"}
                  size="sm"
                  full
                  disabled={full && !e.isRegistered}
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
                                isRegistered: !ev.isRegistered,
                                registered: ev.isRegistered ? ev.registered - 1 : ev.registered + 1,
                              }
                            : ev,
                        ),
                      );
                    }
                  }}
                >
                  {e.isRegistered ? "✓ Cancel Registration" : full ? "Full" : "Register Now"}
                </Button>
              </article>
            );
          })}
        </div>
      )}

      {tab === "profile" && <ProfilePanel />}
    </DashboardShell>
  );
}
