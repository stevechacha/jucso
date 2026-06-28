import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";

export function ClubsPage() {
  const { clubs, handleLoginClick } = useApp();

  return (
    <div>
      <Hero
        badge="Student Life"
        title="Campus clubs & societies"
        subtitle="Browse active student clubs at Jordan University College. Sign in to join with one click."
      />

      <section className="page-section bg-jucso-slate">
        <div className="section-container">
          {clubs.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">No clubs published yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clubs.map((c) => (
                <article key={c.id} className="bg-white rounded-xl p-5 shadow-card flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="navy">{c.category}</Badge>
                    <span className="text-gray-400 text-xs">{c.members} members</span>
                  </div>
                  <h3 className="font-display font-bold text-jucso-navy mb-2 text-sm flex-1">{c.name}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-3">{c.description}</p>
                  <p className="text-gray-400 text-xs mb-4">Leader: {c.leader}</p>
                  <Button variant="navy" size="sm" onClick={() => handleLoginClick("student")}>
                    Sign in to join
                  </Button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
