import { apiRequest, setToken } from "./client";
import {
  mapAdminUser,
  mapComplaint,
  mapEvent,
  mapSuggestion,
  mapUser,
  type AdminUserRow,
} from "./mappers";
import type { Club, Complaint, Document, NewsItem, PortalType } from "@/types";

interface LoginResponse {
  access: string;
  refresh: string;
  user: Parameters<typeof mapUser>[0];
}

export interface ExecutiveStats {
  total_complaints: number;
  urgent: number;
  open_issues: number;
  resolved: number;
  ministry_stats: Array<{
    name: string;
    total: number;
    pending: number;
    resolved: number;
    rate: number;
  }>;
  urgent_issues: Complaint[];
}

export interface AdminOverview {
  total_users: number;
  total_complaints: number;
  total_suggestions: number;
  active_clubs: number;
  upcoming_events: number;
  open_complaints: number;
  pending_suggestions: number;
  registered_students: number;
}

export const jucsoApi = {
  async login(reg_number: string, password: string, portal: PortalType) {
    const res = await apiRequest<LoginResponse>("/api/auth/login/", {
      method: "POST",
      body: { reg_number, password, portal },
      auth: false,
    });
    setToken(res.access);
    return mapUser(res.user);
  },

  logout() {
    setToken(null);
  },

  async me() {
    const user = await apiRequest<Parameters<typeof mapUser>[0]>("/api/auth/me/");
    return mapUser(user);
  },

  async getComplaints() {
    const complaints = await apiRequest<Parameters<typeof mapComplaint>[0][]>("/api/complaints/");
    return complaints.map(mapComplaint);
  },

  async createComplaint(data: { category: string; description: string; urgent?: boolean }) {
    const complaint = await apiRequest<Parameters<typeof mapComplaint>[0]>("/api/complaints/", {
      method: "POST",
      body: data,
    });
    return mapComplaint(complaint);
  },

  async updateComplaint(trackingId: string, data: { status?: Complaint["status"]; response?: string }) {
    const complaint = await apiRequest<Parameters<typeof mapComplaint>[0]>(
      `/api/complaints/${trackingId}/`,
      { method: "PATCH", body: data },
    );
    return mapComplaint(complaint);
  },

  async getSuggestions() {
    const suggestions = await apiRequest<Parameters<typeof mapSuggestion>[0][]>("/api/suggestions/");
    return suggestions.map(mapSuggestion);
  },

  async createSuggestion(data: { title: string; description: string }) {
    const suggestion = await apiRequest<Parameters<typeof mapSuggestion>[0]>("/api/suggestions/", {
      method: "POST",
      body: data,
    });
    return mapSuggestion(suggestion);
  },

  getClubs() {
    return apiRequest<Club[]>("/api/clubs/", { auth: false });
  },

  toggleClubJoin(clubId: string) {
    const pk = parseInt(clubId.replace("CLB-", ""), 10);
    return apiRequest<Club>(`/api/clubs/${pk}/join/`, { method: "POST" });
  },

  async getEvents() {
    const events = await apiRequest<Parameters<typeof mapEvent>[0][]>("/api/events/", { auth: false });
    return events.map(mapEvent);
  },

  async toggleEventRegistration(eventId: string) {
    const pk = parseInt(eventId.replace("EVT-", ""), 10);
    const event = await apiRequest<Parameters<typeof mapEvent>[0]>(`/api/events/${pk}/register/`, {
      method: "POST",
    });
    return mapEvent(event);
  },

  getNews(tag?: string) {
    const query = tag && tag !== "All" ? `?tag=${encodeURIComponent(tag)}` : "";
    return apiRequest<NewsItem[]>(`/api/news/${query}`, { auth: false });
  },

  getDocuments() {
    return apiRequest<Document[]>("/api/documents/", { auth: false });
  },

  sendContact(data: { name: string; email: string; subject: string; message: string }) {
    return apiRequest<void>("/api/contact/", { method: "POST", body: data, auth: false });
  },

  async getExecutiveStats(): Promise<ExecutiveStats> {
    const stats = await apiRequest<{
      total_complaints: number;
      urgent: number;
      open_issues: number;
      resolved: number;
      ministry_stats: ExecutiveStats["ministry_stats"];
      urgent_issues: Parameters<typeof mapComplaint>[0][];
    }>("/api/stats/executive/");
    return {
      ...stats,
      urgent_issues: stats.urgent_issues.map(mapComplaint),
    };
  },

  getAdminOverview() {
    return apiRequest<AdminOverview>("/api/admin/overview/");
  },

  async getAdminUsers() {
    const users = await apiRequest<Parameters<typeof mapAdminUser>[0][]>("/api/admin/users/");
    return users.map(mapAdminUser);
  },
};

export type { AdminUserRow };
