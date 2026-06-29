import { useEffect, useState } from "react";
import { HOME_STATS, MINISTERS } from "@/constants/mock-data";
import { jucsoApi } from "@/api/jucsoApi";
import { isApiEnabled } from "@/api/client";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import type { LeadershipMember } from "@/types";
import type { PublicStatsResponse } from "@/api/types";
import { Badge, newsTagVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";

export function HomePage() {
  const { setPage, handleLoginClick, news, events } = useApp();
  const { t } = useLanguage();
  const [leaders, setLeaders] = useState<LeadershipMember[]>(
    MINISTERS.map((m) => ({ name: m.name, role: m.role, ministry: "", initials: m.initials })),
  );
  const [homeStats, setHomeStats] = useState<[string, string][]>(() =>
    HOME_STATS.map((row) => [row[0], row[1]]),
  );

  useEffect(() => {
    if (!isApiEnabled) return;
    void jucsoApi
      .getLeadership()
      .then((data) => {
        if (data.length > 0) setLeaders(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isApiEnabled) {
      setHomeStats([
        [HOME_STATS[0][0], t("studentsServed")],
        [HOME_STATS[1][0], t("activeMinistries")],
        [HOME_STATS[2][0], t("weeksToLaunch")],
        [HOME_STATS[3][0], t("annualBudget")],
      ]);
      return;
    }
    void jucsoApi
      .getPublicStats()
      .then((stats: PublicStatsResponse) => {
        const rows: [string, string][] = [
          [stats.students_registered.toLocaleString(), t("studentsRegistered")],
          [String(stats.ministries), t("activeMinistries")],
          [`${stats.resolution_rate}%`, t("complaintResolution")],
          [String(stats.implemented_suggestions ?? 0), t("ideasImplemented")],
        ];
        setHomeStats(rows);
      })
      .catch(console.error);
  }, [t]);

  return (
    <div>
      <Hero
        badge={t("homeHeroBadge")}
        title={
          <>
            {t("homeHeroLine1")}
            <br />
            <span className="text-jucso-teal">{t("homeHeroLine2")}</span>
            <br />
            {t("homeHeroLine3")}
          </>
        }
        subtitle={t("homeHeroSubtitle")}
        cta={
          <>
            <Button variant="gold" onClick={() => handleLoginClick("student")}>
              {t("studentPortal")} →
            </Button>
            <Button variant="ghost" onClick={() => handleLoginClick("staff")}>
              {t("staffPortal")}
            </Button>
            <Button variant="ghost" onClick={() => setPage("about")}>
              {t("learnMore")}
            </Button>
            <Button variant="ghost" onClick={() => setPage("track")}>
              {t("trackComplaint")}
            </Button>
            <Button variant="ghost" onClick={() => setPage("reports")}>
              {t("transparency")}
            </Button>
          </>
        }
      />

      <section className="bg-jucso-teal px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center" aria-label="Key statistics">
        {homeStats.map(([val, lab]) => (
          <div key={lab}>
            <div className="text-white font-display font-bold text-2xl md:text-3xl">{val}</div>
            <div className="text-white/75 text-[10px] font-semibold uppercase tracking-wide mt-1">
              {lab}
            </div>
          </div>
        ))}
      </section>

      <section className="page-section bg-jucso-slate">
        <div className="section-container">
          <div className="text-center mb-10">
            <Badge variant="navy">{t("homeWhatWeOffer")}</Badge>
            <h2 className="heading-display text-2xl md:text-3xl mt-3 mb-2">{t("homeToolsTitle")}</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">{t("homeToolsSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "📋", titleKey: "homeServiceComplaintTitle" as const, descKey: "homeServiceComplaintDesc" as const, color: "#1B2B6B" },
              { icon: "💡", titleKey: "homeServiceSuggestionTitle" as const, descKey: "homeServiceSuggestionDesc" as const, color: "#00B4C6" },
              { icon: "🎓", titleKey: "homeServiceClubTitle" as const, descKey: "homeServiceClubDesc" as const, color: "#F5A623" },
              { icon: "📅", titleKey: "homeServiceEventTitle" as const, descKey: "homeServiceEventDesc" as const, color: "#1B2B6B" },
            ].map(({ icon, titleKey, descKey, color }) => (
              <article
                key={titleKey}
                className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
                style={{ borderLeft: `4px solid ${color}` }}
              >
                <div className="text-3xl mb-3" aria-hidden>
                  {icon}
                </div>
                <h3 className="font-display font-bold text-jucso-navy mb-2 text-sm">{t(titleKey)}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{t(descKey)}</p>
              </article>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="navy" onClick={() => setPage("services")}>
              {t("homeViewAllServices")}
            </Button>
          </div>
        </div>
      </section>

      <section className="page-section bg-jucso-navy">
        <div className="section-container">
          <Badge variant="teal">{t("homeMinistersBadge")}</Badge>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white mt-3 mb-2">{t("homeMinistersTitle")}</h2>
          <p className="text-white/50 text-sm mb-8">{t("homeMinistersSubtitle")}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {leaders.slice(0, 6).map((m) => (
              <article
                key={m.initials + m.name}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-all"
              >
                <div
                  className="w-11 h-11 rounded-full bg-gradient-to-br from-jucso-teal to-jucso-navy flex items-center justify-center text-white font-black text-xs border-2 border-cyan-400/40 shrink-0"
                  aria-hidden
                >
                  {m.initials}
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{m.name}</div>
                  <div className="text-jucso-teal text-xs mt-0.5">{m.role}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section bg-white">
        <div className="section-container">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div>
              <Badge variant="teal">{t("homeEventsBadge")}</Badge>
              <h2 className="heading-display text-2xl md:text-3xl mt-2">{t("homeEventsTitle")}</h2>
            </div>
            <Button variant="outline" onClick={() => setPage("events")}>
              {t("homeAllEvents")}
            </Button>
          </div>

          {events.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">{t("homeNoEvents")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {events.slice(0, 3).map((e) => (
                <article key={e.id} className="bg-jucso-slate rounded-xl p-5 shadow-card">
                  <h3 className="font-display font-bold text-jucso-navy text-sm mb-2">{e.title}</h3>
                  <p className="text-gray-500 text-xs mb-3 line-clamp-2">{e.description}</p>
                  <div className="text-gray-400 text-[10px]">
                    {e.date} · {e.location}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <div>
              <Badge variant="teal">{t("homeNewsBadge")}</Badge>
              <h2 className="heading-display text-2xl md:text-3xl mt-2">{t("homeNewsTitle")}</h2>
            </div>
            <Button variant="outline" onClick={() => setPage("news")}>
              {t("homeAllNews")}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.slice(0, 4).map((n) => (
              <article
                key={n.id}
                className="bg-jucso-slate rounded-xl p-5 hover:shadow-card-hover transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                  <Badge variant={newsTagVariant(n.tag)}>{n.tag}</Badge>
                  <time className="text-gray-400 text-xs">{n.date}</time>
                </div>
                <h3 className="font-display font-bold text-jucso-navy text-sm mb-2">{n.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{n.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section bg-gradient-to-r from-jucso-teal to-jucso-navy text-center">
        <div className="section-container">
          <h2 className="text-white font-display font-bold text-2xl md:text-4xl mb-3">{t("homeCtaTitle")}</h2>
          <p className="text-white/75 text-sm max-w-sm mx-auto mb-7">{t("homeCtaSubtitle")}</p>
          <Button variant="gold" onClick={() => handleLoginClick("student")}>
            {t("homeCtaButton")}
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
