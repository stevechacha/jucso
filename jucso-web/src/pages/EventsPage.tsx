import { useApp } from "@/context/AppContext";
import { jucsoApi } from "@/api/jucsoApi";
import { isApiEnabled } from "@/api/client";
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";

export function EventsPage() {
  const { events, handleLoginClick } = useApp();
  const { t } = useLanguage();

  return (
    <div>
      <Hero badge={t("eventsPageBadge")} title={t("eventsPageTitle")} subtitle={t("eventsPageSubtitle")} />

      <section className="page-section bg-jucso-slate">
        <div className="section-container">
          {isApiEnabled && events.length > 0 && (
            <div className="flex justify-end mb-4">
              <a
                href={jucsoApi.eventsCalendarUrl()}
                download="jucso-events.ics"
                className="inline-flex items-center gap-2 text-xs font-semibold text-jucso-teal hover:underline"
              >
                📅 {t("eventsDownloadCalendar")}
              </a>
            </div>
          )}
          {events.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">{t("eventsPageEmpty")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((e) => {
                const pct = Math.round((e.registered / e.capacity) * 100);
                const full = pct >= 100;
                return (
                  <article key={e.id} className="bg-white rounded-xl p-5 shadow-card">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <h3 className="font-display font-bold text-jucso-navy text-sm">{e.title}</h3>
                      {full && <Badge variant="navy">{t("eventsFull")}</Badge>}
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed mb-3">{e.description}</p>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                      <div>📅 {e.date}</div>
                      <div>📍 {e.location}</div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{t("eventsCapacity")}</span>
                        <span>
                          {e.registered}/{e.capacity} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-jucso-teal" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <Button variant="navy" size="sm" full onClick={() => handleLoginClick("student")}>
                      {t("eventsSignInRegister")}
                    </Button>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
