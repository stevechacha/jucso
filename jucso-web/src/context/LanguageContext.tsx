import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Locale = "en" | "sw";

const translations = {
  en: {
    studentPortal: "Student Portal",
    staffPortal: "Staff Portal",
    trackComplaint: "Track Complaint",
    transparency: "Transparency Reports",
    studentsRegistered: "Students Registered",
    activeMinistries: "Active Ministries",
    complaintResolution: "Complaint Resolution",
    activeClubs: "Active Clubs",
    ideasImplemented: "Ideas Implemented",
    language: "English",
  },
  sw: {
    studentPortal: "Lango la Wanafunzi",
    staffPortal: "Lango la Wafanyakazi",
    trackComplaint: "Fuatilia Malalamiko",
    transparency: "Ripoti za Uwazi",
    studentsRegistered: "Wanafunzi Waliosajiliwa",
    activeMinistries: "Wizara Zinazofanya Kazi",
    complaintResolution: "Utatuzi wa Malalamiko",
    activeClubs: "Vilabu Hai",
    ideasImplemented: "Mawazo Yaliyotekelezwa",
    language: "Kiswahili",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem("jucso-locale");
    return saved === "sw" ? "sw" : "en";
  });

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: (next) => {
        localStorage.setItem("jucso-locale", next);
        setLocale(next);
      },
      t: (key) => translations[locale][key],
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
