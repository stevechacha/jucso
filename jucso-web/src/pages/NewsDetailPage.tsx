import { useEffect, useState } from "react";
import { jucsoApi } from "@/api/jucsoApi";
import { isApiEnabled } from "@/api/client";
import { useApp } from "@/context/AppContext";
import { Badge, newsTagVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { syncUrlForPage } from "@/lib/routing";
import type { NewsDetail } from "@/types";

export function NewsDetailPage({ newsId }: { newsId: string }) {
  const { news } = useApp();
  const [item, setItem] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(isApiEnabled);
  const [error, setError] = useState<string | null>(null);

  const fallback = news.find((n) => n.id === newsId);

  useEffect(() => {
    if (!isApiEnabled) {
      if (fallback) {
        setItem({ ...fallback, body: fallback.excerpt });
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    void jucsoApi
      .getNewsDetail(newsId)
      .then(setItem)
      .catch(() => setError("Could not load this article."))
      .finally(() => setLoading(false));
  }, [newsId, fallback]);

  const goBack = () => {
    syncUrlForPage("news");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  if (loading) {
    return (
      <div className="page-section bg-jucso-slate min-h-[40vh] flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading article…</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="page-section bg-jucso-slate min-h-[40vh] flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-gray-500">{error || "Article not found."}</p>
        <Button variant="outline" size="sm" onClick={goBack}>
          Back to news
        </Button>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-jucso-navy text-white py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Button variant="outline" size="sm" onClick={goBack} className="!text-white !border-white/30 mb-4">
            ← Back to news
          </Button>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={newsTagVariant(item.tag)}>{item.tag}</Badge>
            <time className="text-white/60 text-xs">{item.date}</time>
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl leading-tight">{item.title}</h1>
        </div>
      </section>

      <section className="page-section bg-jucso-slate">
        <article className="max-w-3xl mx-auto px-6 bg-white rounded-xl p-6 md:p-8 shadow-card">
          <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">{item.body}</div>
        </article>
      </section>

      <Footer />
    </div>
  );
}
