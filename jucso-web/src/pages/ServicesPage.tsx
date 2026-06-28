import { useState } from "react";
import { useComplaintCategories } from "@/hooks/useComplaintCategories";
import { useApp } from "@/context/AppContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/FormFields";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";

const ALL_SERVICES = [
  { icon: "📋", title: "Submit a Complaint", desc: "File a complaint under the correct ministry and track it in real time. Each complaint gets a tracking ID.", color: "#1B2B6B" },
  { icon: "💡", title: "Share an Idea", desc: "Submit suggestions that could improve university life. Leaders review and respond within 7 days.", color: "#00B4C6" },
  { icon: "🎓", title: "Join a Club", desc: "Browse active student clubs and sign up with one click. No paper forms.", color: "#F5A623" },
  { icon: "📅", title: "Event Registration", desc: "Find upcoming events and secure your spot instantly with real-time capacity tracking.", color: "#1B2B6B" },
  { icon: "📄", title: "Official Documents", desc: "Download the JUCSO Constitution, Election Bylaws, and meeting minutes anytime.", color: "#00B4C6" },
  { icon: "📊", title: "Performance Reports", desc: "JUCSO publishes quarterly transparency reports showing ministry response rates.", color: "#F5A623" },
] as const;

export function ServicesPage() {
  const { handleLoginClick, setPage } = useApp();
  const categories = useComplaintCategories();
  const [catForm, setCatForm] = useState("");
  const [descForm, setDescForm] = useState("");
  const [previewed, setPreviewed] = useState(false);

  const preview = () => {
    if (!catForm || !descForm.trim()) return;
    setPreviewed(true);
  };

  return (
    <div>
      <Hero
        badge="Student Services"
        title="Everything you need in one place"
        subtitle="Submit complaints, share ideas, register for events, and download official documents — all from your phone."
      />

      <section className="page-section bg-jucso-slate">
        <div className="section-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALL_SERVICES.map((s) => (
            <article
              key={s.title}
              className="bg-white rounded-xl p-6 shadow-card flex flex-col"
              style={{ borderLeft: `4px solid ${s.color}` }}
            >
              <div className="text-3xl mb-3" aria-hidden>
                {s.icon}
              </div>
              <h3 className="font-display font-bold text-jucso-navy mb-2 text-sm flex-1">{s.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed mb-4">{s.desc}</p>
              <Button
                variant="navy"
                size="sm"
                onClick={() => {
                  if (s.title === "Performance Reports") setPage("reports");
                  else if (s.title === "Official Documents") setPage("documents");
                  else handleLoginClick("student");
                }}
              >
                {s.title === "Performance Reports"
                  ? "View Reports →"
                  : s.title === "Official Documents"
                    ? "Browse Documents →"
                    : "Get Started →"}
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section bg-white">
        <div className="max-w-lg mx-auto px-6">
          <div className="text-center mb-7">
            <Badge variant="teal">Try a Demo</Badge>
            <h2 className="heading-display text-2xl mt-3 mb-2">Submit a Complaint (Preview)</h2>
            <p className="text-gray-500 text-xs">See how the form works. Full functionality requires login.</p>
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
                  → This would be routed to the <strong>{categories[catForm]}</strong> ministry
                </p>
              )}
              <Button full variant="navy" onClick={preview} disabled={!catForm || !descForm.trim()}>
                Preview Routing
              </Button>
            </div>
          ) : (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3" aria-hidden>
                📋
              </div>
              <h3 className="font-display font-bold text-jucso-navy text-lg mb-2">Ready to file for real?</h3>
              <p className="text-gray-600 text-xs mb-5 leading-relaxed">
                Your complaint would route to <strong>{categories[catForm]}</strong>. Sign in to submit and receive a
                tracking ID, or track an existing complaint.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="navy" onClick={() => handleLoginClick("student")}>
                  Sign In to Submit
                </Button>
                <Button variant="outline" onClick={() => setPage("track")}>
                  Track Complaint
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
                Try another category
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
