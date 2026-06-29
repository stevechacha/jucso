import type { Complaint, Suggestion, User } from "@/types";

export interface ApiUser {
  reg_number: string;
  name: string;
  role: User["role"];
  ministry?: string;
  email?: string;
  phone_number?: string;
  is_active?: boolean;
  must_change_password?: boolean;
  email_verified?: boolean;
}

export interface ApiComplaintActivity {
  action: string;
  detail: string;
  actor_name: string;
  timestamp: string;
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
  is_confidential?: boolean;
  supporting_document_url?: string;
  due_at?: string;
  is_overdue?: boolean;
  is_escalated?: boolean;
  activity?: ApiComplaintActivity[];
  satisfaction_rating?: number | null;
  satisfaction_comment?: string;
  can_rate?: boolean;
}

export interface ApiSuggestion {
  id: string;
  title: string;
  description: string;
  student_name: string;
  date: string;
  status: Suggestion["status"];
  response?: string;
  due_at?: string;
  is_overdue?: boolean;
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
  is_waitlisted?: boolean;
  waitlist_position?: number | null;
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
  escalated?: number;
  ministry_stats: Array<{
    name: string;
    total: number;
    pending: number;
    resolved: number;
    rate: number;
  }>;
  urgent_issues: ApiComplaint[];
  escalated_issues?: ApiComplaint[];
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

export interface AdminSystemStatusResponse {
  api: string;
  database: string;
  email_configured: boolean;
  sms_configured: boolean;
  storage_configured: boolean;
  debug: boolean;
  ssl_enabled: boolean;
  registry_configured?: boolean;
  overdue_complaints?: number;
  overdue_suggestions?: number;
  open_complaints?: number;
  pending_suggestions?: number;
  cron_runs?: Array<{
    job_name: string;
    ran_at: string;
    detail: string;
    success: boolean;
  }>;
}

export interface TransparencyStatsResponse {
  total_complaints: number;
  resolved_complaints: number;
  open_complaints: number;
  resolution_rate: number;
  ministry_stats: Array<{
    name: string;
    total: number;
    pending: number;
    resolved: number;
    rate: number;
  }>;
  total_suggestions: number;
  implemented_suggestions: number;
  pending_suggestions: number;
  suggestion_review_rate: number;
  rated_complaints: number;
  satisfaction_avg: number | null;
}

export interface PublicStatsResponse {
  students_registered: number;
  ministries: number;
  resolution_rate: number;
  active_clubs: number;
  upcoming_events: number;
  total_suggestions: number;
  implemented_suggestions: number;
}

export interface MinisterWorkloadResponse {
  open_count: number;
  resolved_this_week: number;
  overdue_count: number;
  urgent_open: number;
  pending: number;
  in_progress: number;
}

export interface AttendeeListResponse {
  name: string;
  count: number;
  attendees: Array<{
    reg_number: string;
    name: string;
    email: string;
    date: string;
  }>;
}

export interface ComplaintCategoryOption {
  category: string;
  ministry: string;
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
