import { useEffect, useState } from "react";
import { isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import type { TransparencyStatsResponse } from "@/api/types";
import { StatCard } from "@/components/ui/StatCard";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";
import { useLanguage } from "@/context/LanguageContext";

export function TransparencyReportsPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<TransparencyStatsResponse | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isApiEnabled) {
      setErr(t("transparencyApiRequired"));
      return;
    }
    void jucsoApi
      .getTransparencyStats()
      .then(setStats)
      .catch(() => setErr(t("transparencyLoadError")));
  }, [t]);

  const rateColor = (rate: number) => (rate > 70 ? "#10B981" : rate > 40 ? "#F59E0B" : "#EF4444");

  return (
    <div>
      <Hero
        badge={t("transparencyPageBadge")}
        title={t("transparencyPageTitle")}
        subtitle={t("transparencyPageSubtitle")}
      />

      <section className="page-section bg-jucso-slate">
        <div className="section-container">
          {err && <p className="text-center text-sm text-gray-500 mb-6">{err}</p>}
          {stats && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <StatCard icon="📊" value={stats.total_complaints} label={t("transparencyTotalComplaints")} color="#1B2B6B" />
                <StatCard icon="✅" value={stats.resolved_complaints} label={t("transparencyResolved")} color="#10B981" />
                <StatCard icon="🔓" value={stats.open_complaints} label={t("transparencyOpen")} color="#F59E0B" />
                <StatCard icon="📈" value={`${stats.resolution_rate}%`} label={t("transparencyOverallRate")} color="#00B4C6" />
              </div>
              {stats.rated_complaints > 0 && stats.satisfaction_avg != null && (
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-8 max-w-lg">
                  <StatCard
                    icon="⭐"
                    value={`${stats.satisfaction_avg}/5`}
                    label={t("avgSatisfaction")}
                    color="#F5A623"
                  />
                  <StatCard icon="📝" value={stats.rated_complaints} label={t("ratedComplaints")} color="#1B2B6B" />
                </div>
              )}
              <div className="bg-white rounded-xl shadow-card p-6 mb-8">
                <h2 className="font-display font-bold text-jucso-navy mb-5">{t("transparencyMinistryRates")}</h2>
                <div className="space-y-4">
                  {stats.ministry_stats.map((m) => (
                    <div key={m.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-700">{m.name}</span>
                        <span className="text-gray-400">
                          {t("transparencyResolvedOf", {
                            resolved: String(m.resolved),
                            total: String(m.total),
                            rate: String(m.rate),
                          })}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <StatCard icon="💡" value={stats.total_suggestions} label={t("transparencySuggestionsReceived")} color="#F5A623" />
                <StatCard icon="✅" value={stats.implemented_suggestions} label={t("transparencyImplemented")} color="#10B981" />
                <StatCard icon="⏳" value={stats.pending_suggestions} label={t("transparencyPendingReview")} color="#6B7280" />
                <StatCard
                  icon="📈"
                  value={`${stats.suggestion_review_rate}%`}
                  label={t("transparencyImplementationRate")}
                  color="#00B4C6"
                />
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
