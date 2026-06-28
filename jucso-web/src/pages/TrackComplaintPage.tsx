import { useState, type FormEvent } from "react";
import { ApiError, isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import type { TrackedComplaint } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/FormFields";
import { StatusPill } from "@/components/ui/StatusPill";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";

export function TrackComplaintPage() {
  const [trackingId, setTrackingId] = useState("");
  const [regNumber, setRegNumber] = useState("");
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
      const complaint = await jucsoApi.trackComplaint(trackingId.trim(), regNumber.trim());
      setResult(complaint);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : "Could not find that complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Hero
        badge="Track Complaint"
        title="Check your complaint status"
        subtitle="Enter your tracking ID and registration number to see ministry, status, and any official response."
      />

      <section className="page-section bg-jucso-slate">
        <div className="max-w-lg mx-auto px-6">
          <form onSubmit={(e) => void submit(e)} className="bg-white rounded-xl shadow-card p-6">
            <Input
              label="Tracking ID"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. JUC-001"
              required
            />
            <Input
              label="Registration number"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="e.g. JUC/2026/040"
              required
            />
            {err && <p className="text-xs text-red-600 mb-3">{err}</p>}
            <Button type="submit" variant="navy" full disabled={loading}>
              {loading ? "Looking up…" : "Track complaint"}
            </Button>
          </form>

          {result && (
            <div className="bg-white rounded-xl shadow-card p-6 mt-5">
              <div className="flex justify-between items-start gap-3 mb-4">
                <div>
                  <h2 className="font-display font-bold text-jucso-navy">{result.id}</h2>
                  <p className="text-xs text-gray-500 mt-1">{result.date}</p>
                </div>
                <StatusPill status={result.status} />
              </div>
              <dl className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between gap-4 border-b border-gray-50 pb-2">
                  <dt className="text-gray-500">Category</dt>
                  <dd className="font-semibold text-jucso-navy">{result.category}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-gray-50 pb-2">
                  <dt className="text-gray-500">Ministry</dt>
                  <dd className="font-semibold text-jucso-navy">{result.ministry}</dd>
                </div>
              </dl>
              {result.response ? (
                <div className="mt-4 bg-emerald-50 rounded-lg p-3 text-xs text-emerald-800">
                  <strong>Official response:</strong> {result.response}
                </div>
              ) : (
                <p className="mt-4 text-xs text-gray-400 italic">No response yet. Check back after the ministry reviews your case.</p>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
