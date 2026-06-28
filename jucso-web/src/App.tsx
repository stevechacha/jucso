import { useCallback, useEffect, useState } from "react";
import { PUBLIC_PAGES } from "@/constants/mock-data";
import { apiBaseUrl, isApiEnabled, setUnauthorizedHandler } from "@/api/client";
import { AppProvider, useApp } from "@/context/AppContext";
import type { PortalType } from "@/types";
import { LoginModal } from "@/components/auth/LoginModal";
import { RegisterModal } from "@/components/auth/RegisterModal";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ApiStatusBanner } from "@/components/layout/ApiStatusBanner";
import { Navbar } from "@/components/layout/Navbar";
import { AdminDashboard } from "@/dashboards/AdminDashboard";
import { ExecutiveDashboard } from "@/dashboards/ExecutiveDashboard";
import { MinisterDashboard } from "@/dashboards/MinisterDashboard";
import { StudentDashboard } from "@/dashboards/StudentDashboard";
import { useAuthSession } from "@/hooks/useAuthSession";
import { usePageNavigation } from "@/hooks/usePageNavigation";
import { usePortalData } from "@/hooks/usePortalData";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { DocumentsPage } from "@/pages/DocumentsPage";
import { HomePage } from "@/pages/HomePage";
import { NewsPage } from "@/pages/NewsPage";
import { ServicesPage } from "@/pages/ServicesPage";

function DashboardRouter() {
  const { user } = useApp();
  if (!user) return null;

  switch (user.role) {
    case "student":
      return <StudentDashboard />;
    case "minister":
      return <MinisterDashboard />;
    case "executive":
      return <ExecutiveDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return null;
  }
}

function PageRouter() {
  const { page, user, openLogin, setPage } = useApp();

  useEffect(() => {
    if (!user) return;
    if ((PUBLIC_PAGES as readonly string[]).includes(page)) {
      setPage("dashboard");
    }
  }, [user, page, setPage]);

  if (page === "dashboard") {
    if (!user) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center bg-jucso-slate px-6">
          <div className="max-w-sm text-center">
            <h1 className="font-display font-bold text-xl text-jucso-navy mb-2">Sign in required</h1>
            <p className="text-sm text-gray-500 mb-4">Open the Student or Staff portal to access your dashboard.</p>
            <button
              type="button"
              onClick={() => openLogin("student")}
              className="text-sm font-semibold text-jucso-teal hover:underline cursor-pointer"
            >
              Go to sign in →
            </button>
          </div>
        </div>
      );
    }
    return <DashboardRouter />;
  }

  switch (page) {
    case "home":
      return <HomePage />;
    case "about":
      return <AboutPage />;
    case "services":
      return <ServicesPage />;
    case "news":
      return <NewsPage />;
    case "documents":
      return <DocumentsPage />;
    case "contact":
      return <ContactPage />;
    default:
      return <HomePage />;
  }
}

export default function App() {
  const [page, goToPage] = usePageNavigation();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginPortal, setLoginPortal] = useState<PortalType>("student");

  const {
    dataLoading,
    dataError,
    complaints,
    setComplaints,
    suggestions,
    setSuggestions,
    clubs,
    setClubs,
    events,
    setEvents,
    news,
    documents,
    refreshPortalData,
    resetPrivateData,
  } = usePortalData();

  const handleUnauthorized = useCallback(() => {
    goToPage("home");
    resetPrivateData();
    if (isApiEnabled) void refreshPortalData(null);
  }, [goToPage, resetPrivateData, refreshPortalData]);

  const { user, sessionLoading, login: authLogin, logout: authLogout } = useAuthSession({
    onNavigate: goToPage,
    onUnauthorized: handleUnauthorized,
  });

  useEffect(() => {
    void refreshPortalData(user);
  }, [user, refreshPortalData]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      authLogout();
    });
    return () => setUnauthorizedHandler(null);
  }, [authLogout]);

  const login = (nextUser: Parameters<typeof authLogin>[0]) => {
    authLogin(nextUser);
    setShowLogin(false);
    setShowRegister(false);
    void refreshPortalData(nextUser);
  };

  const logout = () => {
    authLogout();
  };

  const openLogin = (portal: PortalType = "student") => {
    setLoginPortal(portal);
    setShowRegister(false);
    setShowLogin(true);
  };

  const openRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleLoginClick = (portal: PortalType = "student") => {
    if (user) goToPage("dashboard");
    else openLogin(portal);
  };

  return (
    <AppProvider
      value={{
        page,
        setPage: goToPage,
        user,
        sessionLoading,
        login,
        logout,
        showLogin,
        loginPortal,
        openLogin,
        closeLogin: () => setShowLogin(false),
        handleLoginClick,
        apiEnabled: isApiEnabled,
        apiBaseUrl,
        dataLoading,
        dataError,
        refreshPortalData: () => refreshPortalData(user),
        complaints,
        setComplaints,
        suggestions,
        setSuggestions,
        clubs,
        setClubs,
        events,
        setEvents,
        news,
        documents,
      }}
    >
      <div className="min-h-screen bg-jucso-slate">
        <ApiStatusBanner />
        <Navbar />
        <AuthGuard>
          <PageRouter />
        </AuthGuard>
        {showLogin && (
          <LoginModal
            key={loginPortal}
            portal={loginPortal}
            onLogin={login}
            onClose={() => setShowLogin(false)}
            onRegister={openRegister}
          />
        )}
        {showRegister && (
          <RegisterModal
            onRegistered={login}
            onClose={() => setShowRegister(false)}
            onBackToLogin={() => openLogin("student")}
          />
        )}
      </div>
    </AppProvider>
  );
}
