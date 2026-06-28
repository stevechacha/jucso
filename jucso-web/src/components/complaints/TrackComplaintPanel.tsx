import { useState, type FormEvent } from "react";
import { ApiError, isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import type { TrackedComplaint } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";
import { StatusPill } from "@/components/ui/StatusPill";

interface TrackComplaintPanelProps {
  regNumber?: string;
  title?: string;
}

export function TrackComplaintPanel({ regNumber = "", title = "Track a complaint" }: TrackComplaintPanelProps) {
  const [trackingId, setTrackingId] = useState("");
  const [reg, setReg] = useState(regNumber);
  const [result, setResult] = useState<TrackedComplaint | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setResult(null);
    try {
      if (!isApiEnabled) {
        setErr("Complaint tracking requires the live API.");
        return;
      }
      const complaint = await jucsoApi.trackComplaint(trackingId.trim(), reg.trim());
      setResult(complaint);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not find that complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="font-display font-bold text-jucso-navy text-sm mb-4">{title}</h3>
      <form onSubmit={(e) => void submit(e)}>
        <Input
          label="Tracking ID"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="e.g. JUC-001"
          required
        />
        <Input
          label="Registration number"
          value={reg}
          onChange={(e) => setReg(e.target.value)}
          placeholder="e.g. JUC/2026/040"
          required
          disabled={Boolean(regNumber)}
        />
        {err && <p className="text-xs text-red-600 mb-3">{err}</p>}
        <Button type="submit" variant="outline" full disabled={loading}>
          {loading ? "Looking up…" : "Track complaint"}
        </Button>
      </form>

      {result && (
        <div className="mt-4 border border-gray-100 rounded-xl p-4 bg-jucso-slate/40">
          <div className="flex justify-between items-start gap-3 mb-3">
            <div>
              <div className="font-display font-bold text-jucso-navy text-sm">{result.id}</div>
              <p className="text-[10px] text-gray-500 mt-0.5">{result.date}</p>
            </div>
            <StatusPill status={result.status} />
          </div>
          <dl className="grid grid-cols-1 gap-2 text-xs mb-3">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Category</dt>
              <dd className="font-semibold text-jucso-navy">{result.category}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Ministry</dt>
              <dd className="font-semibold text-jucso-navy">{result.ministry}</dd>
            </div>
          </dl>
          {result.response ? (
            <p className="text-xs text-emerald-800 bg-emerald-50 rounded-lg p-2">
              <strong>Official response:</strong> {result.response}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">No response yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
