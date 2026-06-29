import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import { FOOTER_LINK_KEYS, type TranslationKey } from "@/i18n/translations";
import type { PageId } from "@/types";

const FOOTER_COLUMNS: Array<{
  headKey: TranslationKey;
  links: PageId[];
}> = [
  {
    headKey: "footerNavigate",
    links: ["home", "about", "services", "news"],
  },
  {
    headKey: "footerResources",
    links: ["documents", "clubs", "events", "track", "reports", "contact"],
  },
  {
    headKey: "footerConnect",
    links: ["dashboard"],
  },
];

export function Footer() {
  const { setPage, handleLoginClick } = useApp();
  const { t } = useLanguage();

  return (
    <footer className="bg-jucso-navy-dark px-6 pt-12 pb-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-2 md:col-span-1">
          <div className="text-white font-display font-bold text-xl mb-2">JUCSO</div>
          <p className="text-white/40 text-xs leading-relaxed max-w-[200px]">{t("footerTagline")}</p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.headKey}>
            <div className="text-jucso-teal text-[10px] font-bold uppercase tracking-wide mb-3">
              {t(col.headKey)}
            </div>
            {col.links.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => {
                  setPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="block text-white/45 text-xs mb-2 hover:text-white/80 transition-colors cursor-pointer text-left"
              >
                {t(FOOTER_LINK_KEYS[page])}
              </button>
            ))}
            {col.headKey === "footerConnect" && (
              <>
                <button
                  type="button"
                  onClick={() => handleLoginClick("student")}
                  className="block text-white/45 text-xs mb-2 hover:text-white/80 transition-colors cursor-pointer text-left"
                >
                  {t("studentPortal")}
                </button>
                <button
                  type="button"
                  onClick={() => handleLoginClick("staff")}
                  className="block text-white/45 text-xs mb-2 hover:text-white/80 transition-colors cursor-pointer text-left"
                >
                  {t("staffPortal")}
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-4 text-center text-[11px] text-white/25">{t("footerCopyright")}</div>
    </footer>
  );
}
