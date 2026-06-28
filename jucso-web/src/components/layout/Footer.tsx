import { useApp } from "@/context/AppContext";
import type { PageId } from "@/types";

const FOOTER_COLUMNS: Array<{
  head: string;
  links: Array<{ page: PageId; label: string }>;
}> = [
  {
    head: "Navigate",
    links: [
      { page: "home", label: "Home" },
      { page: "about", label: "About" },
      { page: "services", label: "Services" },
      { page: "news", label: "News" },
    ],
  },
  {
    head: "Resources",
    links: [
      { page: "documents", label: "Documents" },
      { page: "clubs", label: "Clubs" },
      { page: "events", label: "Events" },
      { page: "track", label: "Track Complaint" },
      { page: "reports", label: "Transparency Reports" },
      { page: "contact", label: "Contact" },
    ],
  },
  {
    head: "Connect",
    links: [{ page: "dashboard", label: "Dashboard" }],
  },
];

export function Footer() {
  const { setPage, handleLoginClick } = useApp();

  return (
    <footer className="bg-jucso-navy-dark px-6 pt-12 pb-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-2 md:col-span-1">
          <div className="text-white font-display font-bold text-xl mb-2">JUCSO</div>
          <p className="text-white/40 text-xs leading-relaxed max-w-[200px]">
            Jordan University College Student Organization — Leading People to Excellence.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.head}>
            <div className="text-jucso-teal text-[10px] font-bold uppercase tracking-wide mb-3">
              {col.head}
            </div>
            {col.links.map((link) => (
              <button
                key={link.page + link.label}
                type="button"
                onClick={() => {
                  setPage(link.page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="block text-white/45 text-xs mb-2 hover:text-white/80 transition-colors cursor-pointer text-left"
              >
                {link.label}
              </button>
            ))}
            {col.head === "Connect" && (
              <>
                <button
                  type="button"
                  onClick={() => handleLoginClick("student")}
                  className="block text-white/45 text-xs mb-2 hover:text-white/80 transition-colors cursor-pointer text-left"
                >
                  Student Portal
                </button>
                <button
                  type="button"
                  onClick={() => handleLoginClick("staff")}
                  className="block text-white/45 text-xs mb-2 hover:text-white/80 transition-colors cursor-pointer text-left"
                >
                  Staff Portal
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-4 text-center text-[11px] text-white/25">
        © 2026 JUCSO — Jordan University College Student Organization, Morogoro, Tanzania
      </div>
    </footer>
  );
}
