import { useState } from "react";
import { ApiError, isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/FormFields";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";

const CONTACT_VALUES = [
  { icon: "📍", key: "contactAddress" as const, val: "Jordan University College, Morogoro, Tanzania" },
  { icon: "✉️", key: "contactEmailLabel" as const, val: "info@jucso.ac.tz" },
  { icon: "📞", key: "contactPhone" as const, val: "+255 800 000 000" },
  { icon: "🕐", key: "contactOfficeHours" as const, val: "Mon – Fri, 8:00 AM – 5:00 PM" },
] as const;

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY_FORM: ContactForm = { name: "", email: "", subject: "", message: "" };

export function ContactPage() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const send = async () => {
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);
    setErr("");
    try {
      if (isApiEnabled) {
        await jucsoApi.sendContact(form);
      }
      setSent(true);
    } catch (error) {
      setErr(error instanceof ApiError ? error.message : t("contactSendFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Hero badge={t("contactBadge")} title={t("contactTitle")} subtitle={t("contactSubtitle")} />

      <section className="page-section bg-jucso-slate">
        <div className="section-container grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="heading-display text-xl mb-6">{t("contactReachUs")}</h3>
            <ul className="space-y-5">
              {CONTACT_VALUES.map((c) => (
                <li key={c.key} className="flex gap-3 items-start">
                  <div
                    className="w-10 h-10 rounded-xl bg-white shadow-card flex items-center justify-center text-lg shrink-0"
                    aria-hidden
                  >
                    {c.icon}
                  </div>
                  <div>
                    <div className="text-jucso-teal text-[10px] font-bold uppercase tracking-widest">{t(c.key)}</div>
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
                <h3 className="heading-display text-xl mb-5">{t("contactSendMessage")}</h3>
                <Input
                  label={t("contactFullName")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t("contactPlaceholderName")}
                  required
                />
                <Input
                  label={t("contactEmailLabel")}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t("contactPlaceholderEmail")}
                  required
                />
                <Input
                  label={t("contactSubject")}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={t("contactPlaceholderSubject")}
                />
                <Textarea
                  label={t("contactMessage")}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  placeholder={t("contactPlaceholderMessage")}
                  required
                />
                {err && <p className="text-xs text-red-600 mb-3">{err}</p>}
                <Button
                  type="submit"
                  full
                  variant="navy"
                  disabled={!form.name || !form.email || !form.message || loading}
                >
                  {loading ? t("contactSending") : t("contactSend")}
                </Button>
              </form>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
                <div className="text-4xl mb-3" aria-hidden>
                  ✉️
                </div>
                <h3 className="font-display font-bold text-emerald-800 text-lg mb-2">{t("contactSentTitle")}</h3>
                <p className="text-emerald-700 text-xs mb-5">{t("contactSentBody")}</p>
                <Button
                  variant="navy"
                  onClick={() => {
                    setSent(false);
                    setForm(EMPTY_FORM);
                    setErr("");
                  }}
                >
                  {t("contactSendAnother")}
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
