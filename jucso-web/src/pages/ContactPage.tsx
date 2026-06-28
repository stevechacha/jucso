import { useState } from "react";
import { jucsoApi } from "@/api/jucsoApi";
import { isApiEnabled } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/FormFields";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";

const CONTACT_INFO = [
  { icon: "📍", label: "Address", val: "Jordan University College, Morogoro, Tanzania" },
  { icon: "✉️", label: "Email", val: "info@jucso.ac.tz" },
  { icon: "📞", label: "Phone", val: "+255 800 000 000" },
  { icon: "🕐", label: "Office Hours", val: "Mon – Fri, 8:00 AM – 5:00 PM" },
] as const;

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY_FORM: ContactForm = { name: "", email: "", subject: "", message: "" };

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);

  const send = async () => {
    if (!form.name || !form.email || !form.message) return;
    if (isApiEnabled) {
      await jucsoApi.sendContact(form);
    }
    setSent(true);
  };

  return (
    <div>
      <Hero
        badge="Get in Touch"
        title="Contact JUCSO"
        subtitle="For general inquiries and partnership proposals. Student complaints go through the portal."
      />

      <section className="page-section bg-jucso-slate">
        <div className="section-container grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="heading-display text-xl mb-6">Reach Us Directly</h3>
            <ul className="space-y-5">
              {CONTACT_INFO.map((c) => (
                <li key={c.label} className="flex gap-3 items-start">
                  <div
                    className="w-10 h-10 rounded-xl bg-white shadow-card flex items-center justify-center text-lg shrink-0"
                    aria-hidden
                  >
                    {c.icon}
                  </div>
                  <div>
                    <div className="text-jucso-teal text-[10px] font-bold uppercase tracking-widest">{c.label}</div>
                    <div className="text-[#1A1A2E] text-sm mt-0.5">{c.val}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {!sent ? (
              <form
                className="bg-white rounded-xl p-7 shadow-card"
                onSubmit={(e) => {
                  e.preventDefault();
                  void send();
                }}
              >
                <h3 className="heading-display text-xl mb-5">Send a Message</h3>
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
                <Input
                  label="Subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="What is this about?"
                />
                <Textarea
                  label="Message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  placeholder="Your message here..."
                  required
                />
                <Button type="submit" full variant="navy" disabled={!form.name || !form.email || !form.message}>
                  Send Message
                </Button>
              </form>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
                <div className="text-4xl mb-3" aria-hidden>
                  ✉️
                </div>
                <h3 className="font-display font-extrabold text-emerald-800 text-lg mb-2">Message Sent!</h3>
                <p className="text-emerald-700 text-xs mb-5">We&apos;ll get back to you within 2 working days.</p>
                <Button
                  variant="navy"
                  onClick={() => {
                    setSent(false);
                    setForm(EMPTY_FORM);
                  }}
                >
                  Send Another
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
