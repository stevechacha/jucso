import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";
import { TrackComplaintPanel } from "@/components/complaints/TrackComplaintPanel";
import { useLanguage } from "@/context/LanguageContext";

export function TrackComplaintPage() {
  const { t } = useLanguage();

  return (
    <div>
      <Hero badge={t("trackBadge")} title={t("trackTitle")} subtitle={t("trackSubtitle")} />

      <section className="page-section bg-jucso-slate">
        <div className="max-w-lg mx-auto px-6">
          <div className="bg-white rounded-xl shadow-card p-6">
            <TrackComplaintPanel title={t("trackPanelTitle")} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
