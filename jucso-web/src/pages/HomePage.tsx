import { useEffect, useState } from "react";
import { HOME_STATS, MINISTERS, SERVICE_CARDS } from "@/constants/mock-data";
import { jucsoApi } from "@/api/jucsoApi";
import { isApiEnabled } from "@/api/client";
import { useApp } from "@/context/AppContext";
import type { LeadershipMember } from "@/types";
import type { PublicStatsResponse } from "@/api/types";
import { Badge, newsTagVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";

export function HomePage() {
  const { setPage, handleLoginClick, news, events } = useApp();
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
    if (!isApiEnabled) return;
    void jucsoApi
      .getPublicStats()
      .then((stats: PublicStatsResponse) => {
        setHomeStats([
          [stats.students_registered.toLocaleString(), "Students Registered"],
          [String(stats.ministries), "Active Ministries"],
          [`${stats.resolution_rate}%`, "Complaint Resolution"],
          [String(stats.active_clubs), "Active Clubs"],
        ]);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <Hero
        badge="2026 – 2027 Administration"
        title={
          <>
            Progress.
            <br />
            <span className="text-jucso-teal">Accountability.</span>
            <br />
            Leadership.
          </>
        }
        subtitle="JUCSO is Jordan University College's official student government — your voice on academics, welfare, clubs, and campus life."
        cta={
          <>
            <Button variant="gold" onClick={() => handleLoginClick("student")}>
              Student Portal →
            </Button>
            <Button variant="ghost" onClick={() => handleLoginClick("staff")}>
              Staff Portal
            </Button>
            <Button variant="ghost" onClick={() => setPage("about")}>
              Learn More
            </Button>
            <Button variant="ghost" onClick={() => setPage("track")}>
              Track Complaint
            </Button>
            <Button variant="ghost" onClick={() => setPage("reports")}>
              Transparency Reports
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
            <Badge variant="navy">What We Offer</Badge>
            <h2 className="heading-display text-2xl md:text-3xl mt-3 mb-2">Your government. Your tools.</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              From filing a complaint to joining a club, the JUCSO Digital Portal puts campus services one click away.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICE_CARDS.map(({ icon, title, desc, color }) => (
              <article
                key={title}
                className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
                style={{ borderLeft: `4px solid ${color}` }}
              >
                <div className="text-3xl mb-3" aria-hidden>
                  {icon}
                </div>
                <h3 className="font-display font-bold text-jucso-navy mb-2 text-sm">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </article>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="navy" onClick={() => setPage("services")}>
              View All Services →
            </Button>
          </div>
        </div>
      </section>

      <section className="page-section bg-jucso-navy">
        <div className="section-container">
          <Badge variant="teal">Your Ministers</Badge>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-white mt-3 mb-2">
            Elected to serve you.
          </h2>
          <p className="text-white/50 text-sm mb-8">
            Each complaint routes directly to the responsible minister.
          </p>

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
              <Badge variant="teal">Upcoming Events</Badge>
              <h2 className="heading-display text-2xl md:text-3xl mt-2">What&apos;s coming up</h2>
            </div>
            <Button variant="outline" onClick={() => setPage("events")}>
              All Events →
            </Button>
          </div>

          {events.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No upcoming events published yet.</p>
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
              <Badge variant="teal">Latest News</Badge>
              <h2 className="heading-display text-2xl md:text-3xl mt-2">What&apos;s happening at JUCo</h2>
            </div>
            <Button variant="outline" onClick={() => setPage("news")}>
              All News →
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
          <h2 className="text-white font-display font-bold text-2xl md:text-4xl mb-3">
            Ready to make your voice heard?
          </h2>
          <p className="text-white/75 text-sm max-w-sm mx-auto mb-7">
            Register once. Track your complaint. See real results. JUCSO accountability starts here.
          </p>
          <Button variant="gold" onClick={() => handleLoginClick("student")}>
            Sign In to Student Portal →
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
