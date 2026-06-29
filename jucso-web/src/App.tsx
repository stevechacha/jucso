import { useCallback, useEffect, useState } from "react";
import { PUBLIC_PAGES } from "@/constants/mock-data";
import { apiBaseUrl, isApiEnabled, setUnauthorizedHandler } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { AppProvider, useApp } from "@/context/AppContext";
import { LanguageProvider } from "@/context/LanguageContext";
import type { PortalAnnouncement, PortalType } from "@/types";
import { LoginModal } from "@/components/auth/LoginModal";
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { RegisterModal } from "@/components/auth/RegisterModal";
import { ForcePasswordChangeScreen } from "@/components/auth/ForcePasswordChangeScreen";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { ApiStatusBanner } from "@/components/layout/ApiStatusBanner";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { Navbar } from "@/components/layout/Navbar";
import { AdminDashboard } from "@/dashboards/AdminDashboard";
import { ExecutiveDashboard } from "@/dashboards/ExecutiveDashboard";
import { MinisterDashboard } from "@/dashboards/MinisterDashboard";
import { StudentDashboard } from "@/dashboards/StudentDashboard";
import { useAuthSession } from "@/hooks/useAuthSession";
import { usePageNavigation } from "@/hooks/usePageNavigation";
import { usePortalData } from "@/hooks/usePortalData";
import { getNewsIdFromPath } from "@/lib/routing";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { DocumentsPage } from "@/pages/DocumentsPage";
import { HomePage } from "@/pages/HomePage";
import { NewsPage } from "@/pages/NewsPage";
import { NewsDetailPage } from "@/pages/NewsDetailPage";
import { ServicesPage } from "@/pages/ServicesPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { TrackComplaintPage } from "@/pages/TrackComplaintPage";
import { TransparencyReportsPage } from "@/pages/TransparencyReportsPage";
import { ClubsPage } from "@/pages/ClubsPage";
import { VerifyEmailPage } from "@/pages/VerifyEmailPage";
import { EventsPage } from "@/pages/EventsPage";

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
    if (!user || user.mustChangePassword) return;
    if ((PUBLIC_PAGES as readonly string[]).includes(page)) {
      setPage("dashboard");
    }
  }, [user, page, setPage]);

  if (user?.mustChangePassword) {
    return <ForcePasswordChangeScreen />;
  }

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
    case "news": {
      const newsId = getNewsIdFromPath();
      return newsId ? <NewsDetailPage newsId={newsId} /> : <NewsPage />;
    }
    case "documents":
      return <DocumentsPage />;
    case "contact":
      return <ContactPage />;
    case "track":
      return <TrackComplaintPage />;
    case "reports":
      return <TransparencyReportsPage />;
    case "clubs":
      return <ClubsPage />;
    case "events":
      return <EventsPage />;
    case "reset-password":
      return <ResetPasswordPage />;
    case "verify-email":
      return <VerifyEmailPage />;
    default:
      return <HomePage />;
  }
}

export default function App() {
  const [page, goToPage] = usePageNavigation();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loginPortal, setLoginPortal] = useState<PortalType>("student");
  const [announcement, setAnnouncement] = useState<PortalAnnouncement | null>(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

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

  const { user, sessionLoading, login: authLogin, logout: authLogout, setUser } = useAuthSession({
    onNavigate: goToPage,
    onUnauthorized: handleUnauthorized,
  });

  useEffect(() => {
    void refreshPortalData(user);
  }, [user, refreshPortalData]);

  useEffect(() => {
    if (!isApiEnabled) return;
    void jucsoApi
      .getActiveAnnouncement()
      .then((item) => {
        setAnnouncement(item);
        setAnnouncementDismissed(false);
      })
      .catch(() => setAnnouncement(null));
  }, [user]);

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
    setShowForgotPassword(false);
    setShowLogin(true);
  };

  const openRegister = () => {
    setShowLogin(false);
    setShowForgotPassword(false);
    setShowRegister(true);
  };

  const openForgotPassword = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowForgotPassword(true);
  };

  const handleLoginClick = (portal: PortalType = "student") => {
    if (user) goToPage("dashboard");
    else openLogin(portal);
  };

  return (
    <LanguageProvider>
      <AppProvider
      value={{
        page,
        setPage: goToPage,
        user,
        setUser,
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
        {announcement && !announcementDismissed && (
          <AnnouncementBanner announcement={announcement} onDismiss={() => setAnnouncementDismissed(true)} />
        )}
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
            onForgotPassword={openForgotPassword}
          />
        )}
        {showForgotPassword && (
          <ForgotPasswordModal
            onClose={() => setShowForgotPassword(false)}
            onBackToLogin={() => openLogin("student")}
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
    </LanguageProvider>
  );
}
