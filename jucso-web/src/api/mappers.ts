import type { Complaint, Event, Suggestion, User } from "@/types";
import type { ApiComplaint, ApiEvent, ApiSuggestion, ApiUser } from "./types";

export function mapUser(user: ApiUser): User {
  return {
    name: user.name,
    reg: user.reg_number,
    role: user.role,
    ministry: user.ministry,
    email: user.email,
    phone: user.phone_number,
    mustChangePassword: user.must_change_password ?? false,
    emailVerified: user.email_verified ?? true,
  };
}

function mapActivity(activity: import("./types").ApiComplaintActivity) {
  return {
    action: activity.action,
    detail: activity.detail,
    actorName: activity.actor_name,
    timestamp: activity.timestamp,
  };
}

export function mapComplaint(complaint: ApiComplaint): Complaint {
  const { student_name, student_reg, supporting_document_url, is_confidential, due_at, is_overdue, activity, ...rest } =
    complaint;
  return {
    ...rest,
    studentName: student_name,
    studentReg: student_reg,
    supportingDocumentUrl: supporting_document_url,
    isConfidential: is_confidential ?? false,
    dueAt: due_at,
    isOverdue: is_overdue ?? false,
    activity: activity?.map(mapActivity),
  };
}

export function mapSuggestion(suggestion: ApiSuggestion): Suggestion {
  const { student_name, ...rest } = suggestion;
  return { ...rest, studentName: student_name };
}

export function mapEvent(event: ApiEvent): Event {
  return {
    ...event,
    isRegistered: event.is_registered ?? false,
  };
}

export interface AdminUserRow extends User {
  email?: string;
  isActive: boolean;
}

export function mapAdminUser(user: ApiUser): AdminUserRow {
  return {
    ...mapUser(user),
    email: user.email,
    isActive: user.is_active ?? true,
  };
}
