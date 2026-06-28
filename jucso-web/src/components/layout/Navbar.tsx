import { useState } from "react";
import { PUBLIC_PAGES } from "@/constants/mock-data";
import { useApp } from "@/context/AppContext";
import type { PageId } from "@/types";
import { Button } from "@/components/ui/Button";

function BrandMark() {
  return (
    <div
      className="w-9 h-9 rounded-full bg-gradient-to-br from-jucso-teal to-jucso-navy flex items-center justify-center text-white font-black text-xs border border-cyan-400/40 shrink-0"
      aria-hidden
    >
      JU
    </div>
  );
}

export function Navbar() {
  const { page, setPage, user, handleLoginClick, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (target: PageId) => {
    setPage(target);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="bg-jucso-navy-dark sticky top-0 z-40 shadow-lg backdrop-blur-sm" aria-label="Main">
      <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="flex items-center gap-2.5 cursor-pointer group"
          aria-label="JUCSO home"
        >
          <BrandMark />
          <div className="text-left">
            <div className="text-white font-display font-bold text-sm tracking-normal group-hover:text-jucso-teal transition-colors">
              JUCSO
            </div>
            <div className="text-jucso-teal text-[9px] font-semibold tracking-wide uppercase">
              Jordan University College
            </div>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-0.5">
          {PUBLIC_PAGES.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => navigate(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all cursor-pointer ${
                page === p
                  ? "text-jucso-teal border-b-2 border-jucso-teal rounded-none"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}

          {user ? (
            <div className="flex items-center gap-2 ml-3">
              <button
                type="button"
                onClick={() => navigate("dashboard")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  page === "dashboard" ? "text-jucso-teal" : "text-white/60 hover:text-white"
                }`}
              >
                Dashboard
              </button>
              <div
                className="w-8 h-8 rounded-full bg-jucso-teal flex items-center justify-center text-white text-xs font-black"
                title={user.name}
                aria-label={`Signed in as ${user.name}`}
              >
                {user.name.charAt(0)}
              </div>
              <button
                type="button"
                onClick={logout}
                className="bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Button variant="gold" size="sm" onClick={handleLoginClick} className="ml-3">
              Student Login
            </Button>
          )}
        </div>

        <button
          type="button"
          className="md:hidden text-white text-xl cursor-pointer p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-jucso-navy-dark border-t border-white/10 px-4 pb-4">
          {[...PUBLIC_PAGES, ...(user ? (["dashboard"] as const) : [])].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => navigate(p)}
              className={`block w-full text-left py-2.5 text-sm font-semibold capitalize border-b border-white/5 cursor-pointer ${
                page === p ? "text-jucso-teal" : "text-white/60"
              }`}
            >
              {p}
            </button>
          ))}
          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              className="mt-3 block w-full text-left text-sm text-white/50 cursor-pointer"
            >
              Sign Out
            </button>
          ) : (
            <Button
              variant="gold"
              size="sm"
              full
              onClick={() => {
                handleLoginClick();
                setMobileOpen(false);
              }}
              className="mt-3"
            >
              Student Login
            </Button>
          )}
        </div>
      )}
    </nav>
  );
}
