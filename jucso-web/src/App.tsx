import { useCallback, useEffect, useState } from "react";
import {
  CLUBS,
  DOCS,
  EVENTS,
  INITIAL_COMPLAINTS,
  INITIAL_SUGGESTIONS,
  NEWS,
} from "@/constants/mock-data";
import { apiBaseUrl, isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { AppProvider, useApp } from "@/context/AppContext";
import type { Document, NewsItem, PageId, PortalType, User } from "@/types";
import { LoginModal } from "@/components/auth/LoginModal";
import { ApiStatusBanner } from "@/components/layout/ApiStatusBanner";
import { Navbar } from "@/components/layout/Navbar";
import { AdminDashboard } from "@/dashboards/AdminDashboard";
import { ExecutiveDashboard } from "@/dashboards/ExecutiveDashboard";
import { MinisterDashboard } from "@/dashboards/MinisterDashboard";
import { StudentDashboard } from "@/dashboards/StudentDashboard";
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
  const { page, user } = useApp();

  if (page === "dashboard") {
    if (!user) return <HomePage />;
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
  const [page, setPage] = useState<PageId>("home");
  const [user, setUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginPortal, setLoginPortal] = useState<PortalType>("student");
  const [dataLoading, setDataLoading] = useState(isApiEnabled);
  const [dataError, setDataError] = useState<string | null>(null);
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [clubs, setClubs] = useState(CLUBS);
  const [events, setEvents] = useState(EVENTS);
  const [news, setNews] = useState<NewsItem[]>(NEWS);
  const [documents, setDocuments] = useState<Document[]>(DOCS);

  const refreshPortalData = useCallback(async (activeUser: User | null = user) => {
    if (!isApiEnabled) return;

    setDataLoading(true);
    setDataError(null);

    try {
      const [newsData, clubsData, eventsData, docsData] = await Promise.all([
        jucsoApi.getNews(),
        jucsoApi.getClubs(),
        jucsoApi.getEvents(),
        jucsoApi.getDocuments(),
      ]);
      setNews(newsData);
      setClubs(clubsData);
      setEvents(eventsData);
      setDocuments(docsData);

      if (activeUser) {
        const [complaintsData, suggestionsData] = await Promise.all([
          jucsoApi.getComplaints(),
          jucsoApi.getSuggestions(),
        ]);
        setComplaints(complaintsData);
        setSuggestions(suggestionsData);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load portal data";
      setDataError(message);
      console.error("Failed to sync portal data:", error);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refreshPortalData(user);
  }, [refreshPortalData, user]);

  useEffect(() => {
    if (!isApiEnabled) return;
    void jucsoApi
      .me()
      .then((sessionUser) => {
        setUser(sessionUser);
      })
      .catch(() => setUser(null));
  }, []);

  const login = (u: User) => {
    setUser(u);
    setShowLogin(false);
    setPage("dashboard");
    void refreshPortalData(u);
  };

  const logout = () => {
    jucsoApi.logout();
    setUser(null);
    setPage("home");
    setComplaints(INITIAL_COMPLAINTS);
    setSuggestions(INITIAL_SUGGESTIONS);
    setClubs(CLUBS);
    setEvents(EVENTS);
    if (!isApiEnabled) {
      setNews(NEWS);
      setDocuments(DOCS);
    } else {
      void refreshPortalData(null);
    }
  };

  const openLogin = (portal: PortalType = "student") => {
    setLoginPortal(portal);
    setShowLogin(true);
  };

  const handleLoginClick = (portal: PortalType = "student") => {
    if (user) setPage("dashboard");
    else openLogin(portal);
  };

  return (
    <AppProvider
      value={{
        page,
        setPage,
        user,
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
        <PageRouter />
        {showLogin && (
          <LoginModal
            key={loginPortal}
            portal={loginPortal}
            onLogin={login}
            onClose={() => setShowLogin(false)}
          />
        )}
      </div>
    </AppProvider>
  );
}
