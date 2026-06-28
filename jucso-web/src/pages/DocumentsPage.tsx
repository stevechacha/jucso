import { DOCS } from "@/constants/mock-data";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";

export function DocumentsPage() {
  const { documents } = useApp();
  const docs = documents.length > 0 ? documents : DOCS;
  return (
    <div>
      <Hero
        badge="Official Documents"
        title="JUCSO Resource Library"
        subtitle="Download constitutions, bylaws, meeting minutes, and official reports."
      />

      <section className="page-section bg-jucso-slate">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <header className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-extrabold text-jucso-navy text-lg">Official Documents</h2>
              <p className="text-gray-400 text-xs mt-0.5">All documents are official JUCSO publications</p>
            </header>
            <ul>
              {docs.map((doc, i) => (
                <li
                  key={doc.id}
                  className={`px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${i > 0 ? "border-t border-gray-100" : ""}`}
                >
                  <div
                    className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-lg shrink-0"
                    aria-hidden
                  >
                    📄
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-jucso-navy font-semibold text-sm">{doc.name}</div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      {doc.type} · {doc.size} · {doc.date}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
