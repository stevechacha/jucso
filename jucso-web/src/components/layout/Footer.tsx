import { useApp } from "@/context/AppContext";
import type { PageId } from "@/types";

const FOOTER_LINKS = [
  { head: "Navigate", links: ["home", "about", "services", "news"] as PageId[] },
  { head: "Resources", links: ["documents", "contact"] as PageId[] },
  { head: "Connect", links: ["dashboard"] as PageId[] },
];

export function Footer() {
  const { setPage, handleLoginClick } = useApp();

  return (
    <footer className="bg-jucso-navy-dark px-6 pt-12 pb-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-2 md:col-span-1">
          <div className="text-white font-display font-extrabold text-xl mb-2">JUCSO</div>
          <p className="text-white/40 text-xs leading-relaxed max-w-[200px]">
            Jordan University College Student Organization — Leading People to Excellence.
          </p>
        </div>

        {FOOTER_LINKS.map((col) => (
          <div key={col.head}>
            <div className="text-jucso-teal text-[10px] font-bold uppercase tracking-widest mb-3">
              {col.head}
            </div>
            {col.links.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setPage(l);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="block text-white/45 text-xs mb-2 hover:text-white/80 capitalize transition-colors cursor-pointer text-left"
              >
                {l}
              </button>
            ))}
            {col.head === "Connect" && (
              <button
                type="button"
                onClick={handleLoginClick}
                className="block text-white/45 text-xs mb-2 hover:text-white/80 transition-colors cursor-pointer text-left"
              >
                Student Login
              </button>
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
