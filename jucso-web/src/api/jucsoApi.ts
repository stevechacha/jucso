import { apiRequest, clearAuthTokens, getToken, setRefreshToken, setToken, ApiError, apiBaseUrl } from "@/api/client";
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
import type { Club, Complaint, NewsDetail, NewsItem, PortalAnnouncement, PortalNotification, PortalType } from "@/types";

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
    setRefreshToken(res.refresh);
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
    setRefreshToken(res.refresh);
    return mapUser(res.user);
  },

  logout() {
    clearAuthTokens();
  },

  requestPasswordReset(data: { email?: string; reg_number?: string }) {
    return apiRequest<{ detail: string }>("/api/auth/password-reset/", {
      method: "POST",
      body: data,
      auth: false,
    }).then((res) => res.detail);
  },

  async confirmPasswordReset(data: { uid: string; token: string; password: string }) {
    const res = await apiRequest<{ detail: string }>("/api/auth/password-reset/confirm/", {
      method: "POST",
      body: data,
      auth: false,
    });
    return res.detail;
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

  async updateProfile(data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone_number?: string;
  }) {
    const user = await apiRequest<ApiUser>("/api/auth/me/", { method: "PATCH", body: data });
    return mapUser(user);
  },

  async trackComplaint(tracking_id: string, reg_number: string) {
    const complaint = await apiRequest<{
      id: string;
      category: string;
      ministry: string;
      status: Complaint["status"];
      date: string;
      response?: string;
      due_at?: string;
      is_overdue?: boolean;
      activity?: import("@/api/types").ApiComplaintActivity[];
    }>("/api/complaints/track/", {
      method: "POST",
      body: { tracking_id, reg_number },
      auth: false,
    });
    return {
      id: complaint.id,
      category: complaint.category,
      ministry: complaint.ministry,
      status: complaint.status,
      date: complaint.date,
      response: complaint.response,
      dueAt: complaint.due_at,
      isOverdue: complaint.is_overdue,
      activity: complaint.activity?.map((a) => ({
        action: a.action,
        detail: a.detail,
        actorName: a.actor_name,
        timestamp: a.timestamp,
      })),
    };
  },

  getTransparencyStats() {
    return apiRequest<import("@/api/types").TransparencyStatsResponse>("/api/stats/transparency/", {
      auth: false,
    });
  },

  getPublicStats() {
    return apiRequest<import("@/api/types").PublicStatsResponse>("/api/stats/public/", { auth: false });
  },

  getComplaintCategories() {
    return apiRequest<import("@/api/types").ComplaintCategoryOption[]>("/api/complaints/categories/", {
      auth: false,
    });
  },

  getLeadership() {
    return apiRequest<import("@/types").LeadershipMember[]>("/api/leadership/", { auth: false });
  },

  async changePassword(data: { current_password: string; new_password: string }) {
    const res = await apiRequest<{ detail: string; user: ApiUser }>("/api/auth/change-password/", {
      method: "POST",
      body: data,
    });
    return { message: res.detail, user: mapUser(res.user) };
  },

  async updateComplaint(id: string, data: { status?: string; response?: string; ministry?: string }) {
    const complaint = await apiRequest<ApiComplaint>(`/api/complaints/${encodeURIComponent(id)}/`, {
      method: "PATCH",
      body: data,
    });
    return mapComplaint(complaint);
  },

  async updateSuggestion(pk: number, data: { status: string; response?: string }) {
    const suggestion = await apiRequest<ApiSuggestion>(`/api/suggestions/${pk}/`, {
      method: "PATCH",
      body: data,
    });
    return mapSuggestion(suggestion);
  },

  async setUserActive(regNumber: string, isActive: boolean) {
    const user = await apiRequest<ApiUser>(`/api/admin/users/${encodeURIComponent(regNumber)}/`, {
      method: "PATCH",
      body: { is_active: isActive },
    });
    return mapAdminUser(user);
  },

  async updateAdminUser(
    regNumber: string,
    data: {
      is_active?: boolean;
      role?: "student" | "minister" | "executive" | "admin";
      ministry?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
    },
  ) {
    const user = await apiRequest<ApiUser>(`/api/admin/users/${encodeURIComponent(regNumber)}/`, {
      method: "PATCH",
      body: data,
    });
    return mapAdminUser(user);
  },

  verifyEmail(uid: string, token: string) {
    return apiRequest<{ detail: string; user: ApiUser }>("/api/auth/verify-email/", {
      method: "POST",
      body: { uid, token },
      auth: false,
    });
  },

  resendVerification(data: { email?: string; reg_number?: string }) {
    return apiRequest<{ detail: string }>("/api/auth/resend-verification/", {
      method: "POST",
      body: data,
      auth: false,
    }).then((res) => res.detail);
  },

  getMinisterWorkload() {
    return apiRequest<import("@/api/types").MinisterWorkloadResponse>("/api/stats/minister-workload/");
  },

  async getComplaints() {
    const complaints = await apiRequest<ApiComplaint[]>("/api/complaints/");
    return complaints.map(mapComplaint);
  },

  async createComplaint(data: {
    category: string;
    description: string;
    urgent?: boolean;
    supportingDocument?: File;
  }) {
    const form = new FormData();
    form.append("category", data.category);
    form.append("description", data.description);
    form.append("urgent", String(Boolean(data.urgent)));
    if (data.supportingDocument) {
      form.append("supporting_document", data.supportingDocument);
    }
    const complaint = await apiRequest<ApiComplaint>("/api/complaints/", {
      method: "POST",
      body: form,
      isFormData: true,
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

  getNewsDetail(newsId: string) {
    return apiRequest<NewsDetail>(`/api/news/${encodeURIComponent(newsId)}/`, { auth: false });
  },

  getActiveAnnouncement() {
    return apiRequest<PortalAnnouncement | null>("/api/announcement/", { auth: false });
  },

  getNotifications() {
    return apiRequest<{ unread_count: number; results: PortalNotification[] }>("/api/notifications/");
  },

  markNotificationsRead(ids?: number[]) {
    return apiRequest<{ marked: number; unread_count: number }>("/api/notifications/mark-read/", {
      method: "POST",
      body: ids ? { ids } : {},
    });
  },

  eventsCalendarUrl() {
    return `${apiBaseUrl}/api/events/calendar.ics`;
  },

  getAnnouncements() {
    return apiRequest<PortalAnnouncement[]>("/api/admin/announcements/");
  },

  createAnnouncement(data: {
    message: string;
    link_label?: string;
    link_url?: string;
    priority?: PortalAnnouncement["priority"];
    expires_at?: string;
  }) {
    return apiRequest<PortalAnnouncement>("/api/admin/announcements/", { method: "POST", body: data });
  },

  updateAnnouncement(
    id: number,
    data: Partial<{
      message: string;
      link_label: string;
      link_url: string;
      priority: PortalAnnouncement["priority"];
      is_active: boolean;
      expires_at: string | null;
    }>,
  ) {
    return apiRequest<PortalAnnouncement>(`/api/admin/announcements/${id}/`, { method: "PATCH", body: data });
  },

  deactivateAnnouncement(id: number) {
    return apiRequest<void>(`/api/admin/announcements/${id}/`, { method: "DELETE" });
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

  async uploadDocument(data: { name: string; file: File; file_type?: string }) {
    const form = new FormData();
    form.append("name", data.name);
    form.append("file", data.file);
    if (data.file_type) form.append("file_type", data.file_type);
    const doc = await apiRequest<ApiDocument>("/api/admin/documents/", {
      method: "POST",
      body: form,
      isFormData: true,
    });
    return {
      id: doc.id,
      name: doc.name,
      size: doc.size,
      type: doc.type,
      date: doc.date,
      downloadUrl: doc.download_url,
    };
  },

  async createNews(data: { title: string; excerpt: string; body?: string; tag: string; published_at?: string }) {
    return apiRequest<NewsItem>("/api/admin/news/", { method: "POST", body: data });
  },

  deleteNews(newsId: string) {
    const pk = parseInt(newsId.replace(/^N/i, ""), 10);
    return apiRequest<void>(`/api/admin/news/${pk}/`, { method: "DELETE" });
  },

  updateNews(
    newsId: string,
    data: { title?: string; excerpt?: string; body?: string; tag?: string; is_published?: boolean },
  ) {
    const pk = parseInt(newsId.replace(/^N/i, ""), 10);
    return apiRequest<NewsItem>(`/api/admin/news/${pk}/`, { method: "PATCH", body: data });
  },

  async downloadPortalBackup() {
    const data = await apiRequest<Record<string, unknown>>("/api/admin/backup/", { method: "POST" });
    return data;
  },

  deleteDocument(documentId: string) {
    const pk = parseInt(documentId.replace(/^DOC-/i, ""), 10);
    return apiRequest<void>(`/api/admin/documents/${pk}/`, { method: "DELETE" });
  },

  async updateDocument(documentId: string, data: { name?: string }) {
    const pk = parseInt(documentId.replace(/^DOC-/i, ""), 10);
    const doc = await apiRequest<import("@/api/types").ApiDocument>(`/api/admin/documents/${pk}/`, {
      method: "PATCH",
      body: data,
    });
    return {
      id: doc.id,
      name: doc.name,
      size: doc.size,
      type: doc.type,
      date: doc.date,
      downloadUrl: doc.download_url,
    };
  },

  async getContactMessages() {
    const response = await apiRequest<
      | Array<{
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          date: string;
          is_read: boolean;
        }>
      | {
          results: Array<{
            id: string;
            name: string;
            email: string;
            subject: string;
            message: string;
            date: string;
            is_read: boolean;
          }>;
        }
    >("/api/admin/contact-messages/");
    return Array.isArray(response) ? response : response.results;
  },

  markContactMessageRead(messageId: string, isRead = true) {
    const pk = parseInt(messageId.replace(/^MSG-/i, ""), 10);
    return apiRequest<{ id: string; is_read: boolean }>(`/api/admin/contact-messages/${pk}/`, {
      method: "PATCH",
      body: { is_read: isRead },
    });
  },

  async createClub(data: { name: string; description: string; leader: string; category: string }) {
    return apiRequest<Club>("/api/admin/clubs/", { method: "POST", body: data });
  },

  deleteClub(clubId: string) {
    const pk = parseInt(clubId.replace(/^CLB-/i, ""), 10);
    return apiRequest<void>(`/api/admin/clubs/${pk}/`, { method: "DELETE" });
  },

  updateClub(
    clubId: string,
    data: { name?: string; description?: string; leader?: string; category?: string },
  ) {
    const pk = parseInt(clubId.replace(/^CLB-/i, ""), 10);
    return apiRequest<Club>(`/api/admin/clubs/${pk}/`, { method: "PATCH", body: data });
  },

  async createEvent(data: {
    title: string;
    description: string;
    location: string;
    event_date: string;
    capacity: number;
  }) {
    const event = await apiRequest<ApiEvent>("/api/admin/events/", { method: "POST", body: data });
    return mapEvent(event);
  },

  deleteEvent(eventId: string) {
    const pk = parseInt(eventId.replace(/^EVT-/i, ""), 10);
    return apiRequest<void>(`/api/admin/events/${pk}/`, { method: "DELETE" });
  },

  async updateEvent(
    eventId: string,
    data: {
      title?: string;
      description?: string;
      location?: string;
      event_date?: string;
      capacity?: number;
    },
  ) {
    const pk = parseInt(eventId.replace(/^EVT-/i, ""), 10);
    const event = await apiRequest<ApiEvent>(`/api/admin/events/${pk}/`, { method: "PATCH", body: data });
    return mapEvent(event);
  },

  getSystemStatus() {
    return apiRequest<import("@/api/types").AdminSystemStatusResponse>("/api/admin/system-status/");
  },
};
