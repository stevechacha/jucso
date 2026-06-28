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
      <header className="bg-gradient-to-r from-jucso-navy-dark to-jucso-navy px-6 pt-5 pb-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-jucso-teal text-[10px] font-bold uppercase tracking-wide">{label}</p>
          <h1 className="text-white font-display font-bold text-xl mt-1">{title}</h1>
        </div>
      </header>

      <div
        className="sticky top-14 z-30 bg-gradient-to-r from-jucso-navy-dark to-jucso-navy shadow-md border-b border-white/10"
        role="presentation"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div
            className="flex gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Dashboard sections"
          >
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={activeTab === t}
                onClick={() => onTabChange(t)}
                className={`shrink-0 px-4 py-2.5 rounded-t-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  activeTab === t
                    ? "bg-jucso-slate text-jucso-navy shadow-sm"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="bg-jucso-slate min-h-[calc(100vh-14rem)] px-6 py-6">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
