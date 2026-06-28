import { MINISTERS } from "@/constants/mock-data";
import { Badge } from "@/components/ui/Badge";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";

const PILLARS = [
  {
    word: "Progress",
    color: "#00B4C6",
    desc: "We push for measurable improvements in academic quality, campus facilities, and student welfare — term by term.",
  },
  {
    word: "Accountability",
    color: "#F5A623",
    desc: "Every complaint receives a tracking number. Every minister has a resolution deadline. Every outcome is recorded.",
  },
  {
    word: "Leadership",
    color: "#1B2B6B",
    desc: "JUCSO nurtures the next generation of civic leaders through hands-on governance, debate, and community service.",
  },
] as const;

const MANDATE_ITEMS = [
  "Represent all JUCo students before college management and external bodies.",
  "Handle, track, and resolve student complaints across six ministries.",
  "Organize official student events, orientation, and cultural programmes.",
  "Manage and support all registered student clubs and societies.",
  "Maintain transparency in financial and governance matters.",
  "Advocate for improvements to academic and campus welfare services.",
] as const;

export function AboutPage() {
  return (
    <div>
      <Hero
        badge="About JUCSO"
        title="Leading People to Excellence"
        subtitle="JUCSO is the constitutionally recognized voice of all students at Jordan University College, Tanzania. We bridge the gap between student needs and institutional action."
      />

      <section className="page-section bg-white">
        <div className="section-container max-w-4xl">
          <div className="text-center mb-10">
            <Badge variant="navy">Our Three Pillars</Badge>
            <h2 className="heading-display text-2xl md:text-3xl mt-3">
              Every decision measured against these commitments
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PILLARS.map((p) => (
              <article
                key={p.word}
                className="rounded-xl p-7 bg-jucso-slate"
                style={{ borderTop: `5px solid ${p.color}` }}
              >
                <h3 className="font-display font-extrabold text-2xl mb-3" style={{ color: p.color }}>
                  {p.word}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section bg-jucso-slate">
        <div className="section-container grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <Badge variant="navy">Our Mandate</Badge>
            <h3 className="heading-display text-xl mt-3 mb-5">What JUCSO is responsible for</h3>
            <ul className="space-y-3">
              {MANDATE_ITEMS.map((m) => (
                <li key={m} className="flex gap-3 items-start">
                  <span
                    className="w-5 h-5 rounded-full bg-jucso-teal flex items-center justify-center shrink-0 mt-0.5 text-white text-[10px] font-black"
                    aria-hidden
                  >
                    ✓
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed">{m}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Badge variant="teal">The Digital System</Badge>
            <h3 className="heading-display text-xl mt-3 mb-4">Why we&apos;re going digital</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Today, JUCSO runs on WhatsApp groups, paper notices, and face-to-face conversations. Messages get lost.
              Complaints go unanswered. There is no record.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              The JUCSO Digital System — approved June 2026 — replaces every paper-based process with a single, secure,
              mobile-friendly website any student can use from a phone.
            </p>
            <div className="bg-jucso-navy rounded-xl p-5 flex gap-5 items-center justify-center">
              {[
                ["12", "weeks", "#00B4C6"],
                ["4", "user roles", "#F5A623"],
                ["6", "ministries", "#fff"],
              ].map(([val, lab, color], i) => (
                <div key={lab} className="flex items-center gap-5">
                  {i > 0 && <div className="w-px h-10 bg-white/15" aria-hidden />}
                  <div className="text-center">
                    <div className="font-display font-extrabold text-xl" style={{ color }}>
                      {val}
                    </div>
                    <div className="text-white/50 text-[10px] uppercase tracking-widest">{lab}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section bg-white">
        <div className="section-container">
          <div className="text-center mb-8">
            <Badge variant="navy">Leadership Structure</Badge>
            <h2 className="heading-display text-2xl md:text-3xl mt-3">The 2026–2027 Cabinet</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { initials: "NS", name: "Dr. Neema Salim", role: "President", color: "#F5A623" },
              { initials: "MT", name: "Marcus Tarimo", role: "Vice President", color: "#F5A623" },
              ...MINISTERS.map((m) => ({ ...m, color: "#00B4C6" })),
            ].map((p) => (
              <article
                key={p.initials}
                className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-card transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0"
                  style={{ background: `linear-gradient(135deg,${p.color},#1B2B6B)` }}
                  aria-hidden
                >
                  {p.initials}
                </div>
                <div>
                  <div className="font-bold text-jucso-navy text-sm">{p.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: p.color }}>
                    {p.role}
                  </div>
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
