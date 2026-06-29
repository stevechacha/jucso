import { useState } from "react";
import { useComplaintCategories } from "@/hooks/useComplaintCategories";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/FormFields";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";

const SERVICE_ITEMS: Array<{
  id: string;
  icon: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  color: string;
  btnKey: TranslationKey;
  page: "login" | "clubs" | "events" | "documents" | "reports";
}> = [
  {
    id: "complaint",
    icon: "📋",
    titleKey: "homeServiceComplaintTitle",
    descKey: "homeServiceComplaintDesc",
    color: "#1B2B6B",
    btnKey: "servicesGetStarted",
    page: "login",
  },
  {
    id: "suggestion",
    icon: "💡",
    titleKey: "homeServiceSuggestionTitle",
    descKey: "homeServiceSuggestionDesc",
    color: "#00B4C6",
    btnKey: "servicesGetStarted",
    page: "login",
  },
  {
    id: "clubs",
    icon: "🎓",
    titleKey: "homeServiceClubTitle",
    descKey: "homeServiceClubDesc",
    color: "#F5A623",
    btnKey: "servicesBrowseClubs",
    page: "clubs",
  },
  {
    id: "events",
    icon: "📅",
    titleKey: "homeServiceEventTitle",
    descKey: "homeServiceEventDesc",
    color: "#1B2B6B",
    btnKey: "servicesViewEvents",
    page: "events",
  },
  {
    id: "documents",
    icon: "📄",
    titleKey: "servicesCardDocumentsTitle",
    descKey: "servicesCardDocumentsDesc",
    color: "#00B4C6",
    btnKey: "servicesBrowseDocuments",
    page: "documents",
  },
  {
    id: "reports",
    icon: "📊",
    titleKey: "servicesCardReportsTitle",
    descKey: "servicesCardReportsDesc",
    color: "#F5A623",
    btnKey: "servicesViewReports",
    page: "reports",
  },
];

export function ServicesPage() {
  const { handleLoginClick, setPage } = useApp();
  const { t } = useLanguage();
  const categories = useComplaintCategories();
  const [catForm, setCatForm] = useState("");
  const [descForm, setDescForm] = useState("");
  const [previewed, setPreviewed] = useState(false);

  const preview = () => {
    if (!catForm || !descForm.trim()) return;
    setPreviewed(true);
  };

  const onServiceAction = (page: (typeof SERVICE_ITEMS)[number]["page"]) => {
    if (page === "login") handleLoginClick("student");
    else setPage(page);
  };

  return (
    <div>
      <Hero badge={t("servicesBadge")} title={t("servicesTitle")} subtitle={t("servicesSubtitle")} />

      <section className="page-section bg-jucso-slate">
        <div className="section-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICE_ITEMS.map((s) => (
            <article
              key={s.id}
              className="bg-white rounded-xl p-6 shadow-card flex flex-col"
              style={{ borderLeft: `4px solid ${s.color}` }}
            >
              <div className="text-3xl mb-3" aria-hidden>
                {s.icon}
              </div>
              <h3 className="font-display font-bold text-jucso-navy mb-2 text-sm flex-1">{t(s.titleKey)}</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-4">{t(s.descKey)}</p>
              <Button size="sm" variant="navy" onClick={() => onServiceAction(s.page)}>
                {t(s.btnKey)}
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section bg-white">
        <div className="max-w-lg mx-auto px-6">
          <div className="text-center mb-7">
            <Badge variant="teal">{t("servicesDemoBadge")}</Badge>
            <h2 className="heading-display text-2xl mt-3 mb-2">{t("servicesDemoTitle")}</h2>
            <p className="text-gray-500 text-xs">{t("servicesDemoSubtitle")}</p>
          </div>

          {!previewed ? (
            <div className="bg-jucso-slate rounded-xl p-7">
              <Select label="Complaint Category" value={catForm} onChange={(e) => setCatForm(e.target.value)}>
                <option value="">— Select a category —</option>
                {Object.keys(categories).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <Textarea
                label="Describe Your Complaint"
                value={descForm}
                onChange={(e) => setDescForm(e.target.value)}
                rows={4}
                placeholder="Explain the issue clearly. Include relevant dates, names, or reference numbers."
              />
              {catForm && descForm && (
                <p className="text-xs text-jucso-navy bg-indigo-50 rounded-lg p-3 mb-4">
                  {t("servicesDemoRouted", { ministry: categories[catForm] ?? "" })}
                </p>
              )}
              <Button full variant="navy" onClick={preview} disabled={!catForm || !descForm.trim()}>
                {t("servicesPreviewRouting")}
              </Button>
            </div>
          ) : (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3" aria-hidden>
                📋
              </div>
              <h3 className="font-display font-bold text-jucso-navy text-lg mb-2">{t("servicesPreviewReady")}</h3>
              <p className="text-gray-600 text-xs mb-5 leading-relaxed">
                {t("servicesPreviewBody", { ministry: categories[catForm] ?? "" })}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="navy" onClick={() => handleLoginClick("student")}>
                  {t("servicesSignInSubmit")}
                </Button>
                <Button variant="outline" onClick={() => setPage("track")}>
                  {t("trackComplaint")}
                </Button>
              </div>
              <button
                type="button"
                className="text-xs text-gray-500 underline mt-4"
                onClick={() => {
                  setPreviewed(false);
                  setCatForm("");
                  setDescForm("");
                }}
              >
                {t("servicesTryAnother")}
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
