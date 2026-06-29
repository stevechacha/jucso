import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import type { Election } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/FormFields";
import { useLanguage } from "@/context/LanguageContext";

type CandidateDraft = { name: string; position: string; manifesto: string };

const EMPTY_CANDIDATE: CandidateDraft = { name: "", position: "", manifesto: "" };

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AdminElectionsPanel({ apiEnabled }: { apiEnabled: boolean }) {
  const { t } = useLanguage();
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState(() => toLocalInputValue(new Date()));
  const [endsAt, setEndsAt] = useState(() => toLocalInputValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)));
  const [candidates, setCandidates] = useState<CandidateDraft[]>([{ ...EMPTY_CANDIDATE }, { ...EMPTY_CANDIDATE }]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => {
    if (!apiEnabled) {
      setLoading(false);
      return;
    }
    void jucsoApi
      .getAdminElections()
      .then(setElections)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [apiEnabled]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!apiEnabled) return;
    setSaving(true);
    setMsg("");
    try {
      await jucsoApi.createElection({
        title,
        description,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        candidates: candidates.filter((c) => c.name.trim()),
      });
      setMsg(t("adminElectionCreateSuccess"));
      setShowForm(false);
      setTitle("");
      setDescription("");
      setCandidates([{ ...EMPTY_CANDIDATE }, { ...EMPTY_CANDIDATE }]);
      load();
    } catch (error) {
      setMsg(error instanceof ApiError ? error.message : t("adminElectionCreateFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-5">
      <div className="flex justify-between items-center gap-2 mb-4">
        <h2 className="font-display font-bold text-jucso-navy">{t("adminElectionsTitle")}</h2>
        {apiEnabled && (
          <Button size="sm" variant="teal" onClick={() => setShowForm((v) => !v)}>
            {showForm ? t("cancel") : t("adminElectionCreate")}
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={(e) => void submit(e)} className="mb-5 border border-gray-100 rounded-lg p-4 space-y-3">
          <Input label={t("adminElectionTitle")} value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea
            label={t("adminElectionDescription")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label={t("adminElectionStarts")}
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
            />
            <Input
              label={t("adminElectionEnds")}
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            {candidates.map((c, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  label={t("adminElectionCandidateName")}
                  value={c.name}
                  onChange={(e) =>
                    setCandidates((prev) => prev.map((row, idx) => (idx === i ? { ...row, name: e.target.value } : row)))
                  }
                  required={i < 2}
                />
                <Input
                  label={t("adminElectionCandidatePosition")}
                  value={c.position}
                  onChange={(e) =>
                    setCandidates((prev) =>
                      prev.map((row, idx) => (idx === i ? { ...row, position: e.target.value } : row)),
                    )
                  }
                />
                <Input
                  label={t("adminElectionCandidateManifesto")}
                  value={c.manifesto}
                  onChange={(e) =>
                    setCandidates((prev) =>
                      prev.map((row, idx) => (idx === i ? { ...row, manifesto: e.target.value } : row)),
                    )
                  }
                />
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setCandidates((prev) => [...prev, { ...EMPTY_CANDIDATE }])}
            >
              {t("adminElectionAddCandidate")}
            </Button>
          </div>
          {msg && <p className="text-xs text-gray-600">{msg}</p>}
          <Button type="submit" size="sm" variant="navy" disabled={saving}>
            {saving ? t("adminElectionCreating") : t("adminElectionCreate")}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">{t("electionsLoading")}</p>
      ) : elections.length === 0 ? (
        <p className="text-gray-400 text-sm">{t("adminElectionsEmpty")}</p>
      ) : (
        <ul className="space-y-3">
          {elections.map((election) => (
            <li key={election.id} className="border border-gray-100 rounded-lg p-3">
              <div className="flex justify-between items-start gap-2 mb-1">
                <span className="font-semibold text-jucso-navy text-sm">{election.title}</span>
                <Badge variant={election.isOpen ? "green" : "gray"}>
                  {election.isOpen ? t("electionOpen") : t("electionClosed")}
                </Badge>
              </div>
              <p className="text-[10px] text-gray-400 mb-2">
                {new Date(election.startsAt).toLocaleString()} — {new Date(election.endsAt).toLocaleString()}
              </p>
              <div className="text-xs text-gray-600 space-y-1">
                {election.candidates.map((c) => (
                  <div key={c.id} className="flex justify-between">
                    <span>
                      {c.name}
                      {c.position ? ` (${c.position})` : ""}
                    </span>
                    {c.voteCount != null && <span className="text-jucso-teal font-semibold">{c.voteCount}</span>}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
