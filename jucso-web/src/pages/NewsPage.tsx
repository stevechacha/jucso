import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Badge, newsTagVariant } from "@/components/ui/Badge";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";
import type { NewsTag } from "@/types";

const TAGS: Array<NewsTag | "All"> = ["All", "Announcement", "Events", "Clubs", "Notice"];

const TAG_ICONS: Record<NewsTag, string> = {
  Announcement: "📢",
  Events: "📅",
  Clubs: "🎓",
  Notice: "📌",
};

export function NewsPage() {
  const { news } = useApp();
  const [filter, setFilter] = useState<NewsTag | "All">("All");
  const filtered = filter === "All" ? news : news.filter((n) => n.tag === filter);

  return (
    <div>
      <Hero
        badge="Latest News"
        title="JUCSO Notices & Announcements"
        subtitle="Official communications from the JUCSO 2026–2027 administration."
      />

      <section className="page-section bg-jucso-slate">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex gap-2 flex-wrap mb-7" role="group" aria-label="Filter by category">
            {TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  filter === t
                    ? "bg-jucso-navy text-white border-jucso-navy"
                    : "bg-white text-gray-500 border-gray-200 hover:border-jucso-navy"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {filtered.map((n) => (
              <article
                key={n.id}
                className="bg-white rounded-xl p-5 flex gap-4 items-start shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-xl shrink-0"
                  aria-hidden
                >
                  {TAG_ICONS[n.tag]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                    <Badge variant={newsTagVariant(n.tag)}>{n.tag}</Badge>
                    <time className="text-gray-400 text-xs">{n.date}</time>
                  </div>
                  <h3 className="font-display font-bold text-jucso-navy text-sm mb-1">{n.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{n.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
