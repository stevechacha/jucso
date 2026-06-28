import { apiRequest, getToken, setToken, ApiError } from "@/api/client";
import { mapAdminUser, mapComplaint, mapEvent, mapSuggestion, mapUser } from "@/api/mappers";
import type {
  AdminOverviewResponse,
  ApiComplaint,
  ApiDocument,
  ApiEvent,
  ApiSuggestion,
  ApiUser,
  ExecutiveStatsResponse,
  LoginResponse,
  MinistryOption,
} from "@/api/types";
import type { Club, Complaint, NewsItem, PortalType } from "@/types";

export interface ExecutiveStats {
  total_complaints: number;
  urgent: number;
  open_issues: number;
  resolved: number;
  ministry_stats: ExecutiveStatsResponse["ministry_stats"];
  urgent_issues: Complaint[];
}

export type AdminOverview = AdminOverviewResponse;
export type { AdminUserRow } from "@/api/mappers";

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

  async registerStudent(data: {
    reg_number: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone_number?: string;
  }) {
    const res = await apiRequest<LoginResponse>("/api/auth/register/", {
      method: "POST",
      body: data,
      auth: false,
    });
    setToken(res.access);
    return mapUser(res.user);
  },

  logout() {
    setToken(null);
  },

  getMinistries() {
    return apiRequest<MinistryOption[]>("/api/admin/ministries/");
  },

  async createStaff(data: {
    reg_number: string;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: "minister" | "executive";
    ministry?: string;
    phone_number?: string;
  }) {
    const user = await apiRequest<ApiUser>("/api/admin/staff/", {
      method: "POST",
      body: data,
    });
    return mapAdminUser(user);
  },

  me() {
    if (!getToken()) {
      return Promise.reject(new ApiError("Not authenticated", 401));
    }
    return apiRequest<ApiUser>("/api/auth/me/").then(mapUser);
  },

  async getComplaints() {
    const complaints = await apiRequest<ApiComplaint[]>("/api/complaints/");
    return complaints.map(mapComplaint);
  },

  async createComplaint(data: { category: string; description: string; urgent?: boolean }) {
    const complaint = await apiRequest<ApiComplaint>("/api/complaints/", {
      method: "POST",
      body: data,
    });
    return mapComplaint(complaint);
  },

  async updateComplaint(trackingId: string, data: { status?: Complaint["status"]; response?: string }) {
    const complaint = await apiRequest<ApiComplaint>(`/api/complaints/${trackingId}/`, {
      method: "PATCH",
      body: data,
    });
    return mapComplaint(complaint);
  },

  async getSuggestions() {
    const suggestions = await apiRequest<ApiSuggestion[]>("/api/suggestions/");
    return suggestions.map(mapSuggestion);
  },

  async createSuggestion(data: { title: string; description: string }) {
    const suggestion = await apiRequest<ApiSuggestion>("/api/suggestions/", {
      method: "POST",
      body: data,
    });
    return mapSuggestion(suggestion);
  },

  getClubs() {
    return apiRequest<Club[]>("/api/clubs/", { auth: Boolean(getToken()) });
  },

  toggleClubJoin(clubId: string) {
    const pk = parseInt(clubId.replace("CLB-", ""), 10);
    return apiRequest<Club>(`/api/clubs/${pk}/join/`, { method: "POST" });
  },

  async getEvents() {
    const events = await apiRequest<ApiEvent[]>("/api/events/", { auth: Boolean(getToken()) });
    return events.map(mapEvent);
  },

  async toggleEventRegistration(eventId: string) {
    const pk = parseInt(eventId.replace("EVT-", ""), 10);
    const event = await apiRequest<ApiEvent>(`/api/events/${pk}/register/`, {
      method: "POST",
    });
    return mapEvent(event);
  },

  getNews(tag?: string) {
    const query = tag && tag !== "All" ? `?tag=${encodeURIComponent(tag)}` : "";
    return apiRequest<NewsItem[]>(`/api/news/${query}`, { auth: false });
  },

  async getDocuments() {
    const docs = await apiRequest<ApiDocument[]>("/api/documents/", { auth: false });
    return docs.map((doc) => ({
      id: doc.id,
      name: doc.name,
      size: doc.size,
      type: doc.type,
      date: doc.date,
      downloadUrl: doc.download_url,
    }));
  },

  sendContact(data: { name: string; email: string; subject: string; message: string }) {
    return apiRequest<void>("/api/contact/", { method: "POST", body: data, auth: false });
  },

  async getExecutiveStats(): Promise<ExecutiveStats> {
    const stats = await apiRequest<ExecutiveStatsResponse>("/api/stats/executive/");
    return {
      ...stats,
      urgent_issues: stats.urgent_issues.map(mapComplaint),
    };
  },

  getAdminOverview() {
    return apiRequest<AdminOverviewResponse>("/api/admin/overview/");
  },

  async getAdminUsers() {
    const users = await apiRequest<ApiUser[]>("/api/admin/users/");
    return users.map(mapAdminUser);
  },
};
