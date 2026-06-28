import { useState } from "react";
import { PORTAL_ROLE_LABELS, PUBLIC_PAGES } from "@/constants/mock-data";
import { useApp } from "@/context/AppContext";
import { useLanguage } from "@/context/LanguageContext";
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

function UserMenu({ onSignOut }: { onSignOut: () => void }) {
  const { user } = useApp();
  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:block text-right mr-1">
        <div className="text-white text-xs font-semibold leading-tight">{user.name}</div>
        <div className="text-white/40 text-[10px]">{user.reg}</div>
      </div>
      <div
        className="w-8 h-8 rounded-full bg-jucso-teal flex items-center justify-center text-white text-xs font-black"
        title={user.name}
        aria-label={`Signed in as ${user.name}`}
      >
        {user.name.charAt(0)}
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="bg-white/10 border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
      >
        Sign Out
      </button>
    </div>
  );
}

function PublicNavbar({
  page,
  navigate,
  mobileOpen,
  setMobileOpen,
  onStudentPortal,
  onStaffPortal,
}: {
  page: PageId;
  navigate: (target: PageId) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onStudentPortal: () => void;
  onStaffPortal: () => void;
}) {
  return (
    <>
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
        <div className="flex items-center gap-2 ml-3">
          <Button variant="gold" size="sm" onClick={onStudentPortal}>
            Student Portal
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onStaffPortal}
            className="!text-white !border-white/30 hover:!bg-white/10"
          >
            Staff Portal
          </Button>
        </div>
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

      {mobileOpen && (
        <div className="md:hidden absolute left-0 right-0 top-14 bg-jucso-navy-dark border-t border-white/10 px-4 pb-4 shadow-lg">
          {PUBLIC_PAGES.map((p) => (
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
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="gold" size="sm" full onClick={onStudentPortal}>
              Student Portal
            </Button>
            <Button
              variant="outline"
              size="sm"
              full
              onClick={onStaffPortal}
              className="!text-white !border-white/30 hover:!bg-white/10"
            >
              Staff Portal
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function PortalNavbar({
  page,
  navigate,
  mobileOpen,
  setMobileOpen,
  onSignOut,
}: {
  page: PageId;
  navigate: (target: PageId) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onSignOut: () => void;
}) {
  const { user } = useApp();
  if (!user) return null;

  const portalLabel = PORTAL_ROLE_LABELS[user.role];
  const onDashboard = page === "dashboard";

  return (
    <>
      <div className="hidden md:flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-wide text-jucso-teal/80 border border-jucso-teal/30 rounded-full px-2.5 py-1">
          {portalLabel}
        </span>
        {!onDashboard && (
          <button
            type="button"
            onClick={() => navigate("dashboard")}
            className="px-3 py-1.5 rounded-md text-xs font-semibold text-white/60 hover:text-white transition-all cursor-pointer"
          >
            Dashboard
          </button>
        )}
        <div className={`${onDashboard ? "" : "ml-2 pl-3 border-l border-white/10"}`}>
          <UserMenu onSignOut={onSignOut} />
        </div>
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

      {mobileOpen && (
        <div className="md:hidden absolute left-0 right-0 top-14 bg-jucso-navy-dark border-t border-white/10 px-4 pb-4 shadow-lg">
          <div className="py-2 text-[10px] font-bold uppercase tracking-wide text-jucso-teal">{portalLabel}</div>
          {!onDashboard && (
            <button
              type="button"
              onClick={() => navigate("dashboard")}
              className="block w-full text-left py-2.5 text-sm font-semibold border-b border-white/5 cursor-pointer text-white/60"
            >
              Dashboard
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onSignOut();
              setMobileOpen(false);
            }}
            className="mt-3 block w-full text-left text-sm text-white/50 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      )}
    </>
  );
}

function LanguageToggle() {
  const { locale, setLocale } = useLanguage();
  const next = locale === "en" ? "sw" : "en";
  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      className="text-[10px] font-bold uppercase tracking-wide text-white/70 border border-white/20 rounded-full px-2.5 py-1 hover:text-white hover:border-white/40 cursor-pointer"
      aria-label={`Switch language to ${next === "en" ? "English" : "Kiswahili"}`}
    >
      {locale === "en" ? "SW" : "EN"}
    </button>
  );
}

export function Navbar() {
  const { page, setPage, user, handleLoginClick, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (target: PageId) => {
    setPage(target);
    setMobileOpen(false);
  };

  const openStudentPortal = () => {
    handleLoginClick("student");
    setMobileOpen(false);
  };

  const openStaffPortal = () => {
    handleLoginClick("staff");
    setMobileOpen(false);
  };

  const signOut = () => {
    logout();
    setMobileOpen(false);
  };

  return (
    <nav className="bg-jucso-navy-dark sticky top-0 z-40 shadow-lg backdrop-blur-sm relative" aria-label="Main">
      <div className="flex items-center justify-between px-4 h-14 max-w-7xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(user ? "dashboard" : "home")}
          className="flex items-center gap-2.5 cursor-pointer group"
          aria-label={user ? "JUCSO portal home" : "JUCSO home"}
        >
          <BrandMark />
          <div className="text-left">
            <div className="text-white font-display font-bold text-sm tracking-normal group-hover:text-jucso-teal transition-colors">
              JUCSO
            </div>
            <div className="text-jucso-teal text-[9px] font-semibold tracking-wide uppercase">
              {user ? PORTAL_ROLE_LABELS[user.role] : "Jordan University College"}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          {user ? (
          <PortalNavbar
            page={page}
            navigate={navigate}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            onSignOut={signOut}
          />
          ) : (
          <PublicNavbar
            page={page}
            navigate={navigate}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            onStudentPortal={openStudentPortal}
            onStaffPortal={openStaffPortal}
          />
          )}
        </div>
      </div>
    </nav>
  );
}
