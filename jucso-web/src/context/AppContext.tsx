import { createContext, useContext, type ReactNode } from "react";
import type { Club, Complaint, Document, Event, NewsItem, PageId, PortalType, Suggestion, User } from "@/types";

interface AppContextValue {
  page: PageId;
  setPage: (page: PageId) => void;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  showLogin: boolean;
  loginPortal: PortalType;
  openLogin: (portal?: PortalType) => void;
  closeLogin: () => void;
  handleLoginClick: (portal?: PortalType) => void;
  apiEnabled: boolean;
  refreshPortalData: () => Promise<void>;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  suggestions: Suggestion[];
  setSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>;
  clubs: Club[];
  setClubs: React.Dispatch<React.SetStateAction<Club[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  news: NewsItem[];
  documents: Document[];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  value,
  children,
}: {
  value: AppContextValue;
  children: ReactNode;
}) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
