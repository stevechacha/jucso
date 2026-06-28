import { useEffect, useState } from "react";
import { isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import type { TransparencyStatsResponse } from "@/api/types";
import { StatCard } from "@/components/ui/StatCard";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";

export function TransparencyReportsPage() {
  const [stats, setStats] = useState<TransparencyStatsResponse | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isApiEnabled) {
      setErr("Live transparency data requires the API.");
      return;
    }
    void jucsoApi
      .getTransparencyStats()
      .then(setStats)
      .catch(() => setErr("Could not load transparency report."));
  }, []);

  const rateColor = (rate: number) => (rate > 70 ? "#10B981" : rate > 40 ? "#F59E0B" : "#EF4444");

  return (
    <div>
      <Hero
        badge="Transparency"
        title="JUCSO performance reports"
        subtitle="Quarterly-style visibility into how ministries handle student complaints — no personal data, just outcomes."
      />

      <section className="page-section bg-jucso-slate">
        <div className="section-container">
          {err && <p className="text-center text-sm text-gray-500 mb-6">{err}</p>}
          {stats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <StatCard icon="📊" value={stats.total_complaints} label="Total complaints" color="#1B2B6B" />
                <StatCard icon="✅" value={stats.resolved_complaints} label="Resolved" color="#10B981" />
                <StatCard icon="🔓" value={stats.open_complaints} label="Open" color="#F59E0B" />
                <StatCard icon="📈" value={`${stats.resolution_rate}%`} label="Overall rate" color="#00B4C6" />
              </div>
              <div className="bg-white rounded-xl shadow-card p-6">
                <h2 className="font-display font-bold text-jucso-navy mb-5">Ministry resolution rates</h2>
                <div className="space-y-4">
                  {stats.ministry_stats.map((m) => (
                    <div key={m.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-700">{m.name}</span>
                        <span className="text-gray-400">
                          {m.resolved}/{m.total} resolved ({m.rate}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${m.rate}%`, background: rateColor(m.rate) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
