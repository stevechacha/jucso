import type { Complaint, Suggestion, User } from "@/types";

export interface ApiUser {
  reg_number: string;
  name: string;
  role: User["role"];
  ministry?: string;
  email?: string;
  is_active?: boolean;
  must_change_password?: boolean;
}

export interface ApiComplaint {
  id: string;
  category: string;
  description: string;
  ministry: string;
  status: Complaint["status"];
  date: string;
  student_name: string;
  student_reg: string;
  response?: string;
  urgent?: boolean;
  supporting_document_url?: string;
}

export interface ApiSuggestion {
  id: string;
  title: string;
  description: string;
  student_name: string;
  date: string;
  status: Suggestion["status"];
}

export interface ApiEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: number;
  registered: number;
  description: string;
  is_registered?: boolean;
}

export interface ApiDocument {
  id: string;
  name: string;
  size: string;
  type: string;
  date: string;
  download_url?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: ApiUser;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ExecutiveStatsResponse {
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
  urgent_issues: ApiComplaint[];
}

export interface AdminOverviewResponse {
  total_users: number;
  total_complaints: number;
  total_suggestions: number;
  active_clubs: number;
  upcoming_events: number;
  open_complaints: number;
  pending_suggestions: number;
  registered_students: number;
}

export interface MinistryOption {
  id: number;
  name: string;
  slug: string;
}

export interface ApiErrorPayload {
  detail?: string | string[] | Record<string, unknown>;
  errors?: Record<string, unknown>;
}
