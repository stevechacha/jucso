import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
import { Badge, newsTagVariant } from "@/components/ui/Badge";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";
import { syncNewsArticleUrl } from "@/lib/routing";
import type { NewsTag } from "@/types";
import type { TranslationKey } from "@/i18n/translations";

const TAGS: Array<NewsTag | "All"> = ["All", "Announcement", "Events", "Clubs", "Notice"];

const TAG_ICONS: Record<NewsTag, string> = {
  Announcement: "📢",
  Events: "📅",
  Clubs: "🎓",
  Notice: "📌",
};

const TAG_LABEL_KEYS: Record<NewsTag | "All", TranslationKey> = {
  All: "newsFilterAll",
  Announcement: "newsFilterAnnouncement",
  Events: "newsFilterEvents",
  Clubs: "newsFilterClubs",
  Notice: "newsFilterNotice",
};

export function NewsPage() {
  const { news } = useApp();
  const { t } = useLanguage();
  const [filter, setFilter] = useState<NewsTag | "All">("All");
  const filtered = filter === "All" ? news : news.filter((n) => n.tag === filter);

  return (
    <div>
      <Hero badge={t("newsPageBadge")} title={t("newsPageTitle")} subtitle={t("newsPageSubtitle")} />

      <section className="page-section bg-jucso-slate">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex gap-2 flex-wrap mb-7" role="group" aria-label="Filter by category">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setFilter(tag)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  filter === tag
                    ? "bg-jucso-navy text-white border-jucso-navy"
                    : "bg-white text-gray-500 border-gray-200 hover:border-jucso-navy"
                }`}
              >
                {t(TAG_LABEL_KEYS[tag])}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {filtered.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">{t("newsPageEmpty")}</p>
            ) : (
              filtered.map((n) => (
                <article
                  key={n.id}
                  className="bg-white rounded-xl p-5 flex gap-4 items-start shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
                  onClick={() => {
                    syncNewsArticleUrl(n.id);
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      syncNewsArticleUrl(n.id);
                      window.dispatchEvent(new PopStateEvent("popstate"));
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div
                    className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-xl shrink-0"
                    aria-hidden
                  >
                    {TAG_ICONS[n.tag]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                      <Badge variant={newsTagVariant(n.tag)}>{t(TAG_LABEL_KEYS[n.tag])}</Badge>
                      <time className="text-gray-400 text-xs">{n.date}</time>
                    </div>
                    <h3 className="font-display font-bold text-jucso-navy text-sm mb-1">{n.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{n.excerpt}</p>
                    <span className="inline-block mt-2 text-xs font-semibold text-jucso-teal">{t("newsReadMore")}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
