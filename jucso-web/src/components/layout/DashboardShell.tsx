import type { ReactNode } from "react";

interface DashboardShellProps {
  label: string;
  title: string;
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: ReactNode;
}

export function DashboardShell({
  label,
  title,
  tabs,
  activeTab,
  onTabChange,
  children,
}: DashboardShellProps) {
  return (
    <div>
      <header className="bg-gradient-to-r from-jucso-navy-dark to-jucso-navy px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <p className="text-jucso-teal text-[10px] font-bold uppercase tracking-widest">{label}</p>
          <h1 className="text-white font-display font-extrabold text-xl mt-1 mb-4">{title}</h1>
          <div className="flex gap-1 flex-wrap" role="tablist">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={activeTab === t}
                onClick={() => onTabChange(t)}
                className={`px-4 py-2 rounded-t-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  activeTab === t
                    ? "bg-jucso-slate text-jucso-navy"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="bg-jucso-slate min-h-screen px-6 py-6">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
