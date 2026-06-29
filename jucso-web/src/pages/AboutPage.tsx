import { useEffect, useState } from "react";
import { MINISTERS } from "@/constants/mock-data";
import { jucsoApi } from "@/api/jucsoApi";
import { isApiEnabled } from "@/api/client";
import type { LeadershipMember } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";
import { useLanguage } from "@/context/LanguageContext";

const FALLBACK_LEADERS: LeadershipMember[] = [
  { initials: "NS", name: "Dr. Neema Salim", role: "President", ministry: "" },
  { initials: "MT", name: "Marcus Tarimo", role: "Vice President", ministry: "" },
  ...MINISTERS.map((m) => ({ name: m.name, role: m.role, ministry: "", initials: m.initials })),
];

const ROLE_COLORS: Record<string, string> = {
  Executive: "#F5A623",
  President: "#F5A623",
  "Vice President": "#F5A623",
};

function roleColor(role: string) {
  if (role in ROLE_COLORS) return ROLE_COLORS[role];
  if (role.includes("Minister")) return "#00B4C6";
  return "#1B2B6B";
}

export function AboutPage() {
  const { t } = useLanguage();
  const [leaders, setLeaders] = useState<LeadershipMember[]>(FALLBACK_LEADERS);

  const pillars = [
    { word: t("aboutPillarProgress"), color: "#00B4C6", desc: t("aboutPillarProgressDesc") },
    { word: t("aboutPillarAccountability"), color: "#F5A623", desc: t("aboutPillarAccountabilityDesc") },
    { word: t("aboutPillarLeadership"), color: "#1B2B6B", desc: t("aboutPillarLeadershipDesc") },
  ];

  const mandateKeys = [
    "aboutMandate1",
    "aboutMandate2",
    "aboutMandate3",
    "aboutMandate4",
    "aboutMandate5",
    "aboutMandate6",
  ] as const;

  useEffect(() => {
    if (!isApiEnabled) return;
    void jucsoApi
      .getLeadership()
      .then((data) => {
        if (data.length > 0) setLeaders(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <Hero badge={t("aboutBadge")} title={t("aboutTitle")} subtitle={t("aboutSubtitle")} />

      <section className="page-section bg-white">
        <div className="section-container max-w-4xl">
          <div className="text-center mb-10">
            <Badge variant="navy">{t("aboutPillarsBadge")}</Badge>
            <h2 className="heading-display text-2xl md:text-3xl mt-3">{t("aboutPillarsTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <article
                key={p.word}
                className="rounded-xl p-7 bg-jucso-slate"
                style={{ borderTop: `5px solid ${p.color}` }}
              >
                <h3 className="font-display font-bold text-2xl mb-3" style={{ color: p.color }}>
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
            <Badge variant="navy">{t("aboutMandateBadge")}</Badge>
            <h3 className="heading-display text-xl mt-3 mb-5">{t("aboutMandateTitle")}</h3>
            <ul className="space-y-3">
              {mandateKeys.map((key) => (
                <li key={key} className="flex gap-3 items-start">
                  <span
                    className="w-5 h-5 rounded-full bg-jucso-teal flex items-center justify-center shrink-0 mt-0.5 text-white text-[10px] font-black"
                    aria-hidden
                  >
                    ✓
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed">{t(key)}</p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Badge variant="teal">{t("aboutDigitalBadge")}</Badge>
            <h3 className="heading-display text-xl mt-3 mb-4">{t("aboutDigitalTitle")}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{t("aboutDigitalP1")}</p>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">{t("aboutDigitalP2")}</p>
            <div className="bg-jucso-navy rounded-xl p-5 flex gap-5 items-center justify-center">
              {[
                ["12", t("aboutDigitalWeeks"), "#00B4C6"],
                ["4", t("aboutDigitalRoles"), "#F5A623"],
                ["6", t("aboutDigitalMinistries"), "#fff"],
              ].map(([val, lab, color], i) => (
                <div key={String(lab)} className="flex items-center gap-5">
                  {i > 0 && <div className="w-px h-10 bg-white/15" aria-hidden />}
                  <div className="text-center">
                    <div className="font-display font-bold text-xl" style={{ color }}>
                      {val}
                    </div>
                    <div className="text-white/50 text-[10px] uppercase tracking-wide">{lab}</div>
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
            <Badge variant="navy">{t("aboutLeadershipBadge")}</Badge>
            <h2 className="heading-display text-2xl md:text-3xl mt-3">{t("aboutLeadershipTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaders.map((p) => {
              const color = roleColor(p.role);
              return (
                <article
                  key={`${p.initials}-${p.name}`}
                  className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-card transition-shadow"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0"
                    style={{ background: `linear-gradient(135deg,${color},#1B2B6B)` }}
                    aria-hidden
                  >
                    {p.initials}
                  </div>
                  <div>
                    <div className="font-bold text-jucso-navy text-sm">{p.name}</div>
                    <div className="text-xs mt-0.5" style={{ color }}>
                      {p.role}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
