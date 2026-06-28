import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";
import { TrackComplaintPanel } from "@/components/complaints/TrackComplaintPanel";

export function TrackComplaintPage() {
  return (
    <div>
      <Hero
        badge="Track Complaint"
        title="Check your complaint status"
        subtitle="Enter your tracking ID and registration number to see ministry, status, and any official response."
      />

      <section className="page-section bg-jucso-slate">
        <div className="max-w-lg mx-auto px-6">
          <div className="bg-white rounded-xl shadow-card p-6">
            <TrackComplaintPanel />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
