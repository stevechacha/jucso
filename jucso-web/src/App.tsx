import { useCallback, useEffect, useState } from "react";
import {
  CLUBS,
  DOCS,
  EVENTS,
  INITIAL_COMPLAINTS,
  INITIAL_SUGGESTIONS,
  NEWS,
} from "@/constants/mock-data";
import { isApiEnabled } from "@/api/client";
import { jucsoApi } from "@/api/jucsoApi";
import { AppProvider, useApp } from "@/context/AppContext";
import type { Document, NewsItem, PageId, PortalType, User } from "@/types";
import { LoginModal } from "@/components/auth/LoginModal";
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
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [clubs, setClubs] = useState(CLUBS);
  const [events, setEvents] = useState(EVENTS);
  const [news, setNews] = useState<NewsItem[]>(NEWS);
  const [documents, setDocuments] = useState<Document[]>(DOCS);

  const refreshPortalData = useCallback(async () => {
    if (!isApiEnabled) return;

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

      if (user) {
        const [complaintsData, suggestionsData] = await Promise.all([
          jucsoApi.getComplaints(),
          jucsoApi.getSuggestions(),
        ]);
        setComplaints(complaintsData);
        setSuggestions(suggestionsData);
      }
    } catch (error) {
      console.error("Failed to sync portal data:", error);
    }
  }, [user]);

  useEffect(() => {
    void refreshPortalData();
  }, [refreshPortalData]);

  useEffect(() => {
    if (!isApiEnabled) return;
    void jucsoApi.me().then(setUser).catch(() => setUser(null));
  }, []);

  const login = (u: User) => {
    setUser(u);
    setShowLogin(false);
    setPage("dashboard");
    void refreshPortalData();
  };

  const logout = () => {
    jucsoApi.logout();
    setUser(null);
    setPage("home");
    setComplaints(INITIAL_COMPLAINTS);
    setSuggestions(INITIAL_SUGGESTIONS);
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
        refreshPortalData,
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
