import type { Complaint, Event, Suggestion, User } from "@/types";

type ApiUser = {
  reg_number: string;
  name: string;
  role: User["role"];
  ministry?: string;
};

type ApiComplaint = Omit<Complaint, "studentName" | "studentReg"> & {
  student_name: string;
  student_reg: string;
};

type ApiSuggestion = Omit<Suggestion, "studentName"> & {
  student_name: string;
};

type ApiEvent = Omit<Event, "isRegistered"> & {
  is_registered?: boolean;
};

export function mapUser(user: ApiUser): User {
  return {
    name: user.name,
    reg: user.reg_number,
    role: user.role,
    ministry: user.ministry,
  };
}

export function mapComplaint(complaint: ApiComplaint): Complaint {
  const { student_name, student_reg, ...rest } = complaint;
  return { ...rest, studentName: student_name, studentReg: student_reg };
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

export function mapAdminUser(user: ApiUser & { email?: string; is_active?: boolean }): AdminUserRow {
  return {
    ...mapUser(user),
    email: user.email,
    isActive: user.is_active ?? true,
  };
}
